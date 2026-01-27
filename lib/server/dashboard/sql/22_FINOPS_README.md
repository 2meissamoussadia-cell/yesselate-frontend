# 22_finops.sql — Phase P16 FinOps & Cost Guardrails

## Vue d'ensemble

Schéma minimal FinOps : politiques par tenant/scope, compteurs d'usage agrégés, log des refus.  
**Zéro impact UX** : contrôles dans les handlers uniquement ; routeur, registry, nav et KPI Bar inchangés.

## Fichier

- **`lib/server/dashboard/sql/22_finops.sql`**

## Déploiement

```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/22_finops.sql
```

## Tables

| Table | Rôle |
|-------|------|
| `finops_policies` | Quotas par tenant/scope (calls, rows, bytes, exports) et plafonds par appel |
| `finops_usage` | Consommation agrégée par période (calls, rows, bytes, exports) |
| `finops_denials` | Log des refus / dégradations (audit, rapport FinOps) |

## Scopes pratiques

- `global` — tenant entier
- `module:achats` — module achats
- `module:stocks` — module stocks
- `module:reporting` — module reporting
- `module:compliance` — module conformité
- `route:/api/export/dashboard` — route export dashboard  
Autres : `module:*`, `route:*` selon besoin.

## Périodes

- **daily** : jour courant (`window_start` = date du jour)
- **monthly** : 1er → fin du mois (`window_start` = 1er du mois)

## Exemple politique

```sql
INSERT INTO finops_policies (tenant_id, scope, period, quota_calls, quota_rows, quota_bytes, quota_exports, max_rows_per_call, max_bytes_per_call)
VALUES (
  '...'::uuid,
  'global',
  'daily',
  50000,      -- 50k appels/jour
  1000000,    -- 1M lignes/jour
  524288000,  -- 500 Mo/jour
  100,        -- 100 exports/jour
  10000,      -- 10k lignes max par réponse
  10485760    -- 10 Mo max par réponse
);
```

## Exemple usage (incrément)

Les handlers incrémentent `finops_usage` pour le `(tenant_id, scope, period, window_start)` correspondant :

```sql
INSERT INTO finops_usage (tenant_id, scope, period, window_start, calls, rows, bytes, exports)
VALUES ('...'::uuid, 'global', 'daily', CURRENT_DATE, 1, 150, 4096, 0)
ON CONFLICT (tenant_id, scope, period, window_start)
DO UPDATE SET
  calls   = finops_usage.calls   + EXCLUDED.calls,
  rows    = finops_usage.rows    + EXCLUDED.rows,
  bytes   = finops_usage.bytes   + EXCLUDED.bytes,
  exports = finops_usage.exports + EXCLUDED.exports;
```

## Exemple déni (audit)

```sql
INSERT INTO finops_denials (tenant_id, scope, reason, details)
VALUES (
  '...'::uuid,
  'route:/api/export/dashboard',
  'quota_exceeded',
  '{"quota":"quota_exports","limit":100,"current":101}'::jsonb
);
```

## Raisons de refus (`reason`)

- `quota_exceeded` — quota dépassé (calls, rows, bytes, exports)
- `backpressure` — back-pressure active (stress plateforme)
- `budget_slo` — limite dynamique SLO/SLA dépassée

## Vérification

```sql
SELECT COUNT(*) FROM finops_policies;
SELECT COUNT(*) FROM finops_usage;
SELECT COUNT(*) FROM finops_denials;
```

---

## Middleware serveur (Phase P16)

### Mesure (Redis) + flush Postgres

- **`lib/server/finops/redis.ts`** — Client Redis partagé (singleton).
- **`lib/server/finops/meter.ts`** — `recordUsage({ tenantId, scope, rows?, bytes?, exports? })` : incrémente les compteurs en Redis (clés `finops:tenant:scope:daily|monthly:window`).
- **`lib/server/finops/guard.ts`** — `enforceQuota({ tenantId, scope, isExport?, estimatedRows?, estimatedBytes? })` : lit les politiques en Postgres et l’usage en Redis ; retourne `{ allowed }` ou `{ allowed: false, reason }`. `recordDenial(tenantId, scope, reason, details?)` pour l’audit.
- **`scripts/finopsFlushJob.ts`** — Job horaire : `redis.keys('finops:*:*:daily|monthly:*')` → upsert `finops_usage` → `redis.del(key)`.

**Dépendances :** `ioredis`, `pg`, `dotenv` (pour le script). À ajouter en `dependencies` / `devDependencies` si absents.

### Back-pressure & dégradation contrôlée

- **`lib/server/finops/backpressure.ts`** — `getBackpressureSignal()` : lit replay lag + rôle DB (primary/standby). `decideBackpressure({ replayLagSec, cpuLoad? })` : règles >300s → `severe`, >60s → `conservative`, sinon `normal`.
- **Intégration `/api/export/dashboard`** :
  - **normal** : comportement standard (tous formats, limites normales).
  - **conservative** : refuse PDF/XLSX/Excel/JSON → 503 "CSV only" ; si CSV, réduit `max_rows_per_call` à 10k.
  - **severe** : refuse tous exports → 503 "retry later" (Retry-After 300s).
- **Signal** : utilise `/api/internal/health` (P13) — `db.replayLagSec` et `db.role`. Fail-open : si erreur DB, traite comme `normal` (n’empêche pas les exports).

### Intégration dans les handlers

- **`/api/dashboard/[main]/[sub]/[leaf]`** : avant `getData`, `enforceQuota` (scope `route:/api/dashboard`). Si refus → `recordDenial` + 429. Après réponse → `recordUsage` (rows via `inferRowCount`, bytes via `JSON.stringify`).
- **`/api/export/dashboard`** : avant `getData`, `enforceQuota` (scope `route:/api/export/dashboard`, `isExport: true`, `estimatedRows` / `estimatedBytes`). Si refus → `recordDenial` + 429. Après chaque export (csv, xlsx, pdf, etc.) → `recordUsage` (rows, bytes, `exports: 1`).

### Lancer le flush (CRON)

```bash
DATABASE_URL=... REDIS_URL=... npx tsx scripts/finopsFlushJob.ts
```

À planifier (ex. horaire) : `0 * * * * ...`.
