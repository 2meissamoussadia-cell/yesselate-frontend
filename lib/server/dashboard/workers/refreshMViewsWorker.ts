/**
 * Event-Driven Refresh Worker (Version simplifiée)
 * Phase P3: Écoute les notifications PostgreSQL et rafraîchit les MViews ciblées
 * Phase P4: Observabilité (logs corrélés, métriques)
 * 
 * Utilise pg_notify() déclenché par les triggers SQL pour rafraîchir
 * uniquement les vues concernées par les changements.
 */

import { Pool, Client } from 'pg';
import { logger, withReq } from '@/lib/server/logging';
import { mviewRefreshCounter, mviewRefreshDuration, mviewRefreshErrors, workerNotificationsReceived, workerProcessingDuration } from '@/lib/server/observability/metrics';
import { withSpan } from '@/lib/server/observability/telemetry';

// Pool PostgreSQL dédié pour le worker (connexion persistante pour LISTEN)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1, // Une seule connexion pour LISTEN
});

/**
 * Utilise un advisory lock pour éviter les refreshs concurrents
 * Phase P3: Sécurité de concurrence
 */
async function withAdvisoryLock<T>(
  client: Client,
  key: bigint,
  fn: () => Promise<T>
): Promise<T | undefined> {
  const got = await client.query('SELECT pg_try_advisory_lock($1) AS acquired', [key]);
  if (!got.rows[0]?.acquired) {
    return undefined; // Déjà en cours
  }
  try {
    return await fn();
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [key]);
  }
}

/**
 * Mapping domain → liste de MViews à rafraîchir
 * Phase P3: Event-Driven Refresh
 */
const MVIEWS_BY_DOMAIN: Record<string, string[]> = {
  // Tables opérationnelles
  projets: ['rm_kpis_projets', 'rm_trends_daily', 'rm_kpis_overview'],
  demandes: ['rm_kpis_demandes', 'rm_trends_daily', 'rm_kpis_overview'],
  validations: ['rm_kpis_overview', 'rm_trends_daily'],
  
  // Tables finance
  situations_travaux: [
    'rm_reporting_overview', 'rm_reporting_dso', 'rm_reporting_bureau', 'rm_reporting_chantier',
    'rm_finance_overview', 'rm_finance_trends', 'rm_kpis_overview'
  ],
  factures: ['rm_reporting_overview', 'rm_reporting_dso', 'rm_finance_overview', 'rm_finance_trends'],
  encaissements: ['rm_reporting_dso', 'rm_finance_overview', 'rm_finance_trends'],
  
  // Tables métier (optionnel)
  risques: ['rm_kpis_overview'],
  blocages: ['rm_kpis_overview'],
  decisions: ['rm_kpis_overview'],
  
  // Phase P6: Modules ERP - Stocks & Matériel
  stock: ['rm_stocks_overview', 'rm_stocks_trends', 'rm_stocks_ruptures'],
  mouvements_stock: ['rm_stocks_overview', 'rm_stocks_trends', 'rm_stocks_ruptures'],
  materiel: ['rm_materiel_overview', 'rm_materiel_trends', 'rm_materiel_backlog_maintenance'],
  maintenance: ['rm_materiel_overview', 'rm_materiel_trends', 'rm_materiel_backlog_maintenance'],
  
  // Phase P5: Nouveaux domaines Achats/Contrats
  bc: ['rm_achats_overview', 'rm_achats_trends', 'rm_achats_open_orders', 'rm_kpis_overview'],
  bc_lignes: ['rm_achats_overview', 'rm_achats_trends', 'rm_achats_open_orders', 'rm_kpis_overview'],
  bl: ['rm_achats_overview', 'rm_achats_trends', 'rm_kpis_overview'],
  bl_lignes: ['rm_achats_overview', 'rm_achats_trends', 'rm_kpis_overview'],
  fournisseurs: ['rm_achats_fournisseurs', 'rm_achats_overview'],
  prix_reference: ['rm_achats_overview', 'rm_achats_fournisseurs'],
  
  // Phase P7: Reporting Direction
  // Les MViews reporting sont rafraîchies directement via les tables sources
  // (situations_travaux, factures, encaissements) pour un refresh immédiat
  // Mappings définis ci-dessus dans les sections "Tables finance"
  
  // Phase P8: Conformité & Marchés publics
  procedures_mp: ['rm_compliance_overview'],
  lots_mp: ['rm_compliance_overview'],
  pieces_conformite: ['rm_compliance_overview', 'rm_compliance_missing_docs'],
  contrats_mp: ['rm_compliance_overview', 'rm_compliance_missing_docs'],
  avenants_mp: ['rm_compliance_overview'],
  ordres_service_mp: ['rm_compliance_overview'],
  visa_workflow: ['rm_compliance_overview', 'rm_compliance_visas_backlog'],
  audit_traces: ['rm_compliance_overview'],
};

