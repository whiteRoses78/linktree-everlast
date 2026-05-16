"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { isReserved } from "@/lib/auth/reserved-usernames";
import { SignInSchema, SignUpSchema } from "@/lib/auth/schemas";

export type ActionState =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

/**
 * Erlaubt nur interne Pfade als `next`-Redirect — verhindert Open-Redirect.
 * Akzeptiert "/foo", lehnt "//evil.com", "http://evil.com", "javascript:..." ab.
 */
function safeNextPath(next: string | null): string {
  if (!next) return "/dashboard";
  if (!next.startsWith("/")) return "/dashboard";
  if (next.startsWith("//")) return "/dashboard";
  return next;
}

export async function signUp(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
    username: String(formData.get("username") ?? ""),
  };

  const parsed = SignUpSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Bitte korrigiere die markierten Felder.", fieldErrors };
  }

  const { email, password, username } = parsed.data;

  if (isReserved(username)) {
    return {
      status: "error",
      message: "Dieser Username ist nicht erlaubt.",
      fieldErrors: { username: "Dieser Username ist reserviert." },
    };
  }

  const supabase = await getServerClient();

  // Pre-Check auf Uniqueness — schneller Fehler vor signUp(). Race-Condition
  // wird durch DB-UNIQUE-Constraint final abgefangen.
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existing) {
    return {
      status: "error",
      message: "Username ist bereits vergeben.",
      fieldErrors: { username: "Dieser Username ist bereits vergeben." },
    };
  }

  // emailRedirectTo dynamisch aus Request-Headers — funktioniert lokal,
  // in Vercel Production UND in Preview-Deployments ohne Env-Var.
  const h = await headers();
  const host = h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const emailRedirectTo = host ? `${proto}://${host}/dashboard` : undefined;

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Username + Defaults landen in raw_user_meta_data und werden vom
      // DB-Trigger on_auth_user_created in public.profiles übernommen.
      data: { username },
      emailRedirectTo,
    },
  });

  if (signUpError) {
    // UNIQUE-Violation aus dem Trigger kommt hier als Auth-Error rein
    // (Postgres 23505 wird von supabase-js durchgereicht).
    const msg = signUpError.message.toLowerCase();
    const isUniqueViolation =
      msg.includes("duplicate") ||
      msg.includes("unique") ||
      msg.includes("profiles_username_key");

    return {
      status: "error",
      message: isUniqueViolation
        ? "Username ist bereits vergeben."
        : signUpError.message,
      fieldErrors: isUniqueViolation
        ? { username: "Dieser Username ist bereits vergeben." }
        : undefined,
    };
  }

  // Mit Email-Confirm AN gibt es keine Session — Check-Email-Page statt /dashboard.
  redirect(`/signup/check-email?email=${encodeURIComponent(email)}`);
}

export async function signIn(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const next = safeNextPath(formData.get("next") ? String(formData.get("next")) : null);

  const parsed = SignInSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: "error", message: "Bitte korrigiere die markierten Felder.", fieldErrors };
  }

  const supabase = await getServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    // Bewusst vage Fehlermeldung — kein User-Enumeration leaken.
    return { status: "error", message: "E-Mail oder Passwort falsch." };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOut(): Promise<void> {
  const supabase = await getServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
