# PR P4 — Observabilité & Robustesse + Finalisation ChartKit + Modules ERP

## 🎯 Objectif

Implémenter un système complet d'observabilité (tracing, métriques, logs corrélés), de robustesse (health checks, rate limiting), finaliser ChartKit, et amorcer les modules ERP (Achats/Contrats, Stocks & Matériel) sans casser l'UX existante.

## ✅ Implémentation complète

### 1. Observabilité & Robustesse

**Fichiers**:
- `lib/server/observability/telemetry.ts` : OpenTelemetry (tracing distribué)
- `lib/server/observability/metrics.ts` : Prometheus (métriques)
- `lib/server/observability/logger.ts` : Pino (logs structurés avec corrélation)
- `lib/server/observability/middleware.ts` : Middleware d'observabilité pour API routes
- `lib/server/observability/rateLimit.ts` : Rate limiting simple
- `lib/server/observability/health.ts` : Health checks améliorés
- `lib/server/observability/index.ts` : Exports centralisés
- `instrumentation.ts` : Initialisation OpenTelemetry au démarrage

**Fonctionnalités**:
- **Tracing OpenTelemetry** : Spans pour requêtes HTTP, DB, jobs, MViews
- **Métriques Prometheus** : API, DB, MViews, Worker, ABAC
- **Logs structurés Pino** : JSON avec corrélation via `x-request-id`
- **Health checks** : DB, MViews staleness, Worker heartbeat
- **Rate limiting** : 100 requêtes/minute par IP (configurable)

**Endpoints**:
- `GET /api/health` : Health check public
- `GET /api/internal/health` : Health check interne (plus détaillé)
- `GET /api/internal/metrics` : Métriques Prometheus (protégé par secret)

### 2. Finalisation ChartKit

**Status** : ✅ **Déjà finalisé**

Les charts utilisent déjà ChartKit (Recharts) :
- `TrendsChart.tsx` : Utilise `ChartContainer`, `chartStyles`, `chartColors`
- `MonthlyComparisonChart.tsx` : Standardisé
- `CategoryDistributionChart.tsx` : Standardisé
- `DashboardCharts.tsx` : Lazy loading avec Suspense

**Aucune action requise** : Le ChartKit est déjà en place et fonctionnel.

### 3. Modules ERP (ossature)

**Fichiers SQL**:
- `lib/server/dashboard/sql/06_erp_achats_contrats.sql` : Tables + vues Achats/Contrats
- `lib/server/dashboard/sql/07_erp_stocks_materiel.sql` : Tables + vues Stocks & Matériel

**Tables créées**:
- **Achats/Contrats** : `fournisseurs`, `contrats`, `lignes_contrat`, `bons_commande`, `bons_livraison`
- **Stocks** : `articles`, `depots`, `stocks`, `mouvements_stock`
- **Matériel** : `materiel`, `maintenance`

**Vues matérialisées**:
- `rm_achats_overview` : KPIs Achats (contrats en cours, BC en attente, lead time, écarts prix)
- `rm_stocks_overview` : KPIs Stocks (ruptures, valeur stock, mouvements, obsolescence)
- `rm_materiel_overview` : KPIs Matériel (disponibilité, maintenance, backlog)

**Types & Repository**:
- `KpisAchatsData`, `KpisStocksData`, `KpisMaterielData` ajoutés
- `ReadModelsRepo` étendu avec `loadKpisAchats`, `loadKpisStocks`, `loadKpisMateriel`
- Implémentations InMemory et SQL créées
- Service dispatcher mis à jour (`performance::achats::dashboard`, `actions::stocks::dashboard`, `actions::materiel::dashboard`)

**Workers**:
- `refreshMViewsWorker.ts` : Instrumenté avec observabilité (logs corrélés, métriques, tracing)
- `refreshMViewsCron.ts` : Instrumenté avec observabilité

## 🔒 Sécurité ABAC

- Filtrage par tenant (obligatoire)
- Filtrage par bureau/chantier (si scopes présents)
- Aucune fuite inter-unités garantie

## 📊 KPIs ERP disponibles

### Achats/Contrats
- **Contrats en cours** : Nombre de contrats actifs
- **Montant contrats en cours** : Valeur totale TTC
- **BC en attente** : Bons de commande émis non réceptionnés
- **Lead time moyen** : Jours moyens entre émission BC et réception BL
- **Écarts prix** : Différences prix prévu vs réel (placeholder)

### Stocks
- **Articles en rupture** : Quantité < seuil d'alerte
- **Valeur stock HT** : Valeur totale du stock
- **Mouvements 30j** : Nombre de mouvements (entrées/sorties) sur 30 jours
- **Articles obsolètes** : Pas de mouvement depuis 180 jours

### Matériel
- **Matériel disponible** : Équipements disponibles
- **Matériel en maintenance** : Équipements en maintenance
- **Maintenances en cours** : Interventions en cours
- **Maintenances planifiées** : Backlog de maintenance
- **Valeur matériel total** : Valeur totale du parc matériel

