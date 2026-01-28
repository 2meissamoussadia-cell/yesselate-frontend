/**
 * Event-Driven Refresh Worker
 * Phase P3: Écoute les notifications PostgreSQL et rafraîchit les MViews ciblées
 * 
 * Utilise pg_notify() déclenché par les triggers SQL pour rafraîchir
 * uniquement les vues concernées par les changements.
 */

import { Client, type PoolClient } from 'pg';
import { pgPool } from '@lib-root/server/db/pool';

/**
 * Mapping table → vues matérialisées à rafraîchir
 * Phase P3: Event-Driven Refresh
 */
const TABLE_TO_VIEWS: Record<string, string[]> = {
  // Tables opérationnelles
  projets: ['rm_kpis_projets', 'rm_kpis_overview', 'rm_trends_daily'],
  demandes: ['rm_kpis_demandes', 'rm_kpis_overview', 'rm_trends_daily'],
  validations: ['rm_kpis_overview', 'rm_trends_daily'],
  
  // Tables finance
  situations_travaux: ['rm_finance_overview', 'rm_finance_trends'],
  factures: ['rm_finance_overview', 'rm_finance_trends'],
  encaissements: ['rm_finance_overview', 'rm_finance_trends'],
  
  // Tables métier
  risques: ['rm_kpis_overview'],
  blocages: ['rm_kpis_overview'],
  decisions: ['rm_kpis_overview'],
};

/**
 * Rafraîchit une vue matérialisée avec advisory lock pour éviter les conflits
 * Phase P3: Sécurité de concurrence
 */
async function refreshViewSafely(viewName: string, client: PoolClient): Promise<boolean> {
  // Advisory lock basé sur le hash du nom de la vue
  const lockId = `refresh_${viewName}`.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  try {
    // Acquérir le lock (timeout 5s)
    const lockResult = await client.query(
      `SELECT pg_try_advisory_lock($1) AS acquired`,
      [lockId]
    );
    
    if (!lockResult.rows[0]?.acquired) {
      console.warn(`[RefreshWorker] Lock non acquis pour ${viewName}, refresh en cours ailleurs`);
      return false;
    }
    
    try {
      // Rafraîchir la vue
      await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName}`);
      console.info(`[RefreshWorker] ✅ Vue ${viewName} rafraîchie`);
      return true;
    } finally {
      // Libérer le lock
      await client.query(`SELECT pg_advisory_unlock($1)`, [lockId]);
    }
  } catch (error) {
    console.error(`[RefreshWorker] ❌ Erreur lors du refresh de ${viewName}:`, error);
    return false;
  }
}

/**
 * Traite une notification PostgreSQL et rafraîchit les vues concernées
 * Phase P3: Event-Driven Refresh
 */
async function handleNotification(payload: string): Promise<void> {
  try {
    const data = JSON.parse(payload);
    const { domain, tenant_id } = data;
    
    // Support ancien format (table) et nouveau format (domain)
    const tableName = domain || data.table;
    
    if (!tableName || !TABLE_TO_VIEWS[tableName]) {
      console.warn(`[RefreshWorker] Domain/Table ${tableName} non mappé, ignoré`);
      return;
    }
    
    const viewsToRefresh = TABLE_TO_VIEWS[tableName];
    console.info(`[RefreshWorker] 📢 Notification: changement sur ${tableName} (tenant: ${tenant_id}) → refresh ${viewsToRefresh.join(', ')}`);
    
    // Obtenir une connexion du pool
    const client = await pgPool.connect();
    
    try {
      // Rafraîchir toutes les vues concernées
      const results = await Promise.allSettled(
        viewsToRefresh.map((view) => refreshViewSafely(view, client))
      );
      
      const successCount = results.filter((r) => r.status === 'fulfilled' && r.value).length;
      const failCount = results.length - successCount;
      
      if (failCount > 0) {
        console.warn(`[RefreshWorker] ⚠️ ${failCount}/${results.length} refreshs échoués`);
      } else {
        console.info(`[RefreshWorker] ✅ Tous les refreshs réussis (${successCount})`);
      }
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('[RefreshWorker] ❌ Erreur lors du traitement de la notification:', error);
  }
}

/**
 * Démarre le worker qui écoute les notifications PostgreSQL
 * Phase P3: Event-Driven Refresh
 * 
 * @returns Fonction pour arrêter le worker
 */
export function startRefreshWorker(): () => Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn('[RefreshWorker] DATABASE_URL non défini, worker désactivé');
    return async () => {};
  }
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  let isRunning = true;
  
  // Connexion et écoute
  client.connect()
    .then(() => {
      console.info('[RefreshWorker] 🚀 Worker démarré, écoute du canal "dashboard_refresh"');
      
      // S'abonner au canal
      client.query('LISTEN dashboard_refresh');
      
      // Écouter les notifications
      client.on('notification', (msg) => {
        if (msg.channel === 'dashboard_refresh' && msg.payload) {
          handleNotification(msg.payload).catch((err) => {
            console.error('[RefreshWorker] Erreur dans handleNotification:', err);
          });
        }
      });
      
      // Gestion des erreurs de connexion
      client.on('error', (err) => {
        console.error('[RefreshWorker] ❌ Erreur de connexion PostgreSQL:', err);
        // Tentative de reconnexion après 5s
        if (isRunning) {
          setTimeout(() => {
            if (isRunning) {
              console.info('[RefreshWorker] 🔄 Tentative de reconnexion...');
              startRefreshWorker();
            }
          }, 5000);
        }
      });
    })
    .catch((err) => {
      console.error('[RefreshWorker] ❌ Impossible de démarrer le worker:', err);
    });
  
  // Fonction d'arrêt
  return async () => {
    isRunning = false;
    try {
      await client.query('UNLISTEN dashboard_refresh');
      await client.end();
      console.info('[RefreshWorker] 🛑 Worker arrêté');
    } catch (err) {
      console.error('[RefreshWorker] Erreur lors de l\'arrêt:', err);
    }
  };
}

/**
 * Rafraîchit toutes les vues matérialisées (utilisé par le CRON de secours)
 * Phase P3: CRON de secours
 */
export async function refreshAllViews(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn('[RefreshWorker] DATABASE_URL non défini, refresh désactivé');
    return;
  }
  
  const client = await pgPool.connect();
  
  try {
    const allViews = [
      'rm_kpis_projets',
      'rm_kpis_demandes',
      'rm_kpis_overview',
      'rm_trends_daily',
      'rm_finance_overview',
      'rm_finance_trends',
    ];
    
    console.info(`[RefreshWorker] 🔄 Rafraîchissement de ${allViews.length} vues (CRON de secours)`);
    
    const results = await Promise.allSettled(
      allViews.map((view) => refreshViewSafely(view, client))
    );
    
    const successCount = results.filter((r) => r.status === 'fulfilled' && r.value).length;
    const failCount = results.length - successCount;
    
    console.info(`[RefreshWorker] ✅ ${successCount}/${results.length} vues rafraîchies avec succès`);
    
    if (failCount > 0) {
      console.warn(`[RefreshWorker] ⚠️ ${failCount} vues non rafraîchies`);
    }
  } catch (error) {
    console.error('[RefreshWorker] ❌ Erreur lors du refresh global:', error);
  } finally {
    client.release();
  }
}
