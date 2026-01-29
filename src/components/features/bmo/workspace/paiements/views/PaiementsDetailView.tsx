'use client';

import { useState, useEffect } from 'react';
import { paiementsApiService, type Paiement } from '@/lib/services/paiementsApiService';
import { usePaiementsWorkspaceStore } from '@/lib/stores/paiementsWorkspaceStore';
import { PaiementValidationModal, type PaiementAction, type PaiementValidationData } from '../modals/PaiementValidationModal';
import { FileText, Building2, Calendar, DollarSign, User, CheckCircle, XCircle, Clock, Download, History, AlertTriangle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  tabId: string;
  data: Record<string, unknown>;
}

const URGENCY_STYLES = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500' },
  high: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500' },
  medium: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500' },
  low: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-400' },
};

export function PaiementsDetailView({ tabId, data }: Props) {
  const { addDecision } = usePaiementsWorkspaceStore();
  const [paiement, setPaiement] = useState<Paiement | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'info' | 'documents' | 'historique'>('info');
  const [processing, setProcessing] = useState(false);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [validationAction, setValidationAction] = useState<PaiementAction>('validate');

  const paiementId = data.paiementId as string;

  useEffect(() => {
    const load = async () => {
      if (!paiementId) return;
      setLoading(true);
      try {
        const result = await paiementsApiService.getById(paiementId);
        setPaiement(result || null);
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [paiementId]);

  const handleOpenValidationModal = (action: PaiementAction) => {
    setValidationAction(action);
    setValidationModalOpen(true);
  };

  const handleConfirmValidation = async (formData: PaiementValidationData) => {
    if (!paiement) return;
    const userId = 'USR-001';
    const userName = 'A. DIALLO';
    const userRole = 'Directeur Général';
    if (formData.action === 'validate') {
      const decision = await paiementsApiService.validatePaiement(
        paiement.id,
        formData.comment || 'Validation accordée',
        userId,
        userName,
        userRole
      );
      addDecision(decision);
    } else if (formData.action === 'reject') {
      const decision = await paiementsApiService.rejectPaiement(
        paiement.id,
        formData.comment || formData.reasonCategory || 'Rejet',
        userId,
        userName,
        userRole
      );
      addDecision(decision);
    } else if (formData.action === 'schedule' && formData.scheduledDate) {
      const dateExecution = formData.scheduledTime
        ? `${formData.scheduledDate}T${formData.scheduledTime}:00`
        : formData.scheduledDate;
      const decision = await paiementsApiService.schedulePaiement(
        paiement.id,
        dateExecution,
        userId,
        userName,
        userRole
      );
      addDecision(decision);
    }
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800" /></div>;
  if (!paiement) return <div className="text-center py-12 text-slate-500"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Paiement non trouvé</p></div>;

  const style = URGENCY_STYLES[paiement.urgency];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className={cn("rounded-xl border-l-4 p-6", style.border, "bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800")}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm px-3 py-1 rounded bg-slate-100 dark:bg-slate-800">{paiement.reference}</span>
              <span className={cn("px-3 py-1 rounded text-sm font-medium", style.bg, style.text)}>{paiement.urgency.toUpperCase()}</span>
              <span className="text-sm text-slate-500">{paiementsApiService.getTypeLabel(paiement.type)}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{paiement.description}</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{paiementsApiService.formatMontant(paiement.montant)} FCFA</p>
            <p className="text-sm text-slate-500 mt-1">Échéance: {new Date(paiement.dateEcheance).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">Fournisseur</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{paiement.fournisseur.name}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-slate-500"><User className="w-4 h-4" />{paiement.fournisseur.contact}</span>
              <span className="flex items-center gap-1 text-slate-500">RIB: {paiement.fournisseur.rib}</span>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2">Validations requises</p>
          <div className="flex items-center gap-2">
            {Object.entries(paiement.validations).map(([key, done]) => (
              <div key={key} className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium", done ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>
                {done ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'info', label: 'Informations', icon: FileText },
          { id: 'documents', label: 'Justificatifs', icon: Download },
          { id: 'historique', label: 'Historique', icon: History },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveSection(id as typeof activeSection)} className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeSection === id ? "border-emerald-500 text-emerald-600 dark:text-emerald-400" : "border-transparent text-slate-500 hover:text-slate-700")}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800 p-6">
        {activeSection === 'info' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div><p className="text-xs text-slate-500 mb-1">Bureau</p><p className="font-medium text-slate-900 dark:text-slate-100">{paiement.bureau}</p></div>
            <div><p className="text-xs text-slate-500 mb-1">Responsable</p><p className="font-medium text-slate-900 dark:text-slate-100">{paiement.responsible}</p></div>
            <div><p className="text-xs text-slate-500 mb-1">Date facture</p><p className="font-medium text-slate-900 dark:text-slate-100">{new Date(paiement.dateFacture).toLocaleDateString('fr-FR')}</p></div>
            <div><p className="text-xs text-slate-500 mb-1">Date réception</p><p className="font-medium text-slate-900 dark:text-slate-100">{new Date(paiement.dateReception).toLocaleDateString('fr-FR')}</p></div>
            <div><p className="text-xs text-slate-500 mb-1">Date échéance</p><p className="font-medium text-slate-900 dark:text-slate-100">{new Date(paiement.dateEcheance).toLocaleDateString('fr-FR')}</p></div>
            {paiement.projet && <div><p className="text-xs text-slate-500 mb-1">Projet</p><p className="font-medium text-slate-900 dark:text-slate-100">{paiement.projet}</p></div>}
            {paiement.contratRef && <div><p className="text-xs text-slate-500 mb-1">Contrat</p><p className="font-medium text-slate-900 dark:text-slate-100">{paiement.contratRef}</p></div>}
            {paiement.bcRef && <div><p className="text-xs text-slate-500 mb-1">BC</p><p className="font-medium text-slate-900 dark:text-slate-100">{paiement.bcRef}</p></div>}
          </div>
        )}
        {activeSection === 'documents' && (
          <div className="space-y-2">
            {paiement.justificatifs.length === 0 ? (
              <p className="text-center py-8 text-slate-500">Aucun justificatif</p>
            ) : (
              paiement.justificatifs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{doc.name}</p>
                      <p className="text-xs text-slate-500">{new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Download className="w-4 h-4 text-slate-500" /></button>
                </div>
              ))
            )}
          </div>
        )}
        {activeSection === 'historique' && (
          <div className="space-y-4">
            {paiement.historique.map((event, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{event.action}</p>
                  <p className="text-sm text-slate-500">{event.details}</p>
                  <p className="text-xs text-slate-400 mt-1">Par {event.by} • {new Date(event.at).toLocaleString('fr-FR')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
        <button onClick={() => handleOpenValidationModal('reject')} className="px-6 py-2.5 rounded-lg border border-red-500 text-red-600 font-medium hover:bg-red-500/10">
          <XCircle className="w-4 h-4 inline mr-2" />Rejeter
        </button>
        <button onClick={() => handleOpenValidationModal('schedule')} className="px-6 py-2.5 rounded-lg border border-blue-500 text-blue-600 font-medium hover:bg-blue-500/10">
          <Calendar className="w-4 h-4 inline mr-2" />Planifier
        </button>
        <button onClick={() => handleOpenValidationModal('validate')} className="px-6 py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600">
          <CheckCircle className="w-4 h-4 inline mr-2" />Valider
        </button>
      </div>

      <PaiementValidationModal
        paiement={paiement}
        action={validationAction}
        isOpen={validationModalOpen}
        onClose={() => setValidationModalOpen(false)}
        onConfirm={handleConfirmValidation}
      />
    </div>
  );
}

