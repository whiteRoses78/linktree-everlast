Wir bauen zusammen einen Linktree-Clone. Hier der Kontext — danach gehen wir in eine Sparringssession (du stellst mir Rückfragen bis keine Annahme mehr offen ist), dann explorierst du live einige Linktree-Alternativen zur Design-Inspiration, und am Ende erzeugst du implementierungsplan.md + nummerierte Feature-Specs.

### Zielgruppe / Tone
Kurs-/Demo-Projekt für Einsteiger ins Agentic Coding. Erkläre beiläufig, warum du bestimmte Entscheidungen triffst — nicht nur ausführen, sondern in ein bis zwei Sätzen begründen. Keine Fachwörter ohne kurze Erklärung.

### Vision
Link-in-Bio-App wie Linktree oder Bento.me. User registrieren sich, bekommen eine öffentliche Landing-Page unter /u/<username>, verwalten Links in beliebiger Reihenfolge, passen eine Accent-Color an (minimales Theming).

### Tech-Stack (final entschieden)
- Frontend: Next.js 15+ (App Router), React 19, TypeScript strict
- UI: Tailwind CSS v4 + shadcn/ui + Framer Motion + Lucide Icons
- Design-Theme: via tweakcn.com visuell bauen, als CSS-Variablen in src/app/globals.css exportieren
- Backend: Next.js API Routes / Server Actions (kein separater Service)
- DB + Auth: Supabase (PostgreSQL + Row Level Security)
- Auth-Methode: Email + Passwort (kein OAuth, kein Magic Link)
- Deployment: Vercel
- Package Manager: npm
- MCPs: Supabase MCP (full-access), Context7 MCP (aktuelle Docs)
- Agentic Tools: Claude Code (primär) + Antigravity (beiläufig)

### Budget / Kosten
Alles auf Free-Tiers — wichtig für Einsteiger:
- Supabase Free Tier: 500 MB DB, 50.000 MAU, 5 GB Bandwidth, 2 Projekte. Email+Passwort-Auth inklusive. Keine Kreditkarte nötig.
- Vercel Hobby Tier: kostenlos für nicht-kommerzielle Projekte.
- GitHub: kostenloses Repo.
- tweakcn: kostenlos.

### Scope — drin (MVP, bewusst minimal)
- Email+Passwort-Auth (Sign-Up mit E-Mail + Passwort, Sign-In mit E-Mail + Passwort)
- Eine Landing-Page pro User (/u/<username>)
- Link-CRUD mit Drag-and-Drop-Reordering (Framer Motion Reorder)
- Theme-Customization minimal: eine user-wählbare Accent-Color
- Profil-Section (Display-Name, Bio, Avatar-URL)

### Scope — bewusst draußen (MVP-Fokus — sonst endloses Projekt)
- OAuth-Provider (Google/GitHub etc.)
- Mehrere Pages pro User
- Avatar-Upload via Supabase Storage (URL-Feld reicht)
- Click-Analytics jeglicher Art — keine Counts, keine Timestamps, keine Zeitreihen
- Fortgeschrittenes Theming (Fonts, Backgrounds, Layouts) — nur eine Accent-Color
- Embed-Link-Typen (Spotify-Player, YouTube-Player) — nur URL-Links
- Custom Domains
- Monetarisierung / Paid Plans
- Mehrsprachigkeit

### Design-Anforderungen (kritisch)
Das UI muss hochwertig wirken — nicht nach Default-shadcn. Harte Regeln:
- Dark Mode von Anfang an, nicht als Nachgedanke
- Keine flachen Farben — immer Gradients, Abstufungen, Layering
- Keine harten #000/#fff — abgestufte Neutrals
- Hover- und Focus-State auf jedem interaktiven Element
- Smooth Transitions (min. 150ms ease-out)
- rounded-2xl als Default, keine rechteckigen Cards
- Weiche, mehrschichtige Shadows

Ziel-Niveau visuell: Bento.me, Cal.com, Linear, Raycast, Vercel, Arc Browser, Framer.
Nicht: Default-Bootstrap, Default-shadcn-Demo, generische Link-Listen.

