/**
 * Proxy Next.js 16 — migration depuis middleware.ts
 *
 * Ce fichier remplace l’ancien middleware conformément à la convention proxy
 * de Next.js 16. Il s’exécute en amont des routes (redirects, rewrites, auth).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 * @see https://nextjs.org/docs/messages/middleware-to-proxy
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Routes publiques accessibles sans authentification */
const publicRoutes = ["/", "/login", "/register"];

/** Mapping des rôles vers leurs portails */
const roleBasePaths: Record<string, string> = {
  client: "/client",
  architecte: "/architecte",
  technicien: "/technicien",
  "bureau-controle": "/bureau-controle",
  comptable: "/comptable",
  ouvrier: "/ouvrier",
  "maitre-ouvrage": "/maitre-ouvrage",
  juriste: "/juriste",
  dg: "/dg",
  admin: "/admin",
};

/**
 * Proxy principal — même comportement que l’ancien middleware.
 * Actuellement : laisser passer toutes les requêtes (auth désactivée).
 */
export function proxy(request: NextRequest) {
  // 🔓 AUTHENTIFICATION DÉSACTIVÉE TEMPORAIREMENT
  // Pour réactiver l'authentification, décommentez le bloc ci-dessous.

  /*
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(
    process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || "nice-auth-token"
  )?.value;
  const userRole = request.cookies.get(
    process.env.NEXT_PUBLIC_ROLE_COOKIE_NAME || "user-role"
  )?.value;

  if (publicRoutes.includes(pathname)) {
    if (token && userRole && roleBasePaths[userRole]) {
      return NextResponse.redirect(
        new URL(roleBasePaths[userRole], request.url)
      );
    }
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (userRole && roleBasePaths[userRole]) {
    const authorizedPath = roleBasePaths[userRole];
    const isAccessingOwnPortal = pathname.startsWith(authorizedPath);

    if (!isAccessingOwnPortal) {
      const isAccessingOtherPortal = Object.values(roleBasePaths).some((path) =>
        pathname.startsWith(path)
      );
      if (isAccessingOtherPortal) {
        return NextResponse.redirect(new URL(authorizedPath, request.url));
      }
    }
  }
  */

  return NextResponse.next();
}

/**
 * Matcher : mêmes exclusions que l’ancien middleware.
 * Le proxy ne s’applique pas aux fichiers statiques, _next, api, etc.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|api|.*\\..*|icons|images).*)",
  ],
};
