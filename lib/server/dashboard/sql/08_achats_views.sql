-- 08_achats_views.sql
-- Phase P5: MViews Achats/Contrats (version optimisée avec OTIF, variance prix, dépenses)
-- Compatible avec l'architecture P2-C/2 (tenant_id, bureau_code, chantier_code)

-- ============================================================================
-- VUES MATÉRIALISÉES ACHATS/CONTRATS (Phase P5 - Version optimisée)
-- ============================================================================

-- 1) Overview Achats (lead time, conformité, variance prix, dépenses)
DROP MATERIALIZED VIEW IF EXISTS rm_achats_overview CASCADE;
CREATE MATERIALIZED VIEW rm_achats_overview AS
WITH base AS (
  SELECT
    t.id AS tenant_id,
    -- Lead time: délai moyen (jours) entre BC émis et 1er BL reçu (sur les BC associés à BL)
    (
      SELECT AVG(EXTRACT(DAY FROM (bl.recu_le - bc.emis_le)))
      FROM bc
      JOIN bl ON bl.bc_id = bc.id
      WHERE bc.tenant_id = t.id
        AND bc.emis_le IS NOT NULL
        AND bl.recu_le IS NOT NULL
    ) AS lead_time_j,
    -- Conformité (OTIF proxy) : % BL statut 'recu' (vs 'partiel'/'annule')
    (
      SELECT COALESCE(
        COUNT(*) FILTER (WHERE bl.statut = 'recu')::float / NULLIF(COUNT(*),0)
      ,0)
      FROM bl WHERE bl.tenant_id = t.id
    ) AS conformite_ratio,
    -- Variance prix (écart moyen reçu vs prix réf) sur 30 jours
    (
      SELECT COALESCE(AVG(
        CASE WHEN pr.prix_ht > 0
          THEN ((bll.prix_un_ht - pr.prix_ht) / pr.prix_ht)::float
          ELSE 0 END
      ),0)
      FROM bl_lignes bll
      JOIN bl ON bl.id = bll.bl_id AND bl.tenant_id = t.id
      LEFT JOIN prix_reference pr ON pr.tenant_id = t.id 
        AND pr.article_id = bll.article_id
        AND pr.date_effet <= bl.recu_le
        AND pr.id = (
          SELECT id FROM prix_reference pr2
          WHERE pr2.tenant_id = t.id
            AND pr2.article_id = bll.article_id
            AND pr2.date_effet <= bl.recu_le
          ORDER BY pr2.date_effet DESC LIMIT 1
        )
      WHERE bl.recu_le >= (CURRENT_DATE - INTERVAL '30 days')
    ) AS price_variance_ratio,
    -- Dépenses HT (30 jours) - somme des montants HT des lignes BL reçus
    (
      SELECT COALESCE(SUM(bll.montant_ht),0)
      FROM bl_lignes bll
      JOIN bl ON bl.id = bll.bl_id AND bl.tenant_id = t.id
      WHERE bl.recu_le >= (CURRENT_DATE - INTERVAL '30 days')
        AND bl.statut = 'recu'
    ) AS spend_30d_ht
  FROM tenants t
)
SELECT * FROM base
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS pk_rm_achats_overview ON rm_achats_overview(tenant_id);

-- 2) Trends journalières (BC émis, BL reçus, spend)
DROP MATERIALIZED VIEW IF EXISTS rm_achats_trends CASCADE;
CREATE MATERIALIZED VIEW rm_achats_trends AS
WITH dates AS (
  SELECT generate_series((CURRENT_DATE - INTERVAL '29 days')::date, CURRENT_DATE::date, INTERVAL '1 day')::date AS day
)
SELECT
  t.id AS tenant_id,
  d.day::text AS date,
  COALESCE((SELECT COUNT(*) FROM bc WHERE tenant_id = t.id AND emis_le = d.day), 0) AS bc_emis,
  COALESCE((SELECT COUNT(*) FROM bl WHERE tenant_id = t.id AND recu_le = d.day), 0) AS bl_recus,
  COALESCE((
    SELECT SUM(bll.montant_ht)
    FROM bl_lignes bll
    JOIN bl ON bl.id = bll.bl_id AND bl.tenant_id = t.id AND bl.recu_le = d.day AND bl.statut = 'recu'
  ),0) AS spend_ht
FROM tenants t CROSS JOIN dates d
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_achats_trends_tenant_date ON rm_achats_trends(tenant_id, date);

-- 3) KPIs par fournisseur (OTIF, nb BL, variance moyenne)
DROP MATERIALIZED VIEW IF EXISTS rm_achats_fournisseurs CASCADE;
CREATE MATERIALIZED VIEW rm_achats_fournisseurs AS
SELECT
  f.tenant_id,
  f.id AS fournisseur_id,
  f.code AS fournisseur_code,
  f.nom AS fournisseur_nom,
  COALESCE(COUNT(bl.id),0) AS nb_bl,
  COALESCE(COUNT(bl.id) FILTER (WHERE bl.statut = 'recu')::float / NULLIF(COUNT(bl.id),0),0) AS otif_ratio,
  COALESCE(AVG(
    CASE WHEN pr.prix_ht > 0
      THEN ((bll.prix_un_ht - pr.prix_ht) / pr.prix_ht)::float
      ELSE 0 END
  ),0) AS price_var_ratio
