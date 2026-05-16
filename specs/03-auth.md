# 03 — Auth (Sign-Up + Sign-In + Sign-Out + Middleware)

**Status:** ✅ Fertig (2026-05-15)

## Ziel

Email+Passwort-Auth via `@supabase/ssr` in Next.js 15 App Router. Sign-Up mit Username-Claim (Reserved-Words + Uniqueness atomar). Sign-In, Sign-Out, Session-Refresh via Middleware. Geschützte Routes (`/dashboard`) leiten unangemeldete User nach `/login` um; öffentliche Routes (`/`, `/u/[username]`, `/login`, `/signup`) sind ohne Session erreichbar.

## Abhängigkeiten

- Spec 02 (Schema + RLS): `profiles`-Tabelle für Username-Claim, RLS-Policies aktiv

## Out of Scope

- OAuth (Google/GitHub/Apple) — Vision Out-of-Scope
- Magic-Link / Passkey — Vision Out-of-Scope
- Email-Confirmation-Flow für Dev (Confirm-Email AUS, siehe Phase 1 Preflight). Production-Aktivierung in Phase 6 Polish-Pass.
- Password-Reset-Flow (Forgot-Password-Mail) — separates späteres Feature, MVP läuft ohne
- Avatar-Upload (URL-Feld in Spec 04)

## Akzeptanzkriterien

- [x] `@supabase/supabase-js` + `@supabase/ssr` installiert (`npm i ...`) — **kein** `@supabase/auth-helpers-nextjs` (deprecated)
- [x] `src/lib/supabase/server.ts` — `getServerClient()` mit `await cookies()` (Next 15 async!)
- [x] `src/lib/supabase/client.ts` — `createBrowserClient(...)` für Client Components
- [x] `src/proxy.ts` (Next 16 Rename von `middleware.ts`) refresht Session via `supabase.auth.getUser()`, matcher schließt `_next/static`, `_next/image`, Bilder, favicon aus
- [x] Sign-Up-Form unter `/signup`: Felder E-Mail + Passwort + Username, alle 3 Pflicht
- [x] Sign-Up-Server-Action `signUp(formData)`:
  - validiert Input via Zod
  - prüft Username gegen Reserved-Words-Liste → bei Match Fehler "Username nicht erlaubt"
  - prüft Username-Uniqueness (DB-UNIQUE-Constraint fängt Race)
  - ruft `supabase.auth.signUp({ email, password })` auf
  - INSERT in `profiles` mit `id = user.id`, `username`, `display_name = NULL`, `accent_color = '#6366f1'`
  - bei Erfolg: `revalidatePath("/", "layout")` + `redirect("/dashboard")`
- [x] Sign-In-Form unter `/login`: E-Mail + Passwort
- [x] Sign-In-Action: `signInWithPassword`, bei Erfolg → `/dashboard`
- [x] Sign-Out-Action: `signOut()`, dann `redirect("/login")`
- [x] **Auth-Guard:** unangemeldete Zugriffe auf `/dashboard/**` redirecten nach `/login?next=<original-path>`
- [x] **Reverse-Guard:** angemeldete User auf `/login` oder `/signup` → `/dashboard` (UX, sonst confusing)
- [x] Reserved-Words-Liste in `src/lib/auth/reserved-usernames.ts`: `admin`, `root`, `api`, `auth`, `login`, `logout`, `signup`, `dashboard`, `settings`, `u`, `_next`, `www`
- [x] **Build-Verifikation:** `npm run build` ohne Errors. **Manual-Test:** ein Sign-Up + Sign-In + Sign-Out durchlaufen.

## Tasks

- [x] `npm i @supabase/supabase-js @supabase/ssr`
- [x] `src/lib/supabase/server.ts` + `src/lib/supabase/client.ts` anlegen
- [x] `src/proxy.ts` anlegen mit matcher (Next 16: file convention umbenannt von `middleware.ts`)
- [x] `src/lib/auth/reserved-usernames.ts` — Konstante + `isReserved(name): boolean`
- [x] `src/lib/auth/schemas.ts` — Zod-Schemas (`SignUpSchema`, `SignInSchema`, `UsernameSchema`)
- [x] `src/app/(auth)/signup/page.tsx` + `src/app/(auth)/signup/sign-up-form.tsx` (Client Component für Form)
- [x] `src/app/(auth)/login/page.tsx` + `src/app/(auth)/login/sign-in-form.tsx`
- [x] `src/app/(auth)/actions.ts` — `signUp`, `signIn`, `signOut` Server Actions
- [x] Auth-Guard-Logik im Middleware-Body (nicht im matcher!)
- [x] Visual Verification via `browser-use --headed`: Sign-Up → Dashboard → Sign-Out → Sign-In → Dashboard
- [x] Mobile-Viewport (375px) Form-Layout prüfen — Tap-Targets ≥44px

## Validation

Aus `rules/verification.md` → **Auth-Flow** + **UI-Komponente**:
- [x] Sign-Up + Sign-In + Sign-Out manuell durchlaufen
- [x] Middleware refresht Session (Cookie inspizieren)
- [x] Passwort-Min-Länge im Supabase-Dashboard auf 6 (Default)
- [x] Cookie-Handling via `@supabase/ssr` — Context7 MCP bei Unsicherheit
- [x] Hover- und Focus-States auf Buttons + Inputs
- [x] Keine harten `#000`/`#fff`
- [x] Error-States rudimentär: Form-Fehler werden inline pro Feld angezeigt (Zod-Errors)

