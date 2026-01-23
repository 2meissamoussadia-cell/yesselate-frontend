/**
 * Advanced Permission Utilities
 * Helpers pour les permissions avancées
 */

import type { Permission, Role, UserPermissions as BaseUserPermissions } from './permissionUtils';

export type Resource = string;
export type Action = 'create' | 'read' | 'update' | 'delete' | 'execute';

export interface PermissionConfig {
  roles: Role[];
  permissions: Permission[];
  resources?: Record<Resource, Action[]>;
}

export interface UserPermissionsAdvanced extends BaseUserPermissions {
  resources?: Record<Resource, Action[]>;
}

/**
 * Gestionnaire de permissions avancé
 */
export class PermissionManager {
  private rolePermissions: Map<Role, Set<Permission>> = new Map();
  private roleResources: Map<Role, Map<Resource, Set<Action>>> = new Map();
  private permissionHierarchy: Map<Permission, Set<Permission>> = new Map();

  /**
   * Définit les permissions d'un rôle
   */
  setRolePermissions(role: Role, permissions: Permission[]): void {
    this.rolePermissions.set(role, new Set(permissions));
  }

  /**
   * Définit les ressources d'un rôle
   */
  setRoleResources(role: Role, resources: Record<Resource, Action[]>): void {
    const resourceMap = new Map<Resource, Set<Action>>();
    for (const [resource, actions] of Object.entries(resources)) {
      resourceMap.set(resource, new Set(actions));
    }
    this.roleResources.set(role, resourceMap);
  }

  /**
   * Définit une hiérarchie de permissions
   */
  setPermissionHierarchy(parent: Permission, children: Permission[]): void {
    this.permissionHierarchy.set(parent, new Set(children));
  }

  /**
   * Vérifie si un rôle a une permission
   */
  hasPermission(role: Role, permission: Permission): boolean {
    const rolePerms = this.rolePermissions.get(role);
    if (!rolePerms) return false;

    // Vérification directe
    if (rolePerms.has(permission)) return true;

    // Vérification de la hiérarchie
    for (const [parent, children] of this.permissionHierarchy.entries()) {
      if (rolePerms.has(parent) && children.has(permission)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Vérifie si un rôle peut effectuer une action sur une ressource
   */
  canAccessResource(role: Role, resource: Resource, action: Action): boolean {
    const roleRes = this.roleResources.get(role);
    if (!roleRes) return false;

    const resourceActions = roleRes.get(resource);
    return resourceActions?.has(action) ?? false;
  }

  /**
   * Obtient toutes les permissions d'un rôle
   */
  getRolePermissions(role: Role): Permission[] {
    const perms = this.rolePermissions.get(role);
    return perms ? Array.from(perms) : [];
  }

  /**
   * Obtient toutes les ressources d'un rôle
   */
  getRoleResources(role: Role): Record<Resource, Action[]> {
    const roleRes = this.roleResources.get(role);
    if (!roleRes) return {};

    const result: Record<Resource, Action[]> = {};
    for (const [resource, actions] of roleRes.entries()) {
      result[resource] = Array.from(actions);
    }
    return result;
  }
}

/**
 * Instance globale du gestionnaire de permissions
 */
export const permissionManager = new PermissionManager();

/**
 * Vérifie si un utilisateur a une permission
 */
export function hasUserPermission(
  userPermissions: UserPermissionsAdvanced | BaseUserPermissions,
  permission: Permission
): boolean {
  // Vérification directe
  if (userPermissions.permissions.includes(permission)) {
    return true;
  }

  // Vérification via les rôles
  for (const role of userPermissions.roles) {
    if (permissionManager.hasPermission(role, permission)) {
      return true;
    }
  }

  return false;
}

/**
 * Vérifie si un utilisateur peut accéder à une ressource
 */
export function canUserAccessResource(
  userPermissions: UserPermissionsAdvanced,
  resource: Resource,
  action: Action
): boolean {
  // Vérification via les ressources de l'utilisateur
  if (userPermissions.resources?.[resource]?.includes(action)) {
    return true;
  }

  // Vérification via les rôles
  for (const role of userPermissions.roles) {
    if (permissionManager.canAccessResource(role, resource, action)) {
      return true;
    }
  }

  return false;
}

/**
 * Filtre un tableau d'éléments selon les permissions
 */
export function filterByPermission<T>(
  items: T[],
  userPermissions: UserPermissionsAdvanced | BaseUserPermissions,
  getPermission: (item: T) => Permission
): T[] {
  return items.filter((item) =>
    hasUserPermission(userPermissions, getPermission(item))
  );
}

/**
 * Filtre un tableau d'éléments selon l'accès à une ressource
 */
export function filterByResourceAccess<T>(
  items: T[],
  userPermissions: UserPermissionsAdvanced,
  resource: Resource,
  action: Action,
  getResourceId: (item: T) => Resource
): T[] {
  return items.filter((item) => {
    const itemResource = getResourceId(item);
    return canUserAccessResource(
      userPermissions,
      `${resource}:${itemResource}`,
      action
    );
  });
}

/**
 * Combine plusieurs configurations de permissions
 */
export function combinePermissions(
  ...configs: PermissionConfig[]
): UserPermissionsAdvanced {
  const roles = new Set<Role>();
  const permissions = new Set<Permission>();
  const resources: Record<Resource, Action[]> = {};

  for (const config of configs) {
    config.roles.forEach((role) => roles.add(role));
    config.permissions.forEach((perm) => permissions.add(perm));

    if (config.resources) {
      for (const [resource, actions] of Object.entries(config.resources)) {
        if (!resources[resource]) {
          resources[resource] = [];
        }
        actions.forEach((action) => {
          if (!resources[resource].includes(action)) {
            resources[resource].push(action);
          }
        });
      }
    }
  }

  return {
    roles: Array.from(roles),
    permissions: Array.from(permissions),
    resources: Object.keys(resources).length > 0 ? resources : undefined,
  };
}

/**
 * Crée une fonction de vérification de permission réutilisable
 */
export function createPermissionChecker(userPermissions: UserPermissionsAdvanced | BaseUserPermissions) {
  return {
    has: (permission: Permission) =>
      hasUserPermission(userPermissions, permission),
    canAccess: (resource: Resource, action: Action) =>
      canUserAccessResource(userPermissions, resource, action),
    filter: <T>(items: T[], getPermission: (item: T) => Permission) =>
      filterByPermission(items, userPermissions, getPermission),
  };
}
