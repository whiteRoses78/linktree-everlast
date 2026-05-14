# Implementierungsplan

Arbeitspaket-Tabelle. Reihenfolge folgt Abhängigkeiten — Design-Tokens vor UI-Komponenten, Auth vor Profilen, Profile vor Public-Pages.

## Status-Legende

- ⏳ Geplant
- 🚧 In Arbeit
- ✅ Fertig (Akzeptanzkriterien abgehakt, Debrief geschrieben)

## Arbeitspakete

| # | Feature | Spec | Abhängigkeiten | Status |
|---|---|---|---|---|
| 01 | Design-Tokens | [`specs/01-design-tokens.md`](specs/01-design-tokens.md) | — | ✅ |
| 02 | Supabase-Schema + RLS | [`specs/02-supabase-schema.md`](specs/02-supabase-schema.md) | 01 | ⏳ |
| 03 | Auth (Sign-Up, Sign-In, Sign-Out) | [`specs/03-auth.md`](specs/03-auth.md) | 02 | ⏳ |
| 04 | Profil-Editor (geschützt) | [`specs/04-profile-editor.md`](specs/04-profile-editor.md) | 03 | ⏳ |
| 05 | Links-CRUD | [`specs/05-links-crud.md`](specs/05-links-crud.md) | 04 | ⏳ |
| 06 | Public-Profil-Page (`/u/[username]`) | [`specs/06-public-page.md`](specs/06-public-page.md) | 05 | ⏳ |
| 07 | Per-User-Accent | [`specs/07-per-user-accent.md`](specs/07-per-user-accent.md) | 06 | ⏳ |
| 08 | Link-Reihenfolge ändern | [`specs/08-link-reordering.md`](specs/08-link-reordering.md) | 05 | ⏳ |
