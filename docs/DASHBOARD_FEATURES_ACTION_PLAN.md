# Plan d'Action - Implémentation des Fonctionnalités Dashboard

## 🎯 Objectif

Transformer les **109 composants squelettes** en composants fonctionnels complets.

---

## 📊 Analyse des Fonctionnalités Manquantes

### État Actuel
- ✅ **109 composants créés** (structure de base)
- ❌ **109 loaders API vides** (`data: {}`)
- ❌ **~80 composants** sans listes/tableaux
- ❌ **~40 composants** sans graphiques
- ❌ **~50 composants** sans modals
- ❌ **109 composants** avec export non fonctionnel
- ❌ **~60 composants** avec recherche non fonctionnelle
- ❌ **~40 composants** avec KPIs statiques

### État Cible
- ✅ Structure de base
- ✅ Chargement de données API réel
- ✅ Listes/tableaux interactifs
- ✅ Graphiques et visualisations
- ✅ Modals de détail
- ✅ Export CSV/JSON fonctionnel
- ✅ Recherche et filtres fonctionnels
- ✅ Calculs de KPIs dynamiques

---

## 🚀 Plan d'Action Immédiat

### Étape 1: Créer Composants Réutilisables (Priorité Critique)

#### A. DataTable pour Dashboard
**Fichier**: `src/modules/dashboard/components/shared/DashboardDataTable.tsx`

**Fonctionnalités**:
- Tri par colonnes
- Pagination
- Recherche intégrée
- Actions sur lignes
- Responsive
- Styles dashboard (slate theme)

**Basé sur**: `src/presentation/components/DataTable/DataTable.tsx` (existe déjà)

#### B. CardList Component
**Fichier**: `src/modules/dashboard/components/shared/CardList.tsx`

**Fonctionnalités**:
- Affichage en grille de cards
- Filtrage
- Tri
- Clics sur cards → modal

**Basé sur**: Pattern de `DemandesKpiPage.tsx` (lignes 512-556)

#### C. Utilitaires d'Export
**Fichier**: `src/modules/dashboard/utils/exportUtils.ts`

**Fonctionnalités**:
- `exportToCSV(data, headers, filename)`
- `exportToJSON(data, filename)`
- Gestion des caractères spéciaux

---

### Étape 2: Implémenter Loaders API (Priorité Critique)

**Fichier**: `src/modules/dashboard/api/loaders.ts`

**Pattern à suivre**:
```typescript
export async function loadAlertsActivesApi(): Promise<AlertsActivesData> {
  try {
    const res = await fetch('/api/dashboard/overview/alerts/actives', {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to load alerts actives:', error);
    // Retourner structure vide plutôt que throw
    return { alerts: [], stats: { total: 0, critiques: 0, urgentes: 0, normales: 0 } };
  }
}
```

**Loaders à créer** (109 total):
- Overview (4): Alerts, Activity
- Performance (40): Indicators, Validation, Budget, Delays, Stocks, Materiel, Comparison, Compliance, Trends, Bureaux
- Actions (21): Inbox, Type, Priority, Blocked, Assigned, History
- Risks (13)
- Decisions (15)
- Realtime (12)
- Administration (9)

---

### Étape 3: Compléter Composants Prioritaires (Priorité Haute)

#### Composants à compléter en premier (10 composants):

1. **AlertsActivesPage**
   - Loader API
   - Liste d'alertes avec DataTable
   - Modal de détail
   - Export fonctionnel
   - Recherche fonctionnelle

2. **AlertsUrgentesPage** (même pattern)

3. **ActionsInboxUrgentesPage**
   - Loader API
   - Liste d'actions avec CardList
   - Actions (valider, rejeter, assigner)
   - Export fonctionnel

4. **ValidationsEnAttentePage**
   - Loader API
   - Liste de validations avec DataTable
   - Actions de validation
   - Export fonctionnel

5. **ValidationsValideesPage** (même pattern)
6. **ValidationsRejeteesPage** (même pattern)
7. **BudgetConsommationPage**
8. **BudgetRestantPage**
9. **DelaysCritiquesPage**
10. **PerformanceSynthesePage**

---

## 📝 Template de Composant Complet

Voici le template à utiliser pour compléter chaque composant:

