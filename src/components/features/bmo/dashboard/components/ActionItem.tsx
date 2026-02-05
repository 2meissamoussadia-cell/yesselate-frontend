/**
 * Composant ActionItem - Élément d'action prioritaire harmonisé
 * Utilisé dans les Actions Prioritaires
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/cn';
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

  // Validation et fallback pour la priorité (normaliser clé)
  const raw = (action.priorite || 'moyenne').toString().toLowerCase();
  const actionPriorite = (['critique', 'haute', 'moyenne'].includes(raw) ? raw : 'moyenne') as ActionPriority;
  const priority = priorityConfig[actionPriorite] ?? priorityConfig.moyenne;

  // Formater le montant
  const formattedAmount = action.montant
    ? action.montant >= 1000000
      ? `${(action.montant / 1000000).toFixed(1)}M FCFA`
      : `${(action.montant / 1000).toFixed(0)}K FCFA`
    : null;

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-colors min-w-0 overflow-hidden',
        'bg-slate-800/50 border-slate-700/50',
        onClick && 'cursor-pointer hover:bg-slate-800/70 hover:border-slate-600/50',
        className
      )}
      onClick={onClick}
      style={{ padding: 'clamp(0.75rem, 1.5vw, 1rem)', minHeight: '120px' }}
    >
      {/* Header: Type + Priority */}
      <div className="flex items-start justify-between mb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn('rounded border', type.bg, type.border)} style={{ padding: 'clamp(0.25rem, 0.5vw, 0.375rem)' }}>
            <TypeIcon className={cn(type.color)} style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
          </div>
          <Badge
            variant="default"
            className={cn('border', priority?.bg ?? 'bg-amber-500/20', priority?.color ?? 'text-amber-400')}
            style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}
          >
            {priority?.label ?? 'Moyenne'}
          </Badge>
          {action.code && (
            <Badge
              variant="default"
              className="border bg-slate-700/50 text-slate-300 border-slate-600/50"
              style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}
            >
              {action.code}
            </Badge>
          )}
        </div>
        {onClick && (
          <ArrowRight className="text-slate-400" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
        )}
      </div>

      {/* Titre */}
      <h3 className="font-semibold text-slate-200 mb-2 line-clamp-2 min-w-0" style={{ fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' }}>
        {action.titre}
      </h3>

      {/* Projet */}
      {action.projet && (
        <p className="text-slate-400 mb-2" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
          {action.projet.nom}
        </p>
      )}

      {/* Montant */}
      {formattedAmount && (
        <p className="font-bold text-slate-300 mb-2" style={{ fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' }}>
          {formattedAmount}
        </p>
      )}

      {/* Footer: Deadline + Responsable */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Clock className="text-slate-400 flex-shrink-0" style={{ width: 'clamp(0.75rem, 0.875vw, 0.875rem)', height: 'clamp(0.75rem, 0.875vw, 0.875rem)', minWidth: '0.75rem', minHeight: '0.75rem' }} />
          <span className="text-slate-400 truncate" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>{action.deadline}</span>
        </div>
        {action.responsable && (
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <User className="text-slate-400 flex-shrink-0" style={{ width: 'clamp(0.75rem, 0.875vw, 0.875rem)', height: 'clamp(0.75rem, 0.875vw, 0.875rem)', minWidth: '0.75rem', minHeight: '0.75rem' }} />
            <span className="text-slate-400 truncate" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>{action.responsable.nom}</span>
          </div>
        )}
      </div>
    </div>
  );
});

ActionItem.displayName = 'ActionItem';
