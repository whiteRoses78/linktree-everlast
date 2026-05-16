import { z } from "zod";

/**
 * UsernameSchema — die wichtigste Validation in der ganzen App.
 *
 * Der Username taucht in der URL auf (`/u/<username>`), ist permanent (MVP)
 * und für andere User sichtbar. Deine Regeln hier prägen, wie die URLs aussehen.
 *
 * Entscheidungen, die du treffen musst:
 *
 * 1. MIN-Länge:
 *    - 3 = kollidiert mit `api`, `www`, `u` (Reserved-Words)
 *    - 4 = sicherer, aber kürzer ist cooler
 *    - Empfehlung: 3 OK, weil Reserved-Words ja separat blockiert werden.
 *
 * 2. MAX-Länge:
 *    - DB-Constraint? (check `database.types.ts` — wahrscheinlich `text` ohne Limit)
 *    - UX: 30 ist Twitter-Standard, 15 wäre kompakter.
 *
 * 3. Erlaubte Zeichen (regex):
 *    - `[a-z0-9_]` = strikt, lesbar, URL-safe
 *    - `[a-z0-9_-]` = erlaubt Bindestriche (z.B. "marco-lemke")
 *    - `[a-zA-Z0-9_]` = Großbuchstaben? Dann musst du beim Login case-insensitive matchen.
 *
 * 4. Case-Folding:
 *    - User tippt "Marco" → speicherst du "marco" oder "Marco"?
 *    - Wenn DB lowercase erzwingt: `.transform(s => s.toLowerCase())`.
 *
 * Sicherheits-Hinweis: Diese Validierung läuft NUR auf dem Client + Server.
 * Die echte Garantie kommt aus DB-Constraints (UNIQUE auf username).
 */
export const UsernameSchema = z
  .string()
  .min(3, "Username muss mindestens 3 Zeichen haben.")
  .max(30, "Username darf höchstens 30 Zeichen haben.")
  .regex(
    /^[a-z0-9_]+$/,
    "Nur kleine Buchstaben, Zahlen und Unterstriche erlaubt.",
  );

/**
 * EmailSchema und PasswordSchema sind weniger spannend — Supabase macht
 * Server-side Validation. Aber Client-seitig wollen wir frühe Fehler.
 */
export const EmailSchema = z.string().email("Bitte gib eine gültige E-Mail-Adresse ein.");

export const PasswordSchema = z
  .string()
  .min(6, "Mindestens 6 Zeichen (Supabase-Default)."); // Supabase enforced 6+ by default

export const SignUpSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  username: UsernameSchema,
});

export const SignInSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Passwort fehlt."), // beim Login KEINE Längen-Validierung — bestehende User könnten kürzere PWs haben
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type SignInInput = z.infer<typeof SignInSchema>;
