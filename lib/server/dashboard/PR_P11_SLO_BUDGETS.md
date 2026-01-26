# ✅ Phase P11 - Budgets de Performance & SLO

## 🎯 Objectif

Définir des budgets de performance (P95/P99) par route et alerter automatiquement si les budgets sont dépassés.

---

## ✅ Implémentation

### 1. Budgets par Route

**Fichier** : `app/api/internal/metrics/budgets.ts`

Budgets définis pour chaque endpoint :

```typescript
export const BUDGETS: Record<string, PerformanceBudget> = {
  '/api/dashboard/[main]/[sub]/[leaf]': {
    p95_ms: 400,  // 95% des requêtes < 400ms
    p99_ms: 900,  // 99% des requêtes < 900ms
  },
  '/api/export/dashboard': {
    p95_ms: 800,
    p99_ms: 1500,
  },
  // ...
};
```

**Normalisation des routes** :
- Routes dynamiques : `/api/dashboard/overview/summary/dashboard` → `/api/dashboard/[main]/[sub]/[leaf]`
- Routes d'export : `/api/export/dashboard/csv` → `/api/export/dashboard/csv`

### 2. Vérification des Budgets

**Intégration dans la route** :

```typescript
const durationMs = Math.round(seconds * 1000);
const budget = getBudgetForRoute(route);

if (budget) {
  if (durationMs > budget.p95_ms) {
    // Alerte P95 dépassé
    sloBudgetExceededCounter.inc({ route, budget_type: 'p95' });
    log.warn({ durationMs, budgetP95: budget.p95_ms }, '[SLO] P95 budget exceeded');
  }
  if (durationMs > budget.p99_ms) {
    // Alerte P99 dépassé
    sloBudgetExceededCounter.inc({ route, budget_type: 'p99' });
    log.warn({ durationMs, budgetP99: budget.p99_ms }, '[SLO] P99 budget exceeded');
  }
}
```

### 3. Métriques Prometheus

**Nouvelle métrique** : `dashboard_slo_budget_exceeded_total`

- Labels : `route`, `budget_type` ('p95' | 'p99')
- Compte le nombre de violations de budget

**Utilisation** :
```promql
# Taux de violations P95
rate(dashboard_slo_budget_exceeded_total{budget_type="p95"}[5m])

# Routes avec le plus de violations
topk(10, sum by (route) (dashboard_slo_budget_exceeded_total))
```

---

## 📊 Budgets Définis

### Dashboard Principal

- **Route** : `/api/dashboard/[main]/[sub]/[leaf]`
- **P95** : 400ms (navigation normale)
- **P99** : 900ms

### Exports

- **CSV** : P95 1000ms, P99 2000ms
- **JSON** : P95 600ms, P99 1200ms
- **PDF** : P95 2000ms, P99 4000ms
- **Excel** : P95 1500ms, P99 3000ms

### API RBAC

- **Permissions** : P95 200ms, P99 500ms
- **Policy** : P95 150ms, P99 400ms

---

## 🚨 Alertes

### Logs

Les violations sont loggées avec niveau `warn` :

```json
{
  "route": { "main": "overview", "sub": "summary", "leaf": "dashboard" },
  "durationMs": 450,
  "budgetP95": 400,
  "exceeded": 50
}
```

### Métriques Prometheus

Compteur `dashboard_slo_budget_exceeded_total` incrémenté à chaque violation.

### Alertes Prometheus (Optionnel)

```yaml
# Exemple de règle d'alerte
- alert: HighSLOViolationRate
  expr: rate(dashboard_slo_budget_exceeded_total[5m]) > 0.1
  for: 5m
  annotations:
    summary: "High SLO violation rate detected"
```

---

## 📈 Utilisation

### Vérifier les Violations

```sql
-- Via Prometheus
SELECT * FROM dashboard_slo_budget_exceeded_total;
```

### Analyser les Tendances

```promql
# Taux de violations par route
sum by (route) (rate(dashboard_slo_budget_exceeded_total[1h]))
```

---

## ✅ Validation

- [x] Budgets définis pour toutes les routes principales
- [x] Normalisation des routes dynamiques
- [x] Vérification automatique dans les routes
- [x] Métriques Prometheus pour les violations
- [x] Logs d'alerte structurés
- [x] Documentation complète

**Status** : ✅ Budgets SLO implémentés avec alertes automatiques

---

## 🚀 Prochaines Étapes (Optionnel)

1. **Dashboard Grafana** : Visualiser les violations de budget en temps réel
2. **Alertes PagerDuty** : Notifications automatiques si taux de violation > seuil
3. **Ajustement dynamique** : Ajuster les budgets selon les tendances observées
4. **Budget par tenant** : Budgets différents selon le tenant (si nécessaire)
