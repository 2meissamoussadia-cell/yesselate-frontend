-- 04_finance.sql
-- Phase P3: Tables minimales (évolutives) pour KPIs finance
-- Compatible avec l'architecture P2-C/2 (tenant_id, bureau_code, chantier_code)

-- ============================================================================
-- TABLES FINANCE
-- ============================================================================

-- Situations de travaux (production prévue vs réalisée)
CREATE TABLE IF NOT EXISTS situations_travaux (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  chantier_id UUID REFERENCES chantiers(id),
  periode     DATE NOT NULL,          -- fin de mois
  prevu_ht    NUMERIC(18,2) NOT NULL, -- production prévue
  realise_ht  NUMERIC(18,2) NOT NULL, -- production réalisée (valorisation)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Factures
CREATE TABLE IF NOT EXISTS factures (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  chantier_id UUID REFERENCES chantiers(id),
  numero      TEXT NOT NULL,
  emise_le    DATE NOT NULL,
  echeance_le DATE NOT NULL,
  montant_ht  NUMERIC(18,2) NOT NULL,
  statut      TEXT NOT NULL CHECK (statut IN ('brouillon','emise','payee','annulee')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (tenant_id, numero)
);

-- Encaissements (paiements reçus)
CREATE TABLE IF NOT EXISTS encaissements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  facture_id  UUID REFERENCES factures(id),
  regle_le    DATE NOT NULL,
  montant_ht  NUMERIC(18,2) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index optimisés
CREATE INDEX IF NOT EXISTS idx_sit_tenant_periode ON situations_travaux(tenant_id, periode);
CREATE INDEX IF NOT EXISTS idx_sit_chantier ON situations_travaux(chantier_id);
CREATE INDEX IF NOT EXISTS idx_fac_tenant_emise ON factures(tenant_id, emise_le);
CREATE INDEX IF NOT EXISTS idx_fac_chantier ON factures(chantier_id);
CREATE INDEX IF NOT EXISTS idx_fac_statut ON factures(statut);
CREATE INDEX IF NOT EXISTS idx_enc_tenant_regle ON encaissements(tenant_id, regle_le);
CREATE INDEX IF NOT EXISTS idx_enc_facture ON encaissements(facture_id);

-- ============================================================================
-- VUES MATÉRIALISÉES FINANCE
-- ============================================================================

-- Vue Finance Overview (KPIs agrégés par tenant)
DROP MATERIALIZED VIEW IF EXISTS rm_finance_overview;
CREATE MATERIALIZED VIEW rm_finance_overview AS
SELECT
  t.id AS tenant_id,
  
  -- RAT (Reste à Terminer) : proxy = somme(prevu - realise) positif
  GREATEST(
    (SELECT SUM(s.prevu_ht - s.realise_ht)
     FROM situations_travaux s WHERE s.tenant_id = t.id), 0
  ) AS rat_ht,
  
  -- RAP (Reste à Produire) : proxy = somme(prevu sur la période courante)
  (SELECT COALESCE(SUM(s.prevu_ht), 0)
   FROM situations_travaux s
   WHERE s.tenant_id = t.id
     AND DATE_PART('month', s.periode) = DATE_PART('month', NOW())
     AND DATE_PART('year', s.periode) = DATE_PART('year', NOW())
  ) AS rap_mois_ht,
  
  -- Reste à Facturer = prod réalisée - factures émises (période courante)
  (
    COALESCE((
      SELECT SUM(s.realise_ht)
      FROM situations_travaux s
      WHERE s.tenant_id = t.id
        AND DATE_TRUNC('month', s.periode) = DATE_TRUNC('month', NOW())
    ), 0)
    -
    COALESCE((
      SELECT SUM(f.montant_ht)
      FROM factures f
      WHERE f.tenant_id = t.id
        AND DATE_TRUNC('month', f.emise_le) = DATE_TRUNC('month', NOW())
    ), 0)
  ) AS reste_a_facturer_ht,
  
  -- DSO (Days Sales Outstanding) : approximé = (créances / CA_journalier_moyen)
  (
    COALESCE((
      SELECT SUM(f.montant_ht)
      FROM factures f
      LEFT JOIN encaissements e ON e.facture_id = f.id
      WHERE f.tenant_id = t.id
        AND f.statut IN ('emise')
        AND e.id IS NULL
    ), 0)
    /
    NULLIF(
      COALESCE((
        SELECT SUM(s.realise_ht)
        FROM situations_travaux s
        WHERE s.tenant_id = t.id
          AND s.periode >= (NOW() - INTERVAL '30 day')::date
      ), 0) / 30
    , 0)
  ) AS dso_jours
FROM tenants t
WITH NO DATA;

CREATE UNIQUE INDEX IF NOT EXISTS pk_rm_finance_overview ON rm_finance_overview(tenant_id);

-- Tendances finance (30 derniers jours) : RàF estimé / encaissements / émission
DROP MATERIALIZED VIEW IF EXISTS rm_finance_trends;
CREATE MATERIALIZED VIEW rm_finance_trends AS
WITH dates AS (
  SELECT generate_series((NOW() - INTERVAL '29 day')::date, NOW()::date, INTERVAL '1 day')::date AS day
)
SELECT
  t.id AS tenant_id,
  d.day AS date,
  
  -- Factures émises ce jour
  COALESCE((
    SELECT SUM(f.montant_ht)
    FROM factures f
    WHERE f.tenant_id = t.id AND f.emise_le = d.day
  ), 0) AS facture_emise_ht,
  
  -- Encaissements ce jour
  COALESCE((
    SELECT SUM(e.montant_ht)
    FROM encaissements e
    INNER JOIN factures f ON f.id = e.facture_id
    WHERE e.tenant_id = t.id AND e.regle_le = d.day
  ), 0) AS encaisse_ht,
  
  -- Reste à facturer journalier (proxy cumul sur mois)
  (
    COALESCE((
      SELECT SUM(s.realise_ht)
      FROM situations_travaux s
      WHERE s.tenant_id = t.id
        AND DATE_TRUNC('month', s.periode) = DATE_TRUNC('month', d.day)
    ), 0)
    -
    COALESCE((
      SELECT SUM(f2.montant_ht)
      FROM factures f2
      WHERE f2.tenant_id = t.id
        AND DATE_TRUNC('month', f2.emise_le) = DATE_TRUNC('month', d.day)
    ), 0)
  ) AS raf_journalier_ht
FROM tenants t
CROSS JOIN dates d
WITH NO DATA;

CREATE INDEX IF NOT EXISTS idx_rm_finance_trends_tenant_date ON rm_finance_trends(tenant_id, date);

-- ============================================================================
-- NOTES
-- ============================================================================

-- Les triggers pour Event-Driven Refresh sont définis dans 05_triggers_notify.sql
-- Appliquer ce fichier après 04_finance.sql pour activer les notifications.

-- Après création, rafraîchir les vues :
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finance_overview;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finance_trends;

-- Les triggers pour Event-Driven Refresh sont définis dans 05_triggers_notify.sql
