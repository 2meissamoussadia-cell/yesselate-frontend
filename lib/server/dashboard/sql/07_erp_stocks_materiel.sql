-- 07_erp_stocks_materiel.sql
-- Phase P4: Tables ERP Stocks & Matériel (ossature minimale)
-- Compatible avec l'architecture P2-C/2 (tenant_id, bureau_code, chantier_code)

-- ============================================================================
-- TABLES STOCKS & MATÉRIEL
-- ============================================================================

-- Articles (catalogue)
CREATE TABLE IF NOT EXISTS articles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  
  code        TEXT NOT NULL,
  libelle     TEXT NOT NULL,
  unite       TEXT NOT NULL, -- 'unite', 'm2', 'm3', 'kg', etc.
  categorie   TEXT, -- 'materiau', 'outillage', 'consommable', etc.
  
  prix_unitaire_ht NUMERIC(18,2),
  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_articles_tenant ON articles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_articles_categorie ON articles(categorie);

-- Dépôts (entrepôts, chantiers)
CREATE TABLE IF NOT EXISTS depots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  chantier_id UUID REFERENCES chantiers(id),
  bureau_id   UUID REFERENCES bureaux(id),
  
  code        TEXT NOT NULL,
  libelle     TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('entrepot', 'chantier', 'mobile')),
  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_depots_tenant ON depots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_depots_chantier ON depots(chantier_id);
CREATE INDEX IF NOT EXISTS idx_depots_bureau ON depots(bureau_id);

-- Stocks (quantités par article/dépôt)
CREATE TABLE IF NOT EXISTS stocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  depot_id    UUID NOT NULL REFERENCES depots(id) ON DELETE CASCADE,
  
  quantite    NUMERIC(10,2) NOT NULL DEFAULT 0,
  seuil_alerte NUMERIC(10,2) DEFAULT 0, -- Seuil de rupture
  
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (tenant_id, article_id, depot_id)
);

CREATE INDEX IF NOT EXISTS idx_stocks_tenant ON stocks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stocks_article ON stocks(article_id);
CREATE INDEX IF NOT EXISTS idx_stocks_depot ON stocks(depot_id);

