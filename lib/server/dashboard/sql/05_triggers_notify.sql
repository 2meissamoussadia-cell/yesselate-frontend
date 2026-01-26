-- 05_triggers_notify.sql
-- Phase P3: Triggers pour Event-Driven Refresh (version simplifiée)
-- Notifie les changements via pg_notify() pour rafraîchir les MViews ciblées

-- Fonction de notification
CREATE OR REPLACE FUNCTION notify_dashboard_refresh() RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  -- On encode le type de domaine modifié (table => domain)
  payload := json_build_object(
    'domain', TG_TABLE_NAME,  -- ex: 'projets', 'demandes', 'factures', ...
    'tenant_id', COALESCE(NEW.tenant_id, OLD.tenant_id)  -- Support INSERT/UPDATE/DELETE
  );
  PERFORM pg_notify('dashboard_refresh', payload::text);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Brancher sur les tables pertinentes (opérationnelles)
DROP TRIGGER IF EXISTS trg_refresh_projets ON projets;
CREATE TRIGGER trg_refresh_projets
  AFTER INSERT OR UPDATE OR DELETE ON projets
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_demandes ON demandes;
CREATE TRIGGER trg_refresh_demandes
  AFTER INSERT OR UPDATE OR DELETE ON demandes
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_validations ON validations;
CREATE TRIGGER trg_refresh_validations
  AFTER INSERT OR UPDATE OR DELETE ON validations
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- Brancher sur les tables finance
DROP TRIGGER IF EXISTS trg_refresh_finance_sit ON situations_travaux;
CREATE TRIGGER trg_refresh_finance_sit
  AFTER INSERT OR UPDATE OR DELETE ON situations_travaux
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_finance_fac ON factures;
CREATE TRIGGER trg_refresh_finance_fac
  AFTER INSERT OR UPDATE OR DELETE ON factures
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_finance_enc ON encaissements;
CREATE TRIGGER trg_refresh_finance_enc
  AFTER INSERT OR UPDATE OR DELETE ON encaissements
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- Brancher sur les tables métier (optionnel, selon besoins)
DROP TRIGGER IF EXISTS trg_refresh_risques ON risques;
CREATE TRIGGER trg_refresh_risques
  AFTER INSERT OR UPDATE OR DELETE ON risques
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_blocages ON blocages;
CREATE TRIGGER trg_refresh_blocages
  AFTER INSERT OR UPDATE OR DELETE ON blocages
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_decisions ON decisions;
CREATE TRIGGER trg_refresh_decisions
  AFTER INSERT OR UPDATE OR DELETE ON decisions
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- Phase P5: Triggers ERP Achats/Contrats
-- NOTE: Les triggers détaillés pour bc, bl, bc_lignes, bl_lignes, prix_reference, fournisseurs
-- sont maintenant dans 09_achats_triggers_notify.sql pour une meilleure organisation modulaire

DROP TRIGGER IF EXISTS notify_contrats_refresh ON contrats;
CREATE TRIGGER notify_contrats_refresh
  AFTER INSERT OR UPDATE OR DELETE ON contrats
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS notify_articles_refresh ON articles;
CREATE TRIGGER notify_articles_refresh
  AFTER INSERT OR UPDATE OR DELETE ON articles
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS notify_stocks_refresh ON stocks;
CREATE TRIGGER notify_stocks_refresh
  AFTER INSERT OR UPDATE OR DELETE ON stocks
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS notify_mouvements_refresh ON mouvements_stock;
CREATE TRIGGER notify_mouvements_refresh
  AFTER INSERT OR UPDATE OR DELETE ON mouvements_stock
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS notify_materiel_refresh ON materiel;
CREATE TRIGGER notify_materiel_refresh
  AFTER INSERT OR UPDATE OR DELETE ON materiel
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS notify_maintenance_refresh ON maintenance;
CREATE TRIGGER notify_maintenance_refresh
  AFTER INSERT OR UPDATE OR DELETE ON maintenance
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- ============================================================================
-- NOTES
-- ============================================================================

-- Format du payload :
-- {
--   "domain": "projets",  -- nom de la table modifiée
--   "tenant_id": "uuid"   -- tenant concerné
-- }
--
-- Le worker écoute le canal 'dashboard_refresh' et rafraîchit les vues
-- matérialisées concernées selon le mapping MVIEWS_BY_DOMAIN.
