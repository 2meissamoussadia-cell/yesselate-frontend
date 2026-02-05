/**
 * KpiTile
 * - Tuile KPI compacte (style SaaS)
 * - Accessibilité : bouton focusable
 * - Variantes couleur + tendance
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

export type KpiTileColor =
  | 'slate'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'indigo'
  | 'cyan'
  | 'violet';

export type KpiTileTrendDir = 'up' | 'down' | 'flat';
export type KpiTileTrendSentiment = 'neutral' | 'positive' | 'negative';

export interface KpiTileProps {
  label: string;
  value: string | number;
  color?: KpiTileColor;
  Icon?: LucideIcon;

  trendLabel?: string; // ex: +12%, -3j
  trendDir?: KpiTileTrendDir;
  trendSentiment?: KpiTileTrendSentiment;

  onClick?: () => void;
  className?: string;
  sparkline?: number[];
  /** Taille du tile (impacte la densité) */
  size?: 'sm' | 'md';
}

const ACCENT: Record<KpiTileColor, string> = {
  slate: 'bg-slate-500/70',
  emerald: 'bg-emerald-400/80',
  amber: 'bg-amber-400/80',
  rose: 'bg-rose-400/80',
  indigo: 'bg-indigo-400/80',
  cyan: 'bg-cyan-400/80',
  violet: 'bg-violet-400/80',
};

export const KpiTile = React.memo(function KpiTile({
  label,
  value,
  color = 'slate',
  Icon,
  trendLabel,
  trendDir = 'flat',
  trendSentiment = 'neutral',
  sparkline,
  size = 'md',
  className,
  onClick,
}: KpiTileProps) {
  const sentimentClass =
    trendSentiment === 'positive'
      ? 'text-emerald-300'
      : trendSentiment === 'negative'
        ? 'text-rose-300'
        : 'text-slate-400';

  const isSm = size === 'sm';
  const pad = isSm ? 'p-3' : 'p-4';
  const labelCls = isSm ? 'text-[11px]' : 'text-[12px]';
  const valueCls = isSm ? 'text-xl' : 'text-2xl';
  const iconBoxCls = isSm ? 'h-6 w-6 rounded-md' : 'h-7 w-7 rounded-lg';
  const iconCls = isSm ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const accentInsetCls = isSm ? 'top-2 bottom-2' : 'top-3 bottom-3';
  const trendMtCls = isSm ? 'mt-1.5' : 'mt-2';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full text-left rounded-xl border border-slate-800/70 bg-slate-950/30',
        pad,
        'transition-colors hover:bg-slate-950/50',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/40',
        className
      )}
    >
      {/* Accent */}
      <span className={cn('absolute left-0 w-1 rounded-full', accentInsetCls, ACCENT[color])} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {Icon ? (
              <span
                className={cn(
                  'inline-flex items-center justify-center bg-slate-900/40 ring-1 ring-slate-800/60',
                  iconBoxCls
                )}
              >
                <Icon className={cn('text-slate-200', iconCls)} />
              </span>
            ) : null}
            <p className={cn(labelCls, 'font-semibold text-slate-200 truncate')}>{label}</p>
          </div>
          <p className={cn('mt-1 font-bold text-white tabular-nums', valueCls)}>{value}</p>
        </div>

        {trendLabel ? (
          <div className={cn(trendMtCls, 'flex items-center gap-1 text-xs font-medium', sentimentClass)}>
            {trendDir === 'up' ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : trendDir === 'down' ? (
              <ArrowDownRight className="h-3.5 w-3.5" />
            ) : (
              <Minus className="h-3.5 w-3.5" />
            )}
            <span>{trendLabel}</span>
          </div>
        ) : null}
      </div>

      {/* Sparkline (optionnel) */}
      {sparkline?.length ? (
        <div className="mt-3 h-8 w-full overflow-hidden rounded-lg bg-slate-900/40 ring-1 ring-slate-800/60">
          <div className="flex h-full w-full items-end gap-[2px] px-2 py-1">
            {sparkline.slice(-24).map((v, i) => {
              const h = Math.max(2, Math.min(100, v));
              return (
                <span
                  key={i}
                  className={cn('w-full rounded-sm', ACCENT[color])}
                  style={{ height: `${h}%`, opacity: 0.25 + (i / 24) * 0.55 }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </button>
  );
});

