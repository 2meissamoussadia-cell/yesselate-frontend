/**
 * CRON Job de secours pour rafraîchissement des MViews
 * Phase P3: Rafraîchit toutes les vues toutes les 5-10 minutes
 * Phase P4: Observabilité (logs corrélés, métriques)
 * 
 * Utilisation:
 * - Node.js: Utiliser node-cron ou similar
 * - Système: Utiliser crontab
 * - Next.js API Route: Créer /api/cron/refresh-views (protégé par secret)
 */

import { Pool } from 'pg';
import { logger, withReq } from '@/lib/server/logging';
import { mviewRefreshCounter, mviewRefreshDuration, mviewRefreshErrors } from '@/lib/server/observability/metrics';
import { withSpan } from '@/lib/server/observability/telemetry';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const VIEWS = [
  'rm_kpis_overview',
  'rm_trends_daily',
  'rm_kpis_projets',
  'rm_kpis_demandes',
  'rm_finance_overview',
  'rm_finance_trends',
  // Phase P5: MViews Achats/Contrats
  'rm_achats_overview',
  'rm_achats_trends',
  'rm_achats_fournisseurs',
  'rm_achats_open_orders',
  // Phase P6: MViews Stocks & Matériel
  'rm_stocks_overview',
  'rm_stocks_trends',
  'rm_stocks_ruptures',
  'rm_materiel_overview',
  'rm_materiel_trends',
  'rm_materiel_backlog_maintenance',
  // Phase P7: MViews Reporting Direction (mensuelles)
  'rm_reporting_overview',
  'rm_reporting_dso',
  'rm_reporting_bureau',
  'rm_reporting_chantier',
  // Phase P8: MViews Conformité & Marchés publics
  'rm_compliance_overview',
  'rm_compliance_visas_backlog',
  'rm_compliance_missing_docs',
];

/**
 * Exécute le job de rafraîchissement
 * Phase P3: CRON de secours
 */
async function run(): Promise<void> {
  const log = withReq('cron-refresh');
  const cronStart = Date.now();

  if (!process.env.DATABASE_URL) {
    log.warn({ type: 'cron_disabled' }, '[CRON] DATABASE_URL non défini, refresh désactivé');
    return;
  }

  // Phase P4: Tracing du job CRON
  await withSpan('cron.refresh_all_views', async (span) => {
    const client = await pool.connect();
    const refreshedViews: string[] = [];
    
    try {
      for (const v of VIEWS) {
        const viewStart = Date.now();
        try {
          await withSpan(`cron.refresh.${v}`, async (viewSpan) => {
            await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${v}`);
            const duration = (Date.now() - viewStart) / 1000;

            // Phase P4: Métriques
            mviewRefreshCounter.inc({ view_name: v, trigger: 'cron' });
            mviewRefreshDuration.observe({ view_name: v, trigger: 'cron' }, duration);

            log.info({ type: 'mview_refreshed', view: v, trigger: 'cron', duration }, `[CRON] ✅ Vue ${v} rafraîchie`);

            if (viewSpan) {
              viewSpan.setAttributes({
                'mview.name': v,
                'mview.trigger': 'cron',
                'mview.duration': duration,
              });
            }

            // Ajouter à la liste des vues rafraîchies avec succès
            refreshedViews.push(v);
          });
        } catch (error) {
          const duration = (Date.now() - viewStart) / 1000;
          const errorType = error instanceof Error ? error.constructor.name : 'UnknownError';

          // Phase P4: Métriques d'erreur
          mviewRefreshErrors.inc({ view_name: v, error_type: errorType });
          log.error(
            {
              err: error,
              type: 'mview_refresh_error',
              view: v,
              trigger: 'cron',
              duration,
            },
            `[CRON] ❌ Erreur lors du refresh de ${v}`
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
          log.warn({ err: error, views: refreshedViews, type: 'mview_log_failed' }, `[CRON] ⚠️ Échec enregistrement dans mview_refresh_log`);
        }
      }

      const totalDuration = (Date.now() - cronStart) / 1000;
      log.info(
        { type: 'cron_complete', views: VIEWS, duration: totalDuration, at: new Date().toISOString() },
        '[CRON] ✅ Rafraîchi'
      );

      if (span) {
        span.setAttributes({
          'cron.views_count': VIEWS.length,
          'cron.total_duration': totalDuration,
        });
      }
    } finally {
      client.release();
    }
  });
}

// Exécuter si appelé directement
if (require.main === module) {
  run()
    .then(() => {
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('[CRON] ❌ Erreur fatale:', error);
      pool.end();
      process.exit(1);
    });
}

// Export pour utilisation programmatique
export { run as executeRefreshCronJob };
