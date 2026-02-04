/**
 * TickerBar — Diaporama de cartes en bas de page
 * Cartes compactes avec mini-graphique, transition douce.
 */

'use client';

import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Activity } from 'lucide-react';
import { KPISparkline } from './KPISparkline';

const SHORT_LABELS: Record<string, string> = {
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

interface TickerBarProps {
  items: TickerItem[];
  className?: string;
  onClick?: (item: TickerItem) => void;
  /** Durée d'affichage de chaque carte (ms) */
  intervalMs?: number;
}

export const TickerBar = memo(function TickerBar({
  items,
  className,
  onClick,
  intervalMs = 5000,
}: TickerBarProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs);
    return () => clearInterval(t);
  }, [items.length, intervalMs]);

  if (items.length === 0) return null;

  const item = items[index];
  const Icon = item.icon ?? Activity;
  const tone = item.tone ?? 'info';
  const trend = item.trend ?? 'neutral';

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

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'border-t border-slate-200 bg-white/98 dark:border-slate-800/80 dark:bg-slate-950/98 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]',
        'px-4 py-2 flex items-center justify-center gap-4 pb-[max(0.5rem,env(safe-area-inset-bottom))]',
        className
      )}
      role="region"
      aria-label="Indicateurs critiques"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.button
          key={index}
          type="button"
          onClick={() => onClick?.(item)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border min-w-[160px] max-w-[220px] group cursor-pointer',
            'transition-shadow duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.99]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50',
            toneClasses
          )}
          title={item.label}
        >
          <div className="flex-shrink-0 w-7 h-7 rounded-md bg-slate-300 dark:bg-slate-900/50 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" aria-hidden />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-300" title={item.label}>
              {SHORT_LABELS[item.label] ?? item.label}
            </div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-sm leading-tight">{String(item.value)}</div>
            {item.delta && item.delta !== '—' && (
              <div className="text-[10px] text-slate-600 dark:text-slate-400">{item.delta}</div>
            )}
          </div>
          <div className="flex-shrink-0 self-end">
            <KPISparkline tone={tone} trend={trend} aria-label={`Tendance ${item.label}`} />
          </div>
        </motion.button>
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
    </div>
  );
});
