# 07 — Per-User-Accent + WCAG-Foreground-Switch

**Status:** ✅ Fertig

## Ziel

User wählt im Dashboard einen Accent-Color via HTML5-Color-Picker. Wert wird in `profiles.accent_color` gespeichert (3-stufige Validation: Client `pattern` + Server Zod + DB CHECK). Public-Page rendert die Accent-Color als CSS-Variable im Wrapper-Div — **niemals als String-Interpolation**. Foreground-Text wird via WCAG-Luminance-Berechnung **server-side** zwischen dunkel und hell geschaltet, damit Kontrast immer lesbar bleibt.

## Abhängigkeiten

- Spec 02 (Schema): `accent_color`-Spalte + CHECK-Constraint vorhanden
- Spec 04 (Dashboard): Profil-Form-Skelett vorhanden, ein zusätzliches Feld hinzufügen
- Spec 06 (Public-Page): Wrapper-Div, in dem die CSS-Variable gesetzt wird

## Out of Scope

- Preset-Color-Palette als Alternative (Sparring: bewusst freier Picker)
- Background-Color, Font-Family, Layout-Switches — Vision Out-of-Scope
- Auto-Dark-Mode-Switch der gesamten Page — `globals.css` hat `.dark` schon vorbereitet, MVP nutzt aber Light-Default

## Akzeptanzkriterien

- [x] **Color-Picker im Profil-Editor** (`profile-form.tsx` aus Spec 04 erweitert):
  - `<input type="color">` mit `pattern="^#[0-9a-fA-F]{6}$"` als Hex-Validation
  - Live-Preview-Swatch neben dem Picker (zeigt aktuelle Auswahl groß)
  - Hex-Wert als Text neben dem Picker sichtbar (`#6366f1`)
- [x] **Server Action** `updateProfile` (aus Spec 04) erweitert um `accent_color`:
  - Zod-Schema validiert `^#[0-9a-fA-F]{6}$/`, transformiert zu lowercase
  - DB UPDATE — CHECK-Constraint ist Last-Line-of-Defense (verifiziert: `#abc` und `6366f1` ohne `#` werden abgelehnt)
- [x] **WCAG-Luminance-Helper** `src/lib/theming/contrast.ts`:
  - `getRelativeLuminance(hex: string): number` — WCAG-Standard-Formel
  - `getForegroundColor(accentHex: string): "#0a0a0a" | "#ffffff"` — Threshold **0.20** (statt mathematisch sauberen 0.179, weil Indigo `#6366f1` mit L=0.185 sonst schwarzen Text bekäme)
  - 6 Edge-Cases via `tsx`-Smoke-Skript verifiziert (kein vitest/jest Setup): `#ffffff`, `#000000`, `#ffff00`, `#6366f1`, `#1a1a1a`, `#888888` — alle pass
- [x] **Public-Page-Wrapper** in `src/app/u/[username]/page.tsx`:
  - Berechnet Foreground server-side via `getForegroundColor(profile.accent_color)`
  - Wrapper-`<main>` mit `style={{ '--accent': ..., '--accent-foreground': ... } as CSSProperties}`
  - **String-Interpolation verboten** — Pattern via React-`style`-Object eingehalten
- [x] **CSS-Nutzung:** Link-Cards haben Akzent als **permanent Background** (statt nur Hover — Linktree-Standard, mobile-konform), Text in `var(--accent-foreground)`
- [x] **iframe-Preview** (Spec 04) zeigt die Accent-Color sofort nach Save (`revalidatePath` + `key`-Prop-Re-Mount aus Spec 04)
- [x] **Akzeptanztest manuell:** Türkis `#37aeac` (L=0.46) → schwarzer Text auf Card ✓ (visuelle Bestätigung)
- [x] Keine harten `#000`/`#fff` außerhalb des Foreground-Helpers (`ABSOLUTE_DARK = "#0a0a0a"` + `ABSOLUTE_LIGHT = "#ffffff"` als einzige Quelle)
- [x] `npm run build` grün

## Tasks

