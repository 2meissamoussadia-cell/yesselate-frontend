/**
 * Guards de sécurité pour le Dashboard
 * Vérifie les permissions d'accès aux vues selon rôle/tenant
 * 
 * SOURCE DE VÉRITÉ UNIQUE pour la logique d'autorisation dashboard
 */

import type { ViewEntry } from '../types/dashboard';

/** Type minimal pour les guards (compatible AuthContext.User et lib/types User) */
type UserLike = { role?: string } | null;

/**
 * Vérifie si un utilisateur a accès à une vue selon son rôle
 * 
 * @param entry - Entrée du registry de la vue
 * @param user - Utilisateur actuel (AuthContext ou lib/types)
 * @returns true si l'utilisateur a accès
 */
export function canAccessView(entry: ViewEntry | undefined, user: UserLike): boolean {
  if (!entry) return false;
  if (!user) return false;
  
  // Si pas de restriction de rôle, accès autorisé
  if (!entry.requiredRole) return true;
  
  const requiredRoles = Array.isArray(entry.requiredRole)
    ? entry.requiredRole
    : [entry.requiredRole];
  
  const role = user.role;
  return role != null && requiredRoles.includes(role);
}

/**
 * Vérifie si un utilisateur a accès à une vue selon son tenant
 * 
 * @param entry - Entrée du registry de la vue
 * @param user - Utilisateur actuel
 * @param currentTenant - Tenant actuel (optionnel)
 * @returns true si l'utilisateur a accès
 */
export function canAccessViewByTenant(
  entry: ViewEntry | undefined,
  user: UserLike | null,
  currentTenant?: string
): boolean {
  if (!entry) return false;
  if (!user) return false;
  
  // Si pas de restriction de tenant, accès autorisé
  if (!entry.requiredTenant) return true;
  
  const requiredTenants = Array.isArray(entry.requiredTenant)
    ? entry.requiredTenant
    : [entry.requiredTenant];
  
  // Si pas de tenant courant spécifié, on ne peut pas vérifier le tenant
  // (le type User de lib/types/index n'a pas de propriété tenant)
  const tenantToCheck = currentTenant;
  if (!tenantToCheck) return false;
  
  return requiredTenants.includes(tenantToCheck);
}

/**
 * Vérifie si un utilisateur a accès à une vue (rôle + tenant)
 * 
 * @param entry - Entrée du registry de la vue
 * @param user - Utilisateur actuel (AuthContext ou lib/types)
 * @param currentTenant - Tenant actuel (optionnel)
 * @returns true si l'utilisateur a accès
 */
export function hasViewAccess(
  entry: ViewEntry | undefined,
  user: UserLike,
  currentTenant?: string
): boolean {
  // Pas d'entrée registry (ex. clé avec leaf null) : autoriser pour ne pas masquer les items de navigation
  if (!entry) return true;
  
  // Si pas de restriction, accès autorisé (même sans utilisateur)
  if (!entry.requiredRole && !entry.requiredTenant) {
    return true;
  }
  
  // Si des restrictions existent mais pas d'utilisateur, accès refusé
  if (!user) return false;
  
  // Vérifier le rôle
  if (!canAccessView(entry, user)) return false;
  
  // Vérifier le tenant
  if (!canAccessViewByTenant(entry, user, currentTenant)) return false;
  
  return true;
}

/**
 * Filtre les entrées du registry selon les permissions de l'utilisateur
 * 
 * @param entries - Entrées du registry
 * @param user - Utilisateur actuel (AuthContext ou lib/types)
 * @param currentTenant - Tenant actuel (optionnel)
 * @returns Entrées accessibles
 */
export function filterAccessibleViews(
  entries: Record<string, ViewEntry>,
  user: UserLike,
  currentTenant?: string
): Record<string, ViewEntry> {
  if (!user) return {};
  
  const filtered: Record<string, ViewEntry> = {};
  
  for (const [key, entry] of Object.entries(entries)) {
    if (hasViewAccess(entry, user, currentTenant)) {
      filtered[key] = entry;
    }
  }
  
  return filtered;
}
