'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, GitBranch, CheckCircle, XCircle, Clock, AlertTriangle,
  ArrowRight, Play, Pause, RefreshCw, FileText, User, Calendar
} from 'lucide-react';
import type { EnrichedBC } from '@/lib/types/document-validation.types';

interface WorkflowVisualModalProps {
  isOpen: boolean;
  onClose: () => void;
  bc: EnrichedBC;
  onAction?: (stepId: string, action: 'retry' | 'skip' | 'complete') => void;
}

interface WorkflowStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'skipped';
  completedAt?: string;
  completedBy?: string;
  duration?: number; // en minutes
  estimatedDuration?: number; // en minutes
  canRetry?: boolean;
  canSkip?: boolean;
  blockers?: string[];
}

export function WorkflowVisualModal({
  isOpen,
  onClose,
  bc,
  onAction,
}: WorkflowVisualModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  // Définir les étapes du workflow basées sur le statut du BC
  const workflowSteps = useMemo(() => {
    const steps: WorkflowStep[] = [];

    // Étape 1: Création BA
    steps.push({
      id: 'creation_ba',
      label: 'Création par Bureau Achat',
      status: 'completed',
      completedAt: bc.createdAt || bc.dateEmission,
      completedBy: bc.createdBy || 'BA',
      duration: 0,
      estimatedDuration: 30,
    });

    // Étape 2: Validation BA
    steps.push({
      id: 'validation_ba',
      label: 'Validation Bureau Achat',
      status: bc.status === 'draft_ba' ? 'in_progress' : 'completed',
      completedAt: bc.historique?.find(h => h.type === 'validation')?.date,
      completedBy: bc.historique?.find(h => h.type === 'validation')?.auteur,
      duration: 0,
      estimatedDuration: 60,
    });

    // Étape 3: Escalade BMO
    steps.push({
      id: 'escalade_bmo',
      label: 'Escalade vers BMO',
      status: bc.status === 'pending_bmo' || bc.status === 'audit_required' ? 'in_progress' : 
              ['validated', 'approved_bmo', 'rejected'].includes(bc.status) ? 'completed' : 'pending',
      completedAt: bc.historique?.find(h => h.type === 'escalade')?.date,
      completedBy: bc.historique?.find(h => h.type === 'escalade')?.auteur || 'BA',
      duration: 0,
      estimatedDuration: 0, // Instantané
    });

    // Étape 4: Audit (si requis)
    if (bc.status === 'audit_required' || bc.status === 'in_audit' || bc.auditReport) {
      steps.push({
        id: 'audit',
        label: 'Audit complet (loupe)',
        status: bc.status === 'audit_required' ? 'pending' :
                bc.status === 'in_audit' ? 'in_progress' :
                bc.auditReport ? 'completed' : 'pending',
        completedAt: bc.auditReport?.executedAt,
        completedBy: bc.auditReport?.executedBy || 'BMO',
        duration: 0,
        estimatedDuration: 120,
        blockers: bc.auditReport?.blocking ? ['Anomalies bloquantes détectées'] : undefined,
        canRetry: !bc.auditReport,
      });
    }

    // Étape 5: Décision BMO
    const decisionStatus = bc.decisionBMO ? 
      ((bc.decisionBMO as { decision?: string }).decision === 'approve' ? 'completed' : 'blocked') :
      (bc.status === 'validated' || bc.status === 'approved_bmo' ? 'completed' : 'pending');
    
    steps.push({
      id: 'decision_bmo',
      label: 'Décision BMO',
      status: decisionStatus,
completedAt: (bc.decisionBMO as { decisionDate?: string })?.decisionDate || 
                    bc.historique?.find(h => h.type === 'validation')?.date,
      completedBy: (bc.decisionBMO as { validatorName?: string })?.validatorName || 'BMO',
      duration: 0,
      estimatedDuration: 30,
      blockers: (bc.decisionBMO as { decision?: string })?.decision === 'reject' ? ['BC rejeté'] : undefined,
      canRetry: decisionStatus === 'blocked',
    });

    // Étape 6: Signature (si validé)
    if (bc.status === 'validated' || bc.status === 'approved_bmo' || (bc.decisionBMO as { decision?: string })?.decision === 'approve') {
      steps.push({
        id: 'signature',
        label: 'Signature',
        status: 'completed',
        completedAt: bc.historique?.find(h => h.type === 'validation')?.date,
        completedBy: 'BMO',
        duration: 0,
        estimatedDuration: 5,
      });
    }

    // Étape 7: Envoi fournisseur (si signé)
    if (bc.status === 'sent_supplier') {
      steps.push({
        id: 'envoi_fournisseur',
        label: 'Envoi au fournisseur',
        status: 'completed',
        completedAt: bc.historique?.find(h => h.action.includes('fournisseur'))?.date,
        completedBy: 'BA',
        duration: 0,
        estimatedDuration: 0,
      });
    }

    return steps;
  }, [bc]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const completed = workflowSteps.filter(s => s.status === 'completed').length;
    const inProgress = workflowSteps.filter(s => s.status === 'in_progress').length;
    const blocked = workflowSteps.filter(s => s.status === 'blocked').length;
    const pending = workflowSteps.filter(s => s.status === 'pending').length;
    
    // Calculer le temps total estimé vs réel
    const totalEstimated = workflowSteps.reduce((sum, s) => sum + (s.estimatedDuration || 0), 0);
    const completedSteps = workflowSteps.filter(s => s.status === 'completed');
    const totalActual = completedSteps.reduce((sum, s) => sum + (s.duration || 0), 0);
    
    // Prédire le délai restant
    const remainingSteps = workflowSteps.filter(s => s.status !== 'completed');
    const remainingEstimated = remainingSteps.reduce((sum, s) => sum + (s.estimatedDuration || 0), 0);
    
    return {
      completed,
      inProgress,
      blocked,
      pending,
      total: workflowSteps.length,
      progress: (completed / workflowSteps.length) * 100,
      totalEstimated,
      totalActual,
      remainingEstimated,
    };
  }, [workflowSteps]);

  // Trouver l'étape actuelle
  const currentStep = workflowSteps.find(s => s.status === 'in_progress') || 
                     workflowSteps.find(s => s.status === 'pending');

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2',
        'w-full max-w-5xl max-h-[90vh] z-50',
        'rounded-xl shadow-2xl overflow-hidden',
        darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'
      )}>
        {/* Header */}
        <div className={cn(
          'p-6 border-b',
          darkMode ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-slate-700' : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-gray-200'
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'p-2 rounded-lg',
                  darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'
                )}>
                  <GitBranch className={cn('w-6 h-6', darkMode ? 'text-indigo-400' : 'text-indigo-600')} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Workflow de Validation</h2>
                  <p className="text-sm text-slate-400 mt-1">BC {bc.id}</p>
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className={cn('text-xs', darkMode ? 'text-slate-400' : 'text-gray-600')}>
                    Progression
                  </div>
                  <div className="flex-1 w-32 h-2 bg-slate-700/30 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full transition-all', darkMode ? 'bg-indigo-500' : 'bg-indigo-600')}
                      style={{ width: `${stats.progress}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold">{Math.round(stats.progress)}%</div>
                </div>
                <Badge variant={stats.blocked > 0 ? 'urgent' : stats.inProgress > 0 ? 'warning' : 'success'} className="text-xs">
                  {stats.completed}/{stats.total} étapes
                </Badge>
                {currentStep && (
                  <Badge variant="info" className="text-xs">
                    En cours: {currentStep.label}
                  </Badge>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-colors',
                darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {/* Timeline */}
          <div className="relative">
            {/* Ligne verticale */}
            <div className={cn(
              'absolute left-6 top-0 bottom-0 w-0.5',
              darkMode ? 'bg-slate-700' : 'bg-gray-300'
            )} />

            {/* Étapes */}
            <div className="space-y-8">
              {workflowSteps.map((step, idx) => {
                const isActive = step.id === selectedStep;
                const stepStatus = step.status;

                return (
                  <div
                    key={step.id}
                    className={cn(
                      'relative flex items-start gap-4 cursor-pointer transition-all',
                      isActive && 'scale-105'
                    )}
                    onClick={() => setSelectedStep(isActive ? null : step.id)}
                  >
                    {/* Point sur la timeline */}
                    <div className={cn(
                      'relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                      stepStatus === 'completed' && 'bg-emerald-500 border-emerald-500',
                      stepStatus === 'in_progress' && 'bg-blue-500 border-blue-500 animate-pulse',
                      stepStatus === 'blocked' && 'bg-red-500 border-red-500',
                      stepStatus === 'pending' && darkMode ? 'bg-slate-700 border-slate-600' : 'bg-gray-300 border-gray-400',
                      stepStatus === 'skipped' && 'bg-slate-600 border-slate-500',
                      isActive && 'ring-4 ring-blue-400/50'
                    )}>
                      {stepStatus === 'completed' && <CheckCircle className="w-6 h-6 text-white" />}
                      {stepStatus === 'in_progress' && <Clock className="w-6 h-6 text-white" />}
                      {stepStatus === 'blocked' && <XCircle className="w-6 h-6 text-white" />}
                      {stepStatus === 'pending' && <div className={cn('w-4 h-4 rounded-full', darkMode ? 'bg-slate-500' : 'bg-gray-400')} />}
                      {stepStatus === 'skipped' && <Pause className="w-4 h-4 text-white" />}
                    </div>

                    {/* Contenu de l'étape */}
                    <Card className={cn(
                      'flex-1 transition-all',
                      isActive && 'ring-2 ring-blue-400',
                      stepStatus === 'blocked' && 'border-red-500/50 bg-red-500/5',
                      stepStatus === 'in_progress' && 'border-blue-500/50 bg-blue-500/5',
                      stepStatus === 'completed' && 'border-emerald-500/50 bg-emerald-500/5'
                    )}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base flex items-center gap-2">
                              {step.label}
                              {step.blockers && step.blockers.length > 0 && (
                                <Badge variant="urgent" className="text-xs">
                                  Bloqué
                                </Badge>
                              )}
                            </CardTitle>
                            <div className="flex gap-2 mt-2 text-xs">
                              {step.completedAt && (
                                <div className={cn('flex items-center gap-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                                  <Calendar className="w-3 h-3" />
                                  {new Date(step.completedAt).toLocaleDateString('fr-FR')}
                                </div>
                              )}
                              {step.completedBy && (
                                <div className={cn('flex items-center gap-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                                  <User className="w-3 h-3" />
                                  {step.completedBy}
                                </div>
                              )}
                              {step.estimatedDuration && step.estimatedDuration > 0 && (
                                <div className={cn('flex items-center gap-1', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                                  <Clock className="w-3 h-3" />
                                  {step.estimatedDuration} min
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant={
                              stepStatus === 'completed' ? 'success' :
                              stepStatus === 'in_progress' ? 'info' :
                              stepStatus === 'blocked' ? 'urgent' :
                              stepStatus === 'skipped' ? 'default' :
                              'default'
                            }
                            className="text-xs"
                          >
                            {stepStatus === 'completed' && 'Terminé'}
                            {stepStatus === 'in_progress' && 'En cours'}
                            {stepStatus === 'blocked' && 'Bloqué'}
                            {stepStatus === 'pending' && 'En attente'}
                            {stepStatus === 'skipped' && 'Ignoré'}
                          </Badge>
                        </div>
                      </CardHeader>
                      {(isActive || step.blockers) && (
                        <CardContent>
                          {step.blockers && step.blockers.length > 0 && (
                            <div className={cn(
                              'p-3 rounded-lg mb-3',
                              darkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-50 border border-red-200'
                            )}>
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-semibold text-red-400">Blocages</span>
                              </div>
                              <ul className="space-y-1 text-xs">
                                {step.blockers.map((blocker, idx) => (
                                  <li key={idx} className={cn(darkMode ? 'text-white/80' : 'text-gray-700')}>
                                    • {blocker}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {step.canRetry && onAction && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  onAction(step.id, 'retry');
                                  addToast(`Relance de l'étape: ${step.label}`, 'info');
                                }}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Relancer
                              </Button>
                              {step.canSkip && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    onAction(step.id, 'skip');
                                    addToast(`Étape ignorée: ${step.label}`, 'warning');
                                  }}
                                >
                                  Ignorer
                                </Button>
                              )}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Statistiques */}
          <Card className={cn('mt-6', darkMode ? 'bg-slate-800/50' : 'bg-gray-50')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Statistiques du Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className={cn('text-xs', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                    Temps estimé restant
                  </div>
                  <div className={cn('font-bold mt-1', darkMode ? 'text-white' : 'text-gray-900')}>
                    ~{Math.ceil(stats.remainingEstimated / 60)}h {stats.remainingEstimated % 60}min
                  </div>
                </div>
                <div>
                  <div className={cn('text-xs', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                    Temps total estimé
                  </div>
                  <div className={cn('font-bold mt-1', darkMode ? 'text-white' : 'text-gray-900')}>
                    ~{Math.ceil(stats.totalEstimated / 60)}h {stats.totalEstimated % 60}min
                  </div>
                </div>
                <div>
                  <div className={cn('text-xs', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                    Étape actuelle
                  </div>
                  <div className={cn('font-bold mt-1', darkMode ? 'text-white' : 'text-gray-900')}>
                    {currentStep?.label || 'Terminé'}
                  </div>
                </div>
                <div>
                  <div className={cn('text-xs', darkMode ? 'text-slate-400' : 'text-gray-500')}>
                    Progression
                  </div>
                  <div className={cn('font-bold mt-1', darkMode ? 'text-white' : 'text-gray-900')}>
                    {stats.completed}/{stats.total}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className={cn(
          'p-4 border-t flex items-center justify-between',
          darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
        )}>
          <div className="text-xs text-slate-400">
            Workflow automatique • Dernière mise à jour: {new Date().toLocaleString('fr-FR')}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </>
  );
}

