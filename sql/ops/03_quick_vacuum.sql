-- P20 – Ops & Remédiations : VACUUM/ANALYZE ciblés
-- Tables volumineuses : factures, encaissements, telemetry_events, etc.
-- À exécuter manuellement ou via playbook db_hygiene (vacuum).
-- Préférer VACUUM (ANALYZE) hors pic pour limiter l’impact.

-- 1) VACUUM ANALYZE (non bloquant pour lectures, peut être coûteux en I/O)
-- À lancer table par table selon besoin.

-- VACUUM (ANALYZE) factures;
-- VACUUM (ANALYZE) encaissements;
-- VACUUM (ANALYZE) telemetry_events;
-- VACUUM (ANALYZE) projets;
-- VACUUM (ANALYZE) demandes;

-- 2) Vue utilitaire : tables avec beaucoup de dead tuples
-- Utile pour prioriser les vacuums.
CREATE OR REPLACE VIEW ops_vacuum_candidates AS
SELECT
  schemaname,
  relname,
  n_live_tup,
  n_dead_tup,
  CASE WHEN n_live_tup > 0
    THEN round(100.0 * n_dead_tup / NULLIF(n_live_tup, 0), 2)
    ELSE NULL
  END AS dead_pct,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

COMMENT ON VIEW ops_vacuum_candidates IS 'P20: Tables avec fort taux de dead tuples pour VACUUM ciblé';
