import Link from "next/link";

type PageFooterProps = {
  isPreview?: boolean;
};

/**
 * Public-Page-Footer: dezenter Verweis auf die Plattform.
 *
 * `isPreview`-Prop: wenn die Page als iframe-Preview im Dashboard läuft
 * (`?preview=1`), blenden wir den Footer aus. Sonst hätten wir doppelte
 * Branding-Footer auf dem Dashboard.
 */
export function PageFooter({ isPreview = false }: PageFooterProps) {
  if (isPreview) return null;

  return (
    <footer className="mt-12 text-center text-xs text-muted-foreground">
      <Link
        href="/"
        className="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Erstellt mit linktree-app
      </Link>
    </footer>
  );
}
