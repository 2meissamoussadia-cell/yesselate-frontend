/**
 * KPI Card Clean — style corporate (Procore / SAP Fiori).
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type KpiCardCleanColor = 'blue' | 'green' | 'yellow' | 'red';

export interface KpiCardCleanProps {
  title: string;
  value: string | number;
  trend: string;
  color?: KpiCardCleanColor;
  critical?: boolean;
  onClick?: () => void;
}

const colorClasses: Record<KpiCardCleanColor, string> = {
  blue: 'border-blue-200/50 dark:border-blue-800/50 hover:shadow-blue-500/10',
  green: 'border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-emerald-500/10',
  yellow: 'border-amber-200/50 dark:border-amber-800/50 hover:shadow-amber-500/10',
  red: 'border-red-200/50 dark:border-red-800/50 hover:shadow-red-500/10',
};

export function KpiCardClean({
  title,
  value,
  trend,
  color = 'blue',
  critical = false,
  onClick,
}: KpiCardCleanProps) {
  const isPositive = typeof trend === 'string' && trend.includes('+');

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl p-6 border shadow-lg transition-all group',
        colorClasses[color],
        critical && 'ring-2 ring-red-200/50 dark:ring-red-900/50 animate-pulse',
        onClick && 'cursor-pointer hover:shadow-xl'
      )}
    >
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">{title}</div>
      <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{value}</div>
      <div
        className={cn(
          'text-sm font-medium',
          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}
      >
        {trend}
      </div>
    </div>
  );
}