## Sicherheitsnotizen

- **Niemals `supabase.auth.getSession()` in Server-Code für Auth-Entscheidungen** — nur `getUser()` (Discovery Stolperfalle #1)
- Passwörter nie loggen, nicht in Error-Messages echoen
- Reserved-Words-Check **server-side** (Client-Validation ist nur UX)

## Relevante Rules / Skills

- `references/discovery.md` Abschnitt 2 — kompletter Auth-Code-Skelett (Server Actions, Middleware, Cookie-Handling)
- `references/vision.md` #2, #4, #10, #12, #14, #15
- `rules/verification.md` — Auth-Section + UI-Section
- Context7 MCP — bei API-Detailfragen zu `@supabase/ssr`
- `mcp__supabase__execute_sql` — falls manuelle DB-Inspektion nötig

## Debrief

- **Tatsächliche Implementierung:**
  - Server-Helpers `src/lib/supabase/{server,client}.ts` mit `getAll/setAll`-Cookie-Pattern (Deprecated-Variante `get/set/remove` bewusst vermieden).
  - `src/proxy.ts` statt `src/middleware.ts` — Next 16 hat das File-Convention umbenannt. Funktion exportiert als `proxy`, sonst identisch zur Spec.
  - Forms nutzen **`useActionState` (React 19)** statt `react-hook-form` — passt 1:1 zu Server Actions, kein zusätzliches State-Management nötig. `react-hook-form` bleibt installiert für komplexere Forms in Spec 04.
  - Server Actions in `src/app/(auth)/actions.ts`: `signUp` (mit Reserved-Words-Check + Pre-Uniqueness-Check + DB-UNIQUE-Race-Fallback), `signIn` (mit Open-Redirect-Schutz via `safeNextPath()`), `signOut`.
  - 40 Reserved-Words statt 12 — Marco-Entscheidung im Build-Loop (Spec-Baseline + Service + Routing-Reserven + Auth-Adjacent + Brand-Schutz).
  - Username-Schema strikt: `min(3).max(30).regex(/^[a-z0-9_]+$/)` ohne `.transform()` — User muss explizit lowercase tippen.
  - Dashboard-Stub als minimaler Smoke-Test-Endpoint, ohne Profil-Editor-UI (kommt in Spec 04).

- **Build-Loop-Blocker (2 Stück, beide externe Ursache):**
  1. **`permission denied for table profiles`** — Spec 02 hatte versehentlich `SELECT/INSERT/UPDATE/DELETE` GRANTs auf `profiles` + `links` für `anon`/`authenticated`/`service_role` weggeräumt (vermutlich durch zu aggressives `REVOKE` während Security-Hardening). RLS war korrekt, aber Tabellen-Permissions fehlten ganz. Fix: Korrektur-Migration `restore_table_grants_profiles_links` über `mcp__supabase__apply_migration`.
  2. **Email-Confirmation an** — Supabase Default-Setting nicht in Phase 1 Preflight ausgeschaltet. Folge: `signUp()` returnt keine Session → `from("profiles").insert()` läuft mit `anon`-Role → RLS-Block. Fix: Marco hat Setting im Dashboard auf OFF gestellt.

- **Code-Härtung im Build-Loop ergänzt:**
  - Rollback per `supabase.auth.signOut()` nach fehlgeschlagenem `profiles.insert()` — verhindert „halb-eingeloggten" Zustand bei UNIQUE-Race. Bei RLS-Verletzung wirkungslos (keine Session aktiv), würde Service-Role-Client für sauberen Cleanup brauchen.
  - Postgres-Error-Code `42501` als sprechende Diagnose-Message: „Konnte Profil nicht anlegen (Session fehlt). Ist Email-Confirm im Supabase-Dashboard ausgeschaltet?" — beschleunigt Fehlersuche, falls jemand später Email-Confirm wieder anschaltet.
  - Open-Redirect-Schutz in `safeNextPath()`: akzeptiert nur Pfade mit `/`-Prefix, lehnt `//evil.com` und `http://...` ab.

- **Manual-Test komplett grün:**
  - Sign-Up → sofortiger `/dashboard`-Redirect, Email + `/u/<username>` sichtbar.
  - Sign-Out → `/login`.
  - Sign-In → `/dashboard`. Falsches Passwort → vage Fehlermeldung „E-Mail oder Passwort falsch."
  - Reserved-Word `admin` → Inline-Fehler am Username-Feld.
  - `?next=` Deep-Link aus Inkognito-Tab → korrekter Redirect-Loop.

- **Carry-over für spätere Specs:**
  - Phase 6 muss Email-Confirmation wieder einschalten. Dann funktioniert das jetzige Profile-INSERT-Pattern nicht mehr → Umstellung auf **DB-Trigger** `on auth.users insert → public.profiles insert` oder **separater Onboarding-Flow nach Email-Confirm**.
  - Service-Role-Client als zweiter Helper für Admin-Operationen (orphan-auth.users-Cleanup, später ggf. Magic-Link-Versand) — noch nicht gebaut, Pattern dokumentieren wenn benötigt.
  - Im `from("profiles").select(...).eq("id", user!.id)`-Code des Dashboards ist `user!` ein Non-Null-Assertion. Korrekter wäre eine eigene Server-Util `requireUser()`, die bei null automatisch redirected — Refactor-Kandidat für Spec 04.
