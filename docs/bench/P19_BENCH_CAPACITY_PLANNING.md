# P19 – Bench & Capacity Planning

**Objectif** : Dimensionner l’ERP BTP (API, workers, DB, Redis, exports) à partir d’un modèle de charge réaliste, de tests reproductibles (smoke / baseline / stress / soak), et de règles d’auto‑scaling et budgets SLO/SLA — **sans toucher à l’UX** (routeur avancé, registry, Sidebar/Subnav, KPI Bar restent inchangés).

---

## 1) Modèle de charge (tenant‑aware)

### 1.1 Sources

| Source | Données utilisées |
|--------|-------------------|
| **Télémétrie produit (P14)** | `view_opened`, `export_triggered`, `kpi_click`, `filter_applied` → taux, distribution horaire, profils par rôle. Vues : `v_telemetry_adoption_by_module`, `v_telemetry_export_funnel`. |
| **Journaux API (P4/P11)** | Latences, tailles, octets sortants, codes HTTP. Métriques Prometheus / `observeHttp`, budgets par route. |
| **Alerting (P15/P17)** | Fréquence / poids des règles, volumétrie `/api/alerts/test`, `/api/alerts/events`. |

### 1.2 Découpage par rôles

| Rôle | Mix typique | TPS / Think time / Exports |
|------|-------------|----------------------------|
| **Direction / CODIR** | 80 % reporting/synthèse, 20 % exports | Peu de requêtes/s, think time élevé, exports XLSX/PDF fréquents. |
| **Conduite de travaux** | Navigation KPI & listes (projets, demandes), filtres fréquents | TPS modéré, think time 5–15 s, exports occasionnels. |
| **Achats / Contrats** | Validations, achats ; lots de lectures + quelques exports | TPS moyen, think time 10–20 s, exports CSV/JSON. |
| **Stocks / Matériel** | Listes lourdes (mouvements), tendances | TPS plus élevé sur listes, think time 8–12 s. |

**Paramètres clés** :

- **TPS** (transactions/s) par route ;
- **Think time** (intervalle moyen entre actions UI) ;
- **Taux d’exports par heure** ;
- **Mix de routes** : `% /api/dashboard/*`, `% /api/export/*`, `% /api/alerts/*`, etc.

### 1.3 Little’s Law (dimensionnement)

```
Concurrence ≈ TPS × latence moyenne
```

Exemple : **P95 visé 400 ms** sur `/api/dashboard/[main]/[sub]/[leaf]`, palier **100 RPS** ⇒ **≈ 40 requêtes concurrentes** côté backend. À utiliser pour sizing DB pool, workers, Redis.

---

## 2) SLOs & budgets de perf (consolidés)

Ces SLOs s’articulent avec **P11** (budgets route) et **P16** (quotas / guardrails) pour un comportement prévisible sous charge.

| Domaine | Route | SLO P95 | SLO P99 | Erreur |
|---------|-------|---------|---------|--------|
| **Dashboard lecture** | `GET /api/dashboard/[main]/[sub]/[leaf]` | ≤ 400 ms | ≤ 900 ms | ≤ 1 % |
| **Export CSV/JSON** | `GET /api/export/dashboard?format=csv|json` | ≤ 800 ms (≤ 100k lignes) | ≤ 2 s | — |
| **Export XLSX/PDF** | `GET /api/export/dashboard?format=xlsx|pdf` | ≤ 2 s (≤ 50k lignes) | ≤ 5 s | — |
| **Alertes test** | `POST /api/alerts/test` | ≤ 1 s | ≤ 2 s | ≤ 1 % |

**Implémentation** : `app/api/internal/metrics/budgets.ts`, `lib/server/observability/metrics`, alerting P15.

---

## 3) Jeux de données synthétiques (seed multi‑tenant)

Deux seeds SQL alimentent les **mêmes MViews (CQRS)** ; aucun impact UX (routeur, registry, loaders inchangés).

| Fichier | Volumétrie |
|---------|------------|
| `lib/server/dashboard/sql/26_seed_bench_p19.sql` | 1 tenant, 5 bureaux, 4 chantiers, 120 projets, 200 demandes, validations/risques/décisions. |
| `lib/server/dashboard/sql/bench/seed_demo.sql` | 1 tenant (T-DEMO), 3 bureaux, 15 chantiers, **300 projets**, **10k demandes**, **5k factures**, **8k encaissements**. |

