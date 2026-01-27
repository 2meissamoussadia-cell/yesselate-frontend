-- lib/server/dashboard/sql/25_jwt_security.sql
-- Phase P18: Tables pour gestion JWT (blacklist, rotation)

-- ============================================================================
-- 1. TABLE POUR BLACKLIST JWT (replay protection)
-- ============================================================================

CREATE TABLE IF NOT EXISTS jwt_blacklist (
  jti TEXT PRIMARY KEY, -- JWT ID
  expires_at TIMESTAMPTZ NOT NULL, -- Date d'expiration du token (pour cleanup)
  revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT -- Raison de révocation (logout, rotation, etc.)
);

CREATE INDEX IF NOT EXISTS idx_jwt_blacklist_expires ON jwt_blacklist(expires_at);

-- Cleanup automatique des entrées expirées (via CRON ou trigger)
CREATE OR REPLACE FUNCTION cleanup_expired_jwt_blacklist() RETURNS VOID AS $$
BEGIN
  DELETE FROM jwt_blacklist WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE jwt_blacklist IS 'Blacklist des JWT révoqués (replay protection P18)';
COMMENT ON COLUMN jwt_blacklist.jti IS 'JWT ID unique du token révoqué';
COMMENT ON COLUMN jwt_blacklist.expires_at IS 'Date d''expiration du token (pour cleanup automatique)';

-- ============================================================================
-- 2. TABLE POUR ROTATION DE CLÉS JWT
-- ============================================================================

CREATE TABLE IF NOT EXISTS jwt_keys (
  kid TEXT PRIMARY KEY, -- Key ID
  key_material TEXT NOT NULL, -- Clé de signature (chiffrée avec clé maître)
  algorithm TEXT NOT NULL DEFAULT 'HS256',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Date d'expiration de la clé
  active BOOLEAN NOT NULL DEFAULT true,
  rotated_from TEXT REFERENCES jwt_keys(kid) -- Clé précédente
);

CREATE INDEX IF NOT EXISTS idx_jwt_keys_active ON jwt_keys(kid, active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_jwt_keys_expires ON jwt_keys(expires_at) WHERE expires_at IS NOT NULL;

COMMENT ON TABLE jwt_keys IS 'Clés de signature JWT avec rotation (P18)';
COMMENT ON COLUMN jwt_keys.key_material IS 'Clé de signature chiffrée avec clé maître (KMS)';
COMMENT ON COLUMN jwt_keys.rotated_from IS 'Référence à la clé précédente lors de la rotation';
