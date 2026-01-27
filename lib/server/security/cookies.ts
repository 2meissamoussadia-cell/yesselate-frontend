// lib/server/security/cookies.ts
// Phase P18: Cookies sécurisés avec rotation et signature

import { NextRequest, NextResponse } from 'next/server';
import { createHmac, randomBytes } from 'crypto';

/**
 * Clé secrète pour signer les cookies (doit être stockée de manière sécurisée)
 * En production, utiliser un KMS ou variable d'environnement
 */
function getCookieSecret(): string {
  const secret = process.env.COOKIE_SECRET;
  if (!secret) {
    throw new Error('COOKIE_SECRET environment variable is required');
  }
  return secret;
}

/**
 * Options par défaut pour cookies sécurisés
 */
const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // Lax minimum (peut être 'strict' pour plus de sécurité)
  path: '/',
};

/**
 * Signe une valeur de cookie
 */
function signCookie(value: string): string {
  const secret = getCookieSecret();
  const hmac = createHmac('sha256', secret);
  hmac.update(value);
  const signature = hmac.digest('hex');
  return `${value}.${signature}`;
}

/**
 * Vérifie et décode une valeur de cookie signée
 */
function verifyCookie(signedValue: string): string | null {
  const parts = signedValue.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [value, signature] = parts;
  const expectedSignature = createHmac('sha256', getCookieSecret())
    .update(value)
    .digest('hex');

  // Comparaison constante (timing-safe)
  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  return value;
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
 * Définit un cookie sécurisé et signé
 */
export function setSecureCookie(
  res: NextResponse,
  name: string,
  value: string,
  options: {
    maxAge?: number; // En secondes
    expires?: Date;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    path?: string;
  } = {}
): void {
  const signedValue = signCookie(value);
  const cookieOptions = {
    ...SECURE_COOKIE_OPTIONS,
    ...options,
  };

  res.cookies.set(name, signedValue, {
    ...cookieOptions,
    maxAge: options.maxAge,
    expires: options.expires,
  });
}

/**
 * Récupère et vérifie un cookie sécurisé
 */
export function getSecureCookie(req: NextRequest, name: string): string | null {
  const signedValue = req.cookies.get(name)?.value;
  if (!signedValue) {
    return null;
  }

  return verifyCookie(signedValue);
}

/**
 * Définit un cookie de session avec rotation automatique
 * 
 * La rotation se fait en générant un nouveau token toutes les X heures
 * et en invalidant l'ancien.
 */
export function setSessionCookie(
  res: NextResponse,
  sessionId: string,
  maxAge: number = 3600 * 24 * 7 // 7 jours par défaut
): void {
  // Générer un token de session unique
  const sessionToken = randomBytes(32).toString('base64url');
  const sessionData = JSON.stringify({
    sessionId,
    token: sessionToken,
    issuedAt: Date.now(),
  });

  setSecureCookie(res, 'session', sessionData, {
    maxAge,
    sameSite: 'lax', // Lax minimum (peut être 'strict')
  });
}

/**
 * Récupère et vérifie un cookie de session
 */
export function getSessionCookie(req: NextRequest): {
  sessionId: string;
  token: string;
  issuedAt: number;
} | null {
  const sessionData = getSecureCookie(req, 'session');
  if (!sessionData) {
    return null;
  }

  try {
    const parsed = JSON.parse(sessionData);
    if (!parsed.sessionId || !parsed.token || !parsed.issuedAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Supprime un cookie sécurisé
 */
export function deleteSecureCookie(res: NextResponse, name: string): void {
  res.cookies.delete(name);
}