Réexécution : décommenter le bloc de nettoyage en tête de chaque seed, puis relancer.

**Après seed : REFRESH CONCURRENTLY des MViews**  
Déjà piloté par le **worker Event‑Driven** + **CRON** (`refreshMViewsWorker`, `/api/cron/refresh-views`). Voir `lib/server/dashboard/workers/refreshMViewsWorker.ts`, `scripts/CRON_QUICK_REFERENCE.md`. En cas de bench immédiat post-seed, un refresh manuel ou un déclenchement CRON peut précéder les runs k6.

---

## 4) Batterie de tests (k6)

| Type | Objectif | Durée | Scénarios |
|------|----------|-------|-----------|
| **Smoke** | Vérifier disponibilité des routes critiques | 1–2 min | Dashboard, export CSV, alerts/test |
| **Baseline** | Charge “normale” reproductible | 5–10 min | Mix navigation + exports + refresh |
| **Stress** | Trouver le breakpoint (TPS max, dégradation) | 10–20 min | Ramp-up progressif |
| **Soak** | Stabilité sous charge soutenue | 30–60 min | Même mix que baseline |

**Dossier** : `bench/k6/`. Scénarios dédiés : **browsing** (UI), **exports**, **alerts test**, **mix** (50 % browse / 30 % export / 20 % alerts test) pour simuler les heures de pointe.  
Fichiers : `smoke.js`, `baseline.js`, `stress.js`, `soak.js`, `dashboard_scenarios.js` (browsing + exports), `mix_scenarios.js`.  
Mêmes endpoints que le front (registry → API). CI : `.github/workflows/bench.yml` (smoke, optionnel baseline).

---

## 5) Mesure & observabilité pendant les tests

| Composant | Métriques / outils |
|-----------|--------------------|
| **API** | Histogrammes latence (P4), budgets par route (P11), taux 5xx/4xx, débit, taille moyenne réponse. |
| **DB** | `pg_stat_statements` (top requêtes), TPS & WAL/s, buffers hit ratio, locks, replication lag (P13). |
| **Redis** | CPU, latence, keys, hit rate, evictions. |
| **Workers** | Latence refresh MViews, queue d’événements, erreurs. |
| **FinOps** | Compteurs par scope (P16) — octets, lignes, exports (daily/monthly). |

---

## 6) Tuning & dimensionnement

### 6.1 Postgres

- **PgBouncer** (transaction pooling) → `max_connections` DB ~ 200 ; `pool_size` côté bouncer selon le mix.
- **shared_buffers** ~ 25 % RAM DB ; **effective_cache_size** ~ 50–75 % RAM ; **work_mem** 16–64 MB selon complexité.
- **autovacuum** agressif sur tables volumineuses (factures, encaissements, telemetry).
- **Index** ciblés (tenant_id, mois ; bureaux/chantiers ; dates) + **partitions temporelles** pour grosses tables (telemetry, audit).
- **MViews** : `REFRESH MATERIALIZED VIEW CONCURRENTLY` ; ordonnancer par domaine (finance → achats → stocks …).

### 6.2 API / Workers

- **Node** : cluster / PM2 / K8s — viser CPU‑bound stable (60–70 %) à la pointe.
- **HPA** : scale sur RPS/pod, latence P95 ou CPU ; min pods ≥ 2 par AZ ; max dimensionné par DB/Redis. Calculateur : `tools/capacity/calc.ts` (pods, DB IOPS, règle 70 % capacités / 30 % marge).
- **Back‑pressure** (P11/P16) : en surcharge, limiter formats coûteux (XLSX/PDF) et/ou tronquer selon `max_rows_per_call`.

### 6.3 Redis

- **RAM** = somme clés (rate‑limit + finops + cache) × 1,5 ; monitorer evictions ; sharder si besoin.

---

## 7) Rapport de capacité & runbooks

- **Rapport** : Nombre d’utilisateurs concurrents / TPS soutenu, **breakpoint**, marges. Template : [CAPACITY_REPORT_TEMPLATE.md](./CAPACITY_REPORT_TEMPLATE.md).
- **Runbook** : [RUNBOOK_BENCH.md](./RUNBOOK_BENCH.md) — commandes, seuils, interprétation des rapports, critères Go/No‑Go.

---

## 8) Plan de tests (pipeline) & critères Go/No‑Go

Campagne bench à automatiser en CI/CD « bench » ou environnement dédié :

