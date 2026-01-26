# ✅ Checklist de déploiement - Phase P4

## 🎯 Objectif

Déployer la Phase P4 (Observabilité & Robustesse + Finalisation ChartKit) en production avec validation complète.

---

## 📋 Pré-déploiement

### 1. Vérification des dépendances

- [ ] **OpenTelemetry** :
  ```bash
  npm install @opentelemetry/sdk-node \
    @opentelemetry/exporter-trace-otlp-http \
    @opentelemetry/instrumentation-http \
    @opentelemetry/instrumentation-pg \
    @opentelemetry/resources \
    @opentelemetry/semantic-conventions \
    @opentelemetry/api
  ```

- [ ] **Prometheus** :
  ```bash
  npm install prom-client
  ```

- [ ] **Logging** :
  ```bash
  npm install pino pino-pretty
  ```

- [ ] **dotenv** (pour bootstrap OpenTelemetry) :
  ```bash
  npm install dotenv
  ```

### 2. Configuration Next.js

- [ ] Vérifier `next.config.ts` :
  ```typescript
  experimental: {
    instrumentationHook: true,
  }
  ```

### 3. Variables d'environnement

- [ ] **OpenTelemetry** :
  ```env
  OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=http://tempo:4318/v1/traces
  NODE_ENV=production
  ```

- [ ] **Logging** :
  ```env
  LOG_LEVEL=info
  ```

- [ ] **Rate Limiting** :
  ```env
  RATE_LIMIT_MAX_REQUESTS=100
  ```

- [ ] **Secrets** :
  ```env
  METRICS_SECRET=your-secret-key-change-in-production
  METRICS_SECRET_ENABLED=true
  ```

---

## 🚀 Déploiement SQL

### 1. Migration Worker Heartbeat

```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/08_worker_heartbeat.sql
```

**Vérification** :
```sql
SELECT * FROM dashboard_worker_heartbeat;
```

### 2. Migration Triggers Achats (si Phase P5 déployée)

```bash
psql "$DATABASE_URL" -f lib/server/dashboard/sql/09_achats_triggers_notify.sql
```

**Vérification** :
```sql
SELECT tgname FROM pg_trigger WHERE tgname LIKE 'notify_%achats%';
```

---

## 🔧 Déploiement Application

### 1. Build Next.js

```bash
npm run build
```

### 2. Démarrer l'application

**Option A: Next.js standard**
```bash
npm run start
```

**Option B: Avec bootstrap OpenTelemetry (optionnel)**
```bash
node --require lib/server/observability/otel/node-otel.js node_modules/.bin/next start
```

**Option C: PM2**
```bash
pm2 start npm --name "yesselate-dashboard" -- start
# ou avec bootstrap OpenTelemetry
pm2 start npm --name "yesselate-dashboard" -- start --require lib/server/observability/otel/node-otel.js
```

### 3. Démarrer le Worker Event-Driven

```bash
# Via script
DATABASE_URL=postgres://... bash scripts/start-worker.sh

# Via PM2
pm2 start scripts/start-refresh-worker.ts \
  --name "dashboard-refresh-worker" \
  --interpreter tsx \
  --env NODE_ENV=production \
  --env DATABASE_URL=postgres://...
```

---

## ✅ Validation post-déploiement

### 1. Health Checks

- [ ] **Health check public** :
  ```bash
  curl http://localhost:3000/api/health
  ```
  **Attendu** : `{"status":"healthy",...}`

- [ ] **Health check interne** :
  ```bash
  curl http://localhost:3000/api/internal/health
  ```
  **Attendu** : Détails DB, MViews, Worker heartbeat

- [ ] **Worker heartbeat** :
  ```sql
  SELECT last_heartbeat, last_domain, last_notification_count 
  FROM dashboard_worker_heartbeat 
  WHERE id = 1;
  ```
  **Attendu** : `last_heartbeat` < 5 minutes

### 2. Métriques Prometheus

- [ ] **Endpoint métriques** :
  ```bash
  curl -H "x-metrics-secret: $METRICS_SECRET" \
    http://localhost:3000/api/internal/metrics
  ```
  **Attendu** : Format Prometheus text avec métriques HTTP, DB, MViews

- [ ] **Vérifier métriques clés** :
  - `http_request_duration_seconds`
  - `api_request_total`
  - `mview_refresh_total`
  - `worker_notifications_received_total`

### 3. Tracing OpenTelemetry

