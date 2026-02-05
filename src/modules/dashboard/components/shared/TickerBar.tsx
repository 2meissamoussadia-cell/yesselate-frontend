/**
 * TickerBar — Indicateurs KPI : barre, wallet ou popup
 * Affichage configurable (barre pleine largeur, widget compact, popover) et position (ancrage).
 */

'use client';

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Activity, Wallet, ChevronUp } from 'lucide-react';
import { KPISparkline } from './KPISparkline';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const SHORT_LABELS: Record<string, string> = {
  'Blocages': 'Blocages',
  'Taux utilisation': 'Taux util.',
  'Budget consommé': 'Budget',
  'Risques critiques': 'Risques',
  'Décisions en attente': 'Décisions',
  'Productivité (€/h MO)': 'Productivité',
  'Conformité SLA': 'Conformité',
  'Temps réponse': 'Temps répon.',
  'ROI moyen': 'ROI',
  'Délai paiement': 'Délai pgt',
  'Bilan carbone': 'Bilan C',
  'Chantiers en cours': 'Chantiers',
};

export interface TickerItem {
  label: string;
  value: string | number;
  delta?: string;
  tone?: 'ok' | 'warn' | 'crit' | 'info';
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
}

export type TickerDisplay = 'bar' | 'wallet' | 'pop';
export type TickerAnchor = 'bottom-left' | 'bottom-right' | 'bottom-center' | 'top-right';

export interface TickerBarProps {
  items: TickerItem[];
  className?: string;
  onClick?: (item: TickerItem) => void;
  /** Durée d'affichage de chaque carte (ms) */
  intervalMs?: number;
  /** 'absolute' = positionné par le parent. 'fixed' = barre fixe viewport. */
  position?: 'fixed' | 'absolute';
  /** Mode d'affichage : barre pleine largeur, wallet compact, ou popup. */
  display?: TickerDisplay;
  /** Ancrage : coin/côté où placer le ticker. */
  anchor?: TickerAnchor;
}

const ANCHOR_CLASSES: Record<TickerAnchor, string> = {
  'bottom-left': 'left-0 bottom-0',
  'bottom-right': 'right-0 bottom-0',
  'bottom-center': 'left-1/2 -translate-x-1/2 bottom-0',
  'top-right': 'right-0 top-0',
};

