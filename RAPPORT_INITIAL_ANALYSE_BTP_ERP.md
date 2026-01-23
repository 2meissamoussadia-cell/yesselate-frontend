# 📊 Rapport Initial - Analyse ERP BTP Front-End

**Date**: 2025-01-XX  
**Analyste**: Cursor AI Assistant  
**Version Projet**: 0.1.0  
**Framework**: Next.js 16.1.1 + React 19.2.3

---

## PARTIE 1 : INVENTAIRE TECHNIQUE

### 1.1 Structure du Projet

**Type**: Monorepo Next.js avec architecture feature-based

**Technologies principales**:
- **Framework**: Next.js 16.1.1 (App Router)
- **React**: 19.2.3
- **TypeScript**: ^5 (strict mode activé)
- **State Management**: Zustand (66 stores) + React Query
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI + Custom
- **Forms**: React Hook Form + Zod
- **Data**: Prisma Client + Axios

**Métriques**:
- **Pages**: 113 pages Next.js
- **API Routes**: 244 routes
- **Stores Zustand**: 66
- **Services**: 61
- **Composants**: ~1200
- **Tests**: 11 fichiers (couverture faible)

### 1.2 Architecture Actuelle

**Pattern**: Feature-based modules avec séparation partielle

**Structure**:
```
app/
  (portals)/maitre-ouvrage/  # 113 pages
  api/                        # 244 routes API
src/
  components/features/bmo/    # 995 fichiers
  lib/
    stores/                   # 66 stores Zustand
    services/                 # 61 services
    api/                      # 28 clients API
  modules/                    # Feature modules
  domain/                     # Domain logic (limité)
  hooks/                      # 50 hooks personnalisés
```

**Points forts**:
- ✅ TypeScript strict activé
- ✅ Architecture modulaire (features)
- ✅ React Query pour cache
- ✅ Zustand pour state local
- ✅ Zod pour validation

