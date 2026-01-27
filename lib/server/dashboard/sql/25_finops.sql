-- 25_finops.sql
-- Phase P16: FinOps & Cost Guardrails
-- 
-- Système de quotas, budgets et contrôle des coûts par tenant/module/route
-- Compatible avec l'architecture existante (multi-tenant, route_key, SLO)
-- Sans modification de l'UX (router, registry, nav, KPI Bar)

-- ============================================================================
-- QUOTAS (par tenant et par module)
-- ============================================================================

CREATE TABLE IF NOT EXISTS finops_quotas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module          TEXT,                    -- NULL = global tenant, sinon 'dashboard', 'achats', 'stocks', etc.
  quota_type      TEXT NOT NULL CHECK (quota_type IN (
    'api_requests',           -- Requêtes API
    'export_csv',            -- Exports CSV
    'export_xlsx',           -- Exports XLSX
    'export_pdf',            -- Exports PDF
    'bytes_out',             -- Octets sortants (réponses API)
    'rows_max',              -- Lignes maximum par réponse
    'refresh_mview',         -- Refresh de vues matérialisées
    'jobs_background'        -- Jobs en arrière-plan
  )),
  period          TEXT NOT NULL CHECK (period IN ('daily', 'monthly')) DEFAULT 'daily',
  limit_value     BIGINT NOT NULL,        -- Limite (ex: 10000 requêtes/jour)
  soft_limit_pct  INT NOT NULL DEFAULT 80, -- Seuil soft (80% = alerte, 100% = hard limit)
  enabled         BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, module, quota_type, period)
);

CREATE INDEX IF NOT EXISTS idx_finops_quotas_tenant ON finops_quotas(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finops_quotas_module ON finops_quotas(tenant_id, module) WHERE module IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_finops_quotas_enabled ON finops_quotas(tenant_id, enabled) WHERE enabled = true;

-- Commentaires
COMMENT ON TABLE finops_quotas IS 'Quotas par tenant/module : limites journalières/mensuelles pour API, exports, octets, lignes';
COMMENT ON COLUMN finops_quotas.module IS 'Module concerné (NULL = global tenant) : dashboard, achats, stocks, materiel, compliance, etc.';
COMMENT ON COLUMN finops_quotas.soft_limit_pct IS 'Pourcentage du quota pour déclencher alerte (ex: 80 = alerte à 80%, hard limit à 100%)';

-- ============================================================================
-- BUDGETS (budgets SLO/SLA dynamiques)
-- ============================================================================

CREATE TABLE IF NOT EXISTS finops_budgets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module          TEXT,                    -- NULL = global tenant
  budget_type     TEXT NOT NULL CHECK (budget_type IN (
    'slo_response_time',      -- Budget temps de réponse (ms)
    'slo_availability',       -- Budget disponibilité (%)
    'cpu_time',               -- Budget temps CPU (ms)
    'db_query_time',          -- Budget temps requête DB (ms)
    'api_latency_p95',        -- Budget latence P95 (ms)
    'error_rate'              -- Budget taux d''erreur (%)
  )),
  period          TEXT NOT NULL CHECK (period IN ('daily', 'monthly')) DEFAULT 'daily',
  target_value    NUMERIC(18,2) NOT NULL,  -- Valeur cible (ex: 200ms pour response_time)
  warning_threshold NUMERIC(18,2),         -- Seuil d''avertissement
  critical_threshold NUMERIC(18,2),        -- Seuil critique (déclenche back-pressure)
  enabled         BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, module, budget_type, period)
);

CREATE INDEX IF NOT EXISTS idx_finops_budgets_tenant ON finops_budgets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finops_budgets_module ON finops_budgets(tenant_id, module) WHERE module IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_finops_budgets_enabled ON finops_budgets(tenant_id, enabled) WHERE enabled = true;

-- Commentaires
COMMENT ON TABLE finops_budgets IS 'Budgets SLO/SLA par tenant/module : temps de réponse, disponibilité, latence, taux d''erreur';
COMMENT ON COLUMN finops_budgets.critical_threshold IS 'Seuil critique : si dépassé, déclenche back-pressure (ralentissement/refus opérations coûteuses)';

