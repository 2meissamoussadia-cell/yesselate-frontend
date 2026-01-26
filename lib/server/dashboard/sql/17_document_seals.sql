-- 17_document_seals.sql
-- Phase P9: Table pour le scellement de documents (hash SHA-256 + horodatage)

CREATE TABLE IF NOT EXISTS document_seals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  hash_sha256 TEXT NOT NULL UNIQUE,
  format      TEXT NOT NULL, -- 'csv', 'json', 'excel', 'pdf'
  route_main  TEXT,
  route_sub   TEXT,
  route_leaf  TEXT,
  when_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  req_id      TEXT,
  signed_at   TIMESTAMPTZ,
  signature_provider TEXT, -- 'eIDAS', 'certificat_interne', etc.
  signature_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_document_seals_tenant ON document_seals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_document_seals_hash ON document_seals(hash_sha256);
CREATE INDEX IF NOT EXISTS idx_document_seals_when_at ON document_seals(when_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_seals_route ON document_seals(tenant_id, route_main, route_sub, route_leaf);
