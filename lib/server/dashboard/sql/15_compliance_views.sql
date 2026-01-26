-- Indicateurs synthèse conformité (tenant)
DROP MATERIALIZED VIEW IF EXISTS rm_compliance_overview;
CREATE MATERIALIZED VIEW rm_compliance_overview AS
SELECT
  t.id AS tenant_id,
  -- % procédures avec pièces clés complètes (DCE+CCAP+CCAG) pour la période récente
  COALESCE((
    SELECT COUNT(*) FILTER (
      WHERE EXISTS(SELECT 1 FROM pieces_conformite p WHERE p.tenant_id=t.id AND p.ref_objet = CONCAT('procedure:',proc.id) AND p.type='DCE')
        AND EXISTS(SELECT 1 FROM pieces_conformite p WHERE p.tenant_id=t.id AND p.ref_objet = CONCAT('procedure:',proc.id) AND p.type='CCAP')
        AND EXISTS(SELECT 1 FROM pieces_conformite p WHERE p.tenant_id=t.id AND p.ref_objet = CONCAT('procedure:',proc.id) AND p.type='CCAG')
    )::float / NULLIF(COUNT(*),0)
    FROM procedures_mp proc WHERE proc.tenant_id = t.id
      AND (proc.date_pub IS NULL OR proc.date_pub >= (NOW() - INTERVAL '180 day')::date)
  ),0) AS ratio_completude_procedure,

  -- délais moyens de visa (contrats+avenants) en jours
  COALESCE((
    SELECT AVG(EXTRACT(DAY FROM (MAX(v.horodatage) - MIN(v.horodatage))))
    FROM visa_workflow v
    WHERE v.tenant_id = t.id AND v.statut IN ('approuve','rejete')
    GROUP BY v.ref_objet
  ),0) AS delai_visa_moy_j,

  -- lots non attribués
  (SELECT COUNT(*) FROM lots_mp l WHERE l.tenant_id=t.id AND l.statut='ouvert') AS lots_non_attribues,

  -- avenants en attente de visa
  (SELECT COUNT(*) FROM avenants_mp a WHERE a.tenant_id=t.id AND a.statut='en_visa') AS avenants_en_visa,

  -- pièces manquantes (contrats en visa sans CCAP/CCAG)
  (SELECT COUNT(*)
     FROM contrats_mp c
     WHERE c.tenant_id=t.id AND c.statut='en_visa'
       AND NOT EXISTS (SELECT 1 FROM pieces_conformite p WHERE p.tenant_id=t.id AND p.ref_objet = CONCAT('contrat:',c.id) AND p.type='CCAP')
       OR NOT EXISTS (SELECT 1 FROM pieces_conformite p WHERE p.tenant_id=t.id AND p.ref_objet = CONCAT('contrat:',c.id) AND p.type='CCAG')
  ) AS contrats_pieces_incompletes
FROM tenants t
WITH NO DATA;

CREATE UNIQUE INDEX pk_rm_compliance_overview ON rm_compliance_overview(tenant_id);

-- Backlog de visas (file d'attente)
DROP MATERIALIZED VIEW IF EXISTS rm_compliance_visas_backlog;
CREATE MATERIALIZED VIEW rm_compliance_visas_backlog AS
SELECT
  v.tenant_id,
  v.ref_objet,
  MIN(v.etape) FILTER (WHERE v.statut='en_attente') AS etape_en_cours,
  STRING_AGG(DISTINCT v.role_requis, '->' ORDER BY v.etape) AS chaine_visa,
  COUNT(*) FILTER (WHERE v.statut='en_attente') AS nb_etapes_restantes
FROM visa_workflow v
GROUP BY v.tenant_id, v.ref_objet
WITH NO DATA;

CREATE INDEX idx_rm_compliance_visas_backlog ON rm_compliance_visas_backlog(tenant_id);

-- Pièces manquantes par objet
DROP MATERIALIZED VIEW IF EXISTS rm_compliance_missing_docs;
CREATE MATERIALIZED VIEW rm_compliance_missing_docs AS
SELECT
  c.tenant_id,
  c.id AS contrat_id,
  (NOT EXISTS(SELECT 1 FROM pieces_conformite p WHERE p.tenant_id=c.tenant_id AND p.ref_objet=CONCAT('contrat:',c.id) AND p.type='CCAP')) AS manquant_ccap,
  (NOT EXISTS(SELECT 1 FROM pieces_conformite p WHERE p.tenant_id=c.tenant_id AND p.ref_objet=CONCAT('contrat:',c.id) AND p.type='CCAG')) AS manquant_ccag,
  (NOT EXISTS(SELECT 1 FROM pieces_conformite p WHERE p.tenant_id=c.tenant_id AND p.ref_objet=CONCAT('contrat:',c.id) AND p.type='PV'))   AS manquant_pv
FROM contrats_mp c
WITH NO DATA;

CREATE INDEX idx_rm_compliance_missing_docs ON rm_compliance_missing_docs(tenant_id, contrat_id);