/**
 * Rafraîchit une liste de vues matérialisées
 * Phase P3: Rafraîchissement ciblé
 */
async function refreshViews(client: Client, views: string[], trigger: 'event-driven' | 'cron' = 'event-driven'): Promise<void> {
  const refreshedViews: string[] = [];
  
  for (const v of views) {
    const start = Date.now();
    try {
      // Phase P4: Tracing du refresh
      await withSpan(`mview.refresh.${v}`, async (span) => {
        // CONCURRENTLY pour limiter le lock en lecture
        await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${v}`);
        const duration = (Date.now() - start) / 1000;

        // Phase P4: Métriques
        mviewRefreshCounter.inc({ view_name: v, trigger });
        mviewRefreshDuration.observe({ view_name: v, trigger }, duration);

        const log = withReq();
        log.info({ type: 'mview_refreshed', view: v, trigger, duration }, `[MVIEW] ✅ Vue ${v} rafraîchie`);

        if (span) {
          span.setAttributes({
            'mview.name': v,
            'mview.trigger': trigger,
            'mview.duration': duration,
          });
        }

        // Ajouter à la liste des vues rafraîchies avec succès
        refreshedViews.push(v);
      });
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';

      // Phase P4: Métriques d'erreur
      mviewRefreshErrors.inc({ view_name: v, error_type: errorType });
      mviewRefreshDuration.observe({ view_name: v, trigger }, duration);

      const log = withReq();
      log.error(
        {
          err: error,
          type: 'mview_refresh_error',
          view: v,
          trigger,
          duration,
        },
        `[MVIEW] ❌ Erreur lors du refresh de ${v}`
      );

      // Continue avec les autres vues même en cas d'erreur
    }
  }

  // Phase P4: Enregistrer toutes les vues rafraîchies avec succès en une seule requête
  if (refreshedViews.length > 0) {
    try {
      await client.query(
        `INSERT INTO mview_refresh_log(view_name, refreshed_at)
         SELECT v, NOW() FROM UNNEST($1::text[]) AS t(v)
         ON CONFLICT (view_name) DO UPDATE SET refreshed_at = EXCLUDED.refreshed_at`,
        [refreshedViews]
      );
    } catch (error) {
      // Ne pas faire échouer le refresh si l'enregistrement échoue
      const log = withReq();
      log.warn({ err: error, views: refreshedViews, type: 'mview_log_failed' }, `[MVIEW] ⚠️ Échec enregistrement dans mview_refresh_log`);
    }
  }
}

/**
 * Fonction principale : démarre le worker
 * Phase P3: Event-Driven Refresh
 */
async function main(): Promise<void> {
  const log = withReq();
  
  if (!process.env.DATABASE_URL) {
    log.warn({ type: 'worker_disabled' }, '[WORKER] DATABASE_URL non défini, worker désactivé');
    return;
  }

  const client = await pool.connect();
  
  try {
    // S'abonner au canal
    await client.query('LISTEN dashboard_refresh');
    const log = withReq();
    log.info({ type: 'worker_started' }, '[WORKER] 🚀 Écoute du canal "dashboard_refresh"…');

    // Écouter les notifications
    client.on('notification', async (msg: any) => {
      if (msg.channel !== 'dashboard_refresh' || !msg.payload) {
        return;
      }

      const notificationStart = Date.now();
      const log = withReq();

      try {
        const evt = JSON.parse(msg.payload);
        const domain = String(evt.domain || evt.table); // Support ancien format
        const tenant = String(evt.tenant_id ?? '');

        // Phase P4: Métriques
        workerNotificationsReceived.inc({ domain });

        // Phase P4: Tracing
        await withSpan(`worker.process_notification.${domain}`, async (span) => {
          const views = MVIEWS_BY_DOMAIN[domain] ?? [];

          if (!views.length) {
            log.warn({ type: 'worker_domain_unmapped', domain }, `[WORKER] Domain ${domain} non mappé, ignoré`);
            return;
          }

          // Lock global pour éviter les conflits entre workers/CRON
          const lockKey = 0xD45H000000000001n;

          const result = await withAdvisoryLock(client, lockKey, async () => {
            await refreshViews(client, views, 'event-driven');
            
            // Phase P4: Mettre à jour le heartbeat
            try {
              await client.query('SELECT update_worker_heartbeat($1, NULL)', [domain]);
            } catch (error) {
              // Ne pas faire échouer le refresh si le heartbeat échoue
              log.warn({ err: error, type: 'heartbeat_update_failed' }, '[WORKER] ⚠️ Échec mise à jour heartbeat');
            }
            
            log.info({ type: 'mview_refresh_complete', domain, tenant, views }, '[MVIEW] ✅ Rafraîchi');
          });

          if (result === undefined) {
            log.warn({ type: 'worker_lock_failed', domain }, '[MVIEW] ⚠️ Lock non acquis, refresh en cours ailleurs');
          }

          // Phase P4: Métriques de durée
          const processingDuration = (Date.now() - notificationStart) / 1000;
          workerProcessingDuration.observe({ domain }, processingDuration);

          if (span) {
            span.setAttributes({
              'worker.domain': domain,
              'worker.tenant': tenant,
              'worker.views_count': views.length,
              'worker.processing_duration': processingDuration,
            });
          }
        });
      } catch (error) {
        const processingDuration = (Date.now() - notificationStart) / 1000;
        log.error(
          {
            err: error,
            type: 'worker_notification_error',
            duration: processingDuration,
          },
          '[WORKER] ❌ Erreur lors du traitement de la notification'
        );
      }
    });

    // Gestion des erreurs de connexion
    client.on('error', (err) => {
      const log = withReq();
      log.error({ err, type: 'worker_connection_error' }, '[WORKER] ❌ Erreur de connexion PostgreSQL');
      // Le pool gère la reconnexion automatiquement
    });

    // Garder le processus actif
    process.on('SIGTERM', async () => {
      const log = withReq();
      log.info({ type: 'worker_shutdown' }, '[WORKER] 🛑 Arrêt demandé (SIGTERM)');
      await client.query('UNLISTEN dashboard_refresh');
      await client.release();
      await pool.end();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      const log = withReq();
      log.info({ type: 'worker_shutdown' }, '[WORKER] 🛑 Arrêt demandé (SIGINT)');
      await client.query('UNLISTEN dashboard_refresh');
      await client.release();
      await pool.end();
      process.exit(0);
    });
  } catch (error) {
    const log = withReq();
    log.error({ err: error, type: 'worker_startup_error' }, '[WORKER] ❌ Erreur lors du démarrage');
    await client.release();
    await pool.end();
    process.exit(1);
  }
}

// Démarrer le worker si exécuté directement
if (require.main === module) {
  main().catch((error) => {
    console.error('[WORKER] ❌ Erreur fatale:', error);
    process.exit(1);
  });
}

// Export pour utilisation programmatique
export { main as startRefreshWorker };
