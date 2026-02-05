'use client';

/**
 * Qualité — Vue Outlook-like (contrôles, non-conformités)
 */

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { BmoModulePage } from '@/components/bmo/BmoModulePage';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { qualiteModuleConfig } from '@/lib/config/modules/qualite.config';
import { cn } from '@/lib/cn';

interface ControleItem {
  id: string;
  reference: string;
  type: string;
  statut: string;
  chantier: string;
  datePrevue: string;
}

const MOCK_CONTROLES: ControleItem[] = [
  { id: '1', reference: 'CT-2024-001', type: 'Réception matériaux', statut: 'Planifié', chantier: 'Villa Dakar Phase 2', datePrevue: '2024-02-10' },
  { id: '2', reference: 'CT-2024-002', type: 'Contrôle exécution', statut: 'En cours', chantier: 'Immeuble Diamniadio', datePrevue: '2024-02-08' },
  { id: '3', reference: 'CT-2024-003', type: 'Essai béton', statut: 'Réalisé', chantier: 'Villa Dakar Phase 2', datePrevue: '2024-02-05' },
];

export default function QualiteOutlookPage() {
  const [selectedFolderId, setSelectedFolderId] = useState('tous');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('tous');

  const items = MOCK_CONTROLES;
  const selectedItem = selectedId ? items.find((d) => d.id === selectedId) : null;

  const quickActions = (
    <QuickActionsBar
      primaryLabel="Nouveau contrôle"
      primaryIcon={<Plus className="h-5 w-5" />}
      onPrimaryClick={() => {}}
      selectedCount={selectedId ? 1 : 0}
    />
  );

  const renderDetail = selectedItem ? (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">{selectedItem.reference}</h2>
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
        <div>
          <span className="text-slate-500">Date prévue</span>
          <p className="font-medium">{selectedItem.datePrevue}</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-slate-500">
      Sélectionnez un contrôle
    </div>
  );

  return (
    <BmoModulePage<ControleItem>
      module="qualite"
      config={qualiteModuleConfig}
      items={items}
      selectedId={selectedId}
      onSelectItem={setSelectedId}
      selectedFolderId={selectedFolderId}
      onSelectFolder={setSelectedFolderId}
      activeView={activeView}
      onViewChange={setActiveView}
      renderQuickActions={quickActions}
      renderDetail={renderDetail}
      emptyMessage="Aucun contrôle"
      renderListItem={(item, { isSelected }) => (
        <div
          className={cn(
            'flex flex-col gap-1 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40 cursor-pointer',
            isSelected && 'bg-sky-50 dark:bg-sky-900/20'
          )}
        >
          <div className="font-medium text-sm">{item.reference}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {item.type} • {item.statut}
          </div>
        </div>
      )}
    />
  );
}
