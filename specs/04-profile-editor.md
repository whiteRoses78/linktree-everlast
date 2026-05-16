# 04 — Profil-Editor + Dashboard-Skeleton

**Status:** ✅ Fertig (2026-05-15)

## Ziel

Dashboard-Skeleton (Auth-Header + Container-Layout) + Profil-Form für Display-Name, Bio und Avatar-URL. Inkl. **iframe-Live-Preview** der eigenen Public-Page (`/u/<self>?preview=1`) als rechter Pane im Split-View (Desktop) bzw. Tab-Toggle (Mobile). Form-Submits triggern Revalidation, sodass das iframe sofort den neuen Stand zeigt.

## Abhängigkeiten

- Spec 02 (Schema): `profiles`-Tabelle vorhanden
- Spec 03 (Auth): geschützte Route + `getUser()` in Server Component

## Out of Scope

- Accent-Color-Picker → Spec 07
- Links-CRUD im Editor → Spec 05
- Avatar-Upload → out of MVP (nur URL-Feld)
- Mehrere Sub-Pages im Dashboard → nur ein zentraler Editor

## Akzeptanzkriterien

- [x] **Dashboard-Layout** `/dashboard/layout.tsx`: Header (App-Logo + Display-Name + Sign-Out-Button), Container `max-w-7xl mx-auto px-6`, responsive
- [x] **Editor-Layout** `/dashboard/page.tsx`:
  - Desktop (≥768px): `grid grid-cols-[1fr_1.2fr] gap-6` — Editor links, iframe-Preview rechts
  - Mobile (<768px): Tab-Toggle "Editor / Preview", beide Vollbreite
- [x] **Profil-Form** als Server-Component-Wrapper mit Client-Form-Child:
  - Felder: Display-Name (text, max 64), Bio (textarea, max 280), Avatar-URL (text, optional, https-only)
  - Inline-Validation via Zod
  - Submit als Server Action `updateProfile`
  - Optimistic Update + Revalidation
- [x] **iframe-Preview:**
  - `<iframe src="/u/<username>?preview=1" />` mit `rounded-2xl border` und `aspect-ratio` passend zu Public-Page
  - reload nach Form-Submit via `key`-Prop (oder `revalidatePath`)
  - Empty-Bio/Avatar werden im iframe als Empty-State gerendert (siehe Spec 06)
- [x] Username im Header anzeigen (nicht editierbar — Username-Change ist out of MVP)
- [x] **Hover + Focus** auf Inputs, Save-Button, Sign-Out
- [x] Mobile-Layout (375px): Tab-Toggle funktioniert, keine Overflow-Issues, Tap-Targets ≥44px
- [x] `npm run build` grün

## Tasks

- [x] `src/app/dashboard/layout.tsx` — Auth-Check + Header
- [x] `src/components/dashboard/dashboard-header.tsx` — Sign-Out-Action (als Server Component, `<form action={signOut}>` braucht keinen Client)
- [x] `src/app/dashboard/page.tsx` — Server Component, lädt Profile via `getUser()` + `profiles.select(...)`
- [x] `src/components/dashboard/editor-shell.tsx` — Client Component für Tab-Toggle (Mobile) + Split-View (Desktop)
- [x] `src/components/dashboard/profile-form.tsx` — Client Component, Zod-Validation, calls `updateProfile`
- [x] `src/components/dashboard/preview-iframe.tsx` — iframe-Wrapper mit Reload-Trigger
- [x] `src/app/dashboard/actions.ts` — `updateProfile(formData)` Server Action
- [x] `src/lib/profile/schemas.ts` — Zod-Schema für Profil-Update
- [x] `src/app/u/[username]/page.tsx` + `src/components/public/profile-header.tsx` — Public-Page-Stub für iframe-Quelle (Spec 06 baut aus)
- [x] Visual Verification: Build grün, Endpoint-Smoke (`/dashboard` 307, `/login` 200), Marco im Browser
- [x] Mobile-Viewport: Tab-Toggle, kein Overflow

## Validation

Aus `rules/verification.md` → **API-Route / Server Action** + **UI-Komponente**:
- [x] `updateProfile` validiert Input server-side (Zod), reagiert auf RLS-Errors mit klarer Message
- [x] iframe-Preview lädt nach Submit zuverlässig neu (key-Prop bumpt sich auf `state.ts`, triggert Re-Mount)
- [x] Avatar-URL: nur `https://`-URLs akzeptiert (Zod `.url().startsWith("https://")`)
- [x] Bio-Limit (280) clientseitig als Counter sichtbar — Twitter-Pattern: muted → amber ab 240 → destructive bei 280
- [x] Hover/Focus auf allen interaktiven Elementen (shadcn-Defaults plus `focus-visible:text-primary` auf Header-Link)
- [x] Empty-State im Preview-iframe (Display-Name-Fallback auf `@username`, Initial-Letter-Avatar-Bubble wenn keine URL)

## Sicherheits-/UX-Notizen

