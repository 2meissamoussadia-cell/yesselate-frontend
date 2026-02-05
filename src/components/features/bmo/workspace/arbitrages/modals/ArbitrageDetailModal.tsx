'use client';

/**
 * ArbitrageDetailModal - Modal Overlay Moderne pour Arbitrages
 * 
 * Pattern unifié avec navigation prev/next, tabs, et actions contextuelles
 * Préserve le contexte (liste visible en arrière-plan)
 */

import React, { useMemo } from 'react';
import { GenericDetailModal, type TabConfig, type ActionButton } from '@/components/ui/GenericDetailModal';
import {
  Scale,
  FileText,
  GitBranch,
  History,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Building2,
  DollarSign,
  Calendar,
  Target,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

// ================================
// Types
// ================================

export interface Arbitrage {
  id: string;
  title: string;
  description?: string;
  category: 'budget' | 'ressources' | 'planning' | 'goulot' | 'conflit' | 'autre';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  bureau?: string;
  deadline?: string | Date;
  createdAt: string | Date;
  resolvedAt?: string | Date;
  createdBy?: {
    id: string;
    name: string;
    bureau?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    bureau?: string;
  };
  projet?: {
    id: string;
    nom: string;
  };
  impact?: {
    niveau: 'majeur' | 'moyen' | 'mineur';
    description: string;
  };
  resolution?: {
    decision: string;
    resolvedBy: string;
    resolvedAt: string | Date;
    notes?: string;
  };
  escalade?: {
    escalatedTo: string;
    escalatedAt: string | Date;
    reason: string;
  };
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
  }>;
  comments?: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: string | Date;
  }>;
  history?: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string | Date;
    details?: string;
  }>;
}

interface ArbitrageDetailModalProps {
  arbitrage: Arbitrage | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onResolve?: (id: string, decision: string, notes?: string) => Promise<void>;
  onEscalate?: (id: string, to: string, reason: string) => Promise<void>;
  onAssign?: (id: string, userId: string) => Promise<void>;
}

// ================================
// Composant Principal
// ================================

