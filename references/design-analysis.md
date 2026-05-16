# Design-Analyse — Phase 3 Findings

Stand: 2026-05-15. Live-Exploration via `browser-use --headed` über 5 Referenz-Sites (3 direkte Konkurrenten + 3 Premium-Niveau-Referenzen). Screenshots in `inspiration/<tool>/`.

**Nicht erfasst:** Bento.me (Februar 2026 eingestellt; Wayback Machine antwortete heute mit ERR_CONNECTION_CLOSED). Patterns aus Discovery übernommen — siehe `discovery.md` Abschnitt 1.

---

## 1. Direkte Konkurrenten

### Linktree (`inspiration/linktree/`)

**Landing:** sehr sättige Brand-Farben (Lime-grün, Rot, Lila, Sapphire-Blau) als Block-Sections; Big-Type-Headlines ("bio you."); Profile-Mockup mit weißer Card-Liste im Hero; soziale Beweise (HBO, "70M+ creators"); CTA-driven, viel Action-orange-pink.

**Public-Page (`linktr.ee/linktree`):** zentriertes Single-Column-Layout, `max-width ~440px`. **Background = solides Theme** (hier Lime). Avatar oben, kompakter Display-Name + Bio + Social-Icon-Row, dann Linkliste. **Cards:** weiße Backgrounds, gerundete Ecken (~`rounded-xl` bis `rounded-2xl`), Full-Width-Buttons, dezente Shadows, große Tap-Targets (~52px Höhe). Media-Embeds größer mit Cover-Image. Footer-Branding "Get Linktree" + Cookie-Hinweis. Tabs für Sub-Pages ("Links" / "Shop") als pill-shaped Toggle.

**Übernehmbare Patterns:**
- Single-Column-Card-Stack als Public-Page-Skelett
- Avatar → Name → Bio → Social-Icons → Linkliste als Standardreihenfolge
- Solid-Theme-Background + weiße Cards für hohe Lesbarkeit
- Footer-Branding dezent ("Mit linktree-app erstellt")

**Bewusst NICHT:** Übersättige Brand-Farben aus dem Marketing übernehmen — unser MVP ist ein Dark-Mode-Premium-Look, nicht Linktrees Block-Design.

### Beacons (`inspiration/beacons/`)

**Landing:** sehr clean, viel White-Space, pastellige Gradients als Hero-Card-Backgrounds (Pink-Blau, Orange-Gelb, Pink-Lila, Grün-Blau, Lila-Blau). Phone-Frame-Preview im Hero. Premium-Vibe, weniger Action-CTA-getrieben.

**Public-Page-Demo (`beacons.ai/beacons`):** schwarzes Background, zentrierte weiße Card mit gerundeten Ecken (~`rounded-3xl`), Cover-Image oben + Avatar überlappt Cover unten. Display-Name mit Verifizierungs-Indicator, einzeilige Bio, Social-Icons-Row, ein blauer Big-CTA-Button "Sign up for free". Footer-Pill rechts: "Beacons - Try for free!".

**Real-Creator-Profil (`beacons.ai/jakepaul`):** Custom-Background-Image (Bokeh) **vollflächig**, Avatar zentriert, Bio links-bündig. **Buttons sind pill-shaped, transparent-mit-Outline** (nicht solid-card wie Linktree). Anderes Visual-Vocabulary.

**Übernehmbare Patterns:**
- Pill-shaped Outline-Buttons als Alternative zu Linktrees Card-Style (vermerkt für Polish-Phase)
- Cover-Image-mit-Avatar-Overlay als "Profil-Header"-Variante (für später, MVP hat nur Avatar)
- Pastellige Gradient-Akzente als Inspiration für tweakcn-Tokens

**Bewusst NICHT:** Custom-Background-Image (out-of-scope MVP), 6-Step-Forced-Wizard (Friction).

### Bento.me (nicht erfasst, aus Discovery)

Patterns aus `discovery.md` Abschnitt 1: Bento-Grid-Konzept (Card-Mosaic statt vertikale Liste), "simplest onboarding"-Bewertung, Username-Path-Struktur. **Bewusst NICHT übernommen:** Bento-Grid ist zu komplex fürs MVP (mehrere Card-Größen, drag-resize) — pure vertikale Linkliste reicht.

---

## 2. Premium-Niveau-Referenzen (`inspiration/premium/`)

