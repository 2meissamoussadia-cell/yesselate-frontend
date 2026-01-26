-- 10_stocks_materiel_core.sql
-- Phase P6: Schéma Stocks & Matériel (structure complète)
-- Compatible avec l'architecture P2-C/2 (tenant_id, bureau_code, chantier_code)

-- ============================================================================
-- TABLES STOCKS & MATÉRIEL (Structure complète)
-- ============================================================================

-- Articles (catalogue) - Réutilisé depuis Achats si existe, sinon création
CREATE TABLE IF NOT EXISTS articles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  libelle     TEXT NOT NULL,
  unite       TEXT NOT NULL, -- 'unite', 'm2', 'm3', 'kg', 'L', etc.
  categorie   TEXT, -- 'materiau', 'outillage', 'consommable', 'equipement', etc.
  prix_unitaire_ht NUMERIC(18,2),
  actif       BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_articles_tenant ON articles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_articles_categorie ON articles(tenant_id, categorie);
CREATE INDEX IF NOT EXISTS idx_articles_actif ON articles(tenant_id, actif) WHERE actif = true;

-- Dépôts (entrepôts, chantiers, dépôts mobiles)
CREATE TABLE IF NOT EXISTS depots (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code      TEXT NOT NULL,
  nom       TEXT NOT NULL,
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_depots_tenant ON depots(tenant_id);

-- Stocks (quantités par article/dépôt)
CREATE TABLE IF NOT EXISTS stock (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  depot_id    UUID NOT NULL REFERENCES depots(id),
  article_id  UUID NOT NULL REFERENCES articles(id),
  qte         NUMERIC(18,4) NOT NULL DEFAULT 0,
  seuil       NUMERIC(18,4) NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, depot_id, article_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_tenant ON stock(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_article ON stock(article_id);
CREATE INDEX IF NOT EXISTS idx_stock_depot ON stock(depot_id);
CREATE INDEX IF NOT EXISTS idx_stock_rupture ON stock(tenant_id, depot_id, article_id) 
  WHERE qte < seuil AND seuil > 0;

-- Mouvements de stock (entrées/sorties/inventaires)
CREATE TABLE IF NOT EXISTS mouvements_stock (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  depot_id    UUID NOT NULL REFERENCES depots(id),
  article_id  UUID NOT NULL REFERENCES articles(id),
  type        TEXT NOT NULL CHECK (type IN ('entree', 'sortie', 'inventaire')),
  qte         NUMERIC(18,4) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mouvements_tenant ON mouvements_stock(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_article ON mouvements_stock(article_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_depot ON mouvements_stock(depot_id);
CREATE INDEX IF NOT EXISTS idx_mouvements_type ON mouvements_stock(type);
CREATE INDEX IF NOT EXISTS idx_mouvements_date ON mouvements_stock(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mouvements_30j ON mouvements_stock(tenant_id, created_at DESC) 
  WHERE created_at >= (CURRENT_DATE - INTERVAL '30 days');

-- Matériel (équipements, véhicules, engins, outillage)
CREATE TABLE IF NOT EXISTS materiel (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  designation TEXT NOT NULL,
  categorie   TEXT NOT NULL, -- grue, camion, compacteur, nacelle...
  actif       BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_materiel_tenant ON materiel(tenant_id);
CREATE INDEX IF NOT EXISTS idx_materiel_categorie ON materiel(tenant_id, categorie);
CREATE INDEX IF NOT EXISTS idx_materiel_actif ON materiel(tenant_id, actif) WHERE actif = true;

-- Affectations matériel (historique des affectations chantier)
CREATE TABLE IF NOT EXISTS affectations_materiel (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  materiel_id UUID NOT NULL REFERENCES materiel(id),
  chantier_id UUID REFERENCES chantiers(id),
  date_debut  DATE NOT NULL,
  date_fin    DATE, -- NULL si affectation en cours
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affectations_tenant ON affectations_materiel(tenant_id);
CREATE INDEX IF NOT EXISTS idx_affectations_materiel ON affectations_materiel(materiel_id);
CREATE INDEX IF NOT EXISTS idx_affectations_chantier ON affectations_materiel(chantier_id);
CREATE INDEX IF NOT EXISTS idx_affectations_en_cours ON affectations_materiel(tenant_id, materiel_id) 
  WHERE date_fin IS NULL;

-- Maintenance (interventions préventives et curatives)
CREATE TABLE IF NOT EXISTS maintenance (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  materiel_id UUID NOT NULL REFERENCES materiel(id),
  type        TEXT NOT NULL CHECK (type IN ('preventive', 'curative')),
  statut      TEXT NOT NULL CHECK (statut IN ('ouvert', 'en_cours', 'fait')),
  date_ouverture DATE NOT NULL,
  date_cloture   DATE,
  cout_ht     NUMERIC(18,2),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_tenant ON maintenance(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_materiel ON maintenance(materiel_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_statut ON maintenance(statut);
CREATE INDEX IF NOT EXISTS idx_maintenance_type ON maintenance(type);
CREATE INDEX IF NOT EXISTS idx_maintenance_date_ouverture ON maintenance(date_ouverture);
CREATE INDEX IF NOT EXISTS idx_maintenance_en_cours ON maintenance(tenant_id, statut) 
  WHERE statut IN ('ouvert', 'en_cours');

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

COMMENT ON TABLE articles IS 'Catalogue d''articles (matériaux, outillage, consommables)';
COMMENT ON TABLE depots IS 'Dépôts/entrepôts (fixes ou mobiles)';
COMMENT ON TABLE stock IS 'Stock réel par article/dépôt avec seuils d''alerte';
COMMENT ON TABLE mouvements_stock IS 'Historique des mouvements de stock (entrées/sorties/inventaires)';
COMMENT ON TABLE materiel IS 'Matériel/équipements (véhicules, engins, outillage)';
COMMENT ON TABLE affectations_materiel IS 'Historique des affectations matériel → chantier';
COMMENT ON TABLE maintenance IS 'Interventions de maintenance (préventive/curative)';
