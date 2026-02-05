/**
 * PilotageHome — Page d'accueil Pilotage épurée (refonte UX)
 *
 * Hero entreprise + barre recherche + pastilles veille.
 * Budget et Prévisionnel : visibles uniquement en boutons sur cette page Synthèse,
 * placés à gauche du contenu (après le volet sub-sidebar) par le layout parent.
 *
 * @see docs/dashboard/AUDIT_DASHBOARD_MODULES_INTERLIEN.md
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { cn } from '@/lib/cn';
import { VEILLE_SIGNALS, getModuleHref } from '@/lib/navigation/moduleLinks';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const COMPANY_LOGO_SRC = '/images/log_yessalate.png';

const TONE_CLASSES = {
  ok: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
  warn: 'bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/40',
  crit: 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/40',
};

export interface KpiForStrip {
  label: string;
  value: string | number;
  delta?: string;
  tone?: string;
  trend?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface PilotageHomeProps {
  /** Badges dynamiques pour les pastilles veille (ex: { alertes: 3, decisions: 8 }) */
  veilleBadges?: Partial<Record<string, number>>;
  /** Indicateurs pour la barre compacte (sous les pastilles veille) */
  kpis?: KpiForStrip[];
  /** Callback au clic sur un KPI */
  onKpiClick?: (kpi: KpiForStrip) => void;
  /** Callback au clic sur la barre de recherche (ouvre le command palette) */
  onSearchClick?: () => void;
}

export function PilotageHome({ veilleBadges, kpis = [], onKpiClick, onSearchClick }: PilotageHomeProps = {}) {
  return (
    <main
      id="pilotage-home-main"
      role="main"
      aria-label="Pilotage — Accès aux modules"
      className="w-full min-w-0 flex flex-col items-center px-4 sm:px-6 pt-2 sm:pt-4 pb-6 sm:pb-10"
      data-testid="pilotage-home"
    >
      <h1 className="sr-only">Pilotage — Tableau de bord</h1>

      {/* Contenu centré : logo, recherche, veille, KPIs */}
      <div className="w-full max-w-3xl flex flex-col items-center">
        {/* Hero : nom entreprise + logo */}
        <header className="flex flex-col items-center gap-4 sm:gap-5 mb-6 sm:mb-8 w-full">
          <div className="flex flex-col items-center gap-4 sm:gap-5">
            <div className="relative w-32 h-32 sm:w-48 sm:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 shrink-0 animate-logo-spin-3d">
              <Image
                src={COMPANY_LOGO_SRC}
                alt=""
                fill
                className="object-contain"
                sizes="(max-width: 640px) 128px, (max-width: 1024px) 192px, (max-width: 1280px) 224px, 256px"
                priority
              />
            </div>
            <h2 className="text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-center">
              YESSALATE <span className="text-amber-500 dark:text-amber-400/90">BTP</span>
            </h2>
          </div>

          {/* Grande barre de recherche — juste sous le nom */}
          {onSearchClick && (
            <button
              type="button"
              onClick={onSearchClick}
              className={cn(
                'w-full max-w-xl flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl',
                'border border-slate-300 bg-slate-100 text-slate-600',
                'hover:text-slate-800 hover:border-slate-400 hover:bg-slate-200',
                'dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800/60',
                'transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950'
              )}
              aria-label="Rechercher (Ctrl+K)"
              title="Rechercher — Ctrl+K"
            >
              <Search className="h-5 w-5 shrink-0 opacity-70" aria-hidden />
              <span className="flex-1 text-left text-sm sm:text-base" title="Accéder à un module, une action, un chiffre">
                Module, action, chiffre…
              </span>
              <kbd className="hidden sm:inline-flex px-2 py-1 rounded text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400 bg-slate-200 dark:bg-slate-800/80">
                Ctrl+K
              </kbd>
            </button>
          )}
        </header>

        {/* Bloc centré : Veille + KPIs */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-4 sm:gap-5">
          {/* Pastilles veille */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="veille-label text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-300 basis-full text-center sm:basis-auto sm:mr-2">Veille</span>
            {VEILLE_SIGNALS.map((signal) => {
              const href = getModuleHref(signal.target);
              const toneClass = TONE_CLASSES[signal.tone ?? 'ok'];
              const badge = veilleBadges?.[signal.id];
              return (
                <Link
                  key={signal.id}
                  href={href}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    toneClass,
                    'hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50'
                  )}
                  aria-label={`${signal.label}${badge != null ? ` — ${badge} élément${badge > 1 ? 's' : ''}` : ''} — accéder au module`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" aria-hidden />
                  {signal.label}
                  {badge != null && badge > 0 && (
                    <span className="ml-0.5 min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-slate-300 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 text-[10px] font-semibold tabular-nums">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Barre indicateurs (sous les pastilles veille) */}
          {kpis.length > 0 && (
            <div id="dashboard-kpi-strip" className="w-full pt-4 border-t border-slate-200 dark:border-slate-800/60" role="region" aria-label="Indicateurs clés">
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px]">
                {kpis.map((kpi) => {
                  const Icon = kpi.icon;
                  const toneColor = kpi.tone === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : kpi.tone === 'warn' ? 'text-amber-600 dark:text-amber-400' : kpi.tone === 'crit' ? 'text-rose-600 dark:text-rose-400' : kpi.tone === 'info' ? 'text-sky-600 dark:text-sky-400' : 'text-slate-600 dark:text-slate-400';
                  const shortLabel = kpi.label.length > 12 ? `${kpi.label.slice(0, 10)}…` : kpi.label;
                  return (
                    <Tooltip key={kpi.label}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => onKpiClick?.(kpi)}
                          className={cn(
                            'flex items-center gap-2 py-1.5 px-2 -mx-1 rounded-lg cursor-pointer',
                            'hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:scale-[1.02] active:scale-[0.98] transition-colors',
                            'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950'
                          )}
                          aria-label={`${kpi.label}: ${kpi.value} (${kpi.delta ?? '—'})`}
                          title={kpi.label}
                        >
                          <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden />
                          <span className="text-slate-600 dark:text-slate-300 text-[10px] shrink-0 max-w-[12rem] truncate" title={kpi.label}>{shortLabel}</span>
                          <span className="text-slate-800 dark:text-slate-300 font-medium tabular-nums">{String(kpi.value)}</span>
                          <span className={cn('tabular-nums', kpi.delta && kpi.delta !== '—' ? toneColor : 'text-slate-600 dark:text-slate-500')}>{kpi.delta ?? '—'}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-xs text-white">
                        <div className="font-medium">{kpi.label}</div>
                        <div className="text-slate-300">Variation : {kpi.delta ?? '—'}</div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
