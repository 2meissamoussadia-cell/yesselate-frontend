// lib/server/dashboard/rbac/rbacService.ts
// Phase P10: Service RBAC runtime (vérification permissions)
// Adapté pour le nouveau schéma simplifié

import { pgPool } from '@/lib/server/db/pool';
import type { RequestContext } from '../context';

export interface Permission {
  code: string;
  resource: string;
  action: string;
}

export interface UserPermissions {
  roles: string[];
  permissions: Permission[];
  scopes: { bureaux: string[]; chantiers: string[] };
}

export class RbacService {
  /**
   * Charge les rôles et permissions d'un utilisateur depuis la DB
   */
  async loadUserPermissions(tenantId: string, userId: string): Promise<UserPermissions> {
    const client = await pgPool.connect();
    try {
      // Charger les rôles et leurs codes
      const { rows: roleRows } = await client.query(
        `SELECT DISTINCT r.code
         FROM rbac_user_assignments ua
         JOIN rbac_roles r ON r.id = ua.role_id
         WHERE ua.tenant_id = $1 AND ua.user_id = $2
         ORDER BY r.code`,
        [tenantId, userId]
      );
      const roles = roleRows.map((r) => r.code);

      // Charger les permissions via les rôles
      const { rows: permRows } = await client.query(
        `SELECT DISTINCT p.code, 
                SPLIT_PART(p.code, ':', 1) as resource,
                SPLIT_PART(p.code, ':', 2) as action
         FROM rbac_permissions p
         JOIN rbac_role_permissions rp ON rp.perm_id = p.id
         JOIN rbac_user_assignments ua ON ua.role_id = rp.role_id
         WHERE ua.tenant_id = $1 AND ua.user_id = $2
         ORDER BY p.code`,
        [tenantId, userId]
      );
      const permissions: Permission[] = permRows.map((p) => ({
        code: p.code,
        resource: p.resource,
        action: p.action,
      }));

      // Charger les scopes (bureau/chantier) depuis les assignments
      const { rows: scopeRows } = await client.query(
        `SELECT bureau_code, chantier_code
         FROM rbac_user_assignments
         WHERE tenant_id = $1 AND user_id = $2
           AND (bureau_code IS NOT NULL OR chantier_code IS NOT NULL)
         ORDER BY bureau_code, chantier_code`,
        [tenantId, userId]
      );
      const bureaux = new Set<string>();
      const chantiers = new Set<string>();
      for (const row of scopeRows) {
        if (row.bureau_code) bureaux.add(row.bureau_code);
        if (row.chantier_code) chantiers.add(row.chantier_code);
      }

      return { roles, permissions, scopes: { bureaux: [...bureaux], chantiers: [...chantiers] } };
    } finally {
      client.release();
    }
  }

  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  async hasPermission(
    tenantId: string,
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const perms = await this.loadUserPermissions(tenantId, userId);
    // Admin a toutes les permissions
    if (perms.roles.includes('admin')) return true;
    // Vérifier la permission exacte
    return perms.permissions.some((p) => p.resource === resource && p.action === action);
  }

  /**
   * Vérifie si un utilisateur peut accéder à une route dashboard
   */
  async canAccessDashboardRoute(
    tenantId: string,
    userId: string,
    main: string,
    sub?: string | null,
    leaf?: string | null
  ): Promise<boolean> {
    const perms = await this.loadUserPermissions(tenantId, userId);
    // Admin a accès à tout
    if (perms.roles.includes('admin')) return true;

    // Mapping route → resource
    const resourceMap: Record<string, string> = {
      overview: 'dashboard',
      performance: 'dashboard',
      actions: 'dashboard',
      risks: 'dashboard',
      decisions: 'dashboard',
      realtime: 'dashboard',
    };

    const resource = resourceMap[main] ?? 'dashboard';
    const hasView = await this.hasPermission(tenantId, userId, resource, 'view');
    if (!hasView) return false;

    // Vérifier les modules spécifiques si nécessaire
    if (sub === 'achats') {
      return await this.hasPermission(tenantId, userId, 'achats', 'view');
    }
    if (sub === 'stocks' || sub === 'materiel') {
      return await this.hasPermission(tenantId, userId, 'stocks', 'view');
    }
    if (sub === 'reporting') {
      return await this.hasPermission(tenantId, userId, 'reporting', 'view');
    }
    if (sub === 'compliance') {
      return await this.hasPermission(tenantId, userId, 'compliance', 'view');
    }

    return true;
  }

  /**
   * Audit d'une décision d'autorisation
   */
  async auditDecision(
    tenantId: string,
    userId: string,
    resource: string,
    action: string,
    decision: 'allowed' | 'denied',
    reason: string,
    roles: string[],
    scopes: string[],
    routeMain?: string,
    routeSub?: string,
    routeLeaf?: string,
    reqId?: string
  ): Promise<void> {
    const client = await pgPool.connect();
    try {
      await client.query(
        `INSERT INTO authorization_audit 
         (tenant_id, user_id, resource, action, route_main, route_sub, route_leaf, 
          decision, reason, roles_used, scopes_used, when_at, req_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now(), $12)`,
        [tenantId, userId, resource, action, routeMain ?? null, routeSub ?? null, routeLeaf ?? null, decision, reason, roles, scopes, reqId ?? null]
      );
    } catch (err) {
      // Non-bloquant : si l'audit échoue, on continue
      console.warn('[RBAC] Failed to audit decision', err);
    } finally {
      client.release();
    }
  }
}
