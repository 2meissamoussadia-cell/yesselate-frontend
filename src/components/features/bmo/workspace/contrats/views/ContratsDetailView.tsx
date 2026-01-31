'use client';

import { useState, useEffect } from 'react';
import { contratsApiService, type Contrat } from '@/lib/services/contratsApiService';
import { useContratsWorkspaceStore } from '@/lib/stores/contratsWorkspaceStore';
import {
  FileText, Building2, Calendar, Clock, DollarSign, User, Phone, Mail,
  CheckCircle, XCircle, AlertTriangle, MessageSquare, Download, History,
  ChevronRight, Edit, Send, Shield, ArrowUpRight
} from 'lucide-react';
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

export function ContratsDetailView({ tabId, data }: Props) {
  const { addDecision } = useContratsWorkspaceStore();
  const [contrat, setContrat] = useState<Contrat | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'info' | 'clauses' | 'documents' | 'historique'>('info');
  const [processing, setProcessing] = useState(false);

  const contratId = data.contratId as string;

  useEffect(() => {
    const load = async () => {
      if (!contratId) return;
      setLoading(true);
      try {
        const result = await contratsApiService.getById(contratId);
        setContrat(result || null);
      } catch (error) {
        console.error('Failed to load contrat:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [contratId]);

  const handleValidate = async () => {
    if (!contrat) return;
    setProcessing(true);
    try {
      const decision = await contratsApiService.validateContrat(
        contrat.id,
        'Validation accordée',
        'USR-001',
        'A. DIALLO',
        'Directeur Général'
      );
      addDecision(decision);
      alert('Contrat validé avec succès !');
    } catch (error) {
      console.error('Failed to validate:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!contrat) return;
    setProcessing(true);
    try {
      const decision = await contratsApiService.rejectContrat(
        contrat.id,
        'Conditions non acceptables',
        'USR-001',
        'A. DIALLO',
        'Directeur Général'
      );
      addDecision(decision);
      alert('Contrat rejeté');
    } catch (error) {
      console.error('Failed to reject:', error);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (!contrat) {
    return (
      <div className="text-center py-12 text-slate-400">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Contrat non trouvé</p>
      </div>
    );
  }

  const style = URGENCY_STYLES[contrat.urgency];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className={cn(
        "rounded-xl border-l-4 p-6",
        style.border,
        "bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm px-3 py-1 rounded bg-slate-100 dark:bg-slate-800">
                {contrat.reference}
              </span>
              <span className={cn("px-3 py-1 rounded text-sm font-medium", style.bg, style.text)}>
                {contrat.urgency.toUpperCase()}
              </span>
              <span className="text-sm text-slate-400">
                {contratsApiService.getTypeLabel(contrat.type)}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{contrat.title}</h1>
            <p className="text-slate-400 mt-1">{contrat.description}</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-purple-600 dark:text-purple-400">
              {contratsApiService.formatMontant(contrat.montant)} FCFA
            </p>
            <p className="text-sm text-slate-400 mt-1">Durée: {contrat.duree} mois</p>
          </div>
        </div>

        {/* Fournisseur */}
        <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Fournisseur</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{contrat.fournisseur.name}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-slate-400">
                <User className="w-4 h-4" />
                {contrat.fournisseur.contact}
              </span>
              <a href={`mailto:${contrat.fournisseur.email}`} className="flex items-center gap-1 text-purple-600 hover:underline">
                <Mail className="w-4 h-4" />
                {contrat.fournisseur.email}
              </a>
            </div>
          </div>
        </div>

        {/* Validations progress */}
        <div className="mt-4">
          <p className="text-xs text-slate-400 mb-2">Validations requises</p>
          <div className="flex items-center gap-2">
            {Object.entries(contrat.validations).map(([key, done]) => (
              <div
                key={key}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium",
                  done
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                )}
              >
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
          { id: 'clauses', label: 'Clauses', icon: Shield },
          { id: 'documents', label: 'Documents', icon: Download },
          { id: 'historique', label: 'Historique', icon: History },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as typeof activeSection)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeSection === id
                ? "border-purple-500 text-purple-600 dark:text-purple-400"
                : "border-transparent text-slate-400 hover:text-slate-700"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800 p-6">
        {activeSection === 'info' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-slate-400 mb-1">Bureau responsable</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{contrat.bureau}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Responsable</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">{contrat.responsible}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Date de réception</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(contrat.dateReception).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Date d'échéance validation</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(contrat.dateEcheance).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Date début contrat</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(contrat.dateDebut).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Date fin contrat</p>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(contrat.dateFin).toLocaleDateString('fr-FR')}
              </p>
            </div>

            {/* Conditions */}
            <div className="col-span-full">
              <p className="text-xs text-slate-400 mb-2">Conditions contractuelles</p>
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="text-xs text-slate-400">Paiement</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{contrat.conditions.paiement}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Livraison</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{contrat.conditions.livraison}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Garantie</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{contrat.conditions.garantie}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pénalités</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{contrat.conditions.penalites}</p>
                </div>
              </div>
            </div>

            {/* Risques */}
            {contrat.risques.length > 0 && (
              <div className="col-span-full">
                <p className="text-xs text-slate-400 mb-2">Risques identifiés</p>
                <div className="space-y-2">
                  {contrat.risques.map((risque, idx) => (
                    <div key={idx} className={cn(
                      "p-3 rounded-lg border-l-4",
                      risque.niveau === 'high' ? "bg-red-500/10 border-red-500" :
                      risque.niveau === 'medium' ? "bg-amber-500/10 border-amber-500" :
                      "bg-slate-50 dark:bg-slate-800/50 border-slate-400"
                    )}>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{risque.description}</p>
                      {risque.mitigation && (
                        <p className="text-xs text-slate-400 mt-1">Mitigation: {risque.mitigation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'clauses' && (
          <div className="space-y-3">
            {contrat.clauses.map((clause) => (
              <div
                key={clause.id}
                className={cn(
                  "p-4 rounded-lg border-l-4",
                  clause.status === 'ok' ? "bg-emerald-500/10 border-emerald-500" :
                  clause.status === 'warning' ? "bg-amber-500/10 border-amber-500" :
                  "bg-red-500/10 border-red-500"
                )}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{clause.title}</p>
                    <p className="text-sm text-slate-400 mt-1">{clause.content}</p>
                    {clause.comment && (
                      <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        {clause.comment}
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    clause.status === 'ok' ? "bg-emerald-500/20 text-emerald-600" :
                    clause.status === 'warning' ? "bg-amber-500/20 text-amber-600" :
                    "bg-red-500/20 text-red-600"
                  )}>
                    {clause.status === 'ok' ? 'Conforme' :
                     clause.status === 'warning' ? 'À surveiller' : 'Non conforme'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === 'documents' && (
          <div className="space-y-2">
            {contrat.documents.length === 0 ? (
              <p className="text-center py-8 text-slate-400">Aucun document attaché</p>
            ) : (
              contrat.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-8 h-8 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{doc.name}</p>
                      <p className="text-xs text-slate-400">
                        {(doc.size / 1024 / 1024).toFixed(1)} MB • {new Date(doc.uploadedAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Download className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeSection === 'historique' && (
          <div className="space-y-4">
            {contrat.historique.map((event, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="w-2 h-2 mt-2 rounded-full bg-purple-500" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{event.action}</p>
                  <p className="text-sm text-slate-400">{event.details}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Par {event.by} • {new Date(event.at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
        <button
          onClick={handleReject}
          disabled={processing}
          className="px-6 py-2.5 rounded-lg border border-red-500 text-red-600 font-medium hover:bg-red-500/10 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4 inline mr-2" />
          Rejeter
        </button>
        <button
          disabled={processing}
          className="px-6 py-2.5 rounded-lg border border-amber-500 text-amber-600 font-medium hover:bg-amber-500/10 disabled:opacity-50"
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          Négocier
        </button>
        <button
          onClick={handleValidate}
          disabled={processing}
          className="px-6 py-2.5 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          Valider
        </button>
      </div>
    </div>
  );
}

