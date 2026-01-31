'use client';

/**
 * SubNavigation YESSALATE BMO — Tabs / Filtres / Menu contextuel
 * Contexte selon la route active (onglets, filtres, actions)
 * Design 100% YESSALATE BMO, ARIA, animations 300ms
 *
 * Note: Next.js App Router n'accepte pas les href dynamiques ([id], [chantierId], etc.)
 * dans <Link>. On normalise vers le chemin parent statique pour ces onglets.
 */

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { SubNavigationProps } from '../../types/navigation';

/** Retourne un href statique pour <Link> : enlève les segments dynamiques [id], [chantierId], etc. */
function toStaticHref(path: string): string {
  if (!path.includes('[')) return path;
  const segments = path.split('/').filter(Boolean);
  const staticSegments = segments.filter((s) => !s.startsWith('['));
  return staticSegments.length > 0 ? `/${staticSegments.join('/')}` : '/';
}

export interface SubNavigationComponentProps extends SubNavigationProps {
  /** Masquer le titre quand il fait doublon avec le breadcrumb (ex. Cockpit DG) */
  hideTitle?: boolean;
}

export function SubNavigation({
  context,
  activePath,
  className,
  hideTitle = false,
}: SubNavigationComponentProps) {
  if (!context) return null;

  const { title, tabs, filters, actions } = context;

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5 px-4 sm:px-6 py-1.5 bg-slate-900/40 border-b border-slate-800/60 min-w-0 overflow-x-hidden',
        'transition-all duration-300',
        className
      )}
      role="region"
      aria-label={title ?? 'Navigation secondaire'}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {!hideTitle && title && (
          <h2 className="text-xs font-semibold text-slate-300 truncate sr-only sm:not-sr-only">{title}</h2>
        )}
        {actions && actions.length > 0 && (
          <div className="flex items-center gap-2" role="toolbar" aria-label="Actions rapides">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium',
                  'bg-slate-950/50 text-slate-300 hover:bg-orange-500/20 hover:text-orange-400',
                  'border border-slate-800/70 hover:border-orange-500/30',
                  'transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50'
                )}
                aria-label={action.label}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {tabs && tabs.length > 0 && (
        <nav role="tablist" aria-label="Onglets" className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const path = tab.path;
            const staticHref = path !== undefined ? toStaticHref(path) : undefined;
            const isActive =
              staticHref !== undefined &&
              (activePath === staticHref ||
                activePath === path ||
                (activePath?.startsWith(staticHref + '/') ?? false));
            const content = (
              <span className="flex items-center gap-1.5">
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className="inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded text-[10px] font-medium bg-slate-800/80 text-slate-300"
                    aria-hidden
                  >
                    {tab.count > 99 ? '99+' : tab.count}
                  </span>
                )}
              </span>
            );
            const tabClass = cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-300',
              'focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-slate-950',
              isActive
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-slate-800/70'
            );
            return staticHref !== undefined ? (
              <Link
                key={tab.id}
                href={staticHref}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'page' : undefined}
                className={tabClass}
              >
                {content}
              </Link>
            ) : (
              <span key={tab.id} role="tab" aria-selected={tab.ariaSelected} className={tabClass}>
                {content}
              </span>
            );
          })}
        </nav>
      )}

      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtres">
          <span className="text-xs text-slate-400 font-medium">Filtres :</span>
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={cn(
                'px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-300',
                'focus:outline-none focus:ring-2 focus:ring-orange-500/50',
                filter.active
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-950/50 text-slate-400 border border-slate-800/70 hover:bg-slate-800/50'
              )}
              aria-pressed={filter.active}
              aria-label={filter.label}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubNavigation;
