/**
 * Helpers centralisés pour les KPIs
 * Source de vérité unique pour le formatage et le mapping des KPIs
 * 
 * Consolidation de colorMapping.ts et getTrendIcon.ts
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { 
  parseTrendPercent as parseTrendPercentBase,
  mapColorToTone,
  getTrendDirection,
  formatMoneyXOF,
  formatMoneyEUR,
  formatMoneyCompact,
  type TrendDirection,
  type KPICardColor,
  type KpiStatCardTone,
} from './colorMapping';

// Ré-exporter les helpers existants pour compatibilité
export {
  parseTrendPercentBase as parseTrendPercent,
  mapColorToTone,
  getTrendDirection,
  formatMoneyXOF,
  formatMoneyEUR,
  formatMoneyCompact,
  type TrendDirection,
  type KPICardColor,
  type KpiStatCardTone,
};

export type TrendType = 'up' | 'down' | 'neutral';

/**
 * Obtient l'icône de tendance appropriée
 * 
 * @param trendType - Type de tendance explicite
 * @param trend - Valeur de tendance (string ou number)
 * @returns Composant d'icône ou null
 */
export function getTrendIcon(
  trendType?: TrendType,
  trend?: number | string
): React.ComponentType<{ className?: string }> | null {
  const trendValue = typeof trend === 'string' 
    ? parseTrendPercentBase(trend) 
    : trend ?? 0;
  
  const direction = getTrendDirection(trendValue);
  
  if (direction === 'up' || trendType === 'up') {
    return ArrowUpRight;
  }
  if (direction === 'down' || trendType === 'down') {
    return ArrowDownRight;
  }
  return Minus;
}

/**
 * Obtient la classe CSS de couleur pour une tendance
 * 
 * @param trendType - Type de tendance explicite
 * @param trend - Valeur de tendance (string ou number)
 * @returns Classe CSS Tailwind
 */
export function getTrendColor(
  trendType?: TrendType,
  trend?: number | string
): string {
  const trendValue = typeof trend === 'string' 
    ? parseTrendPercentBase(trend) 
    : trend ?? 0;
  
  const direction = getTrendDirection(trendValue);
  
  if (direction === 'up' || trendType === 'up') {
    return 'text-emerald-400';
  }
  if (direction === 'down' || trendType === 'down') {
    return 'text-red-400';
  }
  return 'text-slate-400';
}

/**
 * Propriétés complètes d'une tendance
 */
export interface TrendProps {
  /** Icône de tendance */
  icon: React.ComponentType<{ className?: string }> | null;
  
  /** Classe CSS de couleur */
  color: string;
  
  /** Valeur numérique de la tendance */
  value: number;
  
  /** Direction de la tendance */
  direction: TrendDirection;
}

/**
 * Helper complet pour obtenir toutes les propriétés de tendance
 * 
 * @param trendType - Type de tendance explicite
 * @param trend - Valeur de tendance (string ou number)
 * @returns Objet avec toutes les propriétés de tendance
 */
export function getTrendProps(
  trendType?: TrendType,
  trend?: number | string
): TrendProps {
  const value = typeof trend === 'string' 
    ? parseTrendPercentBase(trend) 
    : trend ?? 0;
  
  return {
    icon: getTrendIcon(trendType, value),
    color: getTrendColor(trendType, value),
    value,
    direction: getTrendDirection(value),
  };
}
