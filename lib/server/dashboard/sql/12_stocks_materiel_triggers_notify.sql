-- 12_stocks_materiel_triggers_notify.sql
-- Phase P6: Triggers Event-Driven pour module Stocks & Matériel
-- 
-- Ce fichier complète 05_triggers_notify.sql pour une meilleure organisation modulaire

-- Utiliser la fonction notify_dashboard_refresh() déjà définie dans 05_triggers_notify.sql
-- (assumée déjà créée)

-- ============================================================================
-- TRIGGERS STOCKS & MATÉRIEL (Phase P6)
-- ============================================================================

-- Stock
DROP TRIGGER IF EXISTS trg_refresh_stock ON stock;
CREATE TRIGGER trg_refresh_stock
  AFTER INSERT OR UPDATE OR DELETE ON stock
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- Mouvements de stock
DROP TRIGGER IF EXISTS trg_refresh_ms ON mouvements_stock;
CREATE TRIGGER trg_refresh_ms
  AFTER INSERT OR UPDATE OR DELETE ON mouvements_stock
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- Matériel
DROP TRIGGER IF EXISTS trg_refresh_materiel ON materiel;
CREATE TRIGGER trg_refresh_materiel
  AFTER INSERT OR UPDATE OR DELETE ON materiel
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- Maintenance
DROP TRIGGER IF EXISTS trg_refresh_maint ON maintenance;
CREATE TRIGGER trg_refresh_maint
  AFTER INSERT OR UPDATE OR DELETE ON maintenance
  FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- Ces triggers déclenchent pg_notify('dashboard_refresh', ...) qui est écouté
-- par le worker Event-Driven (refreshMViewsWorker.ts).
--
-- Mapping domain → MViews (dans refreshMViewsWorker.ts):
-- - stock → ['rm_stocks_overview', 'rm_stocks_trends', 'rm_stocks_ruptures']
-- - mouvements_stock → ['rm_stocks_overview', 'rm_stocks_trends', 'rm_stocks_ruptures']
-- - materiel → ['rm_materiel_overview', 'rm_materiel_trends', 'rm_materiel_backlog_maintenance']
-- - maintenance → ['rm_materiel_overview', 'rm_materiel_trends', 'rm_materiel_backlog_maintenance']