- [ ] **Vérifier traces dans Tempo/Jaeger** :
  - Faire une requête API
  - Vérifier que la trace apparaît dans Tempo/Jaeger
  - Vérifier que `x-request-id` est corrélé

### 4. Logs structurés

- [ ] **Vérifier logs JSON** :
  ```bash
  # Dans les logs de l'application
  grep "reqId" logs/app.log | head -5
  ```
  **Attendu** : Logs JSON avec champ `reqId`

- [ ] **Vérifier corrélation** :
  - Faire une requête API
  - Noter le `x-request-id` dans la réponse
  - Chercher ce `reqId` dans les logs

### 5. Rate Limiting

- [ ] **Test rate limiting** :
  ```bash
  # Faire 101 requêtes rapides
  for i in {1..101}; do
    curl -H "x-tenant-id: test" \
      http://localhost:3000/api/dashboard/overview/summary/dashboard &
  done
  wait
  ```
  **Attendu** : La 101ème requête retourne `429 Too Many Requests`

### 6. ChartKit Recharts

- [ ] **Vérifier graphiques** :
  - Accéder à `/maitre-ouvrage/dashboard/overview/tendances/dashboard`
  - Vérifier que les graphiques s'affichent correctement
  - Vérifier qu'il n'y a pas d'erreurs dans la console

- [ ] **Vérifier bundle** :
  ```bash
  # Vérifier que Chart.js n'est plus dans le bundle
  npm run build 2>&1 | grep -i "chart.js" || echo "✅ Chart.js non trouvé"
  ```

### 7. Compatibilité UX

- [ ] **Navigation** :
  - Vérifier Sidebar/Subnav fonctionnent
  - Vérifier deep-links fonctionnent
  - Vérifier back/forward navigateur

- [ ] **Registry** :
  - Vérifier que les données se chargent via le registry
  - Vérifier que le TTL fonctionne

- [ ] **KPI Bar** :
  - Vérifier que les KPIs s'affichent correctement
  - Vérifier que le drill-down fonctionne

---

## 🐛 Dépannage

### OpenTelemetry ne démarre pas

1. Vérifier `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` :
   ```bash
   echo $OTEL_EXPORTER_OTLP_TRACES_ENDPOINT
   ```

2. Vérifier les logs :
   ```bash
   grep "OTEL" logs/app.log
   ```

3. Tester la connexion Tempo :
   ```bash
   curl http://tempo:4318/v1/traces
   ```

### Métriques non disponibles

1. Vérifier `METRICS_SECRET` :
   ```bash
   echo $METRICS_SECRET
   ```

2. Vérifier les permissions :
   ```bash
   curl -H "x-metrics-secret: wrong-secret" \
     http://localhost:3000/api/internal/metrics
   ```
   **Attendu** : `401 Unauthorized`

### Worker heartbeat stale

1. Vérifier que le worker est actif :
   ```bash
   pm2 status dashboard-refresh-worker
   ```

2. Vérifier les logs du worker :
   ```bash
   pm2 logs dashboard-refresh-worker --lines 50
   ```

3. Tester une notification manuelle :
   ```sql
   SELECT pg_notify('dashboard_refresh', '{"domain":"projets"}');
   ```

### Rate limiting trop agressif

1. Ajuster `RATE_LIMIT_MAX_REQUESTS` :
   ```env
   RATE_LIMIT_MAX_REQUESTS=200  # Augmenter la limite
   ```

2. Redémarrer l'application

---

## 📊 Métriques de succès

- ✅ **Health checks** : Tous les checks retournent `healthy`
- ✅ **Métriques** : Endpoint accessible et métriques présentes
- ✅ **Tracing** : Traces visibles dans Tempo/Jaeger
- ✅ **Logs** : Logs structurés avec corrélation
- ✅ **Rate limiting** : Fonctionne sans casser l'UX
- ✅ **ChartKit** : Tous les graphiques utilisent Recharts
- ✅ **UX** : Aucun changement visible pour l'utilisateur

---

## 📚 Documentation

- **PR P4 Final** : `lib/server/dashboard/PR_P4_FINAL.md`
- **Implémentation** : `lib/server/dashboard/P4_IMPLEMENTATION_COMPLETE.md`
- **Déploiement** : `lib/server/dashboard/DEPLOYMENT_SCRIPTS.md`
- **Observabilité** : `lib/server/observability/README.md`

---

**Date de déploiement** : _______________

**Déployé par** : _______________

**Status** : ⬜ En attente | ⬜ En cours | ⬜ Déployé | ⬜ Bloqué
