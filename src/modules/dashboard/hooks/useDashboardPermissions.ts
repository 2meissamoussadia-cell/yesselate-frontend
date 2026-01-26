// src/modules/dashboard/hooks/useDashboardPermissions.ts
// Phase P10: Hook pour vérifier les permissions côté UI
// Utilise le store Zustand pour stocker les permissions

'use client';

import { useMemo, useEffect } from 'react';
import { useDashboardPermissionsStore, type UserPermissions } from '@/lib/stores/dashboardPermissionsStore';

/**
 * Hook pour charger et utiliser les permissions utilisateur depuis le store
 */
export function useDashboardPermissions() {
  const { permissions, isLoading, setPermissions, setLoading } = useDashboardPermissionsStore();

  useEffect(() => {
    // Phase P10: Charger les permissions depuis /api/me/policy (endpoint léger avec cache)
    setLoading(true);
    
    fetch('/api/me/policy', {
      headers: {
        'x-tenant-id': 'default', // TODO: récupérer depuis le contexte auth
        'x-user-id': 'anonymous', // TODO: récupérer depuis le contexte auth
      },
    })
      .then((res) => res.json())
      .then((policy) => {
        // /api/me/policy retourne { perms, flags }
        // On doit aussi charger les rôles et scopes depuis /api/rbac/permissions
        fetch('/api/rbac/permissions', {
          headers: {
            'x-tenant-id': 'default',
            'x-user-id': 'anonymous',
          },
        })
          .then((res) => res.json())
          .then((rbac) => {
            setPermissions({
              roles: rbac.roles || [],
              permissions: policy.perms || [],
              scopes: rbac.scopes || { bureaux: [], chantiers: [] },
              featureFlags: policy.flags || {},
            });
          })
          .catch((err) => {
            console.warn('[Permissions] Failed to load RBAC', err);
            // Fallback : utiliser seulement policy
            setPermissions({
              roles: [],
              permissions: policy.perms || [],
              scopes: { bureaux: [], chantiers: [] },
              featureFlags: policy.flags || {},
            });
          });
      })
      .catch((err) => {
        console.warn('[Permissions] Failed to load policy', err);
        // Fallback : permissions vides (pas d'accès)
        setPermissions({
          roles: [],
          permissions: [],
          scopes: { bureaux: [], chantiers: [] },
          featureFlags: {},
        });
      });
  }, [setPermissions, setLoading]);

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = useMemo(
    () => (resource: string, action: string): boolean => {
      if (permissions.roles.includes('admin')) return true;
      return permissions.permissions.some((p) => p === `${resource}:${action}`);
    },
    [permissions]
  );

  /**
   * Vérifie si un module est accessible
   */
  const canAccessModule = useMemo(
    () => (module: 'achats' | 'stocks' | 'materiel' | 'reporting' | 'compliance'): boolean => {
      return hasPermission(module, 'view');
    },
    [hasPermission]
  );

  /**
   * Vérifie si l'export est autorisé
   */
  const canExport = useMemo(() => hasPermission('export', 'read'), [hasPermission]);

  return {
    permissions,
    hasPermission,
    canAccessModule,
    canExport,
  };
}