### Linear (`01-linear-landing.png`)

**Visuelles Vokabular:** pure Dark-Mode (fast schwarz, **leicht warm** angelegt — nicht `#000`). Lila-Pink-Akzente in Headlines + Buttons. Sehr aufgeräumt, viel vertikaler Rhythmus. **Große Gradient-Headlines** ("The product development system for teams and agents"). Product-Screenshots als Inline-Cards mit subtle Borders + radial gradient overlays. Typography: geometric Sans-Serif (Inter-Familie), super crisp.

**Lehre für uns:**
- Dark-Mode-Background nie pure `#000` — leicht warm oder leicht cool (`oklch(0.13 0 0)` statt `#000000`)
- Akzente nicht als flache Color, sondern als **subtle Gradient** (z.B. Card-Hintergrund mit `bg-gradient-to-br from-zinc-900 to-zinc-950`)
- Headlines groß, Body-Text bewusst kleiner — hoher Kontrast in Größen statt nur Farbe

### Arc.net (`02-arc-landing.png`)

**Visuelles Vokabular:** warm-Lila Hero-Gradient ("Meet Dia"), dann sehr **vielfältige Color-Blocks** pro Section (cremig, warm-rot, hellblau, abstrakte Mood-Cards). Browser-Screenshots als Hero-Material, eingebettet in warm-getönte Cards mit gradient-radial-light-Effekten. Einladend, weniger steril als Linear.

**Lehre für uns:**
- "Premium" bedeutet nicht "nur schwarz und akzent-violett" — Variety zwischen Sections schafft Atmosphäre
- Subtle radial-gradient-Overlays in Cards ("Light hitting the card from above") sind ein wiederkehrendes Premium-Signal
- Hero-Section darf ruhig bunter sein als der Rest

### Raycast (`03-raycast-landing.png`)

**Visuelles Vokabular:** **ultra-dark**, fast schwarz, mit **Red-Pink Mesh-Gradient** als Hero-Akzent. Command-Palette als Hero-Element (das Produkt-Mockup ist die Brand-Botschaft). Bento-Grid-Style Cards mit subtle borders + Glow-Effects in Brand-Color. Sehr präzise Typography, kleine Body-Sizes.

**Lehre für uns:**
- **Glow-Effekte** als Premium-Signal: ein Card-Hover kann ein subtle Color-Glow am Rand werfen (Box-Shadow mit Accent-Color, sehr niedrige Opacity)
- Mesh-Gradients als Hintergrund-Animation (animated-background-orbs aus Polish-Phase)
- Dunkel + ein einziger sättiger Akzent = Premium

---

## 3. Übergreifende Direktiven für linktree-app

Aus den 5 Referenzen + Kickoff-Vorgaben + Discovery-Findings konsolidiert.

### Farbpalette (für tweakcn / globals.css)

| Token | Wert (oklch, Dark) | Quelle / Begründung |
|---|---|---|
| `--background` | `oklch(0.13 0.01 280)` | Leicht **warm-kühl**, nicht pure schwarz. Linear-Stil. |
| `--foreground` | `oklch(0.97 0.005 280)` | Off-white, nicht pure `#fff`. |
| `--card` | `oklch(0.16 0.012 280)` | Leicht heller als BG für Card-Lift. |
| `--border` | `oklch(0.22 0.015 280)` | Sehr dezent, Linear-Stil. |
| `--muted-foreground` | `oklch(0.65 0.02 280)` | Für sekundären Text + Icons. |
| `--accent` | **dynamisch pro User** | Hex aus DB, Foreground via WCAG-Luminance auto-switched |

**Hinweis:** tweakcn ist schon angelegt (Phase 1) — diese Tabelle ist eine **Zielwert-Referenz** zum Vergleich, falls aktuelle Werte zu kontrastarm/zu kühl sind. Phase 4 Build-Loop prüft das visuell.

### Typography

- **Font:** Inter (Default in shadcn/Next-Standard) oder Geist (Vercel) — beide passen.
- **Headlines:** sehr groß (`text-4xl` bis `text-6xl`), Letter-Spacing leicht negativ (`-tracking-tight`).
- **Body:** mittel (`text-base` bis `text-lg`), `text-muted-foreground` für sekundären Inhalt.
- **UI-Labels (Buttons, Inputs):** `text-sm` bis `text-base`, `font-medium`.

