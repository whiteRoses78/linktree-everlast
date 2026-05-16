import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInForm } from "./sign-in-form";

export const metadata = {
  title: "Anmelden",
};

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  // Nur interne Pfade durchreichen — finale Validierung passiert in der Action.
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : undefined;

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Anmelden</CardTitle>
          <CardDescription>Willkommen zurück.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm next={next} />
        </CardContent>
      </Card>
    </div>
  );
}
