-- 11_stocks_materiel_views.sql
-- Phase P6: MViews Stocks & Matériel (KPIs optimisés)
-- Compatible avec l'architecture P2-C/2 (tenant_id, bureau_code, chantier_code)

-- ============================================================================
-- VUES MATÉRIALISÉES STOCKS & MATÉRIEL (Phase P6 - Version optimisée)
-- ============================================================================

-- 1) Overview Stocks (ruptures, valeur stock)
DROP MATERIALIZED VIEW IF EXISTS rm_stocks_overview CASCADE;
CREATE MATERIALIZED VIEW rm_stocks_overview AS
SELECT
  t.id AS tenant_id,
  -- Nombre total d'articles
  (
    SELECT COUNT(*)
    FROM stock s
    WHERE s.tenant_id = t.id
  ) AS nb_articles,
  -- Ruptures (qte <= seuil)
  (
    SELECT COUNT(*)
    FROM stock s
    WHERE s.tenant_id = t.id
      AND s.qte <= s.seuil
  ) AS ruptures,
  -- Taux de rupture
  COALESCE(
    (
      SELECT COUNT(*) FILTER (WHERE qte <= seuil)::float / NULLIF(COUNT(*), 0)
      FROM stock
      WHERE tenant_id = t.id
    ),
    0
  ) AS rupture_ratio,
  -- Valeur stock (approx)
  COALESCE((
    SELECT SUM(s.qte * pr.prix_ht)
    FROM stock s
    LEFT JOIN prix_reference pr
      ON pr.tenant_id = s.tenant_id
      AND pr.article_id = s.article_id
    WHERE s.tenant_id = t.id
  ), 0) AS valeur_stock_ht
FROM tenants t
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS pk_rm_stocks_overview ON rm_stocks_overview(tenant_id);

-- 2) Trends journalières Stocks (entrées, sorties)
DROP MATERIALIZED VIEW IF EXISTS rm_stocks_trends CASCADE;
CREATE MATERIALIZED VIEW rm_stocks_trends AS
WITH dates AS (
  SELECT generate_series((NOW() - INTERVAL '29 day')::date, NOW()::date, INTERVAL '1 day')::date AS day
)
SELECT
  t.id AS tenant_id,
  d.day AS date,
  -- Entrées
  COALESCE((
    SELECT SUM(qte)
    FROM mouvements_stock ms
    WHERE ms.tenant_id = t.id
      AND ms.type = 'entree'
      AND ms.created_at::date = d.day
  ), 0) AS entree_qte,
  -- Sorties
  COALESCE((
    SELECT SUM(qte)
    FROM mouvements_stock ms
    WHERE ms.tenant_id = t.id
      AND ms.type = 'sortie'
      AND ms.created_at::date = d.day
  ), 0) AS sortie_qte
FROM tenants t CROSS JOIN dates d
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_stocks_trends_tenant_date ON rm_stocks_trends(tenant_id, date);

-- 3) Ruptures de stock (détail par article/dépôt)
DROP MATERIALIZED VIEW IF EXISTS rm_stocks_ruptures CASCADE;
CREATE MATERIALIZED VIEW rm_stocks_ruptures AS
SELECT
  s.tenant_id,
  s.article_id,
  a.code AS article_code,
  a.libelle AS article_libelle,
  a.unite AS article_unite,
  s.depot_id,
  d.code AS depot_code,
  d.nom AS depot_nom,
  s.qte,
  s.seuil,
  (s.seuil - s.qte) AS ecart_rupture,
  COALESCE(a.prix_unitaire_ht, 0) AS prix_unitaire_ht,
  (s.seuil - s.qte) * COALESCE(a.prix_unitaire_ht, 0) AS valeur_manquante_ht,
  -- Dernier mouvement
  (
    SELECT MAX(ms.created_at)
    FROM mouvements_stock ms
    WHERE ms.article_id = s.article_id
      AND ms.depot_id = s.depot_id
      AND ms.tenant_id = s.tenant_id
  ) AS dernier_mouvement
FROM stock s
INNER JOIN articles a ON a.id = s.article_id AND a.tenant_id = s.tenant_id
INNER JOIN depots d ON d.id = s.depot_id AND d.tenant_id = s.tenant_id
WHERE s.qte < s.seuil
  AND s.seuil > 0
  AND a.actif = true
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_stocks_ruptures_tenant ON rm_stocks_ruptures(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rm_stocks_ruptures_ecart ON rm_stocks_ruptures(tenant_id, ecart_rupture DESC);

-- 4) Overview Matériel (disponibilité, maintenance, backlog)
DROP MATERIALIZED VIEW IF EXISTS rm_materiel_overview CASCADE;
CREATE MATERIALIZED VIEW rm_materiel_overview AS
SELECT
  t.id AS tenant_id,
  -- Nombre matériel
  (
    SELECT COUNT(*)
    FROM materiel m
    WHERE m.tenant_id = t.id
  ) AS nb_materiel,
  -- Nombre en maintenance
  (
    SELECT COUNT(*)
    FROM maintenance ma
    WHERE ma.tenant_id = t.id
      AND ma.statut <> 'fait'
  ) AS maintenance_ouverte,
  -- Backlog maintenance (curative)
  (
    SELECT COUNT(*)
    FROM maintenance ma
    WHERE ma.tenant_id = t.id
      AND ma.type = 'curative'
      AND ma.statut <> 'fait'
  ) AS backlog_curatif,
  -- Taux dispo matériel
  COALESCE(
    (
      SELECT COUNT(*) FILTER (
        WHERE m.id NOT IN (
          SELECT materiel_id
          FROM maintenance ma
          WHERE ma.tenant_id = t.id
            AND ma.statut <> 'fait'
        )
      )::float / NULLIF(COUNT(*), 0)
      FROM materiel m
      WHERE m.tenant_id = t.id
    ),
    0
  ) AS taux_dispo
