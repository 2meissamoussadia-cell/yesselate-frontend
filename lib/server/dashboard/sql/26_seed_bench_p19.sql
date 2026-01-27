-- 26_seed_bench_p19.sql
-- P19 Bench & Capacity Planning : jeu de données synthétiques multi-tenant
--
-- Alimente les mêmes MViews (CQRS) déjà branchées. Aucun impact UX.
-- Exécution : psql -f 26_seed_bench_p19.sql
-- Puis : REFRESH MATERIALIZED VIEW CONCURRENTLY (voir fin du fichier).

-- ============================================================================
-- 1. TENANT DÉMO BENCH
-- ============================================================================

INSERT INTO tenants (id, code, name)
VALUES (
  'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid,
  'BENCH_DEMO',
  'Tenant Démo Bench P19'
)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;

-- Nettoyage données bench (réexécution idempotente)
DELETE FROM projets WHERE tenant_id = 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid;
DELETE FROM demandes WHERE tenant_id = 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid;
DELETE FROM validations WHERE tenant_id = 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid;
DELETE FROM risques WHERE tenant_id = 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid;
DELETE FROM blocages WHERE tenant_id = 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid;
DELETE FROM decisions WHERE tenant_id = 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid;

-- ============================================================================
-- 2. BUREAUX
-- ============================================================================

INSERT INTO bureaux (id, tenant_id, code, label)
VALUES
  ('b1000001-0000-4000-8000-000000000001'::uuid, 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid, 'BMO', 'Bureau Management Opérationnel'),
  ('b1000002-0000-4000-8000-000000000002'::uuid, 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid, 'ACHATS', 'Achats & Contrats'),
  ('b1000003-0000-4000-8000-000000000003'::uuid, 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid, 'STOCKS', 'Stocks & Matériel'),
  ('b1000004-0000-4000-8000-000000000004'::uuid, 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid, 'TRAVAUX', 'Conduite de travaux'),
  ('b1000005-0000-4000-8000-000000000005'::uuid, 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid, 'CODIR', 'Direction / CODIR')
ON CONFLICT (tenant_id, code) DO UPDATE SET label = EXCLUDED.label;

-- ============================================================================
-- 3. CHANTIERS
-- ============================================================================

INSERT INTO chantiers (id, tenant_id, code, label, bureau_id)
VALUES
  ('c2000001-0000-4000-8000-000000000001'::uuid, 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid, 'CH-A1', 'Chantier A1', 'b1000001-0000-4000-8000-000000000001'::uuid),
  ('c2000002-0000-4000-8000-000000000002'::uuid, 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid, 'CH-A2', 'Chantier A2', 'b1000001-0000-4000-8000-000000000001'::uuid),
  ('c2000003-0000-4000-8000-000000000003'::uuid, 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid, 'CH-B1', 'Chantier B1', 'b1000004-0000-4000-8000-000000000004'::uuid),
  ('c2000004-0000-4000-8000-000000000004'::uuid, 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid, 'CH-B2', 'Chantier B2', 'b1000004-0000-4000-8000-000000000004'::uuid)
ON CONFLICT (tenant_id, code) DO UPDATE SET label = EXCLUDED.label, bureau_id = EXCLUDED.bureau_id;

-- ============================================================================
-- 4. PROJETS (alimente rm_kpis_projets)
-- ============================================================================

INSERT INTO projets (id, tenant_id, chantier_id, nom, statut, progression, budget, consomme, created_at)
SELECT
  gen_random_uuid(),
  'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid,
  (SELECT id FROM chantiers WHERE tenant_id = 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid ORDER BY code LIMIT 1 OFFSET (g.n % 4)),
  'Projet Bench ' || g.n,
  (ARRAY['En cours','En attente','Terminé'])[1 + (g.n % 3)],
  (g.n % 101),
  100000 + (g.n % 5) * 50000,
  (g.n % 4) * 20000,
  now() - (g.n || ' days')::interval
FROM generate_series(1, 120) g(n);

-- ============================================================================
-- 5. DEMANDES (alimente rm_kpis_demandes)
-- ============================================================================

INSERT INTO demandes (id, tenant_id, bureau_id, type, statut, priorite, created_at)
SELECT
  gen_random_uuid(),
  'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid,
  (SELECT id FROM bureaux WHERE tenant_id = 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid ORDER BY code LIMIT 1 OFFSET (g.n % 5)),
  (ARRAY['Demande RH','Validation BC','Demande équipement','Autre'])[1 + (g.n % 4)],
  (ARRAY['En attente','Validé','Rejeté','En cours'])[1 + (g.n % 4)],
  (ARRAY['Critique','Haute','Moyenne','Basse'])[1 + (g.n % 4)],
  now() - (g.n % 90 || ' days')::interval
FROM generate_series(1, 200) g(n);

-- ============================================================================
-- 6. VALIDATIONS
-- ============================================================================

INSERT INTO validations (id, tenant_id, bureau_id, kind, statut, delai_h, created_at)
SELECT
  gen_random_uuid(),
  'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid,
  (SELECT id FROM bureaux WHERE tenant_id = 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid LIMIT 1 OFFSET (g.n % 5)),
  (ARRAY['bc','facture','avenant'])[1 + (g.n % 3)],
  (ARRAY['en_attente','validee','rejetee'])[1 + (g.n % 3)],
  (g.n % 72),
  now() - (g.n % 60 || ' days')::interval
FROM generate_series(1, 80) g(n);

-- ============================================================================
-- 7. RISQUES & BLOCAGES & DÉCISIONS
-- ============================================================================

INSERT INTO risques (id, tenant_id, criticite, actif, created_at)
SELECT gen_random_uuid(), 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid,
  (ARRAY['high','medium','low'])[1 + (g.n % 3)], g.n % 3 <> 0, now() - (g.n || ' days')::interval
FROM generate_series(1, 25) g(n);

INSERT INTO blocages (id, tenant_id, actif, created_at)
SELECT gen_random_uuid(), 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid, true, now() - (g.n % 30 || ' days')::interval
FROM generate_series(1, 15) g(n);

INSERT INTO decisions (id, tenant_id, statut, created_at)
SELECT gen_random_uuid(), 'a1b2c3d4-e5f6-4789-a012-bench00000001'::uuid,
  (ARRAY['en_attente','executee'])[1 + (g.n % 2)], now() - (g.n % 45 || ' days')::interval
FROM generate_series(1, 40) g(n);

-- ============================================================================
-- 8. RAFRAÎCHIR LES MVIEWS (CQRS)
-- ============================================================================
-- Piloté par le worker Event‑Driven + CRON (refreshMViewsWorker, /api/cron/refresh-views).
-- En bench immédiat post-seed : déclencher un refresh manuel ou CRON, ou attendre un cycle.
-- Ex. manuel : REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_projets; rm_kpis_demandes; etc.
