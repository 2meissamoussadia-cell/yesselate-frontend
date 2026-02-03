# Modules BMO — Architecture Outlook-like

## Modules migrés

| Module | Route principale | Route Outlook |
|--------|------------------|---------------|
| Centre d'alertes | `/maitre-ouvrage/alerts` | `/maitre-ouvrage/alerts` |
| Demandes | `/maitre-ouvrage/demandes` | `/maitre-ouvrage/demandes/outlook` |
| Validation BC | `/maitre-ouvrage/validation-bc` | `/maitre-ouvrage/validation-bc/outlook` |
| Gouvernance | `/maitre-ouvrage/governance` | `/maitre-ouvrage/governance/outlook` |
| Chantiers | `/maitre-ouvrage/chantiers` | `/maitre-ouvrage/chantiers/outlook` |

## Utilisation du template BmoModulePage

```tsx
import { BmoModulePage } from '@/components/bmo/BmoModulePage';
import { demandesModuleConfig } from '@/lib/config/modules/demandes.config';

export default function MonModulePage() {
  const [selectedFolderId, setSelectedFolderId] = useState('en-cours');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('toutes');
  const items = [...]; // depuis API ou mock

  return (
    <BmoModulePage
      module="mon-module"
      config={monModuleConfig}
      items={items}
      selectedId={selectedId}
      onSelectItem={setSelectedId}
      selectedFolderId={selectedFolderId}
      onSelectFolder={setSelectedFolderId}
      activeView={activeView}
      onViewChange={setActiveView}
      renderListItem={(item, { isSelected }) => <MaListRow item={item} selected={isSelected} />}
      renderDetail={<MonDetailPanel item={selectedItem} />}
      renderQuickActions={<QuickActionsBar ... />}
    />
  );
}
```

## Structure des composants par module

Chaque module peut avoir :

- `[module]/[Module]ListRow.tsx` — Ligne de liste
- `[module]/[Module]DetailPanel.tsx` — Panneau détail
- `[module]/Create[Entity]Dialog.tsx` — Dialogue création (si pertinent)
- `lib/config/modules/[module].config.ts` — Config ModuleConfig

## Configuration

Voir `src/lib/types/module.types.ts` pour `ModuleConfig`, `SubSidebarSection`, `QuickActionsConfig`, `FilterBarConfig`.
