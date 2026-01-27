// lib/server/auth/jwt.ts
// 7.2 Vérification JWT stricte (RS256, JWK, aud, iss, nbf, jti, kid)

import { createPublicKey } from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * JWK RSA public key (RFC 7517). Pour RS256, kty=RSA avec n, e.
 */
export interface JwkRsaPublic {
  kty: 'RSA';
  n: string;
  e: string;
  kid?: string;
  alg?: string;
  use?: string;
  [k: string]: unknown;
}

export interface VerifyJwtOpts {
  aud: string;
  iss: string;
  /** Exiger un `kid` dans le header ou le payload (défaut: true) */
  requireKid?: boolean;
  /** Exiger un `jti` (replay protection) (défaut: true) */
  requireJti?: boolean;
}

export interface VerifiedJwtPayload {
  sub: string;
  aud: string | string[];
  iss: string;
  exp: number;
  iat: number;
  nbf?: number;
  jti?: string;
  kid?: string;
  [k: string]: unknown;
}

/**
 * Vérifie un JWT avec RS256, JWK, et validations strictes (nbf, jti, kid).
 *
 * @param token - JWT brut (Bearer non inclus)
 * @param jwk - Clé publique RSA au format JWK
 * @param opts - audience et issuer requis; options pour kid/jti
 * @returns Payload décodé et validé
 * @throws Si signature invalide, alg non RS256, aud/iss incorrects, ou nbf/jti/kid manquants/invalides
 */
export function verifyJwt(
  token: string,
  jwk: JwkRsaPublic,
  opts: VerifyJwtOpts
): VerifiedJwtPayload {
  const requireKid = opts.requireKid !== false;
  const requireJti = opts.requireJti !== false;

  const key = createPublicKey({ key: jwk, format: 'jwk' });

  const decoded = jwt.verify(token, key, {
    algorithms: ['RS256'],
    audience: opts.aud,
    issuer: opts.iss,
    complete: true,
  }) as jwt.Jwt;

  const payload = decoded.payload as VerifiedJwtPayload;
  const header = decoded.header;

  // nbf : not before — re-vérification explicite (jwt.verify le fait déjà, mais pour stricte conformité)
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.nbf === 'number' && payload.nbf > now) {
    throw new Error('JWT not yet valid (nbf)');
  }

  // jti : JWT ID — requis pour replay protection
  if (requireJti && (typeof payload.jti !== 'string' || !payload.jti.trim())) {
    throw new Error('JWT missing required jti');
  }

  // kid : key ID — requis pour rotation de clés (header ou payload)
  const kid = header.kid ?? payload.kid;
  if (requireKid && (typeof kid !== 'string' || !kid.trim())) {
    throw new Error('JWT missing required kid');
  }

  return payload;
}
