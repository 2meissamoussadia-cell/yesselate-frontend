# 📋 Résumé des Emplacements et Interactions - Dashboard BMO

**Date:** $(date)
**Version:** 1.0

---

## ✅ Vérification Complète des Emplacements

### 1. Composants Principaux

| Composant | Fichier | Utilisé dans | Ligne |
|-----------|---------|--------------|-------|
| `DashboardPage` | `app/(portals)/maitre-ouvrage/dashboard/page.tsx` | Route `/maitre-ouvrage/dashboard` | 100 |
| `DashboardModals` | `src/components/features/bmo/dashboard/command-center/DashboardModals.tsx` | `DashboardPage` | 991 |
| `DashboardContentSwitch` | `src/modules/dashboard/components/DashboardContentSwitch.tsx` | `DashboardPage` (via wrapper) | 1276 |
| `DashboardUrlSync` | `src/modules/dashboard/components/DashboardUrlSync.tsx` | `DashboardPage` | 555 |
| `DashboardSidebar` | `src/modules/dashboard/navigation/DashboardSidebar.tsx` | `DashboardPage` | 559 |
| `DashboardSubNavigation` | `src/modules/dashboard/navigation/DashboardSubNavigation.tsx` | `DashboardPage` | 578 |
| `KPIAlertsSystem` | `src/components/features/bmo/dashboard/command-center/KPIAlertsSystem.tsx` | `DashboardPage` | 693 |
| `KPIAdvancedModal` | `src/components/features/bmo/dashboard/command-center/KPIAdvancedModal.tsx` | `DashboardModals` | 60, 65 |
| `KPIComparisonModal` | `src/components/features/bmo/dashboard/command-center/KPIComparisonModal.tsx` | `DashboardModals` | 86 |

### 2. Store Zustand

| Store | Fichier | Utilisé par |
|-------|---------|-------------|
| `dashboardCommandCenterStore` | `src/lib/stores/dashboardCommandCenterStore.ts` | Tous les composants du dashboard |

**Actions principales:**
- `navigate(mainCategory, subCategory?, subSubCategory?)` - Navigation
- `openModal(type, data?)` - Ouvrir un modal
- `closeModal()` - Fermer le modal actuel
- `toggleSidebar()` - Toggle sidebar
- `toggleCommandPalette()` - Toggle command palette

### 3. Hooks

| Hook | Fichier | Utilisé dans |
|------|---------|--------------|
| `useDashboardKPIs` | `src/lib/hooks/useDashboardKPIs.ts` | `DashboardPage` (ligne 203) |
| `useKPIDetail` | `src/lib/hooks/useDashboardKPIs.ts` | `KPIAdvancedModal`, `KPIComparisonModal` |
| `useApiQuery` | `src/lib/api/hooks/useApiQuery.ts` | `KPIAdvancedModal`, `useDashboardKPIs` |

### 4. Vues (Views)

| Vue | Fichier | Déclenchée par |
|-----|---------|----------------|
| `OverviewView` | `src/components/features/bmo/dashboard/command-center/views/OverviewView.tsx` | `mainCategory === 'overview'` |
| `PerformanceView` | `src/components/features/bmo/dashboard/command-center/views/PerformanceView.tsx` | `mainCategory === 'performance'` |
| `ActionsView` | `src/components/features/bmo/dashboard/command-center/views/ActionsView.tsx` | `mainCategory === 'actions'` |
| `RisksView` | `src/components/features/bmo/dashboard/command-center/views/RisksView.tsx` | `mainCategory === 'risks'` |
| `DecisionsView` | `src/components/features/bmo/dashboard/command-center/views/DecisionsView.tsx` | `mainCategory === 'decisions'` |
| `RealtimeView` | `src/components/features/bmo/dashboard/command-center/views/RealtimeView.tsx` | `mainCategory === 'realtime'` |

**Routage:** Via `DashboardContentSwitch` qui utilise `dashboardRegistry`

---

## 🔄 Flux d'Interactions Principaux

### 1. Navigation

```
User Click
  ↓
DashboardSidebar.onCategoryChange
  ↓
handleCategoryChange (DashboardPage)
  ↓
navigate(mainCategory, subCategory, null) [Store]
  ↓
Store.navigation updated
  ↓
DashboardContentSwitch reads navigation
  ↓
Resolve viewKey from registry
  ↓
Load & render view component
```

### 2. KPI Click

