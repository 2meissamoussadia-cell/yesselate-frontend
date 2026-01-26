-- 10_reporting_views.sql
-- Phase P7: MViews Reporting Direction (consolidation multi-bureaux/chantiers mensuelle)
-- Compatible avec l'architecture P2-C/2 (tenant_id, bureau_code, chantier_code)
-- Consolidation mensuelle pour pilotage CODIR

-- ============================================================================
-- VUES MATÉRIALISÉES REPORTING DIRECTION (Phase P7) - VERSION MENSUELLE
-- ============================================================================

-- Table calendrier mois (si non existante)
CREATE TABLE IF NOT EXISTS cal_mois (mois DATE PRIMARY KEY);

INSERT INTO cal_mois(mois)
SELECT d::date
FROM generate_series(
  DATE_TRUNC('month', NOW() - INTERVAL '24 month'),
  DATE_TRUNC('month', NOW()),
  INTERVAL '1 month'
) AS g(d)
ON CONFLICT DO NOTHING;

-- 1) Reporting overview mensuel par tenant (agrégé)
DROP MATERIALIZED VIEW IF EXISTS rm_reporting_overview CASCADE;
CREATE MATERIALIZED VIEW rm_reporting_overview AS
SELECT
  t.id AS tenant_id,
  cm.mois,
  -- Production réalisée (situations de travaux)
  COALESCE((
    SELECT SUM(s.realise_ht)
    FROM situations_travaux s
    WHERE s.tenant_id = t.id
      AND DATE_TRUNC('month', s.periode) = cm.mois
  ),0) AS production_ht,
  -- Factures émises
  COALESCE((
    SELECT SUM(f.montant_ht)
    FROM factures f
    WHERE f.tenant_id = t.id
      AND DATE_TRUNC('month', f.emise_le) = cm.mois
  ),0) AS facture_ht,
  -- Encaissements
  COALESCE((
    SELECT SUM(e.montant_ht)
    FROM encaissements e
    JOIN factures f ON f.id = e.facture_id
    WHERE e.tenant_id = t.id
      AND DATE_TRUNC('month', e.regle_le) = cm.mois
  ),0) AS encaisse_ht,
  -- Reste à produire (RAP) ≈ prévu courant – réalisé courant
  COALESCE((
    SELECT SUM(s.prevu_ht) - SUM(s.realise_ht)
    FROM situations_travaux s
    WHERE s.tenant_id = t.id
      AND DATE_TRUNC('month', s.periode) = cm.mois
  ),0) AS rap_ht,
  -- Reste à facturer (RàF) ≈ réalisé courant – facturé courant
  COALESCE((
    SELECT SUM(s.realise_ht)
    FROM situations_travaux s
    WHERE s.tenant_id = t.id
      AND DATE_TRUNC('month', s.periode) = cm.mois
  ),0)
  -
  COALESCE((
    SELECT SUM(f.montant_ht)
    FROM factures f
    WHERE f.tenant_id = t.id
      AND DATE_TRUNC('month', f.emise_le) = cm.mois
  ),0) AS raf_ht
FROM tenants t
CROSS JOIN cal_mois cm
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_reporting_overview_tenant_mois ON rm_reporting_overview(tenant_id, mois);

-- 2) DSO mensuel (approx) : créances / CA_journalier_moyen (30j)
DROP MATERIALIZED VIEW IF EXISTS rm_reporting_dso CASCADE;
CREATE MATERIALIZED VIEW rm_reporting_dso AS
SELECT
  t.id AS tenant_id,
  cm.mois,
  COALESCE((
    SELECT SUM(f.montant_ht)
    FROM factures f
    LEFT JOIN encaissements e ON e.facture_id = f.id
    WHERE f.tenant_id = t.id
      AND DATE_TRUNC('month', f.emise_le) <= cm.mois
      AND (e.id IS NULL OR e.regle_le > (cm.mois + INTERVAL '1 month - 1 day')::date)
  ),0)
  /
  NULLIF(
    COALESCE((
      SELECT SUM(s.realise_ht)
      FROM situations_travaux s
      WHERE s.tenant_id = t.id
        AND s.periode BETWEEN (cm.mois - INTERVAL '30 day') AND (cm.mois + INTERVAL '1 month - 1 day')
    ),0) / 30, 0
  ) AS dso_jours
FROM tenants t
CROSS JOIN cal_mois cm
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_reporting_dso_tenant_mois ON rm_reporting_dso(tenant_id, mois);

-- 3) Découpage par bureau (mensuel)
DROP MATERIALIZED VIEW IF EXISTS rm_reporting_bureau CASCADE;
CREATE MATERIALIZED VIEW rm_reporting_bureau AS
SELECT
  b.tenant_id,
  b.code AS bureau_code,
  cm.mois,
  COALESCE((
    SELECT SUM(s.realise_ht)
    FROM situations_travaux s
    JOIN chantiers c ON c.id = s.chantier_id
    WHERE s.tenant_id = b.tenant_id AND c.bureau_id = b.id
      AND DATE_TRUNC('month', s.periode) = cm.mois
  ),0) AS production_ht
FROM bureaux b
CROSS JOIN cal_mois cm
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_reporting_bureau ON rm_reporting_bureau(tenant_id, bureau_code, mois);

-- 4) Découpage par chantier (mensuel)
DROP MATERIALIZED VIEW IF EXISTS rm_reporting_chantier CASCADE;
CREATE MATERIALIZED VIEW rm_reporting_chantier AS
SELECT
  c.tenant_id,
  c.code AS chantier_code,
  cm.mois,
  COALESCE((
    SELECT SUM(s.realise_ht)
    FROM situations_travaux s
    WHERE s.tenant_id = c.tenant_id AND s.chantier_id = c.id
      AND DATE_TRUNC('month', s.periode) = cm.mois
  ),0) AS production_ht
FROM chantiers c
CROSS JOIN cal_mois cm
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_reporting_chantier ON rm_reporting_chantier(tenant_id, chantier_code, mois);

-- ============================================================================
-- NOTES (Phase P7)
-- ============================================================================

-- Après création, rafraîchir toutes les MViews :
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_overview;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_dso;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_bureau;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_chantier;

-- Les triggers Event-Driven rafraîchissent automatiquement ces vues
-- via les dépendances sur les tables sources (situations_travaux, factures, encaissements)

-- Filtrage ABAC :
-- - rm_reporting_bureau : filtrable par bureau_code et mois
-- - rm_reporting_chantier : filtrable par chantier_code et mois
-- - rm_reporting_overview : agrégation tenant-wide par mois
-- - rm_reporting_dso : agrégation tenant-wide par mois
