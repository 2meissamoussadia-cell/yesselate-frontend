/**
 * Utilitaire pour récupérer les headers d'authentification depuis le contexte
 * Remplace les valeurs hardcodées 'default' et 'anonymous'
 */

import { useMemo } from 'react';
import type { User } from '@/lib/types/index';

export interface AuthHeaders {
  'x-tenant-id': string;
  'x-user-id': string;
  'x-roles'?: string;
  'x-scopes'?: string;
}

/**
 * Récupère les headers d'authentification depuis un utilisateur
 * 
 * @param user - Utilisateur depuis le contexte auth (peut être null)
 * @param tenantId - ID du tenant (optionnel, par défaut depuis user.bureauId ou 'default')
 * @returns Headers d'authentification prêts à être utilisés dans les fetch
 */
export function getAuthHeaders(
  user: User | null,
  tenantId?: string
): AuthHeaders {
  const headers: AuthHeaders = {
    'x-tenant-id': tenantId || user?.bureauId || 'default',
    'x-user-id': user?.id || 'anonymous',
  };

  // Ajouter les rôles si disponibles
  if (user?.role) {
    headers['x-roles'] = Array.isArray(user.role) 
      ? user.role.join(',') 
      : user.role;
  }

  // Note: Le type User de lib/types/index n'a pas de scopes directement
  // Si nécessaire, ils peuvent être ajoutés depuis un autre contexte

  return headers;
}

/**
 * Hook helper pour récupérer les headers depuis le contexte auth
 * Utilise useAuthOptional pour éviter les erreurs si le provider n'est pas disponible
 * Mémoïse le résultat pour éviter des références instables (boucles infinies dans les effets)
 */
export function useAuthHeaders(tenantId?: string): AuthHeaders {
  // Import dynamique pour éviter les dépendances circulaires
  const { useAuthOptional } = require('../hooks/useAuthOptional');
  const authContext = useAuthOptional();
  const user = authContext?.user ?? null;

  return useMemo(
    () => getAuthHeaders(user, tenantId),
    [user?.id, user?.bureauId, user?.role, tenantId]
  );
}
