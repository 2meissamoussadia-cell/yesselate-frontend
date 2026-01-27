# Runbook Bench – P19

Procédure pour exécuter la batterie de bench (smoke / baseline / stress / soak), analyser les résultats et appliquer les **critères Go/No‑Go**.

---

## 1. Prérequis

- App ciblée démarrée (ex. `npm run dev` sur `http://localhost:4001` ou URL de staging).
- [k6](https://k6.io/docs/getting-started/installation/) installé.
- (Optionnel) Seed bench exécuté : `26_seed_bench_p19.sql` ou `bench/seed_demo.sql` (tenant T-DEMO). Les MViews sont rafraîchies par le worker Event‑Driven + CRON ; en bench immédiat, déclencher un refresh ou attendre un cycle.

---

## 2. Ordre d’exécution recommandé

| Étape | Script | Durée | Objectif |
|-------|--------|-------|----------|
| 1 | `k6 run bench/k6/smoke.js` | 1 min | Vérifier que les routes critiques répondent. |
| 2 | `k6 run bench/k6/baseline.js` | 5 min | Charge « normale » reproductible. |
| 3 | `k6 run bench/k6/stress.js` | ~12 min | Ramp‑up pour identifier le breakpoint. |
| 4 | `k6 run bench/k6/soak.js` | 30 min | Stabilité sous charge soutenue. |
| 5 | `k6 run bench/k6/dashboard_scenarios.js` | ~8 min | Browsing + exports (ramping-arrival-rate). |
| 6 | `k6 run bench/k6/mix_scenarios.js` | ~8 min | Mix 50 % browse / 30 % export / 20 % alerts test (heures de pointe). |

Variables utiles :

```bash
export BASE_URL=http://localhost:4001
export TENANT_ID=a1b2c3d4-e5f6-4789-a012-demo00000001   # T-DEMO (seed_demo) ou bench (26_seed_bench_p19)
export AUTH_TOKEN=…   # optionnel : JWT Bearer si l’API l’exige
k6 run bench/k6/baseline.js
```

---

## 3. Critères Go/No‑Go

À évaluer **par scénario** (smoke, baseline, stress, soak), en s’appuyant sur les SLOs [P19](P19_BENCH_CAPACITY_PLANNING.md#2-slos--budgets-de-perf-consolidés).

### 3.1 Go (vert)

- **Smoke** : taux d’erreur HTTP &lt; 5 %, P95 &lt; 5 s sur les routes touchées.
- **Baseline** : taux d’erreur &lt; 1 %, P95 dashboard &lt; 500 ms, P95 export &lt; 1,5 s.
- **Stress** : taux d’erreur &lt; 5 % pendant le ramp‑up ; on note le **breakpoint** (RPS ou VUs à partir desquels la dégradation est nette).
- **Soak** : taux d’erreur &lt; 1 %, pas de dérive marquée des latences sur la durée.

### 3.2 No‑Go (rouge)

- Taux d’erreur &gt; 5 % (smoke/stress) ou &gt; 1 % (baseline/soak).
- P95 dashboard &gt; 900 ms ou P99 &gt; 2 s de façon répétée.
- Chute durable du throughput ou timeouts en masse.

En **No‑Go** : analyser logs (API, DB, Redis), métriques Prometheus/Grafana, puis tuning (DB pool, Redis, rate‑limit, back‑pressure, etc.) et rejouer les scénarios concernés.

---

## 4. Pipeline CI / GitHub Actions

Un job **bench** peut lancer uniquement le **smoke** (et éventuellement le **baseline**) pour une validation rapide sur chaque PR ou build nocturne.

- Workflow : [bench.yml](../../.github/workflows/bench.yml) (optionnel).
- Critères CI : **smoke** doit être **Go** ; si **baseline** est exécuté, **Go** aussi.

---

## 5. Rapport de capacité

Après stress (et si possible soak), remplir le [CAPACITY_REPORT_TEMPLATE.md](CAPACITY_REPORT_TEMPLATE.md) :

- RPS / TPS soutenu, nombre d’utilisateurs concurrents (VUs) équivalent.
- **Breakpoint** observé (RPS ou VUs).
- Marges par rapport aux SLOs et recommandations (sizing, HPA/VPA, back‑pressure).

---

## Références

- [P19_BENCH_CAPACITY_PLANNING.md](P19_BENCH_CAPACITY_PLANNING.md)
- [CAPACITY_REPORT_TEMPLATE.md](CAPACITY_REPORT_TEMPLATE.md)
- `bench/k6/README.md`
