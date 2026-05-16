# Discovery — Phase 1 Findings

Konsolidiertes Ergebnis aus 4 parallelen Sub-Agent-Recherchen (2026-05-15).
Quellen siehe Sub-Agent-Reports im Chat-Log. Diese Datei ist die Truthquelle für Phase 2 (Sparring) und Phase 3 (Specs).

---

## 1. UX-Patterns bei Linktree-Alternativen

### Tool-Profile

- **Bento.me** — Bento-Grid-Konzept (Snippets + Media-Embeds), Path `/user`, Onboarding als "simpel" gelobt. **Achtung:** Februar 2026 eingestellt → für Live-Inspektion in Phase 3 nur noch über Archive/Screenshots verlässlich.
- **Beacons.ai** — Creator-Commerce-Plattform, Path `/user`, **6-Step Forced Wizard** nach Sign-Up (Username → Socials → Theme → Interest → Selling-Intent), WYSIWYG-Builder, Theme-System mit Templates + freier Color-Picker auf Free-Tier.
- **Linktree** — Marktführer, Path `linktr.ee/<user>`, **Split-View-Editor** (Linkliste links + Phone-Frame-Preview rechts auf Desktop, Toggle auf Mobile). Free-Tier: Theme-Presets + begrenzte Tweaks; freier Color-Picker = Starter-Plan ($8/Mo).
- **linko.bio** — kleiner Klon, Path `/user`, Username-Reservierung schon auf Landing-Page.

### Vergleichstabelle

| Dimension | Bento.me | Beacons.ai | Linktree | linko.bio |
|---|---|---|---|---|
| **URL** | Path `/user` | Path `/user` | Path `/user`, hard "schon vergeben" | Path `/user`, Claim auf Landing |
| **Editor** | Card-/Bento-Builder, Live-Preview | WYSIWYG, Drag-Rearrange, Mobile-Toggle | **Split-View** Linkliste + Phone-Frame | Linktree-ähnlich |
| **Accent-Color** | Theme-Presets | Templates + freier Picker (Free) | Presets Free; **freier Picker = Paid** | Presets |
| **Onboarding** | Username + sofort Editor | **6-Step Forced Wizard** | Username → Template → erste Links | Username-First, dann Editor |
| **Empty-Public-Page** | Avatar + Name, leer | Template-Default greift | Username reserviert + "Join Linktree"-CTA | Unklar |

### Empfehlungen für unser MVP

1. **URL = Path `/u/<username>`** — alle Konkurrenten nutzen Path. Subdomain-Routing in Next.js 15 + Vercel ist Middleware-Overhead, Free-Tier-Limits machen es zusätzlich umständlich.
2. **Editor = Split-View mit Live-Preview-iframe**, **kein Phone-Frame-Chrome im MVP**. iframe-Pattern: `<iframe src="/u/<self>?preview=1">` mit Revalidate nach Save. Phone-Frame erst im Polish-Pass.
3. **Accent-Color = 6-8 Presets, KEIN freier Color-Picker.** Begründung: Linktree paywallt den Picker bewusst — Presets schützen vor Accessibility-Desastern (Kontrast) und vermeiden eine Color-Picker-Komponente im MVP.
4. **Onboarding = KEIN Forced Wizard.** Username pflicht im Sign-Up-Form. Danach leerer Editor mit prominentem "Ersten Link hinzufügen"-CTA + 2-3 Coach-Mark-Tooltips. Aha-Moment in <60s.
5. **Empty-Public-Page = charmant, nicht leer.** Avatar (oder Initial-Placeholder), Display-Name, Bio, dezenter "Diese Seite wird noch eingerichtet"-Hinweis mit Accent-Color-Akzent. **Kein "Join Linktree"-Style CTA für Public-Viewer** — wir haben dafür nur Footer-Branding.

**Anti-Patterns vermeiden:** Beacons' Multi-Step-Wizard (Friction), Linktrees Paywall-Logik (in Free-Only-Modell sinnlos), Bento-Card-Grid (zu komplex fürs MVP — pure vertikale Linkliste reicht).

---

## 2. Supabase Email+Passwort-Auth in Next.js 15 App Router (Stand 2026)

### Package

**`@supabase/ssr`** ist der aktuelle Stand. `@supabase/auth-helpers-nextjs` ist deprecated seit Mitte 2024. Installation:

```
npm i @supabase/supabase-js @supabase/ssr
```

Quellen: Context7 `/supabase/ssr` (Library "Supabase SSR", Benchmark 84.5) + supabase.com/docs/guides/auth/server-side/nextjs.

### Server Actions

Konvention: `src/app/(auth)/actions.ts` mit `"use server"` ganz oben. Skelett für `signUp` / `signIn` / `signOut`:

