/**
 * Composant AgendaItem - Élément d'agenda harmonisé
 * Utilisé dans l'Agenda Exécutif
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type AgendaEventType = 'deadline' | 'meeting' | 'visite' | 'audience' | 'livraison';
export type AgendaPriority = 'critique' | 'urgent' | 'normal';

export interface AgendaItemData {
  id: string;
  date: string; // ISO date
  time: string;
  titre: string;
  description: string;
  type: AgendaEventType;
  priorite: AgendaPriority;
  bureau?: string;
  projet?: string;
  participants?: string[];
}

interface AgendaItemProps {
  event: AgendaItemData;
  onClick?: () => void;
  className?: string;
}

const typeConfig = {
  deadline: { label: 'Échéance', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' },
  meeting: { label: 'Réunion', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30' },
  visite: { label: 'Visite', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  audience: { label: 'Audience', color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/30' },
  livraison: { label: 'Livraison', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' },
};

const priorityConfig = {
  critique: { label: 'Critique', color: 'text-red-400', bg: 'bg-red-500/20' },
  urgent: { label: 'Urgent', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  normal: { label: 'Normal', color: 'text-slate-400', bg: 'bg-slate-700/50' },
};

/**
 * Composant AgendaItem harmonisé
 */
export const AgendaItem = memo(function AgendaItem({
  event,
  onClick,
  className,
}: AgendaItemProps) {
  const type = typeConfig[event.type];
  const priority = priorityConfig[event.priorite];

  // Formater la date
  const eventDate = new Date(event.date);
  const dayName = eventDate.toLocaleDateString('fr-FR', { weekday: 'short' });
  const dayNumber = eventDate.getDate();
  const month = eventDate.toLocaleDateString('fr-FR', { month: 'short' });

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all duration-200',
        'bg-slate-800/50 border-slate-700/50',
        onClick && 'cursor-pointer hover:bg-slate-800/70 hover:border-slate-600/50',
        className
      )}
      onClick={onClick}
      style={{ padding: 'clamp(0.75rem, 1.5vw, 1rem)', minHeight: '140px' }}
    >
      {/* Header: Date + Type */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center" style={{ minWidth: 'clamp(3rem, 4vw, 3.125rem)' }}>
            <span className="text-slate-400 uppercase" style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}>{dayName}</span>
            <span className="font-bold text-slate-200" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)' }}>{dayNumber}</span>
            <span className="text-slate-400" style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}>{month}</span>
          </div>
          <div className="flex-1">
            <Badge
              variant="default"
              className={cn('mb-1 border', type.bg, type.border, type.color)}
              style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}
            >
              {type.label}
            </Badge>
            {event.priorite !== 'normal' && (
              <Badge
                variant="default"
                className={cn('ml-1 border', priority.bg, priority.color)}
                style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}
              >
                {priority.label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 mb-2 text-slate-400" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
        <Clock style={{ width: 'clamp(0.75rem, 0.875vw, 0.875rem)', height: 'clamp(0.75rem, 0.875vw, 0.875rem)', minWidth: '0.75rem', minHeight: '0.75rem' }} />
        <span>{event.time}</span>
      </div>

      {/* Titre */}
      <h3 className="font-semibold text-slate-200 mb-1 line-clamp-2" style={{ fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' }}>
        {event.titre}
      </h3>

      {/* Description */}
      <p className="text-slate-400 mb-3 line-clamp-2" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
        {event.description}
      </p>

      {/* Footer: Projet + Participants */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
        {event.projet && (
          <span className="text-slate-500 truncate" style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}>
            {event.projet}
          </span>
        )}
        {event.participants && event.participants.length > 0 && (
          <div className="flex items-center gap-1">
            <Users className="text-slate-500" style={{ width: 'clamp(0.75rem, 0.875vw, 0.875rem)', height: 'clamp(0.75rem, 0.875vw, 0.875rem)', minWidth: '0.75rem', minHeight: '0.75rem' }} />
            <span className="text-slate-500" style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}>
              {event.participants.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

AgendaItem.displayName = 'AgendaItem';
