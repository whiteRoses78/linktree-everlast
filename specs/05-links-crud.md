# 05 — Links-CRUD

**Status:** ✅ Fertig (2026-05-15)

## Ziel

CRUD für Links im Dashboard-Editor: User kann Links anlegen, lesen, editieren, löschen. Jede Aktion triggert Revalidation, sodass der iframe-Preview (Spec 04) sofort den neuen Stand zeigt. Reordering kommt erst in Spec 08 — hier wird statisch nach `position ASC, created_at ASC` sortiert.

## Abhängigkeiten

- Spec 02 (Schema): `links`-Tabelle + RLS-Policies
- Spec 03 (Auth): User-ID via `getUser()`
- Spec 04 (Dashboard-Skeleton): Editor-Layout vorhanden, iframe-Preview reagiert auf Revalidate

## Out of Scope

- Drag-and-Drop-Reordering → Spec 08
- Soft-Delete mit Undo → Hard-Delete mit Confirm reicht
- Link-Aktivierung-Toggle UI (DB-Spalte `is_active` ist da, UI für Toggle aber out of MVP — alle erstellten Links sind aktiv)
- Bulk-Operations
- Embed-Link-Typen (Spotify, YouTube) — Vision #3

## Akzeptanzkriterien

- [x] **Linkliste** in `editor-shell.tsx` unter dem Profil-Form: Card-Stack, sortiert `position ASC, created_at ASC`, leerer Zustand zeigt Empty-State-Card mit "Ersten Link hinzufügen"-CTA
- [x] **"Link hinzufügen"-Button** prominent am Top der Liste (Outline-Style mit Plus-Icon); Klick öffnet Modal mit Form (Title + URL)
- [x] **Edit:** Klick auf Bleistift-Icon öffnet Modal-Dialog mit vorausgefüllten Feldern (verifiziert von Marco)
- [x] **Delete:** Trash-Icon-Button auf jeder Card, Klick öffnet AlertDialog ("Diesen Link löschen?") mit Link-Titel im Text (verifiziert von Marco)
- [x] **Server Actions** in `src/app/dashboard/actions.ts`:
  - `createLink(formData)` — INSERT mit `position = max(position)+1`
  - `updateLink(linkId, formData)` — UPDATE mit doppeltem RLS-Check (Policy + explicit `user_id`-Filter)
  - `deleteLink(linkId)` — DELETE mit `count: "exact"` + count-0-Check
- [x] **Validation:** `title` (text, 1-64 chars, trim), `url` (string, `.url()` + `.startsWith("https://")`, max 2048)
- [x] **iframe-Preview** reagiert sofort nach jeder Aktion (revalidatePath + zentraler `reloadKey`-Bump via `onPreviewReload`)
- [x] **Visual:** Card-Hover-Lift (`hover:shadow-sm`), Tap-Targets ≥44px (`h-11 w-11` auf Icon-Buttons), Edit-Button mit `hover:text-foreground`, Delete-Button mit `hover:bg-destructive/10 hover:text-destructive`
- [x] **Empty-State** wenn keine Links: zentrierte Card mit dashed Border + Heading + Sub-Copy + CTA-Button (verifiziert von Marco)
- [x] Mobile-Viewport (375px) ohne Overflow (verifiziert von Marco)
- [x] `npm run build` grün

## Tasks

