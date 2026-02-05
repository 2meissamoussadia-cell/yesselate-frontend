/**
 * Validation Contrats Modals
 * Architecture harmonisée avec Paiements, Employes et Blocked
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
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
  Building2,
  User,
  DollarSign,
  FileCheck,
  Eye,
  Edit,
  BarChart3,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ================================
// Types
// ================================
export type ContratModalType =
  | 'stats'
  | 'validation'
  | 'rejection'
  | 'detail'
  | 'export'
  | 'settings'
  | 'shortcuts'
  | 'confirm';

interface ModalState {
  isOpen: boolean;
  type: ContratModalType | null;
  data?: any;
}

interface ContratsModalsProps {
  modal: ModalState;
  onClose: () => void;
}

export function ValidationContratsModals({ modal, onClose }: ContratsModalsProps) {
  if (!modal.isOpen || !modal.type) return null;

  if (modal.type === 'stats') {
    return <ContratsStatsModal onClose={onClose} />;
  }

  if (modal.type === 'validation') {
    return <ContratValidationModal onClose={onClose} data={modal.data} />;
  }

  if (modal.type === 'rejection') {
    return <ContratRejectionModal onClose={onClose} data={modal.data} />;
  }

  if (modal.type === 'detail') {
    return <ContratDetailModal onClose={onClose} data={modal.data} />;
  }

  if (modal.type === 'export') {
    return <ContratsExportModal onClose={onClose} />;
  }

  if (modal.type === 'settings') {
    return <ContratsSettingsModal onClose={onClose} />;
  }

  if (modal.type === 'shortcuts') {
    return <ContratsShortcutsModal onClose={onClose} />;
  }

  if (modal.type === 'confirm') {
    return <ContratsConfirmModal onClose={onClose} data={modal.data} />;
  }

  return null;
}

// ================================
// Stats Modal
// ================================
function ContratsStatsModal({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock stats - en production, appeler l'API
    setTimeout(() => {
      setStats({
        total: 68,
        pending: 12,
        validated: 45,
        rejected: 8,
        negotiation: 5,
        totalMontant: 45000000,
        avgMontant: 750000,
        avgDelaiValidation: 3.5,
      });
      setLoading(false);
    }, 500);
  }, []);

  const formatMontant = (montant: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(montant);

  return (
    <ModalContainer onClose={onClose} title="Statistiques Contrats" icon={<BarChart3 className="w-5 h-5 text-blue-400" />} size="large">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* KPIs Principaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total" value={stats.total} color="text-slate-200" />
            <StatCard label="En attente" value={stats.pending} color="text-amber-400" />
            <StatCard label="Validés" value={stats.validated} color="text-emerald-400" />
            <StatCard label="Rejetés" value={stats.rejected} color="text-red-400" />
          </div>

          {/* Montants */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-emerald-300">Montant Total</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{formatMontant(stats.totalMontant)}</p>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-blue-300">Moyenne</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{formatMontant(stats.avgMontant)}</p>
            </div>

            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-purple-300">Délai Moyen</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">{stats.avgDelaiValidation} jours</p>
            </div>
          </div>

          {/* En négociation */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex justify-between items-center">
              <span className="text-sm text-amber-300">Contrats en négociation</span>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                {stats.negotiation}
              </Badge>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-slate-400 py-8">Aucune donnée disponible</p>
      )}
    </ModalContainer>
  );
}

// ================================
// Validation Modal
// ================================
function ContratValidationModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [notes, setNotes] = useState('');
  const [validating, setValidating] = useState(false);

  const handleValidate = async () => {
    setValidating(true);
    try {
      // Mock validation - en production, appeler l'API
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose();
      data?.onSuccess?.('Contrat validé avec succès');
    } catch (error) {
      logger.error('Validation failed', error instanceof Error ? error : undefined, { component: 'ValidationContratsModals' });
    } finally {
      setValidating(false);
    }
  };

  return (
    <ModalContainer onClose={onClose} title="Valider le contrat" icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}>
      <div className="space-y-6">
        {/* Avertissement */}
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <p className="text-sm text-emerald-300">
            Vous êtes sur le point de valider ce contrat. Cette action déclenchera le processus de signature.
          </p>
        </div>

        {/* Notes (optionnel) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notes de validation (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Commentaires, conditions particulières..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-slate-700"
            disabled={validating}
          >
            Annuler
          </Button>
          <Button
            onClick={handleValidate}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            disabled={validating}
          >
            {validating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validation...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Valider
              </>
            )}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}

// ================================
// Rejection Modal
// ================================
function ContratRejectionModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const rejectionReasons = [
    'Clauses non conformes',
    'Montant excessif',
    'Conditions inacceptables',
    'Documents incomplets',
    'Fournisseur non agréé',
    'Non conforme à la politique',
    'Autre (préciser dans les notes)',
  ];

  const handleReject = async () => {
    if (!reason) return;
    setRejecting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose();
      data?.onSuccess?.('Contrat rejeté');
    } catch (error) {
      logger.error('Rejection failed', error instanceof Error ? error : undefined, { component: 'ValidationContratsModals' });
    } finally {
      setRejecting(false);
    }
  };

  return (
    <ModalContainer onClose={onClose} title="Rejeter le contrat" icon={<XCircle className="w-5 h-5 text-red-400" />}>
      <div className="space-y-6">
        {/* Avertissement */}
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">
            Le rejet d'un contrat nécessite une justification obligatoire.
          </p>
        </div>

        {/* Motif de rejet (obligatoire) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Motif de rejet <span className="text-red-400">*</span>
          </label>
          <Select value={reason || '__none__'} onValueChange={(value: string) => setReason(value === '__none__' ? '' : value)}>
            <SelectTrigger className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500">
              <SelectValue placeholder="Sélectionner un motif..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Sélectionner un motif...</SelectItem>
              {rejectionReasons.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes complémentaires */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notes complémentaires
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Précisions, actions correctives..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
            rows={4}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-slate-700"
            disabled={rejecting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleReject}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            disabled={rejecting || !reason}
          >
            {rejecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rejet...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Rejeter
              </>
            )}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
}

