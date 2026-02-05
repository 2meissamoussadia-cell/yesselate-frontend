'use client';

/**
 * Gouvernance — Vue Outlook-like (layout 3 colonnes)
 */

import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { BmoModulePage } from '@/components/bmo/BmoModulePage';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { governanceModuleConfig } from '@/lib/config/modules/governance.config';
import { cn } from '@/lib/cn';

interface ArbitrageItem {
  id: string;
  titre: string;
  statut: string;
  type: string;
  dateCreation: string;
}

const MOCK_ITEMS: ArbitrageItem[] = [
  { id: '1', titre: 'Arbitrage budget lot 4', statut: 'En attente', type: 'budget', dateCreation: '2024-01-15' },
  { id: '2', titre: 'Décision jalon J5', statut: 'Validé', type: 'jalon', dateCreation: '2024-01-14' },
  { id: '3', titre: 'Point attention retard', statut: 'En cours', type: 'attention', dateCreation: '2024-01-13' },
];

export default function GovernanceOutlookPage() {
  const [selectedFolderId, setSelectedFolderId] = useState('arbitrages');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('toutes');

  const items = MOCK_ITEMS;
  const selectedItem = selectedId ? items.find((d) => d.id === selectedId) : null;

  const quickActions = (
    <QuickActionsBar
      primaryLabel="Nouvel arbitrage"
      primaryIcon={<Plus className="h-5 w-5" />}
      onPrimaryClick={() => {}}
      selectedCount={selectedId ? 1 : 0}
      actions={[
        { id: 'valider', icon: <Check className="h-5 w-5" />, label: 'Valider', variant: 'ghost', disabled: !selectedId, onClick: () => {} },
      ]}
    />
  );

  const renderDetail = selectedItem ? (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">{selectedItem.titre}</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500">Statut</span>
          <p className="font-medium">{selectedItem.statut}</p>
        </div>
        <div>
          <span className="text-slate-500">Type</span>
          <p className="font-medium">{selectedItem.type}</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-slate-500">
      Sélectionnez un élément
    </div>
  );

  return (
    <BmoModulePage<ArbitrageItem>
      module="governance"
      config={governanceModuleConfig}
      items={items}
      selectedId={selectedId}
      onSelectItem={setSelectedId}
      selectedFolderId={selectedFolderId}
      onSelectFolder={setSelectedFolderId}
      activeView={activeView}
      onViewChange={setActiveView}
      renderQuickActions={quickActions}
      renderDetail={renderDetail}
      emptyMessage="Aucun élément"
      renderListItem={(item, { isSelected }) => (
        <div
          className={cn(
            'flex flex-col gap-1 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40',
            isSelected && 'bg-sky-50 dark:bg-sky-900/20'
          )}
        >
          <div className="flex justify-between">
            <span className="font-medium text-sm">{item.titre}</span>
            <span className="text-xs text-slate-500">
              {new Date(item.dateCreation).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {item.type} • {item.statut}
          </div>
        </div>
      )}
    />
  );
}