- [x] `src/components/dashboard/link-list.tsx` — **Client Component** (Spec hatte Server vorgesehen — Modal-State + Edit-Trigger leben drin, Composition mit Client-EditorShell wäre via `children`-Prop unnötig komplex)
- [x] `src/components/dashboard/link-card.tsx` — Card mit Edit/Delete-Trigger-Buttons (Lucide-Icons)
- [x] `src/components/dashboard/link-form.tsx` — Client Component, `mode: "create" | "edit"`, action via `.bind()`
- [x] `src/components/dashboard/delete-link-dialog.tsx` — shadcn-AlertDialog-Wrapper, `useActionState(deleteLink.bind(null, link.id))`
- [x] `src/app/dashboard/actions.ts` — `createLink`, `updateLink`, `deleteLink` mit gemeinsamem `requireLinkContext()`-Helper
- [x] `src/lib/links/schemas.ts` — Zod (`LinkTitleSchema` mit `.trim()`, `LinkUrlSchema` mit `.url()`+`.startsWith()`)
- [x] Empty-State-Card mit Default-Copy ("Noch keine Links / Leg deinen ersten Link an ..."), TODO-Block für Marco-Tone-Tweak im Code
- [x] `src/components/public/link-list.tsx` + `/u/[username]/page.tsx`-Erweiterung — Stub-Renderer für Public-Page (Spec 06 baut Premium-Hover + Footer aus)
- [x] Visual Verification: Marco hat Create / Edit / Delete / HTTPS-Validation / Mobile-Layout durchgeklickt — alles funktioniert
- [x] Mobile-Layout-Check via DevTools 375px — kein Overflow

## Validation

Aus `rules/verification.md`:
- **Server Action:** Zod-Validation, Status-Codes via thrown Errors, RLS-Restricted (User kann nicht fremde Links manipulieren — RLS-Test im Build-Loop)
- **UI:** Hover/Focus, Mobile-Tap, Empty/Loading/Error rudimentär, Transitions
- **Confirm-Dialog vor Delete** ist UX-Pflicht — kein One-Click-Delete

## Sicherheits-/UX-Notizen

- **URL-Validation:** `z.string().url().startsWith("https://")` — keine `javascript:`, `data:`, etc.
- Bei `updateLink`/`deleteLink`: NIE die `linkId` aus URL-Query oder Form unvalidated annehmen — RLS-Policy `auth.uid() = user_id` ist Last-Line-of-Defense
- Optimistic-Update: lokaler State-Refresh nach Submit, Server-Action im `startTransition`
- Error-Toast bei Server-Fehlern (shadcn `sonner`), Retry-Button

## Relevante Rules / Skills

- `references/vision.md` #3
- `references/design-analysis.md` — Empty-State-Direktiven, Card-Layout
- `rules/design-system.md`
- `rules/verification.md`
- `superpowers:test-driven-development` — für die 3 Server Actions

## Debrief

