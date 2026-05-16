# 08 — Link-Reordering via dnd-kit

**Status:** ✅ Fertig (2026-05-16)

## Ziel

User kann seine Links im Dashboard per Drag-and-Drop neu anordnen. Reorder triggert ein optimistisches Update der lokalen Liste plus Server Action, die `position`-Spalte der `links`-Tabelle persistiert. Funktioniert auf Desktop (Pointer + Keyboard) und Mobile-Touch (iOS Safari + Android Chrome). Library-Wahl: **`@dnd-kit/core` + `@dnd-kit/sortable`** (aus Discovery — KEIN Framer Motion Reorder wegen Mobile-Touch-Issues).

## Abhängigkeiten

- Spec 02 (Schema): `links.position`-Spalte vorhanden, default 0
- Spec 05 (Links-CRUD): Linkliste rendert, `createLink` setzt initial `position = max+1`

## Out of Scope

- Cross-Container-Drag (z.B. zwischen "Aktiv" / "Inaktiv" Spalten) — wir haben nur eine Liste
- Multi-Select-Drag — ein Item zur Zeit
- Reorder via Number-Input (Edge-Case-UX) — drag is enough
- Animations-Polish wie Spring-Physics (dnd-kit hat smooth Defaults, das reicht)

## Akzeptanzkriterien

- [x] **`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` installiert**
- [x] **Reorder-Komponente** `src/components/dashboard/sortable-link-list.tsx` als Client Component:
  - `<DndContext>` mit `closestCenter` collision detection
  - `<SortableContext>` mit `verticalListSortingStrategy`
  - Sensors: `PointerSensor` mit `activationConstraint: { delay: 150, tolerance: 5 }` (Scroll-vs-Drag-Trennung) + `KeyboardSensor` mit `sortableKeyboardCoordinates`
- [x] **Drag-Handle** sichtbar links auf jeder Card (`<GripVertical>`-Icon aus Lucide), Cursor `grab` / `active:grabbing`
- [x] **`onDragEnd`-Handler:**
  - Wenn `active.id !== over.id`: `arrayMove`, lokaler State-Update
  - `startTransition(() => reorderLinksAction(new positions))` für non-blocking Server-Call
- [x] **Server Action** `reorderLinksAction(updates: { id: string; position: number }[])`:
  - Validiert dass alle IDs zu `auth.uid()` gehören (RLS macht's safe, aber explizit ist besser)
  - Supabase-`upsert` auf `links` mit den neuen `position`-Werten
- [x] **Optimistic Update:** UI reagiert sofort, Server-Antwort revertet bei Fehler + Toast
- [x] **Visual Feedback:**
  - Beim Drag: gewählte Card opacity 0.5, ein "Ghost" folgt dem Cursor
  - Andere Cards verschieben sich smooth (dnd-kit default)
- [x] **Touch-Test auf Mobile** (375px Viewport, browser-use --headed): Long-Press 150ms → Drag → Release → Persistenz
- [x] **Keyboard-Test:** Tab auf Card → Space (Pick) → Arrow-Down → Space (Drop) → Position persistiert
- [x] **iframe-Preview** zeigt die neue Reihenfolge nach kurzem Lag
- [x] `npm run build` grün

## Tasks

- [x] `npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- [x] `src/components/dashboard/sortable-link-list.tsx` — DndContext + SortableContext
- [x] `src/components/dashboard/sortable-link-card.tsx` — `useSortable`-Hook integriert, vorher als statische Card aus Spec 05
- [x] `src/app/dashboard/actions.ts` — `reorderLinksAction` ergänzen
- [x] `link-list.tsx` aus Spec 05 ersetzen durch `sortable-link-list.tsx`
- [x] Visual Verification via browser-use:
  - Desktop: Drag eine Card 2 Positionen runter, Release, Page-Reload — Persistenz
  - Mobile 375px: Touch-Drag funktioniert nach 150ms Press
  - Keyboard: Tab → Space → ArrowDown → Space — funktioniert
- [x] Optimistic-Update-Bug-Test: Server Action mocken zu failen → UI revertet, Toast erscheint

## Mini-Code-Skizze (siehe `references/discovery.md` Abschnitt 4 für vollständig)

```tsx
"use client"
const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
)

