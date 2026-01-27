-- 23_alerting.sql
-- Phase P15: Moteur d'alertes (règles & canaux)
-- 
-- Système d'alertes métier BTP : détection, déduplication, agrégation et diffusion
-- Compatible avec l'architecture existante (read-models, event-driven, UX)

-- ============================================================================
-- RÈGLES D'ALERTES (déclaratif par tenant)
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

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_tenant_enabled ON alert_rules(tenant_id, enabled);
CREATE INDEX IF NOT EXISTS idx_alert_rules_route_key ON alert_rules(route_key) WHERE route_key IS NOT NULL;

-- Commentaires
COMMENT ON TABLE alert_rules IS 'Règles d''alertes métier BTP (RAP, RàF, DSO, OTIF, ruptures, blocages, retards, conformité)';
COMMENT ON COLUMN alert_rules.expr IS 'Expression JSON : {"source":"rm_reporting_overview","aggregate":"sum","field":"dso","condition":">","threshold":60}';
COMMENT ON COLUMN alert_rules.labels IS 'Labels pour filtrage et groupement (ex: {"bureau":"BMO","kpi":"DSO"})';
COMMENT ON COLUMN alert_rules.schedule IS 'Calendrier de silence : {"mute":{"start":"22:00","end":"06:00","tz":"Europe/Paris","weekends":true}}';

