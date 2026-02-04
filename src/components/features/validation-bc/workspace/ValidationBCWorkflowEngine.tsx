'use client';

import { useState, useEffect, useCallback } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/cn';
import {
  Workflow,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  User,
  Calendar,
  RefreshCw,
  FileText,
  Shield,
} from 'lucide-react';

// ============================================
// Types
// ============================================
interface WorkflowStep {
  order: number;
  name: string;
  role: string;
  required: boolean;
  slaHours: number;
  conditions: { type: string; value: number }[];
  status?: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'skipped';
  completedAt?: string;
  completedBy?: string;
  comment?: string;
}

interface WorkflowConfig {
  documentType: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

interface DocumentWorkflow {
  documentId: string;
  documentType: string;
  currentStep: number;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  documentId?: string;
  documentType?: 'bc' | 'facture' | 'avenant';
}

// ============================================
// Component
// ============================================
export function ValidationBCWorkflowEngine({ open, onClose, documentId, documentType = 'bc' }: Props) {
  const [workflow, setWorkflow] = useState<WorkflowConfig | null>(null);
  const [documentWorkflow, setDocumentWorkflow] = useState<DocumentWorkflow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Charger la configuration du workflow
  const loadWorkflow = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/validation-bc/workflow?type=${documentType}`);
      if (!res.ok) throw new Error('Erreur chargement workflow');
      
      const data = await res.json();
      setWorkflow(data.data);

      // Si un document est spécifié, simuler son état dans le workflow
      if (documentId) {
        setDocumentWorkflow({
          documentId,
          documentType,
          currentStep: 2,
          status: 'in_progress',
          steps: data.data.steps.map((step: WorkflowStep, index: number) => ({
            ...step,
            status: index < 2 ? 'completed' : index === 2 ? 'in_progress' : 'pending',
            completedAt: index < 2 ? new Date(Date.now() - (2 - index) * 86400000).toISOString() : undefined,
            completedBy: index < 2 ? 'Jean DUPONT' : undefined,
          })),
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      setError('Impossible de charger le workflow');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [documentType, documentId]);

  useEffect(() => {
    if (open) {
      loadWorkflow();
    }
  }, [open, loadWorkflow]);

  // Actions sur le workflow
  const handleAction = useCallback(async (action: 'approve' | 'reject' | 'request_info') => {
    if (!documentId) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/validation-bc/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          action,
          stepId: documentWorkflow?.currentStep,
          decision: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'info_requested',
        }),
      });

      if (!res.ok) throw new Error('Erreur action workflow');

      // Recharger le workflow
      await loadWorkflow();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  }, [documentId, documentWorkflow, loadWorkflow]);

  const getStepIcon = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
      case 'skipped':
        return <ChevronRight className="w-5 h-5 text-slate-400" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600" />;
    }
  };

  const getStepBorderColor = (step: WorkflowStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-900/20';
      case 'rejected':
        return 'border-rose-500/50 bg-rose-50/50 dark:bg-rose-900/20';
      case 'in_progress':
        return 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-900/20';
      default:
        return 'border-slate-200/70 dark:border-slate-700';
    }
  };

  return (
    <FluentModal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 text-purple-500" />
          <span>Workflow de validation</span>
          {documentId && (
            <span className="text-sm font-mono text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">
              {documentId}
            </span>
          )}
        </div>
      }
      onClose={onClose}
    >
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-rose-500">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
            <div>{error}</div>
            <FluentButton size="sm" variant="secondary" onClick={loadWorkflow} className="mt-4">
              Réessayer
            </FluentButton>
          </div>
        ) : workflow ? (
          <>
            {/* En-tête du workflow */}
            <div className="p-4 rounded-xl border border-purple-200/50 bg-purple-50/30 dark:border-purple-800/30 dark:bg-purple-950/20">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-purple-700 dark:text-purple-300">{workflow.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{workflow.description}</p>
                </div>
              </div>
            </div>

            {/* Étapes du workflow */}
            <div className="relative space-y-3 pl-4">
              {/* Ligne verticale */}
              <div className="absolute left-[1.35rem] top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700" />

              {(documentWorkflow?.steps || workflow.steps).map((step, index) => (
                <div
                  key={step.order}
                  className={cn(
                    "relative pl-8 p-3 rounded-xl border transition-all",
                    getStepBorderColor(step)
                  )}
                >
                  {/* Icône de l'étape */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white dark:bg-[#1f1f1f] p-1 rounded-full">
                    {getStepIcon(step)}
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{step.name}</span>
                        {step.required && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                            Requis
                          </span>
                        )}
                        {step.conditions.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            Conditionnel
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {step.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          SLA: {step.slaHours}h
                        </span>
                      </div>
                      {step.completedAt && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            Validé par {step.completedBy} le {new Date(step.completedAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-none text-xs text-slate-400">
                      Étape {step.order}
                    </div>
                  </div>

                  {/* Boutons d'action pour l'étape en cours */}
                  {step.status === 'in_progress' && documentId && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                      <FluentButton
                        size="xs"
                        variant="success"
                        onClick={() => handleAction('approve')}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        Valider
                      </FluentButton>
                      <FluentButton
                        size="xs"
                        variant="destructive"
                        onClick={() => handleAction('reject')}
                        disabled={actionLoading}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Rejeter
                      </FluentButton>
                      <FluentButton
                        size="xs"
                        variant="warning"
                        onClick={() => handleAction('request_info')}
                        disabled={actionLoading}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        Demander info
                      </FluentButton>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Légende */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Validé</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>En cours</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300" />
                <span>En attente</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
                <span>Rejeté</span>
              </div>
            </div>
          </>
        ) : null}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <FluentButton size="sm" variant="secondary" onClick={onClose}>
            Fermer
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

export default ValidationBCWorkflowEngine;