// ================================
// Detail Modal
// ================================
function ContratDetailModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [contrat, setContrat] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock contrat - en production, appeler l'API
    setTimeout(() => {
      setContrat({
        id: 'CTR-2024-001',
        type: 'Prestation de services',
        fournisseur: 'SARL TechServices',
        montant: 15000000,
        dateDebut: '2024-01-15',
        dateFin: '2024-12-31',
        status: 'pending',
        responsable: 'Jean Dupont',
        description: 'Contrat de maintenance informatique et support technique',
      });
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <ModalContainer onClose={onClose} title="Détails" icon={<FileText className="w-5 h-5 text-blue-400" />} size="large">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </ModalContainer>
    );
  }

  if (!contrat) {
    return (
      <ModalContainer onClose={onClose} title="Détails" icon={<FileText className="w-5 h-5 text-blue-400" />} size="large">
        <p className="text-center text-slate-400 py-8">Contrat non trouvé</p>
      </ModalContainer>
    );
  }

  const formatMontant = (montant: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(montant);

  return (
    <ModalContainer onClose={onClose} title={`Contrat ${contrat.id}`} icon={<FileText className="w-5 h-5 text-blue-400" />} size="large">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={<FileCheck />} label="Type" value={contrat.type} />
          <InfoItem icon={<Building2 />} label="Fournisseur" value={contrat.fournisseur} />
          <InfoItem icon={<DollarSign />} label="Montant" value={formatMontant(contrat.montant)} />
          <InfoItem icon={<User />} label="Responsable" value={contrat.responsable} />
          <InfoItem icon={<Calendar />} label="Date début" value={new Date(contrat.dateDebut).toLocaleDateString('fr-FR')} />
          <InfoItem icon={<Calendar />} label="Date fin" value={new Date(contrat.dateFin).toLocaleDateString('fr-FR')} />
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-2">Description</h3>
          <p className="text-sm text-slate-400">{contrat.description}</p>
        </div>

        {/* Actions */}
        {contrat.status === 'pending' && (
          <div className="flex gap-3 pt-4 border-t border-slate-700/50">
            <Button
              className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              onClick={() => {
                // Open validation modal
                onClose();
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Valider
            </Button>
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600"
              onClick={() => {
                // Open rejection modal
                onClose();
              }}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rejeter
            </Button>
          </div>
        )}
      </div>
    </ModalContainer>
  );
}

// ================================
// Export Modal
// ================================
function ContratsExportModal({ onClose }: { onClose: () => void }) {
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      onClose();
    } catch (error) {
      logger.error('Export failed', error instanceof Error ? error : undefined, { component: 'ValidationContratsModals' });
    } finally {
      setExporting(false);
      setSelectedFormat(null);
    }
  };

  return (
    <ModalContainer onClose={onClose} title="Exporter les contrats" icon={<Download className="w-5 h-5 text-purple-400" />}>
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
          💡 Les exports incluent tous les contrats selon les filtres actifs.
        </p>
      </div>
    </ModalContainer>
  );
}

// ================================
// Settings Modal
// ================================
function ContratsSettingsModal({ onClose }: { onClose: () => void }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [notifications, setNotifications] = useState(true);
  const [urgentAlerts, setUrgentAlerts] = useState(true);

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
              className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
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
            className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Urgent Alerts */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Alertes urgentes</label>
          <input
            type="checkbox"
            checked={urgentAlerts}
            onChange={(e) => setUrgentAlerts(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Save button */}
        <Button
          onClick={onClose}
          className="w-full bg-blue-500 hover:bg-blue-600"
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
function ContratsShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', label: 'Palette de commandes' },
    { key: '⌘B', label: 'Toggle Sidebar' },
    { key: '⌘I', label: 'Statistiques' },
    { key: '⌘E', label: 'Exporter' },
    { key: '⌘F', label: 'Filtres' },
    { key: 'F11', label: 'Plein écran' },
    { key: 'Alt+←', label: 'Retour' },
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
function ContratsConfirmModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await data?.onConfirm?.();
      onClose();
    } catch (error) {
      logger.error('Confirmation failed', error instanceof Error ? error : undefined, { component: 'ValidationContratsModals' });
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
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-4 h-4 text-slate-400' }) : icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}