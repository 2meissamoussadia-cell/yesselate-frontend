/**
 * KPILine - Composant de ligne KPI pour le design system
 * 
 * Affiche une ligne simple avec label, valeur et trend
 * Utilisé dans les listes de KPIs, tableaux, etc.
 * 
 * @example
 * ```tsx
 * <KPILine 
 *   label="Demandes" 
 *   value={247} 
 *   tone="ok" 
 *   trend="+12%" 
 * />
 * ```
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { parseTrendPercent, toneToColor } from '@lib-root/dashboard/kpi';
import type { TrendDir, Tone } from '@lib-root/dashboard/kpi';

// ============================================
// TYPES
// ============================================

export interface KPILineProps {
  /**
   * Label de la ligne KPI
   */
  label: string;

  /**
   * Valeur du KPI (string ou number)
   */
  value: string | number;

  /**
   * Tonalité du KPI (ok, warn, crit, info)
   * @default 'info'
   */
  tone?: Tone;

  /**
   * Trend (string ou number)
   * Exemples: "+12%", "-5%", "—", 12, -5
   */
  trend?: string | number;

  /**
   * Classes CSS additionnelles
   */
  className?: string;
}

// ============================================
// COMPOSANT
// ============================================

// Mapping des couleurs pour les classes Tailwind (nécessaire pour la compilation)
const colorClasses = {
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
  blue: 'text-blue-400',
} as const;

export function KPILine({
  label,
  value,
  tone = 'info',
  trend,
  className,
}: KPILineProps) {
  // Parser le trend
  const trendValue = parseTrendPercent(trend);
  
  // Convertir tone en couleur Tailwind
  const color = toneToColor(tone);
  
  // Déterminer la direction du trend
  const trendDir: TrendDir =
    trendValue > 0 ? 'up' : trendValue < 0 ? 'down' : 'neutral';

  // Formater l'affichage du trend
  const trendDisplay =
    trendDir === 'up'
      ? `+${trendValue}%`
      : trendDir === 'down'
      ? `-${Math.abs(trendValue)}%`
      : '—';

  return (
    <div className={cn('flex items-center justify-between py-1 min-w-0', className)}>
      <span className="text-slate-300 truncate min-w-0 flex-1">{label}</span>
      <span className="text-slate-50 font-semibold mx-3 flex-shrink-0 tabular-nums">
        {value}
      </span>
      <span
        className={cn(
          'text-xs font-medium tabular-nums whitespace-nowrap flex-shrink-0',
          colorClasses[color]
        )}
      >
        {trendDisplay}
      </span>
    </div>
  );
}
