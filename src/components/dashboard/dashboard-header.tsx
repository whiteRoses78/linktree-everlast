import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

type DashboardHeaderProps = {
  username: string;
  displayName: string | null;
};

export function DashboardHeader({ username, displayName }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Link
          href="/dashboard"
          className="text-base font-semibold tracking-tight transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none"
        >
          linktree-app
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right text-sm sm:block">
            <p className="font-medium leading-tight">
              {displayName ?? `@${username}`}
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              /u/{username}
            </p>
          </div>

          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Abmelden
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
