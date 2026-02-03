'use client';

import React from 'react';
import {
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  Paperclip,
  MessageSquare,
  Flag,
  Circle,
  Building2,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { AlerteBTP } from '@/lib/types/alerts-btp.types';

export interface AlertListRowProps {
  alerte: AlerteBTP;
  selected: boolean;
  onClick?: () => void;
}

const niveauConfig: Record<
  AlerteBTP['niveau'],
  { color: string; badge: string; dot: string; icon: React.ComponentType<{ className?: string }> }
> = {
  critique: {
    color: 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-700 dark:text-red-300',
    badge: 'bg-red-600 text-white',
    dot: 'bg-red-600',
    icon: AlertCircle,
  },
  important: {
    color: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 text-orange-700 dark:text-orange-300',
    badge: 'bg-orange-600 text-white',
    dot: 'bg-orange-600',
    icon: AlertCircle,
  },
  normal: {
    color: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-600 text-white',
    dot: 'bg-blue-600',
    icon: Circle,
  },
  faible: {
    color: 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 text-gray-700 dark:text-gray-300',
    badge: 'bg-gray-600 text-white',
    dot: 'bg-gray-600',
    icon: Circle,
  },
};

const categorieConfig: Record<
  string,
  { icon: string; color: string }
> = {
  technique: { icon: '🔧', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50' },
  budget: { icon: '💰', color: 'text-green-600 bg-green-50 dark:bg-green-950/50' },
  financier: { icon: '💰', color: 'text-green-600 bg-green-50 dark:bg-green-950/50' },
  planning: { icon: '📅', color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50' },
  securite: { icon: '🛡️', color: 'text-red-600 bg-red-50 dark:bg-red-950/50' },
  qualite: { icon: '⭐', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50' },
  juridique: { icon: '⚖️', color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/50' },
};

export function AlertListRow({ alerte, selected, onClick }: AlertListRowProps) {
  const config = niveauConfig[alerte.niveau];
  const catConfig = categorieConfig[alerte.categorie] ?? categorieConfig.technique;

  const dateCreation = alerte.dateCreation instanceof Date
    ? alerte.dateCreation
    : new Date(alerte.dateCreation);
  const dateEcheance = alerte.dateEcheance
    ? (alerte.dateEcheance instanceof Date ? alerte.dateEcheance : new Date(alerte.dateEcheance))
    : null;

  const isOverdue = dateEcheance && dateEcheance < new Date();
  const isUnread = alerte.statut === 'non-traite';
  const pieceJointes = alerte.pieceJointes ?? [];
  const commentaires = alerte.commentaires ?? [];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
      className={cn(
        'group relative flex items-start gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800/40',
        'cursor-pointer transition-all duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/30',
        selected && 'bg-sky-50 dark:bg-sky-900/20 border-l-4 border-l-sky-500',
        isUnread && 'font-medium'
      )}
    >
      <div className="flex flex-col items-center gap-2 pt-1 shrink-0">
        {isUnread && <div className={cn('w-2 h-2 rounded-full', config.dot)} />}
        {alerte.urgent && (
          <Flag className="w-4 h-4 text-red-600 fill-red-600 dark:fill-red-500 dark:text-red-500" />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="font-medium truncate">{alerte.chantier?.nom ?? '—'}</span>
            {alerte.chantier?.code && (
              <>
                <span className="text-slate-400">•</span>
                <span>{alerte.chantier.code}</span>
              </>
            )}
          </div>
          <span className="ml-auto shrink-0">
            {formatDistanceToNow(dateCreation, { addSuffix: true, locale: fr })}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {pieceJointes.length > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {pieceJointes.length}
              </span>
            )}
            {commentaires.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {commentaires.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Badge variant="secondary" className="shrink-0 text-xs">
            {alerte.numero}
          </Badge>
          <h4 className="font-semibold text-sm line-clamp-1 flex-1 min-w-0">
            {alerte.titre}
          </h4>
          <Badge variant="outline" className={cn('shrink-0 text-xs', catConfig.color)}>
            <span className="mr-1">{catConfig.icon}</span>
            {alerte.categorie}
          </Badge>
        </div>

        <div className="flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1">
            <Avatar className="w-5 h-5">
              <AvatarImage src={alerte.emetteur?.avatar} />
              <AvatarFallback className="text-xs">
                {alerte.emetteur?.nom?.charAt(0) ?? '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-slate-600 dark:text-slate-400">
              {alerte.emetteur?.nom ?? '—'}
            </span>
          </div>
          {alerte.assigneA && (
            <>
              <span className="text-slate-400">→</span>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="text-slate-600 dark:text-slate-400">{alerte.assigneA.nom}</span>
              </div>
            </>
          )}
          {dateEcheance && (
            <div
              className={cn(
                'flex items-center gap-1 ml-auto',
                isOverdue && 'text-red-600 dark:text-red-400 font-medium'
              )}
            >
              <Clock className="w-3 h-3" />
              <span>
                {formatDistanceToNow(dateEcheance, { addSuffix: true, locale: fr })}
              </span>
            </div>
          )}
        </div>

        {alerte.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {alerte.description}
          </p>
        )}

        {(alerte.impactBudget || alerte.impactPlanning) && (
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {alerte.impactBudget && (
              <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200">
                <DollarSign className="w-3 h-3 mr-1" />
                {alerte.impactBudget.montant.toLocaleString()} {alerte.impactBudget.devise}
              </Badge>
            )}
            {alerte.impactPlanning && (
              <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border-orange-200">
                <Calendar className="w-3 h-3 mr-1" />
                +{alerte.impactPlanning.retard} {alerte.impactPlanning.unite}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Traiter
        </Button>
      </div>
    </div>
  );
}
