-- 10_mview_refresh_log.sql
-- Phase P4: Observabilité & Robustesse
-- 
-- Table pour tracker le rafraîchissement de chaque vue matérialisée
-- Permet de vérifier la fraîcheur des données par vue individuellement

CREATE TABLE IF NOT EXISTS mview_refresh_log (
  view_name   TEXT PRIMARY KEY,
  refreshed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_mview_refresh_log_refreshed_at ON mview_refresh_log(refreshed_at DESC);

-- Commentaires
COMMENT ON TABLE mview_refresh_log IS 'Log des rafraîchissements de chaque vue matérialisée pour health checks';
COMMENT ON COLUMN mview_refresh_log.view_name IS 'Nom de la vue matérialisée';
COMMENT ON COLUMN mview_refresh_log.refreshed_at IS 'Date/heure du dernier rafraîchissement';
