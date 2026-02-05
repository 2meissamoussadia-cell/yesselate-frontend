/**
 * Composant KPI Panel pour afficher les indicateurs clés
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';

interface KpiPanelProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: 'purple' | 'yellow' | 'green' | 'blue' | 'red';
}

export function KpiPanel({
  icon: Icon,
  title,
  value,
  change,
  changeType,
  color = 'purple',
}: KpiPanelProps) {
  const colorClasses = {
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    green: 'text-green-400 bg-green-500/10 border-green-500/30',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    red: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const changeColorClasses = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-slate-400',
  };

  return (
    <div className={cn('bg-slate-800/50 rounded-lg p-4 border', colorClasses[color])}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={cn('h-5 w-5', colorClasses[color].split(' ')[0])} />
        {change && (
          <span className={cn('text-xs font-medium', changeColorClasses[changeType || 'neutral'])}>
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-200 mb-1">{value}</div>
      <div className="text-xs text-slate-400">{title}</div>
    </div>
  );
}

