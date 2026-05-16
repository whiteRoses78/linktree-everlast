type PublicLink = { id: string; title: string; url: string };

type LinkListProps = {
  links: PublicLink[];
};

/**
 * Public-Linkliste als Card-Stack.
 *
 * - `target="_blank" + rel="noopener noreferrer"` — verhindert
 *   `window.opener`-Hijacking durch verlinkte Seiten.
 * - `min-h-12` (=48px) erfüllt das Tap-Target-Minimum aus Spec 06.
 * - Hover-Lift via `-translate-y-0.5 + shadow-md`, beides smooth.
 */
export function LinkList({ links }: LinkListProps) {
  if (links.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-card/50 p-8 text-center">
        <p className="text-base font-medium text-foreground">
          Hier wird&apos;s bald spannend.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Diese Seite wird gerade eingerichtet.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "var(--accent)",
              color: "var(--accent-foreground)",
              ["--tw-ring-color" as string]: "var(--accent)",
            }}
            className="block min-h-12 rounded-2xl px-5 py-3 text-center font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0"
          >
            {link.title}
          </a>
        </li>
      ))}
    </ul>
  );
}
