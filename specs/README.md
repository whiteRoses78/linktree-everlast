# Specs

Pro Feature eine eigene Datei: `01-<feature>.md`, `02-<feature>.md`, ...

Reihenfolge folgt Abhängigkeiten (was braucht was zuerst).

## Spec-Template

Kopiere für jeden neuen Spec-File:

```markdown
# NN — <Feature-Name>

**Status:** ⏳ Geplant / 🚧 In Arbeit / ✅ Fertig

## Ziel

<1-2 Sätze: was tut dieses Feature, warum brauchen wir es?>

## Abhängigkeiten

- Spec NN-<vorgänger>: <warum>
- ...

## Out of Scope

- <Was bewusst NICHT in diesem Feature ist>

## Akzeptanzkriterien

- [ ] <Konkretes, abhakbares Kriterium>
- [ ] <...>

## Tasks

- [ ] <Konkrete Implementierungsschritte>

## Validation

Welche Stopp-Kriterien aus `rules/verification.md` gelten:
- <Schema / Auth / UI / API / Deployment>

## Relevante Rules / Skills

- `rules/design-system.md` (falls UI)
- `superpowers:test-driven-development` (falls Server-Side)
- ...

## Debrief

<Nach Phase 4 ausfüllen: was war überraschend, was würde ich anders machen, was habe ich gelernt?>
```
