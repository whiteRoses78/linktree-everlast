# Changelog

Chronologisches Protokoll der Änderungen am Projekt. Wird nach jedem Feature (Phase 4) ergänzt.

Format pro Eintrag:
```
## YYYY-MM-DD — <Feature/Änderung>

- Was wurde gemacht
- Warum
- Was hat das beeinflusst
```

---

## 2026-05-12 — Spec 01: Design-Tokens

- **Was:** Globale Design-Tokens in `src/app/globals.css` definiert (Light Mode default, Indigo-Akzent, Mint-Ring, eigener `--radius-link-pill`). Tokens via `@theme inline` in Tailwind v4 eingehängt. Startseite zeigt Token-Demo mit drei Sektionen: Accent-Override, Pill-Radius, stabiler Border/Ring.
- **Warum:** Single Source of Truth, bevor irgendeine UI-Komponente gebaut wird. Override-fähiger Accent ist Grundlage für Linktree-Public-Pages (Spec 07).
- **Beeinflusst:** Alle künftigen UI-Specs nutzen diese Tokens. ADR-002 in `guidelines.md` dokumentiert die Theming-Architektur (`--accent` dynamisch, alles andere stabil).

## 2026-05-15 — Spec 02: Supabase-Schema + RLS

- **Was:**
  - `accent_color text NOT NULL DEFAULT '#6366f1'` zu `profiles` ergänzt, CHECK-Constraint `accent_color_hex_format` (regex `^#[0-9a-fA-F]{6}$`).
  - Security-Hardening: `EXECUTE` auf `public.rls_auto_enable()` für `anon` + `authenticated` + `public` revoked (REST-Pfad dicht, Event-Trigger `ensure_rls` bleibt aktiv).
  - Redundanten Index `profiles_username_idx` gedroppt (UNIQUE-Index `profiles_username_key` reicht).
  - TypeScript-Types in `src/lib/database.types.ts` neu generiert.
