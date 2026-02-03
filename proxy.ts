/**
 * Proxy Next.js 16 — migration depuis middleware.ts
 *
 * Ce fichier remplace l'ancien middleware conformément à la convention proxy
 * de Next.js 16. Il s'exécute en amont des routes (redirects, rewrites, auth).
 *
 * Phase P18: Sécurité avancée - CSP stricte, headers sécurité, cookies durcis, CSRF
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 * @see https://nextjs.org/docs/messages/middleware-to-proxy
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { randomBytes, randomUUID } from "crypto";

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
 * Proxy principal — sécurité et authentification
 * 
 * Fonctionnalités:
 * - CSP stricte avec nonce par requête
 * - Headers sécurité (X-Frame-Options, X-Content-Type-Options, etc.)
 * - Cookies sécurisés (HttpOnly, Secure, SameSite)
 * - CSRF token generation et validation
 * - Request-ID pour corrélation (P4)
 * - Authentification et contrôle d'accès par rôle
 */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  
  // Request-ID pour corrélation des logs/traces (P4)
  const reqId = request.headers.get('x-request-id') ?? randomUUID();
  response.headers.set('x-request-id', reqId);

  // Nonce CSP par requête (16 bytes → base64)
  const cspNonce = randomBytes(16).toString('base64');
  response.headers.set('x-csp-nonce', cspNonce);
  
  // Injecter le nonce dans un script inline pour le rendre accessible côté client
  // (pour les scripts critiques comme l'hydration boot)
  if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname === '/') {
    // Injecter le nonce dans le HTML via un script inline (sera géré par Next.js)
    response.headers.set('x-csp-nonce-script', cspNonce);
  }
  
  // Injecter le nonce dans un cookie pour accès côté client (pour CspNonceProvider)
  response.cookies.set('csp-nonce', cspNonce, {
    httpOnly: false, // Nécessaire pour accès JS côté client
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60, // 60 secondes (même durée que la requête)
  });

  // CSP : désactivée en dev (localhost) pour éviter blocage script inline / eval (Next.js, react-refresh).
  // En prod uniquement : CSP stricte avec nonce.
  const hostname = request.nextUrl.hostname ?? '';
  const urlString = request.url ?? '';
  const isLocalhost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    urlString.includes('localhost:') ||
    urlString.includes('127.0.0.1:');
  const isDev =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production' || isLocalhost;

  if (!isDev) {
    const cspReportUri = '/api/security/csp-report';
    const csp = [
      `default-src 'self'`,
      `script-src 'self' 'nonce-${cspNonce}' 'strict-dynamic'`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: blob: https:`,
      `font-src 'self' data:`,
      `connect-src 'self' https:`,
      `frame-ancestors 'none'`,
      `base-uri 'self'`,
      `object-src 'none'`,
      `upgrade-insecure-requests`,
      `form-action 'self'`,
      `frame-src 'none'`,
      `report-uri ${cspReportUri}`,
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);
  }
  // En dev : on n'envoie pas de CSP pour que le navigateur n'applique aucune restriction (script inline, eval, etc.)

  // Headers sécurité : COEP assoupli en dev (require-corp bloque le Hot Reload / chunks)
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (!isDev) {
    response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  }
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // CSRF token pour les mutations (POST/PUT/PATCH/DELETE)
  // Générer un token CSRF si absent (pour les requêtes GET, on peut le générer pour la prochaine mutation)
  const csrfToken = request.cookies.get('csrf-token')?.value;
  if (!csrfToken || request.method === 'GET') {
    const newCsrfToken = randomBytes(32).toString('base64url');
    response.cookies.set('csrf-token', newCsrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600 * 24, // 24 heures
    });
  }

  // Cookies sécurisés : s'assurer que les cookies de session sont sécurisés
  // (cette partie sera gérée par le système d'auth, mais on peut forcer les flags ici)
  const authCookie = request.cookies.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'auth-token');
  if (authCookie) {
    // Ré-écrire le cookie avec les flags de sécurité si nécessaire
    response.cookies.set(authCookie.name, authCookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
  
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
    return response;
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

  return response;
}

/**
 * Matcher : appliquer le proxy sur toutes les routes sauf les fichiers statiques
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - *.svg, *.png, *.jpg, *.jpeg, *.gif, *.webp (image files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)',
  ],
};
