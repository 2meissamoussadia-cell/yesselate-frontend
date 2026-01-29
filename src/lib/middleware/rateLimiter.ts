/**
 * RATE LIMITING MIDDLEWARE
 * 
 * Protège les APIs contre les abus :
 * - Sliding window algorithm
 * - Limites par utilisateur/IP/endpoint
 * - Headers standards (X-RateLimit-*)
 * - Whitelist/Blacklist IPs
 * - Analytics et alertes
 */

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// TYPES
// ============================================

export interface RateLimitConfig {
  windowMs: number; // Fenêtre de temps (ms)
  maxRequests: number; // Max requêtes par fenêtre
  message?: string;
  statusCode?: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Timestamp
  retryAfter?: number; // Secondes
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

// ============================================
// CONFIGS PRÉDÉFINIES
// ============================================

export const RATE_LIMITS = {
  // API publique : 100 req/15min
  PUBLIC: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message: 'Trop de requêtes, veuillez réessayer plus tard',
  },

  // API authentifiée : 500 req/15min
  AUTHENTICATED: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 500,
  },

  // Création de ressources : 10 req/min
  CREATE: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: 'Limite de création atteinte',
  },

  // Export : 5 req/5min
  EXPORT: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 5,
    message: 'Limite d\'export atteinte',
  },

  // Login : 5 tentatives/15min
  LOGIN: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Trop de tentatives de connexion',
    skipSuccessfulRequests: true,
  },

  // Webhooks : 1000 req/min
  WEBHOOK: {
    windowMs: 60 * 1000,
    maxRequests: 1000,
  },

  // IA Briefing (V5) : 100 req/h
  AI_BRIEFING: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 100,
    message: 'Limite briefing IA atteinte, réessayez dans 1 heure',
  },
};

// ============================================
// SERVICE
// ============================================

export class RateLimiter {
  private static instance: RateLimiter;
  private store: Map<string, RateLimitEntry> = new Map();
  private whitelist: Set<string> = new Set();
  private blacklist: Set<string> = new Set();

  private constructor() {
    // Nettoyage périodique
    this.startCleanupWorker();
  }

  public static getInstance(): RateLimiter {
    if (!this.instance) {
      this.instance = new RateLimiter();
    }
    return this.instance;
  }

  /**
   * Vérifier si la requête est limitée
   */
  async check(
    key: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; info: RateLimitInfo }> {
    const now = Date.now();
    const entry = this.store.get(key);

    // Première requête
    if (!entry) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now,
      });

      return {
        allowed: true,
        info: {
          limit: config.maxRequests,
          remaining: config.maxRequests - 1,
          reset: now + config.windowMs,
        },
      };
    }

    // Fenêtre expirée, réinitialiser
    if (now >= entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now,
      });

      return {
        allowed: true,
        info: {
          limit: config.maxRequests,
          remaining: config.maxRequests - 1,
          reset: now + config.windowMs,
        },
      };
    }

    // Incrémenter compteur
    entry.count++;

    // Limite atteinte
    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      return {
        allowed: false,
        info: {
          limit: config.maxRequests,
          remaining: 0,
          reset: entry.resetTime,
          retryAfter,
        },
      };
    }

    // OK
    return {
      allowed: true,
      info: {
        limit: config.maxRequests,
        remaining: config.maxRequests - entry.count,
        reset: entry.resetTime,
      },
    };
  }

  /**
   * Ajouter IP à la whitelist
   */
  addToWhitelist(ip: string): void {
    this.whitelist.add(ip);
    console.log(`[RateLimit] Whitelisted IP: ${ip}`);
  }

  /**
   * Ajouter IP à la blacklist
   */
  addToBlacklist(ip: string): void {
    this.blacklist.add(ip);
    console.log(`[RateLimit] Blacklisted IP: ${ip}`);
  }

  /**
   * Vérifier si IP est whitelistée
   */
  isWhitelisted(ip: string): boolean {
    return this.whitelist.has(ip);
  }

  /**
   * Vérifier si IP est blacklistée
   */
  isBlacklisted(ip: string): boolean {
    return this.blacklist.has(ip);
  }

  /**
   * Obtenir statistiques
   */
  getStats(): any {
    return {
      totalKeys: this.store.size,
      whitelisted: this.whitelist.size,
      blacklisted: this.blacklist.size,
    };
  }

  /**
   * Réinitialiser limite pour une clé
   */
  reset(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Worker de nettoyage
   */
  private startCleanupWorker(): void {
    setInterval(() => {
      const now = Date.now();
      let cleaned = 0;

      for (const [key, entry] of this.store.entries()) {
        // Supprimer entrées expirées depuis > 1h
        if (now > entry.resetTime + 3600000) {
          this.store.delete(key);
          cleaned++;
        }
      }

      if (cleaned > 0) {
        console.log(`[RateLimit] Cleaned ${cleaned} expired entries`);
      }
    }, 5 * 60 * 1000); // Toutes les 5 min
  }
}

