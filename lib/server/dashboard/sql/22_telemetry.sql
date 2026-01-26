-- 22_telemetry.sql
-- Phase P14: Télémétrie & Analytics
-- 
-- Table pour stocker les événements de télémétrie de manière minimale et performante
-- Permet de tracker l'utilisation du dashboard (vues ouvertes, KPIs cliqués, exports, etc.)

-- Table principale des événements de télémétrie
CREATE TABLE IF NOT EXISTS telemetry_events (
  id            BIGSERIAL PRIMARY KEY,
  tenant_id     UUID NOT NULL,
  user_id       TEXT,           -- Pseudonymisé côté serveur si nécessaire
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_name    TEXT NOT NULL,  -- 'view_opened','kpi_click','export_triggered','filter_applied','error','perf'
  route_key     TEXT,           -- ex: 'overview::summary::dashboard'
  props         JSONB,          -- Données spécifiques (taille contrôlée)
  user_agent    TEXT,
  ip_hash       TEXT            -- SHA256(ip+salt) si conservation nécessaire
);

-- Index pour performance (optimisés pour les requêtes fréquentes)
CREATE INDEX IF NOT EXISTS idx_tel_tenant_time ON telemetry_events(tenant_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_tel_event_name ON telemetry_events(event_name);
CREATE INDEX IF NOT EXISTS idx_tel_route_key ON telemetry_events(route_key);

-- Index composite pour requêtes par tenant + event + time
CREATE INDEX IF NOT EXISTS idx_tel_tenant_event_time ON telemetry_events(tenant_id, event_name, occurred_at DESC);

-- Index GIN pour recherches dans props JSONB (si nécessaire)
CREATE INDEX IF NOT EXISTS idx_tel_props_gin ON telemetry_events USING GIN (props);

-- Vue matérialisée : volume par page (jour)
CREATE MATERIALIZED VIEW IF NOT EXISTS rm_telemetry_views_daily AS
SELECT 
  tenant_id, 
  route_key, 
  DATE_TRUNC('day', occurred_at) AS d, 
  COUNT(*) AS views
FROM telemetry_events
WHERE event_name = 'view_opened'
GROUP BY tenant_id, route_key, DATE_TRUNC('day', occurred_at);

-- Index sur la vue matérialisée
CREATE INDEX IF NOT EXISTS idx_rm_tel_views_daily ON rm_telemetry_views_daily(tenant_id, d DESC);
CREATE INDEX IF NOT EXISTS idx_rm_tel_views_daily_route ON rm_telemetry_views_daily(route_key, d DESC);

-- Fonction pour nettoyer les anciens événements (politique de rétention)
-- Exemple : supprimer les événements de plus de 180 jours
CREATE OR REPLACE FUNCTION cleanup_telemetry_events(retention_days INTEGER DEFAULT 180)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM telemetry_events 
  WHERE occurred_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Commentaires
COMMENT ON TABLE telemetry_events IS 'Événements de télémétrie du dashboard (vues, KPIs, exports, etc.)';
COMMENT ON COLUMN telemetry_events.tenant_id IS 'ID du tenant (multi-tenant)';
COMMENT ON COLUMN telemetry_events.user_id IS 'ID utilisateur (pseudonymisé si nécessaire)';
COMMENT ON COLUMN telemetry_events.occurred_at IS 'Date/heure de l''événement';
COMMENT ON COLUMN telemetry_events.event_name IS 'Type d''événement (view_opened, kpi_click, export_triggered, etc.)';
COMMENT ON COLUMN telemetry_events.route_key IS 'Clé de route (ex: overview::summary::dashboard)';
COMMENT ON COLUMN telemetry_events.props IS 'Propriétés spécifiques de l''événement (JSONB)';
COMMENT ON COLUMN telemetry_events.user_agent IS 'User agent du navigateur';
COMMENT ON COLUMN telemetry_events.ip_hash IS 'Hash SHA256 de l''IP (pour anonymisation)';

COMMENT ON MATERIALIZED VIEW rm_telemetry_views_daily IS 'Vue matérialisée : volume de vues par page et par jour';
COMMENT ON FUNCTION cleanup_telemetry_events IS 'Nettoie les anciens événements selon la politique de rétention (défaut: 180 jours)';

-- Exemple d'utilisation de la fonction de nettoyage (à exécuter via CRON)
-- SELECT cleanup_telemetry_events(180); -- Supprime les événements de plus de 180 jours
