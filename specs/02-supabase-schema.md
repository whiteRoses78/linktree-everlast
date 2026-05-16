# 02 — Supabase-Schema + RLS

**Status:** ✅ Fertig (2026-05-15)

## Ziel

DB-Schema in Supabase verifizieren, fehlende Spalten (`accent_color`) ergänzen, RLS-Policies sauber dokumentieren, TypeScript-Types in `src/lib/database.types.ts` generieren. Single Source of Truth für Datenmodell — alle anderen Specs nutzen diese Types.

## Abhängigkeiten

- Keine Code-Abhängigkeiten — kann parallel zu Spec 01 stehen
- Voraussetzung: Supabase-Projekt existiert, Email-Provider aktiv (Phase 1 Preflight)

## Out of Scope

- Avatar-Storage-Bucket (URL-Feld reicht — Vision #13)
- Click-Analytics-Tabelle (Vision Out-of-Scope)
- Mehrere Pages pro User (`pages`-Tabelle) — out of MVP

## Akzeptanzkriterien

- [x] `profiles`-Tabelle existiert mit Spalten: `id` (uuid, FK → `auth.users.id`), `username` (citext, UNIQUE, regex-CHECK `^[a-z0-9_-]{3,30}$`), `display_name` (text, nullable), `bio` (text, nullable), `avatar_url` (text, nullable), `accent_color` (text, NOT NULL, default `#6366f1`, CHECK regex `^#[0-9a-fA-F]{6}$`), `created_at` + `updated_at` (timestamptz)
- [x] `links`-Tabelle existiert mit Spalten: `id` (uuid, default `gen_random_uuid()`), `user_id` (uuid, FK → `auth.users.id`), `title` (text, NOT NULL), `url` (text, NOT NULL), `position` (int4, default 0), `is_active` (bool, default true), `created_at` (timestamptz)
- [x] **RLS aktiv** auf beiden Tabellen
- [x] RLS-Policies (siehe Policy-Set unten) — _Hinweis: zusätzlich `links: owner delete` + `profiles: owner delete` existieren; Account-Löschung läuft trotzdem über `auth.users`-Cascade._
- [x] TypeScript-Types nach `src/lib/database.types.ts` generiert (via `mcp__supabase__generate_typescript_types`)
- [x] Indexes: `profiles.username` (UNIQUE), `links.user_id, position` (für sortierte Liste)
- [x] `npm run build` läuft mit den neuen Types

## Tasks

- [x] Aktuellen Schema-Stand via `mcp__supabase__list_tables` verifizieren — 85 % schon da
- [x] **Fehlend hinzufügen:** `accent_color`-Spalte auf `profiles` (Migration `add_accent_color_to_profiles`)
- [x] **RLS-Policies prüfen** — alle vorhanden, plus zusätzliche DELETE-Policies
- [x] Security-Hardening: `REVOKE EXECUTE` auf `rls_auto_enable()`, redundanten Index droppen (Migration `security_hardening_…`)
- [x] TypeScript-Types via `mcp__supabase__generate_typescript_types` → `src/lib/database.types.ts`
- [x] Smoke-Test via Supabase MCP: Test-User in `auth.users`, Profil + 2 Links, CHECK-Negativ-Tests, Cascade-Delete-Verifikation
- [x] `npm run build` grün
- [x] `changelog.md`-Eintrag, `learning.md`-Eintrag

## Policy-Set

### `profiles`
```sql
-- öffentliche Read (Public-Page für jeden lesbar)
CREATE POLICY "profiles_public_read"
  ON profiles FOR SELECT
  USING (true);

-- User darf nur eigenes Profil updaten
CREATE POLICY "profiles_owner_update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- User darf nur eigenes Profil inserten (Trigger via Sign-Up-Action)
CREATE POLICY "profiles_owner_insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Kein DELETE (Account-Löschung läuft über Supabase Auth)
```

### `links`
```sql
-- öffentliche Read (Public-Page-Linkliste)
CREATE POLICY "links_public_read"
  ON links FOR SELECT
  USING (is_active = true);

-- User darf nur eigene Links manipulieren
CREATE POLICY "links_owner_all"
  ON links FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Migration für `accent_color`

```sql
ALTER TABLE profiles
  ADD COLUMN accent_color text NOT NULL DEFAULT '#6366f1'
  CONSTRAINT accent_color_hex_format
  CHECK (accent_color ~ '^#[0-9a-fA-F]{6}$');
```

## Validation

Aus `rules/verification.md` → **Supabase-Schema**:
- [ ] Tabellen existieren via `mcp__supabase__list_tables`
- [ ] RLS aktiv auf beiden
- [ ] Policies definiert
- [ ] Types regeneriert
- [ ] Foreign Keys (Cascade vs Restrict): `profiles.id → auth.users.id` ist Cascade-Delete (User löschen = Profil weg); `links.user_id → auth.users.id` ebenfalls Cascade

## Relevante Rules / Skills

- `rules/verification.md` — Schema-Section
- `mcp__supabase__*` — Tooling
- `references/discovery.md` Abschnitt 3 — Theming-Validation 3-stufig (DB-CHECK ist Last-Line)
- `references/vision.md` #11–#13, #16–#18

## Debrief

**Was lief gut:** Spec war präzise genug, dass "verifizieren statt blind apply" gleich erkennbar war. Security-Advisor proaktiv gelesen — zwei Findings (`rls_auto_enable` REST-Exposure, redundanter Username-Index) gleich mit erledigt. Smoke-Test über CHECK-Constraints isoliert via UPDATE statt INSERT — sauberer Beweis dass DDL-Schutz greift, nicht nur FK.

**Was war Plot-Twist:** `DROP FUNCTION rls_auto_enable()` ist fehlgeschlagen, weil ein Event-Trigger `ensure_rls` daran hängt. Marco hatte initial DROP gewählt, ich habe ihn auf REVOKE umgelenkt, weil der Auto-RLS-Trigger ein wertvoller Backstop ist (vergisst man `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in einer künftigen Migration, fängt der Trigger das ab).

**Folgen für nächste Specs:** `database.types.ts` ist die Single Source of Truth für Spec 03–08. Bei jeder Schema-Änderung neu generieren. Vor jedem Deploy `get_advisors` laufen lassen.
