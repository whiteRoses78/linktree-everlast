import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { EditorShell } from "@/components/dashboard/editor-shell";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await getServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, bio, avatar_url, accent_color")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Eigene Links für den Editor (inkl. inaktiver — Toggle ist out of MVP, aber
  // Owner sieht alles, was er angelegt hat).
  const { data: links } = await supabase
    .from("links")
    .select("id, title, url")
    .eq("user_id", user.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Profil</h1>
        <p className="text-sm text-muted-foreground">
          Änderungen erscheinen sofort in der Vorschau.
        </p>
      </div>

      <EditorShell
        username={profile.username}
        initialProfile={{
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          accent_color: profile.accent_color,
        }}
        links={links ?? []}
      />
    </div>
  );
}
