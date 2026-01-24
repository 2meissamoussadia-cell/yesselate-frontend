/**
 * Composant KPICard - Carte d'indicateur KPI harmonisée
 * Utilisé pour afficher les KPIs de manière uniforme dans tout le dashboard
 */

'use client';

import React, { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, Info, Minus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface KPICardData {
  id: string;
  label: string;
  value: string | number;
  /**
   * Tendance:
   * - nombre: variation en % (compat legacy)
   * - string: direction explicite ('up' | 'down' | 'neutral')
   */
  trend?: number | 'up' | 'down' | 'neutral';
  trendType?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'cyan';
  description?: string;
  /**
   * Delta affiché (ex: "+5%", "—", "-2.1M")
   * Si non fourni, dérivé de `trend` quand c'est un nombre.
   */
  delta?: string;
  /**
   * Ton métier (OK/Alerte/Critique/Info)
   */
  tone?: 'ok' | 'warn' | 'crit' | 'info';
  onClick?: () => void;
}

interface KPICardProps {
  kpi: KPICardData;
  icon?: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md' | 'lg';
  index?: number;
  isPositive?: boolean;
  isNegative?: boolean;
  onClick?: () => void;
  className?: string;
}

function deriveToneFromColor(color?: KPICardData['color']): KPICardData['tone'] {
  if (color === 'emerald') return 'ok';
  if (color === 'amber') return 'warn';
  if (color === 'rose') return 'crit';
  return 'info';
}

/**
 * Composant KPICard harmonisé
 */
export const KPICard = memo(function KPICard({
  kpi,
  icon,
  size = 'md',
  index = 0,
  isPositive: isPositiveProp,
  isNegative: isNegativeProp,
  onClick: onClickProp,
  className,
}: KPICardProps) {
  const Icon = icon || kpi.icon;
  const onClick = onClickProp ?? kpi.onClick;

  const tone = useMemo(() => kpi.tone || deriveToneFromColor(kpi.color), [kpi.tone, kpi.color]);

  const toneStyles = useMemo(() => {
    switch (tone) {
      case 'ok':
        return {
          accent: 'bg-emerald-400/70',
          badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
          border: 'border-slate-800/70 hover:border-slate-700',
        };
      case 'warn':
        return {
          accent: 'bg-amber-400/70',
          badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
          border: 'border-slate-800/70 hover:border-slate-700',
        };
      case 'crit':
        return {
          accent: 'bg-red-400/70',
          badge: 'bg-red-500/10 text-red-300 border-red-500/20',
          border: 'border-slate-800/70 hover:border-slate-700',
        };
      default:
        return {
          accent: 'bg-slate-400/70',
          badge: 'bg-slate-500/10 text-slate-200 border-slate-500/20',
          border: 'border-slate-800/70 hover:border-slate-700',
        };
    }
  }, [tone]);

  const trendDir = useMemo<'up' | 'down' | 'neutral'>(() => {
    if (kpi.trendType) return kpi.trendType;
    if (kpi.trend === 'up' || kpi.trend === 'down' || kpi.trend === 'neutral') return kpi.trend;
    if (typeof kpi.trend === 'number') return kpi.trend > 0 ? 'up' : kpi.trend < 0 ? 'down' : 'neutral';
    return 'neutral';
  }, [kpi.trend, kpi.trendType]);

  const isPositive = isPositiveProp ?? trendDir === 'up';
  const isNegative = isNegativeProp ?? trendDir === 'down';

  const delta = useMemo(() => {
    if (typeof kpi.delta === 'string') return kpi.delta;
    if (typeof kpi.trend === 'number') {
      const sign = kpi.trend > 0 ? '+' : '';
      return `${sign}${kpi.trend}%`;
    }
    return '—';
  }, [kpi.delta, kpi.trend]);

  const trendIcon = useMemo(() => {
    if (trendDir === 'up') return <ArrowUpRight className="h-3 w-3" />;
    if (trendDir === 'down') return <ArrowDownRight className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  }, [trendDir]);

  const deltaClass = cn(
    'inline-flex items-center gap-1 text-[11px] font-medium',
    isPositive && 'text-emerald-300',
    isNegative && 'text-red-300',
    !isPositive && !isNegative && 'text-slate-300'
  );

  const tooltip = (
    <div className="space-y-1">
      <div className="font-semibold">{kpi.label}</div>
      <div className="text-xs text-slate-300">
        Valeur : <span className="font-medium">{String(kpi.value)}</span>
      </div>
      <div className="text-xs text-slate-400">
        Variation :{' '}
        <span className={cn(isPositive && 'text-emerald-300', isNegative && 'text-red-300')}>
          {delta}
        </span>
      </div>
      {kpi.description && (
        <div className="text-xs text-slate-400 pt-1 border-t border-slate-700/60 mt-2">
          {kpi.description}
        </div>
      )}
    </div>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        className={cn(
          'group relative w-full text-left rounded-xl border border-slate-800/70 bg-slate-950/30',
          size === 'sm' ? 'p-3' : size === 'lg' ? 'p-4' : 'p-4',
          'transition-colors hover:bg-slate-900/40 hover:border-slate-700/70',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/25',
          onClick ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default opacity-85',
          className
        )}
        style={{ animationDelay: `${index * 35}ms` }}
        aria-label={`${kpi.label}: ${String(kpi.value)}, ${delta}`}
      >
        {/* liseré “métier” */}
        <span className={cn('absolute left-0 top-3 bottom-3 w-1 rounded-full', toneStyles.accent)} />

        <div className="flex items-start justify-between gap-3 pl-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900/40 ring-1 ring-slate-800/60">
                <Icon className="h-4 w-4 text-slate-200" />
              </span>

              <p className="text-[12px] font-semibold text-slate-200 truncate">{kpi.label}</p>

              {kpi.description ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                      }}
                      className="inline-flex h-6 w-6 items-center justify-center text-slate-500 hover:text-slate-200"
                      aria-label={`Infos : ${kpi.label}`}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              ) : null}
            </div>

            <div className="mt-1 flex items-end justify-between gap-2">
              <div className={cn('font-semibold text-white leading-none truncate', size === 'lg' ? 'text-3xl' : 'text-2xl')}>
                {String(kpi.value)}
              </div>
              <div className={deltaClass}>
                {trendIcon}
                <span>{delta}</span>
              </div>
            </div>
          </div>

          {/* badge état */}
          <span
            className={cn(
              'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium',
              toneStyles.badge
            )}
          >
            {tone === 'ok' ? 'OK' : tone === 'warn' ? 'Alerte' : tone === 'crit' ? 'Critique' : 'Info'}
          </span>
        </div>
      </button>
    </TooltipProvider>
  );
});

KPICard.displayName = 'KPICard';
