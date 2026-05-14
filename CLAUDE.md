@AGENTS.md

# Projekt-Kontext — linktree-app

**Vision:** Linktree-Style SaaS-Webapp. Nutzer:innen legen ein Konto an, pflegen eine öffentliche Profilseite mit kuratierten Links (Bio + Avatar + Linkliste), erreichbar unter eindeutiger URL. Wird in Phase 2b (Sparring) präzisiert.

## Kommunikation
- Deutsch, RPL (respektvoll, pragmatisch, lösungsorientiert)
- Erkläre Schritte vor der Ausführung — Marco ist fortgeschrittener Anfänger

## Tech-Stack
Next.js 15 + React 19 + TypeScript strict, Tailwind v4 + shadcn/ui, Supabase, Vercel.

## Wann welche Rule lesen

| Aufgabe | Rule |
|---|---|
| UI-Komponente bauen | `rules/design-system.md` |
| Server Action / API Route | `rules/code-conventions.md` |
| Feature fertigstellen | `rules/verification.md` |
| Commands / MCPs / Struktur | `rules/tech-stack.md` |

## Tools / MCPs
- **Supabase MCP** — Schema, SQL, Type-Gen
- **Context7 MCP** — aktuelle Framework-Docs (Next.js 15, Supabase SSR)

## Kernprinzipien
- Server Components by default, Client nur wo interaktiv
- Hover/Focus auf jedem interaktiven Element
- Mobile-first
- Bei API-Fragen: Context7 MCP konsultieren oder `node_modules/next/dist/docs/` lesen, NICHT aus Gedächtnis
