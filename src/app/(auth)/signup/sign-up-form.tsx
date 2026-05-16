"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp, type ActionState } from "../actions";

const initialState: ActionState = { status: "idle" };

type SignUpFormProps = {
  defaultUsername?: string;
};

export function SignUpForm({ defaultUsername }: SignUpFormProps = {}) {
  const [state, formAction, isPending] = useActionState(signUp, initialState);
  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          inputMode="text"
          placeholder="z.B. marco_l"
          defaultValue={defaultUsername}
          aria-invalid={fieldErrors?.username ? true : undefined}
          aria-describedby={fieldErrors?.username ? "username-error" : undefined}
        />
        {fieldErrors?.username ? (
          <p id="username-error" className="text-sm text-destructive">
            {fieldErrors.username}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Wird Teil deiner URL: linktree-app/u/&lt;username&gt;
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="du@beispiel.de"
          aria-invalid={fieldErrors?.email ? true : undefined}
          aria-describedby={fieldErrors?.email ? "email-error" : undefined}
        />
        {fieldErrors?.email && (
          <p id="email-error" className="text-sm text-destructive">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={6}
          aria-invalid={fieldErrors?.password ? true : undefined}
          aria-describedby={fieldErrors?.password ? "password-error" : undefined}
        />
        {fieldErrors?.password && (
          <p id="password-error" className="text-sm text-destructive">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {state.status === "error" && !fieldErrors && (
        <p className="text-sm text-destructive" role="alert">
          {state.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Konto wird erstellt …" : "Konto erstellen"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Schon registriert?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Anmelden
        </Link>
      </p>
    </form>
  );
}
