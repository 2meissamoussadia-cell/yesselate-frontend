/**
 * Modales du module Employes
 * Architecture harmonisée avec Paiements et Blocked
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { employesApiService } from '@/lib/services/employesApiService';
import {
  X,
  Download,
  Keyboard,
  Settings,
  FileText,
  AlertCircle,
  User,
  Loader2,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  Mail,
  Phone,
  Star,
  Shield,
  TrendingUp,
  Eye,
  Edit,
} from 'lucide-react';

// ================================
// Types
// ================================
export type EmployeModalType =
  | 'detail'
  | 'export'
  | 'settings'
  | 'shortcuts'
  | 'confirm';

interface ModalState {
  isOpen: boolean;
  type: EmployeModalType | null;
  data?: any;
}

interface EmployesModalsProps {
  modal: ModalState;
  onClose: () => void;
}

export function EmployesModals({ modal, onClose }: EmployesModalsProps) {
  if (!modal.isOpen || !modal.type) return null;

  // Detail Modal
  if (modal.type === 'detail') {
    return <EmployeDetailModal onClose={onClose} data={modal.data} />;
  }

  // Export Modal
  if (modal.type === 'export') {
    return <EmployesExportModal onClose={onClose} />;
  }

  // Settings Modal
  if (modal.type === 'settings') {
    return <EmployesSettingsModal onClose={onClose} />;
  }

  // Shortcuts Modal
  if (modal.type === 'shortcuts') {
    return <EmployesShortcutsModal onClose={onClose} />;
  }

  // Confirm Modal
  if (modal.type === 'confirm') {
    return <EmployesConfirmModal onClose={onClose} data={modal.data} />;
  }

  return null;
}

// ================================
// Detail Modal
// ================================
function EmployeDetailModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [employe, setEmploye] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data?.employeId) {
      employesApiService.getById(data.employeId).then(e => {
        setEmploye(e || null);
        setLoading(false);
      });
    }
  }, [data]);

  if (loading) {
    return (
      <ModalContainer onClose={onClose} title="Détails" icon={<User className="w-5 h-5 text-teal-400" />} size="large">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      </ModalContainer>
    );
  }

  if (!employe) {
    return (
      <ModalContainer onClose={onClose} title="Détails" icon={<User className="w-5 h-5 text-teal-400" />} size="large">
        <p className="text-center text-slate-400 py-8">Employé non trouvé</p>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer onClose={onClose} title={`${employe.nom} ${employe.prenom}`} icon={<User className="w-5 h-5 text-teal-400" />} size="large">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Photo et informations principales */}
        <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="w-20 h-20 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-teal-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-100 mb-1">{employe.nom} {employe.prenom}</h3>
            <p className="text-sm text-slate-400 mb-2">{employe.poste}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                {employe.bureau}
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {employe.contrat}
              </Badge>
              {employe.isSPOF && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  <Shield className="w-3 h-3 mr-1" />
                  SPOF
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={<Mail />} label="Email" value={employe.email} />
          <InfoItem icon={<Phone />} label="Téléphone" value={employe.telephone || '—'} />
          <InfoItem icon={<Building2 />} label="Bureau" value={employe.bureau} />
          <InfoItem icon={<Calendar />} label="Date d'embauche" value={new Date(employe.dateEmbauche).toLocaleDateString('fr-FR')} />
        </div>

        {/* Salaire et évaluation */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-emerald-300">Salaire</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {employesApiService.formatMontant(employe.salaire)} FCFA
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-amber-300">Évaluation</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">
              {employe.evaluation}/5
            </p>
          </div>
        </div>

        {/* Compétences */}
        {employe.competences && employe.competences.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Compétences</h3>
            <div className="flex flex-wrap gap-2">
              {employe.competences.map((comp: string, i: number) => (
                <Badge key={i} variant="outline" className="bg-slate-800/50">
                  {comp}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-700/50">
          <Button
            variant="outline"
            className="flex-1 border-slate-700"
            onClick={() => {
              // Open edit modal
              logger.debug('Edit employee', { component: 'EmployesModals' });
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button
            className="flex-1 bg-teal-500 hover:bg-teal-600"
            onClick={onClose}
          >
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
function EmployesExportModal({ onClose }: { onClose: () => void }) {
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'xlsx' | null>(null);

  const exportFormats = [
    { format: 'json' as const, desc: 'Données brutes structurées', icon: '📄' },
    { format: 'xlsx' as const, desc: 'Fichier tableur Excel', icon: '📊' },
    { format: 'csv' as const, desc: 'Données tabulées', icon: '📋' },
  ];

  const handleExport = async (format: 'json' | 'csv' | 'xlsx') => {
    setExporting(true);
    setSelectedFormat(format);
    
    try {
      const { data } = await employesApiService.getAll();
      let blob: Blob;
      const ext = format === 'xlsx' ? 'csv' : format;
      if (format === 'json') {
        blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      } else {
        const headers = Object.keys(data[0] ?? {}).join(';');
        const rows = data.map((e) => Object.values(e as unknown as Record<string, unknown>).join(';'));
        blob = new Blob([headers + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employes-export-${new Date().toISOString().split('T')[0]}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      logger.error('Export failed', error instanceof Error ? error : undefined, { component: 'EmployesModals' });
    } finally {
      setExporting(false);
      setSelectedFormat(null);
    }
  };

  return (
    <ModalContainer onClose={onClose} title="Exporter les employés" icon={<Download className="w-5 h-5 text-purple-400" />}>
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
          💡 Les exports incluent tous les employés selon les filtres actifs.
        </p>
      </div>
    </ModalContainer>
  );
}

// ================================
// Settings Modal
// ================================
function EmployesSettingsModal({ onClose }: { onClose: () => void }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [notifications, setNotifications] = useState(true);
  const [showSPOFAlerts, setShowSPOFAlerts] = useState(true);

  return (
    <ModalContainer onClose={onClose} title="Paramètres" icon={<Settings className="w-5 h-5 text-slate-400" />}>
      <div className="space-y-6">
        {/* Auto-refresh */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Actualisation automatique</label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
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

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Notifications in-app</label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
          />
        </div>

        {/* SPOF Alerts */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Alertes SPOF</label>
          <input
            type="checkbox"
            checked={showSPOFAlerts}
            onChange={(e) => setShowSPOFAlerts(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 text-teal-500 focus:ring-teal-500"
          />
        </div>

        {/* Save button */}
        <Button
          onClick={onClose}
          className="w-full bg-teal-500 hover:bg-teal-600"
        >
          Enregistrer
        </Button>
      </div>
    </ModalContainer>
  );
}

// ================================
// Shortcuts Modal
// ================================
function EmployesShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', label: 'Palette de commandes' },
    { key: '⌘R', label: 'Rafraîchir' },
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
function EmployesConfirmModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await data?.onConfirm?.();
      onClose();
    } catch (error) {
      logger.error('Confirmation failed', error instanceof Error ? error : undefined, { component: 'EmployesModals' });
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
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-slate-700"
            disabled={confirming}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn('flex-1', buttonColor)}
            disabled={confirming}
          >
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full rounded-2xl border border-slate-700/50 bg-slate-900 p-6',
          size === 'large' ? 'max-w-3xl' : 'max-w-lg'
        )}
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

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-1">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4 text-slate-400' }) : icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

