import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Bestätige deine E-Mail",
};

type SearchParams = Promise<{ email?: string }>;

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { email } = await searchParams;

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Fast geschafft</CardTitle>
          <CardDescription>
            {email ? (
              <>
                Wir haben dir eine Bestätigungsmail an{" "}
                <span className="font-medium text-foreground">{email}</span>{" "}
                geschickt.
              </>
            ) : (
              <>Wir haben dir eine Bestätigungsmail geschickt.</>
            )}{" "}
            Klick auf den Link, um deinen Account zu aktivieren.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Keine Mail im Posteingang? Schau im Spam-Ordner nach. Die Zustellung
            dauert in seltenen Fällen ein paar Minuten.
          </p>
          <p>
            Falsche E-Mail-Adresse?{" "}
            <Link
              href="/signup"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Nochmal von vorn
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
