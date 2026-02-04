'use client';

import React from 'react';
import { Calendar, Clock, Building2, User, FileText } from 'lucide-react';
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

export interface ProgrammationItem {
  id: string;
  numero: string;
  titre: string;
  description?: string;
  statut: 'planifie' | 'en-cours' | 'termine' | 'retard';
  type: 'annuel' | 'pluriannuel' | 'exceptionnel';
  projet: string;
  budget?: number;
  dateDebut?: Date | string;
  dateFin?: Date | string;
  dateCreation: Date | string;
  responsable?: { id: string; nom: string };
  avancement?: number;
}

export interface ProgrammationListRowProps {
  item: ProgrammationItem;
  selected: boolean;
  onClick?: () => void;
}

const statutConfig: Record<ProgrammationItem['statut'], { color: string; label: string; dot: string }> = {
  'planifie': { color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300', label: 'Planifié', dot: 'bg-blue-600' },
  'en-cours': { color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300', label: 'En cours', dot: 'bg-orange-600' },
  'termine': { color: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300', label: 'Terminé', dot: 'bg-green-600' },
  'retard': { color: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300', label: 'En retard', dot: 'bg-red-600' },
};

export const ProgrammationListRow = React.memo(function ProgrammationListRow({ 
  item, 
  selected, 
  onClick 
}: ProgrammationListRowProps) {
  const statutInfo = statutConfig[item.statut];
  const dateCreation = item.dateCreation instanceof Date ? item.dateCreation : new Date(item.dateCreation);

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
          'group relative flex items-start gap-3 px-4 py-3',
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
        <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
          <div className={cn('w-2 h-2 rounded-full', statutInfo.dot)} />
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Building2 className="w-3 h-3 shrink-0" />
              <span className="font-medium truncate">{item.projet}</span>
            </div>
            <span className="ml-auto shrink-0">
              {formatDistanceToNow(dateCreation, { addSuffix: true, locale: fr })}
            </span>
          </div>

          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="shrink-0 text-xs font-semibold">
              {item.numero}
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <h4 className="font-semibold text-sm line-clamp-1 flex-1 min-w-0 cursor-default">
                  {item.titre}
                </h4>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{item.titre}</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-3 text-xs flex-wrap">
            <Badge variant="outline" className={cn('text-xs', statutInfo.color)}>
              {statutInfo.label}
            </Badge>

            {item.avancement !== undefined && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-sky-600 dark:bg-sky-500 transition-all"
                    style={{ width: `${item.avancement}%` }}
                  />
                </div>
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  {item.avancement}%
                </span>
              </div>
            )}

            {item.budget && (
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">
                {item.budget.toLocaleString()} FCFA
              </Badge>
            )}

            {item.responsable && (
              <div className="flex items-center gap-1 ml-auto">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-xs">
                    {item.responsable.nom.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-slate-600 dark:text-slate-400">
                  {item.responsable.nom}
                </span>
              </div>
            )}
          </div>

          {item.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
});
