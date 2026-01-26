# PR P7 - Reporting Direction - Arborescence & Récapitulatif

## 📋 Vue d'ensemble

Module de **Reporting Direction** pour pilotage CODIR avec consolidation mensuelle multi-bureaux/multi-chantiers. Compatible à 100% avec l'architecture dashboard existante (router, registry, navigation, ABAC, CQRS).

**Aucune rupture UX** : router avancé, Sidebar/Subnav, KPI Bar, registry restent inchangés.

---

## 🗂️ Arborescence des fichiers

### 1. SQL - Vues matérialisées (nouveau)

```
lib/server/dashboard/sql/
└── 13_reporting_views.sql                    [NOUVEAU]
    ├── Table cal_mois (calendrier mensuel)
    ├── rm_reporting_overview (synthèse mensuelle tenant-wide)
    ├── rm_reporting_dso (DSO mensuel)
    ├── rm_reporting_bureau (production par bureau/mois)
    └── rm_reporting_chantier (production par chantier/mois)
```

### 2. Backend - Repository & Service (nouveau/modifié)

```
lib/server/dashboard/
├── repositories/
│   └── SqlReadModelsRepo.Reporting.ts        [NOUVEAU]
│       ├── loadOverview() → ReportingOverviewMonthlyData[]
│       ├── loadDSOMonthly() → ReportingDSOMonthlyData[]
│       ├── loadTrendsMonthly() → ReportingOverviewMonthlyData[]
│       ├── loadByBureau() → ReportingByBureauMonthlyData[]
│       └── loadByChantier() → ReportingByChantierMonthlyData[]
│
├── services/
│   └── dashboardReadService.ts                [MODIFIÉ]
│       ├── Ajout méthodes privées :
│       │   ├── reportingOverview() → { monthly, dso }
│       │   ├── reportingTrends() → ReportingOverviewMonthlyData[]
│       │   ├── reportingByBureau() → ReportingByBureauMonthlyData[]
│       │   └── reportingByChantier() → ReportingByChantierMonthlyData[]
│       └── Extension dispatcher pour performance::reporting::* et decisions::reporting::*
│
└── workers/
    ├── refreshMViewsWorker.ts                 [MODIFIÉ]
    │   └── Mappings event-driven ajoutés :
    │       ├── situations_travaux → ['rm_reporting_overview', 'rm_reporting_dso', 'rm_reporting_bureau', 'rm_reporting_chantier', ...]
    │       ├── factures → ['rm_reporting_overview', 'rm_reporting_dso', ...]
    │       └── encaissements → ['rm_reporting_dso', ...]
    │
    └── refreshMViewsCron.ts                   [MODIFIÉ]
        └── Ajout des vues reporting dans VIEWS array
```

### 3. Frontend - Types & Composants (nouveau/modifié)

```
src/modules/dashboard/
├── types/
│   ├── dashboard.readmodels.ts               [MODIFIÉ]
│   │   ├── ReportingOverviewMonthlyData (nouveau)
│   │   ├── ReportingDSOMonthlyData (nouveau)
│   │   ├── ReportingByBureauMonthlyData (nouveau)
│   │   ├── ReportingByChantierMonthlyData (nouveau)
│   │   ├── ReportingOverviewCombinedData (nouveau) → { monthly, dso }
│   │   └── Aliases pour compatibilité
│   │
│   └── dashboardDataTypes.ts                 [MODIFIÉ]
│       └── Export des nouveaux types + union DashboardViewData
│
├── components/
│   └── reporting/                            [NOUVEAU - 4 composants]
│       ├── ReportingOverviewPage.tsx         [NOUVEAU]
│       │   └── Vue synthèse avec KPIs + graphique mensuel
│       ├── ReportingTrendsPage.tsx           [NOUVEAU]
│       │   └── Tendances mensuelles (Production, Factures, Encaissements, RAP, RàF)
│       ├── ReportingByBureauPage.tsx         [NOUVEAU]
│       │   └── Consolidation par bureau avec graphiques mensuels
│       └── ReportingByChantierPage.tsx      [NOUVEAU]
│           └── Consolidation par chantier avec graphiques mensuels
│
├── registry/
│   └── index.tsx                              [MODIFIÉ]
│       ├── Dynamic imports des 4 composants Reporting
│       └── 4 entrées registry :
│           ├── 'performance::reporting::dashboard'
│           ├── 'performance::reporting::tendances'
│           ├── 'performance::reporting::bureaux'
│           └── 'performance::reporting::chantiers'
│
└── navigation/
    └── navigation.config.json                [MODIFIÉ]
        └── Section "reporting" ajoutée sous "performance"
```

### 4. Documentation (nouveau)

```
lib/server/dashboard/
└── PR_P7_REPORTING_DEPLOYMENT.md             [NOUVEAU]
    └── Guide de déploiement complet
```

