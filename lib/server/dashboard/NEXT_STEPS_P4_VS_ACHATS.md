# 🎯 Prochaines étapes - P4 vs Achats/Contrats

## 📊 État actuel (P3 complété)

✅ **Phase P3 - Event-Driven + Jobs + KPIs Finance** :
- Event-Driven Refresh opérationnel
- Worker + CRON configurés
- KPIs Finance (RAT, RAP, RàF, DSO) intégrés
- Aucun impact UX (compatibilité totale)

---

## 🚀 Option 1 : Phase P4 - Observabilité & Robustesse

### 🎯 Objectif

Implémenter un système complet d'observabilité pour diagnostiquer les problèmes en production et améliorer la robustesse.

### ✅ Livrables P4

1. **Tracing OpenTelemetry** :
   - Spans pour requêtes HTTP, DB, jobs, MViews
   - Export vers Tempo/Jaeger
   - Corrélation avec logs

2. **Métriques Prometheus** :
   - Temps de refresh par vue
   - Erreurs de refresh
   - Notifications reçues
   - Latences API

3. **Logs structurés** :
   - CorrelationId (`x-request-id`)
   - Format JSON (Pino)
   - Logs corrélés API + worker

4. **Health checks** :
   - Endpoint `/api/health`
   - Vérification DB, MViews, worker heartbeat

5. **Rate limiting** :
   - Middleware sur `/api/dashboard/*`
   - Protection basique contre surcharge

### ⏱️ Estimation

- **Temps** : 2-3 jours
- **Complexité** : Moyenne
- **Impact UX** : Aucun (back-end uniquement)

### 🎁 Bénéfices

- ✅ **Diagnostic facilité** : Traces complètes pour identifier les goulots d'étranglement
- ✅ **Monitoring production** : Métriques pour alertes et dashboards
- ✅ **Robustesse** : Health checks et rate limiting
- ✅ **Conformité** : Logs structurés pour audit

### 📝 Fichiers à créer/modifier

- `lib/server/observability/telemetry.ts` (OpenTelemetry)
- `lib/server/observability/metrics.ts` (Prometheus)
- `lib/server/observability/logger.ts` (Pino)
- `lib/server/observability/health.ts` (Health checks)
- `app/api/internal/metrics/route.ts` (Endpoint Prometheus)
- `app/api/health/route.ts` (Health check public)

---

## 🛒 Option 2 : Module Achats/Contrats

### 🎯 Objectif

Créer l'ossature du module Achats/Contrats avec KPIs métier (lead time, écarts prix, conformité).

### ✅ Livrables Achats/Contrats

1. **Tables SQL** :
   - `fournisseurs` : Liste des fournisseurs
   - `contrats` : Contrats en cours
   - `lignes_contrat` : Lignes de contrat
   - `bons_commande` (BC) : Commandes émises
   - `bons_livraison` (BL) : Livraisons reçues

2. **Vues matérialisées** :
   - `rm_achats_overview` : KPIs agrégés
   - `rm_achats_trends` : Évolution temporelle
   - `rm_achats_fournisseurs` : Performance par fournisseur
   - `rm_achats_commandes_ouvertes` : BC en attente

3. **KPIs métier** :
   - **Lead time moyen** : Jours entre émission BC et réception BL
   - **Écarts prix** : Différences prix prévu vs réel
   - **Conformité** : Respect CCAP/CCAG
   - **Litiges** : Nombre de litiges en cours

4. **Intégration front** :
   - Page `/maitre-ouvrage/dashboard/performance/achats/dashboard`
   - KPIs dans la synthèse globale
   - Listes de contrats/BC/BL

### ⏱️ Estimation

- **Temps** : 3-4 jours
- **Complexité** : Moyenne à élevée
- **Impact UX** : Nouveau module visible

### 🎁 Bénéfices

- ✅ **Valeur métier** : Module essentiel pour le BTP
- ✅ **Visibilité achats** : Suivi des commandes et livraisons
- ✅ **Optimisation** : Identification des fournisseurs performants
- ✅ **Conformité** : Suivi des contrats et litiges

### 📝 Fichiers à créer/modifier

- `lib/server/dashboard/sql/06_erp_achats_contrats.sql` (Tables + vues)
- `src/modules/dashboard/types/dashboard.readmodels.ts` (Types `KpisAchatsData`)
- `lib/server/dashboard/repositories/SqlReadModelsRepo.ts` (Méthode `loadKpisAchats`)
- `src/modules/dashboard/components/views/AchatsKpiPage.tsx` (Page front)
- `src/modules/dashboard/registry/dashboardRegistry.tsx` (Registry entry)

---

## 🤔 Recommandation

### 🥇 **Phase P4 en premier** (recommandé)

**Pourquoi** :
1. **Stabilité** : Observabilité nécessaire avant d'ajouter de nouveaux modules
2. **Diagnostic** : Facilite le debug des problèmes en production
3. **Monitoring** : Permet de surveiller la santé du système
4. **Rapidité** : Plus rapide à implémenter (2-3 jours vs 3-4 jours)
5. **Fondation** : Crée les bases pour les modules futurs

**Ensuite** : Module Achats/Contrats avec observabilité déjà en place

### 🥈 **Module Achats/Contrats en premier** (si besoin métier urgent)

**Pourquoi** :
1. **Valeur métier** : Besoin urgent du module Achats
2. **Visibilité** : Module visible immédiatement pour les utilisateurs
3. **Fonctionnalité** : Ajoute une fonctionnalité complète

**Risque** : Sans observabilité, plus difficile de diagnostiquer les problèmes

---

## 📋 Plan d'action recommandé

### Semaine 1 : Phase P4
- [ ] Jour 1-2 : OpenTelemetry + Prometheus
- [ ] Jour 2-3 : Logs structurés + Health checks
- [ ] Jour 3 : Rate limiting + Tests
- [ ] Jour 3 : Documentation + Déploiement

### Semaine 2 : Module Achats/Contrats
- [ ] Jour 1-2 : SQL (tables + vues)
- [ ] Jour 2-3 : Repository + Service
- [ ] Jour 3-4 : Front (page + intégration)
- [ ] Jour 4 : Tests + Documentation

---

## 🎯 Décision

**Votre choix** : 
- [ ] **P4** → Observabilité & Robustesse
- [ ] **Achats** → Module Achats/Contrats

**Note** : Les deux peuvent être faits en parallèle si vous avez plusieurs développeurs, mais P4 est recommandé en premier pour la stabilité.

---

## 📚 Documentation associée

- **Checklist P3** : `lib/server/dashboard/POST_DEPLOYMENT_CHECKLIST.md`
- **PR P3** : `lib/server/dashboard/PR_P3_SYNTHESE.md`
- **Déploiement** : `lib/server/dashboard/DEPLOYMENT_SCRIPTS.md`
