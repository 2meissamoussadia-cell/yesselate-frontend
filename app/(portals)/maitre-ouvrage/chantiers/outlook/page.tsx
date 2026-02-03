'use client';

/**
 * Chantiers — Vue Outlook-like (layout 3 colonnes)
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BmoModulePage } from '@/components/bmo/BmoModulePage';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { chantiersModuleConfig } from '@/lib/config/modules/chantiers.config';
import { cn } from '@/lib/utils';

interface ChantierItem {
  id: string;
  nom: string;
  code: string;
  progression: number;
  statut: string;
}

const MOCK_CHANTIERS: ChantierItem[] = [
  { id: 'vdp2', nom: 'Villa Dakar Phase 2', code: 'VDP2-2024', progression: 67, statut: 'En cours' },
  { id: 'imd', nom: 'Immeuble Diamniadio', code: 'IMD-2024', progression: 45, statut: 'En cours' },
  { id: 'alpha', nom: 'Complexe Alpha', code: 'ALPHA-2024', progression: 89, statut: 'Livré' },
];

export default function ChantiersOutlookPage() {
  const [selectedFolderId, setSelectedFolderId] = useState('liste');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('toutes');

  const items = MOCK_CHANTIERS;
  const selectedItem = selectedId ? items.find((d) => d.id === selectedId) : null;

  const quickActions = (
    <QuickActionsBar
      primaryLabel="Nouveau chantier"
      primaryIcon={<Plus className="h-5 w-5" />}
      onPrimaryClick={() => {}}
      selectedCount={0}
    />
  );

  const renderDetail = selectedItem ? (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">{selectedItem.nom}</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500">Code</span>
          <p className="font-medium">{selectedItem.code}</p>
        </div>
        <div>
          <span className="text-slate-500">Progression</span>
          <p className="font-medium">{selectedItem.progression}%</p>
        </div>
        <div>
          <span className="text-slate-500">Statut</span>
          <p className="font-medium">{selectedItem.statut}</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-slate-500">
      Sélectionnez un chantier
    </div>
  );

  return (
    <BmoModulePage<ChantierItem>
      module="chantiers"
      config={chantiersModuleConfig}
      items={items}
      selectedId={selectedId}
      onSelectItem={setSelectedId}
      selectedFolderId={selectedFolderId}
      onSelectFolder={setSelectedFolderId}
      activeView={activeView}
      onViewChange={setActiveView}
      renderQuickActions={quickActions}
      renderDetail={renderDetail}
      emptyMessage="Aucun chantier"
      renderListItem={(item, { isSelected }) => (
        <div
          className={cn(
            'flex flex-col gap-1 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40',
            isSelected && 'bg-sky-50 dark:bg-sky-900/20'
          )}
        >
          <div className="font-medium text-sm">{item.nom}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {item.code} • {item.progression}%
          </div>
        </div>
      )}
    />
  );
}