### Spacing & Layout

- **Container Max-Width** für Public-Page: **440-480px** (Linktree-Standard, mobile-first).
- **Container Max-Width** für Dashboard: **1280px** (Linear-Standard), Editor-Split-View braucht den Platz.
- **Card-Padding:** `p-6` (24px) auf Mobile, `p-8` (32px) auf Desktop.
- **Vertical-Rhythm:** `gap-3` zwischen Link-Cards (12px), `gap-6` zwischen Sektionen (24px).

### Motion & Microinteractions

- **Transition-Default:** `150ms ease-out` für Hover, `200ms ease-out` für Layout-Changes (Kickoff-fix).
- **Hover auf Link-Cards:** Scale `1.0 → 1.015`, leicht hellere Border, subtle Box-Shadow.
- **Tap (Active-State):** Scale `1.0 → 0.98`, kurzes 80ms.
- **Drag-Pickup (dnd-kit):** Card hebt sich an (`box-shadow-2xl`), Opacity 0.5 für Original-Slot.
- **Reduce-Motion:** alle Animationen via `motion-reduce:transition-none`.

### Layout-Direktiven konkret

**Public-Page `/u/[username]`:**
- Zentrierte Single-Column, `max-w-md mx-auto p-6`.
- Background: Theme-Default-Color (NICHT user-defined — nur Accent ist user-customizable).
- Avatar: 96px (Mobile) / 112px (Desktop), `rounded-full`, dezent borderd.
- Display-Name: `text-2xl font-semibold`.
- Bio: `text-base text-muted-foreground`, max 2-3 Zeilen, zentriert.
- Linkliste: Card-Stack mit `gap-3`, full-width, `rounded-2xl`, `bg-card`, `hover:scale-[1.015]`, `transition`.
- **Accent-Color-Nutzung:** als Border-Akzent + Hover-Glow-Color, nicht als Card-BG (zu schreiend).

**Dashboard `/dashboard`:**
- Split-View Desktop: `grid grid-cols-[1fr_1.2fr]` (Editor links etwas schmaler, Preview rechts).
- Mobile: Tab-Toggle "Editor / Preview", beide Vollbreite.
- Link-Editor: Inline-Cards mit Drag-Handle links (`<GripVertical>`), Edit/Delete-Actions rechts.
- Preview: iframe auf `/u/<self>?preview=1`, `rounded-2xl border`, full height des Split-Panels.

### Anti-Patterns (auf keinen Fall)

- **Pure `#000` / `#fff`** — Kickoff-Regel, durch alle Premium-Referenzen bestätigt.
- **Flache, sättige Brand-Block-Sections** wie Linktrees Marketing — wir wollen Premium-Dark, nicht Block-Color.
- **6-Step-Forced-Wizard** wie Beacons — Friction für unsere Zielgruppe (Einsteiger ins Agentic Coding).
- **Custom-Background-Image pro User** — out-of-scope MVP.
- **Bento-Grid mit Multi-Size-Cards** — pure vertikale Linkliste reicht.

---

## 4. Verweis auf Screenshots

| Datei | Was |
|---|---|
| `inspiration/linktree/01-landing.png` | Linktree-Landing-Page (Marketing) |
| `inspiration/linktree/02-public-profile.png` | Linktrees eigenes Public-Profil `/linktree` |
| `inspiration/beacons/01-landing.png` | Beacons-Landing-Page |
| `inspiration/beacons/02-public-profile-attempt1.png` | Beacons-Demo-Profil (sign-up-CTA) |
| `inspiration/beacons/03-creator-jakepaul.png` | Beacons Real-Creator-Profil mit Custom-Background |
| `inspiration/premium/01-linear-landing.png` | Linear-Landing (Dark-Mode-Premium-Niveau) |
| `inspiration/premium/02-arc-landing.png` | Arc.net-Landing (warme Color-Variety) |
| `inspiration/premium/03-raycast-landing.png` | Raycast-Landing (Mesh-Gradient + Glow) |

**Sondernote zur Methodik:** alle Screenshots sind **Full-Page** (gesamte Scroll-Höhe), nicht nur Above-the-Fold. Das macht sie groß (bis 9 MB), aber zeigt das komplette Design-System inkl. Footer + Sub-Sections.
