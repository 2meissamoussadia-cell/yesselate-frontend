-- 24_alerting_rules_seed.sql
-- Phase P15: Moteur d'alertes - Règles BTP prêtes à l'emploi
-- 
-- Règles métier BTP : Finance, Achats, Stocks, Matériel, Conformité
-- S'appuient sur les MViews déjà posées (rm_finance_overview, rm_achats_overview, etc.)

-- ============================================================================
-- FINANCE
-- ============================================================================

-- DSO > 60 jours (critical)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1), -- TODO: Remplacer par tenant_id réel
  'DSO > 60 jours',
  'Délai de recouvrement supérieur à 60 jours (seuil critique)',
  'critical',
  true,
  'performance::reporting::dashboard',
  '{"domain":"finance","kpi":"DSO"}'::jsonb,
  '{
    "source": {"view": "rm_reporting_dso"},
    "select": {"metric": "dso_jours"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": ">", "left": "metric", "right": 60}
  }'::jsonb,
  600,  -- 10 min cooldown
  3600  -- 1h reopen
) ON CONFLICT DO NOTHING;

-- RàF mois > 500 k€ (warning)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'RàF mois > 500 k€',
  'Reliquat à facturer mensuel supérieur à 500 k€',
  'warning',
  true,
  'performance::reporting::dashboard',
  '{"domain":"finance","kpi":"RAF"}'::jsonb,
  '{
    "source": {"view": "rm_reporting_overview"},
    "select": {"metric": "raf_mois"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": ">", "left": "metric", "right": 500000}
  }'::jsonb,
  600,
  3600
) ON CONFLICT DO NOTHING;

-- RAP mois > 1 M€ (warning)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'RAP mois > 1 M€',
  'Reliquat à payer mensuel supérieur à 1 M€',
  'warning',
  true,
  'performance::reporting::dashboard',
  '{"domain":"finance","kpi":"RAP"}'::jsonb,
  '{
    "source": {"view": "rm_reporting_overview"},
    "select": {"metric": "rap_mois"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": ">", "left": "metric", "right": 1000000}
  }'::jsonb,
  600,
  3600
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- ACHATS
-- ============================================================================

-- OTIF < 85% (warning)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'OTIF < 85%',
  'Taux de livraison à l''heure (On-Time In-Full) inférieur à 85%',
  'warning',
  true,
  'performance::achats::dashboard',
  '{"domain":"achats","kpi":"OTIF"}'::jsonb,
  '{
    "source": {"view": "rm_achats_overview"},
    "select": {"metric": "otif_pourcent"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": "<", "left": "metric", "right": 85}
  }'::jsonb,
  600,
  3600
) ON CONFLICT DO NOTHING;

-- Variance prix > 8% (warning)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Variance prix > 8%',
  'Écart entre prix réel et prix de référence supérieur à 8%',
  'warning',
  true,
  'performance::achats::dashboard',
  '{"domain":"achats","kpi":"variance_prix"}'::jsonb,
  '{
    "source": {"view": "rm_achats_overview"},
    "select": {"metric": "variance_prix_pourcent"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": ">", "left": "metric", "right": 8}
  }'::jsonb,
  600,
  3600
) ON CONFLICT DO NOTHING;

-- Commandes ouvertes > 50 (warning)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Commandes ouvertes > 50',
  'Nombre de commandes ouvertes supérieur à 50',
  'warning',
  true,
  'performance::achats::dashboard',
  '{"domain":"achats","kpi":"commandes_ouvertes"}'::jsonb,
  '{
    "source": {"view": "rm_achats_open_orders"},
    "select": {"metric": "count"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": ">", "left": "metric", "right": 50},
    "groupBy": []
  }'::jsonb,
  600,
  3600
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- STOCKS
-- ============================================================================

-- Ruptures > 10 (warning)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Ruptures de stock > 10',
  'Nombre de ruptures de stock supérieur à 10',
  'warning',
  true,
  'performance::stocks::dashboard',
  '{"domain":"stocks","kpi":"ruptures"}'::jsonb,
  '{
    "source": {"view": "rm_stocks_ruptures"},
    "select": {"metric": "count"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": ">", "left": "metric", "right": 10},
    "groupBy": []
  }'::jsonb,
  600,
  3600
) ON CONFLICT DO NOTHING;

