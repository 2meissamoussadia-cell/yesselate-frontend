/**
 * Carte d'Analyse BTP
 * Composant réutilisable pour afficher des analyses avec graphiques et métriques
 */

'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';

interface BTPAnalysisCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  icon?: React.ComponentType<{ className?: string }>;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function BTPAnalysisCard({
  title,
  value,
  trend,
  icon: Icon,
  children,
  className,
  onClick,
}: BTPAnalysisCardProps) {
  const TrendIcon = trend
    ? trend.isPositive
      ? TrendingUp
      : trend.value === 0
      ? Minus
      : TrendingDown
    : null;

  const cardContent = (
    <FluentCard
      className={cn('hover:border-blue-500/50 transition-colors', onClick && 'cursor-pointer', className)}
    >
      <FluentCardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <FluentCardTitle className="text-sm font-medium text-slate-400">{title}</FluentCardTitle>
          {Icon && <Icon className="h-4 w-4 text-slate-400" />}
        </div>
      </FluentCardHeader>
      <FluentCardContent>
        <div className="space-y-2">
          <div className="text-2xl font-semibold text-slate-200">{value}</div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium',
                trend.isPositive ? 'text-emerald-400' : trend.value === 0 ? 'text-slate-400' : 'text-red-400'
              )}
            >
              {TrendIcon && <TrendIcon className="h-3.5 w-3.5" />}
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-400">{trend.label}</span>
            </div>
          )}
          {children}
        </div>
      </FluentCardContent>
    </FluentCard>
  );

  if (onClick) {
    return (
      <div onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
        {cardContent}
      </div>
    );
  }

  return cardContent;
}

