# 06 — Public-Profil-Page (`/u/[username]`) + Reserved-Words + Claim-Seite

**Status:** ✅ Fertig

## Ziel

Public-Profile-Page unter `/u/[username]`. Zeigt Avatar, Display-Name, Bio, Linkliste (aktive Links). Behandelt drei Fälle korrekt:
1. **Reserved-Username** (z.B. `/u/admin`) → eigene 404-Page mit klarem Messaging
2. **Unbekannter User** (Username in DB nicht vorhanden, aber nicht reserved) → **Claim-Seite** mit Sign-Up-CTA (vorausgefüllt mit dem Username)
3. **Bekannter User mit/ohne Links** → Public-Page mit Empty-State falls keine Links

Per-User-Accent-Color-Injection kommt in Spec 07 — hier wird der Default-Accent aus `globals.css` genutzt.

## Abhängigkeiten

- Spec 02 (Schema): `profiles` + `links` Tabellen, RLS Public-Read auf beiden
- Spec 03 (Auth): Reserved-Words-Konstante in `src/lib/auth/reserved-usernames.ts` wird mitgenutzt
- Spec 05 (Links-CRUD): nicht zwingend Vorgänger, aber sinnvoll dass `links`-Daten testbar sind

## Out of Scope

- Per-User-Accent → Spec 07
- Click-Analytics — Vision Out-of-Scope
- Custom-Background-Image — Vision Out-of-Scope
- Edit-Shortcut für Owner-View (Vision-Anmerkung) — out of MVP
- "Mit linktree-app erstellt"-Footer-Branding ist OK, aber kein "Join Linktree"-Style-Conversion-CTA

## Akzeptanzkriterien

- [x] **Route** `src/app/u/[username]/page.tsx` — async Server Component
- [x] **Prio-Reihenfolge** im Server Component:
  1. `isReserved(username)` → `notFound()` (zeigt eigene `not-found.tsx`)
  2. DB-Lookup `profiles.select(...).eq('username', username).single()` → wenn vorhanden, render Public-Page
  3. sonst → render Claim-Seite mit Sign-Up-CTA (`/signup?username=<username>`)
- [x] **`src/app/u/[username]/not-found.tsx`** — eigene 404 mit projektpassendem Messaging ("Dieser Profilname ist nicht verfügbar.")
- [x] **Public-Page-Render:**
  - Container: `max-w-md mx-auto px-6 py-12`
  - Avatar: 96px (Mobile) / 112px (Desktop), `rounded-full`, Initial-Letter-Fallback wenn `avatar_url` fehlt
  - Display-Name (oder Username-Fallback) als `text-2xl font-semibold`, zentriert
  - Bio: `text-base text-muted-foreground`, max 280 chars, zentriert
  - Linkliste: Card-Stack mit `gap-3`, `rounded-2xl`, `bg-card`, Hover-Lift, Tap-Target ≥48px
  - Footer dezent: "Erstellt mit linktree-app" + Link zur Landing
- [x] **Empty-State** wenn keine aktiven Links: charmante Card "Hier wird's bald spannend."
- [x] **Claim-Seite-Render:**
  - "Username `@username` ist noch frei!"
  - Sign-Up-CTA "Diesen Namen sichern" → `/signup?username=<username>` (Sign-Up-Form pre-fillt das Feld via `defaultValue`)
  - Hinweis "Ist das deine Marke? Greif sie dir jetzt."
- [x] **`?preview=1`-Variante** für iframe-Einbettung:
  - Kein Footer-Branding (`PageFooter` returnt `null` bei `isPreview=true`)
  - Wird in Spec 04 vom iframe geladen
- [x] Mobile-Viewport (375px): kein Overflow, Tap-Targets ≥44px (CTAs via `min-h-11`-Override, weil tweakcn-Button `lg`=h-9 unter 44px liegt)
- [x] **Visual:** Hover-State auf Link-Cards (`-translate-y-0.5 + shadow-md`), smooth Transitions
- [x] `npm run build` grün

