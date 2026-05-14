# Learning Log

Debriefs nach jedem Feature: was war überraschend, was würde ich anders machen, was habe ich gelernt?

Format pro Eintrag:
```
## YYYY-MM-DD — <Feature>

- **Überraschend:** ...
- **Würde ich anders machen:** ...
- **Gelernt:** ...
```

---

## 2026-05-12 — Spec 01: Design-Tokens

- **Überraschend:** Eigene Design-Annahmen (Dark Mode, Lavender) lagen daneben — der Kurs gibt klar Light Mode + Indigo + Mint-Ring vor. Bei Kurs-basierten Projekten zuerst die Referenz anfragen.
- **Würde ich anders machen:** Theming-Architektur (ADR-002: was dynamisch, was stabil) klären, bevor Token-Werte gesetzt werden — das hat das meiste Rework ausgelöst.
- **Gelernt:**
  - Tailwind v4 → `@theme inline { ... }` in `globals.css`, kein `tailwind.config.ts` für Theme mehr.
  - CSS-Var-Override per inline style: `style={{ ['--accent']: '...' }}` mit `CSSProperties`-Cast.
  - Override-stabiler Ring (`--ring` ≠ `--accent`) ist Accessibility-Infrastruktur — niemals an User-Input koppeln.
  - HSL-Tripel als Variable (`H S% L%` ohne `hsl()`) erlaubt Alpha-Komposition: `hsl(var(--accent) / 0.35)`.
