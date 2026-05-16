import Link from "next/link";

/**
 * Globaler App-Footer — wird im RootLayout gemountet, ist also auf
 * jeder Page sichtbar (auch im iframe-Preview im Dashboard, damit
 * Impressum + Datenschutz von überall erreichbar sind).
 *
 * Hält bewusst nur die rechtlichen Pflichtlinks. Der "Erstellt mit
 * linktree-app"-Brand-Footer auf Public-Pages bleibt separat
 * (PageFooter, mit isPreview-Skip).
 */
export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card/30">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-medium text-foreground/80">linktree-app</span>
          {" · "}
          <span className="rounded-full bg-muted px-2 py-0.5">Demo</span>
        </p>
        <nav className="flex items-center gap-4">
          <Link
            href="/impressum"
            className="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Impressum
          </Link>
          <Link
            href="/datenschutz"
            className="rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Datenschutz
          </Link>
        </nav>
      </div>
    </footer>
  );
}