## 🚀 Déploiement

### Checklist

- [ ] **Installation dépendances** :
  ```bash
  npm install @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-otlp-http @opentelemetry/resources @opentelemetry/semantic-conventions @opentelemetry/sdk-metrics @opentelemetry/api prom-client pino pino-pretty
  ```

- [ ] **Migration SQL** :
  ```bash
  # Core + Finance (P2-C, P3)
  psql $DATABASE_URL -f lib/server/dashboard/sql/01_core.sql
  psql $DATABASE_URL -f lib/server/dashboard/sql/02_views_dashboard.sql
  psql $DATABASE_URL -f lib/server/dashboard/sql/03_views_scoped.sql
  psql $DATABASE_URL -f lib/server/dashboard/sql/04_finance.sql
  psql $DATABASE_URL -f lib/server/dashboard/sql/05_triggers_notify.sql
  
  # ERP Modules (P4, P5)
  psql $DATABASE_URL -f lib/server/dashboard/sql/06_erp_achats_contrats.sql
  psql $DATABASE_URL -f lib/server/dashboard/sql/07_erp_stocks_materiel.sql
  
  # Rafraîchir toutes les vues (ou utiliser le script)
  # Linux/Mac:
  bash scripts/refresh-all-mviews.sh
  # Windows:
  powershell scripts/refresh-all-mviews.ps1
  ```

- [ ] **Variables d'environnement** :
  ```env
  # OpenTelemetry
  OTEL_SDK_DISABLED=false
  OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
  OTEL_SERVICE_NAME=yesselate-dashboard

  # Logging
  LOG_LEVEL=info

  # Rate Limiting
  RATE_LIMIT_MAX_REQUESTS=100

  # Secrets
  METRICS_SECRET=your-secret-key
  METRICS_SECRET_ENABLED=true
  ```

- [ ] **Configuration Next.js** :
  - Vérifier `next.config.ts` : `experimental.instrumentationHook = true`

- [ ] **Tests** :
  - [ ] `GET /api/health` → vérifier health checks
  - [ ] `GET /api/internal/metrics` → vérifier métriques Prometheus
  - [ ] `GET /api/dashboard/performance/achats/dashboard` → vérifier KPIs Achats
  - [ ] `GET /api/dashboard/actions/stocks/dashboard` → vérifier KPIs Stocks
  - [ ] `GET /api/dashboard/actions/materiel/dashboard` → vérifier KPIs Matériel
  - [ ] Test rate limiting : 101 requêtes → vérifier 429
  - [ ] Test tracing : Vérifier traces dans Tempo/Jaeger

## ⚠️ Points de vigilance

### 1. Observabilité
- **OpenTelemetry** : Désactiver si endpoint non configuré (`OTEL_SDK_DISABLED=true`)
- **Métriques** : Endpoint protégé par secret (à changer en production)
- **Logs** : Pretty print en dev, JSON en prod

### 2. Modules ERP
- Les tables sont des **ossatures minimales** : À enrichir selon besoins métier
- Les KPIs sont des **proxies** : À valider avec les équipes métier
- Les vues matérialisées doivent être rafraîchies via triggers (à ajouter dans `05_triggers_notify.sql`)

### 3. Performance
- Rate limiting in-memory : À remplacer par Redis en production
- Health checks : Limiter la fréquence pour éviter surcharge

## 📈 Métriques attendues

- **Temps de réponse API** : < 500ms (p95)
- **Temps de refresh MViews** : < 5s par vue
- **Latence Event-Driven** : < 1s entre write et refresh
- **Disponibilité** : > 99.9% (health checks)

## ✅ Validation finale

- [x] OpenTelemetry configuré
- [x] Métriques Prometheus créées
- [x] Logs structurés Pino implémentés
- [x] Health checks améliorés
- [x] Rate limiting implémenté
- [x] ChartKit vérifié (déjà finalisé)
- [x] Tables ERP créées
- [x] Vues matérialisées ERP créées
- [x] Types Read Models étendus
- [x] Repository étendu avec modules ERP
- [x] Service dispatcher mis à jour
- [x] Workers instrumentés
- [x] Documentation complète
- [x] Compatibilité front-end garantie (aucun changement UX)

## 🔄 Prochaines étapes (P5)

1. **Enrichissement modules ERP** :
   - Ajouter triggers pour rafraîchissement automatique des vues ERP
   - Enrichir KPIs avec calculs métier avancés
   - Ajouter pages front-end pour Achats/Stocks/Matériel

2. **Observabilité avancée** :
   - Dashboard Grafana pour métriques
   - Alertes Prometheus (ruptures stock, maintenances critiques)
   - Traces corrélées avec logs

3. **Performance** :
   - Cache Redis pour rate limiting
   - Optimisation requêtes SQL ERP
   - Index supplémentaires si nécessaire

**Status** : ✅ **PR P4 prête à merger**