```ts
// src/app/(auth)/actions.ts
"use server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

async function getClient() {
  const cookieStore = await cookies()  // ← async in Next.js 15!
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => toSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)),
      },
    }
  )
}

export async function signIn(formData: FormData) {
  const supabase = await getClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  })
  if (error) return { error: error.message }
  revalidatePath("/", "layout")
  redirect("/dashboard")
}
// signUp + signOut analog
```

### Middleware (Pflicht!)

Liegt in `src/middleware.ts`. Refresht die Session bei jedem Request — ohne läuft Token ab, Server Components sehen `null`-User.

```ts
// src/middleware.ts — gekürzt
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(URL, KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        toSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options))
      },
    },
  })
  await supabase.auth.getUser()  // refresh
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)"],
}
```

### Cookie-Handling — drei Kontexte

| Kontext | `cookies()` async? | `setAll` erlaubt? |
|---|---|---|
| Server Component (`page.tsx`) | ja | **nein** — nur `getAll`, Setting via Middleware |
| Server Action / Route Handler | ja | ja |
| Middleware | nutzt `request.cookies` | ja, via `response.cookies.set` |

### Passwort-Anforderungen

Default-Min: **6 Zeichen**. Konfiguriert im Supabase Dashboard → Authentication → Policies → Password Requirements. Empfehlung für Prod: 10+ Zeichen, mind. eine Ziffer.

### Drei Stolperfallen 2026

1. **`getSession()` in Server-Code statt `getUser()`** — `getSession()` liest unsigned Cookie, spoof-bar. Offizielle Doku: "Never trust `getSession()` inside server code". **Fix:** immer `supabase.auth.getUser()` für Auth-Entscheidungen.
2. **Sync `cookies()` aus alten Tutorials** — in Next 15 ist `cookies()` async. Ohne `await` → Build-Warnings + teils leere Stores. Auch `headers()` und Page-`params` sind jetzt async.
3. **Middleware-Matcher schließt Auth-Routes aus** — naiv `["/dashboard/:path*"]` verhindert Session-Refresh auf `/login`. **Fix:** Default-Matcher mit Negativ-Lookahead (s. oben), Auth-Redirect-Logik ins Middleware-Body schreiben.

### Empfehlung für Prod (später, nicht jetzt)

Email-Confirmation im Dashboard auf AN, Callback-Route `/auth/confirm` mit `exchangeCodeForSession`.

---

## 3. Theming-Patterns für user-customizable Landing Pages

### Speicher-Pattern für MVP

**Einzel-Column auf `profiles`** — für 1 Feld ideal. Bei späterer Erweiterung (2-3 Felder mehr) auf Hybrid (Spalten + JSONB-Catch-All) wechseln. DB-CHECK-Constraint als Last-Line-of-Defense:

```sql
ALTER TABLE profiles
  ADD COLUMN accent_color text NOT NULL DEFAULT '#6366f1'
  CONSTRAINT accent_color_hex_format
  CHECK (accent_color ~ '^#[0-9a-fA-F]{6}$');
```

### Render-Pattern

**Server-rendered Wrapper-Div mit `style`-Object** (kein FOUC, React escapt automatisch, kein Style-Tag-Kontext):

```tsx
// src/app/u/[username]/page.tsx — Server Component
const { data: profile } = await supabase
  .from('profiles').select('accent_color, ...').eq('username', username).single()

return (
  <div style={{ '--accent': profile.accent_color } as React.CSSProperties}>
    {/* shadcn-Komponenten greifen via var(--accent) zu */}
  </div>
)
```

### Dreistufige Validation (Pflicht)

1. **Client (UX-Feedback):** `pattern="^#[0-9a-fA-F]{6}$"` auf `<input>` + Live-Preview.
2. **Server (Truth):** Zod-Schema in Server Action, **gleiche Regex** wie DB-Constraint.
3. **DB (Last-Line):** CHECK-Constraint (oben).

```ts
const HexColor = z.string().regex(/^#[0-9a-f]{6}$/i)
const { accent_color } = HexColor.parse(formData.get('accent_color'))
```

### XSS-Risiken — was wir vermeiden

| Risiko | Vermeidung |
|---|---|
| **Style-Injection via String-Konkatenation** (`style="--accent: ${value}"` als String) | React-`style`-Prop als **Object**, nie als String |
| **`<style dangerouslySetInnerHTML>` mit User-Daten** | komplett verbieten — nur `style`-Attribute mit Object |
| **DB-Bypass via Service-Role-Token** | DB-CHECK-Constraint als Defense-in-Depth |
| **`url(javascript:...)` / `url(data:...)` in CSS-Values** | Whitelist-Regex (Hex), nicht Blacklist |
| **CSS expression()** (IE-Legacy) | irrelevant in 2026, durch Hex-Regex implizit ausgeschlossen |

