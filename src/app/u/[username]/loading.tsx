import { Skeleton } from "@/components/ui/skeleton";

/**
 * Public-Page-Loading-State.
 *
 * Wird automatisch via React Suspense gerendert, während `page.tsx`
 * die Profile- und Links-Queries auflöst. Bewusst neutral gestaltet
 * (kein Per-User-Accent verfügbar bevor Profile geladen ist).
 */
export default function PublicProfileLoading() {
  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto max-w-md px-6 py-12">
        {/* Avatar + Display-Name + Bio */}
        <header className="flex flex-col items-center gap-4 text-center">
          <Skeleton className="h-24 w-24 rounded-full md:h-28 md:w-28" />
          <Skeleton className="h-7 w-40" />
          <div className="w-full max-w-xs space-y-2">
            <Skeleton className="mx-auto h-4 w-3/4" />
            <Skeleton className="mx-auto h-4 w-1/2" />
          </div>
        </header>

        {/* Link-Cards */}
        <ul className="mt-10 space-y-3">
          <li>
            <Skeleton className="h-12 w-full rounded-2xl" />
          </li>
          <li>
            <Skeleton className="h-12 w-full rounded-2xl" />
          </li>
          <li>
            <Skeleton className="h-12 w-full rounded-2xl" />
          </li>
        </ul>
      </div>
    </main>
  );
}
