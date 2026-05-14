# Design-System

UI-Regeln für dieses Projekt. Verbindlich für alle interaktiven Elemente und Layouts.

## Pflicht-Regeln

- **Dark Mode von Start an**, nicht als Nachgedanke
- **Keine flachen Farben** — immer Gradients, Abstufungen, Layering
- **Keine harten #000/#fff** — abgestufte Neutrals nutzen
- **Hover- und Focus-State** auf jedem interaktiven Element
- **Smooth Transitions** — min. 150ms ease-out
- **rounded-2xl** als Default für Cards/Buttons (keine rechteckigen Cards)
- **Weiche, mehrschichtige Shadows**

## Ziel-Niveau (visuell)

Bento.me, Cal.com, Linear, Raycast, Vercel, Arc Browser, Framer.

**Nicht:** Default-Bootstrap, Default-shadcn-Demo, generische Listen.

## Theming-Architektur (zweistufig)

- **Ebene 1 — globale Design-Tokens (statisch):** aus tweakcn.com exportiert, in `src/app/globals.css` (--background, --foreground, --radius, --shadow-* etc.). Single Source of Truth.
- **Ebene 2 — per-User-Accent (dynamisch):** nur `--accent` wird pro Public-Page überschrieben (inline style auf `<html>` oder Layout-Wrapper).

**Nur `--accent` ist dynamisch.** Alles andere bleibt statisch aus tweakcn.

## Sicherheit bei dynamischen CSS-Werten

- **Validierung als 6-stelliger Hex-String:** `/^#[0-9a-f]{6}$/i`
- **NIEMALS als raw CSS, style-String oder Inline-Expression** akzeptieren
- **Rendering nur als CSS-Variable** (`--accent: #rrggbb`), nicht als style-Injektion
- **Validation client-side (Form) UND server-side** (Server Action / DB-Insert)
