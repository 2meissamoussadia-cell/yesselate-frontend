# ✅ Check Express - Déploiement Phase P5 (Achats/Contrats)

## 📋 Checklist de déploiement

### 1. ✅ SQL - Fichiers présents et ordre d'exécution

**Fichiers SQL vérifiés :**
- ✅ `lib/server/dashboard/sql/07_achats_core.sql` - Tables core (fournisseurs, contrats, articles, prix_reference, bc, bc_lignes, bl, bl_lignes)
- ✅ `lib/server/dashboard/sql/08_achats_views.sql` - MViews optimisées (rm_achats_overview, rm_achats_trends, rm_achats_fournisseurs, rm_achats_open_orders)
- ✅ `lib/server/dashboard/sql/09_achats_triggers_notify.sql` - Triggers Event-Driven (bc, bl, bc_lignes, bl_lignes, prix_reference, fournisseurs)

**Ordre d'exécution :**
```bash
# 1. Tables core
psql "$DATABASE_URL" -f lib/server/dashboard/sql/07_achats_core.sql

# 2. MViews optimisées
psql "$DATABASE_URL" -f lib/server/dashboard/sql/08_achats_views.sql

# 3. Triggers Event-Driven
psql "$DATABASE_URL" -f lib/server/dashboard/sql/09_achats_triggers_notify.sql

# 4. Premier refresh des MViews
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_overview;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_trends;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_fournisseurs;"
psql "$DATABASE_URL" -c "REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_open_orders;"
```

### 2. ✅ Worker P3 - Mapping des domaines Achats

**Fichier :** `lib/server/dashboard/workers/refreshMViewsWorker.ts`

**Mapping vérifié (lignes 67-73) :**
```typescript
// Phase P5: Nouveaux domaines Achats/Contrats
bc: ['rm_achats_overview', 'rm_achats_trends', 'rm_achats_open_orders', 'rm_kpis_overview'],
bc_lignes: ['rm_achats_overview', 'rm_achats_trends', 'rm_achats_open_orders', 'rm_kpis_overview'],
bl: ['rm_achats_overview', 'rm_achats_trends', 'rm_kpis_overview'],
bl_lignes: ['rm_achats_overview', 'rm_achats_trends', 'rm_kpis_overview'],
fournisseurs: ['rm_achats_fournisseurs', 'rm_achats_overview'],
prix_reference: ['rm_achats_overview', 'rm_achats_fournisseurs'],
```

**Action requise :** Relancer le service worker après déploiement
```bash
# Redémarrer le worker P3
pm2 restart refresh-mviews-worker
# ou
systemctl restart refresh-mviews-worker
```

### 3. ✅ CRON - MViews Achats dans la liste

**Fichier :** `lib/server/dashboard/workers/refreshMViewsCron.ts`

**MViews vérifiées (lignes 28-31) :**
```typescript
// Phase P5: MViews Achats/Contrats
'rm_achats_overview',
'rm_achats_trends',
'rm_achats_fournisseurs',
'rm_achats_open_orders',
```

### 4. ✅ Navigation - Config JSON

**Fichier :** `src/modules/dashboard/navigation/navigation.config.json`

**Section vérifiée (lignes 190-210) :**
```json
"achats": {
  "label": "Achats & Contrats",
  "leaf": {
    "dashboard": {
      "label": "Vue d'ensemble",
      "component": "AchatsOverviewPage"
    },
    "trends": {
      "label": "Tendances",
      "component": "TendancesPage"
    },
    "fournisseurs": {
      "label": "Fournisseurs",
      "component": "AchatsFournisseursPage"
    },
    "open-orders": {
      "label": "Commandes ouvertes",
      "component": "AchatsOpenOrdersPage"
    }
  }
}
```

**Résultat :** ✅ Sidebar/Subnav afficheront automatiquement la rubrique "Achats & Contrats" sous "Performance & KPIs"

### 5. ✅ Registry - Entrées performance::achats::*

**Fichiers vérifiés :**
- ✅ `src/modules/dashboard/registry/index.tsx` - 4 entrées (lignes 181-256)
- ✅ `src/modules/dashboard/registry/dashboardRegistry.tsx` - 4 entrées (lignes 636-666)

**Entrées présentes :**
- ✅ `performance::achats::dashboard` → `AchatsOverviewPage`
- ✅ `performance::achats::trends` → `TendancesPage`
- ✅ `performance::achats::fournisseurs` → `AchatsFournisseursPage`
- ✅ `performance::achats::open-orders` → `AchatsOpenOrdersPage`

**Résultat :** ✅ Router avancé affichera la vue cible (fallback si leaf absent)

### 6. ✅ Backend - Repository & Service

