/**
 * PilotageHome — Page d'accueil Pilotage épurée (refonte UX)
 *
 * Écran minimal : barre recherche + pastilles veille.
 * Navigation détaillée = sub-sidebar hiérarchique (pas de cartes en doublon).
 *
 * @see docs/dashboard/AUDIT_DASHBOARD_MODULES_INTERLIEN.md
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import { VEILLE_SIGNALS, getModuleHref } from '@/lib/navigation/moduleLinks';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

const TONE_CLASSES = {
  ok: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  warn: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  crit: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
};

export interface PilotageHomeProps {
  /** Badges dynamiques pour les pastilles veille (ex: { alertes: 3, decisions: 8 }) */
  veilleBadges?: Partial<Record<string, number>>;
}

export function PilotageHome({ veilleBadges }: PilotageHomeProps = {}) {
  const toggleCommandPalette = useDashboardCommandCenterStore((s) => s.toggleCommandPalette);

  return (
    <main
      id="pilotage-home-main"
      role="main"
      aria-label="Pilotage — Accès aux modules"
      className="w-full min-w-0 max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12"
      data-testid="pilotage-home"
    >
      <h1 className="sr-only">Pilotage — Tableau de bord</h1>

      {/* Barre recherche / commande */}
      <div className="mb-8 sm:mb-12">
        <button
          type="button"
          onClick={toggleCommandPalette}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 sm:py-4 rounded-xl',
            'border border-slate-700/80 bg-slate-900/60',
            'text-slate-400 hover:text-slate-200 hover:border-slate-600 hover:bg-slate-800/60',
            'transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50'
          )}
          aria-label="Rechercher ou accéder à un module (raccourci Ctrl+K)"
        >
          <Search className="h-5 w-5 shrink-0" aria-hidden />
          <span className="text-sm sm:text-base">
            Accéder à un module, une action, un chiffre…
          </span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 text-[10px] font-mono text-slate-500">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Pastilles veille */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-2">Veille</span>
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
                <span className="ml-0.5 min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-slate-900/60 text-[10px] font-semibold tabular-nums">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

    </main>
  );
}
