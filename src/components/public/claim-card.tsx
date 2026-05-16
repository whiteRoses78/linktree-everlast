import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

type ClaimCardProps = {
  username: string;
};

/**
 * Claim-Card: wird gerendert, wenn ein Username weder reserved noch in der DB ist.
 *
 * Conversion-Pfad: CTA → /signup?username=<value> (siehe Spec 06 + Sign-Up Pre-Fill).
 * Bewusst KEIN aggressives "Join Linktree"-Wording (siehe Spec Out-of-Scope #4).
 */
export function ClaimCard({ username }: ClaimCardProps) {
  const signupHref = `/signup?username=${encodeURIComponent(username)}`;

  return (
    <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Noch frei
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">
        @{username}
      </h1>
      <p className="mt-3 text-base text-muted-foreground">
        Dieser Username ist noch zu haben. Sichere ihn dir, bevor jemand
        anderes ihn nimmt.
      </p>
      <Link
        href={signupHref}
        className={buttonVariants({ size: "lg", className: "mt-6 w-full" })}
      >
        Diesen Namen sichern
      </Link>
      <p className="mt-4 text-xs text-muted-foreground">
        Ist das deine Marke? Greif sie dir jetzt.
      </p>
    </section>
  );
}
