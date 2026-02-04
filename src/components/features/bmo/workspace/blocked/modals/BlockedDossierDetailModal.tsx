'use client';

/**
 * BlockedDossierDetailModal - Modal Overlay pour Dossiers Bloqués
 * 
 * Pattern unifié avec navigation prev/next, tabs, et actions contextuelles
 */

import React, { useMemo } from 'react';
import { GenericDetailModal, type TabConfig, type ActionButton } from '@/components/ui/GenericDetailModal';
import {
  FileX,
  FileText,
  AlertTriangle,
  MessageSquare,
  History,
  Calendar,
  User,
  Building2,
  Clock,
  DollarSign,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

// ================================
// Types
// ================================

export interface BlockedDossier {
  id: string;
  reference: string;
  title: string;
  type: string;
  bureau?: string;
  assignedTo?: string;
  status: 'blocked' | 'resolving' | 'resolved';
  blockReason: string;
  blockDate: string | Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: 'minor' | 'moderate' | 'major' | 'critical';
  estimatedCost?: number;
  description?: string;
  resolutionNotes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface BlockedDossierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier: BlockedDossier | null;
  onResolve?: (dossier: BlockedDossier) => void;
  onEscalate?: (dossier: BlockedDossier) => void;
  onDelete?: (dossier: BlockedDossier) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// ================================
// Helpers
// ================================

const getStatusBadge = (status: string) => {
  const statusMap = {
    blocked: { label: 'Bloqué', variant: 'critical' as const },
    resolving: { label: 'En résolution', variant: 'warning' as const },
    resolved: { label: 'Résolu', variant: 'success' as const },
  };
  return statusMap[status as keyof typeof statusMap] || statusMap.blocked;
};

const getPriorityColor = (priority: string) => {
  const map = {
    low: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    medium: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    high: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    critical: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
  };
  return map[priority as keyof typeof map] || map.medium;
};

const getImpactColor = (impact: string) => {
  const map = {
    minor: 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400',
    moderate: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
    major: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    critical: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
  };
  return map[impact as keyof typeof map] || map.moderate;
};

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCurrency = (amount: number | undefined) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// ================================
// Composant Principal
// ================================

export function BlockedDossierDetailModal({
  isOpen,
  onClose,
  dossier,
  onResolve,
  onEscalate,
  onDelete,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
}: BlockedDossierDetailModalProps) {
  // Tabs configuration
  const tabs: TabConfig[] = useMemo(() => {
    if (!dossier) return [];

    return [
      {
        id: 'details',
        label: 'Détails',
        icon: <FileText className="w-4 h-4" />,
        content: (
          <div className="space-y-6">
            {/* Description */}
            {dossier.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {dossier.description}
                </p>
              </div>
            )}

            {/* Informations principales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Type
                </h4>
                <Badge variant="gray">{dossier.type}</Badge>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Priorité
                </h4>
                <Badge className={cn('capitalize', getPriorityColor(dossier.priority))}>
                  {dossier.priority}
                </Badge>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Impact
                </h4>
                <Badge className={cn('capitalize', getImpactColor(dossier.impact))}>
                  {dossier.impact}
                </Badge>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Coût estimé
                </h4>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  {formatCurrency(dossier.estimatedCost)}
                </div>
              </div>
            </div>

            {/* Bureau et assignation */}
            <div className="grid grid-cols-2 gap-4">
              {dossier.bureau && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Bureau
                  </h4>
                  <Badge variant="outline">{dossier.bureau}</Badge>
                </div>
              )}
              {dossier.assignedTo && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Assigné à
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-white">{dossier.assignedTo}</p>
                </div>
              )}
            </div>

            {/* Date de blocage */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Bloqué depuis
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {formatDate(dossier.blockDate)}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'blockage',
        label: 'Blocage',
        icon: <AlertTriangle className="w-4 h-4" />,
        content: (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h3 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Raison du blocage
              </h3>
              <p className="text-sm text-red-800 dark:text-red-300 whitespace-pre-wrap">
                {dossier.blockReason}
              </p>
            </div>

            {dossier.resolutionNotes && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Notes de résolution
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-wrap">
                  {dossier.resolutionNotes}
                </p>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'comments',
        label: 'Commentaires',
        icon: <MessageSquare className="w-4 h-4" />,
        badge: 0,
        content: (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fonctionnalité de commentaires à venir
            </p>
          </div>
        ),
      },
      {
        id: 'history',
        label: 'Historique',
        icon: <History className="w-4 h-4" />,
        content: (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Historique du dossier
            </h3>
            <div className="space-y-3">
              {dossier.createdAt && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      Dossier créé
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(dossier.createdAt)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    Dossier bloqué
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {formatDate(dossier.blockDate)}
                  </p>
                </div>
              </div>
              {dossier.updatedAt && dossier.updatedAt !== dossier.createdAt && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      Dernière modification
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(dossier.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ),
      },
    ];
  }, [dossier]);

  // Actions
  const actions: ActionButton[] = useMemo(() => {
    if (!dossier) return [];

    const acts: ActionButton[] = [];

    if (onResolve && dossier.status !== 'resolved') {
      acts.push({
        id: 'resolve',
        label: 'Marquer comme résolu',
        icon: <CheckCircle2 className="w-4 h-4" />,
        variant: 'default',
        onClick: () => onResolve(dossier),
      });
    }

    if (onEscalate) {
      acts.push({
        id: 'escalate',
        label: 'Escalader',
        icon: <AlertTriangle className="w-4 h-4" />,
        variant: 'outline',
        onClick: () => onEscalate(dossier),
      });
    }

    if (onDelete) {
      acts.push({
        id: 'delete',
        label: 'Supprimer',
        variant: 'destructive',
        onClick: () => {
          if (confirm(`Êtes-vous sûr de vouloir supprimer le dossier ${dossier.reference} ?`)) {
            onDelete(dossier);
          }
        },
      });
    }

    return acts;
  }, [dossier, onResolve, onEscalate, onDelete]);

  if (!dossier) return null;

  const statusBadge = getStatusBadge(dossier.status);

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${dossier.reference} - ${dossier.title}`}
      subtitle={dossier.type}
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

export default BlockedDossierDetailModal;
