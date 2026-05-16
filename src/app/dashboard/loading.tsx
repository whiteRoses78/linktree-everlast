import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard-Loading-State.
 *
 * Wird automatisch via React Suspense gerendert, während `page.tsx`
 * die async DB-Lookups (Profile + Links) auflöst.
 *
 * Der `layout.tsx` (Header + Container) bleibt gemounted — nur die
 * Page-Inhalte werden ersetzt. Skeleton spiegelt deshalb genau die
 * Form von `<EditorShell>`, damit beim Content-Wechsel kein Layout-
 * Shift entsteht.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header: Profil / Untertitel */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Mobile-Tab-Toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 md:hidden">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>

      {/* Split-Grid wie EditorShell */}
      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        {/* Editor-Spalte */}
        <section className="space-y-8">
          {/* ProfileForm-Skeleton */}
          <div className="space-y-4">
            <FieldSkeleton labelWidth="w-24" />
            <FieldSkeleton labelWidth="w-16" inputClass="h-20" />
            <FieldSkeleton labelWidth="w-28" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <Skeleton className="h-12 flex-1 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-11 w-40" />
          </div>

          {/* Separator-Skeleton */}
          <div className="h-px w-full bg-border" />

          {/* LinkList-Skeleton */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-10 w-40" />
            </div>
            <div className="space-y-2">
              <LinkCardSkeleton />
              <LinkCardSkeleton />
              <LinkCardSkeleton />
            </div>
          </div>
        </section>

        {/* Preview-Spalte (nur Desktop sichtbar — Mobile lebt im Tab-Toggle) */}
        <section className="hidden md:block">
          <Skeleton className="aspect-[9/16] w-full rounded-2xl" />
        </section>
      </div>
    </div>
  );
}

function FieldSkeleton({
  labelWidth,
  inputClass = "h-10",
}: {
  labelWidth: string;
  inputClass?: string;
}) {
  return (
    <div className="space-y-2">
      <Skeleton className={`h-4 ${labelWidth}`} />
      <Skeleton className={`${inputClass} w-full rounded-lg`} />
    </div>
  );
}

function LinkCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl border bg-card p-4">
      <Skeleton className="h-5 w-5" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-10 w-10 rounded-lg" />
      <Skeleton className="h-10 w-10 rounded-lg" />
    </div>
  );
}
