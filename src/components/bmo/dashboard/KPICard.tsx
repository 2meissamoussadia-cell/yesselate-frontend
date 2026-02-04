'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';
import * as Icons from 'lucide-react';

export interface KPICardProps {
  value: number | string;
  label: string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  progress?: number;
  icon?: keyof typeof Icons;
  color?: 'blue' | 'green' | 'red' | 'orange' | 'purple';
}

const colorClasses = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
};

const progressBarClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  purple: 'bg-purple-500',
} as const;

export const KPICard = React.memo(function KPICard({
  value,
  label,
  subtitle,
  trend,
  progress,
  icon,
  color = 'blue',
}: KPICardProps) {
  const Icon = icon ? (Icons[icon] as React.ComponentType<{ className?: string }>) : null;

  return (
    <div className="space-y-3">
      {Icon && (
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            colorClasses[color]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}

      <div>
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</div>
        {subtitle && (
          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>

      {trend && (
        <div
          className={cn(
            'flex items-center gap-1 text-sm',
            trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          )}
        >
          {trend.direction === 'up' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}

      {progress !== undefined && (
        <div className="space-y-1">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', progressBarClasses[color])}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 text-right">{progress}%</div>
        </div>
      )}
    </div>
  );
});
