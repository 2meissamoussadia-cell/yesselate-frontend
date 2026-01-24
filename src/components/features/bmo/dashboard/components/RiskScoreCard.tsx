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
  // Validation et fallback pour l'impact
  const riskImpact = risk.impact || 'moyen';
  const impact = impactConfig[riskImpact] || impactConfig.moyen;
  const ImpactIcon = impact.icon;

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
        'rounded-xl border p-4 transition-all duration-200',
        impact.bg,
        impact.border,
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      {/* Header: Score + Impact */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <ImpactIcon className={cn('w-5 h-5', impact.color)} />
          <Badge
            variant="default"
            className={cn('text-xs border', impact.bg, impact.border, impact.color)}
          >
            {impact.label}
          </Badge>
        </div>
        <div className="text-right">
          <p className={cn('text-2xl font-bold', scoreColor)}>
            {risk.score}
          </p>
          <p className="text-[10px] text-slate-400">Score</p>
        </div>
      </div>

      {/* Titre */}
      <h3 className="text-sm font-semibold text-slate-200 mb-2 line-clamp-2">
        {risk.titre}
      </h3>

      {/* Description */}
      <p className="text-xs text-slate-400 mb-3 line-clamp-2">
        {risk.description}
      </p>

      {/* Footer: Probabilité + Age */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Probabilité:</span>
          <span className={cn('text-xs font-medium', probability.color)}>
            {probability.label}
          </span>
        </div>
        {risk.age !== undefined && (
          <span className="text-[10px] text-slate-500">
            {risk.age}j
          </span>
        )}
      </div>
    </div>
  );
});

RiskScoreCard.displayName = 'RiskScoreCard';
