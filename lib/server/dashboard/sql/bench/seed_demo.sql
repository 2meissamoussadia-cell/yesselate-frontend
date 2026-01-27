-- sql/bench/seed_demo.sql
-- P19 Bench : 1 tenant + 3 bureaux + 15 chantiers + 300 projets + 10k demandes
--            + 5k factures + 8k encaissements
-- Alimente les MViews (CQRS) existantes. Réexécutable après nettoyage.
-- Exécution : psql -f lib/server/dashboard/sql/bench/seed_demo.sql

-- ============================================================================
-- 0. Nettoyage (réexécution idempotente) — décommenter pour reset T-DEMO
-- ============================================================================
/*
DELETE FROM encaissements WHERE tenant_id = (SELECT id FROM tenants WHERE code = 'T-DEMO');
DELETE FROM factures     WHERE tenant_id = (SELECT id FROM tenants WHERE code = 'T-DEMO');
DELETE FROM demandes     WHERE tenant_id = (SELECT id FROM tenants WHERE code = 'T-DEMO');
DELETE FROM projets      WHERE tenant_id = (SELECT id FROM tenants WHERE code = 'T-DEMO');
DELETE FROM chantiers    WHERE tenant_id = (SELECT id FROM tenants WHERE code = 'T-DEMO');
DELETE FROM bureaux      WHERE tenant_id = (SELECT id FROM tenants WHERE code = 'T-DEMO');
DELETE FROM tenants      WHERE code = 'T-DEMO';
*/

-- ============================================================================
-- 1. Tenant (UUID fixe pour k6 / BENCH : TENANT_ID=a1b2c3d4-e5f6-4789-a012-demo00000001)
-- ============================================================================
INSERT INTO tenants (id, code, name)
VALUES ('a1b2c3d4-e5f6-4789-a012-demo00000001'::uuid, 'T-DEMO', 'Tenant Démo')
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 2. Bureaux (3)
-- ============================================================================
WITH t AS (SELECT id FROM tenants WHERE code = 'T-DEMO'),
     x AS (SELECT * FROM (VALUES
       ('BMO', 'Bureau Maîtrise d''Ouvrage'),
       ('BA',  'Bureau Achats'),
       ('BF',  'Bureau Finance')) AS v(code, label))
INSERT INTO bureaux (id, tenant_id, code, label)
SELECT gen_random_uuid(), t.id, x.code, x.label
FROM t, x
ON CONFLICT (tenant_id, code) DO NOTHING;

-- ============================================================================
-- 3. Chantiers (15)
-- ============================================================================
WITH t AS (SELECT id FROM tenants WHERE code = 'T-DEMO'),
     b AS (SELECT id FROM bureaux WHERE tenant_id = (SELECT id FROM t))
INSERT INTO chantiers (id, tenant_id, code, label, bureau_id)
SELECT gen_random_uuid(), t.id,
       'CH-' || lpad(g::text, 3, '0'),
       'Chantier ' || g,
       (SELECT id FROM b ORDER BY random() LIMIT 1)
FROM t, generate_series(1, 15) g
ON CONFLICT (tenant_id, code) DO NOTHING;

-- ============================================================================
-- 4. Projets (300)
-- ============================================================================
WITH t AS (SELECT id FROM tenants WHERE code = 'T-DEMO'),
     c AS (SELECT id FROM chantiers WHERE tenant_id = (SELECT id FROM t))
INSERT INTO projets (id, tenant_id, chantier_id, nom, statut, progression, budget, consomme, created_at)
SELECT gen_random_uuid(), t.id, (SELECT id FROM c ORDER BY random() LIMIT 1),
       'Projet ' || g,
       (ARRAY['En cours', 'En attente', 'Terminé'])[1 + floor(random() * 3)::int],
       floor(random() * 101)::int,
       (100000 + random() * 900000)::numeric(18,2),
       (random() * 0.9 * (100000 + random() * 900000))::numeric(18,2),
       now() - (random() * '180 days'::interval)
FROM t, generate_series(1, 300) g;

-- ============================================================================
-- 5. Demandes (10k)
-- ============================================================================
WITH t AS (SELECT id FROM tenants WHERE code = 'T-DEMO'),
     b AS (SELECT id FROM bureaux WHERE tenant_id = (SELECT id FROM t))
INSERT INTO demandes (id, tenant_id, bureau_id, type, statut, priorite, created_at)
SELECT gen_random_uuid(), t.id, (SELECT id FROM b ORDER BY random() LIMIT 1),
       (ARRAY['Demande RH', 'Validation BC', 'Décision'])[1 + floor(random() * 3)::int],
       (ARRAY['En attente', 'Validé', 'Rejeté', 'En cours'])[1 + floor(random() * 4)::int],
       (ARRAY['Critique', 'Haute', 'Moyenne', 'Basse'])[1 + floor(random() * 4)::int],
       now() - (random() * '120 days'::interval)
FROM t, generate_series(1, 10000) g;

-- ============================================================================
-- 6. Factures (5k)
-- ============================================================================
WITH t AS (SELECT id FROM tenants WHERE code = 'T-DEMO'),
     c AS (SELECT id FROM chantiers WHERE tenant_id = (SELECT id FROM t))
INSERT INTO factures (id, tenant_id, chantier_id, numero, emise_le, echeance_le, montant_ht, statut, created_at)
SELECT gen_random_uuid(), t.id, (SELECT id FROM c ORDER BY random() LIMIT 1),
       'FAC-' || g,
       (now() - (random() * '300 days'::interval))::date,
       (now() + (random() * '60 days'::interval))::date,
       (1000 + random() * 9000)::numeric(18,2),
       (ARRAY['brouillon', 'emise', 'payee'])[1 + floor(random() * 3)::int],
       now()
FROM t, generate_series(1, 5000) g;

-- ============================================================================
-- 7. Encaissements (8k) — facture_id parmi factures non brouillon
-- ============================================================================
WITH t AS (SELECT id FROM tenants WHERE code = 'T-DEMO'),
     f AS (
       SELECT id, tenant_id
       FROM factures
       WHERE tenant_id = (SELECT id FROM t) AND statut != 'brouillon'
     )
INSERT INTO encaissements (id, tenant_id, facture_id, regle_le, montant_ht, created_at)
SELECT gen_random_uuid(), t.id,
       (SELECT id FROM f ORDER BY random() LIMIT 1),
       (now() - (random() * '200 days'::interval))::date,
       (100 + random() * 9000)::numeric(18,2),
       now()
FROM t, generate_series(1, 8000) g;

-- ============================================================================
-- 8. Rafraîchir les MViews (CQRS)
-- ============================================================================
-- Piloté par le worker Event‑Driven + CRON (refreshMViewsWorker, /api/cron/refresh-views).
-- En bench immédiat post-seed : déclencher un refresh manuel ou CRON, ou attendre un cycle.
-- Ex. manuel : REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_projets;
--   rm_kpis_demandes; rm_finance_overview; etc.
