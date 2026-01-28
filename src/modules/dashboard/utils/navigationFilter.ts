// src/modules/dashboard/utils/navigationFilter.ts
// Phase P10: Filtrage de la navigation selon permissions et feature flags
// Utilise le champ `requires` annoté dans navigation.config.json
// Les helpers peuvent utiliser directement le store Zustand pour récupérer les permissions

'use client';

import { useMemo } from 'react';
import type { NavNode } from '../navigation/dashboardNavigationConfig';
import { useDashboardPermissionsStore } from '@/lib/stores/dashboardPermissionsStore';

/**
 * Vérifie si un noeud de navigation est accessible selon ses exigences (requires)
 */
export function isNavNodeAccessible(
  node: NavNode,
  permissions: string[] = [],
  roles: string[] = [],
  featureFlags: Record<string, boolean> = {}
): boolean {
  // Admin a accès à tout
  if (roles.includes('admin')) return true;

  // Si pas d'exigence, accessible par défaut (nécessite dashboard:read au niveau racine)
  if (!node.requires) {
    // Pour les nœuds racine (main), vérifier dashboard:read
    return permissions.includes('dashboard:read');
  }

  const { perm, flag, roles: requiredRoles } = node.requires;

  // Vérifier les rôles requis si spécifiés
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some((r) => roles.includes(r));
    if (!hasRequiredRole) return false;
  }

  // Vérifier la permission requise
  if (perm) {
    if (!permissions.includes(perm)) {
      return false;
    }
  }

  // Vérifier le feature flag requis
  if (flag) {
    if (!featureFlags[flag]) {
      return false;
    }
  }

  return true;
}

/**
 * Filtre récursivement la navigation selon permissions et feature flags
 * Utilise le champ `requires` annoté dans chaque nœud
 * Si aucune permission n'est chargée (état initial), retourne la config complète pour éviter une sidebar vide
 */
export function filterNavigationConfig(
  config: Record<string, NavNode>,
  permissions: string[] = [],
  roles: string[] = [],
  featureFlags: Record<string, boolean> = {}
): Record<string, NavNode> {
  const hasPermissionData =
    permissions.length > 0 ||
    roles.length > 0 ||
    (featureFlags && typeof featureFlags === 'object' && Object.keys(featureFlags).length > 0);

  if (!hasPermissionData) {
    return config;
  }

  const filtered: Record<string, NavNode> = {};

  for (const [key, node] of Object.entries(config)) {
    // Vérifier l'accès au nœud principal
    if (!isNavNodeAccessible(node, permissions, roles, featureFlags)) {
      continue; // Masquer ce noeud
    }

    // Filtrer récursivement les sous-noeuds
    const filteredNode: NavNode = {
      ...node,
      children: node.children
        ? node.children
            .filter((child) => {
              return isNavNodeAccessible(child, permissions, roles, featureFlags);
            })
            .map((child) => ({
              ...child,
              children: child.children
                ? child.children.filter((leaf) => {
                    return isNavNodeAccessible(leaf, permissions, roles, featureFlags);
                  })
                : undefined,
            }))
        : undefined,
    };

    // Si le noeud a des children, vérifier qu'il en reste au moins un
    if (filteredNode.children && filteredNode.children.length === 0) {
      continue; // Masquer si plus de sous-sections accessibles
    }

    filtered[key] = filteredNode;
  }

  // Ne jamais renvoyer une config vide : au rechargement, les permissions peuvent
  // arriver après le premier rendu et tout filtrer ; on garde la config complète
  // pour que la navigation reste visible (contrôle d'accès au niveau des vues).
  if (Object.keys(filtered).length === 0) {
    return config;
  }

  return filtered;
}

/**
 * Trouve la première route autorisée dans la navigation filtrée
 * Utilisé pour rediriger vers une route accessible si la route actuelle n'est pas autorisée
 */
export function findFirstAuthorizedRoute(
  config: Record<string, NavNode>
): { main: string; sub: string | null; leaf: string | null } | null {
  // Parcourir les nœuds principaux (main)
  for (const [mainKey, mainNode] of Object.entries(config)) {
    if (!mainNode.children || mainNode.children.length === 0) {
      // Si pas d'enfants, retourner juste le main
      return { main: mainKey, sub: null, leaf: null };
    }

    // Parcourir les sous-nœuds (sub)
    for (const subNode of mainNode.children) {
      if (!subNode.children || subNode.children.length === 0) {
        // Si pas de leaf, retourner main + sub
        return { main: mainKey, sub: subNode.id, leaf: null };
      }

      // Retourner la première leaf disponible
      return { main: mainKey, sub: subNode.id, leaf: subNode.children[0].id };
    }
  }

  return null;
}

/**
 * Hook pour filtrer la navigation en utilisant directement le store Zustand
 * Simplifie l'utilisation dans les composants (pas besoin de passer les permissions en paramètre)
 * 
 * @param config - Configuration de navigation à filtrer
 * @returns Navigation filtrée selon les permissions stockées dans le store
 */
export function useFilteredNavigation(config: Record<string, NavNode>): Record<string, NavNode> {
  const permissions = useDashboardPermissionsStore((state) => state.permissions);
  
  // Utiliser useMemo pour éviter les recalculs inutiles
  return useMemo(
    () => filterNavigationConfig(
      config,
      permissions.permissions,
      permissions.roles,
      permissions.featureFlags
    ),
    [config, permissions.permissions, permissions.roles, permissions.featureFlags]
  );
}
