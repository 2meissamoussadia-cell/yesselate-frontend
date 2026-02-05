/**
 * Modales du Recouvrements Command Center
 * Toutes les modales : stats, export, shortcuts, help, confirm
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  BarChart3,
  Download,
  Keyboard,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { RecouvrementsStatsModal } from '../RecouvrementsStatsModal';
import { RecouvrementsFiltersPanel } from './RecouvrementsFiltersPanel';
import { recouvrementsApiService, type RecouvrementsStats } from '@/lib/services/recouvrementsApiService';
import { useState, useEffect } from 'react';

export type RecouvrementsModalType = 
  | 'stats' 
  | 'export' 
  | 'shortcuts' 
  | 'help' 
  | 'confirm'
  | 'filters'
  | null;

interface RecouvrementsModalState {
  isOpen: boolean;
  type: RecouvrementsModalType;
  data?: Record<string, unknown>;
}

interface RecouvrementsModalsProps {
  modal: RecouvrementsModalState;
  onClose: () => void;
  onApplyFilters?: (filters: Record<string, string[]>) => void;
}

export function RecouvrementsModals({ modal, onClose, onApplyFilters }: RecouvrementsModalsProps) {
  if (!modal.isOpen || !modal.type) return null;

  // Stats Modal
  if (modal.type === 'stats') {
    return <RecouvrementsStatsModal open={true} onClose={onClose} />;
  }

  // Filters Panel
  if (modal.type === 'filters') {
    return (
      <RecouvrementsFiltersPanel
        isOpen={true}
        onClose={onClose}
        onApplyFilters={onApplyFilters || (() => {})}
      />
    );
  }

  // Export Modal
  if (modal.type === 'export') {
    return <ExportModal onClose={onClose} />;
  }

  // Shortcuts Modal
  if (modal.type === 'shortcuts') {
    return <ShortcutsModal onClose={onClose} />;
  }

  // Help Modal
  if (modal.type === 'help') {
    return <HelpModal onClose={onClose} />;
  }

  // Confirm Modal
  if (modal.type === 'confirm') {
    return <ConfirmModal onClose={onClose} data={modal.data} />;
  }

  return null;
}

// ================================
// Export Modal
// ================================
function ExportModal({ onClose }: { onClose: () => void }) {
  const [format, setFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    // Simuler l'export
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setExporting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Download className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Exporter les données</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Format d'export
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['excel', 'csv', 'pdf'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={cn(
                    'p-3 rounded-lg border transition-all',
                    format === fmt
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600/50'
                  )}
                >
                  <span className="text-sm font-medium uppercase">{fmt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-700 text-slate-400 hover:text-slate-200"
            >
              Annuler
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {exporting ? 'Export en cours...' : 'Exporter'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================
// Shortcuts Modal
// ================================
function ShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', label: 'Palette de commandes' },
    { key: '⌘B', label: 'Afficher/Masquer sidebar' },
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
        className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <Keyboard className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Raccourcis clavier</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
              >
                <span className="text-sm text-slate-400">{shortcut.label}</span>
                <kbd className="px-2.5 py-1 rounded bg-slate-700 text-xs font-mono text-slate-300 border border-slate-600">
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10">
              <HelpCircle className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-200">Aide - Recouvrements</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Navigation</h3>
            <p className="text-sm text-slate-400">
              Utilisez la sidebar pour naviguer entre les différentes catégories de créances. 
              Les sous-onglets permettent de filtrer davantage selon vos besoins.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">KPIs</h3>
            <p className="text-sm text-slate-400">
              La barre de KPIs affiche les indicateurs en temps réel. Cliquez sur un KPI pour 
              voir plus de détails.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Actions</h3>
            <p className="text-sm text-slate-400">
              Utilisez le menu d'actions (⋮) pour exporter, afficher les statistiques ou 
              configurer les options de la page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================================
// Confirm Modal
// ================================
function ConfirmModal({ 
  onClose, 
  data 
}: { 
  onClose: () => void;
  data?: Record<string, unknown>;
}) {
  const title = (data?.title as string) || 'Confirmer l\'action';
  const message = (data?.message as string) || 'Êtes-vous sûr de vouloir continuer ?';
  const confirmLabel = (data?.confirmLabel as string) || 'Confirmer';
  const cancelLabel = (data?.cancelLabel as string) || 'Annuler';
  const variant = (data?.variant as 'default' | 'danger' | 'warning') || 'default';

  const handleConfirm = () => {
    if (data?.onConfirm && typeof data.onConfirm === 'function') {
      (data.onConfirm as () => void)();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2 rounded-xl',
              variant === 'danger' ? 'bg-red-500/10' : variant === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
            )}>
              {variant === 'danger' ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : variant === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <h2 className="text-lg font-bold text-slate-200">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-400">{message}</p>
          <div className="flex items-center gap-4 pt-4 border-t border-slate-700/50">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-700 text-slate-400 hover:text-slate-200"
            >
              {cancelLabel}
            </Button>
            <Button
              onClick={handleConfirm}
              className={cn(
                'flex-1 text-white',
                variant === 'danger' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : variant === 'warning'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              )}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