- **Warum:** Schema ist Grundvoraussetzung für Auth (03), Profil-Editor (04), Links (05). `accent_color` schließt die letzte Lücke der Vision (#13, #16-#18). Security-Lints aus `get_advisors` proaktiv adressiert, statt vor Deploy in Phase 6 zu firefighten.
- **Beeinflusst:** Specs 03-08 nutzen `database.types.ts` als Single Source of Truth. RLS-Policies (public read + owner CRUD) sind verifiziert via Smoke-Test (CHECK lehnt invalide Hex/Username ab, Cascade-Delete fegt Profil + Links beim auth.users-Delete).

## 2026-05-15 — Spec 03: Auth (Sign-Up + Sign-In + Sign-Out + Proxy)

- **Was:**
  - SSR-Helpers `src/lib/supabase/{server,client}.ts` mit `getAll/setAll`-Cookie-Pattern (deprecated `get/set/remove` bewusst nicht implementiert).
  - **`src/proxy.ts` statt `middleware.ts`** — Next 16 hat die File-Convention umbenannt (Rename, sonst gleiche Semantik). Session-Refresh via `supabase.auth.getUser()`, Auth-Guard für `/dashboard/**` mit `?next=`-Param, Reverse-Guard für `/login` + `/signup`.
  - Reserved-Words-Liste mit **40 Einträgen** (Spec-Baseline 12 + Service 7 + Routing-Reserven 11 + Auth-Adjacent 6 + Brand-Schutz 4), `isReserved()` case-insensitive via `toLowerCase()`.
  - Zod-Schemas: `UsernameSchema` strikt `min(3).max(30).regex(/^[a-z0-9_]+$/)` ohne `.transform()`, `EmailSchema`, `PasswordSchema` (min 6 Zeichen), zusammengesetzt zu `SignUpSchema` + `SignInSchema`.
  - Server Actions `src/app/(auth)/actions.ts`: `signUp` (Reserved-Check + Pre-Uniqueness-Check + UNIQUE-Race-Fallback + Profile-INSERT-Rollback via signOut), `signIn` (mit Open-Redirect-Schutz `safeNextPath()`), `signOut`.
  - Forms via **React 19 `useActionState`** statt `react-hook-form` (passt 1:1 zu Server Actions, kein Client-State-Management).
  - Dashboard-Stub `src/app/dashboard/page.tsx` als minimaler Smoke-Test-Endpoint.
  - **Korrektur-Migration `restore_table_grants_profiles_links`:** Spec 02 hatte versehentlich alle DML-GRANTs (SELECT/INSERT/UPDATE/DELETE) auf `profiles` + `links` für `anon`/`authenticated`/`service_role` weggeräumt. Tabellen-Permission-Layer fehlte, RLS wurde gar nicht erst evaluiert. Standard-Grants wiederhergestellt.
- **Warum:** Auth ist Voraussetzung für jedes weitere Feature (Profil-Editor, Links-CRUD, Public-Page mit Owner-Erkennung). Open-Redirect-Schutz vermeidet Phishing-Vektor über `?next=//evil.com`. `useActionState` statt `react-hook-form` reduziert Komplexität für simple Auth-Forms.
- **Beeinflusst:**
  - Specs 04+ können `getServerClient()` + `supabase.auth.getUser()` als Pattern voraussetzen.
  - Reserved-Words-Konstante wird in Spec 06 für die Claim-Page-Logik wiederverwendet.
  - GRANT-Korrektur ist die Baseline für alle künftigen Tabellen-Migrations — Pattern jetzt in `learning.md` dokumentiert.
  - **Carry-over Phase 6:** Production-Email-Confirm reaktivieren → erfordert Wechsel auf DB-Trigger oder separaten Onboarding-Flow nach Confirm. Aktueller App-Code-Pfad funktioniert nur mit Email-Confirm AUS.

## 2026-05-15 — Spec 04: Profil-Editor + Dashboard-Skeleton + iframe-Preview

- **Was:**
  - **Dashboard-Layout** `src/app/dashboard/layout.tsx` mit Auth-Check (Defense-in-Depth gegen Proxy), Profile-Lookup für Header, Container `max-w-7xl px-6 py-8`.
  - **`DashboardHeader`** als Server Component (Spec hatte Client vorgesehen — `<form action={signOut}>` braucht aber keine Client-Boundary, spart Hydration). Zeigt App-Logo links, Display-Name/Username rechts, Abmelden-Button. Header-Link mit `focus-visible:text-primary`.
  - **`/dashboard/page.tsx`** komplett umgebaut (Stub aus Spec 03 ersetzt). Lädt Profile via `getServerClient()` + `.single()`, übergibt an Client `EditorShell`.
  - **`EditorShell`** Client Component: Tab-Toggle `<md` (`role="tablist"`, `min-h-11` Tap-Targets), Split-Grid `md:grid-cols-[1fr_1.2fr]`. Hält `reloadKey`-State, der via `onResult`-Callback aus der Form gefüttert wird.
  - **`ProfileForm`** mit `useActionState(updateProfile)`. Felder: Display-Name (`maxLength=64`), Bio (Textarea `maxLength=280` + Live-Counter), Avatar-URL (`type=url`). Inline-Errors aus `state.fieldErrors`. `useFormStatus`-Hook für Pending-Button-State. `useEffect`+`useRef`-Guard propagiert `state.ts` nur einmal pro Save an Parent.
  - **`PreviewIframe`** mit `key={reloadKey}` für Re-Mount nach Save, `aspect-[9/16]` für Phone-Charakter, `sandbox="allow-same-origin"`. Lädt `/u/<username>?preview=1`.
  - **`updateProfile` Server Action** in `src/app/dashboard/actions.ts`: Zod-Validation, `auth.getUser()`-Check, `UPDATE … WHERE id = user.id` (RLS-Policy `profiles_owner_update` greift DB-seitig), returnt `{ status, ts, ... }`-Tupel. `revalidatePath` auf `/u/<username>` + `/dashboard`.
  - **Zod-Schemas** in `src/lib/profile/schemas.ts`: `DisplayNameSchema`, `BioSchema`, `AvatarUrlSchema`, `ProfileUpdateSchema`. `emptyToNull`-Preprocess wandelt `""` aus FormData in `null` — sonst rendert das Frontend later `bio?.length === 0` statt `bio === null`. Avatar-URL doppelt validiert (`.url()` + `.startsWith("https://")`) gegen `data:`/`javascript:`-Schema-Bypass.
  - **Public-Page-Stub** `src/app/u/[username]/page.tsx` + `src/components/public/profile-header.tsx` — gebaut statt Placeholder, damit iframe-Preview ab Tag 1 funktioniert. Stub macht nur DB-Lookup + `notFound()`-Fallback, `?preview=1` toggelt den dezenten "Erstellt mit linktree-app"-Footer. Spec 06 baut Reserved-Check + Claim-Seite + Linkliste + eigene `not-found.tsx` aus, ohne den Stub zu zerlegen.
  - **`ProfileHeader`-Komponente** mit Avatar-Fallback-Logik: bei `avatar_url` → `<img>` mit `referrerPolicy="no-referrer"` + `loading="lazy"`, sonst `<div>`-Bubble mit `display_name?.[0] ?? username[0]` (uppercased) auf `bg-muted`. Gleiche Größenklassen in beiden Branches verhindern Layout-Shift.
  - **shadcn-Textarea** via `npx shadcn@latest add textarea` ergänzt.
- **Warum:** Editor + Live-Preview ist Vision-Kern (#5, #6, #13). Der iframe-Re-Mount via `key`-Prop ist robuster als imperative `contentWindow.reload()` — kein HTTP-Cache-Risiko, weil React den iframe komplett unmountet. `useActionState` + `useFormStatus` matchen das Server-Components-by-default-Prinzip ohne Form-Library-Overhead.
- **Beeinflusst:**
  - Spec 05 (Links-CRUD) kann das `useActionState` + `key`-Prop-Pattern direkt übernehmen — Link-Save sollte denselben `reloadKey`-Mechanismus nutzen.
  - Spec 06 baut auf `ProfileHeader`-Stub auf, ergänzt Linkliste + Footer-Variants + Reserved-Check.
  - Spec 07 muss Accent-Color-CSS-Var-Injection auf `/u/[username]/page.tsx` ergänzen.
  - Pattern „leere Strings aus FormData → null" jetzt in Zod-Helper `emptyToNull` zentralisiert; bei Links-CRUD wiederverwenden.
  - **Carry-over:** `requireUser()`-Helper weiter offen (Spec-03-Debrief). Aktuell wiederholen `layout.tsx` + `page.tsx` jeweils `getUser()`-Redirect. Wenn das in Spec 05/07 nochmal auftaucht, in `src/lib/auth/require-user.ts` ziehen.

## 2026-05-15 — Spec 05: Links-CRUD (Create + Update + Delete)

- **Was:**
  - **Drei Server Actions** in `src/app/dashboard/actions.ts`: `createLink`, `updateLink(linkId, ...)`, `deleteLink(linkId, ...)`. Gemeinsamer Helper `requireLinkContext()` lädt User + Username in einem Aufruf (Username für `revalidatePath`). Alle Actions returnen `{ status, ts, ... }`-Tupel — synchron zum Spec-04-Pattern, damit ein zentraler `reloadKey` alle iframe-Reloads triggert.
  - **`LinkForm`** mit Mode `"create" | "edit"`. Action wird via `.bind(null, linkId)` an die `useActionState`-Maschine übergeben — IDs landen so nicht im FormData (manipulationssicher).
  - **`LinkCard`** als reine Presentational-Komponente mit Title + URL (`truncate`) + zwei Icon-Buttons (Pencil/Trash2 aus Lucide, `h-11 w-11` für Tap-Target ≥44px). Edit-Hover = `text-foreground`, Delete-Hover = `bg-destructive/10 text-destructive`.
  - **`DeleteLinkDialog`** als shadcn-AlertDialog-Wrapper mit `useActionState(deleteLink.bind(null, link.id))`. Nutzt das v19-3-Tupel `[state, action, isPending]` direkt — kein `useFormStatus`-Wrapper, weil Modal-Buttons außerhalb des Forms sitzen (Confirm-Button in `<form>` gewrappt damit Action-Submit greift).
  - **`LinkList`** (Client) hält drei Dialog-States: `createOpen`, `editingLink`, `deletingLink`. Mount-Pattern für State-Reset: Form/Dialog wird nur konditional gerendert (`{editingLink ? <LinkForm ... /> : null}`), damit `useActionState` pro Vorgang frisch initialisiert wird.
  - **`EditorShell`** erweitert: `links`-Prop dazu, LinkList unter ProfileForm via `Separator`. Zentrale `bumpReload(ts)`-Funktion ersetzt das alte `handleResult` — ProfileForm + LinkList feeden in dieselbe Reload-Quelle.
  - **Dashboard-Page** lädt zusätzlich Links via `.from("links").select("id, title, url").eq("user_id", user.id).order("position").order("created_at")`. Übergibt `links ?? []` an EditorShell.
  - **Public-Page-Stub erweitert** um Linkliste-Render: `src/components/public/link-list.tsx` (basic Card-Stack mit `target="_blank"` + `rel="noopener noreferrer"`, focus-visible Ring), Query in `/u/[username]/page.tsx` mit `.eq("is_active", true)`. RLS-Policy `links_public_read` filtert das DB-seitig zusätzlich.
  - **Zod-Schemas** in `src/lib/links/schemas.ts`: `LinkTitleSchema` (trim, 1-64), `LinkUrlSchema` (`.url()` + `.startsWith("https://")` + max 2048).
  - **shadcn-Komponenten** ergänzt: `dialog`, `alert-dialog` (via `npx shadcn@latest add`).
- **Warum:** Links-CRUD ist Linktree-Kern (Vision #3). Modal-Edit + Confirm-Delete trennt destruktive Operationen sauber von der View — Confirm-Dialog ist UX-Pflicht laut Spec. `useActionState`-Pattern aus Spec 04 ein-zu-eins wiederverwendet; LinkList als Client-Component erlaubt drei parallele Dialog-States ohne Server-Roundtrip pro Mount.
- **Beeinflusst:**
  - Spec 06 erbt `src/components/public/link-list.tsx` als Stub-Renderer. Premium-Polish (Hover-Lift mit `translate`, Empty-State-Tone, Tap-Target ≥48px) bleibt für 06.
  - Spec 07 wird Public-LinkList-Cards mit Accent-Background versehen — Stub nutzt `bg-card`, das wird zu `bg-accent` mit `text-accent-foreground`.
  - Spec 08 wrappt `LinkCard` mit dnd-kit `useSortable`. Edit/Delete-Buttons müssen `onPointerDown={(e) => e.stopPropagation()}` bekommen, sonst startet Touch ein Drag statt Klick. Position-Race aus `createLink` wird durch atomare Reorder-Action gelöst.
  - **Carry-over:** `requireLinkContext()` ist link-spezifisch. Wenn Spec 07 (Accent-Update) eine ähnliche User-Profile-Kontext-Lookup-Logik braucht, in `requireUser()` + `requireProfile()` zusammenfassen.

## 2026-05-15 — Spec 06: Public-Profile-Page + Reserved/Claim-Logik

- **Was:**
  - **`src/app/u/[username]/page.tsx`** komplett umgebaut (Stub aus Spec 04 ersetzt). Drei-Wege-Routing mit Early-Returns: `isReserved(username)` → `notFound()` (Phishing-Schutz, kein DB-Hit), sonst `loadProfileWithLinks(username)` → `<PublicProfileView>` ODER `<ClaimView>`. Helper `loadProfileWithLinks()` kapselt den Doppel-Query (profiles + links mit `is_active`-Filter und `position/created_at`-Order). View-Subkomponenten halten den Container-Layout (`max-w-md px-6 py-12`) konsistent zwischen Public + Claim.
  - **`src/app/u/[username]/not-found.tsx`** — eigene 404 mit Messaging „Dieser Profilname ist nicht verfügbar." + zwei CTAs (`/signup`, `/`). Wird automatisch von Next.js bei `notFound()`-Aufruf gerendert.
  - **`src/components/public/claim-card.tsx`** — „Noch frei / @username / Diesen Namen sichern"-Card. CTA-Link `/signup?username=<encodeURIComponent(username)>` triggert den Pre-Fill-Pfad. Bewusst kein aggressives „Join Linktree"-Wording (Spec 06 Out-of-Scope #4).
  - **`src/components/public/page-footer.tsx`** — dezenter „Erstellt mit linktree-app"-Link, returnt `null` bei `isPreview=true` (verhindert Doppel-Branding im Dashboard-iframe).
  - **`src/components/public/link-list.tsx`** Polish: Hover-Lift via `transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md` + `active:translate-y-0`. Empty-State mit warmer Copy („Hier wird's bald spannend.") statt nüchtern „keine Daten".
  - **Sign-Up-Pre-Fill** (`src/app/(auth)/signup/page.tsx` + `sign-up-form.tsx`): SignUpPage liest `searchParams` (Promise!) und übergibt `defaultUsername` an `<SignUpForm>`. Form rendert `<Input defaultValue={defaultUsername}>` — uncontrolled, damit User es überschreiben kann.
  - **`Button asChild` ersetzt durch `buttonVariants()` auf `<Link>`** (3 Aufrufer: ClaimCard-CTA + 2 not-found-CTAs). Der Button-Component dieses Setups basiert auf `@base-ui/react/button`, nicht Radix-Slot — kein `asChild`-Support. Pattern: `<Link className={buttonVariants({ size: "lg", className: "min-h-11 ..." })}>...</Link>`.
  - **Tap-Target-Hardening:** tweakcn-Button hat `size="lg"` = h-9 = 36px, unter dem Mobile-44px-Minimum. CTA-Links in ClaimCard + not-found bekommen `min-h-11` als Override, bis das Theme selbst die Sizes anhebt.
- **Warum:** Public-Profile-Page ist der Linktree-Kern (Vision #1, #4, #10). Die Drei-Wege-Verzweigung ist der Sicherheits-kritische Teil — Reserved-Check VOR DB-Query verhindert, dass `/u/admin` zur Claim-Page mit „Diesen Namen sichern"-CTA wird (Phishing-Vektor). `?preview=1`-Toggle erlaubt iframe-Re-Use ohne doppelten Footer im Dashboard.
- **Beeinflusst:**
  - Spec 07 (Per-User-Accent) hängt sich direkt am Page-Root von `/u/[username]/page.tsx` ein — `style={{ ['--accent']: profile.accent_color }}` als Cast wird der einzige Diff. Public-Linkliste-Cards bekommen dann `bg-accent` + `text-accent-foreground`.
  - Pattern „Cross-Component-Pre-Fill via `defaultValue` aus Server-Component-`searchParams`" jetzt etabliert — wiederverwendbar für jeden Conversion-Pfad mit URL-State.
  - `buttonVariants()`-Helper-Pattern dokumentiert: bei base-ui-Buttons trotzdem konsistente Button-Optik auf Anchors möglich, ohne den Component zu rendern.
  - **Carry-over Polish-Pass:** Theme-Sizes anheben (default h-8 → h-10, lg h-9 → h-11), damit `min-h-11`-Overrides verschwinden und alle Buttons sofort tap-target-konform sind. Aktuell drei explizite Overrides in der Codebase.

## 2026-05-15 — Spec 07: Per-User-Accent + WCAG-Foreground-Switch

- **Was:**
  - **`src/lib/theming/contrast.ts`** — `getRelativeLuminance(hex)` mit WCAG-2.1-Formel (sRGB-Linearisierung + gewichtete Summe nach menschlicher Wahrnehmung). `getForegroundColor(hex)` returnt `"#0a0a0a" | "#ffffff"` mit **Threshold 0.20** (nicht 0.179) — Begründung: Indigo `#6366f1` (L=0.185) lag bei 0.179 knapp im schwarzen Bereich, was bei satten Mid-Range-Blautönen visuell falsch wirkt. 0.20 schiebt Indigo in weiß; Mittelgrau `#888` (L=0.246) bleibt schwarz. WCAG-AA-Coverage fällt von ~95% auf ~94% — akzeptabel.
  - **`AccentColorSchema`** in `src/lib/profile/schemas.ts` — Hex-Regex `^#[0-9a-fA-F]{6}$`, `.transform(toLowerCase)` für Storage-Konsistenz. In `ProfileUpdateSchema` als viertes Feld eingebunden.
  - **`updateProfile`-Server-Action** (`src/app/dashboard/actions.ts`) erweitert: `accent_color` aus FormData, durch Zod, dann ins DB-UPDATE.
  - **ProfileForm Color-Picker** (`src/components/dashboard/profile-form.tsx`): `<input type="color">` mit `pattern`-Attribut + Live-State (`useState`), daneben großer Live-Swatch-Div + Hex-Anzeige in `<code>`-Tag mit `tabular-nums uppercase`. Picker hat eigenes `min-h-12`-Squarish-Layout (`h-12 w-12`) für Tap-Target.
  - **Type-Chain durchgereicht:** `EditorShellProps.initialProfile.accent_color: string` (NOT NULL in DB), Dashboard-Page-Query erweitert um `accent_color`-Spalte, ProfileForm-Props angepasst.
  - **Public-Page-Wrapper** (`src/app/u/[username]/page.tsx`): `loadProfileWithLinks()` selektiert jetzt auch `accent_color`. `PublicProfileView` berechnet `accentStyle` als `CSSProperties`-Object mit `--accent` + `--accent-foreground` (server-side via Helper). Style geht aufs `<main>` — Vererbung deckt das ganze Subtree ab.
  - **LinkList-Rework** (`src/components/public/link-list.tsx`): Erste Iteration hatte Hover-only-Border + 10%-Glow (Spec wortwörtlich). Visual-Verification zeigte: Default-State komplett neutral, Mobile sieht Akzent NIE. Umgebaut zu permanent `style={{ backgroundColor: "var(--accent)", color: "var(--accent-foreground)" }}` — Linktree-Standard, mobile-konform. Hover macht jetzt nur Lift + Shadow.
  - **Edge-Case-Verification via `npx tsx -e`-Skript** statt Test-Framework-Setup: 6 Cases (`#ffffff`, `#000000`, `#ffff00`, `#6366f1`, `#1a1a1a`, `#888888`) — 6/6 pass mit Threshold 0.20.
  - **DB-CHECK-Constraint live verifiziert** via SQL-DO-Block mit EXCEPTION-Handler: `#abc` (zu kurz) und `6366f1` (kein `#`) werden mit `check_violation` abgelehnt, valides Hex (`#ffff00`) akzeptiert. Defense-in-Depth funktioniert.
- **Warum:** Per-User-Accent ist Vision #7 + #16-#18 — der visuelle Kern, der jede Public-Page persönlich macht. Server-side WCAG-Foreground-Switch garantiert Lesbarkeit ohne Client-Roundtrip (kein FOUC). 3-stufige Validation (Pattern + Zod + DB-CHECK) ist Vision #17. Linktree-Standard für Cards (Accent als Background, nicht nur Hover) verbessert Wahrnehmbarkeit drastisch — Hover-only ist auf Mobile unsichtbar.
- **Beeinflusst:**
  - **Spec 08 (dnd-kit-Reordering)** kann jetzt direkt loslegen — keine offenen Architektur-Fragen mehr. Drag-Handle muss aber `pointerDown.stopPropagation()` bekommen, sonst kollidiert es mit dem Card-Click.
  - **MVP visuell komplett:** Public-Page rendert mit Per-User-Branding, Editor hat alle Profile-Felder, Auth + Links + Reserved-Words alle ✅. Spec 08 ist UX-Polish, kein Vision-Block.
  - **Carry-over Polish-Pass:** Optionaler Toast „Diese Farbe ist grenzwertig lesbar" für Hex-Eingaben mit L zwischen 0.18-0.22 (WCAG-AA grenzwertig). Out of MVP, in `learning.md` notiert.

## 2026-05-16 — Spec 08: Link-Reordering via dnd-kit

- **Was:**
  - **`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`** installiert. Zusätzlich `sonner` (via `npx shadcn@latest add sonner`) als Toast-Library, Toaster in `src/app/layout.tsx` mit `position="bottom-right" richColors` gemounted (next-themes als implicit Dep).
  - **`reorderLinks` Server Action** in `src/app/dashboard/actions.ts`: Signatur `(orderedIds: string[]) => Promise<{ status, message? }>` — Position wird vom Array-Index abgeleitet, DRY und unmöglich inkonsistent. Validierung (length 1-200, non-empty Strings, keine Duplikate). `Promise.all` über N parallele UPDATEs mit `.eq("id", id).eq("user_id", ctx.userId)` — RLS + expliziter Filter, fremde IDs No-Op via `count === 0`-Erkennung.
  - **`src/components/dashboard/sortable-link-card.tsx`** — `useSortable`-Wrapper. Drei Iterationen bis iOS-tauglich: (1) `<button>` mit `setActivatorNodeRef` → iOS Safari verschluckt Touch-Events, (2) `<div role="button">` + 44×44px Tap-Target → immer noch unzuverlässig auf echtem iPhone 13, (3) **Whole-Card-Draggable**: `listeners` + `attributes` auf den Card-Container, GripVertical bleibt als `aria-hidden`-Affordance. Edit/Delete-Buttons mit `onPointerDown` + `onMouseDown` stopPropagation. `userSelect`/`WebkitTouchCallout`/`onContextMenu` als kombiniertes Anti-Mobile-Trap-Set.
  - **`src/components/dashboard/sortable-link-list.tsx`** — ersetzt `link-list.tsx`. `DndContext` mit `id="sortable-link-list"` (dnd-kit-internal counter würde sonst Hydration-Mismatch in ARIA-IDs produzieren). Sensors: `MouseSensor` (`distance: 5`, kein Delay), `TouchSensor` (`distance: 8`, sofortiger Drag bei Bewegung statt delay-Activation — robuster auf echtem iOS), `KeyboardSensor`. `SortableContext` mit `verticalListSortingStrategy`. Lokaler `items`-State plus `useEffect`-Sync auf `props.links` (nach Create/Edit/Delete via revalidatePath).
  - **`handleDragEnd` (Marco)**: Snapshot der alten Items, `arrayMove`, optimistic `setItems(next)`, `startTransition` mit `reorderLinks(next.map(l => l.id))`. Bei Error: `setItems(previous)` + `toast.error(message)`. Bei Success: `onPreviewReload(Date.now())`.
  - **Hydration-Fix:** `DndContext id="sortable-link-list"` löst den `DndDescribedBy-X`-Counter-Mismatch zwischen Server und Client (sonst `aria-describedby` Hydration-Warning).
  - **Mobile-Padding-Fix** (parallel entdeckt): `dashboard/layout.tsx` und `dashboard-header.tsx` `px-6` → `px-4 md:px-6`. Auf 375px iPhone-Viewport waren 48px Padding (24px×2) zu viel — Akzentfarbe-Picker und „Link hinzufügen"-Button wurden beschnitten.
  - **Alte Files entfernt:** `link-list.tsx` + `link-card.tsx` (jetzt sortable-Varianten).
- **Warum:** Drag-and-Drop für Links ist Vision #11 — primärer UX-Polish gegenüber Linktree-Originals. Whole-Card-Draggable statt kleiner Handle ist Bento.me/Linear-Standard und touch-robust. Optimistic-Update + Server-Revert ist UX-Standard für asynchrone Reorder-Mutationen (ohne wäre die UI 200-500ms „träge"). Sonner kommt rein für diesen Spec, ist aber wiederverwendbar — Phase 5 Polish kann darauf aufbauen.
- **Beeinflusst:**
  - **MVP funktional komplett.** Alle 8 Specs ✅, Phase 5 (Polish) kann starten — Empty-States mit warmem Tone, Loading-Skeletons, Mobile-Detail-Pass über alle Routes, Theme-Button-Sizes anheben.
  - **Per-Card-Accent (Marco-Wunsch):** als Backlog notiert — wäre Spec 09 mit DB-Migration `links.accent_color`, Color-Picker im Link-Form, Public-Card-Render.
  - **Sonner-Toaster** im RootLayout verfügbar für alle künftigen Error/Success-Toasts (z.B. Polish-Pass-Tooltips, Avatar-Upload-Errors).
  - **Carry-over:** `requireUser()`-Helper noch immer offen — vier Specs in Folge wiederholen `getUser() → if (!user) ...`. Extraktions-Schmerz aber inzwischen niedrig: nächste Spec, die's braucht, extrahieren.
  - **Carry-over Polish-Pass:** Keyboard-Drag (Tab → Space → Arrow → Space) noch nicht systematisch verifiziert — dnd-kit liefert KeyboardSensor out-of-the-box, sollte funktionieren, aber in Phase 5 explizit durchklicken.

## 2026-05-16 — Phase 5: Polish-Pass

- **Was (Welle A — Code-Polish):**
  - **Theme-Button-Sizes** in `src/components/ui/button.tsx` angehoben: `default` `h-8 px-2.5` → `h-10 px-4`, `lg` `h-9 px-2.5` → `h-11 px-6`, `icon` `size-8` → `size-10`, `icon-lg` `size-9` → `size-11`. Padding proportional zur Höhe mitgezogen (sonst sahen die Buttons schmal aus). Die vier `min-h-11`-Overrides aus Specs 04/06 (TabButton in EditorShell, ClaimCard-CTA, beide CTAs in `/u/[username]/not-found.tsx`) sind dadurch obsolet und entfernt.
  - **Loading-Skeletons** als Layout-Mirror: `src/app/dashboard/loading.tsx` (Tab-Toggle + ProfileForm-Felder + Color-Picker-Row + 3 LinkCards + Preview-Iframe-Placeholder) und `src/app/u/[username]/loading.tsx` (Avatar + Name + Bio-Lines + 3 Link-Skeletons). Schließen Layout-Shift beim Content-Load aus. shadcn `Skeleton` via `npx shadcn@latest add skeleton`.
  - **Globale 404 + Error-Boundary:** `src/app/not-found.tsx` für alle Pfade außerhalb `/u/[username]`, mit „Diese Seite gibt es nicht."-Tone + zwei CTAs. `src/app/error.tsx` als globaler Error-Boundary (Client Component, nimmt `error: Error & {digest}` + `reset()`-Props, Browser-Console-Log). Beide stilkonsistent zur bestehenden `/u/[username]/not-found.tsx`.
  - **Microinteractions konsistent:** SortableLinkCard von `hover:shadow-sm` auf `transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0` umgestellt — gleiches Pattern wie Public LinkList. Globaler `prefers-reduced-motion`-Override in `globals.css` (alle animations + transitions auf 0.01ms). `rules/design-system.md` um eine **Microinteractions-Sektion** als Single Source of Truth ergänzt (Card-Hover-Lift, Focus-State, Color-Transition, Tap-Target-Tabelle).

- **Was (Welle B — DSGVO + Footer + noindex):**
  - **Impressum** `src/app/impressum/page.tsx` mit Demo-Disclaimer-Card (border-dashed, bg-muted/40), "Verantwortlich"-Sektion ohne kommerzielle Anbieter-Angabe, "Quellcode & Kontakt" mit GitHub-Repo-Placeholder, "Haftung für Inhalte" nach § 7 Abs. 2 TMG. Eigene `metadata.robots: { index: false, follow: false }`.
  - **Datenschutz** `src/app/datenschutz/page.tsx` als **separate Seite** (DSGVO Art. 13/14 verlangt eigene Erklärung, keine Card im Impressum): Stand-Datum, Demo-Disclaimer, 6 Sektionen (Verantwortlich / Welche Daten / Wo gespeichert / Rechtsgrundlage / Deine Rechte / Änderungen). Supabase + Vercel explizit mit Privacy-Policy-Links. Cascade-Delete im Recht-auf-Löschung erwähnt (das ist echte Architektur-Info, nicht Boilerplate).
  - **Shared Footer** `src/components/footer.tsx`, gemountet im `RootLayout` (immer sichtbar, auch im iframe-Preview — Impressum + Datenschutz sollen von überall erreichbar sein). Links zu Impressum + Datenschutz, "© 2026 linktree-app · Demo"-Tag, focus-visible-Rings. Card-Stil mit `bg-card/30` + `border-t`. `flex-col sm:flex-row` für Mobile-Stacking.
  - **noindex global**: in `src/app/layout.tsx` `metadata.robots: { index: false, follow: false }` gesetzt. Plus `metadata.title.template = "%s · linktree-app"` für saubere Page-Titel. Schiebt Demo-Projekt in TMG/DSGVO-Grauzone für private Lernprojekte.

- **Was (Welle C — Premium-Touch + Visual-Verification):**
  - **Animated Background Orbs** `src/components/public/animated-background.tsx` als Server Component mit drei `<div class="bg-orb">`-Children. Pure CSS-Keyframes (3× `@keyframes bg-orb-drift-*` mit `translate + scale`) in `globals.css` — kein Framer Motion nötig, spart ~50kb. Orbs adoptieren `var(--accent)` und `var(--primary)`, also auf Public-Pages mit Per-User-Accent färben sie sich automatisch passend. Loop 20-26s, `blur(80px)`, opacity 0.15-0.20. Mount in `PublicProfileView` UND `ClaimView`, NICHT im iframe-Preview (`!isPreview`-Guard).
  - **Stacking-Bug-Fix:** `<main className="bg-background relative">` erzeugte Stacking-Context, in dem `-z-10` der Orbs unter dem main-Background lag. Fix: `bg-background` von `main` entfernt (body hat's eh global), Orbs sichtbar.
  - **Visual-Verification via `browser-use --headed`:** Public-Page (mit Orbs), Login, Impressum, Datenschutz, globale 404 sichtgeprüft. Alle Pages rendern clean, Footer überall sichtbar, Demo-Tag im Footer prominent.
  - **Mobile-Detail-Pass:** 1:1-375px-Simulation via browser-use-CLI nicht möglich (keine Viewport-Emulation), aber Layout-Pattern responsive-safe (max-w-md/2xl + mx-auto + px-6 + flex-col sm:flex-row). Tap-Targets: Default-Button 40px / lg-Button 44px / Card-Links 48px Mindesthöhe.

- **Warum:** Polish-Pass schließt drei Lücken aus dem Build-Loop:
  1. **Visuelle Konsistenz** — Dashboard-Cards hatten anderen Hover-State als Public, Buttons hatten 3 verschiedene Tap-Target-Workarounds.
  2. **Rechtliche Pflicht** — ohne Impressum + Datenschutz + Footer wäre Phase 6 Deploy ein DSGVO/TMG-Risiko, selbst für Demo-Projekte.
  3. **Premium-Feel** — Animated Background Orbs nehmen den Per-User-Accent auf und geben jeder Public-Page einen eigenständigen Look ohne extra User-Konfiguration.

- **Beeinflusst:**
  - **MVP feature-complete + polished.** Phase 6 Deploy kann starten — Pre-Push-Token-Check, GitHub-Repo-Push, Vercel-Verknüpfung.
  - **Microinteractions-Doku als SSOT** etabliert in `rules/design-system.md`. Künftige Features nehmen die Werte (translate-y-0.5, duration-200, shadow-md) von dort.
  - **Footer ist im RootLayout**, also auch im iframe-Preview sichtbar (akzeptiert — Impressum sollte überall erreichbar sein). Falls Marco später Footer im iframe ausblenden will: pathname-basierte Detection in einer Client-Wrapper-Component.
  - **Carry-over zu Phase 6 Deploy:**
    - GitHub-Repo-URL im Impressum eintragen, sobald `gh repo create` durch ist.
    - Production-Email-Confirmation reaktivieren (Spec 03 carry-over) — separates Feature nach Deploy.
    - Animated-Background-Orbs auf Production-Performance verifizieren — `blur(80px)` ist GPU-Compositing, sollte ok sein, aber bei Frame-Drops auf low-end Devices ggf. Opacity senken oder Mobile-disable.
