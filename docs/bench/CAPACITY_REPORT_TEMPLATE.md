# Rapport de capacité – P19 (template)

À compléter après les runs **stress** et **soak**. Conserver une version par environnement (ex. staging, prod) et par date.

---

## 1. Contexte

| Champ | Valeur |
|-------|--------|
| **Date** | |
| **Environnement** | local / staging / prod |
| **Version app** | (commit ou tag) |
| **Config** | DB pool, Redis, workers, HPA/VPA si applicable |

---

## 2. Résultats synthèse

| Scénario | Durée | VUs (max) | RPS moyen | P95 (ms) | P99 (ms) | Taux erreur |
|----------|-------|-----------|-----------|----------|----------|-------------|
| Smoke | 1 min | 2 | | | | |
| Baseline | 5 min | 10 | | | | |
| Stress | ~12 min | 150 | | | | |
| Soak | 30 min | 25 | | | | |

---

## 3. Breakpoint (stress)

- **RPS ou VUs** à partir desquels dégradation nette (latence, erreurs) :
- **Observation** (ex. saturation DB, Redis, CPU, rate‑limit) :

---

## 4. Utilisateurs concurrents / TPS soutenu

- **Utilisateurs concurrents** (équivalent VUs) supportés en respectant les SLOs :
- **TPS soutenu** (requêtes/s) :
- **Marge** par rapport à la cible métier (ex. « 2× la charge attendue ») :

---

## 5. Marges & recommandations

- **Dashboard** (P95 ≤ 400 ms, P99 ≤ 900 ms) : marge observée / action si besoin.
- **Exports** (P95 ≤ 800 ms csv/json, ≤ 2 s xlsx/pdf) : marge / action.
- **Alertes test** (P95 ≤ 1 s, P99 ≤ 2 s) : marge / action.
- **Tuning proposé** : DB, Redis, workers, rate‑limit, back‑pressure, HPA/VPA.

---

## 6. Go/No‑Go

- [ ] **Go** : critères runbook respectés pour les scénarios exécutés.
- [ ] **No‑Go** : écarts identifiés ; actions listées ci‑dessus.

---

*Réf. : [P19_BENCH_CAPACITY_PLANNING.md](P19_BENCH_CAPACITY_PLANNING.md), [RUNBOOK_BENCH.md](RUNBOOK_BENCH.md).*
