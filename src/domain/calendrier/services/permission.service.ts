/**
 * Service pour les permissions du calendrier
 */

export type CalendrierRole =
  | 'viewer'      // Lecture seule
  | 'editor'      // Édition événements
  | 'admin'       // Administration complète
  | 'owner';      // Propriétaire

export type CalendrierPermission =
  | 'view_events'
  | 'create_events'
  | 'edit_events'
  | 'delete_events'
  | 'view_absences'
  | 'create_absences'
  | 'edit_absences'
  | 'view_affectations'
  | 'edit_affectations'
  | 'view_jalons'
  | 'edit_jalons'
  | 'resolve_conflicts'
  | 'manage_recurrence';

export class PermissionService {
  /**
   * Définit les permissions par rôle
   */
  private static readonly ROLE_PERMISSIONS: Record<CalendrierRole, CalendrierPermission[]> = {
    viewer: ['view_events', 'view_absences', 'view_affectations', 'view_jalons'],
    editor: [
      'view_events',
      'create_events',
      'edit_events',
      'delete_events',
      'view_absences',
      'create_absences',
      'edit_absences',
      'view_affectations',
      'view_jalons',
      'edit_jalons',
      'manage_recurrence',
    ],
    admin: [
      'view_events',
      'create_events',
      'edit_events',
      'delete_events',
      'view_absences',
      'create_absences',
      'edit_absences',
      'view_affectations',
      'edit_affectations',
      'view_jalons',
      'edit_jalons',
      'resolve_conflicts',
      'manage_recurrence',
    ],
    owner: [
      'view_events',
      'create_events',
      'edit_events',
      'delete_events',
      'view_absences',
      'create_absences',
      'edit_absences',
      'view_affectations',
      'edit_affectations',
      'view_jalons',
      'edit_jalons',
      'resolve_conflicts',
      'manage_recurrence',
    ],
  };

  /**
   * Vérifie si un rôle a une permission
   */
  static hasPermission(
    role: CalendrierRole,
    permission: CalendrierPermission
  ): boolean {
    const permissions = this.ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Récupère toutes les permissions d'un rôle
   */
  static getPermissions(role: CalendrierRole): CalendrierPermission[] {
    return this.ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Vérifie si un rôle peut créer des événements
   */
  static canCreateEvents(role: CalendrierRole): boolean {
    return this.hasPermission(role, 'create_events');
  }

  /**
   * Vérifie si un rôle peut éditer des événements
   */
  static canEditEvents(role: CalendrierRole): boolean {
    return this.hasPermission(role, 'edit_events');
  }

  /**
   * Vérifie si un rôle peut supprimer des événements
   */
  static canDeleteEvents(role: CalendrierRole): boolean {
    return this.hasPermission(role, 'delete_events');
  }

  /**
   * Vérifie si un rôle peut résoudre des conflits
   */
  static canResolveConflicts(role: CalendrierRole): boolean {
    return this.hasPermission(role, 'resolve_conflicts');
  }
}