## Tasks

- [ ] `src/app/u/[username]/page.tsx` — Prio-Logic
- [ ] `src/app/u/[username]/not-found.tsx`
- [ ] `src/components/public/profile-header.tsx` — Avatar + Display-Name + Bio
- [ ] `src/components/public/link-list.tsx` — Card-Stack
- [ ] `src/components/public/claim-card.tsx` — Claim-Seite
- [ ] `src/components/public/page-footer.tsx` — dezenter Footer mit `?preview=1`-Awareness (per Prop)
- [ ] `src/app/(auth)/signup/page.tsx` erweitern um `?username=<value>`-Pre-Fill aus URL
- [ ] Visual Verification:
  - `/u/admin` → 404 (Reserved-Hit)
  - `/u/peter` (nicht vorhanden) → Claim-Seite
  - `/u/<test-user>` → Public-Page mit Links
  - `/u/<test-user>?preview=1` → ohne Footer-Branding
- [ ] Mobile-Layout-Check (375px) via browser-use

## Validation

Aus `rules/verification.md`:
- **UI:** Hover/Focus, Mobile, Empty/Loading/Error, keine harten #000/#fff
- **Server-Side:** Reserved-Check VOR DB-Query (Performance + Security)
- Avatar-URL-Render mit `referrerPolicy="no-referrer"` und Image-Fallback (Initial-Letter wenn Load-Fail)
- **3 Test-Szenarien manuell durchklicken**: reserved, unbekannt, vorhanden

## Sicherheits-/UX-Notizen

- **Reserved-Words-Check ist erste Verteidigungslinie** — verhindert dass `/u/admin` zu "Diesen Namen sichern" wird (Phishing-Vektor)
- `single()` von Supabase wirft Error bei 0 oder mehrfachen Rows — sauber try/catch
- Username-Param ist `params.username` (string), case-sensitiv? Schema `citext` macht's case-insensitive, perfect
- Public-Read auf `profiles` ist RLS-Policy aus Spec 02 — Anon-Client funktioniert ohne Auth
- Bio + Display-Name werden in JSX gerendert → React escapt automatisch, kein XSS-Risiko

## Relevante Rules / Skills

- `references/vision.md` #1, #4, #10
- `references/design-analysis.md` — Public-Page-Layout, Single-Column, Card-Stack
- `references/discovery.md` Abschnitt 1 — Anti-Patterns vermeiden
- `rules/design-system.md`
- `rules/verification.md`

## Debrief

- **Stub-Erbschaft zahlte sich aus:** `link-list.tsx` + `profile-header.tsx` standen schon aus Spec 04/05 — Spec 06 war primär Lücken-Schließen (Reserved-Check, ClaimCard, PageFooter-Komponente, Pre-Fill, Polish). Ein größerer Refactor wäre nötig gewesen, wenn der Stub anders gelegen hätte.
- **`Button`-asChild geht nicht:** Der tweakcn/base-ui-basierte Button hier hat keine Radix-Slot-Mechanik. Lösung: `buttonVariants()`-Helper mit-exportiert, auf `<Link>` direkt angewendet. Bauteile: ClaimCard-CTA, beide not-found.tsx-CTAs.
- **Tap-Target-Override nötig:** `size="lg"` in diesem Theme = `h-9` = 36px, unter dem Mobile-44px-Minimum. Workaround: `min-h-11` in der `className`-Slot von `buttonVariants()`. Mittelfristig sollte das Theme selbst die Größen anheben (Polish-Pass-Kandidat).
- **Marco hat die Routing-Logik selbst geschrieben** (Learning-Mode): klare 3-Block-Struktur mit Early-Returns. Genau wie Spec 06 vorsieht.
- **Carry-over:** Per-User-Accent-Color-Injection kommt in Spec 07 — die Public-Page rendert aktuell mit dem Default-Accent aus `globals.css`. `style`-Object am Page-Root wird der Hook dafür sein.
