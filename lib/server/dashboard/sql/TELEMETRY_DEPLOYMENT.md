# Déploiement Télémétrie - Phase P14

## 📋 Vue d'ensemble

Table et vue matérialisée pour stocker les événements de télémétrie du dashboard de manière minimale et performante.

## 🗂️ Fichiers

- **`lib/server/dashboard/sql/22_telemetry.sql`** : Table `telemetry_events` + vue matérialisée `rm_telemetry_views_daily`

## 🚀 Déploiement

### 1. Exécuter le script SQL

```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/22_telemetry.sql
```

### 2. Vérification

```sql
-- Vérifier que la table existe
SELECT COUNT(*) FROM telemetry_events;

-- Vérifier que la vue matérialisée existe
SELECT COUNT(*) FROM rm_telemetry_views_daily;
```

### 3. Rafraîchir la vue matérialisée (après insertion de données)

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_telemetry_views_daily;
```

## 📊 Structure

### Table `telemetry_events`

- **`id`** : BIGSERIAL (clé primaire)
- **`tenant_id`** : UUID (multi-tenant)
- **`user_id`** : TEXT (pseudonymisé si nécessaire)
- **`occurred_at`** : TIMESTAMPTZ (date/heure de l'événement)
- **`event_name`** : TEXT (type d'événement)
- **`route_key`** : TEXT (clé de route, ex: 'overview::summary::dashboard')
- **`props`** : JSONB (propriétés spécifiques)
- **`user_agent`** : TEXT (user agent du navigateur)
- **`ip_hash`** : TEXT (hash SHA256 de l'IP pour anonymisation)

### Types d'événements (`event_name`)

- `view_opened` : Ouverture d'une vue/page
- `kpi_click` : Clic sur un KPI
- `export_triggered` : Déclenchement d'un export
- `filter_applied` : Application d'un filtre
- `error` : Erreur rencontrée
- `perf` : Événement de performance

### Vue matérialisée `rm_telemetry_views_daily`

Agrégation quotidienne des vues ouvertes par tenant et route :
- `tenant_id` : ID du tenant
- `route_key` : Clé de route
- `d` : Date (jour)
- `views` : Nombre de vues

## 🔧 Maintenance

### Nettoyage automatique (CRON)

```sql
-- Supprimer les événements de plus de 180 jours
SELECT cleanup_telemetry_events(180);
```

**Configuration CRON** (exemple) :
```bash
# Nettoyer les événements de plus de 180 jours tous les dimanches à 2h
0 2 * * 0 psql "$DATABASE_URL" -c "SELECT cleanup_telemetry_events(180);"
```

### Rafraîchissement de la vue matérialisée

```sql
-- Rafraîchir la vue matérialisée (à faire quotidiennement ou après nettoyage)
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_telemetry_views_daily;
```

**Configuration CRON** (exemple) :
```bash
# Rafraîchir la vue matérialisée tous les jours à 3h
0 3 * * * psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_telemetry_views_daily;"
```

## 📈 Requêtes utiles

### Volume de vues par page (derniers 7 jours)

```sql
SELECT 
  route_key,
  SUM(views) AS total_views
FROM rm_telemetry_views_daily
WHERE d >= NOW() - INTERVAL '7 days'
GROUP BY route_key
ORDER BY total_views DESC;
```

### Événements par type (derniers 30 jours)

```sql
SELECT 
  event_name,
  COUNT(*) AS count
FROM telemetry_events
WHERE occurred_at >= NOW() - INTERVAL '30 days'
GROUP BY event_name
ORDER BY count DESC;
```

### Top 10 pages les plus consultées (derniers 30 jours)

```sql
SELECT 
  route_key,
  SUM(views) AS total_views
FROM rm_telemetry_views_daily
WHERE d >= NOW() - INTERVAL '30 days'
GROUP BY route_key
ORDER BY total_views DESC
LIMIT 10;
```

## 🔒 Sécurité & Confidentialité

- **`user_id`** : Pseudonymisé côté serveur si nécessaire
- **`ip_hash`** : Hash SHA256 de l'IP avec salt pour anonymisation
- **`props`** : Taille contrôlée (éviter de stocker des données sensibles)
- **Rétention** : Politique de rétention configurable (défaut: 180 jours)

## ⚠️ Notes importantes

1. **Performance** : Les index sont optimisés pour les requêtes par tenant et par date
2. **Stockage** : La table peut grossir rapidement, d'où la politique de rétention
3. **Vue matérialisée** : Doit être rafraîchie régulièrement pour rester à jour
4. **JSONB** : Le champ `props` permet de stocker des données flexibles mais doit être utilisé avec parcimonie

---

**Dernière mise à jour** : 2026-01-26
