// lib/server/security/csrf.ts
// Phase P18: Protection CSRF pour endpoints mutation

import { NextRequest } from 'next/server';
import { randomBytes } from 'crypto';

/**
 * Génère un token CSRF
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Valide un token CSRF (double-submit cookie pattern)
 * 
 * Pattern double-submit :
 * 1. Le token est stocké dans un cookie HttpOnly (csrf-token)
 * 2. Le client envoie le même token dans le header X-CSRF-Token
 * 3. On compare les deux tokens (doivent être identiques)
 * 
 * @param req - Requête Next.js
 * @returns true si le token est valide, false sinon
 */
export function validateCsrfToken(req: NextRequest): boolean {
  // Récupérer le token depuis le cookie (HttpOnly, sécurisé)
  const cookieToken = req.cookies.get('csrf-token')?.value;
  if (!cookieToken) {
    return false;
  }

  // Récupérer le token depuis le header (envoyé par le client)
  const headerToken = req.headers.get('x-csrf-token');
  
  // Fallback: essayer aussi dans le body pour compatibilité
  // (mais préférer le header pour éviter de parser le body)
  const bodyToken = req.headers.get('csrf-token');

  const providedToken = headerToken || bodyToken;

  if (!providedToken) {
    return false;
  }

  // Comparaison constante (timing-safe) - les deux tokens doivent être identiques
  return constantTimeEqual(cookieToken, providedToken);
}

/**
 * Comparaison constante pour éviter les attaques par timing
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Middleware helper pour vérifier CSRF sur les mutations
 * 
 * Usage:
 * ```ts
 * if (!validateCsrfToken(req)) {
 *   return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
 * }
 * ```
 */
export function requireCsrfToken(req: NextRequest): { valid: boolean; error?: string } {
  // Seulement pour les méthodes mutation
  const mutationMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  if (!mutationMethods.includes(req.method)) {
    return { valid: true };
  }

  if (!validateCsrfToken(req)) {
    return {
      valid: false,
      error: 'Invalid or missing CSRF token. Please refresh the page and try again.',
    };
  }

  return { valid: true };
}