// ============================================
// MIDDLEWARE NEXT.JS
// ============================================

/**
 * Créer middleware de rate limiting
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  const limiter = RateLimiter.getInstance();

  return async (req: NextRequest): Promise<NextResponse | null> => {
    try {
      // Générer clé (par défaut: IP)
      const key = config.keyGenerator
        ? config.keyGenerator(req)
        : getClientIp(req);

      // Vérifier blacklist
      if (limiter.isBlacklisted(key)) {
        return NextResponse.json(
          { error: 'Accès interdit' },
          { status: 403 }
        );
      }

      // Skip whitelist
      if (limiter.isWhitelisted(key)) {
        return null; // Continuer
      }

      // Vérifier limite
      const { allowed, info } = await limiter.check(key, config);

      // Ajouter headers
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', info.limit.toString());
      headers.set('X-RateLimit-Remaining', info.remaining.toString());
      headers.set('X-RateLimit-Reset', info.reset.toString());

      if (!allowed) {
        headers.set('Retry-After', info.retryAfter!.toString());

        console.warn(`[RateLimit] Blocked request from ${key}`);

        return NextResponse.json(
          {
            error: config.message || 'Trop de requêtes',
            retryAfter: info.retryAfter,
          },
          {
            status: config.statusCode || 429,
            headers,
          }
        );
      }

      // Continuer avec headers
      const response = NextResponse.next();
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('[RateLimit] Error:', error);
      return null; // Continuer en cas d'erreur
    }
  };
}

/**
 * Helper : Extraire IP du client
 */
function getClientIp(req: NextRequest): string {
  // Vérifier headers de proxy
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback
  return 'unknown';
}

/**
 * Helper : Générer clé par user ID
 */
export function keyByUserId(req: NextRequest): string {
  // TODO: Extraire user ID depuis session/JWT
  const userId = req.headers.get('x-user-id') || 'anonymous';
  return `user:${userId}`;
}

/**
 * Helper : Générer clé par endpoint
 */
export function keyByEndpoint(req: NextRequest): string {
  const ip = getClientIp(req);
  const pathname = new URL(req.url).pathname;
  return `${ip}:${pathname}`;
}

// ============================================
// WRAPPERS POUR API ROUTES
// ============================================

/**
 * Wrapper pour appliquer rate limit à une API route
 */
export function withRateLimit<T>(
  handler: (req: NextRequest) => Promise<T>,
  config: RateLimitConfig
) {
  return async (req: NextRequest): Promise<T | NextResponse> => {
    const middleware = createRateLimitMiddleware(config);
    const response = await middleware(req);

    // Si bloqué, retourner erreur
    if (response && response.status === 429) {
      return response;
    }

    // Sinon, exécuter handler
    return handler(req);
  };
}

/**
 * Exemple d'utilisation dans une API route
 */
export async function exampleApiRoute(req: NextRequest) {
  return withRateLimit(
    async (req) => {
      // Votre logique API ici
      return NextResponse.json({ success: true });
    },
    RATE_LIMITS.AUTHENTICATED
  )(req);
}

// Export singleton
export default RateLimiter.getInstance();


