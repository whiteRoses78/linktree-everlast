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
