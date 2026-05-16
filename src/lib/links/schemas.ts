import { z } from "zod";

export const LinkTitleSchema = z
  .string()
  .trim()
  .min(1, "Titel darf nicht leer sein.")
  .max(64, "Titel darf höchstens 64 Zeichen haben.");

/**
 * Spec-05-Sicherheitsnotiz: nur `https://` akzeptiert.
 *
 * `.url()` lehnt schon Whitespace/Newlines und kaputte Schemas ab,
 * `.startsWith("https://")` blockt `http:`, `ftp:`, `data:`, `javascript:`.
 * Beide zusammen sind die saubere Filterkette.
 */
export const LinkUrlSchema = z
  .string()
  .trim()
  .url("Bitte gib eine gültige URL ein.")
  .startsWith("https://", "Nur HTTPS-URLs erlaubt.")
  .max(2048, "URL ist zu lang.");

export const LinkInputSchema = z.object({
  title: LinkTitleSchema,
  url: LinkUrlSchema,
});

export type LinkInput = z.infer<typeof LinkInputSchema>;
