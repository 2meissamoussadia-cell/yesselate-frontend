# Runbook Bench – P19

Procédure pour exécuter la batterie de bench (smoke / baseline / stress / soak), analyser les résultats et appliquer les **critères Go/No-Go**. Commandes, seuils et interprétation des rapports.

---

## 1. Prérequis

- App ciblée démarrée (ex. `npm run dev` sur `http://localhost:4001` ou URL de staging).
- [k6](https://k6.io/docs/getting-started/installation/) installé.
- (Optionnel) Seed bench exécuté : `26_seed_bench_p19.sql` ou `bench/seed_demo.sql` (tenant T-DEMO). Les MViews sont rafraîchies par le worker Event-Driven + CRON ; en bench immédiat, déclencher un refresh ou attendre un cycle.

---

## 2. Campagne bench (pipeline)

À automatiser en CI/CD « bench » ou environnement dédié. Ordre recommandé :

| Phase | Script / exemple | Durée | Objectif |
|-------|------------------|-------|----------|
| **Smoke** | `k6 run bench/k6/smoke.js` ou `--duration 5m` | **5 min** | Vérifier infra, seuils. |
| **Baseline** | `k6 run bench/k6/baseline.js --duration 30m --vus 20` | **15–30 min** | Palier nominal (ex. 120 RPS browsing, 30 RPS exports) ; SLO respectés. |
| **Stress** | `k6 run bench/k6/stress.js` ; paliers +20 % / +40 % / +60 % | ~15 min | Identifier **breakpoint** (latences explosent / erreurs > 1 %). |
| **Soak** | `k6 run bench/k6/soak.js --duration 2h` | **2–4 h** | Dérives mémoire, vacuums, WAL, fuites, rotation logs. |
| (option) | `k6 run bench/k6/dashboard_scenarios.js` | ~8 min | Browsing + exports (ramping-arrival-rate). |
| (option) | `k6 run bench/k6/mix_scenarios.js` | ~8 min | Mix 50 % browse / 30 % export / 20 % alerts test. |

**Campagne type (pipeline)** : Smoke **5 min** | Baseline **15–30 min** (ex. `--duration 30m --vus 20`) | Stress paliers +20 % / +40 % / +60 % | Soak **2–4 h** (ex. `--duration 2h`). Voir [P19 §8](P19_BENCH_CAPACITY_PLANNING.md#8-plan-de-tests-pipeline--critères-gonogo).

Variables utiles :

```bash
export BASE_URL=http://localhost:4001
export TENANT_ID=a1b2c3d4-e5f6-4789-a012-demo00000001   # T-DEMO (seed_demo) ou bench (26_seed_bench_p19)
export AUTH_TOKEN=…   # optionnel : JWT Bearer si l’API l’exige
k6 run bench/k6/baseline.js
```

---

## 3. Critères Go/No-Go

**Go** : tous les critères ci-dessous respectés pour les scénarios exécutés.

- **P95** ≤ budgets (P11) : dashboard ≤ 400 ms, export csv/json ≤ 800 ms, etc.
- **Erreurs** ≤ 1 % (hors smoke/stress où &lt; 5 % acceptable).
- **DB lag** ≤ seuil (réplication P13) ; pas de saturation DB (IOPS, locks).
- **Exports OK** : guardrails P16 ON ; pas de dépassement quotas / back-pressure bloquant.

**No-Go** : l’un des critères échoue.

→ Analyser logs (API, DB, Redis), métriques Prometheus/Grafana, puis **ouvrir PR de tuning ciblée** ([TUNING_CHECKLISTS.md](./TUNING_CHECKLISTS.md)) et **re-bench**.

### 3.1 Par scénario (détail)

- **Smoke** : erreur &lt; 5 %, P95 &lt; 5 s.
- **Baseline** : erreur &lt; 1 %, P95 dashboard &lt; 500 ms, P95 export &lt; 1,5 s.
- **Stress** : erreur &lt; 5 % pendant le ramp-up ; noter le **breakpoint** (RPS/VUs où dégradation nette).
- **Soak** : erreur &lt; 1 %, pas de dérive latences / mémoire.

---

## 4. Pipeline CI / GitHub Actions

Un job **bench** peut lancer uniquement le **smoke** (et éventuellement le **baseline**) pour une validation rapide sur chaque PR ou build nocturne.

- Workflow : [bench.yml](../../.github/workflows/bench.yml) (optionnel).
- Critères CI : **smoke** doit être **Go** ; si **baseline** est exécuté, **Go** aussi.

---

## 5. Rapport de capacité

Après stress (et si possible soak), remplir le [CAPACITY_REPORT_TEMPLATE.md](CAPACITY_REPORT_TEMPLATE.md) :

- RPS / TPS soutenu, utilisateurs concurrents (VUs) équivalent.
- **Breakpoint** observé (RPS ou VUs).
- Marges par rapport aux SLOs ; recommandations (sizing, HPA/VPA, back-pressure).

---

## 6. Interprétation des rapports

- **k6** : résumé stdout (http_req_duration p95/p99, http_req_failed, iteration_duration, RPS). Comparer aux seuils du runbook et aux budgets P11.
- **Métriques** : API (P4, P11), DB (pg_stat_statements, TPS, WAL, lag), Redis (hit rate, evictions), Workers (refresh MViews, queue). Croiser avec FinOps (P16) si exports / quotas.
- **Go** : seuils respectés → valider capacité, documenter dans le rapport. **No-Go** : identifier goulot (CPU, DB, Redis, rate-limit), appliquer [TUNING_CHECKLISTS.md](./TUNING_CHECKLISTS.md), re-bench.

---

## Références

- [P19_BENCH_CAPACITY_PLANNING.md](P19_BENCH_CAPACITY_PLANNING.md)
- [CAPACITY_REPORT_TEMPLATE.md](CAPACITY_REPORT_TEMPLATE.md)
- [TUNING_CHECKLISTS.md](./TUNING_CHECKLISTS.md)
- `bench/k6/README.md`
