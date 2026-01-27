// lib/server/dashboard/alerting/alertsEvaluatorWorker.ts
// Phase P15: Moteur d'alertes - Worker d'évaluation (event-driven + CRON)

import { Pool } from 'pg';
import { pgPool } from '@/lib/server/db/pool';
import { evaluateAllRules, evaluateRulesForMView } from './worker';
import { logger } from '@/lib/server/logging';

/**
 * Worker d'évaluation d'alertes
 * Phase P15: Moteur d'alertes
 * 
 * Peut être exécuté :
 * 1. Après refresh de MViews (appelé depuis refreshMViewsWorker)
 * 2. Via CRON périodiquement (toutes les 5-10 min)
 * 
 * Idempotence : La logique de dé-dup & cooldown évite le spam
 */

const log = logger.child({ component: 'alertsEvaluatorWorker' });

/**
 * Évalue toutes les règles d'alerte pour tous les tenants actifs
 * Phase P15: Moteur d'alertes
 * 
 * Appelé via CRON périodiquement
 */
export async function evaluateAllTenantsRules(): Promise<void> {
  const client = await pgPool.connect();
  try {
    // Récupérer tous les tenants actifs
    const { rows: tenants } = await client.query<{ id: string }>(
      `SELECT DISTINCT id FROM tenants`
    );
    
    log.info({ tenantCount: tenants.length }, 'Evaluating alerts for all tenants');
    
    for (const tenant of tenants) {
      try {
        await evaluateAllRules(tenant.id);
      } catch (error) {
        log.error({ err: error, tenantId: tenant.id }, 'Error evaluating rules for tenant');
      }
    }
  } finally {
    client.release();
  }
}

/**
 * Évalue les règles pour un tenant spécifique
 * Phase P15: Moteur d'alertes
 * 
 * Appelé après refresh de MView ou via CRON
 */
export async function evaluateTenantRules(tenantId: string): Promise<void> {
  try {
    await evaluateAllRules(tenantId);
  } catch (error) {
    log.error({ err: error, tenantId }, 'Error evaluating rules for tenant');
    throw error;
  }
}

/**
 * Point d'entrée principal du worker (standalone)
 * Phase P15: Moteur d'alertes
 * 
 * À exécuter via CRON : toutes les 5-10 minutes
 * 
 * @example
 * // CRON : */5 * * * * (toutes les 5 min)
 * node -r ts-node/register lib/server/dashboard/alerting/alertsEvaluatorWorker.ts
 */
async function run(): Promise<void> {
  log.info('Starting alerts evaluator worker');
  
  try {
    await evaluateAllTenantsRules();
    log.info('Alerts evaluator worker completed');
  } catch (error) {
    log.error({ err: error }, 'Fatal error in alerts evaluator worker');
    process.exit(1);
  } finally {
    // Ne pas fermer le pool ici car il est partagé
    // Le processus peut continuer si appelé via CRON
  }
}

// Exécuter si appelé directement (standalone)
if (require.main === module) {
  run()
    .then(() => {
      log.info('Worker completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      log.error({ err: error }, 'Worker failed');
      process.exit(1);
    });
}
