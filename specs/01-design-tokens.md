# 01 — Design-Tokens

**Status:** ✅ Fertig

## Ziel

Globale Design-Tokens als CSS-Variablen in `src/app/globals.css` einführen, in Tailwind v4 via `@theme inline` einhängen und auf der Startseite mit einer **Token-Demo** visuell verifizieren. Single Source of Truth für Farben, Radius, Shadows, Transitions. Light Mode ist der Default.

Die Demo zeigt drei Mechanismen, die für die spätere App tragend sind:
1. **Accent-Override** via inline style — Vorschau auf Spec 07.
2. **Pill-Radius** als eigener Token für Link-Items (Spec 05).
3. **Override-stabiler Mint-Ring** (Focus-Indicator bleibt unabhängig vom User-Accent erkennbar).

## Abhängigkeiten

- Keine — erste Spec.
- Empfehlung: tweakcn-Theme exportieren und Werte hier ersetzen, sobald vorhanden.

## Out of Scope

- **Per-User-Accent persistent in DB** → Spec 07
- shadcn-Komponenten installieren → eigener Task, sobald Tokens stehen
- Dark-Mode-Toggle → optional später; Light-Mode ist Default
- Custom Fonts → Geist von `create-next-app` bleibt eingebunden

## Akzeptanzkriterien

- [x] `src/app/globals.css` enthält Tokens als HSL-Tripel + `@theme inline`-Mapping (siehe Token-Set unten)
- [x] `--radius-link-pill: 9999px` existiert als eigener Token
- [x] `--ring` ist Mint (HSL 168 76% 42%), unabhängig vom `--accent`
- [x] `src/app/layout.tsx` setzt `bg-background text-foreground` auf `<body>`
- [x] `src/app/page.tsx` zeigt drei Sektionen:
  - Sektion 1: drei `bg-accent`-Cards (Default + Pink-Override + Grün-Override via inline style)
  - Sektion 2: zwei Pill-Cards (eine per CSS-Variable `var(--radius-link-pill)`, eine per Tailwind-Arbitrary `rounded-[9999px]`)
  - Sektion 3: Border-Card + Outline-Ring-Button — beide nutzen den stabilen Mint-Ring, bewusst NICHT den Accent
- [x] Keine harten `#000` / `#fff` im `src/`-Code (grep)
- [x] `npm run build` läuft ohne Errors
- [x] Visual Verification (Browser): Sektion 1 zeigt drei Akzent-Farben nebeneinander, Sektion 3 zeigt unter Tab-Fokus den Mint-Ring stabil
- [x] ADR-002 in `guidelines.md` dokumentiert die Theming-Architektur

## Token-Set (Light Mode, HSL)

```
--background: 0 0% 99%;
--foreground: 240 10% 6%;
--card: 0 0% 100%;
--muted: 240 5% 96%;
--muted-foreground: 240 4% 46%;
--border: 240 6% 90%;
--ring: 168 76% 42%;          /* MINT — override-stabil */

--primary: 239 84% 67%;       /* Indigo #6366f1 */
--accent: 239 84% 67%;        /* Default — wird pro User in Spec 07 überschrieben */
--accent-foreground: 0 0% 100%;
--destructive: 0 72% 51%;

--radius: 0.75rem;
--radius-link-pill: 9999px;   /* spezifisch für Link-Items */

--shadow-card: sanft, mehrschichtig
--shadow-glow: über --accent ableitend (Hover-Effekt skaliert mit Override)
```

Vollständiges Set in `src/app/globals.css`.

## Tasks

- [x] `src/app/globals.css` mit Token-Set + `@theme inline`-Mapping
- [x] `src/app/layout.tsx` — `bg-background text-foreground` auf `<body>`
- [x] `src/app/page.tsx` — Token-Demo (drei Sektionen)
- [x] `hexToHsl()` Helper in der Demo (deterministisch, wird in Spec 07 wiederverwendet)
- [x] ADR-002 in `guidelines.md`
- [x] Build verifizieren (`npm run build`)
- [x] Hex-grep für harte `#000`/`#fff` (außer in Kommentaren)
- [x] Visual Verification (Browser auf `localhost:3000` + Mobile 375px)
- [x] Akzeptanzkriterien hier abhaken, Status in `implementierungsplan.md` auf ✅, Eintrag in `changelog.md` + `learning.md`

## Validation

Stopp-Kriterien aus `rules/verification.md`:
- **UI:** Hover/Focus auf jedem Button sichtbar; Pill-Radius rendert als Kapsel; Mint-Ring bei Tab-Fokus sichtbar; sichtbare aber dezente Card-Shadow
- **Build:** `npm run build` ohne Errors

## Relevante Rules / Skills

- `rules/design-system.md` — Pflicht-Regeln; HIER ÜBERSCHRIEBEN: Light Mode statt Dark (kursbasiert)
- `guidelines.md` ADR-002 — Theming-Architektur
- Context7 MCP — bei Unsicherheit zu Tailwind v4 `@theme`-Syntax

## Debrief

- **Überraschend:** Mein erster Vorschlag (Dark Mode, Lavender) war eine eigene Interpretation — der Kurs gibt klar Light Mode + Indigo + Mint-Ring vor. Wichtige Lektion: bei Kurs-basierten Setups die Referenz früh anfragen, statt eigene Design-Annahmen zu treffen.
- **Würde ich anders machen:** Beim nächsten Mal die Theming-Architektur (ADR-002: was dynamisch, was stabil) klären, BEVOR die Tokens definiert werden — das hat den meisten Re-Work ausgelöst.
- **Gelernt:**
  - Tailwind v4 nutzt `@theme inline { ... }` in `globals.css`, kein `tailwind.config.ts` mehr.
  - Inline-Style mit CSS-Variablen (`style={{ ['--accent']: '...' }}`) braucht in TS einen `CSSProperties`-Cast — die Standardtypen kennen keine `--xy`-Keys.
  - Der Override-stabile Ring ist Accessibility-Infrastruktur — niemals an User-Daten koppeln.
  - HSL-Tripel als Variable (`240 10% 6%`, ohne `hsl()`) erlaubt Alpha-Komposition in shadow-glow & Co.
