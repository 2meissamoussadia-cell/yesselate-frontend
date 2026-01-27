-- lib/server/dashboard/sql/24_security.sql
-- Phase P18: Sécurité avancée - Tables pour gestion des clés et secrets

-- ============================================================================
-- 1. TABLE POUR GESTION DES CLÉS DE CHIFFREMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id TEXT NOT NULL UNIQUE, -- Identifiant de la clé (ex: 'export-e2e', 'session-encryption')
  key_material TEXT NOT NULL, -- Clé chiffrée avec la clé maître (KMS)
  algorithm TEXT NOT NULL DEFAULT 'aes-256-gcm',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Date d'expiration (null = pas d'expiration)
  active BOOLEAN NOT NULL DEFAULT true,
  rotated_from UUID REFERENCES encryption_keys(id), -- Clé précédente (pour traçabilité)
  
  CONSTRAINT encryption_keys_key_id_check CHECK (key_id ~ '^[a-z0-9-]+$')
);

CREATE INDEX IF NOT EXISTS idx_encryption_keys_active ON encryption_keys(key_id, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_encryption_keys_expires ON encryption_keys(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE encryption_keys IS 'Clés de chiffrement pour E2E exports et autres données sensibles (P18)';
COMMENT ON COLUMN encryption_keys.key_material IS 'Clé chiffrée avec la clé maître (KMS) - jamais en clair';
COMMENT ON COLUMN encryption_keys.rotated_from IS 'Référence à la clé précédente lors de la rotation';

-- ============================================================================
-- 2. TABLE POUR SECRETS MANAGEMENT (références vers KMS/Vault)
-- ============================================================================

CREATE TABLE IF NOT EXISTS secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  secret_name TEXT NOT NULL, -- Nom du secret (ex: 'smtp-password', 'api-key-external')
  secret_path TEXT, -- Chemin dans le KMS (ex: 'secret/data/smtp', 'kv/data/api-keys')
  secret_version INTEGER, -- Version du secret dans le KMS
  kms_provider TEXT NOT NULL DEFAULT 'vault', -- 'vault', 'aws-kms', 'azure-keyvault', 'gcp-kms'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_rotated_at TIMESTAMPTZ,
  next_rotation_at TIMESTAMPTZ,
  rotation_interval_days INTEGER DEFAULT 90,
  
  UNIQUE (tenant_id, secret_name)
);

CREATE INDEX IF NOT EXISTS idx_secrets_tenant ON secrets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_secrets_rotation ON secrets(next_rotation_at) WHERE next_rotation_at IS NOT NULL;

COMMENT ON TABLE secrets IS 'Références vers secrets stockés dans KMS/Vault (P18)';
COMMENT ON COLUMN secrets.secret_path IS 'Chemin dans le KMS (le secret réel n''est jamais stocké ici)';
COMMENT ON COLUMN secrets.kms_provider IS 'Provider KMS utilisé (vault, aws-kms, etc.)';

-- ============================================================================
-- 3. TABLE POUR AUDIT DE SÉCURITÉ
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_audit_log (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT,
  event_type TEXT NOT NULL, -- 'auth_failure', 'csrf_reject', 'rate_limit', 'unauthorized_access', etc.
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address INET,
  user_agent TEXT,
  request_path TEXT,
  request_method TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_audit_tenant ON security_audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_type ON security_audit_log(event_type, severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_critical ON security_audit_log(severity, created_at DESC) WHERE severity IN ('high', 'critical');

COMMENT ON TABLE security_audit_log IS 'Log d''audit pour événements de sécurité (P18)';
COMMENT ON COLUMN security_audit_log.details IS 'Détails JSON de l''événement (headers, body sanitized, etc.)';

-- ============================================================================
-- 4. VUE POUR ALERTES SÉCURITÉ
-- ============================================================================

CREATE OR REPLACE VIEW v_security_events_recent AS
SELECT
  tenant_id,
  event_type,
  severity,
  COUNT(*) AS event_count,
  MAX(created_at) AS last_occurrence
FROM security_audit_log
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY tenant_id, event_type, severity
ORDER BY severity DESC, event_count DESC;

COMMENT ON VIEW v_security_events_recent IS 'Vue agrégée des événements de sécurité des dernières 24h (pour alertes P18)';
