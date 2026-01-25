'use client';

import React, { memo } from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { SparklineChart } from './SparklineChart';

type Tone = 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'slate';
type TrendDir = 'up' | 'down' | 'flat';
type TrendSentiment = 'good' | 'bad' | 'neutral';
type KpiSize = 'sm' | 'md' | 'lg';

// Type SparkPoint pour compatibilité avec SparklineChart
export type SparkPoint = number;

interface KpiStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  description?: string;
  trendLabel?: string;
  trendDirection?: TrendDir;
  trendSentiment?: TrendSentiment;
  sparkline?: SparkPoint[];
  onClick?: () => void;
  className?: string;
  size?: KpiSize;
}

const TONE = {
  blue: { ring: 'ring-blue-500/15', iconBg: 'bg-blue-500/12', icon: 'text-blue-300', dot: 'bg-blue-400/70' },
  emerald: { ring: 'ring-emerald-500/15', iconBg: 'bg-emerald-500/12', icon: 'text-emerald-300', dot: 'bg-emerald-400/70' },
  amber: { ring: 'ring-amber-500/15', iconBg: 'bg-amber-500/12', icon: 'text-amber-300', dot: 'bg-amber-400/70' },
  red: { ring: 'ring-red-500/15', iconBg: 'bg-red-500/12', icon: 'text-red-300', dot: 'bg-red-400/70' },
  purple: { ring: 'ring-purple-500/15', iconBg: 'bg-purple-500/12', icon: 'text-purple-300', dot: 'bg-purple-400/70' },
  slate: { ring: 'ring-slate-500/10', iconBg: 'bg-slate-500/10', icon: 'text-slate-200', dot: 'bg-slate-300/60' },
} as const;

