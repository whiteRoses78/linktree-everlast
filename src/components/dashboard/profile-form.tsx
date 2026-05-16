"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, type UpdateProfileState } from "@/app/dashboard/actions";

/**
 * Initial-State der `useActionState`-Maschine.
 *
 * Lokal definiert, NICHT aus `actions.ts` exportiert:
 * Dateien mit `"use server"`-Directive dürfen nur async functions exportieren —
 * Object-Constants triggern „A 'use server' file can only export async functions".
 */
const INITIAL_STATE: UpdateProfileState = { status: "idle", ts: 0 };
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const BIO_MAX_LENGTH = 280;

type ProfileFormProps = {
  initialProfile: {
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    accent_color: string;
  };
  /**
   * Wird vom Parent (EditorShell) übergeben, damit der iframe-Preview
   * nach erfolgreichem Save den neuen `state.ts` als `key` bekommt.
   */
  onResult?: (state: UpdateProfileState) => void;
};

export function ProfileForm({ initialProfile, onResult }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfile, INITIAL_STATE);

  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [accent, setAccent] = useState(initialProfile.accent_color);

  const lastTsRef = useRef(0);
  useEffect(() => {
    if (state.status !== "idle" && state.ts !== lastTsRef.current) {
      lastTsRef.current = state.ts;
      onResult?.(state);
    }
  }, [state, onResult]);

  const fieldError = (key: string) =>
    state.status === "error" ? state.fieldErrors?.[key] : undefined;

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <FormField
        id="display_name"
        label="Display-Name"
        hint="Wird oben auf deiner Public-Page angezeigt."
        error={fieldError("display_name")}
      >
        <Input
          id="display_name"
          name="display_name"
          type="text"
          maxLength={64}
          defaultValue={initialProfile.display_name ?? ""}
          autoComplete="off"
          placeholder="Wie sollen dich Besucher nennen?"
        />
      </FormField>

      <FormField
        id="bio"
        label="Bio"
        hint="Kurze Beschreibung — wer du bist, was du machst."
        error={fieldError("bio")}
      >
        <Textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={BIO_MAX_LENGTH}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Erzähl etwas über dich (max. 280 Zeichen)."
          className="resize-none"
        />
        <BioCounter length={bio.length} max={BIO_MAX_LENGTH} />
      </FormField>

      <FormField
        id="avatar_url"
        label="Avatar-URL"
        hint="HTTPS-Link zu einem Bild (optional). z.B. https://example.com/avatar.jpg"
        error={fieldError("avatar_url")}
      >
        <Input
          id="avatar_url"
          name="avatar_url"
          type="url"
          inputMode="url"
          defaultValue={initialProfile.avatar_url ?? ""}
          autoComplete="off"
          placeholder="https://…"
        />
      </FormField>

      <FormField
        id="accent_color"
        label="Akzentfarbe"
        hint="Wird auf deiner Public-Page für Hover-Effekte und Buttons verwendet."
        error={fieldError("accent_color")}
      >
        <div className="flex items-center gap-3">
          <input
            id="accent_color"
            name="accent_color"
            type="color"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
            pattern="^#[0-9a-fA-F]{6}$"
            aria-label="Farbwähler"
            className="h-12 w-12 cursor-pointer rounded-lg border border-input bg-transparent p-1 transition-colors hover:border-ring focus-visible:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <div
            aria-hidden="true"
            className="h-12 flex-1 rounded-lg border border-input shadow-sm"
            style={{ backgroundColor: accent }}
          />
          <code className="rounded-md bg-muted px-2.5 py-1 font-mono text-sm tabular-nums uppercase">
            {accent}
          </code>
        </div>
      </FormField>

      <div className="flex items-center gap-3">
        <SubmitButton />
        {state.status === "success" ? (
          <span
            key={state.ts}
            className="text-sm text-muted-foreground animate-in fade-in duration-300"
            aria-live="polite"
          >
            Gespeichert ✓
          </span>
        ) : null}
        {state.status === "error" && !state.fieldErrors ? (
          <span
            key={state.ts}
            className="text-sm text-destructive"
            aria-live="polite"
          >
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

function FormField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Speichere…" : "Profil speichern"}
    </Button>
  );
}

function BioCounter({ length, max }: { length: number; max: number }) {
  const remaining = max - length;
  const color =
    remaining <= 0
      ? "text-destructive"
      : remaining < 40
        ? "text-amber-600 dark:text-amber-400"
        : "text-muted-foreground";

  return (
    <p className={cn("text-xs tabular-nums", color)} aria-live="polite">
      {length} / {max}
    </p>
  );
}