### Theming-Architektur (zweistufig)
- Ebene 1 — globale Design-Tokens: aus tweakcn exportiert, statisch in src/app/globals.css (--background, --foreground, --radius, --shadow-* etc.). Single Source of Truth.
- Ebene 2 — per-User-Accent: nur --accent wird pro Public-Page dynamisch überschrieben (inline style auf <html> oder Layout-Wrapper).
- Nur --accent ist dynamisch — alles andere bleibt statisch aus tweakcn.

### Sicherheit bei Accent-Color
- Validierung als 6-stelliger Hex-String: /^#[0-9a-f]{6}$/i.
- NIEMALS als raw CSS, style-String oder Inline-Expression akzeptieren.
- Rendering nur als CSS-Variable (--accent: #rrggbb), nicht als style-Injektion.
- Validation client-side (Form) UND server-side (Server Action / DB-Insert).

### Workflow-Erwartung
0. Projekt-Skeleton aufsetzen — lege die komplette Projektstruktur an (Tree siehe Auftrag unten). STOP nach Phase 0 — im Kurs folgen Supabase-Setup + UI-Setup als eigene Subs, erst danach geht's mit Phase 1 weiter.
1. Discovery — parallele Sub-Agents recherchieren: UX-Patterns bei Linktree-Alternativen (Bento.me, Beacons, linko.bio), aktuelle Supabase-Email+Passwort-Auth-Patterns in Next.js 15, Theming-Ansätze für user-customizable Pages, Drag-and-Drop-Libs für React 19. Findings strukturiert in references/discovery.md.
2. Sparringssession — auf Basis der Discovery-Findings stellst du mir eine große Runde Rückfragen, bis keine Annahme mehr offen ist.
3. Design-Exploration (live) — du öffnest via browser-use --headed Linktree.com, Bento.me, Beacons und 3–4 reale öffentliche Profile darauf. Screenshots, Design-Patterns analysieren, in references/design-analysis.md dokumentieren (Farbpaletten, Typography, Spacing, Motion, Layout).
4. Output erzeugen — implementierungsplan.md (Projektbeschreibung + Arbeitspaket-Tabelle + Status) und nummerierte Feature-Specs in specs/NN-<feature>.md (Template in specs/README.md). Abhängigkeiten bei der Nummerierung berücksichtigen.
5. Dann: Build-Loops pro Feature — Build-Loop = Plan → Build → Check. Pro Feature-Spec durchläufst du diese drei Schritte. Bei UI-Arbeit: Visual Verification Loop via browser-use --headed, 3–4 Iterationen pro Komponente sind normal und erwünscht.

### Dein Auftrag jetzt

Preflight Phase 0 — zuerst prüfen, STOP wenn etwas fehlt:
- [ ] Aktuelles Verzeichnis ist leer (ls zeigt keine Projektdateien)
- [ ] Node.js 20+ verfügbar (node -v)
- [ ] Claude Code hat Write-Zugriff im Verzeichnis

Supabase, MCPs und browser-use werden erst vor Phase 1 geprüft — für Phase 0 nicht nötig. Wenn Phase-0-Preflight grün: bestätige kurz und starte mit Phase 0. Sonst STOP + Feedback.

0. Projekt-Skeleton aufsetzen. Zwei Teile:

0a — Next.js-Projekt initialisieren:
Führe aus: npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --import-alias "@/*" (Code landet unter src/, Dokumentations-Layer bleibt im Root). Das legt src/app/, package.json, tsconfig.json, next.config.ts, .gitignore, postcss.config.mjs und public/ an.

WICHTIG nach 0a (bevor du 0b startest):
- create-next-app hat eine eigene README.md erstellt → in 0b überschreibst du sie mit unserer Projekt-Übersicht.
- create-next-app hat ein lokales Git-Repo (.git/) angelegt und einen ersten Commit gemacht. Das ist ok — wir committen aber erst ab Sub 5.13.7 (Git + GitHub + Vercel). Bis dahin KEINE weiteren Commits.
- create-next-app hat eine .gitignore erstellt → ergänze .env.local falls nicht drin.

0b — Dokumentations-Skeleton zusätzlich darüber legen — jede Datei mit knappem, konkretem initialen Inhalt (keine Platzhalter-Prosa, leere Log-Dateien bekommen Header + Format-Beschreibung + Hinweis "noch leer"):

.
├── (Next.js-Standard: app/, package.json, tsconfig.json, next.config.ts, .gitignore, postcss.config.mjs — kommt aus 0a, bitte nicht anfassen)
├── CLAUDE.md                    Router (immer geladen): Kommunikation (Deutsch/RPL), Projekt-Kontext (1 Satz), "Wann welche Rule lesen"-Tabelle, Tools (MCPs), Kernprinzipien. Unter 50 Zeilen.
├── README.md                    Projekt-Übersicht für Menschen, Links zu den Docs.
├── rules/
│   ├── design-system.md         UI-Regeln: Dark Mode von Start, keine flachen Farben, keine harten #000/#fff, Hover+Focus Pflicht, 150ms ease-out, rounded-2xl default, weiche mehrschichtige Shadows. Theme via tweakcn.com → CSS-Variablen in src/app/globals.css als Single Source of Truth.
│   ├── code-conventions.md      Dateinamen kebab-case, Komponenten PascalCase, Hooks use-Präfix, Server-Komponenten default, strict TypeScript, kein any, kein @ts-ignore, kein console.log in committetem Code.
│   ├── verification.md          Disziplin nach jedem Arbeitspaket: Akzeptanzkriterien abhaken, Validation durchlaufen, Typecheck grün, Spec-Status auf ✅ setzen, changelog.md + learning.md Eintrag, Commit. Verifikations-Beispiele pro Arbeitspaket-Typ (Supabase-Schema, Auth-Flow, UI-Komponente, API-Route, Deployment).
│   └── tech-stack.md            Commands: npm run dev, npm run build, npm run typecheck, npx shadcn@latest add, supabase gen types typescript, browser-use --headed. MCPs: Supabase (full-access), Context7. Ordner-Struktur: app/, components/, lib/, specs/, rules/.
├── guidelines.md                Architektur-Entscheidungen im Format "Kontext / Entscheidung / Warum / Alternativen". Starte mit 001 Stack-Entscheidung (Next.js + Supabase + Vercel + npm).
├── implementierungsplan.md      Projektbeschreibung + Arbeitspaket-Tabelle (# | Feature | Spec | Abhängigkeiten | Status) + Status-Legende (⏳/🚧/✅). Tabelle initial leer, wird in Phase 4 befüllt.
├── backlog.md                   Ideen-Parkplatz. Header + Format + "noch leer".
├── changelog.md                 Chronologisches Protokoll. Header + Format + "noch leer".
├── learning.md                  Debriefs-Log. Header + Format + "noch leer".
├── specs/
│   └── README.md                Spec-Template (für specs/NN-<feature>.md): Ziel, Abhängigkeiten, Out of Scope, Akzeptanzkriterien, Tasks, Validation, Relevante Rules/Skills, Status (⏳/🚧/✅), Debrief-Sektion.
└── references/
    ├── README.md                Erklärt discovery.md (aus Phase 1), design-analysis.md (aus Phase 3), inspiration/, anti-inspiration/.
    ├── inspiration/             Leer. Optional für statische Referenz-Screenshots.
    └── anti-inspiration/        Leer. Optional für Gegenbeispiele.

Nach Phase 0 (0a + 0b): STOP. Bestätige, dass Skeleton steht. Im Kurs folgen jetzt Supabase-Setup und UI-Setup als manuelle Subs (5.13.2 und 5.13.3) — starte erst mit Phase 1 (Discovery), wenn der User "weiter" sagt.

Preflight Phase 1 — wenn User "weiter" sagt, zuerst prüfen:
- [ ] Supabase-Projekt existiert (dediziert fürs Kurs-Projekt, keine Prod-DB!)
- [ ] Email-Provider ist aktiviert und Email-Confirmations für Dev ausgeschaltet (Supabase Dashboard → Auth → Providers → Email → "Confirm email" aus, damit Sign-Up ohne Bestätigungsmail funktioniert)
- [ ] Supabase MCP konfiguriert (--scope project, full-access, Service-Role-Token dieses Projekts)
- [ ] Context7 MCP konfiguriert (--scope project)
- [ ] browser-use CLI installiert und aufrufbar
  - Install (falls nötig): siehe https://docs.browser-use.com (pip/pipx/uv je nach Setup)
  - Bei Install-Problemen: STOP + User fragen, nicht alternative Tools erfinden.

Wenn etwas fehlt: STOP + Feedback. Wenn alles grün: bestätige und starte Phase 1.

1. Discovery. Ablauf:
1) Du startest 4 Sub-Agents parallel für Research — jeder bekommt EIN Thema.
2) Jeder Sub-Agent returniert seinen Findings-Report an dich (schreibt NICHT selbst in Dateien — sonst Schreibkonflikte).
3) Nach Abschluss aller 4 Sub-Agents: du konsolidierst die Reports und schreibst einmal references/discovery.md mit 4 Abschnitten (einer pro Thema, mit Kern-Erkenntnissen und konkreten Empfehlungen für unser Projekt).