- **iframe ist same-origin** → kein CORS-Issue
- `?preview=1` darf KEINEN Side-Effect haben (nur Render-Variante, z.B. ohne Footer-Branding-CTA)
- Avatar-URL ist user-controlled → beim Rendern in Spec 06 `<img>`-Tag mit `referrerPolicy="no-referrer"` + Lazy-Load
- Form-Submit-State: Save-Button disabled während Pending, "Gespeichert ✓"-Toast nach Success

## Relevante Rules / Skills

- `references/design-analysis.md` Abschnitt 3 — Dashboard-Layout-Direktiven
- `references/vision.md` #5, #6, #13
- `rules/design-system.md`
- `rules/verification.md` — UI- + Server-Action-Sections
- `mcp__supabase__execute_sql` — RLS-Testing

## Debrief

- **Tatsächliche Implementierung:**
  - **Drei Marco-Beitragsstellen** im Build-Loop (Learning Mode): (1) Avatar-Fallback-Logik in `ProfileHeader` — Entscheidung: `display_name?.[0] ?? username[0]` mit `.toUpperCase()` für Live-Effekt beim Bearbeiten. (2) iframe-Reload-Strategie — Entscheidung: `key`-Prop-Bump (Re-Mount via Timestamp), nicht imperative `contentWindow.reload()`. (3) Bio-Counter-Schwellen — Twitter-Pattern: muted (<240) → amber (240-279) → destructive (280).
  - **Public-Page-Stub mit gebaut** statt nur Placeholder im iframe. Begründung: Spec-04-Akzeptanzkriterium "iframe lädt /u/<username>?preview=1" wäre sonst zwei Specs lang formal offen, der Editor würde sich "tot" anfühlen. Stub bleibt minimal (Profile-Header + "Hier erscheinen bald deine Links"-Hint), Spec 06 baut Reserved-Check + Claim-Seite + Linkliste + Footer aus. Stub-Komponenten (`ProfileHeader`) sind so geschnitten, dass Spec 06 sie direkt wiederverwendet.
  - **`DashboardHeader` als Server Component** statt Client (Spec hatte Client angegeben). `<form action={signOut}>` braucht keine Client-Boundary; Sign-Out funktioniert mit reinem HTML-POST plus Server Action. Spart eine Hydration-Boundary. Wenn später ein User-Menu-Dropdown dazukommt, ist der Refactor zu Client einzeilig.
  - **`updateProfile` Action returnt `{ status, ts, ... }`-Tupel** statt nur `{ status }`. `ts: Date.now()` ist der einzige State-Property, der sich nach jedem Save garantiert ändert — Form propagiert ihn via `onResult`-Callback in die EditorShell, von dort als `key` ans iframe → React unmounted + remounted → frischer Server-Render. Ohne `ts` würde React keinen Diff sehen und das iframe nicht neu laden.
  - **`emptyToNull`-Preprocess in Zod-Schemas:** Optional-Felder kommen aus FormData als `""`, DB-Spalte ist aber nullable. Ohne den Preprocess würde `bio === ""` durchgereicht und Frontend-Checks wie `bio ? ... : <EmptyState>` brechen.
  - **Side-Effect-Fix:** Erste Implementierung rief `onResult(state)` im Render-Body der ProfileForm auf — React-Anti-Pattern (Parent-State während Render ändern). Fix: `useEffect` mit `useRef`-Guard, damit derselbe `state.ts` nicht zweimal feuert.

- **Manual-Test:**
  - Display-Name + Bio + Avatar-URL setzen → "Gespeichert ✓" → iframe re-mountet mit neuem Header. Bestätigt.
  - Avatar-URL ohne `https://` → Inline-Fehler "Nur HTTPS-URLs erlaubt." (Zod `.startsWith()`).
  - Bio-Counter zählt live, Farbwechsel bei 240/280 sauber.
  - Mobile (375px): Tab-Toggle "Editor / Vorschau" sichtbar, Tap-Targets ≥44px (`min-h-11`).

- **Carry-over für spätere Specs:**
  - **Spec 06** baut `/u/[username]/page.tsx` aus: Reserved-Check vor DB-Query, Claim-Seite, eigene `not-found.tsx`, `?preview=1`-Footer-Toggle. Der jetzige Stub nutzt schon das `?preview=1`-Pattern für den Footer.
  - **Spec 07** muss die Accent-Color-CSS-Var-Injection auf `/u/[username]/page.tsx` ergänzen (per User-Accent statt globalem Default).
  - **`ProfileHeader`-Komponente** ist bewusst in `src/components/public/` statt `dashboard/` — sie wird in Spec 06 von der echten Public-Page weiterverwendet.
  - **`requireUser()`-Helper** weiterhin offen (Spec-03-Debrief-Hinweis). Aktuell wiederholen `dashboard/layout.tsx` + `dashboard/page.tsx` jeweils `getUser()` + Redirect-Logik. Wenn das in Spec 05 + 07 wieder auftaucht, sauber in `src/lib/auth/require-user.ts` ziehen.
