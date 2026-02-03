// src/modules/dashboard/hooks/useDashboardPermissions.ts
// Phase P10: Hook pour vérifier les permissions côté UI
// Utilise le store Zustand pour stocker les permissions depuis /api/me/policy

'use client';

import { useMemo, useEffect, useRef } from 'react';
import { useDashboardPermissionsStore, type UserPermissions } from '@/lib/stores/dashboardPermissionsStore';
import { logger } from '@/lib/utils/logger';
import { useAuthHeaders } from '../utils/getAuthHeaders';

/**
 * Hook pour charger et utiliser les permissions utilisateur depuis le store
 * Charge les permissions depuis /api/me/policy et /api/rbac/permissions
 * Évite les appels multiples grâce au cache du store
 */
export function useDashboardPermissions() {
  const { permissions, isLoading, lastFetched, setPermissions, setLoading } = useDashboardPermissionsStore();
  const authHeaders = useAuthHeaders();
  const loadingRef = useRef(false);

  useEffect(() => {
    // Éviter les appels multiples simultanés
    if (loadingRef.current) return;
    
    // Recharger si jamais chargé ou si le cache est expiré (5 minutes)
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    const shouldReload = !lastFetched || (Date.now() - lastFetched > CACHE_TTL);
    
    if (!shouldReload && lastFetched) {
      return; // Utiliser le cache
    }

    loadingRef.current = true;
    setLoading(true);
    
    const headers = authHeaders;
    // Phase P10: Charger les permissions depuis /api/me/policy (endpoint léger avec cache)
    // Puis charger les rôles et scopes depuis /api/rbac/permissions
    Promise.all([
      fetch('/api/me/policy', { headers }).then((res) => res.json()),
      fetch('/api/rbac/permissions', { headers }).then((res) => res.json()),
    ])
      .then(([policy, rbac]) => {
        setPermissions({
          roles: rbac.roles || [],
          permissions: policy.perms || rbac.permissions || [],
          scopes: rbac.scopes || { bureaux: [], chantiers: [] },
          featureFlags: policy.flags || rbac.featureFlags || {},
        });
        setLoading(false);
        loadingRef.current = false;
      })
      .catch((err) => {
        logger.warn('Failed to load permissions', {
          component: 'useDashboardPermissions',
          error: err instanceof Error ? err.message : String(err),
        });
        setPermissions({
          roles: [],
          permissions: [],
          scopes: { bureaux: [], chantiers: [] },
          featureFlags: {},
        });
        setLoading(false);
        loadingRef.current = false;
      });
    // authHeaders mémoïsé dans useAuthHeaders (réf stable) ; lastFetched pour éviter boucle
  }, [setPermissions, setLoading, lastFetched, authHeaders]);

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  const hasPermission = useMemo(
    () => (resource: string, action: string): boolean => {
      if (permissions.roles.includes('admin') || permissions.roles.includes('dg')) return true;
      return permissions.permissions.some((p) => p === `${resource}:${action}`);
    },
    [permissions]
  );

  /**
   * Vérifie si l'utilisateur a un rôle (BMO ou admin)
   */
  const hasRole = useMemo(
    () => (role: string): boolean => permissions.roles.includes(role),
    [permissions.roles]
  );

  /**
   * Vérifie si l'utilisateur peut voir un chantier (DG = tout, sinon scope chantiers)
   */
  const canSeeChantier = useMemo(
    () => (chantierCode: string): boolean => {
      if (permissions.roles.includes('admin') || permissions.roles.includes('dg')) return true;
      const list = permissions.scopes?.chantiers ?? [];
      return list.length === 0 ? false : list.includes(chantierCode);
    },
    [permissions]
  );

  /**
   * Permissions granulaires BMO
   */
  const canValidatePaiement = useMemo(
    () => hasPermission('paiement', 'validate'),
    [hasPermission]
  );
  const canArchiveChantier = useMemo(
    () => hasPermission('chantier', 'archive'),
    [hasPermission]
  );
  const canUpdateBudget = useMemo(
    () => hasPermission('budget', 'update'),
    [hasPermission]
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
    isLoading,
    hasPermission,
    hasRole,
    canSeeChantier,
    canValidatePaiement,
    canArchiveChantier,
    canUpdateBudget,
    canAccessModule,
    canExport,
  };
}