FROM fournisseurs f
LEFT JOIN bc ON bc.tenant_id = f.tenant_id AND bc.fournisseur_id = f.id
LEFT JOIN bl ON bl.bc_id = bc.id
LEFT JOIN bl_lignes bll ON bll.bl_id = bl.id
LEFT JOIN prix_reference pr ON pr.tenant_id = f.tenant_id 
  AND pr.article_id = bll.article_id
  AND pr.date_effet <= bl.recu_le
  AND pr.id = (
    SELECT id FROM prix_reference pr2
    WHERE pr2.tenant_id = f.tenant_id
      AND pr2.article_id = bll.article_id
      AND pr2.date_effet <= bl.recu_le
    ORDER BY pr2.date_effet DESC LIMIT 1
  )
WHERE f.actif = true
GROUP BY f.tenant_id, f.id, f.code, f.nom
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_achats_fournisseurs_tenant ON rm_achats_fournisseurs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rm_achats_fournisseurs_otif ON rm_achats_fournisseurs(tenant_id, otif_ratio DESC);

-- 4) Commandes ouvertes (BC non soldés) - avec calcul quantités commandées vs reçues
DROP MATERIALIZED VIEW IF EXISTS rm_achats_open_orders CASCADE;
CREATE MATERIALIZED VIEW rm_achats_open_orders AS
WITH recues AS (
  SELECT 
    bcl.bc_id, 
    bcl.id AS bc_ligne_id,
    SUM(COALESCE(bll.qte,0)) AS qte_recue
  FROM bc_lignes bcl
  LEFT JOIN bl ON bl.bc_id = bcl.bc_id AND bl.statut = 'recu'
  LEFT JOIN bl_lignes bll ON bll.bl_id = bl.id AND bll.bc_ligne_id = bcl.id
  GROUP BY bcl.bc_id, bcl.id
)
SELECT
  bc.tenant_id,
  bc.id AS bc_id,
  bc.ref AS bc_ref,
  bc.emis_le,
  bc.statut,
  f.code AS fournisseur_code,
  f.nom AS fournisseur_nom,
  b.code AS bureau_code,
  ch.code AS chantier_code,
  SUM(bcl.qte) AS qte_commande,
  SUM(COALESCE(r.qte_recue,0)) AS qte_recue,
  SUM(bcl.qte - COALESCE(r.qte_recue,0)) AS qte_restante,
  SUM(bcl.qte * bcl.prix_un_ht) AS montant_ht_commande,
  EXTRACT(DAY FROM (CURRENT_DATE - bc.emis_le)) AS delai_jours
FROM bc
JOIN fournisseurs f ON f.id = bc.fournisseur_id
LEFT JOIN bureaux b ON b.id = bc.bureau_id
LEFT JOIN chantiers ch ON ch.id = bc.chantier_id
JOIN bc_lignes bcl ON bcl.bc_id = bc.id
LEFT JOIN recues r ON r.bc_id = bcl.bc_id AND r.bc_ligne_id = bcl.id
WHERE COALESCE(bc.statut,'') NOT IN ('annule','recu')
GROUP BY bc.tenant_id, bc.id, bc.ref, bc.emis_le, bc.statut, f.code, f.nom, b.code, ch.code
HAVING SUM(bcl.qte - COALESCE(r.qte_recue,0)) > 0  -- Seulement les BC avec quantités restantes
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_achats_open_orders_tenant ON rm_achats_open_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rm_achats_open_orders_bureau ON rm_achats_open_orders(tenant_id, bureau_code) WHERE bureau_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rm_achats_open_orders_chantier ON rm_achats_open_orders(tenant_id, chantier_code) WHERE chantier_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rm_achats_open_orders_delai ON rm_achats_open_orders(tenant_id, delai_jours DESC);

-- ============================================================================
-- NOTES (Phase P5)
-- ============================================================================

-- Après création, rafraîchir toutes les MViews :
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_overview;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_trends;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_fournisseurs;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_open_orders;

-- Les triggers Event-Driven (05_triggers_notify.sql) rafraîchissent automatiquement
-- ces vues lors des modifications sur contrats, bc, bl, fournisseurs, articles, prix_reference

-- Filtrage ABAC :
-- - rm_achats_open_orders : filtrable par bureau_code et chantier_code
-- - rm_achats_fournisseurs : agrégation au tenant (pas de filtrage bureau/chantier)
-- - rm_achats_overview : agrégation au tenant
-- - rm_achats_trends : agrégation au tenant