- **Tatsächliche Implementierung:**
  - **`action.bind(null, linkId)` als Pattern für ID-gebundene Server Actions:** `updateLink` + `deleteLink` brauchen die `linkId` als ersten Param. Statt `formData.get("id")` zu nutzen (manipulierbar im Browser), binden wir `linkId` server-side via `action.bind()`. Resultat ist eine `(prev, formData) => Promise<state>`-Signatur, die `useActionState` direkt nimmt.
  - **Dialog-Mount-Pattern für State-Reset:** Edit-Dialog rendert `<LinkForm>` nur wenn `editingLink !== null`. Damit wird `useActionState` für jeden Edit-Vorgang frisch initialisiert — sonst würden alte Field-Errors vom vorherigen Link sichtbar bleiben.
  - **`useActionState` v19 returnt `[state, action, isPending]` als 3-Tupel:** Im DeleteLinkDialog nutzen wir das `isPending` direkt zum Disable von Cancel- und Confirm-Button + Modal-Close-Block. Spart `useFormStatus` + `<form>`-Wrapper-Boilerplate.
  - **`requireLinkContext()`-Helper zentralisiert Auth+Profile-Lookup:** Alle drei Link-Actions brauchen User-ID UND Username (für `revalidatePath`). Helper macht beide Queries, returnt Discriminated-Union (`{ ok: true, ... }` vs. `{ ok: false, error }`). Hätte als generischer `requireUser()` extrahiert werden können (Spec-04-Debrief-Hinweis), aber spezifisch für Links bleibt der Helper für jetzt im actions.ts.
  - **Zentraler `reloadKey`-Bump via `onPreviewReload(ts)`:** EditorShell hält den `reloadKey`, übergibt `bumpReload` an LinkList als `onPreviewReload`. ProfileForm bekommt denselben State via separater `onResult`-API (legacy aus Spec 04). Drei verschiedene Link-Actions (create/update/delete) feeden alle in denselben Trigger → iframe-Preview re-mountet einmal pro Aktion.
  - **`count: "exact"` bei DELETE:** Supabase returnt sonst keinen count, und wir können nicht zwischen "Link gehörte nicht mir" (RLS-gefiltert) und "Link existiert nicht" unterscheiden. Mit `count: "exact"` und `count === 0`-Check bekommen wir eine sprechende Error-Message — gleichzeitig leakt das **nicht** existenz vs. ownership, weil der User in beiden Fällen denselben Text sieht.
  - **Position-Strategie (MVP-pragmatisch):** `SELECT max(position) ... + 1` als zwei Statements. Race möglich (zwei gleichzeitige Inserts kriegen dieselbe Position), aber kein UNIQUE-Constraint auf `(user_id, position)`. Spec 08 (dnd-kit) baut Reordering eh aus — bis dahin akzeptabel.
  - **Zod 4 `ZodIssue.path`-Type:** Build-Error beim ersten Versuch — `path` ist `PropertyKey[]` (kann `symbol` enthalten), nicht `(string | number)[]`. Helper-Signatur korrigiert auf `readonly PropertyKey[]`. Pattern: nicht selbst typen, Zod-Types via `parsed.error.issues` direkt mit `Parameters<...>` oder structurellem Match annehmen.
  - **shadcn AlertDialog in `<form>` gewrappt:** AlertDialogAction ist üblicherweise mit `onClick` verkabelt. Wir haben es in `<form action={formAction}>` gewrappt — funktioniert sauber, weil `<form>` ein Block-Element ist und der AlertDialogFooter (flex row) den Form-Wrapper transparent durchlässt. Test bestätigt: Layout sauber, Enter-Key triggert Confirm.
  - **Public-Page-LinkList als Stub mit Premium-Wegmarkierungen:** Card-Stack rendert schon mit `min-h-12`, `rounded-2xl`, `target="_blank"` + `rel="noopener noreferrer"`, `focus-visible:ring-2 ring-ring`. Spec 06 baut Tap-Target ≥48px, Hover-Lift mit `translate`, Empty-State-Tone.

- **Manual-Test (Marco):**
  - Create: Modal öffnet → "GitHub" + URL → speichert → Card erscheint + Preview update ✓
  - Edit: Bleistift → Modal mit vorausgefülltem Titel "blech'n'takt" + URL → Speichern → beide Stellen aktualisiert ✓
  - Delete: Trash → AlertDialog "Diesen Link löschen?" mit "Git" im Text → bestätigen → Card weg + Preview update ✓
  - HTTPS-Validation: `http://example.com` → Inline-Error "Nur HTTPS-URLs erlaubt." ✓
  - Mobile (375px): Tab-Toggle Editor/Vorschau, kein Overflow ✓

- **Carry-over für spätere Specs:**
  - **Spec 06** ersetzt `src/components/public/link-list.tsx` durch Premium-Variante (Hover-Lift, Empty-State-Tone, größerer Tap-Target). Stub-Layout-Klassen sind schon Spec-konform — Spec 06 setzt Animations + Empty-State-Copy obendrauf.
  - **Spec 07** (Accent-Color) ändert Link-Card-Styling auf der Public-Page — `bg-accent` statt `bg-card`. Im Editor-LinkCard bleibt der Default.
  - **Spec 08** (Drag-and-Drop) wraps `<LinkCard>` mit `useSortable` von dnd-kit. Edit/Delete-Buttons müssen Drag-Pointer-Events stoppen (`onPointerDown={(e) => e.stopPropagation()}`) — sonst startet das Touch ein Drag statt Klick. Position-Race-Issue wird durch atomare Reorder-Server-Action gelöst.
  - **`requireUser()`-Helper:** Spec-03-Debrief-Hinweis bleibt offen. Jetzt haben wir auch `requireLinkContext()` als spezifischen Helper. Refactor lohnt sich wenn Spec 07 (User-Accent-Update) den dritten Aufrufer wird.
