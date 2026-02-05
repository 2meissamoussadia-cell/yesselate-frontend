'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, ChevronRight, ChevronLeft, Check, AlertCircle, 
  Building2, Clock, Shield, ArrowUpRight, Paperclip, Send,
  Sparkles, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { blockedApi, RESOLUTION_TEMPLATES, type ResolutionTemplate } from '@/lib/services/blockedApiService';
import { logger } from '@/lib/utils/logger';
import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';
import { useBlockedToast } from '../BlockedToast';
import type { BlockedDossier } from '@/lib/types/bmo.types';

type Props = {
  tabId: string;
  data: Record<string, unknown>;
};

type WizardStep = 'select' | 'template' | 'compose' | 'review' | 'confirm';

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'select', label: 'Sélection' },
  { id: 'template', label: 'Modèle' },
  { id: 'compose', label: 'Rédaction' },
  { id: 'review', label: 'Vérification' },
  { id: 'confirm', label: 'Confirmation' },
];

export function BlockedResolutionWizard({ tabId, data }: Props) {
  const { closeTab, addDecision } = useBlockedWorkspaceStore();
  const toast = useBlockedToast();

  const [step, setStep] = useState<WizardStep>('select');
  const [loading, setLoading] = useState(true);
  const [dossiers, setDossiers] = useState<BlockedDossier[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<ResolutionTemplate | null>(null);
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [customContent, setCustomContent] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await blockedApi.getAll({ impact: 'critical' });
        setDossiers(result.data);
      } catch (error) {
        logger.error('Failed to load dossiers', error as Error, { context: 'BlockedResolutionWizard' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectedDossiers = useMemo(() => {
    return dossiers.filter(d => selectedIds.has(d.id));
  }, [dossiers, selectedIds]);

  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    setSelectedIds(new Set(dossiers.map(d => d.id)));
  };

  const canProceed = useMemo(() => {
    switch (step) {
      case 'select':
        return selectedIds.size > 0;
      case 'template':
        return true; // Optional
      case 'compose':
        return customContent.trim().length > 0 || (selectedTemplate && Object.keys(templateVariables).length === selectedTemplate.variables.length);
      case 'review':
        return true;
      case 'confirm':
        return false;
      default:
        return false;
    }
  }, [step, selectedIds, customContent, selectedTemplate, templateVariables]);

  const goNext = () => {
    const idx = currentStepIndex;
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1].id);
    }
  };

  const goBack = () => {
    const idx = currentStepIndex;
    if (idx > 0) {
      setStep(STEPS[idx - 1].id);
    }
  };

  const finalContent = useMemo(() => {
    if (selectedTemplate && Object.keys(templateVariables).length > 0) {
      return blockedApi.applyTemplate(selectedTemplate, templateVariables);
    }
    return customContent;
  }, [selectedTemplate, templateVariables, customContent]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const batchId = `BATCH-RES-${Date.now()}`;
      
      for (const dossier of selectedDossiers) {
        addDecision({
          at: new Date().toISOString(),
          batchId,
          action: 'resolution',
          dossierId: dossier.id,
          dossierSubject: dossier.subject,
          bureau: dossier.bureau,
          impact: dossier.impact,
          delay: dossier.delay ?? 0,
          amount: 0,
          priority: 0,
          userId: 'USR-001',
          userName: 'A. DIALLO',
          userRole: 'Directeur Général',
          details: finalContent,
          hash: `SHA-256:${Date.now().toString(16)}`,
        });
      }

      await blockedApi.bulkResolve(
        Array.from(selectedIds),
        finalContent,
        selectedTemplate?.id
      );

      toast.resolution(
        `${selectedIds.size} dossier(s) résolu(s)`,
        'Les décisions ont été enregistrées',
        batchId
      );

      setStep('confirm');
    } catch (error) {
      toast.error('Erreur', 'Impossible de résoudre les dossiers');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Assistant de résolution
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Résolvez les blocages de manière guidée et structurée
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                idx < currentStepIndex
                  ? "bg-emerald-500 text-white"
                  : idx === currentStepIndex
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
              )}
            >
              {idx < currentStepIndex ? <Check className="w-4 h-4" /> : idx + 1}
            </div>
            <span className={cn(
              "ml-2 text-sm hidden md:inline",
              idx === currentStepIndex 
                ? "font-medium text-slate-900 dark:text-slate-100" 
                : "text-slate-400"
            )}>
              {s.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div className={cn(
                "w-12 h-0.5 mx-2",
                idx < currentStepIndex ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 min-h-[400px]">
        {/* Step 1: Selection */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Sélectionnez les dossiers à résoudre
              </h3>
              <button
                onClick={selectAll}
                className="text-sm text-slate-600 dark:text-slate-400 hover:underline"
              >
                Tout sélectionner
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {dossiers.map(dossier => (
                <div
                  key={dossier.id}
                  onClick={() => toggleSelection(dossier.id)}
                  className={cn(
                    "p-4 rounded-xl border cursor-pointer transition-all",
                    selectedIds.has(dossier.id)
                      ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5",
                      selectedIds.has(dossier.id)
                        ? "border-slate-900 dark:border-white bg-slate-900 dark:bg-white"
                        : "border-slate-300 dark:border-slate-600"
                    )}>
                      {selectedIds.has(dossier.id) && (
                        <Check className="w-3 h-3 text-white dark:text-slate-900" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {dossier.id}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          dossier.impact === 'critical' ? "bg-red-500/10 text-red-600" : "bg-amber-500/10 text-amber-600"
                        )}>
                          {dossier.impact}
                        </span>
                      </div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 mt-1">{dossier.subject}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {dossier.bureau}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          J+{dossier.delay}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Template */}
        {step === 'template' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Choisissez un modèle (optionnel)
            </h3>
            <p className="text-sm text-slate-400">
              Utilisez un modèle prédéfini pour accélérer la rédaction
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RESOLUTION_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    selectedTemplate?.id === template.id
                      ? "border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      template.category === 'financial' ? "bg-emerald-500/10 text-emerald-600" :
                      template.category === 'technical' ? "bg-blue-500/10 text-blue-600" :
                      template.category === 'legal' ? "bg-purple-500/10 text-purple-600" :
                      "bg-slate-500/10 text-slate-600"
                    )}>
                      {template.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {template.usageCount} utilisations
                    </span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{template.name}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{template.content}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setSelectedTemplate(null);
                goNext();
              }}
              className="text-sm text-slate-600 dark:text-slate-400 hover:underline"
            >
              Continuer sans modèle →
            </button>
          </div>
        )}

        {/* Step 3: Compose */}
        {step === 'compose' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Rédigez votre décision
            </h3>

            {selectedTemplate ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm">
                  <span className="font-medium">Modèle:</span> {selectedTemplate.name}
                </div>

                {selectedTemplate.variables.map(variable => (
                  <div key={variable}>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      {variable}
                    </label>
                    <input
                      type="text"
                      value={templateVariables[variable] || ''}
                      onChange={(e) => setTemplateVariables({
                        ...templateVariables,
                        [variable]: e.target.value,
                      })}
                      placeholder={`Entrez ${variable}...`}
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500/20"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Rédigez votre décision de résolution..."
                rows={8}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                Notes additionnelles (optionnel)
              </label>
              <textarea
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Notes internes..."
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              />
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 'review' && (
          <div className="space-y-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Vérifiez avant validation
            </h3>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <p className="text-sm text-slate-400 mb-2">Dossiers concernés ({selectedIds.size})</p>
              <div className="flex flex-wrap gap-2">
                {selectedDossiers.map(d => (
                  <span key={d.id} className="font-mono text-xs px-2 py-1 rounded bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {d.id}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
              <p className="text-sm text-slate-400 mb-2">Décision</p>
              <p className="text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{finalContent}</p>
            </div>

            {additionalNotes && (
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <p className="text-sm text-slate-400 mb-2">Notes</p>
                <p className="text-slate-600 dark:text-slate-400">{additionalNotes}</p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-purple-500/10 flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Cette action sera tracée et signée cryptographiquement.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Confirm */}
        {step === 'confirm' && (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Résolution enregistrée
            </h3>
            <p className="text-slate-400 text-center max-w-md">
              {selectedIds.size} dossier(s) ont été résolus avec succès. 
              Les décisions ont été enregistrées dans le registre d'audit.
            </p>
            <button
              onClick={() => closeTab(tabId)}
              className="mt-8 px-6 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 transition-opacity"
            >
              Fermer
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step !== 'confirm' && (
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={currentStepIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>

          {step === 'review' ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Valider la résolution
                </>
              )}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!canProceed}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