```typescript
'use client';

import React, { useCallback, memo, useMemo, useState, useEffect } from 'react';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardPanel,
  KPICard,
  type KPICardData,
} from '../shared';
import { EmptyState } from './EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';
import { DashboardDataTable } from '../shared/DashboardDataTable'; // À créer
import { CardList } from '../shared/CardList'; // À créer
import { loadAlertsActivesApi } from '../../api/loaders';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';

interface Alert {
  id: string;
  type: string;
  priorite: 'critique' | 'urgente' | 'normale';
  message: string;
  date: string;
  bureau: string;
}

export const AlertsActivesPage = memo(function AlertsActivesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // ✅ Charger les données depuis l'API
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    
    loadAlertsActivesApi()
      .then((data) => {
        if (!cancelled) {
          setAlerts(data.alerts || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setIsLoading(false);
        }
      });
    
    return () => { cancelled = true; };
  }, []);
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    return {
      total: alerts.length,
      critiques: alerts.filter(a => a.priorite === 'critique').length,
      urgentes: alerts.filter(a => a.priorite === 'urgente').length,
      normales: alerts.filter(a => a.priorite === 'normale').length,
    };
  }, [alerts]);
  
  // ✅ Filtrer les données
  const filteredAlerts = useMemo(() => {
    if (!searchQuery.trim()) return alerts;
    const query = searchQuery.toLowerCase();
    return alerts.filter(alert => 
      alert.type.toLowerCase().includes(query) ||
      alert.message.toLowerCase().includes(query) ||
      alert.bureau.toLowerCase().includes(query)
    );
  }, [alerts, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Type', 'Priorité', 'Message', 'Date', 'Bureau'];
    const rows = filteredAlerts.map(alert => [
      alert.type,
      alert.priorite,
      alert.message,
      alert.date,
      alert.bureau,
    ]);
    exportToCSV(rows, headers, `alertes-actives-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredAlerts]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredAlerts, `alertes-actives-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredAlerts]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total alertes',
      value: stats.total,
      color: 'blue',
      trend: '+0%',
    },
    {
      id: 'critiques',
      label: 'Critiques',
      value: stats.critiques,
      color: 'red',
      trend: '+0%',
    },
    {
      id: 'urgentes',
      label: 'Urgentes',
      value: stats.urgentes,
      color: 'amber',
      trend: '+0%',
    },
    {
      id: 'normales',
      label: 'Normales',
      value: stats.normales,
      color: 'emerald',
      trend: '+0%',
    },
  ], [stats]);
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  if (error) {
    return (
      <DashboardPageLayout>
        <EmptyState
          title="Erreur de chargement"
          description={error.message}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Alertes Actives" description="Alertes nécessitant une attention immédiate">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>
        
        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des alertes</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher une alerte..."
                totalCount={alerts.length}
                resultsCount={filteredAlerts.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>
          
          {filteredAlerts.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucune alerte trouvée" : "Aucune alerte active"}
              description={searchQuery 
                ? `Aucune alerte ne correspond à "${searchQuery}"`
                : "Il n'y a actuellement aucune alerte active nécessitant votre attention."
              }
              icon={AlertTriangle}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredAlerts}
              columns={[
                { key: 'type', label: 'Type', sortable: true },
                { key: 'priorite', label: 'Priorité', sortable: true },
                { key: 'message', label: 'Message' },
                { key: 'date', label: 'Date', sortable: true },
                { key: 'bureau', label: 'Bureau', sortable: true },
              ]}
              onRowClick={(alert) => setSelectedAlert(alert)}
              pagination
              pageSize={20}
            />
          )}
        </DashboardPanel>
      </DashboardSection>
      
      {/* Modal de détail */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </DashboardPageLayout>
  );
});
```

---

## 🎯 Priorités d'Implémentation

### Phase 1 - Infrastructure (Semaine 1)
1. ✅ Créer `DashboardDataTable.tsx`
2. ✅ Créer `CardList.tsx`
3. ✅ Créer `exportUtils.ts`
4. ✅ Créer 10 loaders API prioritaires

### Phase 2 - Composants Prioritaires (Semaine 2-3)
5. ✅ Compléter 10 composants prioritaires (Alerts, Actions, Validations)

### Phase 3 - Composants Secondaires (Semaine 4-6)
6. ✅ Compléter 30 composants (Budget, Delays, Stocks, etc.)

### Phase 4 - Composants Avancés (Semaine 7-10)
7. ✅ Compléter 69 composants restants (Risks, Decisions, Realtime, Admin, Bureaux)

---

## 📈 Estimation

- **Composants réutilisables**: 3-4 composants
- **Utilitaires**: 1 fichier
- **Loaders API**: 109 loaders
- **Composants à compléter**: 109 composants
- **Temps estimé**: 10-12 semaines

---

**Date**: 2026-01-27  
**Statut**: Plan d'action créé - Prêt pour implémentation
