-- 07_achats_core.sql
-- Phase P5: Schéma Achats/Contrats (structure complète avec articles et prix de référence)
-- Compatible avec l'architecture P2-C/2 (tenant_id, bureau_code, chantier_code)

-- ============================================================================
-- TABLES ACHATS / CONTRATS (Structure complète)
-- ============================================================================

-- Fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  nom         TEXT NOT NULL,
  actif       BOOLEAN NOT NULL DEFAULT true,
  siret       TEXT,
  contact     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_fournisseurs_tenant ON fournisseurs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_actif ON fournisseurs(tenant_id, actif) WHERE actif = true;

-- Contrats
CREATE TABLE IF NOT EXISTS contrats (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  fournisseur_id  UUID NOT NULL REFERENCES fournisseurs(id),
  chantier_id     UUID REFERENCES chantiers(id),
  bureau_id       UUID REFERENCES bureaux(id),
  ref             TEXT NOT NULL,
  objet           TEXT,
  type_contrat    TEXT CHECK (type_contrat IN ('marche', 'avenant', 'bon_commande', 'devis')),
  date_debut      DATE NOT NULL,
  date_fin        DATE,
  montant_ht      NUMERIC(18,2) NOT NULL DEFAULT 0,
  montant_ttc     NUMERIC(18,2) NOT NULL DEFAULT 0,
  tva             NUMERIC(18,2) NOT NULL DEFAULT 0,
  statut          TEXT NOT NULL CHECK (statut IN ('brouillon', 'en_cours', 'cloture', 'resilie')),
  actif           BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, ref)
);

CREATE INDEX IF NOT EXISTS idx_contrats_tenant ON contrats(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contrats_fournisseur ON contrats(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_contrats_chantier ON contrats(chantier_id);
CREATE INDEX IF NOT EXISTS idx_contrats_bureau ON contrats(bureau_id);
CREATE INDEX IF NOT EXISTS idx_contrats_statut ON contrats(statut);
CREATE INDEX IF NOT EXISTS idx_contrats_actif ON contrats(tenant_id, actif) WHERE actif = true;

-- Articles (catalogue)
CREATE TABLE IF NOT EXISTS articles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ref         TEXT NOT NULL,
  libelle     TEXT NOT NULL,
  unite       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, ref)
);

CREATE INDEX IF NOT EXISTS idx_articles_tenant ON articles(tenant_id);

-- Prix de référence (historique des prix par article/fournisseur)
CREATE TABLE IF NOT EXISTS prix_reference (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  article_id      UUID NOT NULL REFERENCES articles(id),
  fournisseur_id  UUID REFERENCES fournisseurs(id),
  prix_ht         NUMERIC(18,4) NOT NULL,
  date_effet      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, article_id, fournisseur_id, date_effet)
);

