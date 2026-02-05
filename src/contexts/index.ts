/**
 * Contexts Index - Re-export depuis lib (source unique)
 * =====================================================
 *
 * AuthContext est défini dans lib/contexts/AuthContext.tsx (utilisé via @lib-root/contexts/AuthContext).
 * Ce fichier ré-exporte pour compatibilité avec d'éventuels imports depuis @/contexts.
 */

export {
  AuthProvider,
  useAuth,
  useRole,
  useRequireAuth,
  ProtectedRoute,
} from '@lib-root/contexts/AuthContext';
export type { AuthContextType } from '@lib-root/contexts/AuthContext';
export type { User } from '@/lib/types';
