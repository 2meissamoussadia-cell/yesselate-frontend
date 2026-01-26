-- 18_rbac_flags.sql
-- Phase P10: RBAC/ABAC runtime + Feature Flags par tenant
-- Schéma simplifié et multi-tenant

-- ============================================================================
-- RÔLES & PERMISSIONS
-- ============================================================================

-- Rôles (multi-tenant)
CREATE TABLE IF NOT EXISTS rbac_roles (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  code      TEXT NOT NULL,
  label     TEXT NOT NULL,
  UNIQUE (tenant_id, code)
);

CREATE INDEX IF NOT EXISTS idx_rbac_roles_tenant ON rbac_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rbac_roles_code ON rbac_roles(code);

-- Permissions (globales, partagées entre tous les tenants)
CREATE TABLE IF NOT EXISTS rbac_permissions (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code      TEXT NOT NULL UNIQUE, -- ex: 'dashboard:read','export:read','achats:view','stocks:view',...
  label     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rbac_permissions_code ON rbac_permissions(code);

-- Lien rôle → permissions
CREATE TABLE IF NOT EXISTS rbac_role_permissions (
  role_id UUID NOT NULL REFERENCES rbac_roles(id) ON DELETE CASCADE,
  perm_id UUID NOT NULL REFERENCES rbac_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, perm_id)
);

CREATE INDEX IF NOT EXISTS idx_rbac_role_perms_role ON rbac_role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_rbac_role_perms_perm ON rbac_role_permissions(perm_id);

-- Affectations utilisateur → rôles (avec scopes optionnels)
CREATE TABLE IF NOT EXISTS rbac_user_assignments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL,
  role_id      UUID NOT NULL REFERENCES rbac_roles(id) ON DELETE CASCADE,
  -- Scopes optionnels (filtrage ABAC)
  bureau_code  TEXT,
  chantier_code TEXT
);

CREATE INDEX IF NOT EXISTS idx_rbac_user_assign_tenant_user ON rbac_user_assignments(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_rbac_user_assign_role ON rbac_user_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_rbac_user_assign_bureau ON rbac_user_assignments(tenant_id, bureau_code) WHERE bureau_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_rbac_user_assign_chantier ON rbac_user_assignments(tenant_id, chantier_code) WHERE chantier_code IS NOT NULL;

-- ============================================================================
-- FEATURE FLAGS (par tenant)
-- ============================================================================

-- Feature flags globaux (définition)
CREATE TABLE IF NOT EXISTS feature_flags (
  code  TEXT PRIMARY KEY, -- ex: 'module.achats','module.stocks','module.materiel','module.reporting','module.compliance'
  label TEXT NOT NULL
);

-- Activation des feature flags par tenant
CREATE TABLE IF NOT EXISTS tenant_feature_flags (
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  flag_code TEXT NOT NULL REFERENCES feature_flags(code) ON DELETE CASCADE,
  enabled   BOOLEAN NOT NULL DEFAULT true,
  PRIMARY KEY (tenant_id, flag_code)
);

CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_tenant ON tenant_feature_flags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_feature_flags_enabled ON tenant_feature_flags(tenant_id, enabled) WHERE enabled = true;

-- ============================================================================
-- AUDIT DES DÉCISIONS D'AUTORISATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS authorization_audit (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  resource    TEXT NOT NULL, -- 'dashboard', 'export', 'achats', etc.
  action      TEXT NOT NULL, -- 'read', 'view', 'export', etc.
  route_main  TEXT,
  route_sub   TEXT,
  route_leaf  TEXT,
  decision    TEXT NOT NULL CHECK (decision IN ('allowed', 'denied')),
  reason      TEXT, -- pourquoi autorisé/refusé (rôle, permission, scope, feature flag)
  roles_used  TEXT[], -- rôles utilisés pour la décision
  scopes_used TEXT[], -- scopes utilisés pour la décision
  when_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  req_id      TEXT -- corrélation avec x-request-id
);

CREATE INDEX IF NOT EXISTS idx_authorization_audit_tenant ON authorization_audit(tenant_id);
CREATE INDEX IF NOT EXISTS idx_authorization_audit_user ON authorization_audit(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_authorization_audit_resource ON authorization_audit(resource);
CREATE INDEX IF NOT EXISTS idx_authorization_audit_decision ON authorization_audit(decision);
CREATE INDEX IF NOT EXISTS idx_authorization_audit_when_at ON authorization_audit(when_at DESC);
CREATE INDEX IF NOT EXISTS idx_authorization_audit_req_id ON authorization_audit(req_id);

-- ============================================================================
-- DONNÉES INITIALES
-- ============================================================================

-- Permissions de base (globales)
INSERT INTO rbac_permissions (code, label) VALUES
  ('dashboard:read', 'Lire le dashboard'),
  ('export:read', 'Exporter les données'),
  ('achats:view', 'Voir le module Achats'),
  ('achats:write', 'Modifier les achats'),
  ('stocks:view', 'Voir le module Stocks'),
  ('stocks:write', 'Modifier les stocks'),
  ('materiel:view', 'Voir le module Matériel'),
  ('materiel:write', 'Modifier le matériel'),
  ('reporting:view', 'Voir le module Reporting'),
  ('compliance:view', 'Voir le module Conformité'),
  ('compliance:write', 'Modifier la conformité')
ON CONFLICT (code) DO NOTHING;

-- Feature flags globaux
INSERT INTO feature_flags (code, label) VALUES
  ('module.achats', 'Module Achats'),
  ('module.stocks', 'Module Stocks'),
  ('module.materiel', 'Module Matériel'),
  ('module.reporting', 'Module Reporting'),
  ('module.compliance', 'Module Conformité')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- COMMENTAIRES
-- ============================================================================

COMMENT ON TABLE rbac_roles IS 'Rôles par tenant (multi-tenant)';
COMMENT ON TABLE rbac_permissions IS 'Permissions globales (partagées entre tous les tenants)';
COMMENT ON TABLE rbac_role_permissions IS 'Assignation des permissions aux rôles';
COMMENT ON TABLE rbac_user_assignments IS 'Assignation des rôles aux utilisateurs avec scopes optionnels (bureau/chantier)';
COMMENT ON TABLE feature_flags IS 'Feature flags globaux (définition)';
COMMENT ON TABLE tenant_feature_flags IS 'Activation des feature flags par tenant';
COMMENT ON TABLE authorization_audit IS 'Audit des décisions d''autorisation pour conformité';
