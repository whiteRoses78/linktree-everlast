/**
 * Dezent animierte Glow-Orbs für die Public-Page.
 *
 * Drei Orbs in verschiedenen Größen/Positionen, die langsam driften
 * (18-25s Loop). Die Farben kommen aus `--accent` (per-User) und
 * `--primary` (Theme-Token) — die Orbs adoptieren also automatisch
 * den User-Akzent.
 *
 * - `pointer-events: none` — Orbs blocken keine Klicks
 * - `aria-hidden` — keine Screenreader-Ausgabe
 * - `fixed inset-0 -z-10` — hinter allem
 * - `overflow-hidden` — Orbs ragen nicht aus dem Viewport
 *
 * Keyframes + Sizing stehen in `globals.css` (`.bg-orb`-Klassen),
 * damit der globale `prefers-reduced-motion`-Override sie still
 * stellen kann (animation-duration → 0.01ms).
 */
export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />
    </div>
  );
}
