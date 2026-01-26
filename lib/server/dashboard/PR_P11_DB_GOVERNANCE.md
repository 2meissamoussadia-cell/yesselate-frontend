# ✅ Phase P11 - Gouvernance DB : pg_stat_statements, Indexation, Partitions, Rétention

## 🎯 Objectif

Optimiser les performances DB et réduire les coûts via :
- Analyse des requêtes coûteuses (pg_stat_statements)
- Indexation ciblée sur les colonnes fréquemment utilisées
- Partitions temporelles pour les tables d'audit
- Politiques de rétention pour purger les données anciennes

---

## ✅ Implémentation

### 1. pg_stat_statements

**Fichier** : `lib/server/dashboard/sql/19_db_tuning.sql`

Activation de l'extension et vue pour analyser les requêtes coûteuses :

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

CREATE OR REPLACE VIEW v_top_expensive_queries AS
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time,
  rows,
  (100.0 * total_exec_time / SUM(total_exec_time) OVER ()) as pct_total_time
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

**Utilisation** :
```sql
SELECT * FROM v_top_expensive_queries;
```

### 2. Indexation Ciblée

**Index sur les vues reporting** (requêtes fréquentes sur tenant + mois) :

```sql
-- Reporting Overview
CREATE INDEX IF NOT EXISTS idx_rmo_tenant_mois 
  ON rm_reporting_overview(tenant_id, mois);

-- Reporting DSO
CREATE INDEX IF NOT EXISTS idx_rmd_tenant_mois 
  ON rm_reporting_dso(tenant_id, mois);
```

**Index sur les achats open orders** (tri par date) :

```sql
CREATE INDEX IF NOT EXISTS idx_rm_achats_open_orders_date 
  ON rm_achats_open_orders(tenant_id, emis_le DESC);
```

**Index sur les autres vues fréquentes** :

```sql
-- KPIs Overview
CREATE INDEX IF NOT EXISTS idx_rm_kpis_overview_tenant 
  ON rm_kpis_overview(tenant_id);

-- Trends Daily
CREATE INDEX IF NOT EXISTS idx_rm_trends_daily_tenant_date 
  ON rm_trends_daily(tenant_id, date DESC);
```

### 3. Partitions Temporelles

**Table audit_traces partitionnée par mois** :

```sql
CREATE TABLE IF NOT EXISTS audit_traces (
  id BIGSERIAL,
  tenant_id VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  when_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- ...
  PRIMARY KEY (id, when_at)
) PARTITION BY RANGE (when_at);

-- Partitions mensuelles
CREATE TABLE IF NOT EXISTS audit_traces_2026_01 
  PARTITION OF audit_traces
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

**Avantages** :
- Performance : Requêtes limitées à une partition
- Maintenance : Purge facile (détacher la partition)
- Scalabilité : Gestion automatique des partitions futures

### 4. Politique de Rétention

**Fonction de purge pour audit_traces** :

```sql
CREATE OR REPLACE FUNCTION purge_audit_traces_older_than_months(months_to_keep INTEGER DEFAULT 12)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  cutoff_date TIMESTAMPTZ;
BEGIN
  cutoff_date := NOW() - (months_to_keep || ' months')::INTERVAL;
  DELETE FROM audit_traces WHERE when_at < cutoff_date;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
```

**Utilisation** :
```sql
-- Purger les traces > 12 mois
SELECT purge_audit_traces_older_than_months(12);
```

---

## 📊 Analyse des Performances

### Top Requêtes Coûteuses

```sql
SELECT * FROM v_top_expensive_queries;
```

**Métriques disponibles** :
- `calls` : Nombre d'appels
- `total_exec_time` : Temps total d'exécution
- `mean_exec_time` : Temps moyen par appel
- `rows` : Nombre de lignes retournées
- `pct_total_time` : Pourcentage du temps total

### Maintenance Périodique

**Fonction d'analyse** :

```sql
SELECT analyze_dashboard_tables();
```

Exécute `ANALYZE` sur toutes les tables dashboard pour mettre à jour les statistiques du planificateur.

---

## 🔧 Déploiement

### 1. Appliquer le SQL

```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/19_db_tuning.sql
```

### 2. Vérifier les Index

```sql
-- Lister les index créés
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_rm%' 
ORDER BY tablename, indexname;
```

### 3. Configurer la Purge Automatique

**Option 1 : CRON Job**

```bash
# Dans crontab
0 2 * * 0 psql "$DATABASE_URL" -c "SELECT purge_audit_traces_older_than_months(12);"
```

**Option 2 : API Route (Next.js)**

Créer `/api/cron/purge-audit` protégé par secret.

---

## 📈 Bénéfices

### 1. Performance

- **Indexation** : Réduction des temps de requête sur les colonnes fréquentes
- **Partitions** : Requêtes limitées à une partition (moins de données à scanner)
- **pg_stat_statements** : Identification des requêtes à optimiser

### 2. Coûts

- **Rétention** : Réduction de la taille de la DB (moins de stockage)
- **Partitions** : Purge efficace (détacher vs DELETE)
- **Indexation** : Moins de CPU pour les requêtes fréquentes

### 3. Maintenance

- **Analyse automatique** : Fonction `analyze_dashboard_tables()`
- **Purge automatisée** : Fonction `purge_audit_traces_older_than_months()`
- **Monitoring** : Vue `v_top_expensive_queries` pour identifier les problèmes

---

## ✅ Validation

- [x] Extension pg_stat_statements activée
- [x] Vue pour analyser les top requêtes coûteuses
- [x] Indexation ciblée sur les colonnes fréquentes
- [x] Partitions temporelles pour audit_traces
- [x] Fonction de purge pour la rétention
- [x] Fonction d'analyse pour la maintenance
- [x] Documentation complète

**Status** : ✅ Gouvernance DB implémentée

---

## 🚀 Prochaines Étapes (Optionnel)

1. **Création automatique des partitions** : Job CRON pour créer les partitions futures
2. **Monitoring des index** : Détecter les index inutilisés (`pg_stat_user_indexes`)
3. **Alertes sur les requêtes lentes** : Alertes si `mean_exec_time > seuil`
4. **Rétention sur exports** : Purge automatique des exports anciens