CREATE INDEX IF NOT EXISTS idx_prix_reference_tenant ON prix_reference(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prix_reference_article ON prix_reference(article_id);
CREATE INDEX IF NOT EXISTS idx_prix_reference_fournisseur ON prix_reference(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_prix_reference_date_effet ON prix_reference(date_effet DESC);

-- Bon de commande (BC) & lignes
CREATE TABLE IF NOT EXISTS bc (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  chantier_id     UUID REFERENCES chantiers(id),
  bureau_id       UUID REFERENCES bureaux(id),
  fournisseur_id  UUID NOT NULL REFERENCES fournisseurs(id),
  contrat_id      UUID REFERENCES contrats(id),
  ref             TEXT NOT NULL,       -- N° BC
  emis_le         DATE NOT NULL,
  recu_le         DATE,
  statut          TEXT NOT NULL CHECK (statut IN ('brouillon','emis','approuve','partiellement_recu','recu','annule')),
  montant_ht      NUMERIC(18,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, ref)
);

CREATE INDEX IF NOT EXISTS idx_bc_tenant ON bc(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bc_contrat ON bc(contrat_id);
CREATE INDEX IF NOT EXISTS idx_bc_fournisseur ON bc(fournisseur_id);
CREATE INDEX IF NOT EXISTS idx_bc_chantier ON bc(chantier_id);
CREATE INDEX IF NOT EXISTS idx_bc_bureau ON bc(bureau_id);
CREATE INDEX IF NOT EXISTS idx_bc_statut ON bc(statut);
CREATE INDEX IF NOT EXISTS idx_bc_emis_le ON bc(emis_le);

CREATE TABLE IF NOT EXISTS bc_lignes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bc_id       UUID NOT NULL REFERENCES bc(id) ON DELETE CASCADE,
  article_id  UUID NOT NULL REFERENCES articles(id),
  qte         NUMERIC(18,4) NOT NULL,
  prix_un_ht  NUMERIC(18,4) NOT NULL,
  montant_ht  NUMERIC(18,2) GENERATED ALWAYS AS (qte * prix_un_ht) STORED,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bc_lignes_tenant ON bc_lignes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bc_lignes_bc ON bc_lignes(bc_id);
CREATE INDEX IF NOT EXISTS idx_bc_lignes_article ON bc_lignes(article_id);

-- Bon de livraison (BL) & lignes
CREATE TABLE IF NOT EXISTS bl (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bc_id       UUID REFERENCES bc(id),
  ref         TEXT NOT NULL,
  recu_le     DATE NOT NULL,
  statut      TEXT NOT NULL CHECK (statut IN ('attendu', 'recu', 'partiel', 'annule')),
  montant_ht  NUMERIC(18,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, ref)
);

CREATE INDEX IF NOT EXISTS idx_bl_tenant ON bl(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bl_bc ON bl(bc_id);
CREATE INDEX IF NOT EXISTS idx_bl_statut ON bl(statut);
CREATE INDEX IF NOT EXISTS idx_bl_recu_le ON bl(recu_le);

CREATE TABLE IF NOT EXISTS bl_lignes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  bl_id       UUID NOT NULL REFERENCES bl(id) ON DELETE CASCADE,
  bc_ligne_id UUID REFERENCES bc_lignes(id),
  article_id  UUID NOT NULL REFERENCES articles(id),
  qte         NUMERIC(18,4) NOT NULL,
  prix_un_ht  NUMERIC(18,4) NOT NULL,
  montant_ht  NUMERIC(18,2) GENERATED ALWAYS AS (qte * prix_un_ht) STORED,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bl_lignes_tenant ON bl_lignes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bl_lignes_bl ON bl_lignes(bl_id);
CREATE INDEX IF NOT EXISTS idx_bl_lignes_article ON bl_lignes(article_id);

-- ============================================================================
-- VUES MATÉRIALISÉES ACHATS/CONTRATS (Phase P5 - Adaptées au nouveau schéma)
-- ============================================================================

-- Vue KPIs Achats/Contrats (Overview) - enrichie avec codes bureau/chantier pour ABAC
DROP MATERIALIZED VIEW IF EXISTS rm_achats_overview CASCADE;
CREATE MATERIALIZED VIEW rm_achats_overview AS
SELECT
  t.id AS tenant_id,
  
  -- Contrats en cours (actifs et non expirés)
  (SELECT COUNT(*) FROM contrats c WHERE c.tenant_id = t.id AND c.actif = true AND c.statut = 'en_cours' AND (c.date_fin IS NULL OR c.date_fin >= CURRENT_DATE)) AS contrats_en_cours,
  
  -- Montant total contrats en cours
  COALESCE((
    SELECT SUM(c.montant_ttc)
    FROM contrats c
    WHERE c.tenant_id = t.id AND c.actif = true AND c.statut = 'en_cours' AND (c.date_fin IS NULL OR c.date_fin >= CURRENT_DATE)
  ), 0) AS montant_contrats_en_cours,
  
  -- BC en attente (émis mais non réceptionnés)
  (SELECT COUNT(*) FROM bc WHERE bc.tenant_id = t.id AND bc.statut = 'emis') AS bc_en_attente,
  
  -- Montant BC en attente
  COALESCE((
    SELECT SUM(bc.montant_ht)
    FROM bc
    WHERE bc.tenant_id = t.id AND bc.statut = 'emis'
  ), 0) AS montant_bc_en_attente,
  
  -- Lead time moyen (jours entre émission BC et réception BL)
  COALESCE((
    SELECT AVG(EXTRACT(DAY FROM (bl.recu_le - bc.emis_le)))
    FROM bc
    INNER JOIN bl ON bl.bc_id = bc.id
    WHERE bc.tenant_id = t.id
      AND bc.emis_le IS NOT NULL
      AND bl.recu_le IS NOT NULL
      AND bl.statut = 'recu'
      AND bl.recu_le >= CURRENT_DATE - INTERVAL '90 days' -- Derniers 90 jours
  ), 0) AS lead_time_moyen_jours,
  
  -- Taux de conformité (contrats en conformité / total contrats)
  COALESCE((
    SELECT COUNT(*) FILTER (WHERE c.actif = true AND c.statut = 'en_cours' AND (c.date_fin IS NULL OR c.date_fin >= CURRENT_DATE))::float
    / NULLIF(COUNT(*), 0)
    FROM contrats c
    WHERE c.tenant_id = t.id
  ), 0) AS taux_conformite_contrats,
  
  -- Écarts prix (différence entre prix BC et prix de référence)
  COALESCE((
    SELECT SUM(ABS(bcl.prix_un_ht - COALESCE(pr.prix_ht, 0)) * bcl.qte)
    FROM bc_lignes bcl
    INNER JOIN bc ON bc.id = bcl.bc_id
    LEFT JOIN prix_reference pr ON pr.article_id = bcl.article_id 
      AND pr.fournisseur_id = bc.fournisseur_id
      AND pr.date_effet <= bc.emis_le
      AND pr.id = (
        SELECT id FROM prix_reference pr2
        WHERE pr2.article_id = bcl.article_id
          AND pr2.fournisseur_id = bc.fournisseur_id
          AND pr2.date_effet <= bc.emis_le
        ORDER BY pr2.date_effet DESC LIMIT 1
      )
    WHERE bc.tenant_id = t.id
      AND bc.emis_le >= CURRENT_DATE - INTERVAL '90 days'
  ), 0) AS ecarts_prix_total
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
    FROM bc
    WHERE bc.tenant_id = t.id AND bc.emis_le = d.day
  ), 0) AS bc_emises,
  -- BL reçus ce jour
  COALESCE((
    SELECT COUNT(*)
    FROM bl
    WHERE bl.tenant_id = t.id AND bl.recu_le = d.day AND bl.statut = 'recu'
  ), 0) AS bl_recus,
  -- Montant BC émises ce jour
  COALESCE((
    SELECT SUM(bc.montant_ht)
    FROM bc
    WHERE bc.tenant_id = t.id AND bc.emis_le = d.day
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
    SELECT AVG(EXTRACT(DAY FROM (bl.recu_le - bc.emis_le)))
    FROM bc bc2
    INNER JOIN bl ON bl.bc_id = bc2.id
    WHERE bc2.tenant_id = f.tenant_id
      AND bc2.fournisseur_id = f.id
      AND bc2.emis_le IS NOT NULL
      AND bl.recu_le IS NOT NULL
      AND bl.statut = 'recu'
      AND bl.recu_le >= CURRENT_DATE - INTERVAL '90 days'
  ), 0) AS lead_time_moyen_jours
FROM fournisseurs f
LEFT JOIN contrats c ON c.fournisseur_id = f.id AND c.tenant_id = f.tenant_id AND c.actif = true
LEFT JOIN bc ON bc.fournisseur_id = f.id AND bc.tenant_id = f.tenant_id
WHERE f.actif = true
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
  bc.ref AS bc_numero,
  bc.montant_ht,
  bc.emis_le AS date_emission,
  bc.statut,
  -- Délai depuis émission (jours)
  EXTRACT(DAY FROM (CURRENT_DATE - bc.emis_le)) AS delai_jours,
  -- Fournisseur
  f.code AS fournisseur_code,
  f.nom AS fournisseur_nom,
  -- Contrat associé
  c.ref AS contrat_numero,
  c.objet AS contrat_objet,
  -- Bureau (pour filtrage ABAC)
  b.code AS bureau_code,
  -- Chantier (pour filtrage ABAC)
  ch.code AS chantier_code
FROM bc
LEFT JOIN fournisseurs f ON f.id = bc.fournisseur_id
LEFT JOIN contrats c ON c.id = bc.contrat_id
LEFT JOIN bureaux b ON b.id = bc.bureau_id
LEFT JOIN chantiers ch ON ch.id = bc.chantier_id
WHERE bc.statut = 'emis'
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
-- ces vues lors des modifications sur contrats, bc, bl, fournisseurs, articles, prix_reference

-- Filtrage ABAC :
-- - rm_achats_commandes_ouvertes : filtrable par bureau_code et chantier_code
-- - rm_achats_fournisseurs : agrégation au tenant (pas de filtrage bureau/chantier)
-- - rm_achats_overview : agrégation au tenant
-- - rm_achats_trends : agrégation au tenant
