-- lib/server/dashboard/sql/21_postgres_ha_pitr.sql
-- Phase P13: Configuration PostgreSQL HA + PITR
-- 
-- Réplication streaming + WAL archiving vers stockage objet (S3)
-- Base backups journalières
-- 
-- À adapter selon votre infrastructure (S3, Azure Blob, etc.)

-- ============================================================================
-- 1. CONFIGURATION RÉPLICATION (PRIMARY)
-- ============================================================================

-- postgresql.conf (exemple - à adapter)
-- wal_level = replica
-- max_wal_senders = 3
-- max_replication_slots = 3
-- archive_mode = on
-- archive_command = 'wal-g wal-push %p'  -- ou votre commande d'archive
-- archive_timeout = 300  -- Force archive toutes les 5 min (RPO cible)

-- pg_hba.conf (exemple)
-- host replication replicator <standby-ip>/32 md5

-- Créer un utilisateur de réplication
CREATE USER replicator WITH REPLICATION PASSWORD 'changeme';
GRANT CONNECT ON DATABASE your_database TO replicator;

-- ============================================================================
-- 2. CONFIGURATION WAL ARCHIVING (PITR)
-- ============================================================================

-- Exemple avec wal-g (https://github.com/wal-g/wal-g)
-- archive_command = 'wal-g wal-push %p'
-- 
-- Configuration wal-g (wal-g.yaml ou variables d'environnement) :
-- WALG_S3_PREFIX=s3://your-bucket/wal-archive/
-- AWS_ACCESS_KEY_ID=...
-- AWS_SECRET_ACCESS_KEY=...
-- AWS_REGION=...

-- Alternative : pg_basebackup + archive_command custom
-- archive_command = 'aws s3 cp %p s3://your-bucket/wal-archive/%f'

-- ============================================================================
-- 3. BASE BACKUPS JOURNALIERS
-- ============================================================================

-- Script de backup (à exécuter via cron ou job scheduler)
-- Exemple avec wal-g :
-- wal-g backup-push /var/lib/postgresql/data
-- 
-- Rétention (exemple) :
-- wal-g delete retain 7  -- Garder 7 backups
-- wal-g delete retain FULL 7 -- Garder 7 backups complets

-- ============================================================================
-- 4. RÉPLICATION SLOTS (pour réplication streaming)
-- ============================================================================

-- Créer un slot de réplication (sur le primary)
-- SELECT pg_create_physical_replication_slot('standby1');

-- Vérifier les slots
-- SELECT slot_name, slot_type, active, restart_lsn FROM pg_replication_slots;

-- ============================================================================
-- 5. MONITORING RÉPLICATION
-- ============================================================================

-- Vérifier le statut de réplication (sur le primary)
-- SELECT 
--   application_name,
--   sync_state,
--   sync_priority,
--   replay_lag,
--   state,
--   client_addr
-- FROM pg_stat_replication;

-- Vérifier le lag de replay (sur le standby)
-- SELECT 
--   pg_last_wal_replay_lag() as replay_lag,
--   pg_last_xact_replay_timestamp() as last_replay_timestamp;

-- ============================================================================
-- 6. PROMOTION STANDBY → PRIMARY (failover)
-- ============================================================================

-- Sur le standby (après arrêt du primary) :
-- SELECT pg_promote();

-- Vérifier le nouveau rôle
-- SELECT pg_is_in_recovery();  -- false = primary

-- ============================================================================
-- 7. PITR - RESTAURATION À UN TIMESTAMP
-- ============================================================================

-- Exemple avec wal-g :
-- 1. Restaurer le dernier backup complet
--    wal-g backup-fetch /var/lib/postgresql/data LATEST
-- 
-- 2. Créer recovery.conf (PostgreSQL < 12) ou recovery.signal (PostgreSQL 12+)
--    restore_command = 'wal-g wal-fetch %f %p'
--    recovery_target_time = '2026-01-25 14:30:00'
-- 
-- 3. Démarrer PostgreSQL (rejouera les WAL jusqu'au timestamp)
-- 
-- 4. Vérifier la cohérence (requêtes de contrôle)
-- 
-- 5. Promouvoir en primary si reprise définitive
--    SELECT pg_promote();

-- ============================================================================
-- 8. VÉRIFICATIONS POST-FAILOVER
-- ============================================================================

-- Vérifier le rôle
SELECT pg_is_in_recovery() as is_standby;

-- Vérifier les MViews (cohérence)
SELECT 
  view_name,
  refreshed_at,
  now() - refreshed_at as age
FROM mview_refresh_log
ORDER BY refreshed_at DESC
LIMIT 10;

-- Vérifier la santé générale
-- GET /api/internal/health
-- Vérifier : db.role='primary', replayLagSec=0, mviews OK
