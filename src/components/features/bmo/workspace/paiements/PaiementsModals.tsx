/**
 * Modales du Paiements Command Center
 * Toutes les modales : stats, validation, rejection, detail, export, settings, shortcuts, confirm
 * Architecture harmonisée avec Blocked Command Center
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { paiementsApiService, type Paiement, type PaiementsStats } from '@/lib/services/paiementsApiService';
import {
  X,
  Download,
  Keyboard,
  Settings,
  FileText,
  AlertCircle,
  Clock,
  DollarSign,
  Loader2,
  Check,
  ChevronRight,
  Search,
  Eye,
  Trash2,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  Building2,
  User,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  FileCheck,
  Ban,
} from 'lucide-react';

// ================================
// Types
// ================================
export type PaiementModalType =
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
  type: PaiementModalType | null;
  data?: any;
}

interface PaiementsModalsProps {
  modal: ModalState;
  onClose: () => void;
}

export function PaiementsModals({ modal, onClose }: PaiementsModalsProps) {
  if (!modal.isOpen || !modal.type) return null;

  // Stats Modal
  if (modal.type === 'stats') {
    return <PaiementsStatsModal onClose={onClose} />;
  }

  // Validation Modal
  if (modal.type === 'validation') {
    return <PaiementsValidationModal onClose={onClose} data={modal.data} />;
  }

  // Rejection Modal
  if (modal.type === 'rejection') {
    return <PaiementsRejectionModal onClose={onClose} data={modal.data} />;
  }

  // Detail Modal
  if (modal.type === 'detail') {
    return <PaiementsDetailModal onClose={onClose} data={modal.data} />;
  }

  // Export Modal
  if (modal.type === 'export') {
    return <PaiementsExportModal onClose={onClose} />;
  }

  // Settings Modal
  if (modal.type === 'settings') {
    return <PaiementsSettingsModal onClose={onClose} />;
  }

  // Shortcuts Modal
  if (modal.type === 'shortcuts') {
    return <PaiementsShortcutsModal onClose={onClose} />;
  }

  // Confirm Modal
  if (modal.type === 'confirm') {
    return <PaiementsConfirmModal onClose={onClose} data={modal.data} />;
  }

  return null;
}

// ================================
// Stats Modal
// ================================
function PaiementsStatsModal({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<PaiementsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paiementsApiService.getStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  const formatMontant = (montant: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(montant);

  return (
    <ModalContainer onClose={onClose} title="Statistiques Paiements" icon={<BarChart3 className="w-5 h-5 text-emerald-400" />}>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Vue d'ensemble */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard label="Total" value={stats.total} color="text-slate-200" />
            <StatCard label="En attente" value={stats.pending} color="text-amber-400" />
            <StatCard label="Validés" value={stats.validated} color="text-emerald-400" />
            <StatCard label="Rejetés" value={stats.rejected} color="text-red-400" />
          </div>

          {/* Montants */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Montants</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Total</span>
                <span className="text-sm font-medium text-slate-200">{formatMontant(stats.totalMontant)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Moyenne</span>
                <span className="text-sm font-medium text-slate-200">{formatMontant(stats.avgMontant)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Trésorerie disponible</span>
                <span className="text-sm font-medium text-emerald-400">{formatMontant(stats.tresorerieDisponible)}</span>
              </div>
            </div>
          </div>

          {/* Par urgence */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Par urgence</h3>
            <div className="space-y-2">
              {Object.entries(stats.byUrgency).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 capitalize">{key}</span>
                  <Badge variant="outline" className="bg-slate-700/50">{value}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Échéances */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Échéances</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Prochains 7 jours</span>
                <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  {stats.echeancesJ7}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Prochains 30 jours</span>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {stats.echeancesJ30}
                </Badge>
              </div>
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
function PaiementsValidationModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [notes, setNotes] = useState('');
  const [validating, setValidating] = useState(false);
  const [paiement, setPaiement] = useState<Paiement | null>(null);

  useEffect(() => {
    if (data?.paiementId) {
      paiementsApiService.getById(data.paiementId).then(p => setPaiement(p || null));
    }
  }, [data]);

  const handleValidate = async () => {
    if (!paiement) return;
    setValidating(true);
    try {
      await paiementsApiService.validatePaiement(paiement.id, notes, 'user-123', 'Jean Dupont', 'Directeur Financier');
      onClose();
      data?.onSuccess?.();
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setValidating(false);
    }
  };

  if (!paiement) {
    return (
      <ModalContainer onClose={onClose} title="Validation" icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer onClose={onClose} title="Valider le paiement" icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}>
      <div className="space-y-6">
        {/* Résumé du paiement */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Référence</span>
              <span className="text-sm font-medium text-slate-200">{paiement.reference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Fournisseur</span>
              <span className="text-sm font-medium text-slate-200">{paiement.fournisseur.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Montant</span>
              <span className="text-lg font-bold text-emerald-400">
                {paiementsApiService.formatMontant(paiement.montant)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Échéance</span>
              <span className="text-sm font-medium text-slate-200">
                {new Date(paiement.dateEcheance).toLocaleDateString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        {/* Notes (optionnel) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notes de validation (optionnel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Commentaires, observations..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
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
function PaiementsRejectionModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [paiement, setPaiement] = useState<Paiement | null>(null);

  const rejectionReasons = [
    'Documents incomplets',
    'Montant incorrect',
    'Fournisseur non agré',
    'Budget insuffisant',
    'Erreur de saisie',
    'Non conforme au contrat',
    'Autre (préciser dans les notes)',
  ];

  useEffect(() => {
    if (data?.paiementId) {
      paiementsApiService.getById(data.paiementId).then(p => setPaiement(p || null));
    }
  }, [data]);

  const handleReject = async () => {
    if (!paiement || !reason) return;
    setRejecting(true);
    try {
      await paiementsApiService.rejectPaiement(paiement.id, reason ?? notes, 'user-123', 'Jean Dupont', 'Directeur Financier');
      onClose();
      data?.onSuccess?.();
    } catch (error) {
      console.error('Rejection failed:', error);
    } finally {
      setRejecting(false);
    }
  };

  if (!paiement) {
    return (
      <ModalContainer onClose={onClose} title="Rejet" icon={<XCircle className="w-5 h-5 text-red-400" />}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-400" />
        </div>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer onClose={onClose} title="Rejeter le paiement" icon={<XCircle className="w-5 h-5 text-red-400" />}>
      <div className="space-y-6">
        {/* Avertissement */}
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">
            Vous êtes sur le point de rejeter ce paiement. Cette action nécessite une justification.
          </p>
        </div>

        {/* Résumé du paiement */}
        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Référence</span>
              <span className="text-sm font-medium text-slate-200">{paiement.reference}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Fournisseur</span>
              <span className="text-sm font-medium text-slate-200">{paiement.fournisseur.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Montant</span>
              <span className="text-sm font-medium text-slate-200">
                {paiementsApiService.formatMontant(paiement.montant)}
              </span>
            </div>
          </div>
        </div>

        {/* Motif de rejet (obligatoire) */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Motif de rejet <span className="text-red-400">*</span>
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-red-500 focus:ring-1 focus:ring-red-500"
          >
            <option value="">Sélectionner un motif...</option>
            {rejectionReasons.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Notes complémentaires */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Notes complémentaires
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Précisions, actions à entreprendre..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none"
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
                <XCircle className="w-4 w-4 mr-2" />
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
function PaiementsDetailModal({ onClose, data }: { onClose: () => void; data?: any }) {
  const [paiement, setPaiement] = useState<Paiement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (data?.paiementId) {
      paiementsApiService.getById(data.paiementId).then(p => {
        setPaiement(p || null);
        setLoading(false);
      });
    }
  }, [data]);

  if (loading) {
    return (
      <ModalContainer onClose={onClose} title="Détails" icon={<FileText className="w-5 h-5 text-blue-400" />} size="large">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      </ModalContainer>
    );
  }

  if (!paiement) {
    return (
      <ModalContainer onClose={onClose} title="Détails" icon={<FileText className="w-5 h-5 text-blue-400" />} size="large">
        <p className="text-center text-slate-400 py-8">Paiement non trouvé</p>
      </ModalContainer>
    );
  }

  return (
    <ModalContainer onClose={onClose} title={`Paiement ${paiement.reference}`} icon={<FileText className="w-5 h-5 text-blue-400" />} size="large">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Informations principales */}
        <div className="grid grid-cols-2 gap-4">
          <InfoItem icon={<FileText />} label="Type" value={paiement.type} />
          <InfoItem icon={<DollarSign />} label="Montant" value={paiementsApiService.formatMontant(paiement.montant)} />
          <InfoItem icon={<Building2 />} label="Fournisseur" value={paiement.fournisseur.name} />
          <InfoItem icon={<User />} label="Responsable" value={paiement.responsible} />
          <InfoItem icon={<Calendar />} label="Date facture" value={new Date(paiement.dateFacture).toLocaleDateString('fr-FR')} />
          <InfoItem icon={<Clock />} label="Échéance" value={new Date(paiement.dateEcheance).toLocaleDateString('fr-FR')} />
        </div>

        {/* Statut et urgence */}
        <div className="flex gap-3">
          <Badge className={cn(
            'capitalize',
            paiement.status === 'validated' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            paiement.status === 'rejected' && 'bg-red-500/20 text-red-400 border-red-500/30',
            paiement.status === 'pending' && 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          )}>
            {paiementsApiService.getStatusLabel(paiement.status)}
          </Badge>
          <Badge className={cn(
            'capitalize',
            paiement.urgency === 'critical' && 'bg-red-500/20 text-red-400 border-red-500/30',
            paiement.urgency === 'high' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            paiement.urgency === 'medium' && 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            paiement.urgency === 'low' && 'bg-slate-500/20 text-slate-400 border-slate-500/30'
          )}>
            {paiement.urgency}
          </Badge>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-2">Description</h3>
          <p className="text-sm text-slate-400">{paiement.description}</p>
        </div>

        {/* Justificatifs */}
        {paiement.justificatifs && paiement.justificatifs.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Justificatifs ({paiement.justificatifs.length})</h3>
            <div className="space-y-2">
              {paiement.justificatifs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-200">{doc.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    Voir
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historique */}
        {paiement.historique && paiement.historique.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Historique</h3>
            <div className="space-y-2">
              {paiement.historique.map((h, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-200">{h.details}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {h.by} • {new Date(h.at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {paiement.status === 'pending' && (
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
function PaiementsExportModal({ onClose }: { onClose: () => void }) {
  const [exporting, setExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | null>(null);

  const exportFormats = [
    { format: 'json' as const, desc: 'Données brutes structurées', icon: '📄' },
    { format: 'csv' as const, desc: 'Fichier tableur (Excel)', icon: '📊' },
  ];

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    setSelectedFormat(format);
    
    try {
      const blob = await paiementsApiService.exportData(format);
      
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `paiements-export-${new Date().toISOString().split('T')[0]}.${format}`;
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
    <ModalContainer onClose={onClose} title="Exporter les paiements" icon={<Download className="w-5 h-5 text-purple-400" />}>
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
          💡 Les exports incluent tous les paiements filtrés selon la vue active.
        </p>
      </div>
    </ModalContainer>
  );
}

// ================================
// Settings Modal
// ================================
function PaiementsSettingsModal({ onClose }: { onClose: () => void }) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

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

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Notifications in-app</label>
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
          />
        </div>

        {/* Email alerts */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">Alertes email</label>
          <input
            type="checkbox"
            checked={emailAlerts}
            onChange={(e) => setEmailAlerts(e.target.checked)}
            className="w-4 h-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500"
          />
        </div>

        {/* Save button */}
        <Button
          onClick={onClose}
          className="w-full bg-emerald-500 hover:bg-emerald-600"
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
function PaiementsShortcutsModal({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: '⌘K', label: 'Palette de commandes' },
    { key: '⌘B', label: 'Afficher/Masquer sidebar' },
    { key: '⌘F', label: 'Filtres avancés' },
    { key: '⌘I', label: 'Statistiques' },
    { key: '⌘E', label: 'Exporter' },
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
function PaiementsConfirmModal({ onClose, data }: { onClose: () => void; data?: any }) {
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

