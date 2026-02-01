// lib/server/dashboard/context.ts
// Phase P10: Contexte enrichi avec RBAC runtime + cache court

export type Role = 'admin' | 'manager' | 'reader' | 'acheteur' | 'juridique' | 'controle' | 'ordonnateur' | 'dg' | 'chef_chantier' | 'ouvrier' | 'client';
export interface RequestContext {
  tenantId: string;
  userId: string;
  roles: Role[];
  scopes: string[]; // ex: ['bureau:BMO', 'chantier:CH-001']
  perms?: string[]; // Phase P10: permissions granulaires chargées depuis DB (alias de permissions pour compatibilité)
  permissions?: string[]; // Phase P10: permissions granulaires chargées depuis DB (déprécié, utiliser perms)
  flags?: Record<string, boolean>; // Phase P10: feature flags activés pour le tenant (alias de featureFlags pour compatibilité)
  featureFlags?: Record<string, boolean>; // Phase P10: feature flags activés pour le tenant (déprécié, utiliser flags)
}

/**
 * Extraction basique depuis headers (fallback si RBAC non disponible)
 */
export function extractContextFromHeaders(h: Headers): RequestContext {
  return {
    tenantId: h.get('x-tenant-id') ?? 'default',
    userId: h.get('x-user-id') ?? 'anonymous',
    roles: (h.get('x-roles') ?? 'reader').split(',').map(r => r.trim()) as Role[],
    scopes: (h.get('x-scopes') ?? '').split(',').map(s => s.trim()).filter(Boolean),
  };
}

/**
 * Phase P10: Enrichit le contexte avec RBAC depuis la DB (avec cache court)
 * Utilise la version simplifiée de context_ext.ts avec cache
 */
export async function enrichContextWithRbac(ctx: RequestContext, reqId?: string): Promise<RequestContext> {
  // Si pas de DB, retourner le contexte de base
  if (!process.env.DATABASE_URL) return ctx;

  try {
    const { hydrateContext } = await import('./context_ext');
    const { rbacCache } = await import('./rbac/rbacCache');

    const cacheKey = `rbac:${ctx.tenantId}:${ctx.userId}`;
    const flagsCacheKey = `flags:${ctx.tenantId}`;

    // Vérifier le cache pour les permissions utilisateur (roles, scopes, perms, flags)
    let cached = rbacCache.get<{ roles: string[]; scopes: string[]; perms: string[]; flags: Record<string, boolean> }>(cacheKey);
    
    if (!cached) {
      // Utiliser hydrateContext pour charger roles, scopes, perms et flags depuis DB
      const hydrated = await hydrateContext(ctx as Omit<RequestContext, 'perms'|'flags'>);
      cached = { roles: hydrated.roles, scopes: hydrated.scopes, perms: hydrated.perms, flags: hydrated.flags };
      // Cache pour 5 secondes
      rbacCache.set(cacheKey, cached, 5000);
      
      // Cache séparé pour les flags (10 secondes, changent moins souvent)
      rbacCache.set(flagsCacheKey, hydrated.flags, 10000);
    } else {
      // Si on a le cache, vérifier aussi le cache flags séparé (plus long)
      const cachedFlags = rbacCache.get<Record<string, boolean>>(flagsCacheKey);
      if (cachedFlags) {
        cached.flags = cachedFlags;
      }
    }

    // Enrichir avec les rôles, scopes, permissions et feature flags depuis la DB/cache
    return {
      ...ctx,
      roles: (cached.roles?.length ? cached.roles : ctx.roles) as Role[],
      scopes: cached.scopes,
      perms: cached.perms,
      permissions: cached.perms, // Alias pour compatibilité
      flags: cached.flags,
      featureFlags: cached.flags, // Alias pour compatibilité
    };
  } catch (err) {
    // Fallback : si le chargement RBAC échoue, utiliser le contexte de base
    console.warn('[Context] Failed to enrich with RBAC', err);
    return ctx;
  }
}
