-- 06_erp_achats_contrats.sql
-- Phase P4: Tables ERP Achats/Contrats (ossature minimale)
-- Compatible avec l'architecture P2-C/2 (tenant_id, bureau_code, chantier_code)

-- ============================================================================
-- TABLES ACHATS / CONTRATS
-- ============================================================================

-- Fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  nom         TEXT NOT NULL,
  siret       TEXT,
  contact     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_fournisseurs_tenant ON fournisseurs(tenant_id);

-- Contrats
CREATE TABLE IF NOT EXISTS contrats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  fournisseur_id  UUID REFERENCES fournisseurs(id),
  chantier_id     UUID REFERENCES chantiers(id),
  bureau_id       UUID REFERENCES bureaux(id),
  
  -- Identification
  numero          TEXT NOT NULL,
  objet           TEXT NOT NULL,
  type_contrat    TEXT NOT NULL CHECK (type_contrat IN ('marche', 'avenant', 'bon_commande', 'devis')),
  
  -- Montants
  montant_ht      NUMERIC(18,2) NOT NULL DEFAULT 0,
  montant_ttc     NUMERIC(18,2) NOT NULL DEFAULT 0,
  tva             NUMERIC(18,2) NOT NULL DEFAULT 0,
  
  -- Dates
  date_signature  DATE,
  date_debut      DATE,
  date_fin        DATE,
  
  -- Statut
  statut          TEXT NOT NULL CHECK (statut IN ('brouillon', 'en_cours', 'cloture', 'resilie')),
  
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (tenant_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_contrats_tenant ON contrats(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contrats_fournisseur ON contrats(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_contrats_chantier ON contrats(chantier_id);
CREATE INDEX IF NOT EXISTS idx_contrats_bureau ON contrats(bureau_id);
CREATE INDEX IF NOT EXISTS idx_contrats_statut ON contrats(statut);

-- Lignes de contrat (détail)
CREATE TABLE IF NOT EXISTS lignes_contrat (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contrat_id  UUID NOT NULL REFERENCES contrats(id) ON DELETE CASCADE,
  
  libelle     TEXT NOT NULL,
  quantite    NUMERIC(10,2) NOT NULL DEFAULT 0,
  prix_unitaire_ht NUMERIC(18,2) NOT NULL DEFAULT 0,
  montant_ht  NUMERIC(18,2) NOT NULL DEFAULT 0,
  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lignes_contrat_tenant ON lignes_contrat(tenant_id);
CREATE INDEX IF NOT EXISTS idx_lignes_contrat_contrat ON lignes_contrat(contrat_id);

-- Bons de commande (BC)
CREATE TABLE IF NOT EXISTS bons_commande (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contrat_id  UUID REFERENCES contrats(id),
  bureau_id   UUID REFERENCES bureaux(id),
  
  numero      TEXT NOT NULL,
  montant_ht  NUMERIC(18,2) NOT NULL DEFAULT 0,
  statut      TEXT NOT NULL CHECK (statut IN ('brouillon', 'emise', 'receptionnee', 'annulee')),
  
  date_emission DATE,
  date_reception DATE,
  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (tenant_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_bc_tenant ON bons_commande(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bc_contrat ON bons_commande(contrat_id);
CREATE INDEX IF NOT EXISTS idx_bc_bureau ON bons_commande(bureau_id);
CREATE INDEX IF NOT EXISTS idx_bc_statut ON bons_commande(statut);

-- Bons de livraison (BL)
CREATE TABLE IF NOT EXISTS bons_livraison (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bc_id       UUID REFERENCES bons_commande(id),
  
  numero      TEXT NOT NULL,
  montant_ht  NUMERIC(18,2) NOT NULL DEFAULT 0,
  statut      TEXT NOT NULL CHECK (statut IN ('attendu', 'recu', 'partiel', 'annule')),
  
  date_livraison DATE,
  
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (tenant_id, numero)
);

CREATE INDEX IF NOT EXISTS idx_bl_tenant ON bons_livraison(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bl_bc ON bons_livraison(bc_id);
CREATE INDEX IF NOT EXISTS idx_bl_statut ON bons_livraison(statut);

-- ============================================================================
-- VUES MATÉRIALISÉES ACHATS/CONTRATS (Phase P5)
-- ============================================================================

-- Vue KPIs Achats/Contrats (Overview) - enrichie avec codes bureau/chantier pour ABAC
DROP MATERIALIZED VIEW IF EXISTS rm_achats_overview CASCADE;
CREATE MATERIALIZED VIEW rm_achats_overview AS
SELECT
  t.id AS tenant_id,
  
  -- Contrats en cours
  (SELECT COUNT(*) FROM contrats c WHERE c.tenant_id = t.id AND c.statut = 'en_cours') AS contrats_en_cours,
  
  -- Montant total contrats en cours
  COALESCE((
    SELECT SUM(c.montant_ttc)
    FROM contrats c
    WHERE c.tenant_id = t.id AND c.statut = 'en_cours'
  ), 0) AS montant_contrats_en_cours,
  
  -- BC en attente (émises mais non réceptionnées)
  (SELECT COUNT(*) FROM bons_commande bc WHERE bc.tenant_id = t.id AND bc.statut = 'emise') AS bc_en_attente,
  
  -- Montant BC en attente
  COALESCE((
    SELECT SUM(bc.montant_ht)
    FROM bons_commande bc
    WHERE bc.tenant_id = t.id AND bc.statut = 'emise'
  ), 0) AS montant_bc_en_attente,
  
  -- Lead time moyen (jours entre émission BC et réception BL)
  COALESCE((
    SELECT AVG(EXTRACT(DAY FROM (bl.date_livraison - bc.date_emission)))
    FROM bons_commande bc
    INNER JOIN bons_livraison bl ON bl.bc_id = bc.id
    WHERE bc.tenant_id = t.id
      AND bc.date_emission IS NOT NULL
      AND bl.date_livraison IS NOT NULL
      AND bl.statut = 'recu'
      AND bl.date_livraison >= CURRENT_DATE - INTERVAL '90 days' -- Derniers 90 jours
  ), 0) AS lead_time_moyen_jours,
  
  -- Taux de conformité (contrats en conformité / total contrats)
  COALESCE((
    SELECT COUNT(*) FILTER (WHERE c.statut = 'en_cours' AND c.date_fin >= CURRENT_DATE OR c.date_fin IS NULL)::float
    / NULLIF(COUNT(*), 0)
    FROM contrats c
    WHERE c.tenant_id = t.id
  ), 0) AS taux_conformite_contrats,
  
  -- Écarts prix (placeholder - à calculer depuis lignes_contrat vs factures)
  0 AS ecarts_prix_total
FROM tenants t
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS pk_rm_achats_overview ON rm_achats_overview(tenant_id);

-- Vue Trends Achats (30 derniers jours) - Phase P5
DROP MATERIALIZED VIEW IF EXISTS rm_achats_trends CASCADE;
CREATE MATERIALIZED VIEW rm_achats_trends AS
WITH dates AS (
  SELECT generate_series((CURRENT_DATE - INTERVAL '29 days')::date, CURRENT_DATE::date, INTERVAL '1 day')::date AS day
)
SELECT
  t.id AS tenant_id,
  d.day::text AS date,
  -- Contrats créés ce jour
  COALESCE((
    SELECT COUNT(*)
    FROM contrats c
    WHERE c.tenant_id = t.id AND c.created_at::date = d.day
  ), 0) AS contrats_crees,
  -- BC émises ce jour
  COALESCE((
    SELECT COUNT(*)
    FROM bons_commande bc
    WHERE bc.tenant_id = t.id AND bc.date_emission = d.day
  ), 0) AS bc_emises,
  -- BL reçus ce jour
  COALESCE((
    SELECT COUNT(*)
    FROM bons_livraison bl
    WHERE bl.tenant_id = t.id AND bl.date_livraison = d.day AND bl.statut = 'recu'
  ), 0) AS bl_recus,
  -- Montant BC émises ce jour
  COALESCE((
    SELECT SUM(bc.montant_ht)
    FROM bons_commande bc
    WHERE bc.tenant_id = t.id AND bc.date_emission = d.day
  ), 0) AS montant_bc_emises
FROM tenants t CROSS JOIN dates d
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_achats_trends_tenant_date ON rm_achats_trends(tenant_id, date);

-- Vue Fournisseurs (Top fournisseurs par montant) - Phase P5
DROP MATERIALIZED VIEW IF EXISTS rm_achats_fournisseurs CASCADE;
CREATE MATERIALIZED VIEW rm_achats_fournisseurs AS
SELECT
  f.tenant_id,
  f.id AS fournisseur_id,
  f.code AS fournisseur_code,
  f.nom AS fournisseur_nom,
  -- Nombre de contrats
  COUNT(DISTINCT c.id) AS nb_contrats,
  -- Montant total contrats
  COALESCE(SUM(c.montant_ttc), 0) AS montant_total_contrats,
  -- Nombre de BC
  COUNT(DISTINCT bc.id) AS nb_bc,
  -- Montant total BC
  COALESCE(SUM(bc.montant_ht), 0) AS montant_total_bc,
  -- Lead time moyen avec ce fournisseur
  COALESCE((
    SELECT AVG(EXTRACT(DAY FROM (bl.date_livraison - bc.date_emission)))
    FROM bons_commande bc2
    INNER JOIN bons_livraison bl ON bl.bc_id = bc2.id
    WHERE bc2.tenant_id = f.tenant_id
      AND bc2.contrat_id IN (SELECT id FROM contrats WHERE fournisseur_id = f.id)
      AND bc2.date_emission IS NOT NULL
      AND bl.date_livraison IS NOT NULL
      AND bl.statut = 'recu'
      AND bl.date_livraison >= CURRENT_DATE - INTERVAL '90 days'
  ), 0) AS lead_time_moyen_jours
FROM fournisseurs f
LEFT JOIN contrats c ON c.fournisseur_id = f.id AND c.tenant_id = f.tenant_id
LEFT JOIN bons_commande bc ON bc.contrat_id = c.id AND bc.tenant_id = f.tenant_id
GROUP BY f.tenant_id, f.id, f.code, f.nom
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_achats_fournisseurs_tenant ON rm_achats_fournisseurs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rm_achats_fournisseurs_montant ON rm_achats_fournisseurs(tenant_id, montant_total_contrats DESC);

-- Vue Commandes Ouvertes (BC en attente avec détails) - Phase P5
DROP MATERIALIZED VIEW IF EXISTS rm_achats_commandes_ouvertes CASCADE;
CREATE MATERIALIZED VIEW rm_achats_commandes_ouvertes AS
SELECT
  bc.tenant_id,
  bc.id AS bc_id,
  bc.numero AS bc_numero,
  bc.montant_ht,
  bc.date_emission,
  bc.statut,
  -- Délai depuis émission (jours)
  EXTRACT(DAY FROM (CURRENT_DATE - bc.date_emission)) AS delai_jours,
  -- Fournisseur
  f.code AS fournisseur_code,
  f.nom AS fournisseur_nom,
  -- Contrat associé
  c.numero AS contrat_numero,
  c.objet AS contrat_objet,
  -- Bureau (pour filtrage ABAC)
  b.code AS bureau_code,
  -- Chantier (pour filtrage ABAC)
  ch.code AS chantier_code
FROM bons_commande bc
LEFT JOIN contrats c ON c.id = bc.contrat_id
LEFT JOIN fournisseurs f ON f.id = c.fournisseur_id
LEFT JOIN bureaux b ON b.id = bc.bureau_id
LEFT JOIN chantiers ch ON ch.id = c.chantier_id
WHERE bc.statut = 'emise'
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_achats_commandes_ouvertes_tenant ON rm_achats_commandes_ouvertes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rm_achats_commandes_ouvertes_bureau ON rm_achats_commandes_ouvertes(tenant_id, bureau_code) WHERE bureau_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rm_achats_commandes_ouvertes_chantier ON rm_achats_commandes_ouvertes(tenant_id, chantier_code) WHERE chantier_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rm_achats_commandes_ouvertes_delai ON rm_achats_commandes_ouvertes(tenant_id, delai_jours DESC);

-- ============================================================================
-- NOTES (Phase P5)
-- ============================================================================

-- Après création, rafraîchir toutes les MViews :
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_overview;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_trends;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_fournisseurs;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_commandes_ouvertes;

-- Les triggers Event-Driven (05_triggers_notify.sql) rafraîchissent automatiquement
-- ces vues lors des modifications sur contrats, bons_commande, bons_livraison, fournisseurs, lignes_contrat

-- Filtrage ABAC :
-- - rm_achats_commandes_ouvertes : filtrable par bureau_code et chantier_code
-- - rm_achats_fournisseurs : agrégation au tenant (pas de filtrage bureau/chantier)
-- - rm_achats_overview : agrégation au tenant
-- - rm_achats_trends : agrégation au tenant
