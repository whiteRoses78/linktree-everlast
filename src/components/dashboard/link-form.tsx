"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  createLink,
  updateLink,
  type LinkActionState,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INITIAL_STATE: LinkActionState = { status: "idle", ts: 0 };

type LinkFormProps =
  | {
      mode: "create";
      onResult: (state: LinkActionState) => void;
      onCancel: () => void;
    }
  | {
      mode: "edit";
      link: { id: string; title: string; url: string };
      onResult: (state: LinkActionState) => void;
      onCancel: () => void;
    };

export function LinkForm(props: LinkFormProps) {
  const boundAction =
    props.mode === "edit"
      ? updateLink.bind(null, props.link.id)
      : createLink;

  const [state, formAction] = useActionState(boundAction, INITIAL_STATE);

  const lastTsRef = useRef(0);
  useEffect(() => {
    if (state.status !== "idle" && state.ts !== lastTsRef.current) {
      lastTsRef.current = state.ts;
      props.onResult(state);
    }
  }, [state, props]);

  const fieldError = (key: string) =>
    state.status === "error" ? state.fieldErrors?.[key] : undefined;

  const defaultTitle = props.mode === "edit" ? props.link.title : "";
  const defaultUrl = props.mode === "edit" ? props.link.url : "";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="link-title">Titel</Label>
        <Input
          id="link-title"
          name="title"
          type="text"
          maxLength={64}
          defaultValue={defaultTitle}
          autoFocus
          autoComplete="off"
          placeholder="z.B. GitHub, Spotify, mein Blog"
        />
        {fieldError("title") ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldError("title")}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="link-url">URL</Label>
        <Input
          id="link-url"
          name="url"
          type="url"
          inputMode="url"
          defaultValue={defaultUrl}
          autoComplete="off"
          placeholder="https://..."
        />
        {fieldError("url") ? (
          <p className="text-sm text-destructive" role="alert">
            {fieldError("url")}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Nur HTTPS-URLs.</p>
        )}
      </div>

      {state.status === "error" && !state.fieldErrors ? (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={props.onCancel}>
          Abbrechen
        </Button>
        <SubmitButton mode={props.mode} />
      </div>
    </form>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  const idle = mode === "edit" ? "Speichern" : "Link hinzufügen";
  const busy = mode === "edit" ? "Speichere…" : "Lege an…";
  return (
    <Button type="submit" disabled={pending}>
      {pending ? busy : idle}
    </Button>
  );
}
