// lib/server/dashboard/abac.ts
// Phase P10: ABAC enrichi avec RBAC runtime

import type { RequestContext } from './context';
import type { Main } from '@/modules/dashboard/types/dashboard.readmodels';
import { hasPerm } from '@/lib/server/security/policy';

/**
 * Phase P10: Vérification ABAC avec permissions granulaires
 */
export async function canAccessRoute(main: Main, ctx: RequestContext, reqId?: string): Promise<boolean> {
  // Rôles globaux (fallback si RBAC non disponible)
  if (ctx.roles.includes('admin')) return true;
  if (ctx.roles.includes('manager')) return true;
  if (ctx.roles.includes('reader')) return true;

  // Phase P10: Vérification RBAC runtime si disponible
  if (process.env.DATABASE_URL && ctx.perms && ctx.perms.length > 0) {
    const resourceMap: Record<Main, string> = {
      overview: 'dashboard',
      performance: 'dashboard',
      actions: 'dashboard',
      risks: 'dashboard',
      decisions: 'dashboard',
      realtime: 'dashboard',
    };
    const resource = resourceMap[main] ?? 'dashboard';
    
    // Vérifier la permission de base (utilise le helper policy)
    const hasPermission = hasPerm(ctx as any, 'dashboard:read') || 
                          ctx.perms.some((p) => p.startsWith(`${resource}:`));
    
    // Audit de la décision
    if (reqId) {
      try {
        const { RbacService } = await import('./rbac/rbacService');
        const rbac = new RbacService();
        await rbac.auditDecision(
          ctx.tenantId,
          ctx.userId,
          resource,
          'view',
          hasPermission ? 'allowed' : 'denied',
          hasPermission ? 'permission_granted' : 'permission_denied',
          ctx.roles,
          ctx.scopes,
          main,
          undefined,
          undefined,
          reqId
        );
      } catch (err) {
        // Non-bloquant
      }
    }

    return hasPermission;
  }

  return false;
}

/**
 * Phase P10: Vérification synchrone (pour compatibilité)
 */
export function canAccessRouteSync(main: Main, ctx: RequestContext): boolean {
  if (ctx.roles.includes('admin')) return true;
  if (ctx.roles.includes('manager')) return true;
  if (ctx.roles.includes('reader')) return true;
  return false;
}

/**
 * Parse les scopes depuis le contexte en utilisant un Set pour éviter les doublons
 * Phase P2-C/2: ABAC fort
 */
export function parseScopes(ctx: RequestContext) {
  const bureaux = new Set<string>();
  const chantiers = new Set<string>();

  for (const s of ctx.scopes) {
    const [k, v] = s.split(':');
    if (!k || !v) continue;
    if (k === 'bureau') bureaux.add(v);
    if (k === 'chantier') chantiers.add(v);
  }
  return { bureaux: [...bureaux], chantiers: [...chantiers] };
}

/** 
 * Construit un WHERE fragment dynamique :
 * - Si aucun scope fourni → aucun filtre (tous bureaux/chantiers du tenant)
 * - Sinon, filtre par codes autorisés
 * 
 * Note: On laisse le repo décider de la colonne à utiliser selon la vue (bureau_code / chantier_code).
 * Retourne un objet simple pour pilotage côté repo.
 */
export function buildScopeWhereFragment(scopes: { bureaux: string[]; chantiers: string[] }) {
  // On laisse le repo décider de la colonne à utiliser selon la vue (bureau_code / chantier_code).
  // Retourne un objet simple pour pilotage côté repo.
  return scopes;
}