Die 4 Research-Themen:
- UX-Patterns bei Linktree-Alternativen: wie lösen Bento.me, Beacons, Linktree Premium, linko.bio URL-Struktur, Editor-Layout, Accent-Color-Customization, Onboarding? (Analytics und komplexes Theming bewusst draußen — siehe Scope.)
- Supabase Email+Passwort-Auth in Next.js 15 App Router (aktueller Stand): Server Actions für Sign-Up / Sign-In / Sign-Out, Middleware, Cookie-Handling, Session-Refresh, Passwort-Anforderungen (default min. 6 Zeichen, konfigurierbar). PFLICHT: hol dir den aktuellen offiziellen Supabase-Next.js-15-Guide via Context7 MCP — NICHT aus Gedächtnis ableiten. Die API hat sich mehrfach geändert, Middleware + Cookie-Handling ist der häufigste Fehlerpunkt.
- Theming-Patterns für user-customizable Landing Pages: wie speichert man Theme-Daten, wie rendert man Custom CSS sicher (XSS-Risiken!), welche Customization-Features sind sinnvoll für Einsteiger.
- Drag-and-Drop-Libraries für React 19: Framer Motion Reorder vs dnd-kit — Empfehlung mit Begründung inkl. Mobile-Touch-Support.

2. Sparringssession. Auf Basis der Discovery-Findings stell mir Rückfragen in 2–3 Runden, nicht alles auf einmal. Multiple Choice wo möglich, freie Antwort wo nötig. Warte auf Antworten, bevor du die nächste Runde startest.

