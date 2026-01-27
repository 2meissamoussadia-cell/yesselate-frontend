-- 23_alerting_v2.sql
-- Phase P17: Règles d'alerting avancées — extensions du schéma P15
--
-- Étend le moteur d'alertes P15 avec :
-- - DSL v2 (compositions booléennes, fenêtres temporelles, agrégations, seuils dynamiques, group-by, corrélations)
-- - Hystérésis (anti-flapping)
-- - Escalades (ladder de canaux)
-- - Silences enrichis (snooze)
-- - Evidence (traçabilité des valeurs sources)

-- ============================================================================
-- EXTENSIONS ALERT_RULES (DSL v2)
-- ============================================================================

ALTER TABLE alert_rules
  ADD COLUMN IF NOT EXISTS expr_v2 JSONB,    -- version enrichie (DSL v2)
  ADD COLUMN IF NOT EXISTS hysteresis JSONB,   -- { "enter": {">=": 60}, "exit": {"<=": 55} }
  ADD COLUMN IF NOT EXISTS group_by JSONB,    -- { "keys": ["bureau_code","chantier_code"], "topN": 5 }
  ADD COLUMN IF NOT EXISTS correlation JSONB; -- [{ "metric": "raf_ht", "op": ">", "value": 500000 }, ...]

COMMENT ON COLUMN alert_rules.expr_v2 IS 'DSL v2 enrichi : fenêtres temporelles, agrégations (avg/sum/min/max/p50/p90/p95/p99), seuils dynamiques (baseline, z-score, percentiles), compositions booléennes (any/all/not)';
COMMENT ON COLUMN alert_rules.hysteresis IS 'Anti-flapping : seuils d''entrée et de sortie différents (ex: entrée >= 60, sortie <= 55)';
COMMENT ON COLUMN alert_rules.group_by IS 'Découpage par périmètre : {"keys":["bureau_code"],"topN":5} pour les 5 pires bureaux';
COMMENT ON COLUMN alert_rules.correlation IS 'Corrélations inter-KPIs : [{ "metric": "raf_ht", "op": ">", "value": 500000 }, { "metric": "production", "op": "<", "value": 0.8, "compare": "n-1", "delta_pct": -0.2 }]';

-- ============================================================================
-- EXTENSIONS ALERT_EVENTS (traçabilité)
-- ============================================================================

ALTER TABLE alert_events
  ADD COLUMN IF NOT EXISTS acked_by TEXT,
  ADD COLUMN IF NOT EXISTS acked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS closed_by TEXT,
  ADD COLUMN IF NOT EXISTS evidence JSONB;   -- données de preuve (séries utilisées pour la décision)

COMMENT ON COLUMN alert_events.acked_by IS 'Utilisateur qui a ACK l''alerte';
COMMENT ON COLUMN alert_events.acked_at IS 'Timestamp de l''ACK';
COMMENT ON COLUMN alert_events.closed_at IS 'Timestamp de fermeture';
COMMENT ON COLUMN alert_events.closed_by IS 'Utilisateur qui a fermé l''alerte';
COMMENT ON COLUMN alert_events.evidence IS 'Données de preuve : séries temporelles, valeurs sources, agrégations utilisées pour la décision';

-- Index pour requêtes sur états
CREATE INDEX IF NOT EXISTS idx_alert_events_acked ON alert_events(tenant_id, acked_at DESC) WHERE acked_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alert_events_closed ON alert_events(tenant_id, closed_at DESC) WHERE closed_at IS NOT NULL;

-- ============================================================================
-- ESCALADES (ladder de canaux)
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_escalations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_id      UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  step         INT NOT NULL,          -- ordre (1, 2, 3...)
  delay_sec    INT NOT NULL,          -- délai après OPEN si non ACK (ex: 1800 = 30 min)
  channel_id   UUID NOT NULL REFERENCES alert_channels(id) ON DELETE CASCADE,
  target       TEXT NOT NULL,         -- email/teams/sms/webhook (override ou cible spécifique)
  enabled      BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_escalations_rule ON alert_escalations(rule_id, step);
CREATE INDEX IF NOT EXISTS idx_alert_escalations_tenant ON alert_escalations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alert_escalations_enabled ON alert_escalations(rule_id, enabled, step) WHERE enabled = true;

COMMENT ON TABLE alert_escalations IS 'Escalades : ladder de canaux avec délais (ex: step 1 = email après 30 min, step 2 = SMS après 1h)';
COMMENT ON COLUMN alert_escalations.step IS 'Ordre d''escalade : 1 (première), 2 (seconde), etc.';
COMMENT ON COLUMN alert_escalations.delay_sec IS 'Délai en secondes après OPEN si non ACK avant d''envoyer cette escalade';
COMMENT ON COLUMN alert_escalations.target IS 'Cible spécifique pour cette escalade (override du channel ou cible additionnelle)';

