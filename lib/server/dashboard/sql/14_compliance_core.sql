-- Procédures (AO/MAPA) & lots
CREATE TABLE IF NOT EXISTS procedures_mp (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('AO','MAPA','Consultation')),
  objet       TEXT NOT NULL,
  bureau_id   UUID REFERENCES bureaux(id),
  chantier_id UUID REFERENCES chantiers(id),
  date_pub    DATE,
  date_limite DATE,
  statut      TEXT NOT NULL DEFAULT 'brouillon', -- 'brouillon','publiee','attribuee','cloturee','annulee'
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS lots_mp (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  procedure_id UUID NOT NULL REFERENCES procedures_mp(id) ON DELETE CASCADE,
  numero      INT NOT NULL,
  objet       TEXT NOT NULL,
  montant_estime NUMERIC(18,2),
  attributaire  TEXT,
  attribue_le   DATE,
  statut        TEXT NOT NULL DEFAULT 'ouvert' -- 'ouvert','attribue','infructueux','sans_suite'
);

-- Pièces (DCE/CCAP/CCAG/attestations), versionnées & horodatées
CREATE TABLE IF NOT EXISTS pieces_conformite (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ref_objet   TEXT NOT NULL,             -- 'procedure:ID' | 'contrat:ID' | 'avenant:ID' | etc.
  type        TEXT NOT NULL,             -- 'DCE','CCAP','CCAG','Attestation','PV','OS'
  nom_fichier TEXT NOT NULL,
  hash_sha256 TEXT NOT NULL,
  version     INT  NOT NULL DEFAULT 1,
  date_depot  TIMESTAMPTZ NOT NULL DEFAULT now(),
  depot_par   TEXT
);

-- Contrats/avenants/OS
CREATE TABLE IF NOT EXISTS contrats_mp (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code        TEXT NOT NULL,
  procedure_id UUID REFERENCES procedures_mp(id),
  objet       TEXT NOT NULL,
  montant_ht  NUMERIC(18,2) NOT NULL DEFAULT 0,
  date_sign   DATE,
  statut      TEXT NOT NULL DEFAULT 'en_visa',  -- 'en_visa','valide','rejete','archive'
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS avenants_mp (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contrat_id  UUID NOT NULL REFERENCES contrats_mp(id) ON DELETE CASCADE,
  ref         TEXT NOT NULL,
  montant_ht  NUMERIC(18,2) NOT NULL DEFAULT 0,
  date_sign   DATE,
  statut      TEXT NOT NULL DEFAULT 'en_visa'
);

CREATE TABLE IF NOT EXISTS ordres_service_mp (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contrat_id  UUID NOT NULL REFERENCES contrats_mp(id) ON DELETE CASCADE,
  ref         TEXT NOT NULL,
  date_os     DATE NOT NULL,
  objet       TEXT,
  statut      TEXT NOT NULL DEFAULT 'actif'
);

-- Workflows de visa (chaîne d'approbation)
CREATE TABLE IF NOT EXISTS visa_workflow (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  ref_objet   TEXT NOT NULL,          -- ex: 'contrat:UUID'/'avenant:UUID'
  etape       INT  NOT NULL,
  role_requis TEXT NOT NULL,          -- 'acheteur','juridique','controle','ordonnateur'
  statut      TEXT NOT NULL DEFAULT 'en_attente', -- 'en_attente','approuve','rejete'
  actor_id    TEXT,
  horodatage  TIMESTAMPTZ
);

-- Journal d'audit (écritures techniques & métiers)
CREATE TABLE IF NOT EXISTS audit_traces (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sujet       TEXT NOT NULL,          -- 'piece','visa','contrat','procedure', etc.
  ref_objet   TEXT NOT NULL,
  action      TEXT NOT NULL,          -- 'depot','visa','rejet','signature','publication'
  who         TEXT,
  when_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  meta        JSONB
);

CREATE INDEX IF NOT EXISTS idx_procedures_mp_tenant ON procedures_mp(tenant_id);
CREATE INDEX IF NOT EXISTS idx_pieces_conformite_ref ON pieces_conformite(tenant_id, ref_objet);
CREATE INDEX IF NOT EXISTS idx_contrats_mp_tenant ON contrats_mp(tenant_id);
CREATE INDEX IF NOT EXISTS idx_visa_workflow_objet ON visa_workflow(tenant_id, ref_objet);
CREATE INDEX IF NOT EXISTS idx_audit_traces_tenant ON audit_traces(tenant_id, when_at);
