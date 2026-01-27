/**
 * Health Checks améliorés
 * Phase P4: Observabilité & Robustesse
 * Phase P13: Résilience & DR - Extension avec réplication et rôle DB
 * 
 * Vérifie DB, worker heartbeat, MView staleness, réplication, rôle (primary/standby)
 */

import { NextRequest, NextResponse } from 'next/server';
import { pgPool } from '@lib-root/server/db/pool';
import { mviewStaleness, dbReplayLagSeconds, dbRole } from './metrics';
import { logger, withReq } from '@/lib/server/logging';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency?: number;
  message?: string;
  details?: Record<string, any>;
}

/**
 * Vérifie la santé de la base de données
 * Phase P4: Health checks
 * Phase P13: Extension avec rôle (primary/standby) et réplication
 */
async function checkDatabase(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const client = await pgPool.connect();
    try {
      // Simple query pour vérifier la connexion
      await client.query('SELECT 1');
      const latency = Date.now() - start;

      // Phase P13: Vérifier le rôle (primary/standby)
      const roleResult = await client.query<{ pg_is_in_recovery: boolean }>(
        'SELECT pg_is_in_recovery()'
      );
      const isStandby = roleResult.rows[0]?.pg_is_in_recovery ?? false;
      const role = isStandby ? 'standby' : 'primary';

      // Phase P13: Exposer métriques Prometheus
      dbRole.set({ role }, isStandby ? 0 : 1);
      
      // Si standby, mesurer le lag
      if (isStandby) {
        try {
          const lagResult = await client.query<{ lag_sec: number }>(`
            SELECT EXTRACT(EPOCH FROM (NOW() - pg_last_xact_replay_timestamp()))::int AS lag_sec
          `);
          const lagSeconds = Number(lagResult.rows[0]?.lag_sec ?? 0);
          dbReplayLagSeconds.set({ role }, lagSeconds);
        } catch {
          // Ignorer si lag non mesurable
        }
      } else {
        dbReplayLagSeconds.set({ role }, 0);
      }
      
      return {
        service: 'database',
        status: latency < 1000 ? 'healthy' : latency < 3000 ? 'degraded' : 'unhealthy',
        latency,
        details: {
          role,
          is_standby: isStandby,
        },
      };
    } finally {
      client.release();
    }
  } catch (error) {
    return {
      service: 'database',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Database connection failed',
    };
  }
}

/**
 * Vérifie la réplication PostgreSQL
 * Phase P13: Résilience & DR
 * 
 * Vérifie :
 * - Rôle (primary/standby)
 * - Replication lag (pour primary)
 * - Statut des replicas (pour primary)
 */
async function checkReplication(): Promise<HealthCheckResult> {
  try {
    const client = await pgPool.connect();
    try {
      // Vérifier le rôle
      const roleResult = await client.query<{ pg_is_in_recovery: boolean }>(
        'SELECT pg_is_in_recovery()'
      );
      const isStandby = roleResult.rows[0]?.pg_is_in_recovery ?? false;
      const role = isStandby ? 'standby' : 'primary';

      if (isStandby) {
        // Sur un standby, vérifier le lag de replay
        const lagResult = await client.query<{
          replay_lag: string | null;
          replay_lag_seconds: number | null;
        }>(`
          SELECT 
            pg_last_wal_replay_lag() as replay_lag,
            EXTRACT(EPOCH FROM pg_last_wal_replay_lag())::int as replay_lag_seconds
        `);

        const replayLagSeconds = lagResult.rows[0]?.replay_lag_seconds ?? null;
        const maxLagSeconds = 300; // 5 minutes (RPO cible)

        // Status selon le lag
        let status: 'healthy' | 'degraded' | 'unhealthy';
        if (replayLagSeconds === null) {
          status = 'degraded'; // Pas de lag mesurable (peut être normal)
        } else if (replayLagSeconds <= maxLagSeconds) {
          status = 'healthy';
        } else if (replayLagSeconds <= maxLagSeconds * 3) {
          status = 'degraded';
        } else {
          status = 'unhealthy';
        }

        return {
          service: 'replication',
          status,
          message: replayLagSeconds !== null
            ? `Standby replay lag: ${replayLagSeconds}s`
            : 'Standby (lag not measurable)',
          details: {
            role,
            replay_lag_seconds: replayLagSeconds,
            max_lag_seconds: maxLagSeconds,
          },
        };
      } else {
        // Sur un primary, vérifier les replicas
        const replicasResult = await client.query<{
          application_name: string;
          sync_state: string;
          sync_priority: number;
          replay_lag: string | null;
          replay_lag_seconds: number | null;
          state: string;
        }>(`
          SELECT 
            application_name,
            sync_state,
            sync_priority,
            replay_lag,
            EXTRACT(EPOCH FROM replay_lag)::int as replay_lag_seconds,
            state
          FROM pg_stat_replication
          ORDER BY sync_priority DESC, application_name
        `);

        const replicas = replicasResult.rows;
        const maxLagSeconds = 300; // 5 minutes (RPO cible)

        if (replicas.length === 0) {
          return {
            service: 'replication',
            status: 'degraded',
            message: 'Primary with no replicas',
            details: {
              role,
              replica_count: 0,
            },
          };
        }

        // Vérifier le lag de chaque replica
        const healthyReplicas = replicas.filter(
          (r) => r.replay_lag_seconds !== null && r.replay_lag_seconds <= maxLagSeconds
        );
        const degradedReplicas = replicas.filter(
          (r) => r.replay_lag_seconds !== null && r.replay_lag_seconds > maxLagSeconds && r.replay_lag_seconds <= maxLagSeconds * 3
        );
        const unhealthyReplicas = replicas.filter(
          (r) => r.replay_lag_seconds === null || r.replay_lag_seconds > maxLagSeconds * 3
        );

        let status: 'healthy' | 'degraded' | 'unhealthy';
        if (unhealthyReplicas.length > 0) {
          status = 'unhealthy';
        } else if (degradedReplicas.length > 0) {
          status = 'degraded';
        } else {
          status = 'healthy';
        }

        return {
          service: 'replication',
          status,
          message: `${replicas.length} replica(s): ${healthyReplicas.length} healthy, ${degradedReplicas.length} degraded, ${unhealthyReplicas.length} unhealthy`,
          details: {
            role,
            replica_count: replicas.length,
            healthy_count: healthyReplicas.length,
            degraded_count: degradedReplicas.length,
            unhealthy_count: unhealthyReplicas.length,
            max_lag_seconds: maxLagSeconds,
            replicas: replicas.map((r) => ({
              application_name: r.application_name,
              sync_state: r.sync_state,
              sync_priority: r.sync_priority,
              replay_lag_seconds: r.replay_lag_seconds,
              state: r.state,
            })),
          },
        };
      }
    } finally {
      client.release();
    }
  } catch (error) {
    // Si pg_stat_replication n'est pas accessible (permissions), considérer comme degraded
    if (error instanceof Error && error.message.includes('permission')) {
      return {
        service: 'replication',
        status: 'degraded',
        message: 'Replication check requires superuser or replication role',
      };
    }

    return {
      service: 'replication',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Failed to check replication',
    };
  }
}

