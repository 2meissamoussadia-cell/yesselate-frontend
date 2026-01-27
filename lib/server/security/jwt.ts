// lib/server/security/jwt.ts
// Phase P18: Durcissement JWT/OIDC avec validation stricte

import { createHmac, randomBytes } from 'crypto';
import { pgPool } from '../db/pool';

/**
 * Interface pour un JWT décodé
 */
export interface JWTPayload {
  sub: string; // Subject (user ID)
  aud: string; // Audience
  iss: string; // Issuer
  exp: number; // Expiration
  iat: number; // Issued at
  nbf?: number; // Not before
  jti: string; // JWT ID (pour replay protection)
  kid?: string; // Key ID (pour rotation)
  scopes?: string[]; // Scopes alignés sur permissions P10
  tenantId?: string;
  role?: string;
}

/**
 * Clé secrète pour signer les JWT (doit être stockée de manière sécurisée)
 * En production, utiliser un KMS ou rotation de clés
 */
function getJwtSecret(kid?: string): string {
  // TODO: Récupérer la clé depuis encryption_keys avec kid
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

/**
 * Génère un JWT avec toutes les validations
 */
export function signJWT(
  payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'> & {
    expiresIn?: number; // En secondes (défaut: 15 minutes)
  }
): string {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = payload.expiresIn || 15 * 60; // 15 minutes par défaut (short-lived)
  
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
    nbf: now, // Not before = maintenant
    jti: randomBytes(16).toString('hex'), // JWT ID unique pour replay protection
    kid: payload.kid || 'default', // Key ID pour rotation
  };

  const header = {
    alg: 'HS256',
    typ: 'JWT',
    kid: fullPayload.kid,
  };

  const secret = getJwtSecret(fullPayload.kid);
  
  // Encoder header et payload
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  // Signer
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Vérifie et décode un JWT avec validation stricte
 */
export function verifyJWT(
  token: string,
  options: {
    audience?: string;
    issuer?: string;
    requireKid?: boolean;
  } = {}
): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // Décoder header
    const header = JSON.parse(Buffer.from(encodedHeader, 'base64url').toString());
    
    // Validation: algorithme
    if (header.alg !== 'HS256') {
      return null;
    }

    // Décoder payload
    const payload: JWTPayload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString()
    );

    // Validation: expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Token expiré
    }

    // Validation: not before
    if (payload.nbf && payload.nbf > now) {
      return null; // Token pas encore valide
    }

    // Validation: audience
    if (options.audience && payload.aud !== options.audience) {
      return null; // Audience invalide
    }

    // Validation: issuer
    if (options.issuer && payload.iss !== options.issuer) {
      return null; // Issuer invalide
    }

    // Validation: key ID
    if (options.requireKid && !payload.kid) {
      return null; // Key ID requis mais absent
    }

    // Vérifier la signature
    const secret = getJwtSecret(payload.kid);
    const expectedSignature = createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    if (!constantTimeEqual(signature, expectedSignature)) {
      return null; // Signature invalide
    }

    // Vérifier replay protection (jti dans blacklist)
    // TODO: Vérifier dans une table jti_blacklist si le jti a été révoqué

    return payload;
  } catch {
    return null;
  }
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
 * Révoque un JWT (ajoute le jti à la blacklist)
 */
export async function revokeJWT(jti: string, expiresAt: number): Promise<void> {
  const client = await pgPool.connect();
  try {
    await client.query(
      `INSERT INTO jwt_blacklist (jti, expires_at)
       VALUES ($1, to_timestamp($2))
       ON CONFLICT (jti) DO NOTHING`,
      [jti, expiresAt]
    );
  } finally {
    client.release();
  }
}

/**
 * Vérifie si un JWT est révoqué (jti dans blacklist)
 */
export async function isJWTRevoked(jti: string): Promise<boolean> {
  const client = await pgPool.connect();
  try {
    const result = await client.query(
      `SELECT 1 FROM jwt_blacklist
       WHERE jti = $1 AND expires_at > NOW()`,
      [jti]
    );
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}
