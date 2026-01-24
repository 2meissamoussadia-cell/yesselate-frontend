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
        'rounded-xl border p-4 transition-all duration-200',
        impact.bg,
        impact.border,
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
      style={{ padding: 'clamp(0.75rem, 1.5vw, 1rem)', minHeight: '120px' }}
    >
      {/* Header: Score + Impact */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <ImpactIcon className={cn(impact.color)} style={{ width: 'clamp(1rem, 1.25vw, 1.25rem)', height: 'clamp(1rem, 1.25vw, 1.25rem)', minWidth: '1rem', minHeight: '1rem' }} />
          <Badge
            variant="default"
            className={cn('border', impact.bg, impact.border, impact.color)}
            style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
          >
            {impact.label}
          </Badge>
        </div>
        <div className="text-right">
          <p className={cn('font-bold', scoreColor)} style={{ fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' }}>
            {risk.score}
          </p>
          <p className="text-slate-400" style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}>Score</p>
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
          <span className="text-slate-500" style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}>Probabilité:</span>
          <span className={cn('font-medium', probability.color)} style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
            {probability.label}
          </span>
        </div>
        {risk.age !== undefined && (
          <span className="text-slate-500" style={{ fontSize: 'clamp(0.5625rem, 0.7vw, 0.625rem)' }}>
            {risk.age}j
          </span>
        )}
      </div>
    </div>
  );
});

RiskScoreCard.displayName = 'RiskScoreCard';
