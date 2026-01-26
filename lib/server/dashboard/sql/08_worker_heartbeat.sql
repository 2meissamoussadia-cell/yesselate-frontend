/**
 * Table de heartbeat pour le worker Event-Driven Refresh
 * Phase P4: Observabilité & Robustesse
 * 
 * Le worker rafraîchit cette table à chaque notification traitée
 * pour permettre au health check de vérifier que le worker est actif
 */

-- Table de heartbeat (une seule ligne)
CREATE TABLE IF NOT EXISTS dashboard_worker_heartbeat (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_heartbeat TIMESTAMP NOT NULL DEFAULT NOW(),
  last_domain TEXT,
  last_notification_count BIGINT DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_worker_heartbeat_last_heartbeat ON dashboard_worker_heartbeat(last_heartbeat);

-- Initialiser avec une ligne par défaut
INSERT INTO dashboard_worker_heartbeat (id, last_heartbeat, last_domain, last_notification_count)
VALUES (1, NOW(), NULL, 0)
ON CONFLICT (id) DO NOTHING;

-- Fonction pour mettre à jour le heartbeat (appelée par le worker)
CREATE OR REPLACE FUNCTION update_worker_heartbeat(
  p_domain TEXT DEFAULT NULL,
  p_notification_count BIGINT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  UPDATE dashboard_worker_heartbeat
  SET 
    last_heartbeat = NOW(),
    last_domain = COALESCE(p_domain, last_domain),
    last_notification_count = COALESCE(p_notification_count, last_notification_count + 1),
    updated_at = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- Commentaires
COMMENT ON TABLE dashboard_worker_heartbeat IS 'Heartbeat du worker Event-Driven Refresh pour health checks';
COMMENT ON COLUMN dashboard_worker_heartbeat.last_heartbeat IS 'Dernière fois que le worker a traité une notification';
COMMENT ON COLUMN dashboard_worker_heartbeat.last_domain IS 'Dernier domaine traité';
COMMENT ON COLUMN dashboard_worker_heartbeat.last_notification_count IS 'Nombre total de notifications traitées';
