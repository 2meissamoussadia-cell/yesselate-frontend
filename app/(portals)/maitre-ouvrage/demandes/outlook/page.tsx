'use client';

/**
 * Demandes — Vue Outlook-like (layout 3 colonnes)
 */

import { useState, useMemo } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { BmoModulePage } from '@/components/bmo/BmoModulePage';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { demandesModuleConfig } from '@/lib/config/modules/demandes.config';
import { useDemandesData, useDemandesByStatus } from '@/modules/demandes';
import { cn } from '@/lib/utils';

const FOLDER_TO_STATUS: Record<string, string> = {
  'en-cours': 'pending',
  validees: 'validated',
  rejetees: 'rejected',
  'a-surveiller': 'overdue',
};

export default function DemandesOutlookPage() {
  const [selectedFolderId, setSelectedFolderId] = useState('en-cours');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('toutes');

  const statusFromFolder = FOLDER_TO_STATUS[selectedFolderId];
  const { data: demandesByStatus, isLoading: loadingByStatus } = useDemandesByStatus(statusFromFolder ?? '');
  const { data: demandesAll, isLoading: loadingAll } = useDemandesData();

  const demandes = useMemo(() => {
    if (statusFromFolder && demandesByStatus) return demandesByStatus;
    return demandesAll ?? [];
  }, [statusFromFolder, demandesByStatus, demandesAll]);

  const isLoading = statusFromFolder ? loadingByStatus : loadingAll;
  const selectedItem = selectedId ? demandes.find((d) => d.id === selectedId) ?? null;

  const quickActions = (
    <QuickActionsBar
      primaryLabel="Nouvelle demande"
      primaryIcon={<Plus className="h-5 w-5" />}
      onPrimaryClick={() => {}}
      selectedCount={selectedId ? 1 : 0}
      actions={[
        { id: 'valider', icon: <Check className="h-5 w-5" />, label: 'Valider', variant: 'ghost', disabled: !selectedId, onClick: () => {} },
        { id: 'rejeter', icon: <X className="h-5 w-5" />, label: 'Rejeter', variant: 'ghost', disabled: !selectedId, onClick: () => {} },
      ]}
    />
  );

  const renderDetail = selectedItem ? (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">{selectedItem.title}</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500">Référence</span>
          <p className="font-medium">{selectedItem.reference}</p>
        </div>
        <div>
          <span className="text-slate-500">Service</span>
          <p className="font-medium capitalize">{selectedItem.service}</p>
        </div>
        <div>
          <span className="text-slate-500">Statut</span>
          <p className="font-medium capitalize">{selectedItem.status}</p>
        </div>
        {selectedItem.montant != null && (
          <div>
            <span className="text-slate-500">Montant</span>
            <p className="font-medium">{selectedItem.montant.toLocaleString()} FCFA</p>
          </div>
        )}
        <div>
          <span className="text-slate-500">Créée le</span>
          <p className="font-medium">
            {selectedItem.createdAt instanceof Date
              ? selectedItem.createdAt.toLocaleDateString('fr-FR')
              : new Date(selectedItem.createdAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
      {selectedItem.description && (
        <div>
          <span className="text-slate-500 block mb-1">Description</span>
          <p className="text-sm text-slate-700 dark:text-slate-300">{selectedItem.description}</p>
        </div>
      )}
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-slate-500">
      Sélectionnez une demande
    </div>
  );

  return (
    <BmoModulePage
      module="demandes"
      config={demandesModuleConfig}
      items={demandes}
      selectedId={selectedId}
      onSelectItem={setSelectedId}
      selectedFolderId={selectedFolderId}
      onSelectFolder={setSelectedFolderId}
      activeView={activeView}
      onViewChange={setActiveView}
      renderQuickActions={quickActions}
      renderDetail={renderDetail}
      emptyMessage="Aucune demande"
      isLoading={isLoading}
      renderListItem={(item, { isSelected }) => (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setSelectedId(item.id)}
          onKeyDown={(e) => e.key === 'Enter' && setSelectedId(item.id)}
          className={cn(
            'flex flex-col gap-1 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40 cursor-pointer',
            isSelected && 'bg-sky-50 dark:bg-sky-900/20'
          )}
        >
          <div className="flex justify-between">
            <span className="font-medium text-sm">{item.title}</span>
            <span className="text-xs text-slate-500">
              {item.createdAt instanceof Date
                ? item.createdAt.toLocaleDateString('fr-FR')
                : new Date(item.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {item.reference} • {item.service}
          </div>
        </div>
      )}
    />
  );
}
