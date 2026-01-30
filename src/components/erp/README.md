# Composants ERP BTP

Bibliothèque de composants réutilisables pour l’UX « ultra moderne » des vues Maître d’Ouvrage (filtres, tableaux, microinteractions).

## Composants

### FilterBar

Barre de filtres pour les vues listes (chantiers, demandes, alertes, arbitrages).

- **Périmètre** : programme, chantier, entreprise
- **Multi-états** : statut, priorité, gravité
- **Dates** : période, avancement, retard
- **Avancés** : écart budget, délais, risques
- **Vues sauvegardées** : sélecteur + sauvegarde de la vue courante

```tsx
import { FilterBar } from '@/components/erp';
import type { ErpFilters } from '@/components/erp';

<FilterBar
  filters={filters}
  onFilterChange={(key, value) => setFilters((p) => ({ ...p, [key]: value }))}
  options={{ programmes: [...], statuts: [...], priorites: [...], gravites: [...] }}
  hideSections={['dates', 'avances', 'savedViews']}
  savedViews={savedViews}
  onSaveView={(name) => saveCurrentView(name)}
  onLoadView={(view) => setFilters(view.filters)}
/>
```

### ErpDataTable

Tableau type ERP : en-têtes fixes au scroll, alignement gauche (libellés) / droite (chiffres), sélection multiple + barre d’actions, lignes expansibles, colonne Actions.

```tsx
import { ErpDataTable } from '@/components/erp';
import type { ErpColumnDef } from '@/components/erp';

const columns: ErpColumnDef<Row>[] = [
  { id: 'name', header: 'Chantier', accessorKey: 'name' },
  { id: 'budget', header: 'Budget', align: 'right', cell: (row) => formatCFA(row.budget) },
];
<ErpDataTable
  data={rows}
  columns={columns}
  selectable
  onSelectionChange={setSelectedIds}
  toolbarActions={<><ErpButton>Exporter</ErpButton><ErpButton variant="destructive">Supprimer</ErpButton></>}
  renderExpandedRow={(row) => <DetailPanel row={row} />}
  renderRowActions={(row) => <DropdownActions row={row} />}
/>
```

### ErpButton

Bouton avec microinteractions : `active:scale-[0.98]`, état `loading` (spinner), option `success`.

```tsx
import { ErpButton } from '@/components/erp';

<ErpButton variant="default" size="sm" loading={exporting} onClick={handleExport}>
  Exporter
</ErpButton>
```

## Intégration dans les vues

- **Portefeuille chantiers** : FilterBar (programme / statut / priorité / gravité) + ErpButton (Nouveau chantier, Exporter).
- **Alertes actives** : FilterBar (gravité) au-dessus du tableau.
- **Demandes / Arbitrages** : réutiliser FilterBar + ErpDataTable comme dans PortefeuilleChantiersPage.

## Toasts

Utiliser `useAlertToast` de `@/components/ui/toast` pour les retours d’actions (validation, export, erreur) :

```tsx
import { useAlertToast } from '@/components/ui/toast';

const toast = useAlertToast();
toast.exportSuccess('CSV');
toast.actionError('export');
```
