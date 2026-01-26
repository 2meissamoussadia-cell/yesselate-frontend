-- 02_views_dashboard_scoped.sql
-- Phase P2-C/2: Vues matérialisées enrichies avec codes bureau/chantier pour filtrage ABAC

-- Vue KPIs Projets (liste) - enrichie avec codes bureau/chantier
DROP MATERIALIZED VIEW IF EXISTS rm_kpis_projets CASCADE;
CREATE MATERIALIZED VIEW rm_kpis_projets AS
SELECT
  p.tenant_id,
  p.id, p.nom, p.statut, p.progression,
  p.budget, p.consomme,
  (p.consomme / NULLIF(p.budget,0)) AS budget_ratio,
  -- Codes pour filtrage ABAC
  c.code AS chantier_code,
  b.code AS bureau_code
FROM projets p
LEFT JOIN chantiers c ON p.chantier_id = c.id
LEFT JOIN bureaux b ON c.bureau_id = b.id;

CREATE UNIQUE INDEX IF NOT EXISTS pk_rm_kpis_projets ON rm_kpis_projets(tenant_id, id);
CREATE INDEX IF NOT EXISTS idx_rm_kpis_projets_tenant ON rm_kpis_projets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rm_kpis_projets_bureau_code ON rm_kpis_projets(tenant_id, bureau_code) WHERE bureau_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rm_kpis_projets_chantier_code ON rm_kpis_projets(tenant_id, chantier_code) WHERE chantier_code IS NOT NULL;

-- Vue KPIs Demandes (liste) - enrichie avec code bureau
DROP MATERIALIZED VIEW IF EXISTS rm_kpis_demandes CASCADE;
CREATE MATERIALIZED VIEW rm_kpis_demandes AS
SELECT
  d.tenant_id, d.id,
  d.type, d.statut, d.priorite, d.created_at,
  d.bureau_id,
  -- Code bureau pour filtrage ABAC
  b.code AS bureau_code
FROM demandes d
LEFT JOIN bureaux b ON d.bureau_id = b.id;

CREATE UNIQUE INDEX IF NOT EXISTS pk_rm_kpis_demandes ON rm_kpis_demandes(tenant_id, id);
CREATE INDEX IF NOT EXISTS idx_rm_kpis_demandes_tenant ON rm_kpis_demandes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rm_kpis_demandes_bureau_code ON rm_kpis_demandes(tenant_id, bureau_code) WHERE bureau_code IS NOT NULL;

-- Vue agrégée KPIs Overview - enrichie pour filtrage par bureau (optionnel, si besoin de scoper l'agrégation)
-- Note: Pour l'overview, on garde l'agrégation globale par tenant, mais on peut filtrer les sources
-- Si besoin d'une vue scoped par bureau, créer rm_kpis_overview_by_bureau séparément

-- Vue daily trends - enrichie pour filtrage par bureau (optionnel)
-- Pour l'instant, on garde la vue globale, mais on peut ajouter bureau_code si nécessaire
