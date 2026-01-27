# Phase P16: FinOps & Cost Guardrails - Déploiement

## 📋 Vue d'ensemble

Système de quotas, budgets et contrôle des coûts par tenant/module/route pour maîtriser la charge et les coûts (API, DB, exports, jobs) tout en garantissant les SLO définis en P11.

**Compatibilité** : Aucun changement d'UX. Le routeur, registry, Sidebar/Subnav et KPI Bar restent inchangés.

## 🗂️ Fichiers

- **`lib/server/dashboard/sql/25_finops.sql`** : Schéma complet FinOps (quotas, budgets, consommation, gouvernance)

## 🚀 Déploiement

### 1. Exécuter le script SQL

```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/25_finops.sql
```

### 2. Vérification

```sql
-- Vérifier que les tables existent
SELECT COUNT(*) FROM finops_quotas;
SELECT COUNT(*) FROM finops_budgets;
SELECT COUNT(*) FROM finops_consumption;
SELECT COUNT(*) FROM finops_quota_usage;
SELECT COUNT(*) FROM finops_governance_logs;

-- Vérifier les vues matérialisées
SELECT COUNT(*) FROM rm_finops_consumption_daily;
SELECT COUNT(*) FROM rm_finops_quota_usage_pct;
```

### 3. Rafraîchir les vues matérialisées

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finops_consumption_daily;
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finops_quota_usage_pct;
```

## 📊 Structure

### Tables principales

1. **`finops_quotas`** : Quotas par tenant/module
   - Types : `api_requests`, `export_csv`, `export_xlsx`, `export_pdf`, `bytes_out`, `rows_max`, `refresh_mview`, `jobs_background`
   - Périodes : `daily`, `monthly`
   - Soft limit (80% par défaut) et hard limit (100%)

2. **`finops_budgets`** : Budgets SLO/SLA dynamiques
   - Types : `slo_response_time`, `slo_availability`, `cpu_time`, `db_query_time`, `api_latency_p95`, `error_rate`
   - Seuils : `target_value`, `warning_threshold`, `critical_threshold` (déclenche back-pressure)

3. **`finops_consumption`** : Tracking de consommation
   - Métriques : `bytes_out`, `rows_returned`, `cpu_time_ms`, `api_time_ms`, `db_time_ms`
   - Statut : `allowed`, `soft_limit`, `hard_limit`, `back_pressure`

4. **`finops_quota_usage`** : Agrégation d'usage par quota/période
   - Calcul rapide sans scan complet de `finops_consumption`
   - Mis à jour atomiquement via `finops_increment_quota_usage()`

5. **`finops_governance_logs`** : Logs de gouvernance
   - Événements : `quota_soft_limit`, `quota_hard_limit`, `budget_warning`, `budget_critical`, `back_pressure_triggered`, `back_pressure_released`, `degradation_graceful`
   - Actions : `refused`, `throttled`, `degraded`, `allowed_with_warning`

### Vues matérialisées

1. **`rm_finops_consumption_daily`** : Agrégation quotidienne par tenant/module/type
2. **`rm_finops_quota_usage_pct`** : Utilisation de quotas en pourcentage avec statut

### Fonctions utilitaires

1. **`finops_get_period_bounds(period, date)`** : Calcule les bornes de période (début/fin)
2. **`finops_increment_quota_usage(quota_id, increment)`** : Incrémente l'usage d'un quota (atomique)

## 🎯 Exemples d'utilisation

### Créer un quota

```sql
-- Quota : 10000 requêtes API/jour par tenant
INSERT INTO finops_quotas (tenant_id, module, quota_type, period, limit_value, soft_limit_pct)
VALUES (
  'tenant-uuid',
  NULL,  -- Global tenant
  'api_requests',
  'daily',
  10000,
  80
);

-- Quota : 100 exports XLSX/mois pour le module achats
INSERT INTO finops_quotas (tenant_id, module, quota_type, period, limit_value, soft_limit_pct)
VALUES (
  'tenant-uuid',
  'achats',
  'export_xlsx',
  'monthly',
  100,
  80
);
```

### Créer un budget SLO

```sql
-- Budget : Temps de réponse P95 < 200ms
INSERT INTO finops_budgets (tenant_id, module, budget_type, period, target_value, warning_threshold, critical_threshold)
VALUES (
  'tenant-uuid',
  NULL,
  'api_latency_p95',
  'daily',
  200,   -- Target : 200ms
  250,   -- Warning : 250ms
  300    -- Critical : 300ms (déclenche back-pressure)
);
```

### Vérifier l'usage d'un quota

```sql
-- Usage actuel d'un quota
SELECT 
  q.*,
  u.current_usage,
  (u.current_usage::NUMERIC / q.limit_value * 100) AS usage_pct,
  CASE
    WHEN u.current_usage >= q.limit_value THEN 'hard_limit'
    WHEN u.current_usage >= (q.limit_value * q.soft_limit_pct / 100) THEN 'soft_limit'
    ELSE 'ok'
  END AS status
FROM finops_quotas q
LEFT JOIN finops_quota_usage u ON q.id = u.quota_id
WHERE q.tenant_id = 'tenant-uuid' AND q.quota_type = 'api_requests';
```

### Consulter les logs de gouvernance

```sql
-- Logs de refus/soft limits des dernières 24h
SELECT 
  event_type,
  module,
  route_key,
  current_value,
  limit_value,
  action_taken,
  message,
  occurred_at
FROM finops_governance_logs
WHERE tenant_id = 'tenant-uuid'
  AND occurred_at >= now() - INTERVAL '24 hours'
ORDER BY occurred_at DESC;
```

## 🔧 Maintenance

### Nettoyage automatique (CRON)

```sql
-- Supprimer les consommations de plus de 90 jours
DELETE FROM finops_consumption 
WHERE occurred_at < now() - INTERVAL '90 days';

-- Supprimer les logs de gouvernance de plus de 180 jours
DELETE FROM finops_governance_logs 
WHERE occurred_at < now() - INTERVAL '180 days';
```

### Rafraîchissement des vues matérialisées

```sql
-- Rafraîchir quotidiennement (CRON)
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finops_consumption_daily;
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finops_quota_usage_pct;
```

## 📝 Notes importantes

1. **Partitionnement** : Pour de gros volumes, envisager le partitionnement de `finops_consumption` par mois
2. **Performance** : Les vues matérialisées doivent être rafraîchies régulièrement (quotidiennement)
3. **Soft limits** : Les soft limits déclenchent des avertissements mais n'empêchent pas l'opération
4. **Hard limits** : Les hard limits refusent l'opération (HTTP 429)
5. **Back-pressure** : Activée automatiquement si `critical_threshold` d'un budget est dépassé

## 🎉 Prochaines étapes

1. Créer les quotas par défaut pour chaque tenant
2. Instrumenter les endpoints API pour tracker la consommation
3. Implémenter la logique de vérification de quotas dans les route handlers
4. Créer le rapport FinOps pour les administrateurs tenant
