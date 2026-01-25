/**
 * Utilitaires pour les icônes et couleurs de tendance
 * Utilisé par KPICard modernisé
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export type TrendType = 'up' | 'down' | 'neutral';

export function getTrendIcon(
  trendType?: TrendType,
  trend?: number
): React.ComponentType<{ className?: string }> | null {
  if (trendType === 'up' || (typeof trend === 'number' && trend > 0)) {
    return ArrowUpRight;
  }
  if (trendType === 'down' || (typeof trend === 'number' && trend < 0)) {
    return ArrowDownRight;
  }
  if (trendType === 'neutral' || trend === 0) {
    return Minus;
  }
  return null;
}

export function getTrendColor(
  trendType?: TrendType,
  trend?: number
): string {
  if (trendType === 'up' || (typeof trend === 'number' && trend > 0)) {
    return 'text-emerald-400';
  }
  if (trendType === 'down' || (typeof trend === 'number' && trend < 0)) {
    return 'text-red-400';
  }
  return 'text-slate-400';
}
