// lib/server/security/policy.ts
// Phase P10: Helpers de vérification de permissions et feature flags

import type { RequestContext as RequestContextExt } from '@lib-root/server/dashboard/context_ext';
import type { RequestContext } from '@lib-root/server/dashboard/context';

// Type union pour accepter les deux formats de RequestContext
type ContextUnion = RequestContext | RequestContextExt;

/**
 * Vérifie si l'utilisateur a une permission spécifique
 */
export function hasPerm(ctx: ContextUnion, perm: string): boolean {
  const perms = (ctx as any).perms ?? (ctx as any).permissions ?? [];
  return perms.includes(perm);
}

/**
 * Vérifie si un feature flag est activé pour le tenant
 */
export function flagEnabled(ctx: ContextUnion, flagCode: string): boolean {
  const flags = (ctx as any).flags ?? (ctx as any).featureFlags ?? {};
  return !!flags[flagCode];
}

/**
 * Gate combinée : nécessite le module (feature flag) ET la permission
 */
export function can(ctx: ContextUnion, requirement: { perm: string; flag?: string }): boolean {
  if (requirement.flag && !flagEnabled(ctx, requirement.flag)) return false;
  return hasPerm(ctx, requirement.perm);
}
