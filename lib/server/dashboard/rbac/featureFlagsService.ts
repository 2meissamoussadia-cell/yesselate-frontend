// lib/server/dashboard/rbac/featureFlagsService.ts
// Phase P10: Service Feature Flags par tenant
// Adapté pour le nouveau schéma simplifié

import { pgPool } from '@/lib/server/db/pool';

export interface FeatureFlag {
  feature_key: string;
  enabled: boolean;
  config?: Record<string, any>;
}

export class FeatureFlagsService {
  /**
   * Charge tous les feature flags d'un tenant
   */
  async loadTenantFlags(tenantId: string): Promise<Record<string, FeatureFlag>> {
    const client = await pgPool.connect();
    try {
      // Charger les flags activés pour ce tenant
      const { rows } = await client.query(
        `SELECT f.code as feature_key, COALESCE(tff.enabled, false) as enabled
         FROM feature_flags f
         LEFT JOIN tenant_feature_flags tff ON tff.flag_code = f.code AND tff.tenant_id = $1
         ORDER BY f.code`,
        [tenantId]
      );
      const flags: Record<string, FeatureFlag> = {};
      for (const row of rows) {
        flags[row.feature_key] = {
          feature_key: row.feature_key,
          enabled: row.enabled,
        };
      }
      return flags;
    } finally {
      client.release();
    }
  }

  /**
   * Vérifie si un feature est activé pour un tenant
   */
  async isFeatureEnabled(tenantId: string, featureKey: string): Promise<boolean> {
    const client = await pgPool.connect();
    try {
      const { rows } = await client.query(
        `SELECT enabled FROM tenant_feature_flags WHERE tenant_id = $1 AND flag_code = $2`,
        [tenantId, featureKey]
      );
      return rows[0]?.enabled ?? false;
    } finally {
      client.release();
    }
  }

  /**
   * Active/désactive un feature pour un tenant
   */
  async setFeatureFlag(
    tenantId: string,
    featureKey: string,
    enabled: boolean,
    config?: Record<string, any>,
    updatedBy?: string
  ): Promise<void> {
    const client = await pgPool.connect();
    try {
      await client.query(
        `INSERT INTO tenant_feature_flags (tenant_id, flag_code, enabled)
         VALUES ($1, $2, $3)
         ON CONFLICT (tenant_id, flag_code)
         DO UPDATE SET enabled = $3`,
        [tenantId, featureKey, enabled]
      );
    } finally {
      client.release();
    }
  }

  /**
   * Vérifie si un module est activé (cache-friendly)
   */
  async isModuleEnabled(tenantId: string, module: 'achats' | 'stocks' | 'materiel' | 'reporting' | 'compliance'): Promise<boolean> {
    return this.isFeatureEnabled(tenantId, `module.${module}`);
  }
}
