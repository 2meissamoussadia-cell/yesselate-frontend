-- lib/server/security/rls.sql
-- Phase P18: Row Level Security (RLS) pour isolation multi-tenant et ABAC

-- ============================================================================
-- 1. ACTIVATION RLS SUR TABLES CRITIQUES
-- ============================================================================

-- Activer RLS sur les tables principales
ALTER TABLE IF EXISTS tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bureaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chantiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS demandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS situations_travaux ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS materiel ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contrats_mp ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS alert_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 2. POLITIQUES RLS PAR TENANT
-- ============================================================================

-- Fonction helper pour obtenir le tenant_id depuis le contexte
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
  SELECT current_setting('app.tenant_id', true)::UUID;
$$ LANGUAGE sql STABLE;

-- Fonction helper pour obtenir les scopes depuis le contexte
CREATE OR REPLACE FUNCTION current_user_scopes() RETURNS TEXT[] AS $$
  SELECT string_to_array(current_setting('app.user_scopes', true), ',')::TEXT[];
$$ LANGUAGE sql STABLE;

-- Politique: Isolation par tenant (toutes les tables)
CREATE POLICY tenant_isolation_tenants ON tenants
  FOR ALL
  USING (id = current_tenant_id());

CREATE POLICY tenant_isolation_bureaux ON bureaux
  FOR ALL
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_chantiers ON chantiers
  FOR ALL
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_projets ON projets
  FOR ALL
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_demandes ON demandes
  FOR ALL
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_validations ON validations
  FOR ALL
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_factures ON factures
  FOR ALL
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_situations_travaux ON situations_travaux
  FOR ALL
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_stock ON stock
  FOR ALL
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_materiel ON materiel
  FOR ALL
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_contrats_mp ON contrats_mp
  FOR ALL
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_alert_rules ON alert_rules
  FOR ALL
  USING (tenant_id = current_tenant_id());

CREATE POLICY tenant_isolation_alert_events ON alert_events
  FOR ALL
  USING (tenant_id = current_tenant_id());

-- ============================================================================
-- 3. POLITIQUES ABAC (BUREAU/CHANTIER)
-- ============================================================================

-- Politique: Accès aux bureaux selon scopes
CREATE POLICY bureau_scope_access ON bureaux
  FOR SELECT
  USING (
    tenant_id = current_tenant_id() AND
    (
      -- Admin peut tout voir
      current_setting('app.user_role', true) = 'admin' OR
      -- Ou le bureau est dans les scopes
      code = ANY(
        SELECT unnest(string_to_array(scope, ':'))[2]
        FROM unnest(current_user_scopes()) AS scope
        WHERE scope LIKE 'bureau:%'
      )
    )
  );

-- Politique: Accès aux chantiers selon scopes
CREATE POLICY chantier_scope_access ON chantiers
  FOR SELECT
  USING (
    tenant_id = current_tenant_id() AND
    (
      current_setting('app.user_role', true) = 'admin' OR
      code = ANY(
        SELECT unnest(string_to_array(scope, ':'))[2]
        FROM unnest(current_user_scopes()) AS scope
        WHERE scope LIKE 'chantier:%'
      )
    )
  );

-- Politique: Accès aux projets selon bureau/chantier
CREATE POLICY projet_scope_access ON projets
  FOR SELECT
  USING (
    tenant_id = current_tenant_id() AND
    (
      current_setting('app.user_role', true) = 'admin' OR
      bureau_code IS NULL OR
      bureau_code = ANY(
        SELECT unnest(string_to_array(scope, ':'))[2]
        FROM unnest(current_user_scopes()) AS scope
        WHERE scope LIKE 'bureau:%'
      ) OR
      chantier_code = ANY(
        SELECT unnest(string_to_array(scope, ':'))[2]
        FROM unnest(current_user_scopes()) AS scope
        WHERE scope LIKE 'chantier:%'
      )
    )
  );

-- ============================================================================
-- 4. FONCTION POUR SETTER LE CONTEXTE (appelée depuis l'API)
-- ============================================================================

-- Fonction pour définir le contexte de sécurité dans la session
CREATE OR REPLACE FUNCTION set_security_context(
  p_tenant_id UUID,
  p_user_id TEXT,
  p_user_role TEXT,
  p_user_scopes TEXT[]
) RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.tenant_id', p_tenant_id::TEXT, true);
  PERFORM set_config('app.user_id', p_user_id, true);
  PERFORM set_config('app.user_role', p_user_role, true);
  PERFORM set_config('app.user_scopes', array_to_string(p_user_scopes, ','), true);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. COMMENTAIRES
-- ============================================================================

COMMENT ON FUNCTION current_tenant_id() IS 'Retourne le tenant_id depuis le contexte de sécurité (RLS P18)';
COMMENT ON FUNCTION current_user_scopes() IS 'Retourne les scopes utilisateur depuis le contexte (ABAC P18)';
COMMENT ON FUNCTION set_security_context(UUID, TEXT, TEXT, TEXT[]) IS 'Définit le contexte de sécurité pour RLS/ABAC (appelée depuis API avant chaque requête)';
