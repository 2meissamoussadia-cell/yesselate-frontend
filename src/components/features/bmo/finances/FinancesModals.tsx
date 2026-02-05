/**
 * Generic Modals Template Generator
 * Template réutilisable pour créer rapidement des modales harmonisées
 * 
 * Usage:
 * 1. Copier ce fichier
 * 2. Remplacer Finances par le nom du module (ex: Delegations, Finances)
 * 3. Remplacer emerald par la couleur du module (ex: purple, emerald, blue)
 * 4. Adapter les types et données spécifiques au module
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Download,
  Keyboard,
  Settings,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  DollarSign,
  BarChart3,
  Eye,
} from 'lucide-react';

// ================================
// Types - À adapter selon le module
// ================================
export type FinancesModalType =
  | 'stats'
  | 'detail'
  | 'export'
  | 'settings'
  | 'shortcuts'
  | 'confirm';

interface ModalState {
  isOpen: boolean;
  type: FinancesModalType | null;
  data?: any;
}

interface FinancesModalsProps {
  modal: ModalState;
  onClose: () => void;
}

// ================================
// Main Modal Router
// ================================
export function FinancesModals({ modal, onClose }: FinancesModalsProps) {
  if (!modal.isOpen || !modal.type) return null;

  if (modal.type === 'stats') {
    return <FinancesStatsModal onClose={onClose} />;
  }

  if (modal.type === 'detail') {
    return <FinancesDetailModal onClose={onClose} data={modal.data} />;
  }

  if (modal.type === 'export') {
    return <FinancesExportModal onClose={onClose} />;
  }

  if (modal.type === 'settings') {
    return <FinancesSettingsModal onClose={onClose} />;
  }

  if (modal.type === 'shortcuts') {
    return <FinancesShortcutsModal onClose={onClose} />;
  }

  if (modal.type === 'confirm') {
    return <FinancesConfirmModal onClose={onClose} data={modal.data} />;
  }

  return null;
}

// ================================
// Stats Modal
// ================================
function FinancesStatsModal({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Remplacer par appel API réel
    setTimeout(() => {
      setStats({
        total: 100,
        active: 45,
        completed: 40,
        pending: 15,
      });
      setLoading(false);
    }, 500);
  }, []);

  return (
    <ModalContainer 
      onClose={onClose} 
      title="Statistiques Finances" 
      icon={<BarChart3 className="w-5 h-5 text-emerald-400" />} 
      size="large"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total" value={stats.total} color="text-slate-200" />
            <StatCard label="Actifs" value={stats.active} color="text-emerald-400" />
            <StatCard label="Terminés" value={stats.completed} color="text-emerald-400" />
            <StatCard label="En attente" value={stats.pending} color="text-amber-400" />
          </div>

          {/* TODO: Ajouter graphiques et métriques spécifiques au module */}
        </div>
      ) : (
        <p className="text-center text-slate-400 py-8">Aucune donnée disponible</p>
      )}
    </ModalContainer>
  );
}

// ================================
// Detail Modal
// ================================
function FinancesDetailModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Charger les données depuis l'API
    setTimeout(() => {
      setItem({
        id: 'ITEM-001',
        title: 'Exemple',
        status: 'active',
        // TODO: Ajouter les champs spécifiques
      });
      setLoading(false);
    }, 500);
  }, [data]);

  if (loading) {
    return (
      <ModalContainer onClose={onClose} title="Détails" icon={<FileText className="w-5 h-5 text-emerald-400" />} size="large">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      </ModalContainer>
    );
  }

  if (!item) {
    return (
      <ModalContainer onClose={onClose} title="Détails" icon={<FileText className="w-5 h-5 text-emerald-400" />} size="large">
        <p className="text-center text-slate-400 py-8">Élément non trouvé</p>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer onClose={onClose} title={item.title} icon={<FileText className="w-5 h-5 text-emerald-400" />} size="large">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* TODO: Afficher les détails spécifiques */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={<FileText />} label="ID" value={item.id} />
          <InfoItem icon={<User />} label="Statut" value={item.status} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-700/50">
          <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}

// ================================
// Export Modal
// ================================
function FinancesExportModal({ onClose }: { onClose: () => void }) {
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
      // TODO: Implémenter l'export réel via API
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
      setSelectedFormat(null);
    }
  };

  return (
    <ModalContainer onClose={onClose} title="Exporter" icon={<Download className="w-5 h-5 text-purple-400" />}>
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
          💡 Les exports incluent les données selon les filtres actifs.
        </p>
      </div>
    </ModalContainer>
  );
}

