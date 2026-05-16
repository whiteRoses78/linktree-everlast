import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Angaben zum Betreiber dieses Demo-Projekts (Masterclass Agentic Coding).",
  robots: { index: false, follow: false },
};

/**
 * Impressum-Seite.
 *
 * Dieses Projekt läuft als Kurs-/Demo-Projekt (Masterclass Agentic
 * Coding) ohne kommerzielle Absicht und ohne produktiven Betrieb.
 * Das gesamte Projekt wird via `<meta name="robots" content="noindex">`
 * von Suchmaschinen ausgeschlossen, um die TMG/DSGVO-Grauzone für
 * private Lernprojekte zu wahren.
 *
 * Vor einem produktiven Betrieb MUSS dieses Impressum durch echte
 * Angaben (Name, Anschrift, E-Mail, Telefon — letztere beiden Pflicht
 * laut BGH VI ZR 196/08) ersetzt werden.
 */
export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Rechtliches
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Impressum</h1>
        </header>

        <section className="rounded-2xl border border-dashed bg-muted/40 p-6">
          <h2 className="text-base font-semibold">Hinweis: Demo-Projekt</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Dieses Projekt ist ein nicht-kommerzielles Lehr- und
            Demonstrationsprojekt im Rahmen der „Masterclass Agentic
            Coding". Es wird nicht produktiv betrieben, es findet kein
            geschäftsmäßiger Angebotsbetrieb statt. Die Seite ist via{" "}
            <code className="font-mono text-xs">noindex</code> von der
            Suchmaschinen-Indexierung ausgenommen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Verantwortlich</h2>
          <p className="text-sm text-muted-foreground">
            Privates Lernprojekt im Kontext eines Weiterbildungsangebots.
            Kein gewerblicher Anbieter im Sinne von § 5 TMG. Für inhaltliche
            Anfragen oder Hinweise nutze bitte das öffentliche Repository.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Quellcode &amp; Kontakt</h2>
          <p className="text-sm text-muted-foreground">
            Der vollständige Quellcode dieses Projekts ist öffentlich
            einsehbar. Issues und Pull-Requests dort sind der bevorzugte
            Kontaktweg für technische Fragen oder Hinweise.
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">GitHub: </span>
            <span className="font-mono text-foreground">
              (wird beim Deploy in Phase 6 verlinkt)
            </span>
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Haftung für Inhalte</h2>
          <p className="text-sm text-muted-foreground">
            Da Profile und Links durch registrierte Nutzer:innen selbst
            angelegt werden, übernimmt der Betreiber für nutzergenerierte
            Inhalte keine Verantwortung im Sinne von § 7 Abs. 2 TMG. Bei
            Bekanntwerden rechtswidriger Inhalte werden diese unverzüglich
            entfernt.
          </p>
        </section>

        <div className="pt-4">
          <Link href="/" className={buttonVariants({ variant: "outline" })}>
            Zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
