-- P20 – Ops & Remédiations : permission ops:execute pour runbooks
-- À exécuter après 18_rbac_flags.sql (rbac_permissions doit exister)

INSERT INTO rbac_permissions (code, label) VALUES
  ('ops:execute', 'Exécuter les playbooks ops (runbooks, approbations)')
ON CONFLICT (code) DO NOTHING;
