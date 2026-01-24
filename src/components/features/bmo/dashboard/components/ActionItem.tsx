/**
 * Composant ActionItem - Élément d'action prioritaire harmonisé
 * Utilisé dans les Actions Prioritaires
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { Clock, User, AlertTriangle, FileText, Scale, CreditCard, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type ActionType = 'contrat' | 'bc' | 'paiement' | 'arbitrage';
export type ActionPriority = 'critique' | 'haute' | 'moyenne';

export interface ActionItemData {
  id: string;
  titre: string;
  type: ActionType;
  priorite: ActionPriority;
  bureau?: string;
  code?: string;
  projet?: {
    id: string;
    nom: string;
  };
  montant?: number; // en FCFA
  deadline: string;
  responsable?: {
    nom: string;
    id: string;
  };
  contexte?: string;
  impact?: string;
}

interface ActionItemProps {
  action: ActionItemData;
  onClick?: () => void;
  className?: string;
}

const typeConfig = {
  contrat: { 
    label: 'Contrat', 
    icon: FileText, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/20', 
    border: 'border-blue-500/30' 
  },
  bc: { 
    label: 'BC', 
    icon: FileText, 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/20', 
    border: 'border-purple-500/30' 
  },
  paiement: { 
    label: 'Paiement', 
    icon: CreditCard, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/20', 
    border: 'border-emerald-500/30' 
  },
  arbitrage: { 
    label: 'Arbitrage', 
    icon: Scale, 
    color: 'text-orange-400', 
    bg: 'bg-orange-500/20', 
    border: 'border-orange-500/30' 
  },
};

const priorityConfig = {
  critique: { label: 'Critique', color: 'text-red-400', bg: 'bg-red-500/20' },
  haute: { label: 'Haute', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  moyenne: { label: 'Moyenne', color: 'text-amber-400', bg: 'bg-amber-500/20' },
};

/**
 * Composant ActionItem harmonisé
 */
export const ActionItem = memo(function ActionItem({
  action,
  onClick,
  className,
}: ActionItemProps) {
  // Validation et fallback pour le type
  const actionType = action.type || 'contrat';
  const type = typeConfig[actionType] || typeConfig.contrat;
  const TypeIcon = type.icon;

  // Validation et fallback pour la priorité
  const actionPriorite = action.priorite || 'moyenne';
  const priority = priorityConfig[actionPriorite] || priorityConfig.moyenne;

  // Formater le montant
  const formattedAmount = action.montant
    ? action.montant >= 1000000
      ? `${(action.montant / 1000000).toFixed(1)}M FCFA`
      : `${(action.montant / 1000).toFixed(0)}K FCFA`
    : null;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors',
        'bg-slate-800/50 border-slate-700/50',
        onClick && 'cursor-pointer hover:bg-slate-800/70 hover:border-slate-600/50',
        className
      )}
      onClick={onClick}
    >
      {/* Header: Type + Priority */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded border', type.bg, type.border)}>
            <TypeIcon className={cn('w-4 h-4', type.color)} />
          </div>
          <Badge
            variant="default"
            className={cn('text-[10px] border', priority.bg, priority.color)}
          >
            {priority.label}
          </Badge>
          {action.code && (
            <Badge
              variant="default"
              className="text-[10px] border bg-slate-700/50 text-slate-300 border-slate-600/50"
            >
              {action.code}
            </Badge>
          )}
        </div>
        {onClick && (
          <ArrowRight className="w-4 h-4 text-slate-500" />
        )}
      </div>

      {/* Titre */}
      <h3 className="text-sm font-semibold text-slate-200 mb-2 line-clamp-2">
        {action.titre}
      </h3>

      {/* Projet */}
      {action.projet && (
        <p className="text-xs text-slate-400 mb-2">
          {action.projet.nom}
        </p>
      )}

      {/* Montant */}
      {formattedAmount && (
        <p className="text-sm font-bold text-slate-300 mb-2">
          {formattedAmount}
        </p>
      )}

      {/* Footer: Deadline + Responsable */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-xs text-slate-400">{action.deadline}</span>
        </div>
        {action.responsable && (
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-400">{action.responsable.nom}</span>
          </div>
        )}
      </div>
    </div>
  );
});

ActionItem.displayName = 'ActionItem';
