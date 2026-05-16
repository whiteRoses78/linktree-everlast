/**
 * Reserved Usernames — diese Namen darf KEIN User registrieren.
 *
 * Warum?
 * 1. Routing-Kollisionen: `/u/admin` würde mit einer zukünftigen `/admin`-Route
 *    konkurrieren. Better: jetzt blocken als später migrieren.
 * 2. Identitäts-Schutz: Niemand soll sich als "admin" oder "support" ausgeben.
 * 3. Next.js Internals: `_next` ist ein Framework-Pfad.
 *
 * Faustregel: lieber 5 zu viel als 1 zu wenig. Lockern geht immer, neue
 * Reserved-Words nach Launch wären eine Migration.
 */
export const RESERVED_USERNAMES = [
  // Spec-Baseline
  "admin", "root", "api", "auth", "login", "logout", "signup", "dashboard",
  "settings", "u", "_next", "www",
  // Service / Support
  "support", "help", "contact", "terms", "privacy", "info", "mail",
  // Routing-Reserven für künftige Pages
  "about", "blog", "docs", "faq", "status", "home", "me", "profile",
  "explore", "search", "discover",
  // Auth-Adjacent
  "register", "signin", "reset", "verify", "confirm", "oauth",
  // Brand-Schutz
  "linktree", "bento", "beacons", "linko",
] as const;

/**
 * Prüft, ob ein Username reserviert ist.
 * WICHTIG: Server-side aufrufen (Client-Check ist nur UX, Security braucht Server-Check).
 */
export function isReserved(username: string): boolean {
  return (RESERVED_USERNAMES as readonly string[]).includes(username.toLowerCase());
}