FROM tenants t
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS pk_rm_materiel_overview ON rm_materiel_overview(tenant_id);

-- 5) Trends journalières Matériel (disponibilité, maintenances)
DROP MATERIALIZED VIEW IF EXISTS rm_materiel_trends CASCADE;
CREATE MATERIALIZED VIEW rm_materiel_trends AS
WITH dates AS (
  SELECT generate_series((CURRENT_DATE - INTERVAL '29 days')::date, CURRENT_DATE::date, INTERVAL '1 day')::date AS day
)
SELECT
  t.id AS tenant_id,
  d.day::text AS date,
  -- Matériel disponible ce jour (approximation : matériel total - affecté - en maintenance)
  COALESCE((
    SELECT COUNT(DISTINCT m.id)
    FROM materiel m
    WHERE m.tenant_id = t.id
      AND m.actif = true
      AND NOT EXISTS (
        SELECT 1 FROM affectations_materiel a
        WHERE a.materiel_id = m.id AND a.tenant_id = t.id AND a.date_fin IS NULL
      )
      AND NOT EXISTS (
        SELECT 1 FROM maintenance mt
        WHERE mt.materiel_id = m.id AND mt.tenant_id = t.id AND mt.statut IN ('ouvert', 'en_cours')
      )
  ), 0) AS materiel_disponible,
  -- Maintenances terminées ce jour
  COALESCE((
    SELECT COUNT(*)
    FROM maintenance m
    WHERE m.tenant_id = t.id
      AND m.statut = 'fait'
      AND m.date_cloture = d.day
  ), 0) AS maintenances_terminees,
  -- Coût maintenance ce jour
  COALESCE((
    SELECT SUM(m.cout_ht)
    FROM maintenance m
    WHERE m.tenant_id = t.id
      AND m.statut = 'fait'
      AND m.date_cloture = d.day
  ), 0) AS cout_maintenance_ht
FROM tenants t CROSS JOIN dates d
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_materiel_trends_tenant_date ON rm_materiel_trends(tenant_id, date);

-- 6) Backlog maintenance (détail des maintenances planifiées/en cours)
DROP MATERIALIZED VIEW IF EXISTS rm_materiel_backlog_maintenance CASCADE;
CREATE MATERIALIZED VIEW rm_materiel_backlog_maintenance AS
SELECT
  m.tenant_id,
  m.id AS maintenance_id,
  m.materiel_id,
  mat.code AS materiel_code,
  mat.designation AS materiel_designation,
  mat.categorie AS materiel_categorie,
  ch.code AS chantier_code,
  m.type AS maintenance_type,
  m.statut AS maintenance_statut,
  m.date_ouverture,
  m.date_cloture,
  EXTRACT(DAY FROM (CURRENT_DATE - m.date_ouverture)) AS delai_jours,
  m.cout_ht
FROM maintenance m
INNER JOIN materiel mat ON mat.id = m.materiel_id AND mat.tenant_id = m.tenant_id
LEFT JOIN affectations_materiel a ON a.materiel_id = mat.id AND a.tenant_id = m.tenant_id AND a.date_fin IS NULL
LEFT JOIN chantiers ch ON ch.id = a.chantier_id
WHERE m.statut IN ('ouvert', 'en_cours')
  AND mat.actif = true
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_materiel_backlog_tenant ON rm_materiel_backlog_maintenance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rm_materiel_backlog_chantier ON rm_materiel_backlog_maintenance(tenant_id, chantier_code) WHERE chantier_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rm_materiel_backlog_type ON rm_materiel_backlog_maintenance(tenant_id, maintenance_type, delai_jours DESC);
CREATE INDEX IF NOT EXISTS idx_rm_materiel_backlog_retard ON rm_materiel_backlog_maintenance(tenant_id, delai_jours DESC) WHERE delai_jours > 7;

-- ============================================================================
-- NOTES (Phase P6)
-- ============================================================================

-- Après création, rafraîchir toutes les MViews :
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_stocks_overview;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_stocks_trends;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_stocks_ruptures;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_materiel_overview;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_materiel_trends;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_materiel_backlog_maintenance;

-- Les triggers Event-Driven (12_stocks_materiel_triggers_notify.sql) rafraîchissent automatiquement
-- ces vues lors des modifications sur stocks, mouvements_stock, materiel, maintenance

-- Filtrage ABAC :
-- - rm_stocks_ruptures : filtrable par bureau_code et chantier_code
-- - rm_materiel_backlog_maintenance : filtrable par bureau_code et chantier_code
-- - rm_stocks_overview : agrégation au tenant
-- - rm_stocks_trends : agrégation au tenant
-- - rm_materiel_overview : agrégation au tenant
-- - rm_materiel_trends : agrégation au tenant
