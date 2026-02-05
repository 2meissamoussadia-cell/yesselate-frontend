'use client';

/**
 * Validation BC — Vue Outlook-like (layout 3 colonnes)
 */

import { useState, useMemo } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { BmoModulePage } from '@/components/bmo/BmoModulePage';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { validationBcModuleConfig } from '@/lib/config/modules/validation-bc.config';
import { useValidationData } from '@/modules/validation-bc';
import type { ValidationFiltres } from '@/modules/validation-bc/types/validationTypes';
import { cn } from '@/lib/cn';

const FOLDER_TO_FILTRES: Record<string, ValidationFiltres> = {
  'a-valider': { statuts: ['EN_ATTENTE'] },
  'ma-validation': { statuts: ['EN_ATTENTE'] },
  'en-cours': { statuts: ['EN_ATTENTE'] },
  valides: { statuts: ['VALIDE'] },
  rejetes: { statuts: ['REJETE'] },
  tous: {},
  'montant-faible': { montantMax: 1_000_000 },
  'montant-moyen': { montantMin: 1_000_000, montantMax: 5_000_000 },
  'montant-eleve': { montantMin: 5_000_000 },
  'chantier-vdp2': { projets: ['vdp2'] },
  'chantier-imd': { projets: ['imd'] },
};

export default function ValidationBCOutlookPage() {
  const [selectedFolderId, setSelectedFolderId] = useState('a-valider');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('tous');

  const filtres = useMemo(
    () => FOLDER_TO_FILTRES[selectedFolderId] ?? {},
    [selectedFolderId]
  );
  const { data: items = [], isLoading } = useValidationData(filtres);
  const selectedItem = selectedId ? items.find((d) => d.id === selectedId) : null;

  const quickActions = (
    <QuickActionsBar
      primaryLabel="Nouveau BC"
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
      <h2 className="text-lg font-semibold">{selectedItem.titre}</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500">Numéro</span>
          <p className="font-medium">{selectedItem.numero}</p>
        </div>
        <div>
          <span className="text-slate-500">Type</span>
          <p className="font-medium">{selectedItem.type}</p>
        </div>
        <div>
          <span className="text-slate-500">Demandeur</span>
          <p className="font-medium">{selectedItem.demandeur}</p>
        </div>
        <div>
          <span className="text-slate-500">Montant</span>
          <p className="font-medium">
            {selectedItem.montant.toLocaleString()} {selectedItem.devise ?? 'FCFA'}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Statut</span>
          <p className="font-medium">{selectedItem.statut.replace('_', ' ')}</p>
        </div>
        <div>
          <span className="text-slate-500">Service</span>
          <p className="font-medium">{selectedItem.service}</p>
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
      Sélectionnez un BC
    </div>
  );

  return (
    <BmoModulePage
      module="validation-bc"
      config={validationBcModuleConfig}
      items={items}
      selectedId={selectedId}
      onSelectItem={setSelectedId}
      selectedFolderId={selectedFolderId}
      onSelectFolder={setSelectedFolderId}
      activeView={activeView}
      onViewChange={setActiveView}
      renderQuickActions={quickActions}
      renderDetail={renderDetail}
      emptyMessage="Aucun document"
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
            <span className="font-medium text-sm">{item.numero}</span>
            <span className="text-xs text-slate-500">
              {new Date(item.dateCreation).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            {item.demandeur} • {item.montant.toLocaleString()} {item.devise ?? 'FCFA'}
          </div>
        </div>
      )}
    />
  );
}
