-- 03_views_scoped.sql
-- Phase P2-C/2: Vues matérialisées enrichies avec codes bureau/chantier pour filtrage ABAC
-- Note: Utilise WITH NO DATA - nécessite un REFRESH MATERIALIZED VIEW après création

-- Recréer la vue projets scoppée : rm_kpis_projets
DROP MATERIALIZED VIEW IF EXISTS rm_kpis_projets;
CREATE MATERIALIZED VIEW rm_kpis_projets AS
SELECT
  p.tenant_id,
  p.id, p.nom, p.statut, p.progression,
  p.budget, p.consomme,
  (p.consomme / NULLIF(p.budget,0)) AS budget_ratio,
  c.code AS chantier_code,
  b.code AS bureau_code
FROM projets p
LEFT JOIN chantiers c ON c.id = p.chantier_id
LEFT JOIN bureaux   b ON b.id = c.bureau_id
WITH NO DATA;

CREATE INDEX idx_rm_kpis_projets_tenant ON rm_kpis_projets(tenant_id);
CREATE INDEX idx_rm_kpis_projets_bureau ON rm_kpis_projets(bureau_code);
CREATE INDEX idx_rm_kpis_projets_chantier ON rm_kpis_projets(chantier_code);

-- Demandes scoppées : rm_kpis_demandes
DROP MATERIALIZED VIEW IF EXISTS rm_kpis_demandes;
CREATE MATERIALIZED VIEW rm_kpis_demandes AS
SELECT
  d.tenant_id, d.id, d.type, d.statut, d.priorite, d.created_at,
  b.code AS bureau_code
FROM demandes d
LEFT JOIN bureaux b ON b.id = d.bureau_id
WITH NO DATA;

CREATE INDEX idx_rm_kpis_demandes_tenant ON rm_kpis_demandes(tenant_id);
CREATE INDEX idx_rm_kpis_demandes_bureau ON rm_kpis_demandes(bureau_code);

-- KPIs overview scoppés par agrégation bureau/chantier (toujours résumés au tenant, mais stockons la granularité minimale utile)
DROP MATERIALIZED VIEW IF EXISTS rm_kpis_overview;
CREATE MATERIALIZED VIEW rm_kpis_overview AS
SELECT
  t.id AS tenant_id,
  -- KPI agrégés au tenant (inchangé)
  (SELECT count(*) FROM demandes d WHERE d.tenant_id = t.id) AS demandes_total,
  COALESCE((
    SELECT count(*) FILTER (WHERE v.statut = 'validee')::float / NULLIF(count(*),0)
    FROM validations v WHERE v.tenant_id = t.id
  ), 0) AS validations_ratio,
  COALESCE((
    SELECT sum(p.consomme)::float / NULLIF(sum(p.budget),0)
    FROM projets p WHERE p.tenant_id = t.id
  ), 0) AS budget_ratio,
  (SELECT count(*) FROM blocages b WHERE b.tenant_id = t.id AND b.actif) AS blocages_actifs,
  (SELECT count(*) FROM risques r WHERE r.tenant_id = t.id AND r.criticite = 'high' AND r.actif) AS risques_critiques,
  (SELECT count(*) FROM decisions d WHERE d.tenant_id = t.id AND d.statut = 'en_attente') AS decisions_en_attente,
  COALESCE((
    SELECT count(*) FILTER (WHERE v.statut = 'validee' AND v.delai_h <= 48)::float
    / NULLIF(count(*) FILTER (WHERE v.statut = 'validee'),0)
    FROM validations v WHERE v.tenant_id = t.id
  ), 0) AS conformite_ratio
FROM tenants t
WITH NO DATA;

CREATE UNIQUE INDEX pk_rm_kpis_overview ON rm_kpis_overview(tenant_id);

-- Trends daily (inchangé structurellement)
DROP MATERIALIZED VIEW IF EXISTS rm_trends_daily;
CREATE MATERIALIZED VIEW rm_trends_daily AS
WITH dates AS (
  SELECT generate_series((now() - interval '29 day')::date, now()::date, interval '1 day')::date AS day
)
SELECT
  t.id AS tenant_id,
  d.day AS date,
  COALESCE((SELECT count(*) FROM demandes dm WHERE dm.tenant_id = t.id AND dm.created_at::date = d.day), 0) AS demandes,
  COALESCE((
    SELECT count(*) FILTER (WHERE v.statut = 'validee')::float / NULLIF(count(*),0)
    FROM validations v WHERE v.tenant_id = t.id AND v.created_at::date = d.day
  ), 0) AS validations,
  COALESCE((
    SELECT sum(p.consomme)::float / NULLIF(sum(p.budget),0)
    FROM projets p WHERE p.tenant_id = t.id AND p.created_at::date <= d.day
  ), 0) AS budget
FROM tenants t CROSS JOIN dates d
WITH NO DATA;

CREATE INDEX idx_rm_trends_daily_tenant_date ON rm_trends_daily(tenant_id, date);
