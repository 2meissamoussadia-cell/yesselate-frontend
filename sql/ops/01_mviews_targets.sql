-- P20 – Ops & Remédiations : mapping vues matérialisées ↔ domaines
-- Utilisé pour refresh ciblé, backfill incrémental, recalcul sélectif

CREATE TABLE IF NOT EXISTS ops_mview_targets (
  view_name   TEXT PRIMARY KEY,
  domain      TEXT NOT NULL,
  "order"     INT NOT NULL DEFAULT 0,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ops_mview_targets IS 'P20: Mapping MView ↔ domaine pour refresh ciblé / backfill';

-- Données initiales (alignées sur refreshMViewsWorker / refreshMViewsCron)
INSERT INTO ops_mview_targets (view_name, domain, "order", description) VALUES
  ('rm_kpis_overview', 'overview', 1, 'KPIs synthèse'),
  ('rm_trends_daily', 'overview', 2, 'Tendances quotidiennes'),
  ('rm_kpis_projets', 'projets', 3, 'KPIs projets'),
  ('rm_kpis_demandes', 'demandes', 4, 'KPIs demandes'),
  ('rm_finance_overview', 'finance', 5, 'Finance synthèse'),
  ('rm_finance_trends', 'finance', 6, 'Finance tendances'),
  ('rm_achats_overview', 'achats', 7, 'Achats synthèse'),
  ('rm_achats_trends', 'achats', 8, 'Achats tendances'),
  ('rm_achats_fournisseurs', 'achats', 9, 'Achats fournisseurs'),
  ('rm_achats_open_orders', 'achats', 10, 'Achats commandes ouvertes'),
  ('rm_stocks_overview', 'stocks', 11, 'Stocks synthèse'),
  ('rm_stocks_trends', 'stocks', 12, 'Stocks tendances'),
  ('rm_stocks_ruptures', 'stocks', 13, 'Stocks ruptures'),
  ('rm_materiel_overview', 'materiel', 14, 'Matériel synthèse'),
  ('rm_materiel_trends', 'materiel', 15, 'Matériel tendances'),
  ('rm_materiel_backlog_maintenance', 'materiel', 16, 'Matériel backlog maintenance'),
  ('rm_reporting_overview', 'reporting', 17, 'Reporting synthèse'),
  ('rm_reporting_dso', 'reporting', 18, 'Reporting DSO'),
  ('rm_reporting_bureau', 'reporting', 19, 'Reporting par bureau'),
  ('rm_reporting_chantier', 'reporting', 20, 'Reporting par chantier'),
  ('rm_compliance_overview', 'compliance', 21, 'Conformité synthèse'),
  ('rm_compliance_visas_backlog', 'compliance', 22, 'Conformité visas backlog'),
  ('rm_compliance_missing_docs', 'compliance', 23, 'Conformité pièces manquantes')
ON CONFLICT (view_name) DO UPDATE SET
  domain = EXCLUDED.domain,
  "order" = EXCLUDED."order",
  description = EXCLUDED.description;