**Fichiers vérifiés :**
- ✅ `lib/server/dashboard/repositories/SqlReadModelsRepo.Achats.ts` - Repository dédié avec 4 méthodes (loadOverview, loadTrends, loadFournisseurs, loadOpenOrders)
- ✅ `lib/server/dashboard/services/dashboardReadService.ts` - Dispatch `performance::achats::*` vers `SqlReadModelsRepoAchats`
- ✅ `lib/server/dashboard/repositories/SqlReadModelsRepo.ts` - Intégration via `loadKpisAchats()`

### 7. ✅ Frontend - Composants

**Composants créés :**
- ✅ `src/modules/dashboard/components/views/AchatsOverviewPage.tsx` - Vue d'ensemble avec KPIs et graphique
- ✅ `src/modules/dashboard/components/views/AchatsFournisseursPage.tsx` - Liste fournisseurs
- ✅ `src/modules/dashboard/components/views/AchatsOpenOrdersPage.tsx` - Commandes ouvertes
- ✅ `src/modules/dashboard/components/views/TendancesPage.tsx` - Tendances (existant, réutilisé)

**Exports vérifiés :**
- ✅ `src/modules/dashboard/components/views/index.ts` - Tous les composants exportés

## 🚀 Plan de déploiement

### Étape 1 : SQL (Base de données)
```bash
# Appliquer les migrations dans l'ordre
psql "$DATABASE_URL" -f lib/server/dashboard/sql/07_achats_core.sql
psql "$DATABASE_URL" -f lib/server/dashboard/sql/08_achats_views.sql
psql "$DATABASE_URL" -f lib/server/dashboard/sql/09_achats_triggers_notify.sql

# Premier refresh des MViews
psql "$DATABASE_URL" <<EOF
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_overview;
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_trends;
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_fournisseurs;
REFRESH MATERIALIZED VIEW CONCURRENTLY rm_achats_open_orders;
EOF
```

### Étape 2 : Backend (Worker)
```bash
# Redémarrer le worker P3 pour prendre en compte le nouveau mapping
pm2 restart refresh-mviews-worker
# ou
systemctl restart refresh-mviews-worker
```

### Étape 3 : Frontend (Build & Deploy)
```bash
# Build Next.js
npm run build

# Déployer (selon votre processus)
# - Vercel : git push
# - Docker : docker build && docker push
# - PM2 : pm2 restart nextjs-app
```

### Étape 4 : Vérification post-déploiement

**1. Vérifier les MViews :**
```sql
SELECT schemaname, matviewname, hasindexes, ispopulated
FROM pg_matviews
WHERE matviewname LIKE 'rm_achats%';
```

**2. Vérifier les triggers :**
```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE 'trg_refresh_achats%';
```

**3. Tester l'API :**
```bash
# Vue d'ensemble
curl http://localhost:3000/api/dashboard/performance/achats/dashboard

# Tendances
curl http://localhost:3000/api/dashboard/performance/achats/trends

# Fournisseurs
curl http://localhost:3000/api/dashboard/performance/achats/fournisseurs

# Commandes ouvertes
curl http://localhost:3000/api/dashboard/performance/achats/open-orders
```

**4. Tester le frontend :**
- Naviguer vers `/dashboard?main=performance&sub=achats&leaf=dashboard`
- Vérifier que la sidebar affiche "Achats & Contrats"
- Vérifier que les 4 KPIs s'affichent
- Vérifier que le graphique de tendances s'affiche (si données disponibles)

## ⚠️ Points d'attention

### 1. Qualité des données
- **Prix de référence** : `prix_reference` doit être alimenté proprement pour que la variance prix ait du sens
- **Dates** : Vérifier que `bc.emis_le` et `bl.recu_le` sont correctement renseignés pour le calcul du lead time

### 2. ABAC (Scopes)
- Si besoin de filtrer par bureau/chantier, les colonnes `bureau_code` et `chantier_code` sont déjà dans `rm_achats_open_orders`
- La mécanique ABAC est en place dans `SqlReadModelsRepoAchats.loadOpenOrders()` (actuellement simplifiée, peut être réactivée)

### 3. Performance
- Si création BL/BC très fréquente, vérifier la cadence de refresh (event-driven + cron)
- Les MViews utilisent `CONCURRENTLY` pour limiter les locks
- Index optimisés présents sur toutes les MViews

### 4. Observabilité
- Traces OTel sur les API et PG ✅
- Métriques Prometheus ✅
- Logs corrélés (x-request-id) ✅
- Health MViews ✅

## ✅ Statut final

**Tous les éléments sont en place pour le déploiement :**
- ✅ SQL (3 fichiers)
- ✅ Worker P3 (mapping domaines)
- ✅ CRON (liste MViews)
- ✅ Navigation (config JSON)
- ✅ Registry (4 entrées dans 2 fichiers)
- ✅ Backend (repository + service)
- ✅ Frontend (4 composants)

**Prêt pour PR "P5 – Achats/Contrats"** 🚀
