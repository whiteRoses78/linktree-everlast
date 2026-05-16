import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/**
 * 404 für /u/[username] — wird automatisch von Next.js gerendert,
 * wenn die Page-Funktion `notFound()` aufruft (z.B. bei Reserved-Usernames).
 *
 * Bewusst kein generisches "Page not found" — projektpassendes Messaging.
 */
export default function ProfileNotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-12">
      <div className="mx-auto max-w-md text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Dieser Profilname ist nicht verfügbar.
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Manche Namen sind für die Plattform reserviert. Probier&apos;s mit
          einem anderen — oder leg dir dein eigenes Profil an.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/signup" className={buttonVariants({ size: "lg" })}>
            Konto erstellen
          </Link>
          <Link
            href="/"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
