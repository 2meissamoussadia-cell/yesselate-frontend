'use client';

import React from 'react';
import { MapPin, Calendar, FileText, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface FoncierItem {
  id: string;
  numero: string;
  titre: string;
  description?: string;
  statut: 'en-cours' | 'valide' | 'rejete' | 'attente';
  type: 'acquisition' | 'cession' | 'location' | 'servitude';
  localisation: string;
  surface?: number;
  dateCreation: Date | string;
  responsable?: { id: string; nom: string };
  pieceJointes?: number;
}

export interface FoncierListRowProps {
  item: FoncierItem;
  selected: boolean;
  onClick?: () => void;
}

const statutConfig: Record<FoncierItem['statut'], { color: string; label: string }> = {
  'en-cours': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', label: 'En cours' },
  'valide': { color: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300', label: 'Validé' },
  'rejete': { color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300', label: 'Rejeté' },
  'attente': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300', label: 'En attente' },
};

const typeConfig: Record<FoncierItem['type'], { icon: string; color: string }> = {
  'acquisition': { icon: '🏗️', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50' },
  'cession': { icon: '📤', color: 'text-green-600 bg-green-50 dark:bg-green-950/50' },
  'location': { icon: '🏘️', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50' },
  'servitude': { icon: '⚖️', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50' },
};

export const FoncierListRow = React.memo(function FoncierListRow({ 
  item, 
  selected, 
  onClick 
}: FoncierListRowProps) {
  const statutInfo = statutConfig[item.statut];
  const typeInfo = typeConfig[item.type];
  
  const dateCreation = item.dateCreation instanceof Date
    ? item.dateCreation
    : new Date(item.dateCreation);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        aria-selected={selected}
        className={cn(
          'group relative w-full min-w-0 overflow-hidden shrink-0',
          'grid grid-cols-1 gap-y-1.5 px-4 py-3',
          'border-b border-slate-100 dark:border-slate-800/40',
          'cursor-pointer transition-all duration-150',
          'hover:bg-slate-50 dark:hover:bg-slate-800/30',
          'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px]',
          'before:bg-transparent before:transition-colors before:duration-150',
          'hover:before:bg-sky-400',
          selected && 'bg-sky-50 dark:bg-sky-900/20 before:bg-sky-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset'
        )}
      >
        <div className="min-w-0 overflow-hidden space-y-1.5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 min-w-0 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 min-w-0 overflow-hidden">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="font-medium truncate">{item.localisation}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="truncate max-w-[90px]">
                {formatDistanceToNow(dateCreation, { addSuffix: true, locale: fr })}
              </span>
              {item.pieceJointes && item.pieceJointes > 0 && (
                <>
                  <FileText className="w-3 h-3" aria-hidden />
                  {item.pieceJointes}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 min-w-0">
            <Badge variant="secondary" className="shrink-0 text-xs font-semibold">
              {item.numero}
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="font-semibold text-sm truncate min-w-0 cursor-default block">
                  {item.titre}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{item.titre}</p>
              </TooltipContent>
            </Tooltip>
            <Badge variant="outline" className={cn('shrink-0 text-xs font-medium truncate max-w-[100px]', typeInfo.color)}>
              <span className="mr-1" aria-hidden>{typeInfo.icon}</span>
              {item.type}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs flex-nowrap min-w-0 overflow-hidden">
            <Badge variant="outline" className={cn('text-xs shrink-0', statutInfo.color)}>
              {statutInfo.label}
            </Badge>
            {item.surface && (
              <span className="text-slate-600 dark:text-slate-400 shrink-0">
                {item.surface.toLocaleString()} m²
              </span>
            )}
            {item.responsable && (
              <div className="flex items-center gap-1 min-w-0 overflow-hidden ml-auto shrink-0">
                <Avatar className="w-5 h-5 shrink-0">
                  <AvatarFallback className="text-xs">
                    {item.responsable.nom.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-slate-600 dark:text-slate-400 truncate">
                  {item.responsable.nom}
                </span>
              </div>
            )}
          </div>

          {item.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 truncate min-w-0">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
});
