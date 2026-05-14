/**
 * Token-Demo (Spec 01).
 * Drei Test-Sektionen — Override-Mechanik (--accent), Pill-Radius, Override-stabiler Ring.
 * Wird in späteren Specs durch die Marketing-Landingpage ersetzt.
 */
import type { CSSProperties } from "react";

const sectionLabel =
  "font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-6 py-16 sm:py-24">
      <div className="w-full max-w-3xl space-y-14">
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Design-Token-Test (Spec 01)
          </h1>
          <p className="text-sm text-muted-foreground">
            Default <code className="font-mono">--accent: #6366f1</code> + zwei
            Overrides via inline style.
          </p>
        </header>

        {/* Section 1 — Accent Override */}
        <section className="space-y-4">
          <p className={sectionLabel}>bg-accent / text-accent-foreground</p>
          <div className="flex flex-wrap gap-3">
            <AccentCard label="Default · #6366f1 (indigo)" />
            <AccentCard label="Override · #ff0080 (pink)" override="#ff0080" />
            <AccentCard label="Override · #22c55e (grün)" override="#22c55e" />
          </div>
        </section>

        {/* Section 2 — Pill Radius */}
        <section className="space-y-4">
          <p className={sectionLabel}>
            --radius-link-pill (9999px) — ADR 002
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="bg-accent text-accent-foreground px-5 py-2.5 text-sm font-medium transition-shadow duration-150 ease-out hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ borderRadius: "var(--radius-link-pill)" }}
            >
              Pill-Card via CSS-Variable
            </button>
            <button
              type="button"
              className="rounded-[9999px] border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Pill-Card via Tailwind-Arbitrary
            </button>
          </div>
        </section>

        {/* Section 3 — Border / Ring stabil (Mint) */}
        <section className="space-y-4">
          <p className={sectionLabel}>
            border / ring (sollten unverändert mint bleiben)
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground">
              border
            </div>
            <button
              type="button"
              className="rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors duration-150 ease-out hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              outline-ring (Tab-Fokus testen)
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tipp: Tab drücken → der Mint-Ring erscheint stabil, auch wenn oben
            der Accent auf Pink / Grün gestellt ist.
          </p>
        </section>
      </div>
    </main>
  );
}

type AccentCardProps = {
  label: string;
  override?: string;
};

function AccentCard({ label, override }: AccentCardProps) {
  const style = override
    ? ({ ["--accent"]: hexToHsl(override) } as CSSProperties)
    : undefined;
  return (
    <div
      className="rounded-2xl bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-card"
      style={style}
    >
      {label}
    </div>
  );
}

/**
 * Wandelt einen 6-stelligen Hex-String in das HSL-Tripel um, das unsere
 * Token-Variablen erwarten (`H S% L%`). In Spec 07 wird dieselbe Funktion
 * server-side wiederverwendet — daher hier rein deterministisch ohne State.
 */
function hexToHsl(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "239 84% 67%"; // Fallback auf Indigo
  const r = parseInt(m[1].slice(0, 2), 16) / 255;
  const g = parseInt(m[1].slice(2, 4), 16) / 255;
  const b = parseInt(m[1].slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
