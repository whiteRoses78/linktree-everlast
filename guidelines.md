# Architektur-Entscheidungen (ADRs)

Format pro Eintrag: Kontext / Entscheidung / Warum / Alternativen.

---

## ADR-001 — Stack-Entscheidung

**Datum:** 2026-05-12

**Kontext:** Projekt-Setup, Auswahl Framework + Backend + Deployment.

**Entscheidung:** Next.js 15 (App Router) + React 19 + TypeScript strict, Tailwind v4 + shadcn/ui, Supabase (Auth + Postgres + RLS), Vercel (Hobby Tier), npm.

**Warum:**
- Next.js 15 App Router ist aktueller Standard für Full-Stack-React.
- Supabase liefert Auth + DB + RLS aus einer Hand, Free Tier reicht für Einsteiger-Projekte.
- Vercel = Zero-Config-Deployment für Next.js.
- shadcn = Komponenten als Copy-Code (kein Lib-Bloat).
- TypeScript strict verhindert ganze Bug-Kategorien.

**Alternativen:**
- T3-Stack (tRPC + Prisma) — verworfen, mehr Komplexität als nötig
- Remix — verworfen, kleinere Community
- SvelteKit — verworfen, weniger LLM-Trainingsdaten verfügbar
- Eigener Express-Backend — verworfen, mehr Wartungslast

---

## ADR-002 — Theming-Architektur: dynamischer Akzent, stabile Infrastruktur

**Datum:** 2026-05-12

**Kontext:** Linktree-Style-Apps müssen pro Public-Page eine andere Akzentfarbe rendern können (`/u/marco` rot, `/u/leonie` mint, …). Das könnte naiv lösen: alle Tokens dynamisch machen. Das bricht aber Accessibility (Focus-Rings unpredictable) und CSS-Komposition (jeder Hover-State müsste neu berechnet werden).

**Entscheidung:** Zweistufige Token-Architektur in `src/app/globals.css`:

- **Dynamisch (genau eine Variable):** `--accent` (+ `--accent-foreground`). Wird pro Public-Page via inline style auf `<html>` oder Wrapper überschrieben, in der Form `style={{ '--accent': 'H S% L%' }}`.
- **Stabil (alle anderen Tokens):** `--background`, `--foreground`, `--card`, `--border`, `--ring`, `--radius`, `--radius-link-pill`, `--shadow-*`. Bleiben bei allen Public-Pages identisch.
- `--ring` hat eine eigene Mint-Farbe (NICHT vom Accent abgeleitet), damit Tab-Fokus auch bei Pink/Grün-Accent stabil erkennbar bleibt.
- **Zusätzlicher Geometrie-Token:** `--radius-link-pill: 9999px` für Link-Items (Pill-Form), separat von `--radius` (Cards/Inputs). Erlaubt UX-Tuning ohne Auswirkung auf Cards.

**Warum:**
- **Sicherheit:** Per User-Input wird nur eine CSS-Variable gesetzt, kein raw CSS, kein Selektor — Override ist sandboxed.
- **Accessibility:** Focus-Ring bleibt unabhängig vom User-Accent erkennbar.
- **Komposition:** `bg-accent`, `text-accent-foreground`, `shadow-glow` (nutzt `hsl(var(--accent) / 0.35)`) komponieren automatisch mit dem Override — kein React-State, kein useEffect.
- **Performance:** CSS-Variable-Update triggert nur Paint, kein Re-Render.

**Alternativen:**
- **Alle Tokens dynamisch** — verworfen, Accessibility-Disaster.
- **Akzent als React-State + className-Switch** — verworfen, mehr Komplexität, kein Vorteil.
- **CSS-in-JS (z. B. style-Tag generieren)** — verworfen, raw CSS = XSS-Risiko bei User-Input.

**Spec-Bezug:**
- Spec 01: Default-`--accent` setzen + Override-Demo (drei Cards, eine pro Farbe).
- Spec 07: Per-User-Accent persistieren (DB-Feld `profiles.accent_color` als `^#[0-9a-f]{6}$`, server-side Hex-Validierung, hex→HSL in Public-Page-Layout).

---

<!-- Weitere ADRs hier einfügen -->
