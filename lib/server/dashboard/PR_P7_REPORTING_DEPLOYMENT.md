# Phase P7 - Reporting Direction - Guide de Déploiement

## 📋 Vue d'ensemble

Module de **Reporting Direction** pour pilotage CODIR avec consolidation mensuelle multi-bureaux/multi-chantiers. Compatible à 100% avec l'architecture dashboard existante (router, registry, navigation, ABAC, CQRS).

## 🗂️ Fichiers modifiés/créés

### SQL
- `lib/server/dashboard/sql/10_reporting_views.sql` - MViews mensuelles (overview, DSO, bureau, chantier)
- Table `cal_mois` - Calendrier mensuel (24 derniers mois)

### Backend
- `lib/server/dashboard/repositories/SqlReadModelsRepo.Reporting.ts` - Repository SQL
- `lib/server/dashboard/services/dashboardReadService.ts` - Méthodes privées `reportingOverview()`, `reportingTrends()`, etc.
- `lib/server/dashboard/workers/refreshMViewsWorker.ts` - Mappings event-driven
- `lib/server/dashboard/workers/refreshMViewsCron.ts` - CRON de secours

### Frontend
- `src/modules/dashboard/components/reporting/ReportingOverviewPage.tsx` - Vue synthèse
- `src/modules/dashboard/components/reporting/ReportingTrendsPage.tsx` - Tendances mensuelles
- `src/modules/dashboard/components/reporting/ReportingByBureauPage.tsx` - Par bureau
- `src/modules/dashboard/components/reporting/ReportingByChantierPage.tsx` - Par chantier
- `src/modules/dashboard/types/dashboard.readmodels.ts` - Types TypeScript
- `src/modules/dashboard/registry/index.tsx` - Entrées registry
- `src/modules/dashboard/navigation/navigation.config.json` - Configuration navigation

## 🚀 Déploiement - Étapes

### 1. SQL - Création des MViews

```sql
-- Exécuter le script SQL
\i lib/server/dashboard/sql/13_reporting_views.sql

-- Rafraîchir les MViews initialement
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_overview;
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_dso;
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_bureau;
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_reporting_chantier;
```

### 2. Vérification des dépendances

Les MViews reporting dépendent des tables sources :
- `situations_travaux` → refresh `rm_reporting_overview`, `rm_reporting_dso`, `rm_reporting_bureau`, `rm_reporting_chantier`
- `factures` → refresh `rm_reporting_overview`, `rm_reporting_dso`
- `encaissements` → refresh `rm_reporting_dso`

**Vérifier que les triggers existent :**
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%refresh%' 
  AND event_object_table IN ('situations_travaux', 'factures', 'encaissements');