// Helper pour générer des styles adaptatifs
const getSizeStyles = (size: KpiSize) => {
  const base = {
    sm: {
      root: { padding: 'clamp(0.75rem, 1.5vw, 1rem)', minHeight: '80px' },
      label: { fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' },
      value: { fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' },
      desc: { fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' },
      iconWrap: { width: 'clamp(2.25rem, 2.75vw, 2.5rem)', height: 'clamp(2.25rem, 2.75vw, 2.5rem)', minWidth: '2.25rem', minHeight: '2.25rem', maxWidth: '2.5rem', maxHeight: '2.5rem' },
      icon: { width: 'clamp(1rem, 1.25vw, 1.125rem)', height: 'clamp(1rem, 1.25vw, 1.125rem)', minWidth: '1rem', minHeight: '1rem', maxWidth: '1.125rem', maxHeight: '1.125rem' },
      sparkWrap: { height: 'clamp(1rem, 1.25vw, 1.25rem)', width: 'clamp(3.5rem, 4.5vw, 4rem)' },
    },
    md: {
      root: { padding: 'clamp(1rem, 1.75vw, 1.25rem)', minHeight: '100px' },
      label: { fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' },
      value: { fontSize: 'clamp(1.25rem, 2vw, 1.5rem)' },
      desc: { fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' },
      iconWrap: { width: 'clamp(2.5rem, 3vw, 2.75rem)', height: 'clamp(2.5rem, 3vw, 2.75rem)', minWidth: '2.5rem', minHeight: '2.5rem', maxWidth: '2.75rem', maxHeight: '2.75rem' },
      icon: { width: 'clamp(1.125rem, 1.5vw, 1.25rem)', height: 'clamp(1.125rem, 1.5vw, 1.25rem)', minWidth: '1.125rem', minHeight: '1.125rem', maxWidth: '1.25rem', maxHeight: '1.25rem' },
      sparkWrap: { height: 'clamp(1.25rem, 1.5vw, 1.5rem)', width: 'clamp(4.5rem, 5.5vw, 5rem)' },
    },
    lg: {
      root: { padding: 'clamp(1.25rem, 2vw, 1.5rem)', minHeight: '120px' },
      label: { fontSize: 'clamp(0.875rem, 1.2vw, 0.9375rem)' },
      value: { fontSize: 'clamp(1.5rem, 2.5vw, 1.875rem)' },
      desc: { fontSize: 'clamp(0.875rem, 1.2vw, 0.9375rem)' },
      iconWrap: { width: 'clamp(2.5rem, 3vw, 2.75rem)', height: 'clamp(2.5rem, 3vw, 2.75rem)', minWidth: '2.5rem', minHeight: '2.5rem', maxWidth: '2.75rem', maxHeight: '2.75rem' },
      icon: { width: 'clamp(1.125rem, 1.5vw, 1.25rem)', height: 'clamp(1.125rem, 1.5vw, 1.25rem)', minWidth: '1.125rem', minHeight: '1.125rem', maxWidth: '1.25rem', maxHeight: '1.25rem' },
      sparkWrap: { height: 'clamp(1.5rem, 2vw, 1.75rem)', width: 'clamp(5.5rem, 6.5vw, 6rem)' },
    },
  };
  return base[size];
};

const SIZE = {
  sm: {
    root: 'rounded-2xl',
    label: '',
    value: '',
    desc: '',
    iconWrap: '',
    icon: '',
    sparkWrap: '',
  },
  md: {
    root: 'rounded-2xl',
    label: '',
    value: '',
    desc: '',
    iconWrap: '',
    icon: '',
    sparkWrap: '',
  },
  lg: {
    root: 'rounded-2xl',
    label: '',
    value: '',
    desc: '',
    iconWrap: '',
    icon: '',
    sparkWrap: '',
  },
} as const;

const TrendBadge = memo(function TrendBadge({
  label,
  direction = 'flat',
  sentiment = 'neutral',
}: {
  label: string;
  direction?: TrendDir;
  sentiment?: TrendSentiment;
}) {
  const arrow = direction === 'up' ? '↗' : direction === 'down' ? '↘' : '→';
  const color =
    sentiment === 'good'
      ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20'
      : sentiment === 'bad'
      ? 'text-red-300 bg-red-500/10 border-red-500/20'
      : 'text-slate-200 bg-slate-500/10 border-slate-500/15';

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px]', color)}>
      <span className="opacity-90">{arrow}</span>
      <span className="font-medium">{label}</span>
    </span>
  );
});

export const KpiStatCard = memo(function KpiStatCard({
  label,
  value,
  icon: Icon,
  tone = 'slate',
  description,
  trendLabel,
  trendDirection,
  trendSentiment,
  sparkline,
  onClick,
  className,
  size = 'md',
}: KpiStatCardProps) {
  const t = TONE[tone];
  const s = SIZE[size];
  const sizeStyles = getSizeStyles(size);

  const clickable = Boolean(onClick);
  const Wrapper: any = clickable ? 'button' : 'div';

  return (
    <Wrapper
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden border border-slate-800/60 bg-slate-900/35 shadow-[0_0_0_1px_rgba(255,255,255,.02),0_10px_30px_rgba(0,0,0,.35)]',
        'transition-[background,border,box-shadow,transform] duration-200',
        'hover:bg-slate-900/45 hover:border-slate-700/60 hover:shadow-[0_0_0_1px_rgba(255,255,255,.03),0_14px_40px_rgba(0,0,0,.45)]',
        clickable && 'active:translate-y-[1px] cursor-pointer',
        'ring-1',
        t.ring,
        s.root,
        className
      )}
      style={sizeStyles.root}
      aria-label={clickable ? `${label} — voir détails` : undefined}
    >
      {/* highlight très léger */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 [background:radial-gradient(600px_circle_at_20%_0%,rgba(255,255,255,.06),transparent_45%)]" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} />
            <p className={cn('font-medium tracking-wide uppercase text-slate-300', s.label)}>{label}</p>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className={cn('font-semibold tracking-tight text-white', s.value)}>{value}</p>
            {trendLabel ? (
              <TrendBadge label={trendLabel} direction={trendDirection} sentiment={trendSentiment} />
            ) : null}
          </div>
          {description ? <p className={cn('mt-2 text-slate-400', s.desc)}>{description}</p> : null}
        </div>

        <div className={cn('flex shrink-0 items-center justify-center rounded-xl border border-slate-800/60', t.iconBg, s.iconWrap)} style={sizeStyles.iconWrap}>
          <Icon className={cn(t.icon, s.icon)} style={sizeStyles.icon} />
        </div>
      </div>

      {sparkline && sparkline.length > 1 ? (
        <div className="relative mt-3 flex items-center justify-between">
          <div className="h-[1px] flex-1 bg-slate-800/70" />
          <div className={cn('ml-3', s.sparkWrap)} style={sizeStyles.sparkWrap}>
            <SparklineChart data={sparkline} />
          </div>
        </div>
      ) : null}
    </Wrapper>
  );
});
