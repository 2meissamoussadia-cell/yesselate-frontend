-- P20 – Ops & Remédiations : vérification et reconstruction d’index
-- À exécuter manuellement ou via playbook db_hygiene (reindex).
-- Prérequis : pg_stat_user_indexes, pg_index, pg_class.

-- 1) Index invalidés ou à reconstruire (informatif)
-- SELECT
--   c.relname AS table_name,
--   i.relname AS index_name,
--   CASE WHEN ix.indisvalid THEN 'valid' ELSE 'INVALID' END AS status
-- FROM pg_index ix
-- JOIN pg_class i ON i.oid = ix.indexrelid
-- JOIN pg_class c ON c.oid = ix.indrelid
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public' AND NOT ix.indisvalid;

-- 2) Exemple REINDEX CONCURRENTLY (à lancer par index si besoin)
-- REINDEX INDEX CONCURRENTLY idx_example;

-- 3) Index manquants fréquents (tenant_id, dates) – création conditionnelle
-- Ces index peuvent exister déjà via les migrations métier.

CREATE INDEX IF NOT EXISTS idx_ops_projets_tenant_created
  ON projets (tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_ops_demandes_tenant_created
  ON demandes (tenant_id, created_at);

CREATE INDEX IF NOT EXISTS idx_ops_factures_tenant_emise
  ON factures (tenant_id, emise_le);

CREATE INDEX IF NOT EXISTS idx_ops_encaissements_tenant_regle
  ON encaissements (tenant_id, regle_le);

-- 4) Vue utilitaire : index potentiellement bloatés (pg_stat_user_indexes)
-- Utilisable pour prioriser REINDEX.
CREATE OR REPLACE VIEW ops_index_stats AS
SELECT
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

COMMENT ON VIEW ops_index_stats IS 'P20: Statistiques index pour priorisation REINDEX';
