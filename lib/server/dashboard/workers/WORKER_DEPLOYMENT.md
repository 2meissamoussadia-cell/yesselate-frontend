# Déploiement du Worker Event-Driven Refresh

## 🎯 Objectif

Le worker écoute les notifications PostgreSQL (`pg_notify`) et rafraîchit automatiquement les vues matérialisées concernées par les changements de données.

## 📋 Prérequis

- PostgreSQL avec `LISTEN/NOTIFY` activé
- Variables d'environnement : `DATABASE_URL` (obligatoire)
- Node.js 18+ ou équivalent

## 🚀 Méthodes de démarrage

### Option 1: Exécution directe avec tsx (recommandé)

```bash
# Développement
npx tsx scripts/start-refresh-worker.ts

# Production
NODE_ENV=production DATABASE_URL=postgres://user:pass@host:5432/dbname npx tsx scripts/start-refresh-worker.ts
```

### Option 2: Exécution directe avec ts-node

```bash
# Développement
node -r ts-node/register scripts/start-refresh-worker.ts

# Production
NODE_ENV=production DATABASE_URL=postgres://... node -r ts-node/register scripts/start-refresh-worker.ts
```

### Option 3: PM2 (production recommandée)

```bash
# Installation PM2
npm install -g pm2

# Démarrage avec tsx
pm2 start scripts/start-refresh-worker.ts \
  --name "dashboard-refresh-worker" \
  --interpreter tsx \
  --env NODE_ENV=production \
  --env DATABASE_URL=postgres://...

# Ou avec ts-node
pm2 start scripts/start-refresh-worker.ts \
  --name "dashboard-refresh-worker" \
  --interpreter ts-node \
  --env NODE_ENV=production \
  --env DATABASE_URL=postgres://...

# Vérification
pm2 status
pm2 logs dashboard-refresh-worker

# Redémarrage
pm2 restart dashboard-refresh-worker

# Arrêt
pm2 stop dashboard-refresh-worker
```

### Option 4: Systemd (Linux)

Créer `/etc/systemd/system/dashboard-refresh-worker.service` :

```ini
[Unit]
Description=Dashboard Refresh Worker
After=network.target postgresql.service

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/yesselate-frontend
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgres://...
ExecStart=/usr/bin/npx tsx scripts/start-refresh-worker.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activer et démarrer :

```bash
sudo systemctl daemon-reload
sudo systemctl enable dashboard-refresh-worker
sudo systemctl start dashboard-refresh-worker
sudo systemctl status dashboard-refresh-worker
```

### Option 5: Docker Compose

```yaml
services:
  refresh-worker:
    build: .
    command: npx tsx scripts/start-refresh-worker.ts
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=${OTEL_EXPORTER_OTLP_TRACES_ENDPOINT}
      - LOG_LEVEL=info
    restart: unless-stopped
    depends_on:
      - postgres
```

## 🔍 Vérification

### 1. Vérifier que le worker écoute

```bash
# Logs attendus
[WORKER] 🚀 Écoute du canal "dashboard_refresh"…
```

### 2. Tester une notification manuelle

```sql
-- Dans psql
SELECT pg_notify('dashboard_refresh', '{"domain":"projets","tenant_id":"test"}');
```

Le worker devrait rafraîchir les vues concernées et logger :
```
[MVIEW] ✅ Vue rm_kpis_projets rafraîchie
```

### 3. Vérifier les métriques

```bash
curl -H "x-metrics-secret: $METRICS_SECRET" http://localhost:3000/api/internal/metrics | grep worker
```

Métriques attendues :
- `worker_notifications_received_total`
- `worker_processing_duration_seconds`
- `mview_refresh_counter_total`

## ⚠️ Points de vigilance

### 1. Connexion PostgreSQL persistante

Le worker maintient une connexion PostgreSQL ouverte pour `LISTEN`. Assurez-vous que :
- Le pool PostgreSQL a `max: 1` (une seule connexion)
- La connexion est gérée correctement (release en cas d'erreur)
- Le timeout PostgreSQL est suffisant

### 2. Advisory Locks

Le worker utilise des advisory locks PostgreSQL pour éviter les refreshs concurrents. Si plusieurs workers tournent, un seul traitera chaque notification.

### 3. Observabilité

Le worker est instrumenté avec :
- **Logs structurés** : Pino avec corrélation
- **Métriques** : Prometheus (notifications reçues, durée de traitement)
- **Tracing** : OpenTelemetry (spans pour chaque notification)

### 4. Gestion des erreurs

- Les erreurs de refresh d'une vue n'empêchent pas le traitement des autres vues
- Les erreurs de connexion déclenchent une reconnexion automatique (gérée par le pool)
- Les erreurs fatales arrêtent le worker avec `process.exit(1)`

## 🔄 Redémarrage

### Redémarrage propre

```bash
# PM2
pm2 restart dashboard-refresh-worker

# Systemd
sudo systemctl restart dashboard-refresh-worker

# Docker
docker-compose restart refresh-worker
```

### Redémarrage après changement de code

1. Arrêter le worker
2. Mettre à jour le code
3. Redémarrer le worker

**Note** : Le worker n'a pas besoin de redémarrage pour les changements de données (les triggers PostgreSQL gèrent les notifications automatiquement).

## 📊 Monitoring

### Logs

```bash
# PM2
pm2 logs dashboard-refresh-worker --lines 100

# Systemd
journalctl -u dashboard-refresh-worker -f

# Docker
docker-compose logs -f refresh-worker
```

### Métriques Prometheus

```bash
curl -H "x-metrics-secret: $METRICS_SECRET" \
  http://localhost:3000/api/internal/metrics | \
  grep -E "(worker_|mview_refresh_)"
```

### Health Check

Le worker n'a pas d'endpoint HTTP dédié, mais sa santé peut être vérifiée via :
- Les logs (pas d'erreurs récurrentes)
- Les métriques (notifications reçues > 0)
- Le health check global (`/api/internal/health`) qui vérifie la fraîcheur des MViews

## 🐛 Dépannage

### Le worker ne démarre pas

1. Vérifier `DATABASE_URL` :
   ```bash
   echo $DATABASE_URL
   ```

2. Vérifier la connexion PostgreSQL :
   ```bash
   psql "$DATABASE_URL" -c "SELECT 1;"
   ```

3. Vérifier les logs :
   ```bash
   # PM2
   pm2 logs dashboard-refresh-worker --err
   ```

### Le worker ne reçoit pas de notifications

1. Vérifier que les triggers sont actifs :
   ```sql
   SELECT * FROM pg_trigger WHERE tgname LIKE '%dashboard_refresh%';
   ```

2. Tester une notification manuelle :
   ```sql
   SELECT pg_notify('dashboard_refresh', '{"domain":"projets"}');
   ```

3. Vérifier que le worker écoute :
   ```sql
   SELECT * FROM pg_stat_activity WHERE query LIKE '%LISTEN%';
   ```

### Les vues ne se rafraîchissent pas

1. Vérifier les logs du worker pour les erreurs
2. Vérifier les permissions PostgreSQL (le worker doit pouvoir exécuter `REFRESH MATERIALIZED VIEW`)
3. Vérifier que les vues existent :
   ```sql
   SELECT schemaname, matviewname FROM pg_matviews WHERE matviewname LIKE 'rm_%';
   ```

## 📚 Références

- [PostgreSQL LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)
- [PostgreSQL Advisory Locks](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADVISORY-LOCKS)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