| Phase | Durée | Objectif |
|-------|-------|----------|
| **Smoke** | 5 min | Vérifier infra, seuils. |
| **Baseline** | 15–30 min | Palier nominal (ex. 120 RPS browsing, 30 RPS exports) ; SLO respectés. |
| **Stress** | paliers +20 % / +40 % / +60 % | Identifier **breakpoint** (latences explosent / erreurs > 1 %). |
| **Soak** | 2–4 h | Dérives mémoire, vacuums, WAL, fuites, rotation logs. |

**Go** : P95 ≤ budgets (P11), erreurs ≤ 1 %, DB lag ≤ seuil (P13), exports OK (guardrails P16 ON).

**No‑Go** : l’un des critères échoue → ouvrir PR de tuning ciblée, re‑bench.

---

## 9) Livrables PR « P19 – Bench & Capacity Planning »

- [x] `lib/server/dashboard/sql/bench/seed_demo.sql` (jeu de données réaliste) + `26_seed_bench_p19.sql`
- [x] `bench/k6/dashboard_scenarios.js` (browsing & exports) + job CI `bench.yml`
- [x] `tools/capacity/calc.ts` (calculateur pods & DB IOPS)
- [x] Paramétrage HPA indicatif ([hpa-example.yaml](./hpa-example.yaml)) + check‑lists tuning ([TUNING_CHECKLISTS.md](./TUNING_CHECKLISTS.md) : Postgres, Redis, API)
- [x] Budgets SLO (P11) dans `app/api/internal/metrics/budgets.ts` + FinOps (P16) consommation
- [x] README « Runbooks de bench » → [RUNBOOK_BENCH.md](./RUNBOOK_BENCH.md) : commandes, seuils, interprétation des rapports

Aucun changement d’UX (routeur, registry, Sidebar, KPI Bar inchangés).

---

## Quick start

1. **Seed** (PostgreSQL) : `psql -f lib/server/dashboard/sql/bench/seed_demo.sql` (ou `26_seed_bench_p19.sql`). Les MViews sont rafraîchies par le worker Event‑Driven + CRON ; en bench immédiat, déclencher un refresh ou attendre un cycle.
2. **k6** : `k6 run -e BASE_URL=http://localhost:4001 -e TENANT_ID=a1b2c3d4-e5f6-4789-a012-demo00000001 bench/k6/smoke.js`
3. **CI** : workflow `Bench P19` (`.github/workflows/bench.yml`), déclenché manuellement ou par schedule.

---

## Suite P19 / Prochaines étapes

1. **Pousser la PR « P19 – Bench & Capacity Planning »** (fichiers et scripts ci‑dessus, aucun changement d’UX).
2. **Lancer un premier run** : baseline avec seed Démo (ex. 120 RPS browsing, 30 RPS exports, 30 min) et produire un **rapport synthèse** (SLOs, latences, IOPS, CPU/RAM/pods, breakpoint).
3. **Selon les résultats** : ouvrir des **PR tuning ciblées** (index, HPA, quotas FinOps, back‑pressure) puis re‑bench.
4. **Enchaîner sur P20 – Playbooks Ops & Remediations** (recalcul MViews, purge caches, escalades, bascule standby→primary, régénération clés, etc.).

---

## Références

- [RUNBOOK_BENCH.md](./RUNBOOK_BENCH.md) — Procédure de bench, commandes, seuils, Go/No‑Go
- [CAPACITY_REPORT_TEMPLATE.md](./CAPACITY_REPORT_TEMPLATE.md) — Modèle de rapport de capacité
- [TUNING_CHECKLISTS.md](./TUNING_CHECKLISTS.md) — Check-lists tuning Postgres, Redis, API, HPA
- [hpa-example.yaml](./hpa-example.yaml) — HPA indicatif (K8s)
- [RISQUES_ATTENUATIONS_ET_DEPLOIEMENT.md](../security/RISQUES_ATTENUATIONS_ET_DEPLOIEMENT.md) — Plan déploiement et suite P19/P20
- `app/api/internal/metrics/budgets.ts` — Budgets P11
- `lib/server/dashboard/sql/` — MViews, seed bench
- `lib/server/dashboard/workers/refreshMViewsWorker.ts` — Refresh MViews (event‑driven + CRON)
- `scripts/CRON_QUICK_REFERENCE.md` — CRON refresh
