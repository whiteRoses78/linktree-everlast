import { z } from "zod";

/**
 * Empty-String → null. Optional-Text-Felder in Formularen kommen als "" rein,
 * die DB-Spalte ist aber nullable — sonst rendert das Frontend später
 * `bio.length === 0` statt `bio === null` und Empty-States triggern nicht.
 */
const emptyToNull = (val: unknown) =>
  typeof val === "string" && val.trim() === "" ? null : val;

export const DisplayNameSchema = z
  .preprocess(
    emptyToNull,
    z
      .string()
      .trim()
      .min(1, "Display-Name darf nicht leer sein.")
      .max(64, "Display-Name darf höchstens 64 Zeichen haben.")
      .nullable(),
  );

export const BioSchema = z.preprocess(
  emptyToNull,
  z
    .string()
    .max(280, "Bio darf höchstens 280 Zeichen haben.")
    .nullable(),
);

/**
 * Avatar-URL: nur `https://` akzeptiert. Spec 04 Validation #3.
 * `.url()` allein würde `ftp://`, `data:`, `javascript:` durchlassen —
 * `.startsWith()` ist die Security-Schicht gegen XSS via img-src.
 */
export const AvatarUrlSchema = z.preprocess(
  emptyToNull,
  z
    .string()
    .url("Bitte gib eine gültige URL ein.")
    .startsWith("https://", "Nur HTTPS-URLs erlaubt.")
    .max(2048, "URL ist zu lang.")
    .nullable(),
);

/**
 * Accent-Color: 6-stelliges Hex, lowercase nach Validation.
 * Erste Schicht der 3-stufigen Theming-Validation (Vision #17):
 *   Pattern (Client `<input pattern>`) → Zod (hier) → DB CHECK Constraint.
 * Reicht jede Schicht für sich? Nein — alle drei zusammen sind Defense-in-Depth.
 */
export const AccentColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, "Bitte einen 6-stelligen Hex-Wert eingeben (z.B. #6366f1).")
  .transform((val) => val.toLowerCase());

export const ProfileUpdateSchema = z.object({
  display_name: DisplayNameSchema,
  bio: BioSchema,
  avatar_url: AvatarUrlSchema,
  accent_color: AccentColorSchema,
});

export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
