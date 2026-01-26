-- Réutilise la fonction notify_dashboard_refresh() déjà en place.
DROP TRIGGER IF EXISTS trg_refresh_procedures ON procedures_mp;
CREATE TRIGGER trg_refresh_procedures AFTER INSERT OR UPDATE OR DELETE ON procedures_mp
FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_lots ON lots_mp;
CREATE TRIGGER trg_refresh_lots AFTER INSERT OR UPDATE OR DELETE ON lots_mp
FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_pieces ON pieces_conformite;
CREATE TRIGGER trg_refresh_pieces AFTER INSERT OR UPDATE OR DELETE ON pieces_conformite
FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_contrats ON contrats_mp;
CREATE TRIGGER trg_refresh_contrats AFTER INSERT OR UPDATE OR DELETE ON contrats_mp
FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_avenants ON avenants_mp;
CREATE TRIGGER trg_refresh_avenants AFTER INSERT OR UPDATE OR DELETE ON avenants_mp
FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_os ON ordres_service_mp;
CREATE TRIGGER trg_refresh_os AFTER INSERT OR UPDATE OR DELETE ON ordres_service_mp
FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_visa ON visa_workflow;
CREATE TRIGGER trg_refresh_visa AFTER INSERT OR UPDATE OR DELETE ON visa_workflow
FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();

DROP TRIGGER IF EXISTS trg_refresh_audit ON audit_traces;
CREATE TRIGGER trg_refresh_audit AFTER INSERT OR UPDATE OR DELETE ON audit_traces
FOR EACH ROW EXECUTE FUNCTION notify_dashboard_refresh();