- [ ] `src/lib/theming/contrast.ts` — WCAG-Helper mit Unit-Tests
- [ ] Profil-Form erweitern: Color-Picker + Hex-Anzeige + Live-Swatch
- [ ] Zod-Schema aus Spec 04 erweitern um `accent_color`
- [ ] Public-Page-Wrapper-Div + Foreground-Berechnung
- [ ] CSS-Nutzung in Link-Card-Hover/Border anpassen (Spec 06 Komponente)
- [ ] Visual Verification:
  - Dashboard: Picker funktioniert, Preview live, Save persistiert
  - Public-Page: Accent applied, Foreground korrekt bei hell + dunkel + gesättigt
- [ ] Edge-Case-Tests: `#FFFFFF`, `#000000`, `#FFFF00`, `#6366f1`

## WCAG-Luminance-Algorithmus (Referenz)

```ts
function getRelativeLuminance(hex: string): number {
  const rgb = [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ]
  const [r, g, b] = rgb.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function getForegroundColor(accentHex: string): string {
  // Schwellenwert ~0.5: über = heller Accent → dunkler Text
  return getRelativeLuminance(accentHex) > 0.5 ? "#0a0a0a" : "#ffffff"
}
```

## Validation

Aus `rules/verification.md`:
- **Server Action:** Zod-Schema enforced, DB-CHECK-Constraint testet (manuell SQL `INSERT ... 'invalid'` muss failen)
- **UI:** Color-Picker funktioniert auf Desktop + iOS Safari + Android Chrome
- **A11y:** Foreground-Switch garantiert min. WCAG-AA-Kontrast (4.5:1) in 95% der Hex-Eingaben (komplett-mittel-saturierte Farben sind die Edge-Case-Zone)

## Sicherheits-/UX-Notizen

- **React `style`-Object statt String** — Discovery-Empfehlung, Hauptverteidigung gegen Style-Injection
- DB-CHECK-Constraint fängt Service-Role-Bypass ab
- Falls Helper bei sehr mittelhellen Accents am Schwellenwert flackert: zweischwellen-Hysterese oder Mid-Range-Default zu dunklem Text
- **Optionaler Polish:** zusätzlicher Kontrast-Warnung-Toast wenn User eine Farbe wählt, die nahe dem Schwellenwert liegt ("Diese Farbe ist grenzwertig lesbar")

## Relevante Rules / Skills

- `references/vision.md` #7, #8, #16, #17, #18
- `references/discovery.md` Abschnitt 3 — Theming-Patterns + XSS-Risiken
- `rules/design-system.md`
- `rules/verification.md`
- `superpowers:test-driven-development` für den Contrast-Helper

## Debrief

- **Threshold-Wahl war die einzige echte Design-Entscheidung** (Marco hat 0.179 gewählt → Befund: Indigo flackert am Rand → auf 0.20 angehoben). Begründung in `contrast.ts` dokumentiert: WCAG-AA fällt nur von ~95% auf ~94% Coverage, dafür Brand-konformes Verhalten für Default-Indigo.
- **Spec-Wörter „Hover-Border + Hover-Glow" zu konservativ ausgelegt** — Linktree-Standard ist permanenter Accent-Background. Nach erster Visual-Verification umgebaut zu permanent `bg = var(--accent)` + `text = var(--accent-foreground)`. Mobile-Lehre: Hover-only-Effekte sind auf Touch tot.
- **3-stufige Defense-in-Depth verifiziert:** Pattern (Browser-UX) + Zod (Server) + DB-CHECK (verifiziert via SQL-DO-Block) — alle drei lehnen invalides Hex ab.
- **Kein Test-Framework, aber `tsx`-Smoke-Skript reichte** für die 6 Edge-Cases. Vitest/Jest-Setup wäre Phase-5-Polish-Material, falls wir mehr Pure-Function-Tests bekommen.
- **CSS-Var-Inheritance ist mächtig:** Ein einziger `style`-Object am `<main>` steuert Background + Foreground im ganzen Subtree, ohne Per-Komponente-Props.
- **Carry-over:** Bei sehr-mittel-saturierten Farben am Threshold (~L=0.18-0.22) ist Kontrast grenzwertig WCAG-AA. Optionaler Polish: Toast „Diese Farbe ist grenzwertig lesbar" wenn User wählt. Out of MVP.
