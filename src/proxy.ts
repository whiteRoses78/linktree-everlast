import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Proxy (in Next 16 der neue Name für Middleware) läuft VOR jeder Request
 * auf dem matcher (siehe unten).
 *
 * Sie hat 3 Jobs:
 * 1. Session refreshen (Cookie aktuell halten). Ohne das fliegen User
 *    nach 1h aus, weil das Access-Token abläuft.
 * 2. Auth-Guard: unangemeldete User von `/dashboard/**` wegschicken.
 * 3. Reverse-Guard: angemeldete User von `/login` und `/signup` wegschicken
 *    (sonst verwirrend).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Request-Cookies refreshen (für nachgelagerte Reads in dieser Request)
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          // Response-Cookies setzen (für den Browser)
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // WICHTIG: getUser() — nicht getSession(). getSession liest nur das Cookie,
  // getUser verifiziert das JWT gegen Supabase.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname === "/login" || pathname === "/signup";
  const isProtectedRoute = pathname.startsWith("/dashboard");

  // C1: Auth-Guard — unangemeldete User raus aus /dashboard/**, mit ?next=
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // C2: Reverse-Guard — eingeloggte User raus aus /login + /signup
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match alle Routes AUSSER:
     * - _next/static (statische Files)
     * - _next/image (Image-Optimization)
     * - favicon.ico
     * - Bild-Endungen (svg/png/jpg/jpeg/gif/webp/ico)
     *
     * Das hält den Proxy schnell — er soll nicht für jedes Logo-Pixel laufen.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
