# ✅ Phase P11 - Dashboards Grafana/Prometheus pour Budgets SLO

## 🎯 Objectif

Créer des dashboards Grafana et des alertes Prometheus pour visualiser et surveiller les budgets SLO en temps réel.

**Aucun impact UX** : Monitoring backend uniquement, invisible pour les utilisateurs finaux.

---

## ✅ Implémentation

### 1. Requêtes Prometheus

**Fichier** : `lib/server/observability/prometheus/slo_queries.ts`

Requêtes prêtes à l'emploi pour :
- **P95/P99 par route** : Percentiles de latence
- **Violations de budget** : Taux de violations P95/P99
- **Taux de réussite SLO** : Pourcentage de requêtes respectant les budgets
- **Top routes problématiques** : Identification des routes avec le plus de violations

**Exemples de requêtes** :

```promql
# P95 de la durée par route
histogram_quantile(0.95, 
  sum(rate(dashboard_api_request_duration_seconds_bucket[5m])) by (le, route)
) by (route)

# Taux de violations P95
sum(rate(dashboard_slo_budget_exceeded_total{budget_type="p95"}[5m])) by (route)

# Taux de réussite SLO (P95)
(1 - (
  sum(rate(dashboard_slo_budget_exceeded_total{budget_type="p95"}[5m])) by (route)
  /
  sum(rate(dashboard_api_request_duration_seconds_count[5m])) by (route)
)) * 100
```

### 2. Alertes Prometheus

**Fichier** : `lib/server/observability/prometheus/slo_alerts.yml`

Alertes configurées :

1. **HighP95ViolationRate** : Alerte si > 5% de violations P95 sur 5 min
2. **HighP99ViolationRate** : Alerte si > 2% de violations P99 sur 5 min
3. **P95SignificantlyExceeded** : Alerte si P95 > 600ms (budget + 50%)
4. **CriticalRouteHighViolations** : Alerte si > 10 violations/min sur route critique
5. **HighTTFB** : Alerte si TTFB P95 > 500ms

**Configuration** :
```yaml
groups:
  - name: dashboard_slo_budgets
    interval: 30s
    rules:
      - alert: HighP95ViolationRate
        expr: |
          (sum(rate(dashboard_slo_budget_exceeded_total{budget_type="p95"}[5m])) by (route)
          / sum(rate(dashboard_api_request_duration_seconds_count[5m])) by (route)) > 0.05
        for: 5m
        labels:
          severity: warning
```

### 3. Dashboard Grafana

**Fichier** : `lib/server/observability/prometheus/grafana_dashboard.json`

Dashboard complet avec 7 panels :

1. **P95/P99 Latency par Route** (graphique)
   - Visualise les percentiles de latence en temps réel
   - Permet de comparer avec les budgets définis

2. **Violations de Budget SLO** (graphique)
   - Taux de violations P95/P99 par route
   - Identification des pics de violations

3. **Taux de Réussite SLO (P95)** (gauge)
   - Pourcentage de requêtes respectant le budget P95
   - Seuils : < 95% (rouge), 95-99% (jaune), > 99% (vert)

4. **Taux de Réussite SLO (P99)** (gauge)
   - Pourcentage de requêtes respectant le budget P99
   - Seuils : < 98% (rouge), 98-99.5% (jaune), > 99.5% (vert)

5. **Top 10 Routes avec Violations** (tableau)
   - Liste des routes les plus problématiques
   - Tri par nombre total de violations

6. **TTFB (Time To First Byte) P95** (graphique)
   - Temps jusqu'au premier byte de la réponse
   - Détection de problèmes réseau/serveur

7. **Durée Moyenne vs Max par Route** (graphique)
   - Comparaison moyenne vs maximum
   - Identification des outliers

---

## 📊 Utilisation

### 1. Importer le Dashboard Grafana

**Option 1 : Import JSON**
1. Ouvrir Grafana
2. Aller dans **Dashboards** → **Import**
3. Coller le contenu de `grafana_dashboard.json`
4. Configurer la source de données Prometheus

**Option 2 : Via API**
```bash
curl -X POST http://grafana:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GRAFANA_API_KEY" \
  -d @lib/server/observability/prometheus/grafana_dashboard.json
```

### 2. Configurer les Alertes Prometheus

**Option 1 : Fichier de règles**
1. Ajouter `slo_alerts.yml` dans le répertoire des règles Prometheus
2. Configurer dans `prometheus.yml` :
```yaml
rule_files:
  - "slo_alerts.yml"
```

**Option 2 : Via API**
```bash
# Charger les règles
curl -X POST http://prometheus:9090/api/v1/rules \
  -H "Content-Type: application/json" \
  -d @lib/server/observability/prometheus/slo_alerts.yml
```

### 3. Utiliser les Requêtes Directement

**Dans Prometheus UI** :
1. Aller dans **Graph**
2. Coller une requête de `slo_queries.ts`
3. Visualiser les résultats

**Dans Grafana** :
1. Créer un nouveau panel
2. Utiliser une requête de `GRAFANA_QUERIES`
3. Configurer le type de visualisation

---

## 📈 Métriques Disponibles

### Métriques de Base

- `dashboard_api_request_duration_seconds` : Histogramme de durée des requêtes
- `dashboard_slo_budget_exceeded_total` : Compteur de violations de budget
- `dashboard_api_ttfb_seconds` : Histogramme de TTFB

### Requêtes Utiles

**P95 par route** :
```promql
histogram_quantile(0.95, 
  sum(rate(dashboard_api_request_duration_seconds_bucket[5m])) by (le, route)
) by (route)
```

**Violations sur 1h** :
```promql
sum(increase(dashboard_slo_budget_exceeded_total[1h])) by (route, budget_type)
```

**Taux de réussite SLO** :
```promql
(1 - (
  sum(rate(dashboard_slo_budget_exceeded_total{budget_type="p95"}[5m])) by (route)
  /
  sum(rate(dashboard_api_request_duration_seconds_count[5m])) by (route)
)) * 100
```

---

## 🚨 Alertes Configurées

### Niveaux de Sévérité

- **Warning** : Violations modérées (> 5% P95, > 2% P99)
- **Critical** : Dépassements significatifs (P95 > 600ms, > 10 violations/min)

### Actions Recommandées

1. **HighP95ViolationRate** :
   - Vérifier les logs de la route concernée
   - Analyser les requêtes DB lentes (`pg_stat_statements`)
   - Vérifier la charge serveur

2. **P95SignificantlyExceeded** :
   - Investigation immédiate
   - Vérifier les index DB
   - Analyser les requêtes N+1
   - Vérifier la saturation du cache

3. **HighTTFB** :
   - Vérifier la latence réseau
   - Analyser les temps de réponse serveur
   - Vérifier la charge CPU/mémoire

---

## ✅ Validation

- [x] Requêtes Prometheus documentées
- [x] Alertes Prometheus configurées
- [x] Dashboard Grafana complet (7 panels)
- [x] Documentation d'utilisation
- [x] Exemples de requêtes
- [x] Guide de déploiement

**Status** : ✅ Dashboards et alertes SLO prêts pour production

---

## 🚀 Prochaines Étapes (Optionnel)

1. **Dashboard personnalisé par tenant** : Filtrer les métriques par tenant_id
2. **Alertes PagerDuty** : Intégration avec système d'alerting externe
3. **Rapports automatiques** : Génération de rapports SLO hebdomadaires
4. **Ajustement dynamique des budgets** : Ajuster les budgets selon les tendances observées
