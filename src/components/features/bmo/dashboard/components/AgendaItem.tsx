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
    >
      {/* Header: Date + Type */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-center min-w-[50px]">
            <span className="text-[10px] text-slate-400 uppercase">{dayName}</span>
            <span className="text-lg font-bold text-slate-200">{dayNumber}</span>
            <span className="text-[10px] text-slate-400">{month}</span>
          </div>
          <div className="flex-1">
            <Badge
              variant="default"
              className={cn('text-[10px] mb-1 border', type.bg, type.border, type.color)}
            >
              {type.label}
            </Badge>
            {event.priorite !== 'normal' && (
              <Badge
                variant="default"
                className={cn('text-[10px] ml-1 border', priority.bg, priority.color)}
              >
                {priority.label}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 mb-2 text-xs text-slate-400">
        <Clock className="w-3.5 h-3.5" />
        <span>{event.time}</span>
      </div>

      {/* Titre */}
      <h3 className="text-sm font-semibold text-slate-200 mb-1 line-clamp-2">
        {event.titre}
      </h3>

      {/* Description */}
      <p className="text-xs text-slate-400 mb-3 line-clamp-2">
        {event.description}
      </p>

      {/* Footer: Projet + Participants */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
        {event.projet && (
          <span className="text-[10px] text-slate-500 truncate">
            {event.projet}
          </span>
        )}
        {event.participants && event.participants.length > 0 && (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-500" />
            <span className="text-[10px] text-slate-500">
              {event.participants.length}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

AgendaItem.displayName = 'AgendaItem';
