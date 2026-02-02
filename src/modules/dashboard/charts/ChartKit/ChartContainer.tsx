/**
 * ChartContainer - Container standardisé pour tous les charts du dashboard
 * 
 * Version simplifiée avec support pour ResponsiveContainer dans les enfants
 * 
 * @example
 * ```tsx
 * <ChartContainer title="Évolution des demandes">
 *   <ResponsiveContainer width="100%" height={300}>
 *     <LineChart data={data}>
 *       <CartesianGrid {...chartStyles.grid} />
 *       <XAxis {...chartStyles.axis} />
 *       <YAxis {...chartStyles.axis} />
 *       <Tooltip {...chartStyles.tooltip} />
 *       <Line dataKey="value" stroke={chartColors.primary.main} />
 *     </LineChart>
 *   </ResponsiveContainer>
 * </ChartContainer>
 * ```
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ChartContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  children,
  className,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'chart-container rounded-xl p-6',
        'bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50',
        className
      )}
    >
      {title && (
        <h3 className="text-lg font-semibold text-slate-200 mb-4">{title}</h3>
      )}
      <div className="h-64 min-h-[256px]">{children}</div>
    </div>
  );
}

// ============================================
// EXPORTS DES STYLES POUR USAGE DIRECT
// ============================================

export { chartStyles, chartColors, chartUI, chartMargins, chartHeights } from './chartTheme';
export type { ChartContainerProps as ChartContainerPropsType } from './types';
