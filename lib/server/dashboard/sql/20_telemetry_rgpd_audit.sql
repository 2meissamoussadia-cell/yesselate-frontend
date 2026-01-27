-- lib/server/dashboard/sql/20_telemetry_rgpd_audit.sql
-- Phase P14: Observabilité produit - Audit RGPD

-- ============================================================================
-- AUDIT LOGS POUR TÉLÉMÉTRIE
-- ============================================================================

-- Table d'audit pour les opérations sur la télémetrie
CREATE TABLE IF NOT EXISTS telemetry_audit_log (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     UUID NOT NULL,
  operation     TEXT NOT NULL, -- 'anonymize', 'export', 'delete'
  target_user_id TEXT,
  target_route   TEXT,
  performed_by  TEXT NOT NULL, -- user_id qui a effectué l'opération
  performed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  details       JSONB, -- Détails supplémentaires (nombre d'enregistrements, etc.)
  ip_address    TEXT,
  user_agent    TEXT
);

CREATE INDEX IF NOT EXISTS idx_tel_audit_tenant_time ON telemetry_audit_log(tenant_id, performed_at DESC);
CREATE INDEX IF NOT EXISTS idx_tel_audit_operation ON telemetry_audit_log(operation);

-- Fonction pour logger les opérations d'anonymisation
CREATE OR REPLACE FUNCTION log_telemetry_anonymize(
  p_tenant_id UUID,
  p_target_user_id TEXT,
  p_performed_by TEXT,
  p_updated_count INTEGER,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO telemetry_audit_log (
    tenant_id,
    operation,
    target_user_id,
    performed_by,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_tenant_id,
    'anonymize',
    p_target_user_id,
    p_performed_by,
    jsonb_build_object('updated_count', p_updated_count),
    p_ip_address,
    p_user_agent
  );
END;
$$ LANGUAGE plpgsql;

-- Vue : Résumé des opérations d'audit (30 derniers jours)
CREATE OR REPLACE VIEW v_telemetry_audit_summary AS
SELECT 
  tenant_id,
  operation,
  COUNT(*) AS operation_count,
  COUNT(DISTINCT target_user_id) AS affected_users,
  MIN(performed_at) AS first_operation,
  MAX(performed_at) AS last_operation
FROM telemetry_audit_log
WHERE performed_at >= NOW() - INTERVAL '30 days'
GROUP BY tenant_id, operation
ORDER BY tenant_id, operation;
