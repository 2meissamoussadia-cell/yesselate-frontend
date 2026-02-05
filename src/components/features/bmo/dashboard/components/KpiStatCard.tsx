import React from 'react';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChevronRight } from 'lucide-react';
import { colors, borderRadius, transitions, interactive } from '@/modules/dashboard/utils/dashboardDesignTokens';

type Tone = 'slate' | 'blue' | 'emerald' | 'amber' | 'rose' | 'violet' | 'cyan';

const TONE: Record<
  Tone,
  { accent: string; iconWrap: string; icon: string; hoverGlow: string; ring: string }
> = {
  slate: {
    accent: 'bg-slate-600/60',
    iconWrap: 'bg-slate-800/60',
    icon: 'text-slate-200',
    hoverGlow: 'bg-slate-400/10',
    ring: 'ring-slate-800/60',
  },
  blue: {
    accent: 'bg-blue-500/70',
    iconWrap: 'bg-blue-500/10',
    icon: 'text-blue-300',
    hoverGlow: 'bg-blue-400/10',
    ring: 'ring-blue-500/20',
  },
  emerald: {
    accent: 'bg-emerald-500/70',
    iconWrap: 'bg-emerald-500/10',
    icon: 'text-emerald-300',
    hoverGlow: 'bg-emerald-400/10',
    ring: 'ring-emerald-500/20',
  },
  amber: {
    accent: 'bg-amber-500/70',
    iconWrap: 'bg-amber-500/10',
    icon: 'text-amber-300',
    hoverGlow: 'bg-amber-400/10',
    ring: 'ring-amber-500/20',
  },
  rose: {
    accent: 'bg-rose-500/70',
    iconWrap: 'bg-rose-500/10',
    icon: 'text-rose-300',
    hoverGlow: 'bg-rose-400/10',
    ring: 'ring-rose-500/20',
  },
  violet: {
    accent: 'bg-violet-500/70',
    iconWrap: 'bg-violet-500/10',
    icon: 'text-violet-300',
    hoverGlow: 'bg-violet-400/10',
    ring: 'ring-violet-500/20',
  },
  cyan: {
    accent: 'bg-cyan-500/70',
    iconWrap: 'bg-cyan-500/10',
    icon: 'text-cyan-300',
    hoverGlow: 'bg-cyan-400/10',
    ring: 'ring-cyan-500/20',
  },
};

export type KpiTrendDirection = 'up' | 'down' | 'neutral';

export interface KpiStatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: Tone;
  trend?: number;
  trendDirection?: KpiTrendDirection;
  tooltip?: string;
  onClick?: () => void;
  className?: string;
}

export function KpiStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = 'slate',
  trend = 0,
  trendDirection = 'neutral',
  tooltip,
  onClick,
  className,
}: KpiStatCardProps) {
  // S'assurer que tone est valide, sinon utiliser 'slate' par défaut
  const validTone: Tone = (tone && Object.keys(TONE).includes(tone)) ? (tone as Tone) : 'slate';
  const t = TONE[validTone];

  const TrendIcon =
    trendDirection === 'up' ? (
      <span className="text-emerald-300">↑</span>
    ) : trendDirection === 'down' ? (
      <span className="text-rose-300">↓</span>
    ) : (
      <span className="text-slate-400">—</span>
    );

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative w-full overflow-hidden p-5 text-left',
        borderRadius.lg,
        colors.bg.card,
        'ring-1',
        colors.border.default,
        'backdrop-blur',
        transitions.standard,
        interactive.hover.bg,
        'hover:ring-slate-700/60 hover:shadow-lg hover:shadow-black/10',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'min-h-[120px] flex flex-col min-w-0',
        '[&>svg]:hidden',
        className
      )}
    >
      {/* Accent minimal */}
      <div className={cn('absolute left-0 top-0 h-full w-[3px] opacity-80 z-0', t.accent)} />

      <div className="flex items-start gap-3 flex-1">
        {Icon ? (
          <div className={cn('mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', t.iconWrap)}>
            <Icon {...({ className: cn('h-5 w-5', t.icon) } as { className?: string })} />
          </div>
        ) : null}

        <div className="min-w-0 flex-1 flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-sm font-medium text-slate-200" title={title}>{title}</div>
            {tooltip ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-slate-400 hover:text-slate-200">
                    i
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">{tooltip}</TooltipContent>
              </Tooltip>
            ) : null}
          </div>

          <div className="flex items-end justify-between gap-3 mt-auto">
            <div className="min-w-0">
              <div className="truncate text-2xl font-semibold tracking-tight text-white">{value}</div>
              {subtitle ? <div className="mt-1 truncate text-xs text-slate-400">{subtitle}</div> : null}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-xs text-slate-400 whitespace-nowrap">
                {TrendIcon} {Number.isFinite(trend) ? `${trend > 0 ? '+' : ''}${trend}%` : '—'}
              </div>
              <ChevronRight className="h-4 w-4 text-slate-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