/**
 * Vérifie la fraîcheur des vues matérialisées
 * Phase P4: Health checks
 */
async function checkMaterializedViews(): Promise<HealthCheckResult> {
  try {
    const client = await pgPool.connect();
    try {
      // Vérifier la dernière mise à jour des vues
      // Note: pg_matviews.last_refresh n'existe pas dans PostgreSQL standard
      // On utilise une approche alternative : vérifier si les vues existent
      const result = await client.query<{
        viewname: string;
      }>(`
        SELECT 
          schemaname || '.' || matviewname AS viewname
        FROM pg_matviews
        WHERE schemaname = 'public'
          AND matviewname LIKE 'rm_%'
        ORDER BY matviewname
      `);

      const views = result.rows;
      
      // Vérifier la fraîcheur via mview_refresh_log
      // Extraire les noms de vues (sans schéma) pour la requête
      const viewNames = views.map(v => v.viewname.split('.')[1] || v.viewname);
      
      const refreshLogResult = await client.query<{
        view_name: string;
        refreshed_at: Date;
      }>(`
        SELECT view_name, refreshed_at
        FROM mview_refresh_log
        WHERE view_name = ANY($1::text[])
      `, [viewNames]);

      const refreshLogMap = new Map(
        refreshLogResult.rows.map(r => [r.view_name, r.refreshed_at])
      );

      const viewDetails: Record<string, any> = {};
      let staleCount = 0;
      const now = new Date();
      const staleThresholdSeconds = 3600; // 1 heure

      for (const view of views) {
        try {
          const viewName = view.viewname.split('.')[1]; // Extraire le nom sans schéma
          const lastRefresh = refreshLogMap.get(viewName);
          
          // Vérifier si la vue a des données (simple COUNT)
          const countResult = await client.query(`SELECT COUNT(*) as cnt FROM ${view.viewname}`);
          const hasData = Number(countResult.rows[0]?.cnt || 0) > 0;
          
          let isStale = false;
          if (!hasData) {
            isStale = true;
          } else if (lastRefresh) {
            const ageSeconds = (now.getTime() - new Date(lastRefresh).getTime()) / 1000;
            isStale = ageSeconds > staleThresholdSeconds;
          } else {
            // Pas de log de refresh = considérer comme stale si > 1h depuis création
            isStale = true;
          }
          
          viewDetails[view.viewname] = {
            exists: true,
            hasData,
            lastRefresh: lastRefresh ? lastRefresh.toISOString() : null,
            isStale,
          };
          
          if (isStale) {
            staleCount++;
          }
        } catch {
          // Vue inaccessible ou erreur
          viewDetails[view.viewname] = { exists: false, isStale: true };
          staleCount++;
        }
      }

      return {
        service: 'materialized_views',
        status: staleCount === 0 ? 'healthy' : staleCount < views.length ? 'degraded' : 'unhealthy',
        message: staleCount > 0 ? `${staleCount} vue(s) sans données ou inaccessibles` : 'All views accessible',
        details: {
          total: views.length,
          stale: staleCount,
          views: viewDetails,
        },
      };
    } finally {
      client.release();
    }
  } catch (error) {
    return {
      service: 'materialized_views',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Failed to check views',
    };
  }
}

