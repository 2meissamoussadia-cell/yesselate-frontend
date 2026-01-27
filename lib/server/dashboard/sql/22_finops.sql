-- 22_finops.sql
-- Phase P16: FinOps & Cost Guardrails
--
-- Politiques par tenant/module/route, consommation agrégée, log des refus.
-- Zéro impact UX : contrôles dans les handlers (lecture seule), routeur/render inchangés.
-- Scopes : global | module:achats | module:stocks | module:reporting | module:compliance | route:/api/export/dashboard | etc.
-- Périodes : daily (jour courant), monthly (1er → fin du mois).

-- ============================================================================
-- POLITIQUES FINOPS (par tenant, par module/route)
-- ============================================================================

CREATE TABLE IF NOT EXISTS finops_policies (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scope             TEXT NOT NULL,   -- 'global' | 'module:achats' | 'route:/api/export/dashboard'
  period            TEXT NOT NULL CHECK (period IN ('daily', 'monthly')) DEFAULT 'daily',
  quota_calls       INT,             -- nb d'appels autorisés / période
  quota_rows        BIGINT,          -- nb de lignes max cumulées / période
  quota_bytes       BIGINT,          -- octets sortants max / période
  quota_exports     INT,             -- nb d'exports (csv/xlsx/pdf) / période
  max_rows_per_call INT,             -- plafond par réponse
  max_bytes_per_call BIGINT,         -- plafond par réponse
  enabled           BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_finops_policies_tenant ON finops_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finops_policies_tenant_scope ON finops_policies(tenant_id, scope);
CREATE INDEX IF NOT EXISTS idx_finops_policies_enabled ON finops_policies(tenant_id, enabled) WHERE enabled = true;

COMMENT ON TABLE finops_policies IS 'Politiques FinOps par tenant/scope : quotas (calls, rows, bytes, exports) et plafonds par appel';
COMMENT ON COLUMN finops_policies.scope IS 'global | module:achats | module:stocks | module:reporting | module:compliance | route:/api/export/dashboard | etc.';

-- ============================================================================
-- CONSOMMATION (compteur agrégé par période)
-- ============================================================================

CREATE TABLE IF NOT EXISTS finops_usage (
  id           BIGSERIAL PRIMARY KEY,
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scope        TEXT NOT NULL,
  period       TEXT NOT NULL CHECK (period IN ('daily', 'monthly')),
  window_start DATE NOT NULL,   -- début de la période (jour ou 1er du mois)
  calls        BIGINT NOT NULL DEFAULT 0,
  rows         BIGINT NOT NULL DEFAULT 0,
  bytes        BIGINT NOT NULL DEFAULT 0,
  exports      BIGINT NOT NULL DEFAULT 0,
  UNIQUE (tenant_id, scope, period, window_start)
);

CREATE INDEX IF NOT EXISTS idx_finops_usage_tenant ON finops_usage(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finops_usage_tenant_scope_period ON finops_usage(tenant_id, scope, period);
CREATE INDEX IF NOT EXISTS idx_finops_usage_window ON finops_usage(tenant_id, period, window_start DESC);

COMMENT ON TABLE finops_usage IS 'Consommation agrégée par tenant/scope/période (compteurs incrémentés par les handlers)';
COMMENT ON COLUMN finops_usage.window_start IS 'Début de période : date du jour (daily) ou 1er du mois (monthly)';

-- ============================================================================
-- LOG DES REFUS / DÉGRADATIONS (audit produit)
-- ============================================================================

CREATE TABLE IF NOT EXISTS finops_denials (
  id        BIGSERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  scope     TEXT NOT NULL,
  reason    TEXT NOT NULL,   -- 'quota_exceeded' | 'backpressure' | 'budget_slo'
  details   JSONB
);

CREATE INDEX IF NOT EXISTS idx_finops_denials_tenant ON finops_denials(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finops_denials_timestamp ON finops_denials(tenant_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_finops_denials_reason ON finops_denials(tenant_id, reason, timestamp DESC);

COMMENT ON TABLE finops_denials IS 'Log des refus et dégradations (quota dépassé, back-pressure, budget SLO) pour rapport FinOps';
COMMENT ON COLUMN finops_denials.reason IS 'quota_exceeded | backpressure | budget_slo';
