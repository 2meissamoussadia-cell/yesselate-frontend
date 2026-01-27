-- lib/server/dashboard/sql/20_telemetry.sql
-- Phase P14: Observabilité produit - Télémetrie événements utilisateur
-- 
-- Stockage minimal & performant pour événements UI (views, clicks, exports, etc.)
-- Rétention 180 jours par défaut

-- ============================================================================
-- 1. TABLE TELEMETRY_EVENTS
-- ============================================================================

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

-- Index pour requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_tel_tenant_time ON telemetry_events(tenant_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_tel_event_name ON telemetry_events(event_name);
CREATE INDEX IF NOT EXISTS idx_tel_route_key ON telemetry_events(route_key);

-- Index GIN pour recherche dans props JSONB (optionnel)
CREATE INDEX IF NOT EXISTS idx_tel_props_gin ON telemetry_events USING GIN (props);

-- ============================================================================
-- 2. VUE MATÉRIALISÉE - VOLUME PAR PAGE (JOUR)
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS rm_telemetry_views_daily AS
SELECT 
  tenant_id,
  route_key,
  DATE_TRUNC('day', occurred_at) AS d,
  COUNT(*) AS views
FROM telemetry_events
WHERE event_name = 'view_opened'
GROUP BY tenant_id, route_key, DATE_TRUNC('day', occurred_at);

CREATE INDEX IF NOT EXISTS idx_rm_tel_views_daily ON rm_telemetry_views_daily(tenant_id, d);

-- Refresh de la vue (à ajouter au cron ou worker)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_telemetry_views_daily;

-- ============================================================================
-- 3. POLITIQUE DE RÉTENTION
-- ============================================================================

-- Supprimer les événements > 180 jours (à exécuter via cron)
-- DELETE FROM telemetry_events WHERE occurred_at < NOW() - INTERVAL '180 days';

-- Fonction helper pour purge (optionnel)
CREATE OR REPLACE FUNCTION purge_old_telemetry(days_to_keep INTEGER DEFAULT 180)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM telemetry_events
  WHERE occurred_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. VUES UTILITAIRES (OPTIONNEL)
-- ============================================================================

-- Vue : Top pages par tenant (7 derniers jours)
CREATE OR REPLACE VIEW v_telemetry_top_pages_7d AS
SELECT 
  tenant_id,
  route_key,
  COUNT(*) AS views,
  COUNT(DISTINCT user_id) AS unique_users
FROM telemetry_events
WHERE event_name = 'view_opened'
  AND occurred_at >= NOW() - INTERVAL '7 days'
GROUP BY tenant_id, route_key
ORDER BY views DESC
LIMIT 50;

-- Vue : Événements d'erreur récents
CREATE OR REPLACE VIEW v_telemetry_errors_recent AS
SELECT 
  tenant_id,
  route_key,
  props->>'error' AS error_type,
  occurred_at
FROM telemetry_events
WHERE event_name = 'error'
  AND occurred_at >= NOW() - INTERVAL '24 hours'
ORDER BY occurred_at DESC;

-- ============================================================================
-- 5. VUES RAPPORTS MÉTIERS (Phase P14)
-- ============================================================================

-- Vue : Adoption par module/route (7 derniers jours)
CREATE OR REPLACE VIEW v_telemetry_adoption_by_module AS
SELECT 
  tenant_id,
  SPLIT_PART(route_key, '::', 1) AS main_module,
  SPLIT_PART(route_key, '::', 2) AS sub_module,
  route_key,
  COUNT(*) AS views,
  COUNT(DISTINCT user_id) AS unique_users,
  DATE_TRUNC('day', occurred_at) AS day
FROM telemetry_events
WHERE event_name = 'view_opened'
  AND occurred_at >= NOW() - INTERVAL '7 days'
GROUP BY tenant_id, main_module, sub_module, route_key, DATE_TRUNC('day', occurred_at)
ORDER BY day DESC, views DESC;

-- Vue : Funnel export (view_opened → kpi_click → export_triggered)
CREATE OR REPLACE VIEW v_telemetry_export_funnel AS
WITH views AS (
  SELECT tenant_id, route_key, user_id, occurred_at AS view_at
  FROM telemetry_events
  WHERE event_name = 'view_opened'
),
kpi_clicks AS (
  SELECT tenant_id, route_key, user_id, occurred_at AS click_at, props->>'kpiId' AS kpi_id
  FROM telemetry_events
  WHERE event_name = 'kpi_click'
),
exports AS (
  SELECT tenant_id, user_id, occurred_at AS export_at, props->>'format' AS format
  FROM telemetry_events
  WHERE event_name = 'export_triggered'
)
SELECT 
  v.tenant_id,
  v.route_key,
  COUNT(DISTINCT v.user_id) AS total_views,
  COUNT(DISTINCT k.user_id) AS users_clicked_kpi,
  COUNT(DISTINCT e.user_id) AS users_exported,
  ROUND(100.0 * COUNT(DISTINCT k.user_id) / NULLIF(COUNT(DISTINCT v.user_id), 0), 2) AS click_rate_pct,
  ROUND(100.0 * COUNT(DISTINCT e.user_id) / NULLIF(COUNT(DISTINCT v.user_id), 0), 2) AS export_rate_pct
FROM views v
LEFT JOIN kpi_clicks k ON v.tenant_id = k.tenant_id 
  AND v.user_id = k.user_id 
  AND k.click_at BETWEEN v.view_at AND v.view_at + INTERVAL '5 minutes'
LEFT JOIN exports e ON v.tenant_id = e.tenant_id 
  AND v.user_id = e.user_id 
  AND e.export_at BETWEEN v.view_at AND v.view_at + INTERVAL '10 minutes'
WHERE v.view_at >= NOW() - INTERVAL '30 days'
GROUP BY v.tenant_id, v.route_key;

-- Vue : Taux d'erreur UI par route (7 derniers jours)
CREATE OR REPLACE VIEW v_telemetry_error_rate AS
SELECT 
  tenant_id,
  route_key,
  COUNT(*) FILTER (WHERE event_name = 'view_opened') AS total_views,
  COUNT(*) FILTER (WHERE event_name = 'error') AS total_errors,
  ROUND(100.0 * COUNT(*) FILTER (WHERE event_name = 'error') / 
    NULLIF(COUNT(*) FILTER (WHERE event_name = 'view_opened'), 0), 2) AS error_rate_pct
FROM telemetry_events
WHERE occurred_at >= NOW() - INTERVAL '7 days'
  AND (event_name = 'view_opened' OR event_name = 'error')
GROUP BY tenant_id, route_key
HAVING COUNT(*) FILTER (WHERE event_name = 'view_opened') > 0
ORDER BY error_rate_pct DESC;

-- Vue : Navigation - temps passé par page (approximation)
CREATE OR REPLACE VIEW v_telemetry_time_spent AS
WITH page_sessions AS (
  SELECT 
    tenant_id,
    user_id,
    route_key,
    occurred_at,
    LEAD(occurred_at) OVER (
      PARTITION BY tenant_id, user_id 
      ORDER BY occurred_at
    ) AS next_view_at
  FROM telemetry_events
  WHERE event_name = 'view_opened'
    AND occurred_at >= NOW() - INTERVAL '30 days'
)
SELECT 
  tenant_id,
  route_key,
  COUNT(*) AS sessions,
  AVG(EXTRACT(EPOCH FROM (next_view_at - occurred_at))) AS avg_time_seconds,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (next_view_at - occurred_at))) AS median_time_seconds
FROM page_sessions
WHERE next_view_at IS NOT NULL
  AND next_view_at - occurred_at < INTERVAL '1 hour' -- Ignorer les sessions > 1h
GROUP BY tenant_id, route_key
ORDER BY sessions DESC;