function TickerCard({
  item,
  onClick,
  toneClasses,
  compact = false,
}: {
  item: TickerItem;
  onClick?: (item: TickerItem) => void;
  toneClasses: string;
  compact?: boolean;
}) {
  const Icon = item.icon ?? Activity;
  const tone = item.tone ?? 'info';
  const trend = item.trend ?? 'neutral';
  return (
    <button
      type="button"
      onClick={() => onClick?.(item)}
      className={cn(
        'flex items-center gap-2 rounded-lg border cursor-pointer w-full text-left',
        'transition-shadow duration-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50',
        compact ? 'px-2.5 py-1.5 min-w-0' : 'px-3 py-2 min-w-[160px] max-w-[220px] hover:scale-[1.02] active:scale-[0.99]',
        toneClasses
      )}
      title={item.label}
    >
      <div className={cn('flex-shrink-0 rounded-md bg-slate-300 dark:bg-slate-900/50 flex items-center justify-center', compact ? 'w-6 h-6' : 'w-7 h-7')}>
        <Icon className={cn('text-slate-500 dark:text-slate-400', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn('uppercase tracking-wider text-slate-600 dark:text-slate-300', compact ? 'text-[9px]' : 'text-[10px]')} title={item.label}>
          {SHORT_LABELS[item.label] ?? item.label}
        </div>
        <div className={cn('font-semibold text-slate-900 dark:text-slate-100 tabular-nums leading-tight', compact ? 'text-xs' : 'text-sm')}>{String(item.value)}</div>
        {!compact && item.delta && item.delta !== '—' && (
          <div className="text-[10px] text-slate-600 dark:text-slate-400">{item.delta}</div>
        )}
      </div>
      <div className="flex-shrink-0 self-end">
        <KPISparkline tone={tone} trend={trend} aria-label={`Tendance ${item.label}`} />
      </div>
    </button>
  );
}

export const TickerBar = memo(function TickerBar({
  items,
  className,
  onClick,
  intervalMs = 5000,
  position = 'fixed',
  display = 'bar',
  anchor = 'bottom-left',
}: TickerBarProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs);
    return () => clearInterval(t);
  }, [items.length, intervalMs]);

  if (items.length === 0) return null;

  const item = items[index];
  const toneClasses =
    item.tone === 'crit'
      ? 'border-rose-500/25 bg-rose-500/5'
      : item.tone === 'warn'
      ? 'border-amber-500/25 bg-amber-500/5'
      : item.tone === 'ok'
      ? 'border-emerald-500/25 bg-emerald-500/5'
      : 'border-slate-300 bg-slate-100 dark:border-slate-600/40 dark:bg-slate-800/30';

  const maxDots = 8;
  const showDots = Math.min(items.length, maxDots);
  const dotIndexOffset =
    items.length > maxDots
      ? Math.max(0, Math.min(index - Math.floor(maxDots / 2), items.length - maxDots))
      : 0;

  const isAbsolute = position === 'absolute';
  const posClass = isAbsolute ? 'absolute' : 'fixed';
  const anchorClass = ANCHOR_CLASSES[anchor];
  const isBar = display === 'bar';
  const barFullWidth = isBar && (anchor === 'bottom-left' || anchor === 'bottom-center');

  const wrapperBase = cn(
    'z-50',
    posClass,
    anchorClass,
    'border border-slate-200 bg-white/98 dark:border-slate-800/80 dark:bg-slate-950/98 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]',
    barFullWidth && 'left-0 right-0 border-t',
    !barFullWidth && 'rounded-xl shadow-lg',
    'px-4 py-2 flex items-center justify-center gap-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]',
    className
  );

  const innerContent = (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="contents"
        >
          <TickerCard item={item} onClick={onClick} toneClasses={toneClasses} compact={display === 'wallet'} />
        </motion.div>
      </AnimatePresence>
      {items.length > 1 && (
        <div className="flex items-center gap-1" aria-hidden>
          {Array.from({ length: showDots }, (_, j) => {
            const i = items.length > maxDots ? dotIndexOffset + j : j;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  i === index ? 'bg-sky-400 scale-110' : 'bg-slate-400 dark:bg-slate-600 hover:bg-slate-500 dark:hover:bg-slate-500'
                )}
                aria-label={`Carte ${i + 1} sur ${items.length}`}
              />
            );
          })}
          {items.length > maxDots && (
            <span className="text-[10px] text-slate-600 dark:text-slate-500 ml-0.5">{index + 1}/{items.length}</span>
          )}
        </div>
      )}
    </>
  );

  if (display === 'pop') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <div
            className={cn('z-50', posClass, anchorClass, 'm-2 sm:m-3')}
            style={!isAbsolute ? { marginLeft: 'calc(var(--sidebar-width, 0) + 0.5rem)' } : undefined}
          >
            <button
              type="button"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border shadow-md',
                'bg-white/98 dark:bg-slate-950/98 backdrop-blur-md border-slate-200 dark:border-slate-800',
                'hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50',
                toneClasses
              )}
              aria-label="Ouvrir indicateurs critiques"
            >
              <Wallet className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Indicateurs</span>
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" aria-hidden />
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent
          align={anchor === 'bottom-right' || anchor === 'top-right' ? 'end' : anchor === 'bottom-center' ? 'center' : 'start'}
          side={anchor.startsWith('top') ? 'bottom' : 'top'}
          sideOffset={8}
          className="w-auto max-w-[min(90vw,380px)] p-3"
        >
          <div role="region" aria-label="Indicateurs critiques" className="flex flex-col gap-2">
            {items.map((it, i) => (
              <TickerCard
                key={it.label + i}
                item={it}
                onClick={onClick}
                toneClasses={
                  it.tone === 'crit' ? 'border-rose-500/25 bg-rose-500/5'
                  : it.tone === 'warn' ? 'border-amber-500/25 bg-amber-500/5'
                  : it.tone === 'ok' ? 'border-emerald-500/25 bg-emerald-500/5'
                  : 'border-slate-300 bg-slate-100 dark:border-slate-600/40 dark:bg-slate-800/30'
                }
                compact
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (display === 'wallet') {
    return (
      <div
        className={cn(wrapperBase, 'w-auto max-w-[240px]')}
        style={!isAbsolute && (anchor === 'bottom-right' || anchor === 'top-right') ? { right: 'max(0.5rem, env(safe-area-inset-right))' } : !isAbsolute && anchor === 'bottom-left' ? { left: 'calc(var(--sidebar-width, 0) + 0.5rem)' } : undefined}
        role="region"
        aria-label="Indicateurs critiques"
        aria-live="polite"
      >
        {innerContent}
      </div>
    );
  }

  return (
    <div
      className={wrapperBase}
      style={!isAbsolute ? { left: 'var(--sidebar-width, 0)' } : undefined}
      role="region"
      aria-label="Indicateurs critiques"
      aria-live="polite"
    >
      {innerContent}
    </div>
  );
});
