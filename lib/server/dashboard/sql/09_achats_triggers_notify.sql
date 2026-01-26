/**
 * Triggers Event-Driven pour module Achats/Contrats
 * Phase P5: Triggers détaillés pour bc, bl, bc_lignes, bl_lignes, prix_reference, fournisseurs
 * 
 * Ce fichier complète 05_triggers_notify.sql pour une meilleure organisation modulaire
 */

-- Utiliser la fonction notify_dashboard_refresh() déjà définie dans 05_triggers_notify.sql
-- (assumée déjà créée)

-- ============================================================================
-- TRIGGERS ACHATS/CONTRATS (Phase P5)
-- ============================================================================

-- Bons de commande (BC)
DROP TRIGGER IF EXISTS notify_bc_refresh ON bc;
CREATE TRIGGER notify_bc_refresh
  AFTER INSERT OR UPDATE OR DELETE ON bc
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- Lignes de bons de commande (BC lignes)
DROP TRIGGER IF EXISTS notify_bc_lignes_refresh ON bc_lignes;
CREATE TRIGGER notify_bc_lignes_refresh
  AFTER INSERT OR UPDATE OR DELETE ON bc_lignes
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- Bons de livraison (BL)
DROP TRIGGER IF EXISTS notify_bl_refresh ON bl;
CREATE TRIGGER notify_bl_refresh
  AFTER INSERT OR UPDATE OR DELETE ON bl
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- Lignes de bons de livraison (BL lignes)
DROP TRIGGER IF EXISTS notify_bl_lignes_refresh ON bl_lignes;
CREATE TRIGGER notify_bl_lignes_refresh
  AFTER INSERT OR UPDATE OR DELETE ON bl_lignes
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- Fournisseurs
DROP TRIGGER IF EXISTS notify_fournisseurs_refresh ON fournisseurs;
CREATE TRIGGER notify_fournisseurs_refresh
  AFTER INSERT OR UPDATE OR DELETE ON fournisseurs
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- Prix de référence
DROP TRIGGER IF EXISTS notify_prix_reference_refresh ON prix_reference;
CREATE TRIGGER notify_prix_reference_refresh
  AFTER INSERT OR UPDATE OR DELETE ON prix_reference
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Ces triggers déclenchent pg_notify('dashboard_refresh', ...) qui est écouté
-- par le worker Event-Driven (refreshMViewsWorker.ts).
--
-- Mapping domain → MViews (dans refreshMViewsWorker.ts):
-- - bc → ['rm_achats_overview', 'rm_achats_trends', 'rm_achats_open_orders']
-- - bc_lignes → ['rm_achats_overview', 'rm_achats_open_orders']
-- - bl → ['rm_achats_overview', 'rm_achats_trends', 'rm_achats_fournisseurs', 'rm_achats_open_orders']
-- - bl_lignes → ['rm_achats_overview', 'rm_achats_trends', 'rm_achats_fournisseurs', 'rm_achats_open_orders']
-- - fournisseurs → ['rm_achats_fournisseurs', 'rm_achats_open_orders']
-- - prix_reference → ['rm_achats_overview', 'rm_achats_fournisseurs']
--
