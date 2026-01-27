# k6 – P19 Bench

Prérequis : [k6](https://k6.io/docs/getting-started/installation/) installé (`choco install k6` / `brew install k6`).

## Variables d'environnement

- `BASE_URL` : base de l’app (défaut `http://localhost:4001`)
- `TENANT_ID` : tenant (défaut `default` ; seed `26_seed_bench_p19` : `a1b2c3d4-e5f6-4789-a012-bench00000001` ; seed `bench/seed_demo` : `a1b2c3d4-e5f6-4789-a012-demo00000001`)
- `AUTH_TOKEN` : JWT Bearer (optionnel) ; si défini, les requêtes utilisent `Authorization: Bearer <token>` à la place de `x-tenant-id` / `x-user-id` / `x-roles`
- `USER_ID`, `ROLES` : optionnels

## Lancer les scénarios

```bash
# Smoke (5 min en campagne type)
k6 run bench/k6/smoke.js
# ou : k6 run --duration 5m bench/k6/smoke.js

# Baseline (15–30 min en campagne type)
k6 run bench/k6/baseline.js
# ou : k6 run --duration 30m --vus 20 bench/k6/baseline.js

# Stress (ramp-up, ~12 min)
k6 run bench/k6/stress.js

# Soak (2–4 h en campagne type)
k6 run bench/k6/soak.js
# ou : k6 run --duration 2h bench/k6/soak.js

# Browsing + exports (ramping-arrival-rate, ~8 min)
k6 run bench/k6/dashboard_scenarios.js

# Mix heures de pointe (50 % browse / 30 % export / 20 % alerts test, ~8 min)
k6 run bench/k6/mix_scenarios.js
```

Avec tenant bench :

```bash
k6 run -e BASE_URL=http://localhost:4001 -e TENANT_ID=a1b2c3d4-e5f6-4789-a012-demo00000001 bench/k6/baseline.js
```

## Sortie

k6 affiche résumé, throughput, latences (p95, p99), taux d’erreur. À comparer aux SLOs (voir [P19_BENCH_CAPACITY_PLANNING.md](../../docs/bench/P19_BENCH_CAPACITY_PLANNING.md)).