export function ArbitrageDetailModal({
  arbitrage,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
  onResolve,
  onEscalate,
  onAssign,
}: ArbitrageDetailModalProps) {
  const tabs = useMemo<TabConfig[]>(() => {
    if (!arbitrage) return [];

    return [
      {
        id: 'details',
        label: 'Détails',
        icon: <FileText className="w-4 h-4" />,
        content: <DetailsTab arbitrage={arbitrage} />,
      },
      {
        id: 'workflow',
        label: 'Workflow',
        icon: <GitBranch className="w-4 h-4" />,
        content: <WorkflowTab arbitrage={arbitrage} />,
      },
      {
        id: 'documents',
        label: 'Documents',
        icon: <FileText className="w-4 h-4" />,
        badge: arbitrage.documents?.length || 0,
        content: <DocumentsTab arbitrage={arbitrage} />,
      },
      {
        id: 'comments',
        label: 'Commentaires',
        icon: <MessageSquare className="w-4 h-4" />,
        badge: arbitrage.comments?.length || 0,
        content: <CommentsTab arbitrage={arbitrage} />,
      },
      {
        id: 'history',
        label: 'Historique',
        icon: <History className="w-4 h-4" />,
        badge: arbitrage.history?.length || 0,
        content: <HistoryTab arbitrage={arbitrage} />,
      },
    ];
  }, [arbitrage]);

  const actions = useMemo<ActionButton[]>(() => {
    if (!arbitrage) return [];

    const actionButtons: ActionButton[] = [];

    if (arbitrage.status === 'pending' || arbitrage.status === 'in_progress') {
      actionButtons.push({
        id: 'resolve',
        label: 'Résoudre',
        icon: <CheckCircle className="w-4 h-4" />,
        variant: 'default',
        onClick: async () => {
          if (onResolve) {
            await onResolve(arbitrage.id, 'Résolu', 'Arbitrage résolu via modal');
          }
        },
      });

      actionButtons.push({
        id: 'escalate',
        label: 'Escalader',
        icon: <AlertTriangle className="w-4 h-4" />,
        variant: 'outline',
        onClick: async () => {
          if (onEscalate) {
            await onEscalate(arbitrage.id, 'DG', 'Escalade nécessaire');
          }
        },
      });
    }

    return actionButtons;
  }, [arbitrage, onResolve, onEscalate]);

  const statusBadge = useMemo(() => {
    if (!arbitrage) return undefined;

    const statusMap = {
      pending: { label: 'En attente', variant: 'warning' as const },
      in_progress: { label: 'En cours', variant: 'info' as const },
      resolved: { label: 'Résolu', variant: 'success' as const },
      escalated: { label: 'Escaladé', variant: 'critical' as const },
    };

    return statusMap[arbitrage.status];
  }, [arbitrage]);

  if (!arbitrage) return null;

  const categoryLabels: Record<string, string> = {
    budget: 'Budgétaire',
    ressources: 'Ressources',
    planning: 'Planning',
    goulot: 'Goulot d\'étranglement',
    conflit: 'Conflit',
    autre: 'Autre',
  };

  const priorityLabels: Record<string, string> = {
    critical: 'Critique',
    high: 'Élevée',
    medium: 'Normale',
    low: 'Basse',
  };

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={arbitrage.title}
      subtitle={`ARB-${arbitrage.id}`}
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

// ================================
// Tabs Components
// ================================

function DetailsTab({ arbitrage }: { arbitrage: Arbitrage }) {
  const categoryLabels: Record<string, string> = {
    budget: 'Budgétaire',
    ressources: 'Ressources',
    planning: 'Planning',
    goulot: 'Goulot d\'étranglement',
    conflit: 'Conflit',
    autre: 'Autre',
  };

  const priorityLabels: Record<string, string> = {
    critical: 'Critique',
    high: 'Élevée',
    medium: 'Normale',
    low: 'Basse',
  };

  return (
    <div className="space-y-6">
      {/* Informations principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Catégorie</label>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium">{categoryLabels[arbitrage.category] || arbitrage.category}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Priorité</label>
          <Badge
            variant={arbitrage.priority === 'critical' ? 'destructive' : arbitrage.priority === 'high' ? 'default' : 'gray'}
            className={cn(
              arbitrage.priority === 'critical' && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
              arbitrage.priority === 'high' && 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
            )}
          >
            {priorityLabels[arbitrage.priority] || arbitrage.priority}
          </Badge>
        </div>

        {arbitrage.bureau && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Bureau</label>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{arbitrage.bureau}</span>
            </div>
          </div>
        )}

        {arbitrage.deadline && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Échéance</label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                {new Date(arbitrage.deadline).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {arbitrage.description && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
          <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            {arbitrage.description}
          </p>
        </div>
      )}

      {/* Projet */}
      {arbitrage.projet && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Projet concerné</label>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{arbitrage.projet.nom}</span>
            <span className="text-xs text-gray-500">({arbitrage.projet.id})</span>
          </div>
        </div>
      )}

      {/* Impact */}
      {arbitrage.impact && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Impact</label>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <Badge
              variant={arbitrage.impact.niveau === 'majeur' ? 'destructive' : 'default'}
              className="mb-2"
            >
              {arbitrage.impact.niveau.toUpperCase()}
            </Badge>
            <p className="text-sm text-gray-900 dark:text-gray-100">{arbitrage.impact.description}</p>
          </div>
        </div>
      )}

      {/* Responsables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {arbitrage.createdBy && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Créé par</label>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{arbitrage.createdBy.name}</span>
              {arbitrage.createdBy.bureau && (
                <Badge variant="outline" className="text-xs">
                  {arbitrage.createdBy.bureau}
                </Badge>
              )}
            </div>
          </div>
        )}

        {arbitrage.assignedTo && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Assigné à</label>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{arbitrage.assignedTo.name}</span>
              {arbitrage.assignedTo.bureau && (
                <Badge variant="outline" className="text-xs">
                  {arbitrage.assignedTo.bureau}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WorkflowTab({ arbitrage }: { arbitrage: Arbitrage }) {
  const steps = [
    { id: 1, label: 'Détection', status: 'completed', date: arbitrage.createdAt },
    {
      id: 2,
      label: 'Analyse',
      status: arbitrage.status === 'pending' ? 'current' : 'completed',
      date: arbitrage.createdAt,
    },
    {
      id: 3,
      label: 'Résolution',
      status:
        arbitrage.status === 'resolved'
          ? 'completed'
          : arbitrage.status === 'in_progress'
          ? 'current'
          : 'pending',
      date: arbitrage.resolvedAt,
    },
    {
      id: 4,
      label: arbitrage.status === 'escalated' ? 'Escalade' : 'Clôture',
      status: arbitrage.status === 'resolved' ? 'completed' : 'pending',
      date: arbitrage.resolvedAt,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id} className="flex gap-4 pb-6 last:pb-0">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2',
                  step.status === 'completed' &&
                    'bg-emerald-500 text-white border-emerald-600',
                  step.status === 'current' &&
                    'bg-orange-500 text-white border-orange-600',
                  step.status === 'pending' &&
                    'bg-gray-200 text-gray-500 border-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600'
                )}
              >
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 h-full mt-2',
                    step.status === 'completed' ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              )}
            </div>
            <div className="flex-1 pt-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{step.label}</h4>
              {step.date && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(step.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Résolution */}
      {arbitrage.resolution && (
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Résolution</h4>
          </div>
          <p className="text-sm text-emerald-800 dark:text-emerald-200 mb-2">
            {arbitrage.resolution.decision}
          </p>
          {arbitrage.resolution.notes && (
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              {arbitrage.resolution.notes}
            </p>
          )}
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
            Résolu par {arbitrage.resolution.resolvedBy} le{' '}
            {new Date(arbitrage.resolution.resolvedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      )}

      {/* Escalade */}
      {arbitrage.escalade && (
        <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">Escalade</h4>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
            Escaladé vers {arbitrage.escalade.escalatedTo}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-300">{arbitrage.escalade.reason}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Le {new Date(arbitrage.escalade.escalatedAt).toLocaleDateString('fr-FR')}
          </p>
        </div>
      )}
    </div>
  );
}

function DocumentsTab({ arbitrage }: { arbitrage: Arbitrage }) {
  if (!arbitrage.documents || arbitrage.documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <FileText className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">Aucun document associé</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {arbitrage.documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{doc.type}</p>
            </div>
          </div>
          {doc.url && (
            <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
              Télécharger
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

function CommentsTab({ arbitrage }: { arbitrage: Arbitrage }) {
  if (!arbitrage.comments || arbitrage.comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">Aucun commentaire</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {arbitrage.comments.map((comment) => (
        <div
          key={comment.id}
          className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.author}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
        </div>
      ))}
    </div>
  );
}

function HistoryTab({ arbitrage }: { arbitrage: Arbitrage }) {
  if (!arbitrage.history || arbitrage.history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <History className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm">Aucun historique</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {arbitrage.history.map((item) => (
        <div
          key={item.id}
          className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <History className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{item.action}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.timestamp).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Par {item.user}</p>
            {item.details && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{item.details}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

