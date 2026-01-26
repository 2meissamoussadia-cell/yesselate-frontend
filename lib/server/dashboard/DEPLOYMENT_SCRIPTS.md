# Scripts de déploiement - Dashboard Read Models

## 🚀 Déploiement complet (toutes les phases)

### 1. Migration SQL (ordre d'exécution)

```bash
# Phase P2-C: Core + Vues dashboard
psql "$DATABASE_URL" -f lib/server/dashboard/sql/01_core.sql
psql "$DATABASE_URL" -f lib/server/dashboard/sql/02_views_dashboard.sql
psql "$DATABASE_URL" -f lib/server/dashboard/sql/03_views_scoped.sql

# Phase P3: Finance
psql "$DATABASE_URL" -f lib/server/dashboard/sql/04_finance.sql
psql "$DATABASE_URL" -f lib/server/dashboard/sql/05_triggers_notify.sql

# Phase P5: Achats/Contrats
psql "$DATABASE_URL" -f lib/server/dashboard/sql/07_achats_core.sql
psql "$DATABASE_URL" -f lib/server/dashboard/sql/08_achats_views.sql
psql "$DATABASE_URL" -f lib/server/dashboard/sql/09_achats_triggers_notify.sql

# Phase P6: Stocks & Matériel
psql "$DATABASE_URL" -f lib/server/dashboard/sql/10_stocks_materiel_core.sql
psql "$DATABASE_URL" -f lib/server/dashboard/sql/11_stocks_materiel_views.sql
psql "$DATABASE_URL" -f lib/server/dashboard/sql/12_stocks_materiel_triggers_notify.sql

# Phase P4: Worker Heartbeat (pour health checks)
psql "$DATABASE_URL" -f lib/server/dashboard/sql/08_worker_heartbeat.sql

# Phase P4: MView Refresh Log (pour health checks granulaire)
psql "$DATABASE_URL" -f lib/server/dashboard/sql/10_mview_refresh_log.sql

# Phase P5: Triggers Achats/Contrats (détaillés)
psql "$DATABASE_URL" -f lib/server/dashboard/sql/09_achats_triggers_notify.sql
```

### 2. Rafraîchissement initial des vues

**Option A: Script automatique**

```bash
# Linux/Mac
bash scripts/refresh-all-mviews.sh

# Windows PowerShell
powershell scripts/refresh-all-mviews.ps1
```

**Option B: Manuel (toutes les vues)**

```bash
# Core Dashboard
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_overview;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_trends_daily;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_projets;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_kpis_demandes;"

# Finance (P3)
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finance_overview;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_finance_trends;"

# Achats/Contrats (P5)
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_overview;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_trends;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_fournisseurs;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_commandes_ouvertes;"

# Stocks & Matériel (P6)
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_stocks_overview;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_stocks_trends;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_stocks_ruptures;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_materiel_overview;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_materiel_trends;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_materiel_backlog_maintenance;"
```

### 3. Démarrer le worker Event-Driven

**Option A: Script wrapper (recommandé)**
```bash
# Linux/Mac
DATABASE_URL=postgres://... bash scripts/start-worker.sh

# Windows PowerShell
$env:DATABASE_URL="postgres://..."; powershell scripts/start-worker.ps1
```

**Option B: Exécution directe**
```bash
# Avec tsx (recommandé)
NODE_ENV=production DATABASE_URL=postgres://... npx tsx scripts/start-refresh-worker.ts

# Avec ts-node
NODE_ENV=production DATABASE_URL=postgres://... node -r ts-node/register scripts/start-refresh-worker.ts
```

**Option C: PM2 (production recommandée)**
```bash
pm2 start scripts/start-refresh-worker.ts \
  --name "dashboard-refresh-worker" \
  --interpreter tsx \
  --env NODE_ENV=production \
  --env DATABASE_URL=postgres://...
```

**Option D: Systemd (Linux)**
```bash
# Voir lib/server/dashboard/workers/WORKER_DEPLOYMENT.md pour la configuration complète
sudo systemctl start dashboard-refresh-worker
```

**Documentation complète** : Voir `lib/server/dashboard/workers/WORKER_DEPLOYMENT.md`

### 4. Configurer le CRON de secours

**Option A: Via API (recommandé)**
```bash
# Toutes les 10 minutes
*/10 * * * * curl -X POST http://localhost:3000/api/cron/refresh-views -H "x-cron-secret: $CRON_SECRET" >> /var/log/refresh_mviews.log 2>&1
```

**Option B: Exécution directe du script**
```bash
# Avec tsx (toutes les 10 minutes)
*/10 * * * * /usr/bin/env NODE_ENV=production DATABASE_URL=postgres://... /usr/bin/npx tsx /app/scripts/start-refresh-cron.ts >> /var/log/refresh_mviews.log 2>&1
```

**Option C: Task Scheduler (Windows)**
- Créer une tâche planifiée qui appelle l'endpoint `/api/cron/refresh-views` toutes les 10 minutes
- Ou exécuter `scripts/start-refresh-cron.ts` avec PowerShell

**Documentation complète** : Voir `scripts/CRON_SETUP.md`

### 5. Vérification

```bash
# Health check
curl http://localhost:3000/api/health

# Métriques Prometheus
curl -H "x-metrics-secret: $METRICS_SECRET" http://localhost:3000/api/internal/metrics

# Test API Dashboard
curl -H "x-tenant-id: <tenant-uuid>" -H "x-user-id: <user-id>" \
  http://localhost:3000/api/dashboard/overview/summary/dashboard
```

## 📋 Liste complète des vues matérialisées

### Core Dashboard (P2-C)
- `rm_kpis_overview`
- `rm_trends_daily`
- `rm_kpis_projets`
- `rm_kpis_demandes`

### Finance (P3)
- `rm_finance_overview`
- `rm_finance_trends`

### Achats/Contrats (P5)
- `rm_achats_overview`
- `rm_achats_trends`
- `rm_achats_fournisseurs`
- `rm_achats_commandes_ouvertes`

### Stocks & Matériel (P6)
- `rm_stocks_overview`
- `rm_stocks_trends`
- `rm_stocks_ruptures`
- `rm_materiel_overview`
- `rm_materiel_trends`
- `rm_materiel_backlog_maintenance`

**Total: 18 vues matérialisées**
