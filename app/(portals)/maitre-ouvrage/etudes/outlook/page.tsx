'use client';

/**
 * Études — Vue Outlook-like (layout 3 colonnes)
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BmoModulePage } from '@/components/bmo/BmoModulePage';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { etudesModuleConfig } from '@/lib/config/modules/etudes.config';
import { cn } from '@/lib/cn';

interface EtudeItem {
  id: string;
  titre: string;
  type: string;
  statut: string;
  chantier: string;
  dateCreation: string;
}

const MOCK_ETUDES: EtudeItem[] = [
  { id: '1', titre: 'Étude de faisabilité VDP2', type: 'Faisabilité', statut: 'En cours', chantier: 'Villa Dakar Phase 2', dateCreation: '2024-01-15' },
  { id: '2', titre: 'APS Immeuble Diamniadio', type: 'APS/APD', statut: 'À valider', chantier: 'Immeuble Diamniadio', dateCreation: '2024-01-12' },
  { id: '3', titre: 'PRO Structure lot 4', type: 'PRO/EXE', statut: 'Validée', chantier: 'Complexe Alpha', dateCreation: '2024-01-08' },
];

export default function EtudesOutlookPage() {
  const [selectedFolderId, setSelectedFolderId] = useState('toutes');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('toutes');

  const items = MOCK_ETUDES;
  const selectedItem = selectedId ? items.find((d) => d.id === selectedId) : null;

  const quickActions = (
    <QuickActionsBar
      primaryLabel="Nouvelle étude"
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
          <span className="text-slate-500">Type</span>
          <p className="font-medium">{selectedItem.type}</p>
        </div>
        <div>
          <span className="text-slate-500">Statut</span>
          <p className="font-medium">{selectedItem.statut}</p>
        </div>
        <div>
          <span className="text-slate-500">Chantier</span>
          <p className="font-medium">{selectedItem.chantier}</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-slate-500">
      Sélectionnez une étude
    </div>
  );

  return (
    <BmoModulePage<EtudeItem>
      module="etudes"
      config={etudesModuleConfig}
      items={items}
      selectedId={selectedId}
      onSelectItem={setSelectedId}
      selectedFolderId={selectedFolderId}
      onSelectFolder={setSelectedFolderId}
      activeView={activeView}
      onViewChange={setActiveView}
      renderQuickActions={quickActions}
      renderDetail={renderDetail}
      emptyMessage="Aucune étude"
      renderListItem={(item, { isSelected }) => (
        <div
          className={cn(
            'flex flex-col gap-1 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40 cursor-pointer',
            isSelected && 'bg-sky-50 dark:bg-sky-900/20'
          )}
        >
          <div className="font-medium text-sm">{item.titre}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {item.type} • {item.statut}
          </div>
        </div>
      )}
    />
  );
}