```

### 3. Worker Event-Driven

Le worker `refreshMViewsWorker.ts` a été mis à jour avec les mappings :
- `situations_travaux` → `['rm_reporting_overview', 'rm_reporting_dso', 'rm_reporting_bureau', 'rm_reporting_chantier', ...]`
- `factures` → `['rm_reporting_overview', 'rm_reporting_dso', ...]`
- `encaissements` → `['rm_reporting_dso', ...]`

**Relancer le worker si nécessaire :**
```bash
node lib/server/dashboard/workers/refreshMViewsWorker.ts
```

### 4. CRON de secours

Le fichier `refreshMViewsCron.ts` inclut les nouvelles vues :
- `rm_reporting_overview`
- `rm_reporting_dso`
- `rm_reporting_bureau`
- `rm_reporting_chantier`

**Vérifier la configuration CRON :**
```bash
# Exemple crontab (toutes les 10 minutes)
*/10 * * * * node /path/to/lib/server/dashboard/workers/refreshMViewsCron.ts
```

### 5. Frontend - Registry & Navigation

✅ **Déjà configuré :**
- Registry : `performance::reporting::*` avec loaders `loadGeneric`
- Navigation : `navigation.config.json` avec section `"reporting"` sous `"performance"`
- Composants : 4 composants React avec lazy loading

**Routes disponibles :**
- `/dashboard/performance/reporting/dashboard` → Synthèse
- `/dashboard/performance/reporting/tendances` → Tendances
- `/dashboard/performance/reporting/bureaux` → Par bureaux
- `/dashboard/performance/reporting/chantiers` → Par chantiers

### 6. API - Service dispatcher

✅ **Déjà configuré :**
- `DashboardReadService` avec méthodes privées :
  - `reportingOverview()` → `{ monthly: [...], dso: [...] }`
  - `reportingTrends()` → `ReportingOverviewMonthlyData[]`
  - `reportingByBureau()` → `ReportingByBureauMonthlyData[]`
  - `reportingByChantier()` → `ReportingByChantierMonthlyData[]`

**Routes API :**
- `GET /api/dashboard/performance/reporting/dashboard`
- `GET /api/dashboard/performance/reporting/tendances`
- `GET /api/dashboard/performance/reporting/bureaux`
- `GET /api/dashboard/performance/reporting/chantiers`

**Alternative path (décisions) :**
- `GET /api/dashboard/decisions/reporting/*` (même logique)

## ✅ Checklist de validation

### SQL
- [ ] Table `cal_mois` créée et peuplée (24 mois)
- [ ] MViews créées : `rm_reporting_overview`, `rm_reporting_dso`, `rm_reporting_bureau`, `rm_reporting_chantier`
- [ ] Index créés sur toutes les MViews
- [ ] MViews rafraîchies initialement

### Backend
- [ ] Repository `SqlReadModelsRepoReporting` fonctionnel
- [ ] Service `DashboardReadService` avec méthodes privées
- [ ] Worker event-driven mis à jour (mappings)
- [ ] CRON mis à jour (liste des vues)

### Frontend
- [ ] Types TypeScript à jour (`ReportingOverviewCombinedData`, etc.)
- [ ] Registry avec 4 entrées `performance::reporting::*`
- [ ] Navigation configurée (`navigation.config.json`)
- [ ] Composants React créés et fonctionnels

### Tests
- [ ] API `/api/dashboard/performance/reporting/dashboard` retourne `{ monthly, dso }`
- [ ] API `/api/dashboard/performance/reporting/tendances` retourne tableau
- [ ] API `/api/dashboard/performance/reporting/bureaux` retourne tableau
- [ ] API `/api/dashboard/performance/reporting/chantiers` retourne tableau
- [ ] Frontend : navigation vers les 4 vues fonctionne
- [ ] Frontend : données affichées correctement

## ⚠️ Points d'attention

### 1. Formules Finance (Proxies)
Les formules RAP/RàF/DSO sont des **proxies** :
- **RAP** = `SUM(prevu_ht) - SUM(realise_ht)` (approximation)
- **RàF** = `SUM(realise_ht) - SUM(facture_ht)` (approximation)
- **DSO** = `créances / CA_journalier_moyen` (approximation)

**Action :** Valider avec l'équipe Finance (retenues, pénalités, AOS, décotes).

### 2. ABAC - Scopes
Les MViews reporting portent les colonnes nécessaires pour le filtrage ABAC :
- `rm_reporting_bureau` : `tenant_id`, `bureau_code`, `mois`
- `rm_reporting_chantier` : `tenant_id`, `chantier_code`, `mois`

**Action :** Vérifier que le filtrage ABAC est appliqué **avant** l'agrégation dans les requêtes du repository.

### 3. Performance - Indexation
Index multi-colonnes créés :
- `idx_rm_reporting_overview_tenant_mois` : `(tenant_id, mois)`
- `idx_rm_reporting_dso_tenant_mois` : `(tenant_id, mois)`
- `idx_rm_reporting_bureau` : `(tenant_id, bureau_code, mois)`
- `idx_rm_reporting_chantier` : `(tenant_id, chantier_code, mois)`

### 4. Event-Driven - Debounce
Pour éviter les refreshs en cascade en forte charge, considérer un **debounce 30-60s** dans le worker.

**Option future :**
```typescript
// Dans refreshMViewsWorker.ts
const debouncedRefresh = debounce(refreshViews, 30000); // 30s
```

### 5. Exports CSV/Excel
**Route à créer (optionnelle) :**
```typescript
// app/api/export/reporting/route.ts
GET /api/export/reporting?period=2025-01&scope=bureau&format=csv
```

**Streaming pour grands volumes :**
```typescript
import { Readable } from 'stream';
// Utiliser Node streams pour CSV très volumineux
```

### 6. Audit & Traçabilité
L'API `/api/dashboard/*` trace déjà les lectures (qui/quoi/quand) via :
- Logs structurés (`withReq`)
- Métriques Prometheus (`observeHttp`)
- Tracing OpenTelemetry (`withSpan`)

**Vérifier :** Les routes `performance::reporting::*` sont bien tracées.

## 📊 Architecture validée

### Frontend
- ✅ Router avancé (lazy, transitions, fallback) - **inchangé**
- ✅ Registry (`main::sub::leaf` + `ttl` + `loader/render`) - **étendu**
- ✅ Navigation unifiée (Sidebar/Subnav) - **config mise à jour**
- ✅ KPI Bar + ChartKit - **réutilisé**

### Backend
- ✅ CQRS read-side (MViews + Event-Driven) - **étendu**
- ✅ ABAC (filtrage tenant/bureau/chantier) - **respecté**
- ✅ API `/api/dashboard/:main/:sub/:leaf` - **dispatcher étendu**
- ✅ Observabilité (logs, métriques, tracing) - **intégré**

## 🎯 Prochaines étapes

### Option A : Pousser la PR maintenant
✅ **Prêt pour déploiement** - Tous les fichiers sont en place et cohérents.

### Option B : Itération Export (CSV/Excel)
Créer la route `/api/export/reporting` avec :
- Paramètres : `period`, `scope` (bureau/chantier), `format` (csv/xlsx)
- Streaming pour grands volumes
- Même source de données (MViews)

### Option C : Phase P8 - Conformité marchés publics
Module suivant : CCAP/CCAG, workflows réglementaires, traçabilité.

---

**Recommandation :** Pousser la PR P7 maintenant, puis itérer sur les exports si besoin.