// ================================
// Settings Modal
// ================================
function FinancesSettingsModal({ onClose }: { onClose: () => void }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [notifications, setNotifications] = useState(true);

  return (
    <ModalContainer onClose={onClose} title="Paramètres" icon={<Settings className="w-5 h-5 text-slate-400" />}>
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Actualisation automatique</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
            />
          </div>
          {autoRefresh && (
            <div>
              <label className="text-xs text-slate-400">Intervalle (secondes)</label>
              <input
                type="number"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm"
                min="10"
                max="300"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Notifications in-app</label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
          />
        </div>

        <Button onClick={onClose} className="w-full bg-emerald-500 hover:bg-emerald-600">
          Enregistrer
        </Button>
      </div>
    </ModalContainer>
  );
}

// ================================
// Shortcuts Modal
// ================================
function FinancesShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', label: 'Palette de commandes' },
    { key: '⌘B', label: 'Toggle Sidebar' },
    { key: '⌘I', label: 'Statistiques' },
    { key: '⌘E', label: 'Exporter' },
    { key: 'F11', label: 'Plein écran' },
    { key: 'Esc', label: 'Fermer les modales' },
    { key: '?', label: 'Cette aide' },
  ];

  return (
    <ModalContainer onClose={onClose} title="Raccourcis clavier" icon={<Keyboard className="w-5 h-5 text-slate-400" />}>
      <div className="space-y-3">
        {shortcuts.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-400">{label}</span>
            <kbd className="px-2 py-1 rounded bg-slate-800 font-mono text-xs text-slate-300 border border-slate-700">
              {key}
            </kbd>
          </div>
        ))}
      </div>
    </ModalContainer>
  );
}

// ================================
// Confirm Modal
// ================================
function FinancesConfirmModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await data?.onConfirm?.();
      onClose();
    } catch (error) {
      console.error('Confirmation failed:', error);
    } finally {
      setConfirming(false);
    }
  };

  const variant = data?.variant || 'warning';
  const iconColor = variant === 'danger' ? 'text-red-400' : variant === 'warning' ? 'text-amber-400' : 'text-blue-400';
  const buttonColor = variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600';

  return (
    <ModalContainer onClose={onClose} title={data?.title || 'Confirmation'} icon={<AlertCircle className={cn('w-5 h-5', iconColor)} />}>
      <div className="space-y-6">
        <p className="text-sm text-slate-300">
          {data?.message || 'Êtes-vous sûr de vouloir continuer ?'}
        </p>
        <div className="flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 border-slate-700" disabled={confirming}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} className={cn('flex-1', buttonColor)} disabled={confirming}>
            {confirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirmation...
              </>
            ) : (
              'Confirmer'
            )}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}

// ================================
// Helper Components
// ================================
function ModalContainer({
  onClose,
  title,
  icon,
  children,
  size = 'default',
}: {
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  size?: 'default' | 'large';
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn('w-full rounded-2xl border border-slate-700/50 bg-slate-900 p-6', size === 'large' ? 'max-w-3xl' : 'max-w-lg')}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-100">
            {icon}
            {title}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={cn('text-2xl font-bold', color)}>{value}</p>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        {React.isValidElement(icon) ? React.cloneElement(icon, { className: 'w-4 h-4 text-slate-400' } as any) : icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

