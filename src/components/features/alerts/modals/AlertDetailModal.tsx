'use client';

/**
 * AlertDetailModal - Modal Overlay pour Alertes
 * 
 * Pattern unifié avec navigation prev/next, tabs, et actions contextuelles
 */

import React, { useMemo } from 'react';
import { GenericDetailModal, type TabConfig, type ActionButton } from '@/components/ui/GenericDetailModal';
import {
  Bell,
  FileText,
  Clock,
  MessageSquare,
  History,
  User,
  Building2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Target,
  Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';

// ================================
// Types
// ================================

export interface Alert {
  id: string;
  title: string;
  description?: string;
  type: 'info' | 'warning' | 'error' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'resolved' | 'closed';
  source: string;
  bureau?: string;
  assignedTo?: string;
  priority: number;
  sla?: {
    deadline: string | Date;
    remaining: string;
  };
  metadata?: Record<string, any>;
  createdAt: string | Date;
  acknowledgedAt?: string | Date;
  resolvedAt?: string | Date;
  updatedAt?: string | Date;
}

interface AlertDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
  onAcknowledge?: (alert: Alert) => void;
  onResolve?: (alert: Alert) => void;
  onEscalate?: (alert: Alert) => void;
  onDelete?: (alert: Alert) => void;
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
    open: { label: 'Ouverte', variant: 'warning' as const },
    acknowledged: { label: 'Acquittée', variant: 'info' as const },
    resolved: { label: 'Résolue', variant: 'success' as const },
    closed: { label: 'Fermée', variant: 'default' as const },
  };
  return statusMap[status as keyof typeof statusMap] || statusMap.open;
};

const getSeverityColor = (severity: string) => {
  const map = {
    low: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    medium: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    high: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    critical: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
  };
  return map[severity as keyof typeof map] || map.medium;
};

const getTypeIcon = (type: string) => {
  const map = {
    info: Bell,
    warning: AlertTriangle,
    error: XCircle,
    success: CheckCircle2,
  };
  return map[type as keyof typeof map] || Bell;
};

const getTypeColor = (type: string) => {
  const map = {
    info: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    warning: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400',
    error: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    success: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
  };
  return map[type as keyof typeof map] || map.info;
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

// ================================
// Composant Principal
// ================================

export function AlertDetailModal({
  isOpen,
  onClose,
  alert,
  onAcknowledge,
  onResolve,
  onEscalate,
  onDelete,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
}: AlertDetailModalProps) {
  // Tabs configuration
  const tabs: TabConfig[] = useMemo(() => {
    if (!alert) return [];

    const TypeIcon = getTypeIcon(alert.type);

    return [
      {
        id: 'details',
        label: 'Détails',
        icon: <FileText className="w-4 h-4" />,
        content: (
          <div className="space-y-6">
            {/* Description */}
            {alert.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {alert.description}
                </p>
              </div>
            )}

            {/* Informations principales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Type
                </h4>
                <div className="flex items-center gap-2">
                  <Badge className={cn('capitalize', getTypeColor(alert.type))}>
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {alert.type}
                  </Badge>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Sévérité
                </h4>
                <Badge className={cn('capitalize', getSeverityColor(alert.severity))}>
                  {alert.severity}
                </Badge>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Priorité
                </h4>
                <Badge variant="default">P{alert.priority}</Badge>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Source
                </h4>
                <Badge variant="default">{alert.source}</Badge>
              </div>
            </div>

            {/* Bureau et assignation */}
            <div className="grid grid-cols-2 gap-4">
              {alert.bureau && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Bureau
                  </h4>
                  <Badge variant="default">{alert.bureau}</Badge>
                </div>
              )}
              {alert.assignedTo && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Assigné à
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-white">{alert.assignedTo}</p>
                </div>
              )}
            </div>

            {/* SLA */}
            {alert.sla && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  SLA
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 dark:text-amber-300">Échéance:</span>
                    <span className="font-medium text-amber-900 dark:text-amber-100">
                      {formatDate(alert.sla.deadline)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-700 dark:text-amber-300">Temps restant:</span>
                    <span className="font-medium text-amber-900 dark:text-amber-100">
                      {alert.sla.remaining}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Metadata */}
            {alert.metadata && Object.keys(alert.metadata).length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Métadonnées
                </h3>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto">
                    {JSON.stringify(alert.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'timeline',
        label: 'Chronologie',
        icon: <Clock className="w-4 h-4" />,
        content: (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Chronologie de l'alerte
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    Alerte créée
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {formatDate(alert.createdAt)}
                  </p>
                </div>
              </div>
              {alert.acknowledgedAt && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      Alerte acquittée
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(alert.acknowledgedAt)}
                    </p>
                  </div>
                </div>
              )}
              {alert.resolvedAt && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      Alerte résolue
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(alert.resolvedAt)}
                    </p>
                  </div>
                </div>
              )}
              {alert.updatedAt && alert.updatedAt !== alert.createdAt && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      Dernière modification
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(alert.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
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
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Historique détaillé à venir
            </p>
          </div>
        ),
      },
    ];
  }, [alert]);

  // Actions
  const actions: ActionButton[] = useMemo(() => {
    if (!alert) return [];

    const acts: ActionButton[] = [];

    if (onAcknowledge && alert.status === 'open') {
      acts.push({
        id: 'acknowledge',
        label: 'Acquitter',
        icon: <CheckCircle2 className="w-4 h-4" />,
        variant: 'outline',
        onClick: () => onAcknowledge(alert),
      });
    }

    if (onResolve && alert.status !== 'resolved' && alert.status !== 'closed') {
      acts.push({
        id: 'resolve',
        label: 'Résoudre',
        icon: <CheckCircle2 className="w-4 h-4" />,
        variant: 'default',
        onClick: () => onResolve(alert),
      });
    }

    if (onEscalate) {
      acts.push({
        id: 'escalate',
        label: 'Escalader',
        icon: <AlertTriangle className="w-4 h-4" />,
        variant: 'outline',
        onClick: () => onEscalate(alert),
      });
    }

    if (onDelete) {
      acts.push({
        id: 'delete',
        label: 'Supprimer',
        variant: 'destructive',
        onClick: () => {
          if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
            onDelete(alert);
          }
        },
      });
    }

    return acts;
  }, [alert, onAcknowledge, onResolve, onEscalate, onDelete]);

  if (!alert) return null;

  const statusBadge = getStatusBadge(alert.status);

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={alert.title}
      subtitle={`Source: ${alert.source}`}
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

export default AlertDetailModal;

