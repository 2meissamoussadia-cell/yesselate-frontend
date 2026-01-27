# P20 – Playbooks Ops & Remédiations

**Objectif** : Catalogue d’actions opérables (manuelles ou automatiques) pour corriger rapidement les incidents les plus probables, **sans changer l’UX** (routeur, registry, Sidebar, KPI Bar inchangés).

---

## 1. Périmètre

- **MViews / Read-models** : refresh ciblé, backfill incrémental, recalcul sélectif
- **DB hygiene** : VACUUM/ANALYZE, REINDEX CONCURRENTLY, réparation d’index manquants
- **Cache & workers** : purge/warm Redis, relance contrôlée workers, nettoyage advisory locks
- **Exports & files** : DLQ → retry, bascule « CSV-only » temporaire
- **Sécurité / Accès** : freeze tenant, revocation sessions, rotation JWT (kid), purge tokens
- **Réseau / DR** : failover DB (supervision), bascule PgBouncer, tests de santé

**Garde-fous** : dry-run par défaut, scope minimal (tenant/bureau/chantier), audit exhaustif.

---

## 2. Livrables

| Élément | Emplacement |
|--------|-------------|
| SQL ops | `sql/ops/00_rbac_ops.sql`, `01_mviews_targets.sql`, `02_indexes_repair.sql`, `03_quick_vacuum.sql` |
| Audit, guards, db, redis | `lib/server/ops/` (`audit.ts`, `guards.ts`, `db.ts`, `redis.ts`) |
| Playbooks | `lib/server/ops/playbooks/` (mviews, db_hygiene, cache, workers, exports, security, failover) |
| Dispatcher | `lib/server/ops/runbook.ts` |
| Jobs CLI | `jobs/opsRunner.ts`, `jobs/cronWarmDashboard.ts` |
| API | `app/api/ops/runbook/route.ts`, `app/api/ops/approvals/route.ts` |

---

## 3. Usage

### 3.1 API runbook (RBAC `ops:execute`)

```http
POST /api/ops/runbook
Content-Type: application/json

{
  "playbook": "mviews_refresh",
  "params": { "tenantId": "...", "domains": ["finance", "achats"], "concurrently": true },
  "dryRun": true,
  "scope": { "tenantId": "..." }
}
```

**Playbooks** : `mviews_refresh`, `mviews_backfill`, `db_vacuum`, `db_reindex`, `cache_purge`, `cache_warm`, `workers_clear_locks`, `exports_dlq_retry`, `exports_csv_only`, `failover_db`, `failover_pgbouncer`, `security_freeze`, `security_unfreeze`, `security_revoke_sessions`, `security_rotate_jwt`.

### 3.2 Approbations (two-person rule)

- **GET /api/ops/approvals?status=pending** : liste des approbations en attente
- **POST /api/ops/approvals** : `{ "action": "create", "playbook": "...", "params": {...}, "requiredVotes": 2 }` ou `{ "action": "vote", "approvalId": "..." }`

### 3.3 CLI

**Prérequis** : `pg`, `ioredis` (et `DATABASE_URL`, `REDIS_URL` si playbooks DB/Redis). `npx tsx` depuis la racine du projet.

```bash
npx tsx jobs/opsRunner.ts mviews_refresh --dry-run --param tenantId=<uuid> --param domain=finance
npx tsx jobs/opsRunner.ts mviews_refresh --real --param tenantId=<uuid> --param domain=finance
npx tsx jobs/opsRunner.ts cache_purge --real --param pattern=cache:dashboard:*
```

### 3.4 Warm cache (CRON matinal / after-failover)

```bash
npx tsx jobs/cronWarmDashboard.ts
```

---

## 4. Two-phase guard & alerting

- **Pré-check** : dry-run systématique avant exécution réelle ; validation scope (tenant/bureau/chantier) et blast radius.
- **Exécution** : après approbation (two-person rule pour playbooks sensibles) ou exécution directe si politique le permet.
- **Intégration alerting (P15/P17)** : runbooks automatiques déclenchables depuis règles d’alerte, avec pré-check + exécution gated par approbation ou seuil de criticité.

---

## 5. Extraits playbooks (exemples)

### MViews – refresh ciblé & backfill

- **mviews_refresh** : `refreshMViews` — `params: { tenantId, domains: ["finance","achats",...], concurrently? }` ou `scope: { tenantId }` + `params: { domain: "finance" }` (un seul domaine). `withTenant` + `SET app.tenant_id`, mapping domaine → vues (finance, achats, stocks, materiel, reporting, compliance).
- **mviews_backfill** : `backfillReadModels` — `params: { tenantId, from?, to? }` ou `scope: { tenantId }`. Recalcul reporting (rm_reporting_overview, rm_reporting_dso) sur fenêtre temporelle.

### DB hygiene

- **db_vacuum** : `vacuumAnalyze` — `params: { tables: ["factures", "encaissements", ...] }` ou `targets`. Par défaut : factures, encaissements, projets, demandes. `withTenant` sentinelle (ops globales).
- **db_reindex** : `reindexConcurrently` — `params: { indexes: ["idx_ops_factures_tenant_emise", ...] }` ou `targets`. Requiert une liste d’index.

### Cache & workers

- **cache_purge** : `purgeCachePrefix` — `params: { prefix: "cache:dashboard:" }` ou `pattern`. `redis.keys(prefix + "*")` puis `redis.del(...)` si !dryRun.
- **cache_warm** : `warmDashboardKeys` — `params: { tenantId, keys: ["overview/summary/dashboard", ...] }` ou `scope: { tenantId }`. Stub : enregistre l’intention (priming TTL registry via /api/dashboard).
- **workers_clear_locks** : `clearAdvisoryLocks` — `pg_advisory_unlock_all()` sur la session courante (`pgPool`). Libère les advisory locks de cette connexion uniquement.

### Exports

- **exports_dlq_retry** : `retryDeadLetter` — `redis.lrange('exports:dlq')` puis `lpush` vers `exports:queue`, `del('exports:dlq')` si !dryRun.
- **exports_csv_only** : `degradeExports` — `params: { mode?: 'csv-only'|'deny-large', ttlMin?: number }`. `redis.setex('exports:degrade', ttlMin*60, mode)` ; flag lu par `/api/export`.

---

## 6. Références

- [RUNBOOK_BENCH](../bench/RUNBOOK_BENCH.md) — Bench P19
- [RUNBOOKS_INCIDENTS](../security/RUNBOOKS_INCIDENTS.md) — Incidents sécurité
- [DR_RUNBOOK](../runbooks/DR_RUNBOOK.md) — Disaster recovery
- [RISQUES_ATTENUATIONS_ET_DEPLOIEMENT](../security/RISQUES_ATTENUATIONS_ET_DEPLOIEMENT.md) — Plan déploiement
