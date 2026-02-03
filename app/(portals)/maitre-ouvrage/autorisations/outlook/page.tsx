'use client';

/**
 * Autorisations — Vue Outlook-like (layout 3 colonnes)
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BmoModulePage } from '@/components/bmo/BmoModulePage';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { autorisationsModuleConfig } from '@/lib/config/modules/autorisations.config';
import { cn } from '@/lib/utils';

interface AutorisationsItem {
  id: string;
  titre: string;
  statut: string;
  dateCreation: string;
}

const MOCK_ITEMS: AutorisationsItem[] = [
  { id: '1', titre: 'Exemple', statut: 'Actif', dateCreation: new Date().toISOString() },
];

export default function AutorisationsOutlookPage() {
  const [selectedFolderId, setSelectedFolderId] = useState('tous');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('tous');

  const items = MOCK_ITEMS;
  const selectedItem = selectedId ? items.find((d) => d.id === selectedId) : null;

  const quickActions = (
    <QuickActionsBar
      primaryLabel="Nouvelle autorisation"
      primaryIcon={<Plus className="h-5 w-5" />}
      onPrimaryClick={() => {}}
      selectedCount={selectedId ? 1 : 0}
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
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-slate-500">
      Sélectionnez un élément
    </div>
  );

  return (
    <BmoModulePage
      module="autorisations"
      config={autorisationsModuleConfig}
      items={items}
      selectedId={selectedId}
      onSelectItem={setSelectedId}
      selectedFolderId={selectedFolderId}
      onSelectFolder={setSelectedFolderId}
      activeView={activeView}
      onViewChange={setActiveView}
      renderQuickActions={quickActions}
      renderDetail={renderDetail}
      emptyMessage="Aucune autorisation"
      renderListItem={(item, { isSelected }) => (
        <div
          className={cn(
            'flex flex-col gap-1 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40 cursor-pointer',
            isSelected && 'bg-sky-50 dark:bg-sky-900/20'
          )}
        >
          <div className="font-medium text-sm">{item.titre}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">{item.statut}</div>
        </div>
      )}
    />
  );
}
