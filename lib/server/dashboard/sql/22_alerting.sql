-- lib/server/dashboard/sql/22_alerting.sql
-- Phase P15: Moteur d'alertes (règles & canaux)

-- ============================================================================
-- 1. RÈGLES D'ALERTE (déclaratif par tenant)
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  severity        TEXT NOT NULL CHECK (severity IN ('info','warning','critical')) DEFAULT 'warning',
  enabled         BOOLEAN NOT NULL DEFAULT true,

  -- Scope (optionnel) : lier la règle à une zone du dashboard
  route_key       TEXT,      -- ex: 'performance::reporting::dashboard'
  labels          JSONB,     -- ex: {"domain":"finance","kpi":"DSO"}

  -- Expression (JSON) : source/read-model + agrégations + condition
  expr            JSONB NOT NULL,  -- voir DSL ci-dessous

  -- Anti-bruit
  cooldown_sec    INT NOT NULL DEFAULT 600,     -- 10 min avant ré-émission
  reopen_after_sec INT NOT NULL DEFAULT 3600,   -- 1h pour rouvrir si re-dépassé

  -- Calendrier (optionnel) : silence programmé
  schedule        JSONB,   -- ex: {"mute":{"start":"22:00","end":"06:00","tz":"Europe/Paris"}}

  -- Canaux par défaut (peuvent être overridés via subscriptions)
  default_channels JSONB,    -- ex: {"email":true,"teams":true,"sms":false,"webhook":false}

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_tenant_enabled ON alert_rules(tenant_id, enabled);
CREATE INDEX IF NOT EXISTS idx_alert_rules_route_key ON alert_rules(route_key) WHERE route_key IS NOT NULL;

-- ============================================================================
-- 2. CANAUX (pér-tenant) : configuration & secrets
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('email','teams','sms','webhook')),
  name        TEXT NOT NULL,
  config      JSONB NOT NULL,  -- ex: {"smtp":{"host":"...","user":"..."}}, {"teams":{"webhook":"..."}}
  enabled     BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_channels_tenant ON alert_channels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alert_channels_tenant_kind ON alert_channels(tenant_id, kind);

-- ============================================================================
-- 3. ABONNEMENTS (qui reçoit quoi)
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_id     UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  channel_id  UUID NOT NULL REFERENCES alert_channels(id) ON DELETE CASCADE,
  target      TEXT,       -- ex: 'ops@exemple.com', '+336...', URL webhook
  filters     JSONB,     -- ex: {"bureau":"BMO"} pour scoper la réception
  enabled     BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_rule ON alert_subscriptions(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_channel ON alert_subscriptions(channel_id);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_tenant ON alert_subscriptions(tenant_id);

-- ============================================================================
-- 4. INCIDENTS (dé-dup) : open → ack → closed
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_id     UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,           -- ex: hash(rule + labels + scope)
  status      TEXT NOT NULL CHECK (status IN ('open','ack','closed')) DEFAULT 'open',
  first_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by  TEXT,
  closed_at       TIMESTAMPTZ,
  closed_by       TEXT,
  count       INT NOT NULL DEFAULT 1,
  payload     JSONB,                   -- valeurs à l'origine de l'alerte (KPI, seuils, contexte)
  labels      JSONB,                   -- labels pour filtrage/grouping
  
  UNIQUE (tenant_id, rule_id, fingerprint, status)
);

CREATE INDEX IF NOT EXISTS idx_alert_events_tenant_status ON alert_events(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_alert_events_rule ON alert_events(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_events_fingerprint ON alert_events(fingerprint);
CREATE INDEX IF NOT EXISTS idx_alert_events_last_seen ON alert_events(last_seen DESC);

-- ============================================================================
-- 5. SILENCES AD-HOC (mute)
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_silences (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_id     UUID REFERENCES alert_rules(id) ON DELETE SET NULL,
  matcher     JSONB,                  -- ex: {"labels":{"bureau":"BMO"}}
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ NOT NULL,
  created_by  TEXT,
  reason      TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_silences_tenant ON alert_silences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alert_silences_rule ON alert_silences(rule_id) WHERE rule_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alert_silences_active ON alert_silences(tenant_id, starts_at, ends_at) 
  WHERE ends_at > NOW();

-- ============================================================================
-- 6. HISTORIQUE DES NOTIFICATIONS (audit)
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_id    UUID NOT NULL REFERENCES alert_events(id) ON DELETE CASCADE,
  channel_id  UUID NOT NULL REFERENCES alert_channels(id) ON DELETE CASCADE,
  target      TEXT NOT NULL,
  status      TEXT NOT NULL CHECK (status IN ('pending','sent','failed')) DEFAULT 'pending',
  sent_at     TIMESTAMPTZ,
  error       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_notifications_event ON alert_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_tenant_status ON alert_notifications(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_alert_notifications_created ON alert_notifications(created_at DESC);

-- ============================================================================
-- 7. VUES UTILITAIRES
-- ============================================================================

-- Vue : Alertes actives par tenant
CREATE OR REPLACE VIEW v_alert_events_active AS
SELECT 
  e.id,
  e.tenant_id,
  e.rule_id,
  r.name AS rule_name,
  r.severity,
  e.fingerprint,
  e.status,
  e.first_seen,
  e.last_seen,
  e.count,
  e.payload,
  e.labels
FROM alert_events e
JOIN alert_rules r ON e.rule_id = r.id
WHERE e.status = 'open'
  AND r.enabled = true;

-- Vue : Statistiques par règle (30 derniers jours)
CREATE OR REPLACE VIEW v_alert_rules_stats AS
SELECT 
  r.tenant_id,
  r.id AS rule_id,
  r.name AS rule_name,
  r.severity,
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'open') AS open_count,
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'ack') AS ack_count,
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'closed') AS closed_count,
  COUNT(DISTINCT n.id) FILTER (WHERE n.status = 'sent') AS notifications_sent,
  MAX(e.last_seen) AS last_triggered_at
FROM alert_rules r
LEFT JOIN alert_events e ON r.id = e.rule_id 
  AND e.last_seen >= NOW() - INTERVAL '30 days'
LEFT JOIN alert_notifications n ON e.id = n.event_id
WHERE r.enabled = true
GROUP BY r.tenant_id, r.id, r.name, r.severity;

-- Fonction : Calculer fingerprint pour dé-duplication
CREATE OR REPLACE FUNCTION alert_fingerprint(
  p_rule_id UUID,
  p_labels JSONB DEFAULT NULL
) RETURNS TEXT AS $$
BEGIN
  RETURN encode(
    digest(
      COALESCE(p_rule_id::text, '') || '::' || COALESCE(p_labels::text, '{}'),
      'sha256'
    ),
    'hex'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
