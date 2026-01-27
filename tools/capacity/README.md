# Calculateur de capacité (pods & DB IOPS)

P19 – dimensionnement à partir du modèle de charge et des mesures baseline.

**Règle pratique** : viser **70 %** des capacités (30 % marge).

## Usage

```ts
import { plan } from './calc';

const r = plan({
  targetRpsDashboard: 120,
  p95msDashboard: 400,
  rpsPerPod: 35,
  dbIopsPerReq: 4,
  dbIopsMax: 1000,
});
// → { podsNeeded: 4, concurrency: 48, dbIops: 480, dbOk: true }
```

## Entrées

| Champ | Description |
|-------|-------------|
| `targetRpsDashboard` | Cible RPS sur `/api/dashboard` (ex. 120) |
| `p95msDashboard` | P95 latence visée (ms, ex. 400) |
| `rpsPerPod` | RPS par pod à P95 ok (baseline, ex. 35) |
| `dbIopsPerReq` | IO moyens par requête (ex. 4) |
| `dbIopsMax` | Budget IOPS (70 % du cluster) |

## Sortie

- **podsNeeded** : nombre de pods API à prévoir
- **concurrency** : Little’s Law ≈ RPS × latence (s)
- **dbIops** : IOPS DB estimés
- **dbOk** : `dbIops ≤ dbIopsMax`

Voir [P19_BENCH_CAPACITY_PLANNING.md](../../docs/bench/P19_BENCH_CAPACITY_PLANNING.md).
