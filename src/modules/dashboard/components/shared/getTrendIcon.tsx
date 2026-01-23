/**
 * Utilitaire pour obtenir l'icône de tendance
 * Mémorisé pour éviter les re-renders inutiles
 */

'use client';

import React, { memo } from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import type { KPITrend } from './KPISparkline';

interface TrendIconProps {
  trend: KPITrend;
  className?: string;
  size?: number;
}

/**
 * Composant mémorisé pour l'icône de tendance
 * Évite les re-renders inutiles en utilisant memo
 */
export const TrendIcon = memo(function TrendIcon({ 
  trend, 
  className = 'h-3 w-3',
  size 
}: TrendIconProps) {
  const iconSize = size ? `h-${size} w-${size}` : className;
  
  if (trend === 'up') {
    return <ArrowUpRight className={`${iconSize} text-emerald-400`} aria-hidden="true" />;
  }
  if (trend === 'down') {
    return <ArrowDownRight className={`${iconSize} text-red-400`} aria-hidden="true" />;
  }
  return <Minus className={`${iconSize} text-slate-400`} aria-hidden="true" />;
});

/**
 * Fonction utilitaire pour obtenir l'icône de tendance (version fonction)
 * Pour les cas où on ne peut pas utiliser le composant
 */
export function getTrendIcon(trend: KPITrend, className = 'h-3 w-3'): React.ReactElement {
  if (trend === 'up') {
    return <ArrowUpRight className={`${className} text-emerald-400`} aria-hidden="true" />;
  }
  if (trend === 'down') {
    return <ArrowDownRight className={`${className} text-red-400`} aria-hidden="true" />;
  }
  return <Minus className={`${className} text-slate-400`} aria-hidden="true" />;
}
