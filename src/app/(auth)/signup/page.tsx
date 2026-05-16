import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignUpForm } from "./sign-up-form";

export const metadata = {
  title: "Konto erstellen",
};

type SearchParams = Promise<{ username?: string }>;

/**
 * Pre-Fill via `?username=peter` — Conversion-Pfad von der Claim-Card.
 * Der Wert wird als `defaultValue` ins Username-Feld gereicht; der User
 * kann ihn überschreiben. Server-Validierung in `actions.ts` läuft normal.
 */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { username } = await searchParams;

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Konto erstellen</CardTitle>
          <CardDescription>
            Wähle einen Username, der unter <code>/u/</code> erscheinen wird.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm defaultUsername={username} />
        </CardContent>
      </Card>
    </div>
  );
}
