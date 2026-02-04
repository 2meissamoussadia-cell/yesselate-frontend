'use client';

/**
 * PhaseBadge — Badge de phase BTP (Pré-projet, Conception, Gros œuvre, Réception, etc.)
 */

import React from 'react';
import { cn } from '@/lib/cn';

export type PhaseBadgeColor =
  | 'slate'
  | 'blue'
  | 'orange'
  | 'green'
  | 'red'
  | 'amber'
  | 'emerald'
  | 'violet';

const colorClasses: Record<PhaseBadgeColor, string> = {
  slate: 'bg-slate-800/60 text-slate-200 border-slate-600/50',
  blue: 'bg-blue-900/40 text-blue-200 border-blue-600/50',
  orange: 'bg-orange-900/40 text-orange-200 border-orange-600/50',
  green: 'bg-green-900/40 text-green-200 border-green-600/50',
  red: 'bg-red-900/40 text-red-200 border-red-600/50',
  amber: 'bg-amber-900/40 text-amber-200 border-amber-600/50',
  emerald: 'bg-emerald-900/40 text-emerald-200 border-emerald-600/50',
  violet: 'bg-violet-900/40 text-violet-200 border-violet-600/50',
};

export interface PhaseBadgeProps {
  /** Libellé affiché (ex. "Pré-projet", "Titre vérifié") */
  label: string;
  /** Couleur du badge */
  color?: PhaseBadgeColor;
  /** Phase métier 0–10 (optionnel, pour cohérence visuelle) */
  phase?: number;
  className?: string;
}

export function PhaseBadge({
  label,
  color = 'slate',
  phase,
  className,
}: PhaseBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium',
        colorClasses[color],
        className
      )}
      title={phase != null ? `Phase ${phase}` : undefined}
    >
      {phase != null && (
        <span className="opacity-70" aria-hidden>
          P{phase}
        </span>
      )}
      {label}
    </span>
  );
}
