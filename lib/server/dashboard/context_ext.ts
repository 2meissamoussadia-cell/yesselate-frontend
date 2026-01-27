// lib/server/dashboard/context_ext.ts
// Phase P10: Extension du contexte avec RBAC (permissions + feature flags)
// Version simplifiée avec requêtes directes + cache court

import { pgPool } from '../db/pool';
import { rbacCache } from './rbac/rbacCache';

export type Role = 'admin' | 'manager' | 'reader' | 'acheteur' | 'juridique' | 'controle' | 'ordonnateur';
export interface RequestContext {
  tenantId: string;
  userId: string;
  roles: Role[];        // déjà extrait depuis headers en P2
  scopes: string[];     // ex: ['bureau:BMO','chantier:CH-001']
  perms: string[];      // ex: ['dashboard:read','export:read','achats:view',...]
  flags: Record<string, boolean>; // ex: {'module.achats':true,...}
}

export async function hydrateContext(ctx: Omit<RequestContext, 'perms'|'flags'>): Promise<RequestContext> {
  // Si pas de DB, retourner le contexte de base avec perms/flags vides
  if (!process.env.DATABASE_URL) {
    return { ...ctx, perms: [], flags: {} };
  }

  const cacheKey = `rbac:${ctx.tenantId}:${ctx.userId}`;
  const flagsCacheKey = `flags:${ctx.tenantId}`;

  // Vérifier le cache
  let cached = rbacCache.get<{ scopes: string[]; perms: string[]; flags: Record<string, boolean> }>(cacheKey);
  
  if (!cached) {
    const client = await pgPool.connect();
    try {
      // Permissions agrégées par rôle
      const { rows: permRows } = await client.query(
        `select distinct p.code as perm
           from rbac_user_assignments ua
           join rbac_role_permissions rp on rp.role_id = ua.role_id
           join rbac_permissions p on p.id = rp.perm_id
          where ua.tenant_id = $1 and ua.user_id = $2`,
        [ctx.tenantId, ctx.userId]
      );
      const perms = permRows.map(r => r.perm);

      // Feature flags tenant
      const { rows: flagRows } = await client.query(
        `select flag_code, enabled
           from tenant_feature_flags
          where tenant_id = $1`, [ctx.tenantId]
      );
      const flags = Object.fromEntries(flagRows.map(r => [r.flag_code, !!r.enabled]));

      // Scopes depuis rbac_user_assignments (bureau_code, chantier_code)
      const { rows: scopeRows } = await client.query(
        `select bureau_code, chantier_code
           from rbac_user_assignments
          where tenant_id = $1 and user_id = $2
            and (bureau_code is not null or chantier_code is not null)`,
        [ctx.tenantId, ctx.userId]
      );
      const bureaux = new Set<string>();
      const chantiers = new Set<string>();
      for (const row of scopeRows) {
        if (row.bureau_code) bureaux.add(row.bureau_code);
        if (row.chantier_code) chantiers.add(row.chantier_code);
      }
      const scopes = [
        ...Array.from(bureaux).map(b => `bureau:${b}`),
        ...Array.from(chantiers).map(c => `chantier:${c}`),
      ];

      cached = { scopes, perms, flags };
      // Cache pour 5 secondes
      rbacCache.set(cacheKey, cached, 5000);
      // Cache séparé pour les flags (10 secondes)
      rbacCache.set(flagsCacheKey, flags, 10000);
    } finally {
      client.release();
    }
  } else {
    // Si on a le cache, vérifier aussi le cache flags séparé (plus long)
    const cachedFlags = rbacCache.get<Record<string, boolean>>(flagsCacheKey);
    if (cachedFlags) {
      cached.flags = cachedFlags;
    }
  }

  return { ...ctx, scopes: cached.scopes, perms: cached.perms, flags: cached.flags };
}
