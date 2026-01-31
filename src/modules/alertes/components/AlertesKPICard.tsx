/**
 * Composant KPI Card pour le module Alertes & Risques
 * Conforme au design system
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface AlertesKPICardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  color: 'critical' | 'warning' | 'info' | 'success' | 'muted';
  variation?: {
    value: string | number;
    trend: 'up' | 'down' | 'stable';
  };
  subtitle?: string;
  onClick?: () => void;
  className?: string;
}

const colorClasses = {
  critical: {
    icon: 'text-red-400',
    value: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  warning: {
    icon: 'text-amber-400',
    value: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  info: {
    icon: 'text-blue-400',
    value: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  success: {
    icon: 'text-emerald-400',
    value: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  muted: {
    icon: 'text-slate-400',
    value: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
  },
};

export function AlertesKPICard({
  icon: Icon,
  title,
  value,
  color,
  variation,
  subtitle,
  onClick,
  className,
}: AlertesKPICardProps) {
  const colors = colorClasses[color];
  const TrendIcon = variation?.trend === 'up' ? TrendingUp : variation?.trend === 'down' ? TrendingDown : Minus;

  return (
    <Card
      className={cn(
        'min-h-[120px] cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
        colors.bg,
        colors.border,
        onClick && 'hover:bg-opacity-20',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('p-2 rounded-lg', colors.bg)}>
            <Icon className={cn('h-5 w-5', colors.icon)} />
          </div>
          {variation && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                variation.trend === 'up' ? 'text-emerald-400' : variation.trend === 'down' ? 'text-red-400' : 'text-slate-400'
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{variation.value}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className={cn('text-2xl font-bold', colors.value)}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-2">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