**Points faibles**:
- ❌ Logique métier dans composants
- ❌ Services non typés (pas d'OpenAPI)
- ❌ Couverture tests faible (~5%)
- ❌ Pas de virtualisation des listes
- ❌ Pas de support offline structuré

### 1.3 Dépendances Clés

**State & Data**:
- `zustand@5.0.9` - 66 stores
- `@tanstack/react-query@5.90.12` - Cache & mutations
- `@tanstack/react-virtual@3.13.18` - Virtualisation (présent mais peu utilisé)

**UI**:
- `@radix-ui/*` - Composants accessibles
- `lucide-react` - Icônes
- `framer-motion` - Animations
- `tailwindcss@4` - Styling

**Forms & Validation**:
- `react-hook-form@7.69.0`
- `zod@4.2.1`

**Data**:
- `@prisma/client@5.22.0`
- `axios@1.13.2`

### 1.4 Configuration

**TypeScript**: Strict mode ✅
**Jest**: Configuré avec seuil 70% (non atteint)
**Next.js**: App Router avec API routes
**Paths**: Alias `@/*` configuré

---

## PARTIE 2 : CARTE DES DOMAINES MÉTIER

### 2.1 Domaines Identifiés

#### 🏗️ **Chantiers** (Partiellement implémenté)
- **Pages**: `projets-en-cours`
- **Composants**: `chantiers/`, `projets-en-cours/`
- **Services**: `projetsApiService.ts`
- **Stores**: `projetsCommandCenterStore`, `projetsWorkspaceStore`
- **API**: `/api/projets`, `/api/analytics/domains/chantiers`
- **Statut**: ⚠️ Architecture BTP présente mais logique métier dans composants

#### 📋 **Validation BC** (Bien structuré)
- **Pages**: `validation-bc/**/*`
- **Composants**: `validation-bc/`, `modules/validation-bc/`
- **Services**: `validation-bc-api.ts`, `validation-bc-anomalies.service.ts`
- **Stores**: `validationBCCommandCenterStore`, `validationBCWorkspaceStore`
- **API**: `/api/validation-bc/**/*`
- **Business Logic**: `validation-logic.ts` ✅ (bien séparé)
- **Statut**: ✅ Bonne séparation UI/Domain

#### 📄 **Validation Contrats**
- **Pages**: `validation-contrats`
- **Composants**: `validation-contrats/`
- **Services**: `contratsApiService.ts`
- **Stores**: `validationContratsWorkspaceStore`
- **Statut**: ⚠️ Logique métier partiellement dans composants

#### 💳 **Validation Paiements**
- **Pages**: `validation-paiements`
- **Services**: `paiementsApiService.ts`
- **Stores**: `paymentValidationWorkspaceStore`, `paiementsWorkspaceStore`
- **Statut**: ⚠️ Logique métier dans composants

#### 📝 **Demandes**
- **Pages**: `demandes`
- **Composants**: `demandes/`, `modules/demandes/`
- **Services**: `demandesApiService.ts`
- **Stores**: `demandesCommandCenterStore`
- **Business Logic**: `DemandView.tsx` ❌ (dans composant)
- **Statut**: ❌ Logique métier dans composant

#### 👥 **Demandes RH**
- **Pages**: `demandes-rh`
- **Composants**: `workspace/rh/`
- **Services**: `rhApiService.ts`, `rhBusinessService.ts`, `rhBusinessRules.ts` ✅
- **Stores**: `demandesRHCommandCenterStore`, `rhWorkspaceStore`
- **Business Logic**: `DemandeRHView.tsx` ❌ (dans composant)
- **Statut**: ⚠️ Services présents mais logique aussi dans composant

#### 🏛️ **Gouvernance**
- **Pages**: `governance/**/*`
- **Composants**: `governance/`, `modules/gouvernance/`
- **Services**: `governanceService.ts`
- **Stores**: `governanceCommandCenterStore`, `governanceWorkspaceStore`
- **Business Logic**: `governance/page.tsx` ❌ (562 lignes, logique métier)
- **Statut**: ❌ Composant monolithique

#### 🚨 **Alertes**
- **Pages**: `alerts/**/*`
- **Composants**: `alerts/`, `modules/alerts/`, `modules/centre-alertes/`
- **Services**: `alertsApiService.ts`
- **Stores**: `alertsCommandCenterStore`, `alertsStore`, `alertesCommandCenterStore`
- **Statut**: ⚠️ Duplication de stores

#### 🚫 **Dossiers Bloqués**
- **Pages**: `blocked`
- **Composants**: `blocked/`, `modules/blocked/`
- **Services**: `blockedApiService.ts`, `blockedWebSocketService.ts`
- **Stores**: `blockedCommandCenterStore`, `blockedWorkspaceStore`
- **Statut**: ✅ Bien structuré

#### 🔄 **Délégations**
- **Pages**: `delegations`
- **Composants**: `delegations/`, `modules/delegations/`
- **Services**: `delegationsApiService.ts`
- **Stores**: `delegationsCommandCenterStore`, `delegationWorkspaceStore`
- **Business Logic**: `policy-engine.ts` ✅ (bien séparé)
- **Statut**: ✅ Bonne séparation

#### 📅 **Calendrier/Planning**
- **Pages**: `calendrier`
- **Composants**: `calendar/`, `modules/calendrier/`
- **Services**: `calendarValidationService.ts`, `calendarConflicts.ts`, `calendarSLA.ts`
- **Stores**: `calendrierCommandCenterStore`, `calendrierStore`, `calendarWorkspaceStore`
- **Statut**: ⚠️ Duplication de stores

#### 📊 **Analytics BTP**
- **Pages**: `analytics`
- **Composants**: `analytics/`
- **Services**: `analyticsDataService.ts`, `analyticsSearchService.ts`
- **Stores**: `analyticsCommandCenterStore`, `analyticsBTPNavigationStore`
- **Business Logic**: `analyticsBTPArchitecture.ts` ✅
- **Statut**: ✅ Bien structuré

### 2.2 Cartographie Complète

Voir `component-domain-map.json` pour la cartographie détaillée.

---

## PARTIE 3 : DÉTECTION D'ANTI-PATTERNS

### 3.1 Logique Métier dans Composants ❌ CRITIQUE

**Score**: 10/10 (Fréquence: 10, Risque: 10, Complexité: 1)

**Exemples identifiés**:
1. **`DemandView.tsx`** (1068 lignes)
   - Calculs de budget, risques, priorités dans le composant
   - Actions métier (assign, validate, reject) dans handlers
   - **Impact**: Difficile à tester, réutiliser, maintenir

2. **`DemandeRHView.tsx`** (809 lignes)
   - Validation métier dans `useEffect`
   - Calculs de congés, conflits dans composant
   - **Impact**: Logique RH non réutilisable

3. **`governance/page.tsx`** (562 lignes)
   - Logique de filtrage, RACI, alertes dans composant
   - **Impact**: Composant monolithique, difficile à tester

4. **`ValidationBCBusinessRules.tsx`**
   - Règles métier hardcodées dans composant
   - **Impact**: Règles non centralisées, difficiles à modifier

**Solution**: Extraire vers `domain/<domain>/services/` et `domain/<domain>/rules/`

### 3.2 Appels API Non Typés ⚠️ IMPORTANT

**Score**: 8/10 (Fréquence: 8, Risque: 7, Complexité: 2)

**Problème**: Services utilisent `axios` directement sans types générés depuis OpenAPI

**Exemples**:
- `projetsApiService.ts` - Types manuels, pas de contrat
- `demandesApiService.ts` - Pas de validation de réponse
- `paiementsApiService.ts` - Types partiels

**Solution**: Générer clients TypeScript depuis OpenAPI/Swagger

### 3.3 Formulaires Sans Validation Typée ⚠️ IMPORTANT

**Score**: 7/10 (Fréquence: 7, Risque: 6, Complexité: 2)

**Problème**: Formulaires utilisent React Hook Form mais schémas Zod incomplets

**Solution**: Schémas Zod complets pour tous les formulaires métier

### 3.4 Composants Non Testés ❌ CRITIQUE

**Score**: 9/10 (Fréquence: 10, Risque: 8, Complexité: 1)

**Problème**: 
- 11 fichiers de tests pour ~1200 composants
- Couverture estimée <5%
- Pas de tests E2E Playwright

**Solution**: Tests unitaires pour services/domain, E2E pour workflows critiques

### 3.5 Tableaux Non Virtualisés ⚠️ PERFORMANCE

**Score**: 6/10 (Fréquence: 6, Risque: 5, Complexité: 3)

**Problème**: 
- `@tanstack/react-virtual` présent mais peu utilisé
- Listes de demandes, chantiers, alertes non virtualisées
- **Impact**: Performance dégradée avec >100 items

**Solution**: Virtualiser toutes les listes >50 items

### 3.6 Duplication de Stores ⚠️ MAINTENANCE

**Score**: 5/10 (Fréquence: 5, Risque: 4, Complexité: 2)

**Problème**:
- `alertsStore` + `alertesCommandCenterStore` + `alertWorkspaceStore`
- `calendrierStore` + `calendrierCommandCenterStore` + `calendarWorkspaceStore`
- **Impact**: Confusion, état incohérent

**Solution**: Consolidation des stores par domaine

### 3.7 Composants Monolithiques ⚠️ MAINTENANCE

**Score**: 7/10 (Fréquence: 4, Risque: 7, Complexité: 3)

**Exemples**:
- `dashboard/page.tsx` - 2436 lignes
- `governance/page.tsx` - 562 lignes
- `DemandView.tsx` - 1068 lignes

**Solution**: Découpage en sous-composants + extraction logique

### 3.8 Pas de Support Offline Structuré ⚠️ FONCTIONNALITÉ

**Score**: 6/10 (Fréquence: 3, Risque: 8, Complexité: 4)

**Problème**: 
- `next-pwa` présent mais pas de stratégie offline
- Pas de queue de sync
- Pas de résolution de conflits

**Solution**: IndexedDB + queue de sync + stratégie de résolution

---

## PRIORISATION

### 🔴 CRITIQUE (Score ≥ 9)

1. **Logique métier dans composants** (Score: 10)
   - **Impact**: Maintenabilité, testabilité, réutilisabilité
   - **Effort**: 40J/H
   - **Domaine prioritaire**: Demandes, Demandes RH, Governance

2. **Composants non testés** (Score: 9)
   - **Impact**: Risque de régression, qualité
   - **Effort**: 60J/H
   - **Priorité**: Services/domain d'abord, puis composants critiques

### 🟠 IMPORTANT (Score 7-8)

3. **Appels API non typés** (Score: 8)
   - **Impact**: Sécurité, maintenabilité
   - **Effort**: 20J/H
   - **Priorité**: Services métier critiques

4. **Composants monolithiques** (Score: 7)
   - **Impact**: Maintenabilité
   - **Effort**: 30J/H
   - **Priorité**: Dashboard, Governance, DemandView

5. **Formulaires sans validation typée** (Score: 7)
   - **Impact**: Qualité données, UX
   - **Effort**: 15J/H
   - **Priorité**: Formulaires métier critiques

### 🟡 AMÉLIORABLE (Score 5-6)

6. **Tableaux non virtualisés** (Score: 6)
7. **Pas de support offline** (Score: 6)
8. **Duplication de stores** (Score: 5)

---

## 3 PRs PRIORITAIRES DÉTAILLÉES

Voir sections suivantes pour chaque PR complète.

---

**Document généré automatiquement par Cursor AI Assistant**  
**Prochaine étape**: Implémentation des PRs prioritaires