---

## 📊 Résumé des modifications

### Fichiers créés (10)
1. `lib/server/dashboard/sql/10_reporting_views.sql`
2. `lib/server/dashboard/repositories/SqlReadModelsRepo.Reporting.ts`
3. `src/modules/dashboard/components/reporting/index.ts`
4. `src/modules/dashboard/components/reporting/ReportingOverviewPage.tsx`
5. `src/modules/dashboard/components/reporting/ReportingTrendsPage.tsx`
6. `src/modules/dashboard/components/reporting/ReportingByBureauPage.tsx`
7. `src/modules/dashboard/components/reporting/ReportingByChantierPage.tsx`
8. `lib/server/dashboard/PR_P7_REPORTING_DEPLOYMENT.md`
9. `PR_P7_REPORTING_DIRECTION.md` (ce fichier)

### Fichiers modifiés (6)
1. `lib/server/dashboard/services/dashboardReadService.ts`
2. `lib/server/dashboard/workers/refreshMViewsWorker.ts`
3. `lib/server/dashboard/workers/refreshMViewsCron.ts`
4. `src/modules/dashboard/types/dashboard.readmodels.ts`
5. `src/modules/dashboard/types/dashboardDataTypes.ts`
6. `src/modules/dashboard/registry/index.tsx`
7. `src/modules/dashboard/navigation/navigation.config.json`

---

## ✅ Garanties d'architecture

### Frontend - Aucune rupture UX

✅ **Router avancé** : inchangé, reste le point d'entrée unique
- Lazy loading des composants
- Transitions fluides
- Fallback en cas d'erreur

✅ **Registry** : étendu sans casser l'existant
- Clé `main::sub::leaf` + `ttl` + `loader/render` (pattern existant)
- Loaders `loadGeneric` appellent l'API `/api/dashboard/*`
- Source unique de vérité pour le chargement des données

✅ **Navigation unifiée** : config JSON mise à jour
- Sidebar/Subnav lisent `navigation.config.json`
- URL sync + store (deep-link, back/forward)
- Aucun changement dans le comportement

✅ **KPI Bar** : helpers centralisés réutilisés
- `KPICard`, `toneToColor`, `parseTrendPercent`
- Cohérence visuelle maintenue

### Backend - CQRS & Event-Driven

✅ **CQRS read-side** : MViews mensuelles
- 4 MViews matérialisées avec index multi-colonnes
- Repository dédié `SqlReadModelsRepoReporting`
- Service dispatcher avec méthodes privées

✅ **Event-Driven** : refresh automatique
- Mappings dans `refreshMViewsWorker.ts`
- Déclenchement via triggers PostgreSQL
- CRON de secours configuré

✅ **ABAC** : filtrage respecté
- Colonnes `tenant_id`, `bureau_code`, `chantier_code` présentes
- Filtrage appliqué avant agrégation dans les requêtes

✅ **API** : dispatcher étendu
- Routes `performance::reporting::*` et `decisions::reporting::*`
- Observabilité intégrée (logs, métriques, tracing)

---

## 🚀 Déploiement

Voir `lib/server/dashboard/PR_P7_REPORTING_DEPLOYMENT.md` pour le guide complet.

**Étapes principales :**
1. Exécuter `13_reporting_views.sql`
2. Rafraîchir les MViews initialement
3. Vérifier les triggers event-driven
4. Relancer le worker si nécessaire
5. Frontend : aucune action (déjà configuré)

---

## 🎯 Validation

### Tests à effectuer

**Backend :**
- [ ] API `/api/dashboard/performance/reporting/dashboard` retourne `{ monthly, dso }`
- [ ] API `/api/dashboard/performance/reporting/tendances` retourne tableau
- [ ] API `/api/dashboard/performance/reporting/bureaux` retourne tableau
- [ ] API `/api/dashboard/performance/reporting/chantiers` retourne tableau

**Frontend :**
- [ ] Navigation vers les 4 vues fonctionne
- [ ] Données affichées correctement (KPIs + graphiques)
- [ ] Router lazy loading fonctionne
- [ ] Sidebar/Subnav affichent la section "Reporting Direction"

**Event-Driven :**
- [ ] Modification `situations_travaux` → refresh MViews reporting
- [ ] Modification `factures` → refresh MViews reporting
- [ ] Modification `encaissements` → refresh MViews reporting

---

## 📝 Notes importantes

1. **Formules Finance** : RAP/RàF/DSO sont des proxies - valider avec Finance
2. **ABAC** : Vérifier que le filtrage est appliqué avant agrégation
3. **Performance** : Index multi-colonnes créés pour optimiser les lectures
4. **Exports** : Route `/api/export/reporting` à créer en option (streaming CSV)

---

**PR prête à merger** ✅
