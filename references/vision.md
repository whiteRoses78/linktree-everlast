# Vision — linktree-app

Stand: 2026-05-15 (Phase 2 Sparring abgeschlossen).
Diese Datei ist die Truthquelle für alle Spec- und Build-Entscheidungen. Änderungen → bewusst dokumentieren, Datum aktualisieren.

## Produkt-Beschreibung

Linktree-Klon als Kurs-/Demo-Projekt für Einsteiger ins Agentic Coding. Nutzer:innen registrieren sich mit E-Mail + Passwort + Username, bekommen eine öffentliche Public-Page unter `/u/<username>` mit Bio, Avatar-URL und kuratierter Linkliste (Drag-and-Drop-sortierbar). Theme = ein user-gewählter Hex-Accent + Auto-Foreground-Kontrast.

**MVP-Scope bewusst minimal:** kein OAuth, keine Analytics, kein Avatar-Upload, keine Embeds, kein Custom-Domain, keine Monetarisierung, keine Mehrsprachigkeit.

## Entscheidungs-Tabelle

| # | Entscheidung | Wahl | Quelle |
|---|---|---|---|
| 1 | URL-Struktur Public-Page | Path `/u/<username>` | Sparring R1 / Discovery |
| 2 | Username-Claim-Zeitpunkt | Im Sign-Up-Form (3. Feld neben E-Mail + Passwort) | Sparring R1 |
| 3 | Link-Typen MVP | Nur URL-Links (`https://`) | Sparring R1 / Kickoff |
| 4 | Unbekannter Username | Claim-Seite ("Diesen Username sichern → Sign-Up"), **nach** Reserved-Words-Check | Sparring R1 |
| 5 | Editor-Layout Desktop | Split-View: Linkliste links + iframe-Preview rechts (`/u/<self>?preview=1`) | Sparring R2 |
| 6 | Editor-Layout Mobile | Tab-Toggle "Editor / Preview" | Sparring R2 |
| 7 | Accent-Color-Auswahl | Freier HTML5-Color-Picker (`<input type="color">`) | Sparring R2 |
| 8 | Kontrast-Safety | Server-side WCAG-Luminance-Check → Foreground-Color automatisch dunkel/hell | Sparring R3 |
| 9 | Onboarding | Leerer Editor + prominenter "Ersten Link hinzufügen"-CTA, optional Coach-Mark-Tooltips | Sparring R2 |
| 10 | Reserved Words | `admin`, `root`, `api`, `auth`, `login`, `logout`, `signup`, `dashboard`, `settings`, `u`, `_next`, `www` | Sparring R2 |
| 11 | Drag-and-Drop-Library | `@dnd-kit/core` + `@dnd-kit/sortable` (KEIN Framer Motion Reorder — Mobile-Touch-Issues) | Discovery |
| 12 | Sign-Up Pflichtfelder | E-Mail + Passwort + Username | Sparring R3 |
| 13 | Dashboard Optional-Felder | Display-Name, Bio, Avatar-URL, Accent-Color | Sparring R3 / Kickoff |
| 14 | Auth-Methode | Email + Passwort (kein OAuth, kein Magic Link) | Kickoff fix |
| 15 | Auth-Package | `@supabase/ssr` + `@supabase/supabase-js` (NICHT `@supabase/auth-helpers-nextjs` — deprecated) | Discovery |
| 16 | Theme-Architektur | tweakcn-Tokens statisch in `globals.css`; nur `--accent` pro Public-Page dynamisch | Kickoff fix |
| 17 | Theming-Validation | 3-stufig: Client (`pattern` attr) + Server (Zod) + DB (CHECK-Constraint) | Discovery |
| 18 | Theming-Render | Server-Component-Wrapper mit `style={{'--accent': hex}}` als **Object** (kein String, kein `<style>`-Tag) | Discovery |
| 19 | Tech-Stack | Next.js 15 + React 19 + TS strict + Tailwind v4 + shadcn/ui + Supabase + Vercel + npm | Kickoff fix |
| 20 | Deployment | Vercel Hobby (Free-Tier) + Supabase Free-Tier + öffentliches GitHub-Repo | Kickoff fix |

## Schlüssel-Mechaniken (für Spec-Phase)

### Username-Claim atomar
- Form-Validation: `^[a-z0-9_-]{3,30}$` (matched DB-Constraint `profiles.username`)
- Reserved-Words-Pre-Check **vor** Supabase-`signUp`
- DB-UNIQUE-Constraint auf `profiles.username` (citext) fängt Race-Conditions ab
- Bei Conflict: User-Feedback "Username bereits vergeben"

### Claim-Seite-Logik (Public-Page bei unbekanntem User)
Prio-Reihenfolge im Server Component `/u/[username]/page.tsx`:
1. Reserved-Word? → 404
2. DB-Lookup `profiles.username` → wenn vorhanden, render Public-Page
3. Sonst → Claim-Seite mit Sign-Up-CTA und pre-filled Username

### Accent-Color Pipeline
1. Color-Picker in Dashboard → liefert `#rrggbb`
2. Client-Validation via `pattern`-attr (UX)
3. Server-Action validiert via Zod (`/^#[0-9a-f]{6}$/i`)
4. DB CHECK-Constraint validiert nochmal (`accent_color ~ '^#[0-9a-fA-F]{6}$'`)
5. Public-Page-Render: WCAG-Luminance berechnen, Foreground via CSS-Variable setzen (`--accent` + `--accent-foreground`)

### Drag-and-Drop-Persistence
- `<DndContext>` im Dashboard-Client-Component
- `onDragEnd` → optimistic local update + `startTransition(() => reorderLinksAction(...))`
- Server Action: Supabase-`upsert` auf `links.position`, RLS sorgt für User-Isolation
- Sensors: `PointerSensor` mit `activationConstraint: { delay: 150, tolerance: 5 }` (Mobile-Scroll-vs-Drag) + `KeyboardSensor` (a11y)

## Bewusst draußen (Out of Scope MVP)

- OAuth-Provider (Google/GitHub/Apple)
- Mehrere Pages pro User
- Avatar-Upload via Supabase Storage (URL-Feld reicht)
- Click-Analytics (keine Counts, keine Timestamps, keine Zeitreihen)
- Fortgeschrittenes Theming (Fonts, Backgrounds, Layouts) — nur Accent-Color
- Embed-Link-Typen (Spotify-Player, YouTube-Player)
- Custom Domains
- Monetarisierung / Paid Plans
- Mehrsprachigkeit
- Multi-Theme-Versionierung

## Anmerkungen aus Discovery

- **Bento.me wurde im Februar 2026 eingestellt.** Bleibt als Inspirations-Quelle relevant, aber Live-Inspektion in Phase 3 (Design-Exploration) muss über Archive/Screenshots laufen.
- **Framer Motion Reorder ausgeschlossen** wegen seit Jahren offener Mobile-Touch-Issues (GitHub-Issues #1506, #1582, #1597).
- **`@supabase/auth-helpers-nextjs` ist deprecated** seit Mitte 2024. Discovery hat den heutigen `@supabase/ssr`-Pattern dokumentiert (siehe `discovery.md` Abschnitt 2).
- **`cookies()` in Next.js 15 ist async** — häufigste Bruchstelle für aus alten Tutorials kopierten Code.
