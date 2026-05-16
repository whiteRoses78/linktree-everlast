import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/**
 * Globale 404 — wird für alle Pfade gerendert, die nicht zu einem
 * route-Segment matchen (z.B. `/foo`, `/dashboard/typo`).
 *
 * Für reservierte oder nicht existierende Profile-Pfade
 * (`/u/admin`, `/u/nonexistent`) greift `/u/[username]/not-found.tsx`
 * mit projektspezifischem Messaging — diese hier ist der generische
 * Fallback für alles andere.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-12">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Diese Seite gibt es nicht.
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Vielleicht hast du dich vertippt, oder die Seite ist umgezogen.
          Kein Drama — zurück zur Startseite und neu starten.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            Zur Startseite
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Anmelden
          </Link>
        </div>
      </div>
    </main>
  );
}
