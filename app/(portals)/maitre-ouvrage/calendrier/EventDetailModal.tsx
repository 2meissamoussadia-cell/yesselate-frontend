'use client';

/**
 * EventDetailModal - Modal Overlay Moderne pour Événements
 * 
 * Pattern unifié avec navigation prev/next, tabs, et actions contextuelles
 * Préserve le contexte (liste visible en arrière-plan)
 */

import React, { useMemo } from 'react';
import { GenericDetailModal, type TabConfig, type ActionButton } from '@/components/ui/GenericDetailModal';
import {
  Calendar,
  FileText,
  Users,
  MessageSquare,
  History,
  Building2,
  Clock,
  Target,
  Repeat,
  Star,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CalendarItem } from './types';

// ================================
// Types
// ================================

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarItem | null;
  onEdit?: (event: CalendarItem) => void;
  onDelete?: (event: CalendarItem) => void;
  onComplete?: (event: CalendarItem) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  allEvents?: CalendarItem[];
}

// ================================
// Helpers
// ================================

const getStatusBadge = (status: string) => {
  const statusMap = {
    pending: { label: 'En attente', variant: 'default' as const },
    open: { label: 'Ouvert', variant: 'info' as const },
    in_progress: { label: 'En cours', variant: 'warning' as const },
    completed: { label: 'Terminé', variant: 'success' as const },
    cancelled: { label: 'Annulé', variant: 'default' as const },
    blocked: { label: 'Bloqué', variant: 'critical' as const },
  };
  return statusMap[status as keyof typeof statusMap] || statusMap.pending;
};

const getPriorityColor = (priority: string) => {
  const map = {
    basse: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
    normale: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
    haute: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
    critique: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
  };
  return map[priority as keyof typeof map] || map.normale;
};

const formatDate = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
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

export function EventDetailModal({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete,
  onComplete,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
  allEvents,
}: EventDetailModalProps) {
  // Tabs configuration
  const tabs: TabConfig[] = useMemo(() => {
    if (!event) return [];

    return [
      {
        id: 'details',
        label: 'Détails',
        icon: <FileText className="w-4 h-4" />,
        content: (
          <div className="space-y-6">
            {/* Description */}
            {event.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Informations principales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Type
                </h4>
                <Badge variant="default" className="capitalize">
                  {event.kind}
                </Badge>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Priorité
                </h4>
                <Badge className={cn('capitalize', getPriorityColor(event.priority))}>
                  {event.priority}
                </Badge>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Calendrier
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Début:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(event.start)}
                  </span>
                </div>
                {event.end && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Fin:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(event.end)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bureau */}
            {event.bureau && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Bureau
                </h3>
                <Badge variant="default">{event.bureau}</Badge>
              </div>
            )}

            {/* Projet */}
            {event.project && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Projet
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{event.project}</p>
              </div>
            )}

            {/* Récurrence */}
            {event.recurrence && event.recurrence !== 'none' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Repeat className="w-4 h-4" />
                  Récurrence
                </h3>
                <Badge variant="default" className="capitalize">
                  {event.recurrence}
                </Badge>
              </div>
            )}

            {/* Notation */}
            {event.notation !== undefined && event.notation > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Notation
                </h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Star
                      key={rating}
                      className={cn(
                        'w-5 h-5',
                        event.notation && event.notation >= rating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      )}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {event.notes && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Notes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {event.notes}
                </p>
              </div>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, idx) => (
                    <Badge key={idx} variant="default">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'participants',
        label: 'Participants',
        icon: <Users className="w-4 h-4" />,
        badge: event.assignees?.length || 0,
        content: (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Personnes assignées
            </h3>
            {event.assignees && event.assignees.length > 0 ? (
              <div className="space-y-2">
                {event.assignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {assignee.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {assignee.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {assignee.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucun participant assigné
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
              Historique de l’événement
            </h3>
            <div className="space-y-3">
              {event.createdAt && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      Événement créé
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(event.createdAt)}
                    </p>
                  </div>
                </div>
              )}
              {event.updatedAt && event.updatedAt !== event.createdAt && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      Dernière modification
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(event.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ),
      },
    ];
  }, [event]);

  // Actions
  const actions: ActionButton[] = useMemo(() => {
    if (!event) return [];

    const acts: ActionButton[] = [];

    if (onEdit) {
      acts.push({
        id: 'edit',
        label: 'Modifier',
        variant: 'default',
        onClick: () => onEdit(event),
      });
    }

    if (onComplete && event.status !== 'completed') {
      acts.push({
        id: 'complete',
        label: 'Marquer comme terminé',
        icon: <CheckCircle2 className="w-4 h-4" />,
        variant: 'outline',
        onClick: () => onComplete(event),
      });
    }

    if (onDelete) {
      acts.push({
        id: 'delete',
        label: 'Supprimer',
        variant: 'destructive',
        onClick: () => {
          if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
            onDelete(event);
          }
        },
      });
    }

    return acts;
  }, [event, onEdit, onComplete, onDelete]);

  if (!event) return null;

  const statusBadge = getStatusBadge(event.status);

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      subtitle={event.kind ? `Type: ${event.kind}` : undefined}
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

export default EventDetailModal;