```
User Click KPI Card
  ↓
handleKPIClick (DashboardPage)
  ↓
getKPIMappingByLabel(kpi.label)
  ↓
openModal('kpi-drilldown', { kpi, kpiId }) [Store]
  ↓
Store.modal updated
  ↓
DashboardModals reads modal
  ↓
Route to KPIAdvancedModal
  ↓
useKPIDetail(kpiId) fetches data
  ↓
Render modal with data
```

### 3. Modal System

```
Any Component
  ↓
openModal(type, data) [Store]
  ↓
Store.modal = { isOpen: true, type, data }
  ↓
DashboardModals re-renders
  ↓
Switch on modal.type
  ↓
Render appropriate modal component
  ↓
User closes → closeModal() [Store]
  ↓
Store.modal = { isOpen: false, type: null, data: undefined }
```

### 4. KPI Data Flow

```
Component Mount
  ↓
useDashboardKPIs('year')
  ↓
dashboardAPI.getStats({ period: 'year' })
  ↓
Transform via dashboardKPIMapping
  ↓
Return KPIDisplayData[]
  ↓
DashboardPage.allKpis (useMemo)
  ↓
Filter & map to KPICard components
  ↓
Display in KPI Strip
```

### 5. Alerts System

```
KPIAlertsSystem receives KPIs
  ↓
Check thresholds (from localStorage)
  ↓
Compare current values
  ↓
If threshold exceeded
  ↓
onAlert callback
  ↓
DashboardPage.setKpiChangeNotifications
  ↓
Display notification UI
```

---

## 📍 Points d'Intégration

### 1. **DashboardPage** (Point d'entrée)

**Imports clés:**
```typescript
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { DashboardModals } from '@/components/features/bmo/dashboard/command-center/DashboardModals';
import { useDashboardKPIs } from '@/lib/hooks/useDashboardKPIs';
import { KPIAlertsSystem } from '@/components/features/bmo/dashboard/command-center/KPIAlertsSystem';
import { DashboardSidebar, DashboardSubNavigation, DashboardUrlSync, DashboardContentSwitch } from '@/modules/dashboard';
```

**Rend:**
- `DashboardUrlSync` (ligne 555)
- `DashboardSidebar` (ligne 559)
- `DashboardSubNavigation` (ligne 578)
- `KPIAlertsSystem` (ligne 693)
- `DashboardContentSwitchWrapper` (ligne 864)
- `DashboardModals` (ligne 991)

### 2. **DashboardModals** (Routeur de modals)

**Lit:** `modal` depuis le store

**Route vers:**
- `KPIAdvancedModal` pour `kpi-drilldown`
- `KPIComparisonModal` pour `kpi-comparison`
- `StatsModal`, `HelpModal`, `RiskDetailModal`, etc.

### 3. **DashboardContentSwitch** (Routeur de contenu)

**Lit:** `navigation` depuis le store

**Utilise:** `dashboardRegistry` pour résoudre la vue

**Charge:** Données via `view.loader` si disponible

**Cache:** Utilise le cache du store

---

## ✅ Checklist de Vérification

### Composants
- [x] Tous les composants sont correctement importés
- [x] Tous les composants sont utilisés dans les bons emplacements
- [x] Les props sont correctement passées
- [x] Les callbacks sont correctement connectés

### Store
- [x] Store est utilisé de manière cohérente
- [x] Toutes les actions sont accessibles
- [x] Navigation state est synchronisé avec URL
- [x] Modal state est géré centralement

### Hooks
- [x] `useDashboardKPIs` est utilisé correctement
- [x] `useKPIDetail` est utilisé dans les modals
- [x] Les hooks API sont utilisés correctement

### Flux de Données
- [x] KPI data flow fonctionne
- [x] Navigation flow fonctionne
- [x] Modal flow fonctionne
- [x] Alerts flow fonctionne

### Interactions
- [x] Navigation utilisateur fonctionne
- [x] Clics KPI ouvrent les modals
- [x] Modals se ferment correctement
- [x] Alerts se déclenchent correctement

---

## 🎯 Statut Final

✅ **Tous les emplacements vérifiés**
✅ **Toutes les interactions mappées**
✅ **Tous les flux de données documentés**
✅ **Aucun problème critique identifié**

**Prochaines étapes:**
1. Implémenter les recommandations de l'analyse détaillée
2. Ajouter des tests d'intégration
3. Optimiser les performances si nécessaire


