# Plan d'Implémentation des Fonctionnalités Dashboard

## 🎯 Objectif

Transformer les **109 composants squelettes** en composants fonctionnels avec toutes les fonctionnalités nécessaires.

---

## 📊 État Actuel vs État Cible

### État Actuel (Squelettes)
- ✅ Structure de base (KPICards, EmptyState)
- ❌ Pas de chargement de données API
- ❌ Pas de listes/tableaux
- ❌ Pas de graphiques
- ❌ Pas de modals
- ❌ Export non fonctionnel
- ❌ Recherche non fonctionnelle
- ❌ Calculs de KPIs statiques

### État Cible (Composants Complets)
- ✅ Structure de base
- ✅ Chargement de données API
- ✅ Listes/tableaux interactifs
- ✅ Graphiques et visualisations
- ✅ Modals de détail
- ✅ Export CSV/JSON fonctionnel
- ✅ Recherche et filtres fonctionnels
- ✅ Calculs de KPIs dynamiques

---

## 🔧 Fonctionnalités à Implémenter

### 1. Composants Réutilisables à Créer

#### A. DataTable Component
```typescript
// src/modules/dashboard/components/shared/DataTable.tsx
- Tri par colonnes
- Pagination
- Sélection multiple
- Actions sur lignes
- Responsive
```

#### B. CardList Component
```typescript
// src/modules/dashboard/components/shared/CardList.tsx
- Affichage en grille de cards
- Filtrage
- Tri
- Actions sur cards
```

#### C. TimelineList Component
```typescript
// src/modules/dashboard/components/shared/TimelineList.tsx
- Affichage chronologique
- Groupement par date
- Filtres temporels
```

#### D. GenericModal Component
```typescript
// src/modules/dashboard/components/shared/GenericModal.tsx
- Modal réutilisable
- Différentes tailles
- Actions personnalisables
```

---

### 2. Loaders API à Implémenter

**109 loaders** actuellement vides à compléter dans `src/modules/dashboard/api/loaders.ts`

**Exemples**:
- `loadAlertsActivesApi` → `/api/dashboard/overview/alerts/actives`
- `loadValidationsEnAttenteApi` → `/api/dashboard/performance/validation/en-attente`
- `loadActionsInboxUrgentesApi` → `/api/dashboard/actions/inbox/urgentes`
- etc.

**Pattern**:
```typescript
export async function loadAlertsActivesApi(): Promise<AlertsActivesData> {
  const res = await fetch('/api/dashboard/overview/alerts/actives');
  if (!res.ok) throw new Error('Failed to load alerts');
  return res.json();
}
```

---

### 3. Fonctionnalités par Composant

#### Pour chaque composant (109), implémenter:

1. **Chargement de données**
   - Utiliser le loader API correspondant
   - Gestion d'erreurs
   - États de chargement

2. **Calculs de KPIs**
   - Calculer depuis données réelles
   - Tendances (comparaison périodes)
   - Formattage (monétaire, dates, etc.)

3. **Affichage de données**
   - Liste/tableau selon type de données
   - Graphiques si applicable
   - Cards pour résumés

4. **Recherche et filtres**
   - Recherche textuelle
   - Filtres par type/statut/date
   - Filtres combinés

5. **Export**
   - CSV avec en-têtes
   - JSON formaté
   - Utiliser données filtrées

6. **Interactions**
   - Clics sur KPIs → navigation/filtrage
   - Clics sur items → modal de détail
   - Actions (valider, rejeter, etc.)

---

## 🚀 Plan d'Implémentation par Phase

### Phase 1 - Infrastructure (Semaine 1-2)

**Priorité**: Critique

1. **Créer composants réutilisables**
   - `DataTable.tsx`
   - `CardList.tsx`
   - `TimelineList.tsx`
   - `GenericModal.tsx`

2. **Créer utilitaires**
   - `exportUtils.ts` (CSV/JSON export)
   - `filterUtils.ts` (filtrage générique)
   - `kpiCalculations.ts` (calculs communs)

3. **Créer loaders API prioritaires**
   - Overview (Alerts, Activity) - 4 loaders
   - Actions (Inbox) - 4 loaders
   - Performance (Validation, Budget) - 8 loaders

**Total**: ~16 loaders + 4 composants réutilisables

---

### Phase 2 - Composants Prioritaires (Semaine 3-4)

**Priorité**: Haute

Implémenter complètement les composants les plus utilisés:

1. **Overview - Alerts** (2 composants)
   - `AlertsActivesPage`
   - `AlertsUrgentesPage`

