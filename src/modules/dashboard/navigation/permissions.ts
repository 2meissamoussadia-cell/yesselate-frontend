// src/modules/dashboard/navigation/permissions.ts
// Phase P10: Helper pour vérifier l'accès à un nœud de navigation selon permissions et feature flags
// Utilise le store Zustand pour récupérer les permissions

'use client';

import { useDashboardPermissionsStore } from '@/lib/stores/dashboardPermissionsStore';
import type { NavRequires } from '../types/dashboardNavigationTypes';

export type { NavRequires };

/**
 * Contexte utilisateur avec permissions et feature flags
 */
export interface UserContext {
  perms: string[];
  flags: Record<string, boolean>;
  roles?: string[];
}

/**
 * Vérifie si un nœud de navigation est accessible selon ses exigences (requires)
 * 
 * @param ctx - Contexte utilisateur (permissions, feature flags, rôles)
 * @param req - Exigences d'accès du nœud (permission, feature flag, rôles)
 * @returns true si le nœud est accessible, false sinon
 */
/** Rôles qui ont accès à tout le dashboard (aligné sur useDashboardPermissions) */
const FULL_ACCESS_ROLES = ['admin', 'dg'];

function hasFullAccessRole(roles: string[] | undefined): boolean {
  if (!roles?.length) return false;
  const lower = roles.map((r) => r?.toLowerCase?.() ?? '');
  return lower.some((r) => FULL_ACCESS_ROLES.includes(r));
}

export function nodeAllowed(ctx: UserContext, req?: NavRequires): boolean {
  // Si pas d'exigence, accessible par défaut
  if (!req) return true;

  // Admin et DG ont accès à tout (aligné sur useDashboardPermissions.hasPermission)
  if (hasFullAccessRole(ctx.roles)) return true;

  // Vérifier les rôles requis si spécifiés
  if (req.roles && req.roles.length > 0) {
    const hasRequiredRole = req.roles.some((r) => ctx.roles?.includes(r) ?? false);
    if (!hasRequiredRole) return false;
  }

  // Vérifier le feature flag requis
  if (req.flag && !ctx.flags[req.flag]) return false;

  // Vérifier la permission requise
  if (req.perm && !ctx.perms.includes(req.perm)) return false;

  return true;
}

/**
 * Hook pour obtenir le contexte utilisateur depuis le store
 * Utilisé par les composants pour accéder aux permissions
 */
export function useUserContext(): UserContext {
  const permissions = useDashboardPermissionsStore((state) => state.permissions);
  
  return {
    perms: permissions.permissions,
    flags: permissions.featureFlags,
    roles: permissions.roles,
  };
}
