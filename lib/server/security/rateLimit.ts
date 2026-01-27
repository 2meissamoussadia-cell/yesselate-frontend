// lib/server/security/rateLimit.ts
// Phase P18: Rate-limit homogène sur tous les endpoints avec FinOps

import { rateLimitRedis } from '../observability/rateLimitRedis';
import { enforceQuota, recordUsage } from '../finops';
import { NextRequest } from 'next/server';

/**
 * Configuration de rate-limit par endpoint
 */
const RATE_LIMIT_CONFIG: Record<string, { tokens: number; refill: number }> = {
  // Dashboard read (légers)
  '/api/dashboard': { tokens: 240, refill: 4 }, // 240 req, refill 4/s
  
  // Exports (lourds)
  '/api/export': { tokens: 20, refill: 1 }, // 20 exports, refill 1/s
  
  // Telemetry (batch)
  '/api/telemetry': { tokens: 1000, refill: 10 }, // 1000 req, refill 10/s
  
  // Alertes (modérés)
  '/api/alerts/events': { tokens: 240, refill: 4 },
  '/api/alerts/rules': { tokens: 60, refill: 1 },
  '/api/alerts/test': { tokens: 30, refill: 1 }, // Plus restrictif (dry-run coûteux)
  
  // Admin (très restrictif)
  '/api/admin': { tokens: 60, refill: 1 },
  
  // Default
  default: { tokens: 120, refill: 2 },
};

/**
 * Applique le rate-limit et les quotas FinOps sur une requête
 * 
 * @param req - Requête Next.js
 * @param ctx - Contexte (tenantId, userId)
 * @param scope - Scope FinOps (ex: 'route:/api/export/dashboard')
 * @returns Résultat du rate-limit et quota
 */
export async function applyRateLimitAndQuota(
  req: NextRequest,
  ctx: { tenantId: string; userId?: string },
  scope?: string
): Promise<{
  rateLimit: { allowed: boolean; remaining: number };
  quota: { allowed: boolean; reason?: string };
}> {
  const pathname = req.nextUrl.pathname;
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  
  // 1. Rate-limit Redis
  const config = findRateLimitConfig(pathname);
  const rateLimitKey = `ratelimit:${pathname}:${ip}`;
  const rateLimit = await rateLimitRedis(rateLimitKey, config.tokens, config.refill);
  
  if (!rateLimit.allowed) {
    return {
      rateLimit: { allowed: false, remaining: rateLimit.remaining },
      quota: { allowed: true }, // Pas besoin de vérifier quota si rate-limit bloqué
    };
  }
  
  // 2. Quotas FinOps (si scope fourni)
  let quota = { allowed: true as boolean, reason: undefined as string | undefined };
  if (scope) {
    const estimatedRows = req.headers.get('x-estimated-rows')
      ? parseInt(req.headers.get('x-estimated-rows')!, 10)
      : undefined;
    const estimatedBytes = req.headers.get('x-estimated-bytes')
      ? parseInt(req.headers.get('x-estimated-bytes')!, 10)
      : undefined;
    
    const isExport = pathname.includes('/export');
    
    quota = await enforceQuota({
      tenantId: ctx.tenantId,
      scope,
      isExport,
      estimatedRows,
      estimatedBytes,
    });
  }
  
  return { rateLimit, quota };
}

/**
 * Trouve la configuration de rate-limit pour un pathname
 */
function findRateLimitConfig(pathname: string): { tokens: number; refill: number } {
  // Chercher une correspondance exacte
  for (const [path, config] of Object.entries(RATE_LIMIT_CONFIG)) {
    if (pathname.startsWith(path)) {
      return config;
    }
  }
  
  // Fallback sur default
  return RATE_LIMIT_CONFIG.default;
}

/**
 * Enregistre l'usage pour FinOps après une requête réussie
 */
export async function recordRequestUsage(
  ctx: { tenantId: string },
  scope: string,
  options: {
    rows?: number;
    bytes?: number;
    exports?: number;
  } = {}
): Promise<void> {
  await recordUsage({
    tenantId: ctx.tenantId,
    scope,
    rows: options.rows,
    bytes: options.bytes,
    exports: options.exports,
  }).catch((err) => {
    // Non-bloquant
    console.error('Failed to record usage:', err);
  });
}
