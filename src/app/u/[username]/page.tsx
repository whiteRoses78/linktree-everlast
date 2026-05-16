import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import { getServerClient } from "@/lib/supabase/server";
import { isReserved } from "@/lib/auth/reserved-usernames";
import { getForegroundColor } from "@/lib/theming/contrast";
import { ProfileHeader } from "@/components/public/profile-header";
import { LinkList } from "@/components/public/link-list";
import { ClaimCard } from "@/components/public/claim-card";
import { PageFooter } from "@/components/public/page-footer";
import { AnimatedBackground } from "@/components/public/animated-background";

type Params = Promise<{ username: string }>;
type SearchParams = Promise<{ preview?: string }>;

/**
 * Public-Profile-Page mit drei möglichen Render-Modi:
 *
 *   1. RESERVED   — `/u/admin`, `/u/api`, ... → notFound() (zeigt not-found.tsx)
 *   2. PUBLIC     — Profile in DB → ProfileHeader + LinkList
 *   3. CLAIM      — kein Profile + nicht reserved → ClaimCard mit Sign-Up-CTA
 *
 * SICHERHEIT: Reserved-Check MUSS vor der DB-Query stehen — sonst würde
 * `/u/admin` zur Claim-Seite werden ("Diesen Namen sichern") = Phishing-Vektor.
 */
export default async function PublicProfilePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { username } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";

  // ─────────────────────────────────────────────────────────────────────
  // TODO (Marco): Drei-Wege-Routing-Logik
  //
  // Implementiere die Prio-Reihenfolge aus Spec 06:
  //
  //   1. Wenn `isReserved(username)` → ruf `notFound()` auf (kein DB-Hit nötig)
  //   2. Sonst: lade das Profile aus Supabase. Hilfsfunktion direkt unten:
  //      `await loadProfileWithLinks(username)` → { profile, links } | null
  //   3. Wenn Profile vorhanden → render <PublicProfileView ... />
  //   4. Sonst → render <ClaimView username={username} />
  //
  // Tipps:
  //   - Early-Returns sind hier deutlich lesbarer als verschachtelte Ifs.
  //   - `notFound()` wirft intern → kein `return` danach nötig (TypeScript
  //     erkennt das durch den `never`-Return-Type).
  //   - `<PublicProfileView>` und `<ClaimView>` sind unten in dieser Datei
  //     definiert; beide erwarten `isPreview` als Prop für den Footer.
  // ─────────────────────────────────────────────────────────────────────

  if (isReserved(username)) {
    notFound();
  }

  const data = await loadProfileWithLinks(username);
  if (!data) {
    return <ClaimView username={username} isPreview={isPreview} />;
  }

  return <PublicProfileView data={data} isPreview={isPreview} />;
}

// ──────────────────────────────────────────────────────────────────────────
// Helpers (von Marco zu nutzen, nicht zu ändern)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Lädt Profile + aktive Links für einen Username.
 * Gibt `null` zurück, wenn kein Profile existiert (= Claim-Case).
 *
 * RLS: `profiles_public_read` und `links_public_read` (is_active = true)
 * lassen anonyme Reads zu — kein Auth nötig.
 */
async function loadProfileWithLinks(username: string) {
  const supabase = await getServerClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, bio, avatar_url, accent_color")
    .eq("username", username)
    .maybeSingle();

  if (!profile) return null;

  const { data: links } = await supabase
    .from("links")
    .select("id, title, url")
    .eq("user_id", profile.id)
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return { profile, links: links ?? [] };
}

type PublicProfileViewProps = {
  data: NonNullable<Awaited<ReturnType<typeof loadProfileWithLinks>>>;
  isPreview: boolean;
};

function PublicProfileView({ data, isPreview }: PublicProfileViewProps) {
  // Per-User-Accent als CSS-Variablen am Wrapper. Server-side berechneter
  // Foreground-Wechsel (WCAG-Luminance) garantiert lesbaren Text auf jedem
  // Accent. WICHTIG: NIEMALS als String-Interpolation in `<style>`-Tags —
  // das wäre der klassische Style-Injection-Vektor (siehe Spec 07).
  const accentStyle = {
    "--accent": data.profile.accent_color,
    "--accent-foreground": getForegroundColor(data.profile.accent_color),
  } as CSSProperties;

  return (
    <main style={accentStyle} className="relative min-h-svh">
      {!isPreview ? <AnimatedBackground /> : null}
      <div className="relative mx-auto max-w-md px-6 py-12">
        <ProfileHeader profile={data.profile} />
        <div className="mt-10">
          <LinkList links={data.links} />
        </div>
        <PageFooter isPreview={isPreview} />
      </div>
    </main>
  );
}

type ClaimViewProps = {
  username: string;
  isPreview: boolean;
};

function ClaimView({ username, isPreview }: ClaimViewProps) {
  return (
    <main className="relative min-h-svh">
      {!isPreview ? <AnimatedBackground /> : null}
      <div className="relative mx-auto max-w-md px-6 py-12">
        <ClaimCard username={username} />
        <PageFooter isPreview={isPreview} />
      </div>
    </main>
  );
}
