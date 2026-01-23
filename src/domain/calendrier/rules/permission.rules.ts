/**
 * Règles de permissions pour le calendrier
 */

import { PermissionService, type CalendrierRole } from '../services/permission.service';

export class PermissionRules {
  /**
   * Vérifie si un utilisateur peut modifier un événement
   */
  static canModifyEvent(
    role: CalendrierRole,
    evenement: { created_by?: string },
    currentUserId?: string
  ): boolean {
    // Admin et owner peuvent toujours modifier
    if (role === 'admin' || role === 'owner') {
      return PermissionService.canEditEvents(role);
    }

    // Editor peut modifier ses propres événements
    if (role === 'editor') {
      return PermissionService.canEditEvents(role) &&
             (evenement.created_by === currentUserId || !currentUserId);
    }

    return false;
  }

  /**
   * Vérifie si un utilisateur peut supprimer un événement
   */
  static canDeleteEvent(
    role: CalendrierRole,
    evenement: { created_by?: string },
    currentUserId?: string
  ): boolean {
    // Admin et owner peuvent toujours supprimer
    if (role === 'admin' || role === 'owner') {
      return PermissionService.canDeleteEvents(role);
    }

    // Editor peut supprimer ses propres événements
    if (role === 'editor') {
      return PermissionService.canDeleteEvents(role) &&
             (evenement.created_by === currentUserId || !currentUserId);
    }

    return false;
  }

  /**
   * Vérifie si un utilisateur peut créer des événements récurrents
   */
  static canCreateRecurringEvents(role: CalendrierRole): boolean {
    return PermissionService.hasPermission(role, 'manage_recurrence');
  }
}