-- Valeur stock > 3 M€ et rotation < 0.5/mois (info)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Stock élevé + rotation faible',
  'Valeur stock supérieure à 3 M€ avec rotation inférieure à 0.5/mois',
  'info',
  true,
  'performance::stocks::dashboard',
  '{"domain":"stocks","kpi":"rotation"}'::jsonb,
  '{
    "source": {"view": "rm_stocks_overview"},
    "select": {"metric": "valeur_stock"},
    "where": [
      {"col": "tenant_id", "op": "=", "val": "${tenantId}"},
      {"col": "rotation_mois", "op": "<", "val": 0.5}
    ],
    "condition": {"op": ">", "left": "metric", "right": 3000000}
  }'::jsonb,
  1800,  -- 30 min cooldown (info moins urgent)
  7200   -- 2h reopen
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- MATÉRIEL
-- ============================================================================

-- Taux dispo < 80% (warning)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Taux disponibilité < 80%',
  'Taux de disponibilité du matériel inférieur à 80%',
  'warning',
  true,
  'performance::materiel::dashboard',
  '{"domain":"materiel","kpi":"disponibilite"}'::jsonb,
  '{
    "source": {"view": "rm_materiel_overview"},
    "select": {"metric": "taux_dispo_pourcent"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": "<", "left": "metric", "right": 80}
  }'::jsonb,
  600,
  3600
) ON CONFLICT DO NOTHING;

-- Backlog curatif > 10 (critical)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Backlog maintenance curatif > 10',
  'Nombre d''interventions curatives en attente supérieur à 10',
  'critical',
  true,
  'performance::materiel::dashboard',
  '{"domain":"materiel","kpi":"backlog_curatif"}'::jsonb,
  '{
    "source": {"view": "rm_materiel_backlog_maintenance"},
    "select": {"metric": "count"},
    "where": [
      {"col": "tenant_id", "op": "=", "val": "${tenantId}"},
      {"col": "type", "op": "=", "val": "curatif"}
    ],
    "condition": {"op": ">", "left": "metric", "right": 10},
    "groupBy": []
  }'::jsonb,
  300,   -- 5 min cooldown (critical)
  1800   -- 30 min reopen
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- CONFORMITÉ
-- ============================================================================

-- Lots non attribués > 5 (warning)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Lots non attribués > 5',
  'Nombre de lots non attribués supérieur à 5',
  'warning',
  true,
  'performance::compliance::dashboard',
  '{"domain":"conformite","kpi":"lots_non_attribues"}'::jsonb,
  '{
    "source": {"view": "rm_compliance_overview"},
    "select": {"metric": "lots_non_attribues_count"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": ">", "left": "metric", "right": 5}
  }'::jsonb,
  600,
  3600
) ON CONFLICT DO NOTHING;

-- Contrats incomplets > 0 (critical)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Contrats incomplets',
  'Présence de contrats avec pièces manquantes',
  'critical',
  true,
  'performance::compliance::dashboard',
  '{"domain":"conformite","kpi":"contrats_incomplets"}'::jsonb,
  '{
    "source": {"view": "rm_compliance_missing_docs"},
    "select": {"metric": "count"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": ">", "left": "metric", "right": 0},
    "groupBy": []
  }'::jsonb,
  300,   -- 5 min cooldown (critical)
  1800   -- 30 min reopen
) ON CONFLICT DO NOTHING;

-- Délai visa moyen > 5 jours (warning)
INSERT INTO alert_rules (
  tenant_id, name, description, severity, enabled,
  route_key, labels, expr, cooldown_sec, reopen_after_sec
) VALUES (
  (SELECT id FROM tenants LIMIT 1),
  'Délai visa moyen > 5 jours',
  'Délai moyen de visa supérieur à 5 jours',
  'warning',
  true,
  'performance::compliance::dashboard',
  '{"domain":"conformite","kpi":"delai_visa"}'::jsonb,
  '{
    "source": {"view": "rm_compliance_visas_backlog"},
    "select": {"metric": "delai_moyen_jours"},
    "where": [{"col": "tenant_id", "op": "=", "val": "${tenantId}"}],
    "condition": {"op": ">", "left": "metric", "right": 5}
  }'::jsonb,
  600,
  3600
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

COMMENT ON TABLE alert_rules IS 'Règles d''alertes métier BTP - Seed avec règles prêtes à l''emploi';
COMMENT ON COLUMN alert_rules.expr IS 'DSL JSON : source (MView), select (métrique), where (filtres), condition (seuil)';
