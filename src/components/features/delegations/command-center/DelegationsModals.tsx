/**
 * Modales du Délégations Command Center
 * Toutes les modales : stats, export, create, edit, extend, suspend, revoke, timeline, batch-actions, shortcuts, help, confirm
 */

'use client';

import React from 'react';
import { useDelegationsCommandCenterStore } from '@/lib/stores/delegationsCommandCenterStore';
import { DelegationStatsModal } from '../workspace/DelegationStatsModal';
import { DelegationExportModal } from '../workspace/DelegationExportModal';
import { DelegationTimeline } from '../workspace/DelegationTimeline';
import { DelegationBatchActions } from '../workspace/DelegationBatchActions';
import { DelegationDetailModal } from './modals/DelegationDetailModal';
import { DelegationsFiltersPanel } from './DelegationsFiltersPanel';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/cn';

export function DelegationsModals() {
  const { modal, closeModal } = useDelegationsCommandCenterStore();

  if (!modal.isOpen || !modal.type) return null;

  // Stats Modal
  if (modal.type === 'stats') {
    return <DelegationStatsModal open={true} onClose={closeModal} />;
  }

  // Export Modal
  if (modal.type === 'export') {
    return (
      <DelegationExportModal
        open={true}
        onClose={closeModal}
        format={modal.data?.format || 'csv'}
        queue={modal.data?.queue || 'active'}
      />
    );
  }

  // Detail Modal (pattern overlay)
  if (modal.type === 'delegation-detail') {
    return (
      <DelegationDetailModal
        open={true}
        delegationId={modal.data?.delegationId}
        onClose={closeModal}
      />
    );
  }

  // Timeline Modal
  if (modal.type === 'timeline') {
    return (
      <DelegationTimeline
        open={true}
        delegationId={modal.data?.delegationId}
        onClose={closeModal}
      />
    );
  }

  // Filters Panel
  if (modal.type === 'filters') {
    return <DelegationsFiltersPanel />;
  }

  // Batch Actions Modal
  if (modal.type === 'batch-actions') {
    return (
      <DelegationBatchActions
        open={true}
        action={modal.data?.action || 'extend'}
        delegations={modal.data?.delegations || []}
        onClose={closeModal}
        onComplete={modal.data?.onComplete}
      />
    );
  }

  // Shortcuts Modal
  if (modal.type === 'shortcuts') {
    return <ShortcutsModal onClose={closeModal} />;
  }

  // Help Modal
  if (modal.type === 'help') {
    return <HelpModal onClose={closeModal} />;
  }

  // Confirm Modal
  if (modal.type === 'confirm') {
    return <ConfirmModal onClose={closeModal} data={modal.data} />;
  }

  return null;
}

// ================================
// Shortcuts Modal
// ================================
function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', label: 'Palette de commandes' },
    { key: '⌘B', label: 'Afficher/Masquer sidebar' },
    { key: '⌘F', label: 'Filtres avancés' },
    { key: '⌘E', label: 'Exporter' },
    { key: '⌘I', label: 'Statistiques' },
    { key: 'F11', label: 'Plein écran' },
    { key: 'Alt+←', label: 'Retour' },
    { key: 'Esc', label: 'Fermer les modales' },
    { key: '?', label: 'Cette aide' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <h2 className="text-lg font-semibold text-slate-200">Raccourcis clavier</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50"
              >
                <span className="text-sm text-slate-300">{shortcut.label}</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-slate-700/50 text-slate-300 rounded border border-slate-600/50">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================
// Help Modal
// ================================
function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <FluentModal
      open={true}
      title="Aide - Délégations"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Navigation</h3>
          <p className="text-sm text-slate-400">
            Utilisez la sidebar pour naviguer entre les différentes catégories de délégations.
            Les badges indiquent le nombre d'éléments dans chaque catégorie.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-2">KPIs</h3>
          <p className="text-sm text-slate-400">
            La barre de KPIs affiche les indicateurs clés en temps réel. Cliquez sur un KPI pour voir plus de détails.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Actions</h3>
          <p className="text-sm text-slate-400">
            Utilisez le menu d'actions (⋮) pour accéder aux fonctionnalités avancées comme l'export, les filtres, etc.
          </p>
        </div>
      </div>
    </FluentModal>
  );
}

// ================================
// Confirm Modal
// ================================
function ConfirmModal({
  onClose,
  data,
}: {
  onClose: () => void;
  data: Record<string, unknown>;
}) {
  const handleConfirm = () => {
    if (data.onConfirm) {
      (data.onConfirm as () => void)();
    }
    onClose();
  };

  return (
    <FluentModal
      open={true}
      title={data.title as string || 'Confirmation'}
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-300">{data.message as string || 'Êtes-vous sûr de vouloir continuer ?'}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className={cn(
              'px-4 py-2 text-sm rounded-lg text-white',
              data.variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-purple-600 hover:bg-purple-700'
            )}
          >
            {data.confirmLabel as string || 'Confirmer'}
          </button>
        </div>
      </div>
    </FluentModal>
  );
}

