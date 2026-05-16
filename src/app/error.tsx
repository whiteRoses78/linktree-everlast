"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Globaler Error-Boundary für unerwartete Crashes in Server-/Client-
 * Components (außerhalb von `(auth)` und `dashboard`-Segments, die
 * ggf. eigene `error.tsx` haben können).
 *
 * Next.js Convention:
 *   - MUSS Client Component sein (`"use client"`)
 *   - Bekommt `error` (mit optionalem `digest`) + `reset` als Props
 *   - `reset()` triggert einen Re-Render des Subtrees, der gecrasht ist
 *
 * Im Dev-Modus zeigt Next.js zusätzlich die Error-Overlay über diesem
 * Component — das ist erwartet und nicht abschaltbar.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In Production würde hier ein Sentry/PostHog-Capture sinnvoll sein.
    // Für MVP genügt die Browser-Console.
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-12">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-destructive">
          Fehler
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Da ist etwas schiefgelaufen.
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Wir haben den Fehler nicht erwartet. Versuch&apos;s gleich noch
          einmal — wenn&apos;s wieder passiert, lade die Seite neu.
        </p>
        {error.digest ? (
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            Referenz: {error.digest}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={reset}>
            Erneut versuchen
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => window.location.assign("/")}
          >
            Zur Startseite
          </Button>
        </div>
      </div>
    </main>
  );
}