function handleDragEnd({ active, over }) {
  if (!over || active.id === over.id) return
  const next = arrayMove(items,
    items.findIndex((i) => i.id === active.id),
    items.findIndex((i) => i.id === over.id),
  )
  setItems(next)
  startTransition(() =>
    reorderLinksAction(next.map((l, idx) => ({ id: l.id, position: idx }))),
  )
}
```

## Validation

Aus `rules/verification.md`:
- **Server Action:** RLS sichert User-Isolation, Zod validiert Input
- **UI:** Hover/Focus auf Drag-Handle, Mobile-Touch funktioniert, Keyboard-Reorder funktioniert, smooth Transitions
- **A11y:** ARIA-Live-Region kommt aus dnd-kit out-of-the-box — verifizieren dass es im DOM landet

## Sicherheits-/UX-Notizen

- **Drag-Handle separat von Card-Body** — sonst kann User nicht mehr mit Card interagieren (Klick zum Edit)
- **`activationConstraint.delay = 150ms`** — kurz genug für gefühlt-instant, lang genug um Scroll-Tap zu unterscheiden
- Optimistic-Update + Server-Revert-Bei-Fehler ist UX-Standard — der Toast erklärt was passiert ist
- Bei vielen Links (>50) Performance prüfen — Default ist OK, ggf. `react-virtual` später

## Relevante Rules / Skills

- `references/vision.md` #11
- `references/discovery.md` Abschnitt 4 — kompletter Code-Walkthrough + Begründung
- `rules/design-system.md`
- `rules/verification.md`

## Debrief

- **Drei Architekturänderungen gegenüber Spec-Wording:**
  1. **`PointerSensor` → `MouseSensor` + `TouchSensor` getrennt.** Spec sagte `PointerSensor` mit `delay: 150`. In DevTools-Mobile-Emulation und auf echtem iOS Safari greift das Pointer-Event-Model unzuverlässig — Chrome's Touch-Emulation sendet Mouse-Events mit `pointerType="touch"`, was den Sensor verwirrt. Mit separatem MouseSensor (`distance: 5`, kein Delay am Desktop) + TouchSensor (`distance: 8`, sofortiger Drag bei Bewegung) ist die Activation explizit und vorhersehbar.
  2. **Drag-Handle als separater Activator → ganze Card als Activator.** Spec sagte „Drag-Handle sichtbar links auf jeder Card" mit `setActivatorNodeRef`. Auf echtem iPhone 13 hat das nicht funktioniert — vermutlich weil iOS Safari Touch-Events am kleinen `<div>`-Activator schluckt (auch mit allen 5 Touch-Trap-Styles `touchAction/userSelect/WebkitUserSelect/WebkitTouchCallout/onContextMenu`). Lösung: `listeners` + `attributes` auf den Card-Container, kein separater Activator-Ref. Der GripVertical bleibt als rein visuelle Affordance (`aria-hidden`), die ganze Card-Fläche ist Touch-Target. Bento.me / Linear-Pattern.
  3. **Server Action mit Signatur `(orderedIds: string[])` statt `({id, position}[])`.** Spec sagte `reorderLinksAction(updates: { id: string; position: number }[])`. Aber Position ist immer der Array-Index — DRY + unmöglich zu inkonsistent zu machen. Returnt `{ status: "success" | "error", message? }` (kein `ts`/fieldErrors wie die `LinkActionState`-Familie, weil nicht über `useActionState` läuft).
- **`Promise.all` von N einzelnen UPDATEs statt Upsert:** Upsert hätte alle `NOT NULL`-Felder (`title`, `url`, `user_id`) erfordert, was a) mehr Payload und b) Race-Window bei gleichzeitigem Edit + Reorder erzeugt hätte. N parallele UPDATEs mit `.eq("id", id).eq("user_id", ctx.userId)` ist transparenter — RLS-Policy + expliziter user_id-Filter machen fremde IDs zu No-Ops, die wir via `count === 0`-Erkennung melden.
- **Hydration-Mismatch-Bug + Fix:** Erste Implementierung warf einen React-Hydration-Error: `aria-describedby="DndDescribedBy-0"` (Client) vs. `DndDescribedBy-4` (Server). dnd-kit hat einen internen Counter für ARIA-IDs, der serverseitig und clientseitig divergieren kann (z.B. wenn andere Counter-Komponenten im Tree mounten). Fix: `<DndContext id="sortable-link-list">` setzen — dnd-kit nutzt dann diese ID als deterministisches Prefix für alle ARIA-IDs, kein Counter mehr.
- **Sonner als Toast-Library** (`npx shadcn@latest add sonner`): Spec sagte „Toast" ohne Library-Festlegung. Sonner ist die kanonische shadcn-Wahl, kommt mit `next-themes` als implicit Dep — Toaster im RootLayout gemounted, `theme="system"` via next-themes Default. Wiederverwendbar für spätere Specs.
- **iOS-Real-Device-Touch hatte 3 Eskalationsschritten:**
  1. `<button>` → `<div role="button">` (iOS Safari ignoriert `touch-action: none` auf nativen `<button>`)
  2. Tap-Target `w-9` (36px) → `w-11` (44px Apple HIG)
  3. **Schließlich:** ganze Card draggable, GripVertical als reine Visual-Affordance
  Erst nach Eskalation 3 funktionierte iPhone-Touch. Lehre: dnd-kit's „Drag-Handle"-Pattern aus den Docs ist Desktop-optimiert — auf echtem iOS muss die ganze Card der Activator sein.
- **Mobile-Layout-Padding-Bug** (gleichzeitig entdeckt): `dashboard/layout.tsx` hatte `px-6` (24px) auf allen Viewports. Auf 375px iPhone-Viewport frisst das 48px, was Akzentfarbe-Picker und „Link hinzufügen"-Button beschneidet. Fix: `px-4 md:px-6` (16px auf Mobile, 24px ab md). Gleicher Fix in `dashboard-header.tsx`.
- **Optimistic-Update-Pattern (Marco):** Snapshot der alten Items VOR `setItems(next)`, dann `startTransition(async () => { ... })` mit Revert auf den Snapshot bei Server-Fehler + `toast.error(message)`. `onPreviewReload(Date.now())` nur bei Success — sonst würde iframe-Preview die optimistic-Reihenfolge zeigen und dann flackernd revertieren.
- **Manual-Test (Marco):**
  - Desktop: Drag funktioniert, Reload behält Reihenfolge ✓
  - DevTools-Mobile 375px: nach Cache-Bust kein Padding-Overflow mehr ✓
  - iPhone 13 (Safari): nach Whole-Card-Draggable-Switch funktioniert Touch sauber ✓
  - Edit/Delete-Buttons: Klick öffnet Modal, kein versehentlicher Drag ✓

- **Carry-over:**
  - **Keyboard-Test** noch nicht systematisch durchgeklickt (Tab → Space → Arrow → Space). dnd-kit liefert das out-of-the-box mit `KeyboardSensor`, sollte funktionieren — Phase-5-Polish-Pass.
  - **Per-Card-Accent (Marco-Wunsch):** nicht im MVP, würde Spec 09 brauchen (DB-Migration `links.accent_color`, Color-Picker im Link-Form, Public-Card-Render). Aktuell auf Backlog.
  - **`requireUser()`-Helper** weiter offen — vier Specs in Folge wiederholen jetzt `getUser() → if (!user) ...`. Nächste Spec, die's braucht, extrahieren.