-- ============================================================================
-- CONSOMMATION (tracking des utilisations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS finops_consumption (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module          TEXT,                    -- Module concerné (NULL = global)
  route_key       TEXT,                    -- Route concernée (ex: 'overview::summary::dashboard')
  operation_type  TEXT NOT NULL CHECK (operation_type IN (
    'api_request',            -- Requête API
    'export_csv',             -- Export CSV
    'export_xlsx',            -- Export XLSX
    'export_pdf',             -- Export PDF
    'refresh_mview',          -- Refresh MView
    'job_background'          -- Job arrière-plan
  )),
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Métriques de coût
  bytes_out       BIGINT,                  -- Octets sortants (réponse)
  rows_returned   INT,                     -- Lignes retournées
  cpu_time_ms     INT,                     -- Temps CPU (ms)
  api_time_ms     INT,                     -- Temps API total (ms)
  db_time_ms      INT,                     -- Temps DB (ms)
  
  -- Contexte
  user_id         TEXT,                    -- Utilisateur (pseudonymisé si nécessaire)
  ip_hash         TEXT,                    -- Hash SHA256 de l'IP
  user_agent      TEXT,                    -- User agent
  
  -- Résultat
  status          TEXT NOT NULL CHECK (status IN ('allowed', 'soft_limit', 'hard_limit', 'back_pressure')) DEFAULT 'allowed',
  quota_id        UUID REFERENCES finops_quotas(id),
  budget_id       UUID REFERENCES finops_budgets(id)
);

CREATE INDEX IF NOT EXISTS idx_finops_consumption_tenant ON finops_consumption(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finops_consumption_module ON finops_consumption(tenant_id, module) WHERE module IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_finops_consumption_route ON finops_consumption(tenant_id, route_key) WHERE route_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_finops_consumption_occurred ON finops_consumption(tenant_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_finops_consumption_type ON finops_consumption(tenant_id, operation_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_finops_consumption_status ON finops_consumption(tenant_id, status, occurred_at DESC) WHERE status != 'allowed';

-- Partition par mois pour performance (optionnel, à activer si volume élevé)
-- CREATE TABLE finops_consumption_2025_01 PARTITION OF finops_consumption
--   FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Commentaires
COMMENT ON TABLE finops_consumption IS 'Tracking de consommation : chaque opération (API, export, refresh) avec métriques de coût';
COMMENT ON COLUMN finops_consumption.status IS 'allowed = OK, soft_limit = proche limite (avertissement), hard_limit = refusé, back_pressure = ralenti/refusé sous stress';
COMMENT ON COLUMN finops_consumption.bytes_out IS 'Octets sortants (taille de la réponse API/export)';
COMMENT ON COLUMN finops_consumption.cpu_time_ms IS 'Temps CPU consommé (pour allocation de coût)';

-- ============================================================================
-- AGRÉGATIONS QUOTAS (pour calcul rapide)
-- ============================================================================

CREATE TABLE IF NOT EXISTS finops_quota_usage (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module          TEXT,                    -- NULL = global
  quota_id        UUID NOT NULL REFERENCES finops_quotas(id) ON DELETE CASCADE,
  period_start    TIMESTAMPTZ NOT NULL,    -- Début de période (00:00:00 du jour/mois)
  period_end      TIMESTAMPTZ NOT NULL,    -- Fin de période (23:59:59 du jour/mois)
  current_usage   BIGINT NOT NULL DEFAULT 0, -- Consommation actuelle
  last_updated    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (quota_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_finops_quota_usage_tenant ON finops_quota_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finops_quota_usage_quota ON finops_quota_usage(quota_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_finops_quota_usage_period ON finops_quota_usage(tenant_id, period_start, period_end);

-- Commentaires
COMMENT ON TABLE finops_quota_usage IS 'Agrégation de consommation par quota et période (pour calcul rapide sans scan complet)';
COMMENT ON COLUMN finops_quota_usage.period_start IS 'Début de période : 00:00:00 pour daily, 1er du mois 00:00:00 pour monthly';

-- ============================================================================
-- GOUVERNANCE (logs de refus, soft limits, back-pressure)
-- ============================================================================

CREATE TABLE IF NOT EXISTS finops_governance_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  module          TEXT,
  route_key       TEXT,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  event_type      TEXT NOT NULL CHECK (event_type IN (
    'quota_soft_limit',       -- Soft limit atteint (avertissement)
    'quota_hard_limit',       -- Hard limit atteint (refus)
    'budget_warning',         -- Budget warning threshold dépassé
    'budget_critical',        -- Budget critical threshold dépassé
    'back_pressure_triggered', -- Back-pressure activée
    'back_pressure_released',  -- Back-pressure relâchée
    'degradation_graceful'    -- Dégradation gracieuse activée
  )),
  
  -- Détails
  quota_id        UUID REFERENCES finops_quotas(id),
  budget_id       UUID REFERENCES finops_budgets(id),
  current_value   NUMERIC(18,2),            -- Valeur actuelle (ex: 85% du quota)
  limit_value     NUMERIC(18,2),           -- Limite (ex: 100% du quota)
  threshold_value NUMERIC(18,2),            -- Seuil déclencheur
  
  -- Contexte
  operation_type  TEXT,                    -- Type d'opération refusée/ralentie
  user_id         TEXT,
  request_id      TEXT,                     -- ID de requête pour corrélation
  
  -- Action prise
  action_taken    TEXT,                    -- 'refused', 'throttled', 'degraded', 'allowed_with_warning'
  message         TEXT                     -- Message pour l'utilisateur/admin
);

CREATE INDEX IF NOT EXISTS idx_finops_gov_logs_tenant ON finops_governance_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finops_gov_logs_module ON finops_governance_logs(tenant_id, module) WHERE module IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_finops_gov_logs_occurred ON finops_governance_logs(tenant_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_finops_gov_logs_event ON finops_governance_logs(tenant_id, event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_finops_gov_logs_quota ON finops_governance_logs(quota_id, occurred_at DESC) WHERE quota_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_finops_gov_logs_budget ON finops_governance_logs(budget_id, occurred_at DESC) WHERE budget_id IS NOT NULL;

-- Commentaires
COMMENT ON TABLE finops_governance_logs IS 'Logs de gouvernance : refus, soft limits, back-pressure, dégradations gracieuses';
COMMENT ON COLUMN finops_governance_logs.action_taken IS 'Action prise : refused (refusé), throttled (ralenti), degraded (dégradé), allowed_with_warning (autorisé avec avertissement)';

-- ============================================================================
-- VUES MATÉRIALISÉES (agrégations pour rapports FinOps)
-- ============================================================================

-- Vue : Consommation quotidienne par tenant/module/type
CREATE MATERIALIZED VIEW IF NOT EXISTS rm_finops_consumption_daily AS
SELECT
  tenant_id,
  module,
  operation_type,
  DATE(occurred_at) AS d,
  COUNT(*) AS operation_count,
  SUM(bytes_out) AS total_bytes_out,
  SUM(rows_returned) AS total_rows_returned,
  SUM(cpu_time_ms) AS total_cpu_time_ms,
  SUM(api_time_ms) AS total_api_time_ms,
  SUM(db_time_ms) AS total_db_time_ms,
  COUNT(*) FILTER (WHERE status = 'soft_limit') AS soft_limit_count,
  COUNT(*) FILTER (WHERE status = 'hard_limit') AS hard_limit_count,
  COUNT(*) FILTER (WHERE status = 'back_pressure') AS back_pressure_count
FROM finops_consumption
GROUP BY tenant_id, module, operation_type, DATE(occurred_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rm_finops_consumption_daily_unique 
  ON rm_finops_consumption_daily(tenant_id, module, operation_type, d);

CREATE INDEX IF NOT EXISTS idx_rm_finops_consumption_daily_tenant 
  ON rm_finops_consumption_daily(tenant_id, d DESC);

-- Vue : Utilisation de quotas (pourcentage) par tenant/module
CREATE MATERIALIZED VIEW IF NOT EXISTS rm_finops_quota_usage_pct AS
SELECT
  q.tenant_id,
  q.module,
  q.quota_type,
  q.period,
  q.limit_value,
  q.soft_limit_pct,
  COALESCE(u.current_usage, 0) AS current_usage,
  CASE 
    WHEN q.limit_value > 0 THEN (COALESCE(u.current_usage, 0)::NUMERIC / q.limit_value * 100)
    ELSE 0
  END AS usage_pct,
  CASE
    WHEN COALESCE(u.current_usage, 0) >= q.limit_value THEN 'hard_limit'
    WHEN COALESCE(u.current_usage, 0) >= (q.limit_value * q.soft_limit_pct / 100) THEN 'soft_limit'
    ELSE 'ok'
  END AS status,
  u.period_start,
  u.period_end,
  u.last_updated
FROM finops_quotas q
LEFT JOIN finops_quota_usage u ON q.id = u.quota_id
WHERE q.enabled = true;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rm_finops_quota_usage_pct_unique 
  ON rm_finops_quota_usage_pct(tenant_id, module, quota_type, period);

CREATE INDEX IF NOT EXISTS idx_rm_finops_quota_usage_pct_status 
  ON rm_finops_quota_usage_pct(tenant_id, status) WHERE status != 'ok';

-- Commentaires
COMMENT ON MATERIALIZED VIEW rm_finops_consumption_daily IS 'Agrégation quotidienne de consommation par tenant/module/type';
COMMENT ON MATERIALIZED VIEW rm_finops_quota_usage_pct IS 'Utilisation de quotas en pourcentage avec statut (ok/soft_limit/hard_limit)';

-- ============================================================================
-- FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction : Calculer la période (début/fin) pour un quota
CREATE OR REPLACE FUNCTION finops_get_period_bounds(
  p_period TEXT,
  p_date TIMESTAMPTZ DEFAULT now()
) RETURNS TABLE (period_start TIMESTAMPTZ, period_end TIMESTAMPTZ) AS $$
BEGIN
  IF p_period = 'daily' THEN
    RETURN QUERY SELECT
      date_trunc('day', p_date) AS period_start,
      date_trunc('day', p_date) + INTERVAL '1 day' - INTERVAL '1 second' AS period_end;
  ELSIF p_period = 'monthly' THEN
    RETURN QUERY SELECT
      date_trunc('month', p_date) AS period_start,
      date_trunc('month', p_date) + INTERVAL '1 month' - INTERVAL '1 second' AS period_end;
  ELSE
    RAISE EXCEPTION 'Invalid period: %', p_period;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction : Incrémenter l'usage d'un quota
CREATE OR REPLACE FUNCTION finops_increment_quota_usage(
  p_quota_id UUID,
  p_increment BIGINT DEFAULT 1
) RETURNS void AS $$
DECLARE
  v_quota finops_quotas%ROWTYPE;
  v_period_bounds RECORD;
BEGIN
  -- Récupérer le quota
  SELECT * INTO v_quota FROM finops_quotas WHERE id = p_quota_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quota not found: %', p_quota_id;
  END IF;
  
  -- Calculer les bornes de période
  SELECT * INTO v_period_bounds FROM finops_get_period_bounds(v_quota.period);
  
  -- Incrémenter ou créer l'usage
  INSERT INTO finops_quota_usage (quota_id, period_start, period_end, current_usage, last_updated)
  VALUES (p_quota_id, v_period_bounds.period_start, v_period_bounds.period_end, p_increment, now())
  ON CONFLICT (quota_id, period_start) 
  DO UPDATE SET 
    current_usage = finops_quota_usage.current_usage + p_increment,
    last_updated = now();
END;
$$ LANGUAGE plpgsql;

-- Commentaires
COMMENT ON FUNCTION finops_get_period_bounds IS 'Calcule les bornes de période (début/fin) pour daily ou monthly';
COMMENT ON FUNCTION finops_increment_quota_usage IS 'Incrémente l''usage d''un quota (atomique, thread-safe)';

-- ============================================================================
-- TRIGGERS (mise à jour automatique updated_at)
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_finops_quotas_updated_at
  BEFORE UPDATE ON finops_quotas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_finops_budgets_updated_at
  BEFORE UPDATE ON finops_budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INDEX SUPPLÉMENTAIRES POUR PERFORMANCE
-- ============================================================================

-- Index composite pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_finops_consumption_tenant_type_date 
  ON finops_consumption(tenant_id, operation_type, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_finops_gov_logs_tenant_type_date 
  ON finops_governance_logs(tenant_id, event_type, occurred_at DESC);

-- ============================================================================
-- COMMENTAIRES FINAUX
-- ============================================================================

COMMENT ON SCHEMA public IS 'Phase P16: FinOps & Cost Guardrails - Quotas, budgets, consommation et gouvernance par tenant/module';
