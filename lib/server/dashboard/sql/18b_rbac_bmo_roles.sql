-- 18b_rbac_bmo_roles.sql
-- Rôles BMO (DG, Chef Chantier, Ouvrier, Client) et permissions granulaires
-- À exécuter après 18_rbac_flags.sql

-- ============================================================================
-- PERMISSIONS BMO (granulaires)
-- ============================================================================

INSERT INTO rbac_permissions (code, label) VALUES
  ('paiement:validate', 'Valider un paiement'),
  ('chantier:archive', 'Archiver un chantier'),
  ('budget:update', 'Modifier le budget'),
  ('chantier:read', 'Voir un chantier'),
  ('chantier:write', 'Modifier un chantier')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- RÔLES BMO (création par tenant — exemple pour 1 tenant)
-- Utiliser le premier tenant existant ; en production, créer les rôles par tenant
-- ============================================================================

-- Rôles BMO (code métier)
DO $$
DECLARE
  tid UUID;
  rid_dg UUID;
  rid_chef UUID;
  rid_ouvrier UUID;
  rid_client UUID;
  pid_dash_read UUID;
  pid_export UUID;
  pid_paiement_val UUID;
  pid_chantier_arch UUID;
  pid_budget_up UUID;
  pid_chantier_read UUID;
  pid_chantier_write UUID;
BEGIN
  SELECT id INTO tid FROM tenants LIMIT 1;
  IF tid IS NULL THEN
    RAISE NOTICE 'Aucun tenant: créer un tenant avant d''exécuter le seed des rôles BMO.';
    RETURN;
  END IF;

  -- Créer les rôles BMO pour ce tenant
  INSERT INTO rbac_roles (tenant_id, code, label) VALUES
    (tid, 'dg', 'Directeur Général – voit tout'),
    (tid, 'chef_chantier', 'Chef de chantier – voit ses chantiers'),
    (tid, 'ouvrier', 'Ouvrier – voit sa mission'),
    (tid, 'client', 'Client – voit son chantier uniquement')
  ON CONFLICT (tenant_id, code) DO NOTHING;

  -- IDs des rôles
  SELECT id INTO rid_dg   FROM rbac_roles WHERE tenant_id = tid AND code = 'dg';
  SELECT id INTO rid_chef FROM rbac_roles WHERE tenant_id = tid AND code = 'chef_chantier';
  SELECT id INTO rid_ouvrier FROM rbac_roles WHERE tenant_id = tid AND code = 'ouvrier';
  SELECT id INTO rid_client FROM rbac_roles WHERE tenant_id = tid AND code = 'client';

  -- IDs des permissions
  SELECT id INTO pid_dash_read   FROM rbac_permissions WHERE code = 'dashboard:read';
  SELECT id INTO pid_export     FROM rbac_permissions WHERE code = 'export:read';
  SELECT id INTO pid_paiement_val FROM rbac_permissions WHERE code = 'paiement:validate';
  SELECT id INTO pid_chantier_arch FROM rbac_permissions WHERE code = 'chantier:archive';
  SELECT id INTO pid_budget_up  FROM rbac_permissions WHERE code = 'budget:update';
  SELECT id INTO pid_chantier_read FROM rbac_permissions WHERE code = 'chantier:read';
  SELECT id INTO pid_chantier_write FROM rbac_permissions WHERE code = 'chantier:write';

  -- DG : tout
  IF rid_dg IS NOT NULL THEN
    INSERT INTO rbac_role_permissions (role_id, perm_id)
    SELECT rid_dg, id FROM rbac_permissions
    ON CONFLICT (role_id, perm_id) DO NOTHING;
  END IF;

  -- Chef chantier : dashboard, export, chantier read/write/archive (scope = ses chantiers)
  IF rid_chef IS NOT NULL THEN
    INSERT INTO rbac_role_permissions (role_id, perm_id) VALUES
      (rid_chef, pid_dash_read),
      (rid_chef, pid_export),
      (rid_chef, pid_chantier_read),
      (rid_chef, pid_chantier_write),
      (rid_chef, pid_chantier_arch)
    ON CONFLICT (role_id, perm_id) DO NOTHING;
  END IF;

  -- Ouvrier : dashboard, chantier read (scope = sa mission / son chantier)
  IF rid_ouvrier IS NOT NULL THEN
    INSERT INTO rbac_role_permissions (role_id, perm_id) VALUES
      (rid_ouvrier, pid_dash_read),
      (rid_ouvrier, pid_chantier_read)
    ON CONFLICT (role_id, perm_id) DO NOTHING;
  END IF;

  -- Client : dashboard, chantier read (scope = son chantier uniquement)
  IF rid_client IS NOT NULL THEN
    INSERT INTO rbac_role_permissions (role_id, perm_id) VALUES
      (rid_client, pid_dash_read),
      (rid_client, pid_chantier_read)
    ON CONFLICT (role_id, perm_id) DO NOTHING;
  END IF;

  RAISE NOTICE 'Rôles BMO créés pour tenant %', tid;
END $$;

COMMENT ON TABLE rbac_user_assignments IS 'Assignation des rôles aux utilisateurs avec scopes optionnels (bureau_code, chantier_code). DG: pas de scope = tout. Chef/Ouvrier/Client: chantier_code = chantiers autorisés.';