-- Mouvements de stock (entrées/sorties)
CREATE TABLE IF NOT EXISTS mouvements_stock (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  depot_id    UUID NOT NULL REFERENCES depots(id) ON DELETE CASCADE,
  
  type        TEXT NOT NULL CHECK (type IN ('entree', 'sortie', 'transfert', 'inventaire')),
  quantite    NUMERIC(10,2) NOT NULL,
  prix_unitaire_ht NUMERIC(18,2),
  
  reference   TEXT, -- Numéro BC, BL, etc.
  motif       TEXT,
  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mouvements_tenant ON mouvements_stock(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_article ON mouvements_stock(article_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_depot ON mouvements_stock(depot_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_type ON mouvements_stock(type);
CREATE INDEX IF NOT EXISTS idx_mouvements_date ON mouvements_stock(created_at);

-- Matériel (équipements, véhicules, etc.)
CREATE TABLE IF NOT EXISTS materiel (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  chantier_id UUID REFERENCES chantiers(id),
  bureau_id   UUID REFERENCES bureaux(id),
  
  code        TEXT NOT NULL,
  libelle     TEXT NOT NULL,
  type        TEXT NOT NULL, -- 'vehicule', 'engin', 'outillage', 'materiel_specifique'
  statut      TEXT NOT NULL CHECK (statut IN ('disponible', 'en_utilisation', 'maintenance', 'hors_service')),
  
  date_acquisition DATE,
  valeur_acquisition NUMERIC(18,2),
  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_materiel_tenant ON materiel(tenant_id);
CREATE INDEX IF NOT EXISTS idx_materiel_chantier ON materiel(chantier_id);
CREATE INDEX IF NOT EXISTS idx_materiel_bureau ON materiel(bureau_id);
CREATE INDEX IF NOT EXISTS idx_materiel_statut ON materiel(statut);

-- Maintenance (interventions sur matériel)
CREATE TABLE IF NOT EXISTS maintenance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  materiel_id UUID NOT NULL REFERENCES materiel(id) ON DELETE CASCADE,
  
  type        TEXT NOT NULL CHECK (type IN ('preventive', 'corrective', 'revision')),
  statut      TEXT NOT NULL CHECK (statut IN ('planifiee', 'en_cours', 'terminee', 'annulee')),
  
  date_prevue DATE,
  date_reelle DATE,
  cout        NUMERIC(18,2),
  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_tenant ON maintenance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_materiel ON maintenance(materiel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_statut ON maintenance(statut);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance(date_prevue);

-- ============================================================================
-- VUES MATÉRIALISÉES STOCKS & MATÉRIEL
-- ============================================================================

-- Vue KPIs Stocks
DROP MATERIALIZED VIEW IF EXISTS rm_stocks_overview;
CREATE MATERIALIZED VIEW rm_stocks_overview AS
SELECT
  t.id AS tenant_id,
  
  -- Articles en rupture (quantité < seuil_alerte)
  (SELECT COUNT(DISTINCT s.article_id)
   FROM stocks s
   WHERE s.tenant_id = t.id
     AND s.quantite < s.seuil_alerte
     AND s.seuil_alerte > 0
  ) AS articles_en_rupture,
  
  -- Valeur totale stock (approximée : quantité * prix unitaire moyen)
  COALESCE((
    SELECT SUM(s.quantite * COALESCE(a.prix_unitaire_ht, 0))
    FROM stocks s
    INNER JOIN articles a ON a.id = s.article_id
    WHERE s.tenant_id = t.id
  ), 0) AS valeur_stock_ht,
  
  -- Mouvements 30 derniers jours
  (SELECT COUNT(*)
   FROM mouvements_stock m
   WHERE m.tenant_id = t.id
     AND m.created_at >= CURRENT_DATE - INTERVAL '30 days'
  ) AS mouvements_30j,
  
  -- Articles obsolètes (pas de mouvement depuis 180 jours)
  (SELECT COUNT(DISTINCT s.article_id)
   FROM stocks s
   WHERE s.tenant_id = t.id
     AND s.quantite > 0
     AND NOT EXISTS (
       SELECT 1 FROM mouvements_stock m
       WHERE m.article_id = s.article_id
         AND m.tenant_id = t.id
         AND m.created_at >= CURRENT_DATE - INTERVAL '180 days'
     )
  ) AS articles_obsoletes
FROM tenants t
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS pk_rm_stocks_overview ON rm_stocks_overview(tenant_id);

-- Vue KPIs Matériel
DROP MATERIALIZED VIEW IF EXISTS rm_materiel_overview;
CREATE MATERIALIZED VIEW rm_materiel_overview AS
SELECT
  t.id AS tenant_id,
  
  -- Matériel disponible
  (SELECT COUNT(*) FROM materiel m WHERE m.tenant_id = t.id AND m.statut = 'disponible') AS materiel_disponible,
  
  -- Matériel en maintenance
  (SELECT COUNT(*) FROM materiel m WHERE m.tenant_id = t.id AND m.statut = 'maintenance') AS materiel_maintenance,
  
  -- Maintenance en cours
  (SELECT COUNT(*) FROM maintenance m WHERE m.tenant_id = t.id AND m.statut = 'en_cours') AS maintenances_en_cours,
  
  -- Backlog maintenance (planifiées)
  (SELECT COUNT(*) FROM maintenance m WHERE m.tenant_id = t.id AND m.statut = 'planifiee') AS maintenances_planifiees,
  
  -- Valeur totale matériel
  COALESCE((
    SELECT SUM(m.valeur_acquisition)
    FROM materiel m
    WHERE m.tenant_id = t.id
  ), 0) AS valeur_materiel_total
FROM tenants t
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS pk_rm_materiel_overview ON rm_materiel_overview(tenant_id);

-- ============================================================================
-- NOTES
-- ============================================================================

-- Après création, rafraîchir :
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_stocks_overview;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_materiel_overview;
