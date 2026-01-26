/**
 * Composant RiskScoreCard - Carte de score de risque harmonisée
 * Utilisé dans le Risk Radar
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type RiskImpact = 'mineur' | 'moyen' | 'majeur' | 'critique';
export type RiskProbability = 'faible' | 'moyenne' | 'elevee' | 'certaine';

export interface RiskScoreCardData {
  id: string;
  titre: string;
  description: string;
  score: number; // 0-100
  impact: RiskImpact;
  probabilite: RiskProbability;
  age?: number; // en jours
  source?: string;
  projet?: {
    id: string;
    nom: string;
  };
}

interface RiskScoreCardProps {
  risk: RiskScoreCardData;
  onClick?: () => void;
  className?: string;
}

const impactConfig = {
  critique: {
    label: 'Critique',
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    icon: AlertTriangle,
  },
  majeur: {
    label: 'Majeur',
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    icon: AlertCircle,
  },
  moyen: {
    label: 'Moyen',
    color: 'text-amber-400',
    bg: 'bg-amber-500/20',
    border: 'border-amber-500/50',
    icon: Info,
  },
  mineur: {
    label: 'Mineur',
    color: 'text-blue-400',
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    icon: CheckCircle,
  },
};

const probabilityConfig = {
  certaine: { label: 'Certaine', color: 'text-red-400' },
  elevee: { label: 'Élevée', color: 'text-orange-400' },
  moyenne: { label: 'Moyenne', color: 'text-amber-400' },
  faible: { label: 'Faible', color: 'text-blue-400' },
};

/**
 * Composant RiskScoreCard harmonisé
 */
export const RiskScoreCard = memo(function RiskScoreCard({
  risk,
  onClick,
  className,
}: RiskScoreCardProps) {
  // Validation et fallback pour l'impact (normaliser clé)
  const rawImpact = (risk.impact || 'moyen').toString().toLowerCase();
  const riskImpact = (['critique', 'majeur', 'moyen', 'mineur'].includes(rawImpact) ? rawImpact : 'moyen') as RiskImpact;
  const impact = impactConfig[riskImpact] ?? impactConfig.moyen;
  const ImpactIcon = impact?.icon ?? Info;

  // Validation et fallback pour la probabilité
  const riskProbabilite = risk.probabilite || 'moyenne';
  const probability = probabilityConfig[riskProbabilite] || probabilityConfig.moyenne;

  // Calculer la couleur du score
  const scoreColor = risk.score >= 80
    ? 'text-red-400'
    : risk.score >= 60
    ? 'text-orange-400'
    : risk.score >= 40
    ? 'text-amber-400'
    : 'text-blue-400';

  return (
    <div
      className={cn(
        'group relative rounded-2xl border border-slate-800/60 bg-slate-900/40 backdrop-blur-sm',
        'transition-all duration-300 min-w-0 overflow-hidden',
        onClick && 'cursor-pointer hover:border-slate-700/80 hover:bg-slate-900/60 hover:shadow-xl hover:shadow-slate-900/50',
        className
      )}
      onClick={onClick}
      style={{ padding: 'clamp(1rem, 1.5vw, 1.25rem)', minHeight: '140px' }}
    >
      {/* Accent bar en haut */}
      <div className={cn('absolute inset-x-0 top-0 h-1 rounded-t-2xl', impact.bg)} />
      
      {/* Header: Score + Impact */}
      <div className="flex items-start justify-between mb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn('p-1.5 rounded-lg', impact.bg, 'bg-opacity-20')}>
            <ImpactIcon className={cn(impact.color)} style={{ width: '0.875rem', height: '0.875rem', minWidth: '0.875rem', minHeight: '0.875rem' }} />
          </div>
          <Badge
            variant="outline"
            className={cn(
              'border-0 px-2 py-0.5 rounded-md text-xs font-medium',
              impact.bg,
              impact.color,
              'bg-opacity-20'
            )}
          >
            {impact.label}
          </Badge>
        </div>
        <div className="text-right">
          <p className={cn('font-bold leading-none', scoreColor)} style={{ fontSize: 'clamp(1.5rem, 2.5vw, 1.875rem)' }}>
            {risk.score}
          </p>
          <p className="text-slate-500 text-[10px] uppercase tracking-wider mt-0.5">Score</p>
        </div>
      </div>

      {/* Titre - Réduit pour être proportionnel */}
      <h3 className="text-xs font-medium text-slate-300 mb-2 line-clamp-2 leading-snug min-w-0">
        {risk.titre}
      </h3>

      {/* Description */}
      <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 leading-relaxed min-w-0">
        {risk.description}
      </p>

      {/* Footer: Probabilité + Age */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50 mt-auto">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[10px]">Probabilité:</span>
          <span className={cn('font-semibold text-xs', probability.color)}>
            {probability.label}
          </span>
        </div>
        {risk.age !== undefined && (
          <span className="text-slate-500 text-[10px] font-medium">
            {risk.age}j
          </span>
        )}
      </div>
    </div>
  );
});

RiskScoreCard.displayName = 'RiskScoreCard';
