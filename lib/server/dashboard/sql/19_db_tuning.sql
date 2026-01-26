-- lib/server/dashboard/sql/19_db_tuning.sql
-- Phase P11: Gouvernance DB - pg_stat_statements, indexation, partitions, rétention

-- ============================================================================
-- 1. pg_stat_statements - Analyse des requêtes coûteuses
-- ============================================================================

-- Activer l'extension (nécessite superuser ou extension créée)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Vue pour analyser les top requêtes coûteuses
CREATE OR REPLACE VIEW v_top_expensive_queries AS
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  max_exec_time,
  rows,
  (total_exec_time / NULLIF(calls, 0)) as avg_time_per_call,
  (100.0 * total_exec_time / SUM(total_exec_time) OVER ()) as pct_total_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%' -- Exclure les requêtes de monitoring
ORDER BY total_exec_time DESC
LIMIT 20;

-- Fonction pour réinitialiser les stats (à utiliser avec précaution)
-- SELECT pg_stat_statements_reset();

-- ============================================================================
-- 2. Indexation ciblée - Vues reporting (fréquentes sur tenant, mois)
-- ============================================================================

-- Reporting Overview - Index sur tenant_id + mois (requêtes fréquentes)
CREATE INDEX IF NOT EXISTS idx_rmo_tenant_mois 
  ON rm_reporting_overview(tenant_id, mois);

-- Reporting DSO - Index sur tenant_id + mois
CREATE INDEX IF NOT EXISTS idx_rmd_tenant_mois 
  ON rm_reporting_dso(tenant_id, mois);

-- Reporting By Bureau - Index sur tenant_id + mois
CREATE INDEX IF NOT EXISTS idx_rmb_tenant_mois 
  ON rm_reporting_bureau(tenant_id, mois);

-- Reporting By Chantier - Index sur tenant_id + mois
CREATE INDEX IF NOT EXISTS idx_rmc_tenant_mois 
  ON rm_reporting_chantier(tenant_id, mois);

-- ============================================================================
-- 3. Indexation - Achats open orders (triés par date)
-- ============================================================================

-- Achats open orders - Index sur tenant_id + date (tri décroissant)
CREATE INDEX IF NOT EXISTS idx_rm_achats_open_orders_date 
  ON rm_achats_open_orders(tenant_id, emis_le DESC);

-- ============================================================================
-- 4. Partitions temporelles - Audit traces
-- ============================================================================

-- Créer la table parente si elle n'existe pas déjà
CREATE TABLE IF NOT EXISTS audit_traces (
  id BIGSERIAL,
  tenant_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(255),
  resource_id VARCHAR(255),
  when_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,
  PRIMARY KEY (id, when_at)
) PARTITION BY RANGE (when_at);

-- Créer les partitions mensuelles (exemple pour 2026)
CREATE TABLE IF NOT EXISTS audit_traces_2026_01 
  PARTITION OF audit_traces
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE IF NOT EXISTS audit_traces_2026_02 
  PARTITION OF audit_traces
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE IF NOT EXISTS audit_traces_2026_03 
  PARTITION OF audit_traces
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- Index sur tenant_id + when_at pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_audit_traces_tenant_when 
  ON audit_traces(tenant_id, when_at DESC);

-- ============================================================================
-- 5. Politique de rétention - Purge des données anciennes
-- ============================================================================

-- Fonction pour purger les audit traces > 12 mois
CREATE OR REPLACE FUNCTION purge_audit_traces_older_than_months(months_to_keep INTEGER DEFAULT 12)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  cutoff_date TIMESTAMPTZ;
BEGIN
  cutoff_date := NOW() - (months_to_keep || ' months')::INTERVAL;
  
  -- Supprimer les partitions entières si elles sont plus anciennes que la date limite
  -- (plus efficace que DELETE sur de grandes tables)
  -- Note: Cette approche nécessite de détacher les partitions, ce qui est plus complexe
  -- Pour l'instant, on fait un DELETE classique
  
  DELETE FROM audit_traces 
  WHERE when_at < cutoff_date;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour purger les exports anciens (si table existe)
-- CREATE OR REPLACE FUNCTION purge_old_exports(months_to_keep INTEGER DEFAULT 6)
-- RETURNS INTEGER AS $$
-- DECLARE
--   deleted_count INTEGER;
--   cutoff_date TIMESTAMPTZ;
-- BEGIN
--   cutoff_date := NOW() - (months_to_keep || ' months')::INTERVAL;
--   DELETE FROM dashboard_exports WHERE created_at < cutoff_date;
--   GET DIAGNOSTICS deleted_count = ROW_COUNT;
--   RETURN deleted_count;
-- END;
-- $$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. Indexation supplémentaire - Autres vues fréquentes
-- ============================================================================

-- KPIs Overview - Index sur tenant_id
CREATE INDEX IF NOT EXISTS idx_rm_kpis_overview_tenant 
  ON rm_kpis_overview(tenant_id);

-- Trends Daily - Index sur tenant_id + date
CREATE INDEX IF NOT EXISTS idx_rm_trends_daily_tenant_date 
  ON rm_trends_daily(tenant_id, date DESC);

-- Stocks Overview - Index sur tenant_id
CREATE INDEX IF NOT EXISTS idx_rm_stocks_overview_tenant 
  ON rm_stocks_overview(tenant_id);

-- Matériel Overview - Index sur tenant_id
CREATE INDEX IF NOT EXISTS idx_rm_materiel_overview_tenant 
  ON rm_materiel_overview(tenant_id);

-- Compliance Overview - Index sur tenant_id
CREATE INDEX IF NOT EXISTS idx_rm_compliance_overview_tenant 
  ON rm_compliance_overview(tenant_id);

-- ============================================================================
-- 7. VACUUM et ANALYZE - Maintenance périodique
-- ============================================================================

-- Fonction pour analyser les tables fréquemment utilisées
CREATE OR REPLACE FUNCTION analyze_dashboard_tables()
RETURNS VOID AS $$
BEGIN
  ANALYZE rm_reporting_overview;
  ANALYZE rm_reporting_dso;
  ANALYZE rm_reporting_bureau;
  ANALYZE rm_reporting_chantier;
  ANALYZE rm_kpis_overview;
  ANALYZE rm_trends_daily;
  ANALYZE rm_achats_open_orders;
  ANALYZE rm_stocks_overview;
  ANALYZE rm_materiel_overview;
  ANALYZE rm_compliance_overview;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- NOTES
-- ============================================================================

-- Pour exécuter la purge manuellement :
-- SELECT purge_audit_traces_older_than_months(12);

-- Pour analyser les tables :
-- SELECT analyze_dashboard_tables();

-- Pour voir les top requêtes coûteuses :
-- SELECT * FROM v_top_expensive_queries;

-- Pour créer automatiquement les partitions futures, utiliser un job CRON
-- ou un trigger qui crée la partition du mois suivant si elle n'existe pas.
