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

## Microinteractions (Single Source of Truth)

Drei Patterns, die konsistent durch die App laufen. Entweder überall oder nirgends — nicht selektiv.

### 1. Card-Hover-Lift

Für klickbare Card-ähnliche Elemente (Public-LinkList, Dashboard-SortableLinkCard).

```
transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0
```

- **`-translate-y-0.5`** = 2px Lift. 4px (`-translate-y-1`) wirkt aufdringlich.
- **`shadow-md`** auf Hover ergänzt den Lift visuell. Default-Shadow bleibt subtil oder gar nicht.
- **`active:translate-y-0`** = Press-Down beim Klick → Tactile-Feedback.

### 2. Focus-State (Pflicht auf jedem interaktiven Element)

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background
```

- `focus-visible:` statt `focus:` — Ring nur bei Keyboard-Navigation, nicht bei Mouse-Click.
- Auf Accent-farbigen Elementen: `--tw-ring-color: var(--accent)` per inline style.

### 3. Color-Transition (Buttons, Links, Hover-Color-Changes)

```
transition-colors duration-150
```

Schneller als Card-Lifts (150ms statt 200ms) — Farb-Änderungen sollen unmittelbar wirken.

## Accessibility — Reduced Motion

`@media (prefers-reduced-motion: reduce)` in `globals.css` setzt **alle** Transition- und Animation-Durations auf 0.01ms zurück. Das ist die System-Setting-Respekt-Variante:

- macOS: System Settings → Accessibility → Display → Reduce Motion
- iOS: Settings → Accessibility → Motion → Reduce Motion
- Windows: Settings → Accessibility → Visual effects → Animation effects off

Komponenten brauchen **keine** eigenen `motion-reduce:`-Tailwind-Variants — der CSS-Override greift global. Animations wie die Background-Orbs müssen die Media-Query explizit prüfen (sonst läuft die Framer-Motion-`animate`-Loop weiter).

## Tap-Target-Minimum

44×44px laut iOS HIG + WCAG 2.2. Button-Sizes in `button.tsx`:

- `default`: h-10 (40px) — knapp drunter, ok für sekundäre Actions auf Desktop-fokussierten Surfaces
- `lg`: h-11 (44px) — exakt Minimum, **Default für mobile primary CTAs**
- `sm`: h-7 — nur in Toolbars / Headers, nicht für primäre Touch-Aktionen
- `icon`: size-10 (40px), `icon-lg`: size-11 (44px)

Wenn ein Hit-Target kleiner als 44px ist, MUSS er entweder padding-vergrößert oder explizit als Desktop-only markiert werden.
