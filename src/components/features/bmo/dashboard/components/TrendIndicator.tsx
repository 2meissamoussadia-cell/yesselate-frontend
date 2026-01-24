/**
 * Composant TrendIndicator - Indicateur de tendance harmonisé
 * Affiche une flèche et un pourcentage de variation
 */

'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export type TrendType = 'up' | 'down' | 'neutral';

interface TrendIndicatorProps {
  value: number; // Pourcentage de variation (-100 à 100)
  type?: TrendType; // Override automatique si fourni
  showIcon?: boolean;
  showArrow?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: {
    text: 'text-[10px]',
    icon: 'w-3 h-3',
    gap: 'gap-0.5',
  },
  md: {
    text: 'text-xs',
    icon: 'w-3.5 h-3.5',
    gap: 'gap-1',
  },
  lg: {
    text: 'text-sm',
    icon: 'w-4 h-4',
    gap: 'gap-1.5',
  },
};

/**
 * Composant TrendIndicator harmonisé
 */
export const TrendIndicator = memo(function TrendIndicator({
  value,
  type,
  showIcon = true,
  showArrow = false,
  size = 'md',
  className,
}: TrendIndicatorProps) {
  const sizes = sizeClasses[size];
  
  // Déterminer le type de tendance
  const trendType: TrendType = type || (value > 0 ? 'up' : value < 0 ? 'down' : 'neutral');
  const absValue = Math.abs(value);
  const sign = value > 0 ? '+' : '';

  const Icon = showArrow 
    ? (trendType === 'up' ? ArrowUpRight : trendType === 'down' ? ArrowDownRight : Minus)
    : (trendType === 'up' ? TrendingUp : trendType === 'down' ? TrendingDown : Minus);

  if (trendType === 'neutral') {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center font-semibold rounded px-2 py-1',
        sizes.gap,
        trendType === 'up'
          ? 'bg-emerald-500/20 text-emerald-400'
          : 'bg-rose-500/20 text-rose-400',
        className
      )}
    >
      {showIcon && <Icon className={cn(sizes.icon)} />}
      <span className={sizes.text}>
        {sign}{absValue}%
      </span>
    </div>
  );
});

TrendIndicator.displayName = 'TrendIndicator';
