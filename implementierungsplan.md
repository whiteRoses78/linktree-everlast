# Implementierungsplan

Arbeitspaket-Tabelle für `linktree-app`. Reihenfolge folgt Abhängigkeiten — Design-Tokens vor UI-Komponenten, Schema vor Auth, Auth vor Dashboard, Dashboard vor Public-Page, Basis-Render vor Theming + Reordering.

Truthquelle für Entscheidungen: [`references/vision.md`](references/vision.md). Truthquelle für Design-Niveau: [`references/design-analysis.md`](references/design-analysis.md). Truthquelle für aktuelle Framework-Patterns: [`references/discovery.md`](references/discovery.md) — bei Detailfragen IMMER auch Context7 MCP, NICHT aus Gedächtnis.

## Status-Legende

- ⏳ Geplant
- 🚧 In Arbeit
- ✅ Fertig (Akzeptanzkriterien abgehakt, Debrief in `changelog.md` + `learning.md` geschrieben)

## Arbeitspakete

| # | Feature | Spec | Abhängigkeiten | Status |
|---|---|---|---|---|
| 01 | Design-Tokens (Light Mode, tweakcn-Theme) | [`specs/01-design-tokens.md`](specs/01-design-tokens.md) | — | ✅ |
| 02 | Supabase-Schema + RLS + Types | [`specs/02-supabase-schema.md`](specs/02-supabase-schema.md) | — | ✅ |
| 03 | Auth (Sign-Up + Sign-In + Sign-Out + Proxy) | [`specs/03-auth.md`](specs/03-auth.md) | 02 | ✅ |
| 04 | Profil-Editor + Dashboard-Skeleton + iframe-Preview | [`specs/04-profile-editor.md`](specs/04-profile-editor.md) | 02, 03 | ✅ |
| 05 | Links-CRUD (Create + Read + Update + Delete) | [`specs/05-links-crud.md`](specs/05-links-crud.md) | 04 | ✅ |
| 06 | Public-Profil-Page + Reserved/Claim-Logik | [`specs/06-public-page.md`](specs/06-public-page.md) | 03, 05 | ✅ |
| 07 | Per-User-Accent + WCAG-Foreground-Switch | [`specs/07-per-user-accent.md`](specs/07-per-user-accent.md) | 04, 06 | ✅ |
| 08 | Link-Reordering via dnd-kit | [`specs/08-link-reordering.md`](specs/08-link-reordering.md) | 05 | ✅ |

## Welche Spec deckt welchen Vision-Punkt ab

Vision-Punkte aus [`references/vision.md`](references/vision.md):

| Vision # | Thema | Spec |
|---|---|---|
| 1 | URL `/u/<username>` | 06 |
| 2 | Username-Claim im Sign-Up | 03 |
| 3 | Nur URL-Links (`https://`) | 05 |
| 4 | Claim-Seite + Reserved-Words-Check | 06 (Logik) + 03 (Reserved-Konstante) |
| 5–6 | Split-View Desktop + Tab-Toggle Mobile | 04 |
| 7 | Freier HTML5-Color-Picker | 07 |
| 8 | WCAG-Foreground-Switch | 07 |
| 9 | Leerer Editor + CTA Onboarding | 04, 05 |
| 10 | Reserved-Words-Liste | 03 (Konstante), 06 (Verwendung) |
| 11 | dnd-kit für Drag-and-Drop | 08 |
| 12 | E-Mail + Passwort + Username Pflicht | 03 |
| 13 | Display-Name + Bio + Avatar-URL + Accent in Dashboard | 04, 07 |
| 14 | Email + Passwort (kein OAuth) | 03 |
| 15 | `@supabase/ssr`-Package | 03 |
| 16 | Theme-Architektur (Tokens statisch, Accent dynamisch) | 01 ✅ + 07 |
| 17 | 3-stufige Theming-Validation | 02 (DB-CHECK) + 07 (Client + Server) |
| 18 | Render mit `style`-Object | 07 |
| 19 | Tech-Stack | Spec 01 ✅ + alle |
| 20 | Vercel + Supabase Free-Tier + GitHub | Phase 6 Deploy (außerhalb Specs) |

## Was bewusst NICHT in den Specs ist

Diese Themen kommen in **Phase 5 (Polish)** oder **Phase 6 (Deploy)** und brauchen keine eigene Feature-Spec:

- ✅ **Empty/Loading/Error-States** mit Premium-Charakter → Phase 5 Polish-Pass über alle Routes
- ✅ **Microinteractions** (Hover-Glow, Scale-on-Press, Card-Hover-Lift) konsistent → Phase 5
- ✅ **Mobile-Detail-Pass** (Padding, Tap-Target, Truncation) — responsive-Pattern verifiziert, Viewport-Emulation eingeschränkt
- ✅ **Impressum + Datenschutz + Footer** (TMG §5 + DSGVO Art. 13/14) + globaler `noindex` → Phase 5
- ✅ **Animated-Background-Orbs** (Premium-Touch) → Phase 5
- ⏳ **Git + GitHub + Vercel + Token-Leak-Check** → Phase 6
- ⏳ **Production Email-Confirmation** + Password-Reset → nach Phase 6, separates Feature
- ⏳ **Dark-Mode-Toggle** — Tokens sind in `globals.css` schon vorbereitet (`.dark`-Class), Toggle-UI ist optionales Feature nach MVP

**Phase-5-Debrief**: `changelog.md` (2026-05-16 — Phase 5) + `learning.md` (2026-05-16 — Phase 5).

## Wiederkehrende Bestätigungs-Punkte

Bei JEDER Spec im Build-Loop:
- Keine harten `#000`/`#fff` außerhalb erlaubter Quellen
- Hover + Focus auf jedem interaktiven Element
- Mobile-Viewport 375px geprüft via `browser-use --headed`
- Empty/Loading/Error rudimentär vorhanden (Polish kommt in Phase 5)
- `@supabase/ssr` Patterns aus Discovery, NICHT aus Trainingsdaten
- Context7 MCP für aktuelle Next.js 15 / Supabase Docs
- Akzeptanzkriterien abgehakt → Status auf ✅ → Debrief in `changelog.md` + `learning.md`
