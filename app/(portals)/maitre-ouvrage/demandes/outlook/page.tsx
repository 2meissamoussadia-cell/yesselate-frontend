'use client';

/**
 * Demandes — Vue Outlook-like (layout 3 colonnes)
 */

import { useState, useMemo } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { BmoModulePage } from '@/components/bmo/BmoModulePage';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { demandesModuleConfig } from '@/lib/config/modules/demandes.config';
import { useDemandesData, useDemandesByStatus, useDemandesByService } from '@/modules/demandes';
import { DemandeListRow, DemandeDetailPanel, CreateDemandeDialog } from '@/components/bmo/demandes';

/** Dossiers état -> statut API */
const FOLDER_TO_STATUS: Record<string, string> = {
  toutes: '',
  'en-attente': 'pending',
  approuvees: 'validated',
  rejetees: 'rejected',
  brouillons: 'draft',
};

/** Dossiers type -> service API */
const FOLDER_TO_SERVICE: Record<string, string> = {
  'type-travaux': 'autre',
  'type-budget': 'finance',
  'type-fourniture': 'achats',
  'type-personnel': 'rh',
  'type-modification': 'autre',
};

export default function DemandesOutlookPage() {
  const [selectedFolderId, setSelectedFolderId] = useState('toutes');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('toutes');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const statusFromFolder = FOLDER_TO_STATUS[selectedFolderId];
  const serviceFromFolder = FOLDER_TO_SERVICE[selectedFolderId];

  const { data: demandesByStatus, isLoading: loadingByStatus } = useDemandesByStatus(statusFromFolder ?? '');
  const { data: demandesByService, isLoading: loadingByService } = useDemandesByService(serviceFromFolder ?? '');
  const { data: demandesAll, isLoading: loadingAll } = useDemandesData();

  const { demandes, isLoading } = useMemo(() => {
    if (statusFromFolder && demandesByStatus) {
      return { demandes: demandesByStatus, isLoading: loadingByStatus };
    }
    if (serviceFromFolder && demandesByService) {
      return { demandes: demandesByService, isLoading: loadingByService };
    }
    return { demandes: demandesAll ?? [], isLoading: loadingAll };
  }, [statusFromFolder, demandesByStatus, loadingByStatus, serviceFromFolder, demandesByService, loadingByService, demandesAll, loadingAll]);
  const found = selectedId ? demandes.find((d) => d.id === selectedId) : undefined;
  const selectedItem = found ?? null;

  const quickActions = (
    <QuickActionsBar
      primaryLabel="Nouvelle demande"
      primaryIcon={<Plus className="h-5 w-5" />}
      onPrimaryClick={() => setCreateDialogOpen(true)}
      selectedCount={selectedId ? 1 : 0}
      actions={[
        { id: 'valider', icon: <Check className="h-5 w-5" />, label: 'Valider', variant: 'ghost', disabled: !selectedId, onClick: () => {} },
        { id: 'rejeter', icon: <X className="h-5 w-5" />, label: 'Rejeter', variant: 'ghost', disabled: !selectedId, onClick: () => {} },
      ]}
    />
  );

  const renderDetail = selectedItem ? (
    <DemandeDetailPanel demande={selectedItem} />
  ) : (
    <div className="flex items-center justify-center h-full text-slate-500">
      Sélectionnez une demande
    </div>
  );

  return (
    <>
    <CreateDemandeDialog
      open={createDialogOpen}
      onOpenChange={setCreateDialogOpen}
    />
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
        <DemandeListRow
          demande={item}
          selected={isSelected}
          onClick={() => setSelectedId(item.id)}
        />
      )}
    />
    </>
  );
}
