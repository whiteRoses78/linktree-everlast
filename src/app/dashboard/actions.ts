"use server";

import { revalidatePath } from "next/cache";
import { getServerClient } from "@/lib/supabase/server";
import { ProfileUpdateSchema } from "@/lib/profile/schemas";
import { LinkInputSchema } from "@/lib/links/schemas";

export type UpdateProfileState =
  | { status: "idle"; ts: 0 }
  | { status: "success"; ts: number }
  | {
      status: "error";
      ts: number;
      message: string;
      fieldErrors?: Record<string, string>;
    };

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData,
): Promise<UpdateProfileState> {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      ts: Date.now(),
      message: "Sitzung abgelaufen. Bitte erneut anmelden.",
    };
  }

  const raw = {
    display_name: String(formData.get("display_name") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    avatar_url: String(formData.get("avatar_url") ?? ""),
    accent_color: String(formData.get("accent_color") ?? ""),
  };

  const parsed = ProfileUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      status: "error",
      ts: Date.now(),
      message: "Bitte korrigiere die markierten Felder.",
      fieldErrors,
    };
  }

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio,
      avatar_url: parsed.data.avatar_url,
      accent_color: parsed.data.accent_color,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("username")
    .single();

  if (error || !updated) {
    return {
      status: "error",
      ts: Date.now(),
      message: "Speichern fehlgeschlagen. Bitte erneut versuchen.",
    };
  }

  revalidatePath(`/u/${updated.username}`);
  revalidatePath("/dashboard");

  return { status: "success", ts: Date.now() };
}

// ────────────────────────────────────────────────────────────────────────────
// Links — Create / Update / Delete
// ────────────────────────────────────────────────────────────────────────────

export type LinkActionState =
  | { status: "idle"; ts: 0 }
  | { status: "success"; ts: number }
  | {
      status: "error";
      ts: number;
      message: string;
      fieldErrors?: Record<string, string>;
    };

async function requireLinkContext() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, error: "Sitzung abgelaufen. Bitte erneut anmelden." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { ok: false as const, error: "Profil nicht gefunden." };
  }

  return { ok: true as const, supabase, userId: user.id, username: profile.username };
}

function fieldErrorsFromZod(
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export async function createLink(
  _prev: LinkActionState,
  formData: FormData,
): Promise<LinkActionState> {
  const ctx = await requireLinkContext();
  if (!ctx.ok) {
    return { status: "error", ts: Date.now(), message: ctx.error };
  }

  const parsed = LinkInputSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    url: String(formData.get("url") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      ts: Date.now(),
      message: "Bitte korrigiere die markierten Felder.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  // Position = max(position) + 1. Race im MVP akzeptabel — kein UNIQUE
  // auf (user_id, position). Spec 08 (dnd-kit) baut Reordering ohnehin aus.
  const { data: top } = await ctx.supabase
    .from("links")
    .select("position")
    .eq("user_id", ctx.userId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (top?.position ?? -1) + 1;

  const { error } = await ctx.supabase.from("links").insert({
    user_id: ctx.userId,
    title: parsed.data.title,
    url: parsed.data.url,
    position: nextPosition,
  });

  if (error) {
    return {
      status: "error",
      ts: Date.now(),
      message: "Link konnte nicht angelegt werden.",
    };
  }

  revalidatePath(`/u/${ctx.username}`);
  revalidatePath("/dashboard");

  return { status: "success", ts: Date.now() };
}

export async function updateLink(
  linkId: string,
  _prev: LinkActionState,
  formData: FormData,
): Promise<LinkActionState> {
  const ctx = await requireLinkContext();
  if (!ctx.ok) {
    return { status: "error", ts: Date.now(), message: ctx.error };
  }

  const parsed = LinkInputSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    url: String(formData.get("url") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      ts: Date.now(),
      message: "Bitte korrigiere die markierten Felder.",
      fieldErrors: fieldErrorsFromZod(parsed.error.issues),
    };
  }

  // RLS-Policy `links_owner_all` filtert via auth.uid() = user_id —
  // fremde linkId-Versuche kommen mit count: 0 zurück.
  const { data: updated, error } = await ctx.supabase
    .from("links")
    .update({ title: parsed.data.title, url: parsed.data.url })
    .eq("id", linkId)
    .eq("user_id", ctx.userId)
    .select("id")
    .maybeSingle();

  if (error || !updated) {
    return {
      status: "error",
      ts: Date.now(),
      message: "Link konnte nicht aktualisiert werden.",
    };
  }

  revalidatePath(`/u/${ctx.username}`);
  revalidatePath("/dashboard");

  return { status: "success", ts: Date.now() };
}

export type ReorderLinksResult =
  | { status: "success" }
  | { status: "error"; message: string };

/**
 * Schreibt die neue Reihenfolge der Links für den angemeldeten User.
 * `orderedIds[i]` bekommt `position = i`. Doppelter Schutz:
 *   1. RLS-Policy `links_owner_all` (auth.uid() = user_id)
 *   2. expliziter `.eq("user_id", ctx.userId)`-Filter
 * Fremde IDs werden geräuschlos ignoriert (Update trifft 0 Rows) —
 * wir entdecken das und melden Fehler an den Client.
 */
export async function reorderLinks(
  orderedIds: string[],
): Promise<ReorderLinksResult> {
  const ctx = await requireLinkContext();
  if (!ctx.ok) {
    return { status: "error", message: ctx.error };
  }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { status: "error", message: "Keine IDs übergeben." };
  }
  if (orderedIds.length > 200) {
    return { status: "error", message: "Zu viele Links auf einmal." };
  }
  if (orderedIds.some((id) => typeof id !== "string" || id.length === 0)) {
    return { status: "error", message: "Ungültige ID im Reorder-Payload." };
  }
  if (new Set(orderedIds).size !== orderedIds.length) {
    return { status: "error", message: "Duplikat-IDs im Reorder-Payload." };
  }

  const results = await Promise.all(
    orderedIds.map((id, position) =>
      ctx.supabase
        .from("links")
        .update({ position })
        .eq("id", id)
        .eq("user_id", ctx.userId)
        .select("id")
        .maybeSingle(),
    ),
  );

  const allOk = results.every((r) => r.data && !r.error);
  if (!allOk) {
    return {
      status: "error",
      message: "Reihenfolge konnte nicht gespeichert werden.",
    };
  }

  revalidatePath(`/u/${ctx.username}`);
  revalidatePath("/dashboard");

  return { status: "success" };
}

export async function deleteLink(
  linkId: string,
  _prev: LinkActionState,
  _formData: FormData,
): Promise<LinkActionState> {
  const ctx = await requireLinkContext();
  if (!ctx.ok) {
    return { status: "error", ts: Date.now(), message: ctx.error };
  }

  const { error, count } = await ctx.supabase
    .from("links")
    .delete({ count: "exact" })
    .eq("id", linkId)
    .eq("user_id", ctx.userId);

  if (error || count === 0) {
    return {
      status: "error",
      ts: Date.now(),
      message: "Link konnte nicht gelöscht werden.",
    };
  }

  revalidatePath(`/u/${ctx.username}`);
  revalidatePath("/dashboard");

  return { status: "success", ts: Date.now() };
}
