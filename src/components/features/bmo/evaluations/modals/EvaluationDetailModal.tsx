/**
 * EvaluationDetailModal - Modal Overlay Moderne pour Évaluations
 * 
 * Pattern unifié avec navigation prev/next, tabs, et actions contextuelles
 * Préserve le contexte (liste visible en arrière-plan)
 */

'use client';

import React, { useMemo } from 'react';
import { GenericDetailModal, type TabConfig, type ActionButton } from '@/components/ui/GenericDetailModal';
import {
  ClipboardCheck,
  FileText,
  TrendingUp,
  History,
  Paperclip,
  MessageSquare,
  User,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Download,
  Edit,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import type { Evaluation, EvaluationStatus } from '@/lib/types/bmo.types';
import { BureauTag } from '@/components/features/bmo/BureauTag';

interface EvaluationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: Evaluation | null;
  onValidateRecommendation?: (evalId: string, recId: string) => void;
  onDownloadCR?: (evalId: string) => void;
  onEdit?: (evaluation: Evaluation) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  darkMode?: boolean;
}

// ================================
// Helpers
// ================================

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 75) return 'text-blue-400';
  if (score >= 60) return 'text-amber-400';
  return 'text-red-400';
};

const getScoreBg = (score: number) => {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-blue-500';
  if (score >= 60) return 'bg-amber-500';
  return 'bg-red-500';
};

const getStatusBadge = (status: EvaluationStatus) => {
  const statusMap = {
    completed: { label: 'Complétée', variant: 'success' as const },
    in_progress: { label: 'En cours', variant: 'warning' as const },
    scheduled: { label: 'Planifiée', variant: 'info' as const },
    cancelled: { label: 'Annulée', variant: 'default' as const },
  };
  return statusMap[status] || statusMap.completed;
};

const recommendationTypes: Record<string, { icon: string; color: string }> = {
  formation: { icon: '🎓', color: 'text-blue-400' },
  promotion: { icon: '📈', color: 'text-emerald-400' },
  augmentation: { icon: '💰', color: 'text-amber-400' },
  recadrage: { icon: '⚠️', color: 'text-red-400' },
  mutation: { icon: '🔄', color: 'text-purple-400' },
  autre: { icon: '📋', color: 'text-slate-400' },
};

// ================================
// Composant Principal
// ================================