### Skalierungs-Pfad

Erweiterung auf `background_color` / `font_family` → weitere Columns + eigene Constraints (Fonts als Enum). Wrapper-Div bekommt mehr CSS-Variablen. **Kein Architektur-Umbau nötig.**

### CSP-Header (Defense-in-Depth, später)

`style-src 'self' 'unsafe-inline'` für inline-style-Attribute. **Kein `unsafe-eval`**, kein User-Daten-`<style>`-Tag.

---

## 4. Drag-and-Drop für React 19 — Empfehlung: dnd-kit

### Klare Empfehlung

**`@dnd-kit/core` + `@dnd-kit/sortable`** — nicht Framer Motion Reorder.

### Begründung

1. **Mobile-Touch ist Kill-Kriterium.** Framer Motion Reorder hat bekannte, seit Jahren offene Scroll-vs-Drag-Konflikte auf iOS/Android (Issues #1506, #1582, #1597). Das würden wir direkt erben.
2. **`activationConstraint.delay`** in dnd-kit löst Scroll-vs-Drag sauber per API-Knopf statt CSS-Workarounds.
3. **Keyboard-Accessibility** out-of-the-box (Space + Arrow-Keys) inkl. ARIA-Live-Regions. Bei Framer komplett Eigenbau.
4. **Production-Track-Record:** Linear, Vercel-Dashboard.
5. **Bundle:** ~24 KB gzipped extra. Akzeptabel, weil nur im Dashboard hinter Auth — Public-Profile-Page ist davon nicht betroffen.

### Vergleichstabelle (Kurzform)

| Kriterium | Framer Motion Reorder | **dnd-kit** |
|---|---|---|
| React 19 / Next 15 | OK ab Motion v12 | OK |
| Touch (iOS/Android) | **bekannt fragil** | **solide** |
| Boilerplate | ~15 Zeilen | ~40 Zeilen |
| Bundle extra | 0 KB (Motion ist eh drin) | ~24 KB gzipped |
| Keyboard-a11y | Eigenbau | **eingebaut** |
| Animation | Spring-Physics | gut, weniger physikalisch |

### Mini-Code-Skizze für unseren Use-Case

```tsx
// src/app/dashboard/links/sortable-links.tsx
"use client"
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core"
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

function SortableLink({ link }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id })
  return (
    <li ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
        {...attributes} {...listeners}>
      {link.title}
    </li>
  )
}

export function SortableLinks({ initial }) {
  const [items, setItems] = useState(initial)
  const [, startTransition] = useTransition()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const next = arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id))
    setItems(next)  // optimistic
    startTransition(() => reorderLinksAction(next.map((l, i) => ({ id: l.id, position: i }))))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <ul>{items.map(l => <SortableLink key={l.id} link={l} />)}</ul>
      </SortableContext>
    </DndContext>
  )
}
```

Server Action `reorderLinksAction` macht ein Supabase-`upsert` auf `links` mit den neuen `position`-Werten (RLS sorgt für User-Isolation).

---

## Übergreifende Konsequenzen für Phase 2 (Sparring)

Diese Punkte sind durch Discovery **nicht** entschieden — Marco muss in Phase 2 bestätigen oder anders entscheiden:

- **Username-Claim-Zeitpunkt:** im Sign-Up-Form als drittes Feld (E-Mail + Passwort + Username)? Discovery legt das nahe (alle Konkurrenten machen Username früh).
- **Login ohne Username vorhanden:** kann technisch nicht entstehen, wenn Username Sign-Up-Pflicht ist → Frage erübrigt sich.
- **Link-Typen MVP:** nur URLs (laut Kickoff fix). Bestätigung erbeten.
- **Public-Page bei unbekanntem Username:** 404 oder Claim-Seite? Discovery: Linktree zeigt Claim-CTA, Bento zeigt 404. Bei Free-Only ohne Wachstums-Hebel → 404 empfohlen.
- **Editor-Layout:** Split-View bestätigen (Empfehlung) oder Toggle?
- **Accent-Color-Auswahl:** Preset-Liste (Empfehlung) oder freier Picker? Marco entscheidet.
- **Drag-and-Drop:** dnd-kit bestätigen (Empfehlung).
- **Onboarding:** leerer Editor + CTA + Coach-Marks (Empfehlung) oder doch Mini-Wizard?
- **Username-Reserved-List:** welche Reservierungen zusätzlich zu `admin`, `root`, `api`, `auth`, `u`, `login`, `logout`, `dashboard`, `settings`?