2. **Actions - Inbox** (4 composants)
   - `ActionsInboxUrgentesPage`
   - `ActionsInboxAujourdhuiPage`
   - `ActionsInboxSemainePage`
   - `ActionsInboxPersonnaliseesPage`

3. **Performance - Validation** (4 composants)
   - `ValidationsEnAttentePage`
   - `ValidationsValideesPage`
   - `ValidationsRejeteesPage`
   - `ValidationsCircuitPage`

**Total**: 10 composants complets

---

### Phase 3 - Composants Secondaires (Semaine 5-6)

**Priorité**: Moyenne

1. **Performance - Budget** (4 composants)
2. **Performance - Delays** (3 composants)
3. **Performance - Stocks** (2 composants)
4. **Performance - Materiel** (1 composant)

**Total**: 10 composants complets

---

### Phase 4 - Composants Avancés (Semaine 7-8)

**Priorité**: Moyenne-Basse

1. **Risks** (13 composants)
2. **Decisions** (15 composants)
3. **Realtime** (12 composants)
4. **Administration** (9 composants)

**Total**: 49 composants complets

---

### Phase 5 - Composants Spécialisés (Semaine 9-10)

**Priorité**: Basse

1. **Performance - Bureaux** (12 composants)
2. **Performance - Comparison** (4 composants)
3. **Performance - Compliance** (4 composants)
4. **Performance - Trends** (3 composants)
5. **Actions - Type/Priority/Blocked/Assigned/History** (17 composants)

**Total**: 40 composants complets

---

## 📝 Template de Composant Complet

Basé sur `DemandesKpiPage.tsx`, voici le template à suivre:

```typescript
'use client';

import React, { useCallback, memo, useMemo, useState, useEffect } from 'react';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardPanel,
  KPICard,
  type KPICardData,
  MockDataIndicator,
} from '../shared';
import { EmptyState } from './EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';
import { DataTable } from '../shared/DataTable'; // À créer
import { useDashboardData } from '../../hooks/useDashboardData';

export const ComponentName = memo(function ComponentName() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData({
    main: 'category',
    sub: 'subcategory',
    leaf: 'leaf',
  });
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) return { total: 0, ... };
    return {
      total: data.items.length,
      // ... calculs
    };
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredData = useMemo(() => {
    if (!data?.items) return [];
    if (!searchQuery.trim()) return data.items;
    const query = searchQuery.toLowerCase();
    return data.items.filter(item => 
      item.name.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Colonne1', 'Colonne2', ...];
    const rows = filteredData.map(item => [item.field1, item.field2, ...]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    // ... téléchargement
  }, [filteredData]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    const jsonContent = JSON.stringify(filteredData, null, 2);
    // ... téléchargement
  }, [filteredData]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total',
      value: stats.total,
      color: 'blue',
      trend: calculateTrend(stats.total, previousStats.total),
    },
    // ...
  ], [stats]);
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
    return <ErrorState error={error} />;
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="..." description="...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>
        
        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3>Liste</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher..."
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>
          
          {filteredData.length === 0 ? (
            <EmptyState ... />
          ) : (
            <DataTable
              data={filteredData}
              columns={columns}
              onRowClick={(item) => setSelectedItem(item)}
            />
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});
```

---

## 🎯 Priorités d'Implémentation

### Priorité 1 - Critique (À faire immédiatement)
1. Créer composants réutilisables (DataTable, CardList, etc.)
2. Implémenter loaders API pour composants prioritaires
3. Compléter les 10 composants les plus utilisés

### Priorité 2 - Haute (Semaine 3-4)
4. Compléter composants Performance (Budget, Delays, Stocks)
5. Ajouter graphiques dans composants nécessaires

### Priorité 3 - Moyenne (Semaine 5-8)
6. Compléter composants Risks, Decisions, Realtime
7. Ajouter modals de détail partout

### Priorité 4 - Basse (Semaine 9-12)
8. Compléter composants Administration
9. Compléter composants Bureaux
10. Optimisations et polish

---

## 📈 Estimation

- **Composants réutilisables**: 4-6 composants
- **Loaders API**: 109 loaders
- **Composants à compléter**: 109 composants
- **Fonctionnalités par composant**: 5-8 en moyenne
- **Total fonctionnalités**: ~600-800

**Temps estimé**: 10-12 semaines pour compléter toutes les fonctionnalités

---

**Date**: 2026-01-27  
**Statut**: Plan d'implémentation créé