/**
 * Vérifie le worker (via heartbeat ou fichier)
 * Phase P4: Health checks
 */
/**
 * Vérifie le worker via la table de heartbeat
 * Phase P4: Health checks
 */
async function checkWorker(): Promise<HealthCheckResult> {
  try {
    const client = await pgPool.connect();
    try {
      // Vérifier la table de heartbeat
      const result = await client.query<{
        last_heartbeat: Date;
        last_domain: string | null;
        last_notification_count: number;
        updated_at: Date;
      }>(`
        SELECT 
          last_heartbeat,
          last_domain,
          last_notification_count,
          updated_at
        FROM dashboard_worker_heartbeat
        WHERE id = 1
      `);

      if (result.rows.length === 0) {
        return {
          service: 'refresh_worker',
          status: 'unhealthy',
          message: 'Worker heartbeat table not found',
        };
      }

      const heartbeat = result.rows[0];
      const now = new Date();
      const lastHeartbeat = new Date(heartbeat.last_heartbeat);
      const ageSeconds = (now.getTime() - lastHeartbeat.getTime()) / 1000;

      // Considérer le worker comme healthy si le heartbeat est < 5 minutes
      // degraded si < 15 minutes, unhealthy si > 15 minutes
      let status: 'healthy' | 'degraded' | 'unhealthy';
      if (ageSeconds < 300) {
        status = 'healthy';
      } else if (ageSeconds < 900) {
        status = 'degraded';
      } else {
        status = 'unhealthy';
      }

      return {
        service: 'refresh_worker',
        status,
        latency: Math.round(ageSeconds * 1000), // en millisecondes
        message: status === 'healthy' 
          ? 'Worker heartbeat OK' 
          : `Worker heartbeat stale (${Math.round(ageSeconds)}s ago)`,
        details: {
          last_heartbeat: heartbeat.last_heartbeat.toISOString(),
          last_domain: heartbeat.last_domain,
          notification_count: heartbeat.last_notification_count,
          age_seconds: Math.round(ageSeconds),
        },
      };
    } finally {
      client.release();
    }
  } catch (error) {
    // Si la table n'existe pas, considérer comme degraded (pas unhealthy car optionnel)
    if (error instanceof Error && error.message.includes('does not exist')) {
      return {
        service: 'refresh_worker',
        status: 'degraded',
        message: 'Worker heartbeat table not found (optional)',
      };
    }
    
    return {
      service: 'refresh_worker',
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Failed to check worker',
    };
  }
}

/**
 * Health check endpoint amélioré
 * Phase P4: Observabilité & Robustesse
 */
export async function healthCheck(req: NextRequest): Promise<NextResponse> {
  const requestId = req.headers.get('x-request-id') || 'health-check';
  const log = withReq(requestId);

  const start = Date.now();

  try {
    // Phase P13: Exécuter tous les checks en parallèle (ajout de checkReplication)
    const [db, mviews, worker, replication] = await Promise.allSettled([
      checkDatabase(),
      checkMaterializedViews(),
      checkWorker(),
      checkReplication(), // Phase P13: Nouveau check réplication
    ]);

    const checks: HealthCheckResult[] = [
      db.status === 'fulfilled' ? db.value : { service: 'database', status: 'unhealthy', message: 'Check failed' },
      mviews.status === 'fulfilled' ? mviews.value : { service: 'materialized_views', status: 'unhealthy', message: 'Check failed' },
      worker.status === 'fulfilled' ? worker.value : { service: 'refresh_worker', status: 'unhealthy', message: 'Check failed' },
      replication.status === 'fulfilled' ? replication.value : { service: 'replication', status: 'unhealthy', message: 'Check failed' }, // Phase P13
    ];

    // Déterminer le statut global
    const hasUnhealthy = checks.some((c) => c.status === 'unhealthy');
    const hasDegraded = checks.some((c) => c.status === 'degraded');
    const globalStatus = hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy';

    const duration = Date.now() - start;

    const health = {
      status: globalStatus,
      timestamp: new Date().toISOString(),
      duration,
      checks,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    log.info({ type: 'health_check', status: globalStatus, duration }, '[HEALTH] Health check completed');

    return NextResponse.json(health, {
      status: globalStatus === 'healthy' ? 200 : globalStatus === 'degraded' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'x-request-id': requestId,
      },
    });
  } catch (error) {
    const log = withReq(requestId);
    log.error({ err: error }, '[HEALTH] Health check failed');
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 503 }
    );
  }
}
