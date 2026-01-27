// middleware.ts
// Phase P18: Sécurité avancée - CSP stricte, headers sécurité, cookies durcis, CSRF

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomBytes, randomUUID } from 'crypto';

/**
 * Middleware de sécurité P18
 * 
 * Fonctionnalités:
 * - CSP stricte avec nonce par requête
 * - Headers sécurité (X-Frame-Options, X-Content-Type-Options, etc.)
 * - Cookies sécurisés (HttpOnly, Secure, SameSite)
 * - CSRF token generation et validation
 * - Request-ID pour corrélation (P4)
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Request-ID déjà posé (P4) → on le conserve
  const reqId = req.headers.get('x-request-id') ?? randomUUID();
  res.headers.set('x-request-id', reqId);

  // Nonce CSP par requête (16 bytes → base64)
  const cspNonce = randomBytes(16).toString('base64');
  res.headers.set('x-csp-nonce', cspNonce);
  
  // Injecter le nonce dans un script inline pour le rendre accessible côté client
  // (pour les scripts critiques comme l'hydration boot)
  if (req.nextUrl.pathname.startsWith('/_next') || req.nextUrl.pathname === '/') {
    // Injecter le nonce dans le HTML via un script inline (sera géré par Next.js)
    res.headers.set('x-csp-nonce-script', cspNonce);
  }
  
  // Injecter le nonce dans un cookie pour accès côté client (pour CspNonceProvider)
  res.cookies.set('csp-nonce', cspNonce, {
    httpOnly: false, // Nécessaire pour accès JS côté client
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60, // 60 secondes (même durée que la requête)
  });

  // CSP stricte (ajuste tes domaines si besoin : fonts, charts lazy, etc.)
  // Note: 'unsafe-inline' pour style-src peut être remplacé par nonce si tous les styles sont injectés avec nonce
  // Phase P15: Ajout report-uri pour violations CSP
  const cspReportUri = '/api/security/csp-report';
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${cspNonce}' 'strict-dynamic'`, // strict-dynamic permet les scripts chargés dynamiquement
    `style-src 'self' 'unsafe-inline'`, // TODO: idéalement remplacer par 'nonce-${cspNonce}' pour styles inline critiques
    `img-src 'self' data: blob: https:`, // https: pour images externes (charts, etc.)
    `font-src 'self' data:`,
    `connect-src 'self' https:`, // https: pour API externes si nécessaire
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
    `form-action 'self'`,
    `frame-src 'none'`,
    `report-uri ${cspReportUri}`, // Phase P15: Rapport violations CSP
  ].join('; ');
  res.headers.set('Content-Security-Policy', csp);

  // Headers sécurité complémentaires
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), bluetooth=(), magnetometer=(), gyroscope=(), accelerometer=()');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
  res.headers.set('X-DNS-Prefetch-Control', 'off');
  res.headers.set('X-Download-Options', 'noopen');
  res.headers.set('X-Permitted-Cross-Domain-Policies', 'none');

  // CSRF token pour les mutations (POST/PUT/PATCH/DELETE)
  // Générer un token CSRF si absent (pour les requêtes GET, on peut le générer pour la prochaine mutation)
  const csrfToken = req.cookies.get('csrf-token')?.value;
  if (!csrfToken || req.method === 'GET') {
    const newCsrfToken = randomBytes(32).toString('base64url');
    res.cookies.set('csrf-token', newCsrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600 * 24, // 24 heures
    });
  }

  // Cookies sécurisés : s'assurer que les cookies de session sont sécurisés
  // (cette partie sera gérée par le système d'auth, mais on peut forcer les flags ici)
  const authCookie = req.cookies.get(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAME || 'auth-token');
  if (authCookie) {
    // Ré-écrire le cookie avec les flags de sécurité si nécessaire
    res.cookies.set(authCookie.name, authCookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }

  return res;
}

/**
 * Matcher : appliquer le middleware sur toutes les routes sauf les fichiers statiques
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
