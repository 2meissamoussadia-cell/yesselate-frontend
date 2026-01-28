/**
 * Modales du Blocked Command Center
 * Toutes les modales : stats, decision-center, export, filters, settings, shortcuts, dossier-detail, confirm
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useBlockedCommandCenterStore } from '@/lib/stores/blockedCommandCenterStore';
import { blockedApi } from '@/lib/services/blockedApiService';
import { BlockedStatsModal } from '../BlockedStatsModal';
import { BlockedDecisionCenter } from '../BlockedDecisionCenter';
import { AlertDetailModal } from '../AlertDetailModal';
import { KPIDetailModal as KPIDetailModalEnriched } from '../KPIDetailModal';
import { BlockedResolutionWizard } from '../views/BlockedResolutionWizard';
import { BlockedDossierDetailsModal } from '../modals/BlockedDossierDetailsModal';
import { BlockedResolutionModal } from '../modals/BlockedResolutionModal';
import {
  X,
  Download,
  Keyboard,
  Filter,
  Settings,
  FileText,
  AlertCircle,
  Clock,
  Building2,
  Loader2,
  Check,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Eye,
  Trash2,
  Star,
} from 'lucide-react';
import type { BlockedDossier } from '@/lib/types/bmo.types';

export function BlockedModals() {
  const { modal, closeModal } = useBlockedCommandCenterStore();

  if (!modal.isOpen || !modal.type) return null;

  // Stats Modal
  if (modal.type === 'stats') {
    return <BlockedStatsModal open={true} onClose={closeModal} />;
  }

  // Decision Center
  if (modal.type === 'decision-center') {
    return <BlockedDecisionCenter open={true} onClose={closeModal} />;
  }

  // Export Modal
  if (modal.type === 'export') {
    return <ExportModal onClose={closeModal} />;
  }

  // Shortcuts Modal
  if (modal.type === 'shortcuts') {
    return <ShortcutsModal onClose={closeModal} />;
  }

  // Settings Modal
  if (modal.type === 'settings') {
    return <SettingsModal onClose={closeModal} />;
  }

  // Dossier Detail Modal (Enriched - 7 tabs ultra-detailed)
  if (modal.type === 'dossier-detail' || modal.type === 'dossier-detail-enriched') {
    return (
      <BlockedDossierDetailsModal
        open={true}
        onClose={closeModal}
        dossierId={((modal.data?.dossierId ?? (modal.data?.dossier as { id?: string } | undefined)?.id) ?? '') as string}
      />
    );
  }

  // Resolution Modal Advanced (NEW - 4 types with wizard)
  if (modal.type === 'resolution-advanced') {
    return (
      <BlockedResolutionModal
        open={true}
        onClose={closeModal}
        dossier={modal.data?.dossier as any}
        preselectedType={modal.data?.preselectedType as any}
      />
    );
  }

  // Confirm Modal
  if (modal.type === 'confirm') {
    return <ConfirmModal onClose={closeModal} data={modal.data} />;
  }

  // KPI Drilldown Modal
  if (modal.type === 'kpi-drilldown') {
    return (
      <KPIDetailModalEnriched
        open={true}
        onClose={closeModal}
        kpiId={modal.data.kpiId as string || 'total'}
        kpiData={modal.data.kpiData as any}
      />
    );
  }

  // Alert Detail Modal (SLA)
  if (modal.type === 'alert-detail') {
    return <AlertDetailModal open={true} onClose={closeModal} alertData={modal.data as any} />;
  }

  // Resolution Wizard Modal
  if (modal.type === 'resolution-wizard') {
    return (
      <ResolutionWizardModal 
        onClose={closeModal} 
        data={modal.data} 
      />
    );
  }

  return null;
}

// ================================
// Resolution Wizard Modal Wrapper
// ================================
function ResolutionWizardModal({ onClose, data }: { onClose: () => void; data: Record<string, unknown> }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <BlockedResolutionWizard 
          tabId="modal-wizard" 
          data={data} 
        />
      </div>
    </div>
  );
}

// ================================
// Export Modal - Connected to API
// ================================
function ExportModal({ onClose }: { onClose: () => void }) {
  const { filters } = useBlockedCommandCenterStore();
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'xlsx' | 'pdf' | null>(null);

  const exportFormats = [
    { format: 'json' as const, desc: 'Données brutes structurées', icon: '📄' },
    { format: 'xlsx' as const, desc: 'Fichier tableur Excel', icon: '📊' },
    { format: 'pdf' as const, desc: 'Rapport avec graphiques', icon: '📑' },
    { format: 'csv' as const, desc: 'Données tabulées', icon: '📋' },
  ];

  const handleExport = async (format: 'json' | 'csv' | 'xlsx' | 'pdf') => {
    setExporting(true);
    setSelectedFormat(format);
    
    try {
      // Convert filters to API format
      const apiFilter = {
        impact: filters.impact.length === 1 ? filters.impact[0] : undefined,
        bureau: filters.bureaux.length === 1 ? filters.bureaux[0] : undefined,
        status: filters.status.length === 1 ? filters.status[0] : undefined,
        type: filters.types.length === 1 ? filters.types[0] : undefined,
        search: filters.search || undefined,
        minDelay: filters.delayRange?.min,
        maxDelay: filters.delayRange?.max,
        dateFrom: filters.dateRange?.start,
        dateTo: filters.dateRange?.end,
      };
      
      const blob = await blockedApi.exportData(format, apiFilter as any);
      
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blocages-export-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
      setSelectedFormat(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <Download className="w-5 h-5 text-purple-400" />
            Exporter les données
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <div className="space-y-3">
          {exportFormats.map(({ format, desc, icon }) => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              disabled={exporting}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left",
                exporting && selectedFormat === format
                  ? "border-purple-500/50 bg-purple-500/10"
                  : "border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/50",
                exporting && selectedFormat !== format && "opacity-50"
              )}
            >
              <span className="text-2xl">{icon}</span>
              <div className="flex-1">
                <p className="font-medium text-slate-200">{format.toUpperCase()}</p>
                <p className="text-sm text-slate-400">{desc}</p>
              </div>
              {exporting && selectedFormat === format && (
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-6 p-3 rounded-lg bg-slate-800/50">
          <p className="text-xs text-slate-400">
            💡 Les exports incluent tous les dossiers filtrés selon la vue active.
          </p>
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
    { key: '⌘F', label: 'Filtres avancés' },
    { key: '⌘D', label: 'Centre de décision' },
    { key: '⌘I', label: 'Statistiques' },
    { key: '⌘E', label: 'Exporter' },
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
        className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <Keyboard className="w-5 h-5 text-slate-400" />
            Raccourcis clavier
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="space-y-3 text-sm">
          {shortcuts.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-slate-400">{label}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs text-slate-300">
                {key}
              </kbd>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 font-medium hover:bg-slate-700 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

// ================================
// Settings Modal
// ================================
function SettingsModal({ onClose }: { onClose: () => void }) {
  const { 
    kpiConfig, setKPIConfig, 
    autoRefresh, setAutoRefresh,
    refreshInterval, setRefreshInterval 
  } = useBlockedCommandCenterStore();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <Settings className="w-5 h-5 text-slate-400" />
            Paramètres
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* KPI Bar */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Barre de KPIs</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Afficher la barre de KPIs</span>
                <input
                  type="checkbox"
                  checked={kpiConfig.visible}
                  onChange={e => setKPIConfig({ visible: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500/50"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Replier par défaut</span>
                <input
                  type="checkbox"
                  checked={kpiConfig.collapsed}
                  onChange={e => setKPIConfig({ collapsed: e.target.checked })}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500/50"
                />
              </label>
            </div>
          </div>

          {/* Auto Refresh */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Actualisation automatique</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Activer l'actualisation auto</span>
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={e => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-blue-500/50"
                />
              </label>
              {autoRefresh && (
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Intervalle (secondes)</label>
                  <select
                    value={refreshInterval / 1000}
                    onChange={e => setRefreshInterval(parseInt(e.target.value) * 1000)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <option value="15">15 secondes</option>
                    <option value="30">30 secondes</option>
                    <option value="60">1 minute</option>
                    <option value="300">5 minutes</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        <Button onClick={onClose} className="w-full mt-6">
          Fermer
        </Button>
      </div>
    </div>
  );
}

// ================================
// Dossier Detail Modal - Enhanced with actions
// ================================
function DossierDetailModal({ onClose, data }: { onClose: () => void; data: Record<string, unknown> }) {
  const { openModal } = useBlockedCommandCenterStore();
  const [dossier, setDossier] = useState<BlockedDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const dossierId = data.dossierId as string;

  useEffect(() => {
    if (!dossierId) return;
    
    setLoading(true);
    Promise.all([
      blockedApi.getById(dossierId),
      blockedApi.isInWatchlist(dossierId),
    ]).then(([d, inWl]) => {
      setDossier(d);
      setInWatchlist(inWl);
    }).finally(() => setLoading(false));
  }, [dossierId]);

  const handleToggleWatchlist = async () => {
    if (!dossier) return;
    setWatchlistLoading(true);
    try {
      if (inWatchlist) {
        await blockedApi.removeFromWatchlist(dossier.id);
        setInWatchlist(false);
      } else {
        await blockedApi.addToWatchlist(dossier.id);
        setInWatchlist(true);
      }
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleOpenDecisionCenter = () => {
    onClose();
    openModal('decision-center', { dossier });
  };

  const impactColors: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            <FileText className="w-5 h-5 text-blue-400" />
            Détail du dossier
          </h2>
          <div className="flex items-center gap-2">
            {dossier && (
              <button
                onClick={handleToggleWatchlist}
                disabled={watchlistLoading}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  inWatchlist 
                    ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" 
                    : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                )}
                title={inWatchlist ? "Retirer de la watchlist" : "Ajouter à la watchlist"}
              >
                <Star className={cn("w-4 h-4", inWatchlist && "fill-current")} />
              </button>
            )}
            <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
          ) : dossier ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-mono text-slate-500">{dossier.id}</p>
                  <h3 className="text-xl font-semibold text-slate-100 mt-1">{dossier.subject}</h3>
                </div>
                <Badge className={cn("border", impactColors[dossier.impact])}>
                  {dossier.impact}
                </Badge>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Building2 className="w-4 h-4" />
                    <span className="text-xs">Bureau</span>
                  </div>
                  <p className="font-medium text-slate-200">{dossier.bureau}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">Délai</span>
                  </div>
                  <p className={cn(
                    "font-medium",
                    (dossier.delay ?? 0) > 14 ? "text-red-400" : (dossier.delay ?? 0) > 7 ? "text-amber-400" : "text-slate-200"
                  )}>
                    {dossier.delay} jours
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">Type</span>
                  </div>
                  <p className="font-medium text-slate-200">{dossier.type}</p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs">Montant</span>
                  </div>
                  <p className="font-medium text-amber-400">{dossier.amount}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-2">Raison du blocage</h4>
                <p className="text-slate-400">{dossier.reason}</p>
              </div>

              {/* Watchlist Badge */}
              {inWatchlist && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-sm text-amber-400">Ce dossier est dans votre watchlist</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              Dossier non trouvé
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 space-y-3">
          {dossier && (
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => {
                  onClose();
                  openModal('dossier-detail-enriched', { dossierId: dossier.id });
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white gap-2"
              >
                <Eye className="w-4 h-4" />
                Détails complets
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  openModal('resolution-advanced', { dossier });
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Résoudre
              </Button>
              <Button
                onClick={() => {
                  onClose();
                  openModal('kpi-drilldown', { kpiId: 'dossier', dossierId: dossier.id });
                }}
                variant="outline"
                className="gap-2"
              >
                <Eye className="w-4 h-4" />
                Historique
              </Button>
            </div>
          )}
          <Button onClick={onClose} variant="ghost" className="w-full text-slate-400">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}

// ================================
// Confirm Modal
// ================================
function ConfirmModal({ onClose, data }: { onClose: () => void; data: Record<string, unknown> }) {
  const [loading, setLoading] = useState(false);
  
  const title = data.title as string || 'Confirmer l\'action';
  const message = data.message as string || 'Êtes-vous sûr de vouloir continuer ?';
  const confirmText = data.confirmText as string || 'Confirmer';
  const cancelText = data.cancelText as string || 'Annuler';
  const onConfirm = data.onConfirm as (() => Promise<void> | void) | undefined;
  const variant = data.variant as 'danger' | 'warning' | 'default' || 'default';

  const handleConfirm = async () => {
    if (onConfirm) {
      setLoading(true);
      try {
        await onConfirm();
      } finally {
        setLoading(false);
      }
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-100 mb-2">{title}</h2>
        <p className="text-slate-400 mb-6">{message}</p>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              "flex-1",
              variant === 'danger' && "bg-red-600 hover:bg-red-700",
              variant === 'warning' && "bg-amber-600 hover:bg-amber-700"
            )}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Note: KPIDrilldownModal basique supprimé
// Remplacé par KPIDetailModal enrichi (../KPIDetailModal.tsx)