export function EvaluationDetailModal({
  isOpen,
  onClose,
  evaluation,
  onValidateRecommendation,
  onDownloadCR,
  onEdit,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
  darkMode = false,
}: EvaluationDetailModalProps) {
  // Tabs configuration
  const tabs: TabConfig[] = useMemo(() => {
    if (!evaluation) return [];

    const tabsConfig: TabConfig[] = [
      {
        id: 'details',
        label: 'Détails',
        icon: <FileText className="w-4 h-4" />,
        content: (
          <div className="space-y-6">
            {/* Informations principales */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Informations principales
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Employé
                  </label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">{evaluation.employeeName}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{evaluation.employeeRole}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Évaluateur
                  </label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">{evaluation.evaluatorName}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Bureau
                  </label>
                  <BureauTag bureau={evaluation.bureau} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Période
                  </label>
                  <Badge variant="default">{evaluation.period}</Badge>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Date
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">{evaluation.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score global */}
            {evaluation.status === 'completed' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Score global
                </h3>
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-center">
                  <p className={cn('text-5xl font-bold mb-2', getScoreColor(evaluation.scoreGlobal || 0))}>
                    {evaluation.scoreGlobal}/100
                  </p>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden mt-2">
                    <div
                      className={cn('h-full transition-all', getScoreBg(evaluation.scoreGlobal || 0))}
                      style={{ width: `${evaluation.scoreGlobal || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Critères */}
            {evaluation.status === 'completed' && evaluation.criteria && evaluation.criteria.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Critères détaillés
                </h3>
                <div className="space-y-3">
                  {evaluation.criteria.map((crit) => (
                    <div
                      key={crit.id}
                      className={cn('p-3 rounded-lg border', darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200')}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{crit.name}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{crit.score}/5</span>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className={cn(
                              'h-2 flex-1 rounded',
                              n <= crit.score ? getScoreBg(crit.score * 20) : 'bg-slate-300 dark:bg-slate-600'
                            )}
                          />
                        ))}
                      </div>
                      {crit.comment && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{crit.comment}</p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Poids: {crit.weight}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Points forts et améliorations */}
            {evaluation.status === 'completed' && (
              <div className="grid grid-cols-2 gap-4">
                {evaluation.strengths && evaluation.strengths.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
                      ✅ Points forts
                    </h3>
                    <div className={cn('p-3 rounded-lg', darkMode ? 'bg-emerald-500/10' : 'bg-emerald-50')}>
                      <ul className="space-y-1.5">
                        {evaluation.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                            • {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {evaluation.improvements && evaluation.improvements.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-2">
                      📈 À améliorer
                    </h3>
                    <div className={cn('p-3 rounded-lg', darkMode ? 'bg-amber-500/10' : 'bg-amber-50')}>
                      <ul className="space-y-1.5">
                        {evaluation.improvements.map((improvement, idx) => (
                          <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                            • {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Commentaire employé */}
            {evaluation.employeeComment && (
              <div className={cn('p-4 rounded-lg border', 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30')}>
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">
                  💬 Commentaire employé
                </h3>
                <p className="text-sm italic text-gray-700 dark:text-gray-300">"{evaluation.employeeComment}"</p>
              </div>
            )}

            {/* Traçabilité */}
            {evaluation.hash && (
              <div className={cn('p-3 rounded-lg border', darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200')}>
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">🔐 Traçabilité</h3>
                <p className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">{evaluation.hash}</p>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'recommendations',
        label: 'Recommandations',
        icon: <TrendingUp className="w-4 h-4" />,
        badge: evaluation.recommendations?.length || 0,
        content: (
          <div className="space-y-4">
            {evaluation.recommendations && evaluation.recommendations.length > 0 ? (
              evaluation.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={cn(
                    'p-4 rounded-lg border',
                    rec.status === 'pending'
                      ? 'border-amber-500/50 bg-amber-500/10 dark:bg-amber-500/20'
                      : rec.status === 'approved'
                      ? 'border-blue-500/50 bg-blue-500/10 dark:bg-blue-500/20'
                      : rec.status === 'implemented'
                      ? 'border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-500/20'
                      : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{recommendationTypes[rec.type]?.icon || '📌'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                        <Badge
                          variant={
                            rec.status === 'implemented'
                              ? 'success'
                              : rec.status === 'approved'
                              ? 'info'
                              : rec.status === 'rejected'
                              ? 'default'
                              : 'warning'
                          }
                        >
                          {rec.status === 'pending'
                            ? 'En attente'
                            : rec.status === 'approved'
                            ? 'Approuvée'
                            : rec.status === 'implemented'
                            ? 'Implémentée'
                            : 'Rejetée'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {rec.status === 'pending' && onValidateRecommendation && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onValidateRecommendation(evaluation.id, rec.id)}
                            className="h-8"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                            Valider
                          </Button>
                        )}
                        {rec.approvedBy && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Approuvée par {rec.approvedBy}
                            {rec.approvedAt && ` le ${rec.approvedAt}`}
                          </span>
                        )}
                        {rec.implementedAt && (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400">
                            Implémentée le {rec.implementedAt}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune recommandation</p>
              </div>
            )}
          </div>
        ),
      },
    ];

    // Documents tab (if available)
    if (evaluation.documents && evaluation.documents.length > 0) {
      tabsConfig.push({
        id: 'documents',
        label: 'Documents',
        icon: <Paperclip className="w-4 h-4" />,
        badge: evaluation.documents.length,
        content: (
          <div className="space-y-3">
            {evaluation.documents.map((doc) => (
              <div
                key={doc.id}
                className={cn(
                  'p-3 rounded-lg border flex items-center justify-between',
                  darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                )}
              >
                <div className="flex items-center gap-3">
                  <Paperclip className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {doc.type === 'compte_rendu' ? 'Compte-rendu' : doc.type === 'objectifs' ? 'Objectifs' : 'Autre'} • {doc.date}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="default">
                  <Download className="w-4 h-4 mr-1.5" />
                  Télécharger
                </Button>
              </div>
            ))}
          </div>
        ),
      });
    }

    return tabsConfig;
  }, [evaluation, darkMode, onValidateRecommendation]);

  // Actions
  const actions: ActionButton[] = useMemo(() => {
    if (!evaluation) return [];

    const acts: ActionButton[] = [];

    if (onDownloadCR) {
      acts.push({
        id: 'download',
        label: 'Télécharger CR',
        icon: <Download className="w-4 h-4" />,
        variant: 'outline',
        onClick: () => onDownloadCR(evaluation.id),
      });
    }

    if (onEdit) {
      acts.push({
        id: 'edit',
        label: 'Modifier',
        icon: <Edit className="w-4 h-4" />,
        variant: 'default',
        onClick: () => onEdit(evaluation),
      });
    }

    return acts;
  }, [evaluation, onDownloadCR, onEdit]);

  if (!evaluation) return null;

  const statusBadge = getStatusBadge(evaluation.status);

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={evaluation.employeeName}
      subtitle={evaluation.employeeRole}
      statusBadge={statusBadge}
      tabs={tabs}
      defaultActiveTab="details"
      actions={actions}
      onPrevious={onPrevious}
      onNext={onNext}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      size="lg"
    />
  );
}

export default EvaluationDetailModal;

