'use client';

/**
 * PriorityIndicator — Indicateurs de priorité SVG (remplace les emojis)
 * 
 * Remplace les 🚩 emojis par des icônes SVG cohérentes avec tooltips.
 * Sémantique claire : critique, haute, moyenne, basse.
 */

import React from 'react';
import { cn } from '@/lib/cn';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  AlertTriangle, 
  AlertCircle, 
  Flag, 
  ArrowUp, 
  ArrowDown,
  Minus,
  Flame,
  Zap,
} from 'lucide-react';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface PriorityIndicatorProps {
  /** Niveau de priorité */
  priority: PriorityLevel;
  /** Afficher le tooltip */
  showTooltip?: boolean;
  /** Taille de l'icône */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Variante d'affichage */
  variant?: 'icon' | 'dot' | 'badge' | 'flag';
  /** Afficher le label textuel */
  showLabel?: boolean;
  /** Classes additionnelles */
  className?: string;
}

const priorityConfig: Record<PriorityLevel, {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}> = {
  critical: {
    label: 'Critique',
    description: 'Action immédiate requise',
    icon: Flame,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-200 dark:border-red-800',
    dotColor: 'bg-red-500',
  },
  high: {
    label: 'Haute',
    description: 'Action requise sous 24h',
    icon: AlertTriangle,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    dotColor: 'bg-orange-500',
  },
  medium: {
    label: 'Moyenne',
    description: 'Action requise cette semaine',
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    dotColor: 'bg-amber-500',
  },
  low: {
    label: 'Basse',
    description: 'À traiter quand possible',
    icon: ArrowDown,
    color: 'text-sky-600 dark:text-sky-400',
    bgColor: 'bg-sky-100 dark:bg-sky-900/30',
    borderColor: 'border-sky-200 dark:border-sky-800',
    dotColor: 'bg-sky-500',
  },
  none: {
    label: 'Non définie',
    description: 'Priorité non assignée',
    icon: Minus,
    color: 'text-slate-400 dark:text-slate-500',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    borderColor: 'border-slate-200 dark:border-slate-700',
    dotColor: 'bg-slate-400',
  },
};

const sizeConfig = {
  xs: { icon: 'w-3 h-3', dot: 'w-1.5 h-1.5', badge: 'text-[10px] px-1.5 py-0.5' },
  sm: { icon: 'w-4 h-4', dot: 'w-2 h-2', badge: 'text-xs px-2 py-0.5' },
  md: { icon: 'w-5 h-5', dot: 'w-2.5 h-2.5', badge: 'text-sm px-2.5 py-1' },
  lg: { icon: 'w-6 h-6', dot: 'w-3 h-3', badge: 'text-base px-3 py-1.5' },
};

export function PriorityIndicator({
  priority,
  showTooltip = true,
  size = 'sm',
  variant = 'icon',
  showLabel = false,
  className,
}: PriorityIndicatorProps) {
  const config = priorityConfig[priority];
  const sizes = sizeConfig[size];
  const Icon = config.icon;

  const renderContent = () => {
    switch (variant) {
      case 'dot':
        return (
          <span
            className={cn(
              'inline-block rounded-full',
              sizes.dot,
              config.dotColor,
              priority === 'critical' && 'animate-pulse'
            )}
            aria-hidden="true"
          />
        );

      case 'badge':
        return (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md font-medium border',
              sizes.badge,
              config.bgColor,
              config.color,
              config.borderColor
            )}
          >
            <Icon className={sizes.icon} />
            {showLabel && <span>{config.label}</span>}
          </span>
        );

      case 'flag':
        return (
          <Flag
            className={cn(
              sizes.icon,
              config.color,
              priority === 'critical' && 'animate-pulse'
            )}
            fill={priority === 'critical' || priority === 'high' ? 'currentColor' : 'none'}
          />
        );

      case 'icon':
      default:
        return (
          <span className={cn('inline-flex items-center gap-1.5', config.color)}>
            <Icon className={sizes.icon} />
            {showLabel && (
              <span className={cn('font-medium', size === 'xs' ? 'text-[10px]' : 'text-xs')}>
                {config.label}
              </span>
            )}
          </span>
        );
    }
  };

  const content = (
    <span
      className={cn('inline-flex items-center', className)}
      role="img"
      aria-label={`Priorité ${config.label}`}
    >
      {renderContent()}
    </span>
  );

  if (!showTooltip) {
    return content;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">Priorité {config.label}</p>
          <p className="text-xs text-slate-400">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * PriorityDot — Version minimaliste (point coloré)
 */
export function PriorityDot({
  priority,
  size = 'sm',
  pulse = false,
  className,
}: {
  priority: PriorityLevel;
  size?: 'xs' | 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}) {
  const config = priorityConfig[priority];
  const dotSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'inline-block rounded-full',
              dotSizes[size],
              config.dotColor,
              (pulse || priority === 'critical') && 'animate-pulse',
              className
            )}
            role="img"
            aria-label={`Priorité ${config.label}`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Priorité {config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * PriorityBadge — Version badge avec label
 */
export function PriorityBadge({
  priority,
  size = 'sm',
  className,
}: {
  priority: PriorityLevel;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}) {
  return (
    <PriorityIndicator
      priority={priority}
      variant="badge"
      size={size}
      showLabel
      className={className}
    />
  );
}

/**
 * Utilitaire pour convertir un niveau numérique en PriorityLevel
 */
export function numericToPriority(level: number): PriorityLevel {
  if (level >= 4) return 'critical';
  if (level >= 3) return 'high';
  if (level >= 2) return 'medium';
  if (level >= 1) return 'low';
  return 'none';
}

/**
 * Utilitaire pour convertir une string en PriorityLevel
 */
export function stringToPriority(value: string | undefined | null): PriorityLevel {
  if (!value) return 'none';
  const normalized = value.toLowerCase().trim();
  
  const mapping: Record<string, PriorityLevel> = {
    'critical': 'critical',
    'critique': 'critical',
    'urgent': 'critical',
    'urgente': 'critical',
    'high': 'high',
    'haute': 'high',
    'élevée': 'high',
    'elevee': 'high',
    'medium': 'medium',
    'moyenne': 'medium',
    'normal': 'medium',
    'normale': 'medium',
    'low': 'low',
    'basse': 'low',
    'faible': 'low',
    'none': 'none',
    'aucune': 'none',
  };
  
  return mapping[normalized] ?? 'none';
}