-- ============================================================================
-- CANAUX (pér-tenant) : configuration & secrets
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_channels (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  kind        TEXT NOT NULL CHECK (kind IN ('email','teams','sms','webhook')),
  name        TEXT NOT NULL,
  config      JSONB NOT NULL,  -- ex: {"smtp":{"host":"...","user":"..."}}, {"teams":{"webhook":"..."}}
  enabled     BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_channels_tenant ON alert_channels(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alert_channels_tenant_kind ON alert_channels(tenant_id, kind) WHERE enabled = true;

-- Commentaires
COMMENT ON TABLE alert_channels IS 'Configuration des canaux de diffusion (email, Teams, SMS, webhook)';
COMMENT ON COLUMN alert_channels.config IS 'Configuration spécifique au canal : SMTP pour email, webhook URL pour Teams, etc.';

-- ============================================================================
-- ABONNEMENTS (qui reçoit quoi)
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_id     UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  channel_id  UUID NOT NULL REFERENCES alert_channels(id) ON DELETE CASCADE,
  target      TEXT,       -- ex: 'ops@exemple.com', '+336...', URL webhook
  filters     JSONB,      -- ex: {"bureau":"BMO"} pour scoper la réception
  enabled     BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_tenant ON alert_subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_rule ON alert_subscriptions(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_subscriptions_channel ON alert_subscriptions(channel_id);

-- Commentaires
COMMENT ON TABLE alert_subscriptions IS 'Abonnements : qui reçoit quelles alertes via quels canaux';
COMMENT ON COLUMN alert_subscriptions.target IS 'Cible du canal : email, numéro SMS, URL webhook, etc.';
COMMENT ON COLUMN alert_subscriptions.filters IS 'Filtres pour scoper la réception (ex: {"bureau":"BMO","severity":"critical"})';

-- ============================================================================
-- INCIDENTS (dé-dup) : open → ack → closed
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  rule_id     UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  fingerprint TEXT NOT NULL,           -- ex: hash(rule + labels + scope)
  status      TEXT NOT NULL CHECK (status IN ('open','ack','closed')) DEFAULT 'open',
  first_seen  TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen   TIMESTAMPTZ NOT NULL DEFAULT now(),
  count       INT NOT NULL DEFAULT 1,
  payload     JSONB,                   -- valeurs à l'origine de l'alerte (KPI, seuils, contexte)
  acknowledged_by TEXT,                -- utilisateur qui a ACK
  acknowledged_at  TIMESTAMPTZ,        -- date/heure de l'ACK
  closed_at        TIMESTAMPTZ,        -- date/heure de fermeture
  UNIQUE (tenant_id, rule_id, fingerprint, status)
);

CREATE INDEX IF NOT EXISTS idx_alert_events_tenant_status ON alert_events(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_alert_events_rule ON alert_events(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_events_fingerprint ON alert_events(fingerprint);
CREATE INDEX IF NOT EXISTS idx_alert_events_last_seen ON alert_events(last_seen DESC);

-- Commentaires
COMMENT ON TABLE alert_events IS 'Incidents d''alertes avec déduplication par fingerprint';
COMMENT ON COLUMN alert_events.fingerprint IS 'Hash unique pour déduplication : hash(rule_id + labels + scope + condition)';
COMMENT ON COLUMN alert_events.payload IS 'Valeurs à l''origine de l''alerte : {"dso":65,"threshold":60,"bureau":"BMO"}';
COMMENT ON COLUMN alert_events.count IS 'Nombre de fois que l''incident a été détecté (agrégation)';

-- ============================================================================
-- SILENCES AD-HOC (mute)
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
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_silences_tenant ON alert_silences(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alert_silences_rule ON alert_silences(rule_id) WHERE rule_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alert_silences_active ON alert_silences(tenant_id, starts_at, ends_at) 
  WHERE starts_at <= NOW() AND ends_at >= NOW();

-- Commentaires
COMMENT ON TABLE alert_silences IS 'Silences ad-hoc pour muter temporairement des alertes';
COMMENT ON COLUMN alert_silences.matcher IS 'Matcher JSON pour sélectionner les alertes à muter : {"labels":{"bureau":"BMO"},"severity":"warning"}';
COMMENT ON COLUMN alert_silences.reason IS 'Raison du silence (ex: "Maintenance planifiée")';

-- ============================================================================
-- HISTORIQUE DES ENVOIS (audit)
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_deliveries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_id    UUID NOT NULL REFERENCES alert_events(id) ON DELETE CASCADE,
  channel_id  UUID NOT NULL REFERENCES alert_channels(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES alert_subscriptions(id) ON DELETE SET NULL,
  status      TEXT NOT NULL CHECK (status IN ('pending','sent','failed','retry')),
  target      TEXT NOT NULL,              -- cible de l'envoi
  sent_at     TIMESTAMPTZ,
  error       TEXT,                       -- message d'erreur si échec
  retry_count INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alert_deliveries_tenant ON alert_deliveries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_alert_deliveries_event ON alert_deliveries(event_id);
CREATE INDEX IF NOT EXISTS idx_alert_deliveries_status ON alert_deliveries(status) WHERE status IN ('pending','failed','retry');
CREATE INDEX IF NOT EXISTS idx_alert_deliveries_created ON alert_deliveries(created_at DESC);

-- Commentaires
COMMENT ON TABLE alert_deliveries IS 'Historique des envois d''alertes (audit et retry)';
COMMENT ON COLUMN alert_deliveries.status IS 'Statut de l''envoi : pending (en attente), sent (envoyé), failed (échec), retry (nouvelle tentative)';

-- ============================================================================
-- VUE MATÉRIALISÉE : Alertes actives par tenant
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS rm_alert_events_active AS
SELECT 
  e.tenant_id,
  e.rule_id,
  r.name AS rule_name,
  r.severity,
  r.route_key,
  COUNT(*) AS active_count,
  MAX(e.last_seen) AS last_alert_at
FROM alert_events e
JOIN alert_rules r ON e.rule_id = r.id
WHERE e.status = 'open'
  AND r.enabled = true
GROUP BY e.tenant_id, e.rule_id, r.name, r.severity, r.route_key;

CREATE INDEX IF NOT EXISTS idx_rm_alert_events_active_tenant ON rm_alert_events_active(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rm_alert_events_active_route ON rm_alert_events_active(route_key) WHERE route_key IS NOT NULL;

-- Commentaires
COMMENT ON MATERIALIZED VIEW rm_alert_events_active IS 'Vue matérialisée : alertes actives par tenant pour affichage dans la nav (badges/compteurs)';
