import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Datenschutzerklärung für dieses Demo-Projekt: welche Daten verarbeitet werden und wo.",
  robots: { index: false, follow: false },
};

/**
 * Datenschutzerklärung — eigene Seite (NICHT als Card im Impressum),
 * weil DSGVO Art. 13/14 eine leicht zugängliche, separate Erklärung
 * verlangt.
 *
 * Inhaltlicher Stand: Demo-Projekt nutzt Supabase (Auth + Postgres,
 * EU-Region) und Vercel (Hosting). Keine Analytics, kein Tracking,
 * kein Newsletter. Sobald sich der Stack ändert, muss diese Seite
 * angepasst werden.
 */
export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 md:py-16">
      <div className="space-y-8">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Rechtliches
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Datenschutz
          </h1>
          <p className="text-sm text-muted-foreground">
            Stand: Mai 2026
          </p>
        </header>

        <section className="rounded-2xl border border-dashed bg-muted/40 p-6">
          <h2 className="text-base font-semibold">Hinweis: Demo-Projekt</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Diese App wird als Lehr-/Demo-Projekt betrieben. Daten können
            jederzeit zurückgesetzt oder gelöscht werden, ohne
            Vorankündigung. Speichere keine personenbezogenen Daten, auf
            deren dauerhafte Verfügbarkeit du angewiesen bist.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Verantwortlich</h2>
          <p className="text-sm text-muted-foreground">
            Verantwortlicher im Sinne der DSGVO ist die im Impressum
            genannte Person. Kontaktweg: über das öffentliche GitHub-
            Repository.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">2. Welche Daten werden verarbeitet?</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Konto-Daten:</strong>{" "}
              E-Mail-Adresse, Passwort-Hash, Username — bei der Registrierung
              freiwillig angegeben.
            </li>
            <li>
              <strong className="text-foreground">Profil-Daten:</strong>{" "}
              Display-Name, Bio, Avatar-URL, Akzentfarbe — selbst eingegeben,
              jederzeit änderbar oder löschbar.
            </li>
            <li>
              <strong className="text-foreground">Links:</strong> Titel und
              URL der von dir gesammelten Links.
            </li>
            <li>
              <strong className="text-foreground">Session-Cookies:</strong>{" "}
              technisch notwendig, um deinen Login zu halten. Keine
              Tracking-Cookies.
            </li>
            <li>
              <strong className="text-foreground">Server-Logs:</strong> Vercel
              speichert kurzzeitig IP-Adressen + User-Agent zur
              Missbrauchs-Erkennung.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">3. Wo werden die Daten gespeichert?</h2>
          <ul className="list-disc space-y-3 pl-5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Supabase</strong>{" "}
              (Authentication + Postgres-Datenbank). Anbieter: Supabase Inc.
              Daten werden in der Region gespeichert, die beim Projekt-Setup
              gewählt wurde. Datenschutz:{" "}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                supabase.com/privacy
              </a>
            </li>
            <li>
              <strong className="text-foreground">Vercel</strong>{" "}
              (Hosting + Edge-Network). Anbieter: Vercel Inc. Datenschutz:{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                vercel.com/legal/privacy-policy
              </a>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Es werden keine Analytics-, Tracking- oder
            Werbe-Drittanbieter eingebunden. Keine Newsletter, keine
            Embeds zu externen Plattformen außer den von dir selbst
            eingetragenen Links.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">4. Rechtsgrundlage</h2>
          <p className="text-sm text-muted-foreground">
            Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO) für Konto- und
            Profildaten, berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO)
            für Server-Logs zur Missbrauchsabwehr.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">5. Deine Rechte</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Auskunft</strong> (Art. 15)
              — du kannst eine Kopie deiner gespeicherten Daten anfordern.
            </li>
            <li>
              <strong className="text-foreground">Berichtigung</strong>{" "}
              (Art. 16) — du kannst falsche Daten direkt im Dashboard
              korrigieren oder über GitHub eine Korrektur anfragen.
            </li>
            <li>
              <strong className="text-foreground">Löschung</strong> (Art. 17)
              — du kannst dein Konto inklusive aller Daten jederzeit
              löschen lassen. Schreib dazu via GitHub-Repo. Profile + Links
              werden via Cascade-Delete zusammen mit dem Auth-User entfernt.
            </li>
            <li>
              <strong className="text-foreground">Widerspruch</strong>{" "}
              (Art. 21) — du kannst der Verarbeitung jederzeit widersprechen.
              Das beendet die Nutzung der App.
            </li>
            <li>
              <strong className="text-foreground">
                Beschwerde bei einer Aufsichtsbehörde
              </strong>{" "}
              (Art. 77) — z.B. beim Landesbeauftragten für Datenschutz
              Baden-Württemberg.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">6. Änderungen</h2>
          <p className="text-sm text-muted-foreground">
            Diese Datenschutzerklärung wird angepasst, sobald sich die
            technische Architektur ändert (z.B. neue Drittanbieter,
            Analytics). Stand jeweils oben dokumentiert.
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