-- ============================================================================
-- EXTENSIONS ALERT_SILENCES (snooze)
-- ============================================================================

ALTER TABLE alert_silences
  ADD COLUMN IF NOT EXISTS kind TEXT DEFAULT 'mute' CHECK (kind IN ('mute', 'snooze'));

COMMENT ON COLUMN alert_silences.kind IS 'Type de silence : mute (silence programmé/maintenance) ou snooze (report temporaire par utilisateur)';

-- Index pour requêtes sur silences actifs
CREATE INDEX IF NOT EXISTS idx_alert_silences_active_kind ON alert_silences(tenant_id, kind, starts_at, ends_at)
  WHERE starts_at <= NOW() AND ends_at >= NOW();

-- ============================================================================
-- VUES UTILITAIRES V2
-- ============================================================================

-- Vue : Alertes avec escalades en attente
CREATE OR REPLACE VIEW v_alert_events_escalation_pending AS
SELECT
  e.id AS event_id,
  e.tenant_id,
  e.rule_id,
  r.name AS rule_name,
  r.severity,
  e.first_seen,
  e.last_seen,
  e.acked_at,
  esc.step,
  esc.delay_sec,
  esc.channel_id,
  esc.target,
  (EXTRACT(EPOCH FROM (NOW() - e.first_seen))::INT) AS age_seconds,
  CASE
    WHEN e.acked_at IS NOT NULL THEN false
    WHEN (EXTRACT(EPOCH FROM (NOW() - e.first_seen))::INT) >= esc.delay_sec THEN true
    ELSE false
  END AS should_escalate
FROM alert_events e
JOIN alert_rules r ON e.rule_id = r.id
JOIN alert_escalations esc ON r.id = esc.rule_id
WHERE e.status = 'open'
  AND r.enabled = true
  AND esc.enabled = true
  AND e.acked_at IS NULL
  AND (EXTRACT(EPOCH FROM (NOW() - e.first_seen))::INT) >= esc.delay_sec;

COMMENT ON VIEW v_alert_events_escalation_pending IS 'Vue : alertes ouvertes non ACK avec escalades en attente (pour worker d''escalade)';

-- ============================================================================
-- FONCTIONS UTILITAIRES V2
-- ============================================================================

-- Fonction : Vérifier si une alerte est dans une fenêtre d'hystérésis
CREATE OR REPLACE FUNCTION alert_in_hysteresis(
  p_rule_id UUID,
  p_current_value NUMERIC,
  p_previous_status TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_hysteresis JSONB;
  v_enter_op TEXT;
  v_enter_val NUMERIC;
  v_exit_op TEXT;
  v_exit_val NUMERIC;
BEGIN
  SELECT hysteresis INTO v_hysteresis FROM alert_rules WHERE id = p_rule_id;
  
  IF v_hysteresis IS NULL THEN
    RETURN false; -- Pas d'hystérésis configurée
  END IF;

  -- Extraire seuils d'entrée et de sortie
  SELECT 
    (v_hysteresis->'enter'->>jsonb_object_keys(v_hysteresis->'enter'))::TEXT AS enter_op,
    (v_hysteresis->'enter'->>jsonb_object_keys(v_hysteresis->'enter'))::NUMERIC AS enter_val,
    (v_hysteresis->'exit'->>jsonb_object_keys(v_hysteresis->'exit'))::TEXT AS exit_op,
    (v_hysteresis->'exit'->>jsonb_object_keys(v_hysteresis->'exit'))::NUMERIC AS exit_val
  INTO v_enter_op, v_enter_val, v_exit_op, v_exit_val;

  -- Si précédemment ouvert, vérifier seuil de sortie
  IF p_previous_status = 'open' THEN
    CASE v_exit_op
      WHEN '<=' THEN RETURN p_current_value <= v_exit_val;
      WHEN '<' THEN RETURN p_current_value < v_exit_val;
      WHEN '>=' THEN RETURN p_current_value >= v_exit_val;
      WHEN '>' THEN RETURN p_current_value > v_exit_val;
      WHEN '=' THEN RETURN p_current_value = v_exit_val;
      ELSE RETURN false;
    END CASE;
  ELSE
    -- Sinon, vérifier seuil d'entrée
    CASE v_enter_op
      WHEN '<=' THEN RETURN p_current_value <= v_enter_val;
      WHEN '<' THEN RETURN p_current_value < v_enter_val;
      WHEN '>=' THEN RETURN p_current_value >= v_enter_val;
      WHEN '>' THEN RETURN p_current_value > v_enter_val;
      WHEN '=' THEN RETURN p_current_value = v_enter_val;
      ELSE RETURN false;
    END CASE;
  END IF;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION alert_in_hysteresis IS 'Vérifie si une valeur déclenche l''hystérésis (seuil d''entrée ou de sortie selon l''état précédent)';
