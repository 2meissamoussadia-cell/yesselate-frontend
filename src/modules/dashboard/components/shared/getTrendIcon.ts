/**
 * Utilitaires pour les icônes et couleurs de tendance
 * Utilisé par KPICard modernisé
 */

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export type TrendType = 'up' | 'down' | 'neutral';

export function getTrendIcon(
  trendType?: TrendType,
  trend?: number | string
): React.ComponentType<{ className?: string }> | null {
  const num = typeof trend === 'string' ? parseFloat(trend) : trend;
  if (trendType === 'up' || (typeof num === 'number' && !Number.isNaN(num) && num > 0)) {
    return ArrowUpRight;
  }
  if (trendType === 'down' || (typeof num === 'number' && !Number.isNaN(num) && num < 0)) {
    return ArrowDownRight;
  }
  if (trendType === 'neutral' || num === 0) {
    return Minus;
  }
  return null;
}

export function getTrendColor(
  trendType?: TrendType,
  trend?: number | string
): string {
  const num = typeof trend === 'string' ? parseFloat(trend) : trend;
  if (trendType === 'up' || (typeof num === 'number' && !Number.isNaN(num) && num > 0)) {
    return 'text-emerald-400';
  }
  if (trendType === 'down' || (typeof num === 'number' && !Number.isNaN(num) && num < 0)) {
    return 'text-red-400';
  }
  return 'text-slate-400';
}
