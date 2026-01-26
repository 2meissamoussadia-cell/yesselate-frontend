// lib/server/dashboard/rbac/rbacCache.ts
// Phase P10: Cache court pour RBAC (rôles, permissions, feature flags)

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Cache in-memory avec TTL court (5 secondes par défaut)
 * Pour éviter de requêter la DB à chaque requête tout en gardant des données fraîches
 */
class RbacCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly defaultTtl = 5000; // 5 secondes

  /**
   * Récupère une valeur du cache si elle existe et n'est pas expirée
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  /**
   * Stocke une valeur dans le cache avec TTL
   */
  set<T>(key: string, data: T, ttl = this.defaultTtl): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  /**
   * Invalide une clé du cache
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalide toutes les entrées pour un tenant
   */
  invalidateTenant(tenantId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${tenantId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

export const rbacCache = new RbacCache();

// Nettoyage périodique (toutes les 30 secondes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => rbacCache.cleanup(), 30000);
}
