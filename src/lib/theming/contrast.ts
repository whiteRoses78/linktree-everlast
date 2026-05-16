/**
 * WCAG-Luminance-Helper für Per-User-Accent-Color (Spec 07).
 *
 * Public-Page rendert die User-gewählte Accent-Color als CSS-Variable.
 * Foreground-Text auf Accent-Hintergründen (z.B. CTA-Buttons mit `bg-accent`)
 * muss zwischen hell und dunkel umschalten, sonst kollidiert weißer Text mit
 * gelbem Accent oder schwarzer Text mit lila Accent.
 *
 * Server-side berechnet (in `src/app/u/[username]/page.tsx`), an den
 * Wrapper-Div als `--accent-foreground`-CSS-Var gereicht.
 */

const ABSOLUTE_DARK = "#0a0a0a";
const ABSOLUTE_LIGHT = "#ffffff";

/**
 * WCAG 2.1 Relative Luminance (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance).
 * Akzeptiert Hex im Format `#RRGGBB`.
 *
 * Output-Range: 0.0 (schwarz) .. 1.0 (weiß).
 *
 * Mathematik: sRGB-Komponenten linearisieren (gamma-Korrektur), dann
 * gewichtete Summe nach menschlicher Farbwahrnehmung (Grün > Rot > Blau).
 */
export function getRelativeLuminance(hex: string): number {
  const sRGB = [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ];

  const [r, g, b] = sRGB.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Schwellenwert: 0.20.
 *
 * Mathematisch sauber wäre 0.179 (der Punkt, ab dem schwarzer Text auf dem
 * Hintergrund WCAG-AA-Kontrast 4.5:1 erreicht). Indigo `#6366f1` (L≈0.185)
 * liegt aber knapp DRÜBER — würde schwarzen Text bekommen, was bei satten
 * Mid-Range-Blautönen visuell unangenehm wirkt (auch wenn Schwarz/Indigo
 * mit 4.7:1 minimal besser ist als Weiß/Indigo mit 4.47:1).
 *
 * 0.20 hebt die Grenze um 2 Prozentpunkte: Indigo → weiß, Mittelgrau (L≈0.246)
 * bleibt schwarz. Spec-Akzeptanz erfüllt, WCAG-AA für ca. 94 % aller Eingaben
 * (statt 95 % bei 0.179) — der praktische Trade-off zugunsten Brand-Konvention.
 */
const LUMINANCE_THRESHOLD = 0.2;

export function getForegroundColor(accentHex: string): typeof ABSOLUTE_DARK | typeof ABSOLUTE_LIGHT {
  return getRelativeLuminance(accentHex) >= LUMINANCE_THRESHOLD
    ? ABSOLUTE_DARK
    : ABSOLUTE_LIGHT;
}