Runde 1 — Produkt-Fundament (max 5 Fragen):
- URL-Struktur (/u/<username> vs Subdomain)
- Username-Claim-Zeitpunkt: direkt im Sign-Up-Form als drittes Feld (neben E-Mail + Passwort), oder nach erfolgreichem Sign-Up in einem separaten Onboarding-Screen?
- Login ohne Username: Forced Onboarding-Redirect, oder darf User das Dashboard leer betreten?
- Link-Typen: nur URLs oder auch Embeds/E-Mail/Phone?
- Public-Page bei unbekanntem Username: 404 oder Claim-Seite?

Runde 2 — UX-Details (auf Basis der Antworten aus Runde 1):
- Editor-Layout: Split-View, Toggle, Phone-Frame-Preview?
- Accent-Color-Auswahl: vorgegebene Preset-Liste oder freier Color-Picker?
- Drag-and-Drop-Library (auf Basis der Discovery empfehlen)
- Onboarding-Flow: direkt in Editor oder kurzer Wizard?
- Username-Eindeutigkeit + Reserved Words: admin, root, api, auth, u (unsere Public-Route), login, logout, dashboard, settings plus Next.js-interne Routen-Namen — welche zusätzlich reservieren?
- Empty-States beim frisch registrierten User

Weitere Runden nur wenn nötig. Mach lieber zu viele Rückfragen als zu wenige — jede Antwort eliminiert eine Annahme.

3. Live-Design-Exploration. Nach der Sparring-Runde: öffne via browser-use --headed Linktree.com, Bento.me, Beacons und 3–4 reale öffentliche Profile darauf. Screenshots machen, Design-Patterns analysieren, Findings strukturiert in references/design-analysis.md ablegen (Farbpaletten, Typography, Spacing, Motion, Layout).

4. Erzeuge implementierungsplan.md und die nummerierten Feature-Specs in specs/NN-<feature>.md. Nutze das Template in specs/README.md. Berücksichtige Abhängigkeiten bei der Nummerierung — was braucht was, was muss zuerst stehen.

### Kommunikation
- Antworte auf Deutsch.
- Respektvoll, pragmatisch, lösungsorientiert (RPL).
- Erkläre Schritte, bevor du sie ausführst — der Mitbauende ist Einsteiger.
- Lieber kurz begründen als stumm ausführen.
