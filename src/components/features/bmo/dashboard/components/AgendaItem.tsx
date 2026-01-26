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
        'group relative rounded-xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm',
        'transition-all duration-200 min-w-0 overflow-hidden',
        onClick && 'cursor-pointer hover:border-slate-700/80 hover:bg-slate-900/50 hover:shadow-md',
        className
      )}
      onClick={onClick}
      style={{ padding: 'clamp(0.875rem, 1.25vw, 1rem)' }}
    >
      {/* Header: Date + Type */}
      <div className="flex items-start justify-between mb-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="flex flex-col items-center justify-center rounded-lg bg-slate-800/60 border border-slate-700/50 px-2 py-1.5 min-w-[2.5rem]">
            <span className="text-slate-400 uppercase text-[10px] font-medium tracking-wider">{dayName}</span>
            <span className="font-bold text-slate-200 text-sm leading-none my-0.5">{dayNumber}</span>
            <span className="text-slate-500 text-[10px]">{month}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={cn('border-0 px-2 py-0.5 rounded-md text-[10px] font-medium', type.bg, type.color, 'bg-opacity-20')}
            >
              {type.label}
            </Badge>
            {event.priorite !== 'normal' && (
              <Badge
                variant="outline"
                className={cn('border-0 px-2 py-0.5 rounded-md text-[10px] font-medium', priority.bg, priority.color, 'bg-opacity-20')}
              >
                {priority.label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-1.5 mb-2.5 text-slate-400">
        <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ width: '0.875rem', height: '0.875rem', minWidth: '0.875rem', minHeight: '0.875rem' }} />
        <span className="text-xs font-medium">{event.time}</span>
      </div>

      {/* Titre */}
      <h3 className="font-semibold text-slate-200 mb-1.5 line-clamp-2 text-sm leading-snug min-w-0">
        {event.titre}
      </h3>

      {/* Description */}
      <p className="text-slate-400 mb-3 line-clamp-2 text-xs leading-relaxed min-w-0">
        {event.description}
      </p>

      {/* Footer: Projet + Participants */}
      {(event.projet || (event.participants && event.participants.length > 0)) && (
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/50">
          {event.projet && (
            <span className="text-slate-500 truncate text-[10px] font-medium">
              {event.projet}
            </span>
          )}
          {event.participants && event.participants.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="text-slate-500 w-3.5 h-3.5 flex-shrink-0" style={{ width: '0.875rem', height: '0.875rem', minWidth: '0.875rem', minHeight: '0.875rem' }} />
              <span className="text-slate-500 text-[10px] font-medium">
                {event.participants.length}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

AgendaItem.displayName = 'AgendaItem';
