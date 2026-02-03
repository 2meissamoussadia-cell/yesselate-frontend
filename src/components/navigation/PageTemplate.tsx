'use client';

/**
 * PageTemplate BMO v1 — Breadcrumbs + header (titre/description/actions) + SubNav + contenu.
 * Pas de bande colorée ni macro-layout ; pas de role="main" (déjà sur le layout parent).
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubNavigation } from './SubNavigation';
import type { SubNavContext } from '../../types/navigation';
import { useNavigation } from '@/hooks/navigation';
import { engagementsFinancesSubNav } from '@/lib/navigation/subnav/engagementsFinances';
import { alertsCenterSubNav } from '@/lib/navigation/subnav/alertsCenter';
import { projectsProgramsSubNav } from '@/lib/navigation/subnav/projectsPrograms';
import { governanceArbitrageSubNav } from '@/lib/navigation/subnav/governanceArbitrage';
import { getSubNavContextFromSitemap } from '@/lib/navigation/bmoModules';
import { BusinessWindow } from '@/components/ui/BusinessWindow';

export interface PageTemplateProps {
  children: React.ReactNode;
  subNavContext?: SubNavContext | null;
  title?: string;
  description?: string;
  /** Barre de commandes type Explorer (sous le header) */
  commandBarSlot?: React.ReactNode;
  actionsSlot?: React.ReactNode;
  footerSlot?: React.ReactNode;
  /** Encadrer le contenu dans une fenêtre métier (BusinessWindow) */
  windowTitle?: string;
  fullBleed?: boolean;
  /** Largeur max du contenu : 6xl (défaut), 7xl (cockpit plein cadre), none */
  contentMaxWidth?: '6xl' | '7xl' | 'none';
  className?: string;
}

/** SubNavs personnalisés (plus riches que le sitemap) — priorité sur le sitemap. */
const CUSTOM_SUBNAV_PATHS: Array<{ prefix: string; context: SubNavContext }> = [
  { prefix: '/maitre-ouvrage/chantiers', context: projectsProgramsSubNav },
  { prefix: '/maitre-ouvrage/alerts', context: alertsCenterSubNav },
  { prefix: '/maitre-ouvrage/engagements', context: engagementsFinancesSubNav },
  { prefix: '/maitre-ouvrage/governance', context: governanceArbitrageSubNav },
];

/** Documents : pas d'enfants dans le sitemap, subnav dédié. */
const DOCUMENTS_SUBNAV: SubNavContext = {
  title: 'Documents & Contrats',
  tabs: [
    { id: 'contrats', label: 'Contrats', path: '/maitre-ouvrage/documents' },
    { id: 'avenants', label: 'Avenants', path: '/maitre-ouvrage/documents/avenants' },
  ],
};

/** Map pathname → contexte SubNav. Dérive du sitemap quand le module a des children, sinon subnavs dédiés. */
function getSubNavContextForPath(pathname: string): SubNavContext | null {
  if (!pathname) return null;
  const base = '/maitre-ouvrage';

  const custom = CUSTOM_SUBNAV_PATHS.find((p) => pathname.startsWith(p.prefix));
  if (custom) return custom.context;

  const fromSitemap = getSubNavContextFromSitemap(pathname);
  if (fromSitemap) return fromSitemap;

  if (pathname.startsWith(`${base}/documents`)) return DOCUMENTS_SUBNAV;
  return null;
}

export function PageTemplate({
  children,
  subNavContext: subNavContextProp,
  title,
  description,
  commandBarSlot,
  actionsSlot,
  footerSlot,
  windowTitle,
  fullBleed = false,
  contentMaxWidth = '6xl',
  className,
}: PageTemplateProps) {
  const pathname = usePathname();
  const { breadcrumbs } = useNavigation();
  const contextFromPath = useMemo(
    () => getSubNavContextForPath(pathname ?? ''),
    [pathname]
  );
  const subNavContext = subNavContextProp ?? contextFromPath;

  /** Cockpit DG / Dashboard et modules harmonisés : pleine largeur, header masqué. */
  const useFullPage =
    pathname?.startsWith('/maitre-ouvrage/cockpit') ||
    pathname?.startsWith('/maitre-ouvrage/dashboard') ||
    pathname?.startsWith('/maitre-ouvrage/chantiers') ||
    pathname?.startsWith('/maitre-ouvrage/governance') ||
    pathname?.startsWith('/maitre-ouvrage/engagements') ||
    pathname?.startsWith('/maitre-ouvrage/alerts') ||
    pathname?.startsWith('/maitre-ouvrage/documents') ||
    pathname?.startsWith('/maitre-ouvrage/performance') ||
    pathname?.startsWith('/maitre-ouvrage/opportunities') ||
    pathname?.startsWith('/maitre-ouvrage/messages');
  const effectiveMaxWidth = useFullPage ? 'none' : contentMaxWidth;

  return (
    <div
      className={cn(
        'flex flex-col flex-1 min-h-0 min-w-0 max-w-full overflow-x-hidden',
        className
      )}
    >
      {/* En-tête compact : masqué sur dashboard/cockpit pour utiliser toute la page (header propre au dashboard). */}
      {!useFullPage && (
          <header className="shrink-0 border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/40">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 sm:px-6 py-1.5 min-w-0">
            {breadcrumbs.length > 0 && !pathname?.startsWith('/maitre-ouvrage') && (
              <nav
                aria-label="Fil d'Ariane"
                className="flex items-center gap-1 shrink-0 overflow-x-auto text-[11px] text-slate-400"
              >
                {breadcrumbs.map((item, i) => (
                  <span
                    key={(item.id ?? item.href ?? '') + i}
                    className="flex items-center gap-0.5 shrink-0"
                  >
                    {i > 0 && (
                      <ChevronRight className="h-3 w-3 text-slate-600" aria-hidden />
                    )}
                    {i < breadcrumbs.length - 1 && item.href ? (
                      <Link
                        href={item.href}
                        className="text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-200 transition-colors truncate max-w-[120px] sm:max-w-none"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={
                          i === breadcrumbs.length - 1
                            ? 'text-slate-200 font-medium truncate max-w-[160px] sm:max-w-none'
                            : 'truncate max-w-[120px] sm:max-w-none'
                        }
                        aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
                      >
                        {item.label}
                      </span>
                    )}
                  </span>
                ))}
              </nav>
            )}
            {title && (
              <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate shrink-0 border-l border-slate-200 dark:border-slate-700/60 pl-3">
                {title}
              </h1>
            )}
            {actionsSlot && (
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                {actionsSlot}
              </div>
            )}
          </div>
          {description && (
            <p className="px-4 sm:px-6 pb-1 text-[11px] text-slate-400 line-clamp-1">
              {description}
            </p>
          )}
          {subNavContext && (
            <SubNavigation
              context={subNavContext}
              activePath={pathname ?? undefined}
              hideTitle={false}
            />
          )}
        </header>
      )}

      {commandBarSlot && <>{commandBarSlot}</>}

      <div
        className={cn(
          'flex-1 min-h-0 min-w-0 max-w-full overflow-x-hidden overflow-y-auto bg-gray-50/80 dark:bg-slate-950/30',
          !fullBleed && !useFullPage && 'px-2 sm:px-4 py-2'
        )}
      >
        <div
          className={cn(
            'w-full min-h-0',
            !fullBleed && !useFullPage && 'mx-auto',
            effectiveMaxWidth === '6xl' && 'max-w-6xl',
            effectiveMaxWidth === '7xl' && 'max-w-7xl',
            effectiveMaxWidth === 'none' && 'max-w-full',
            useFullPage && 'h-full flex flex-col min-h-0'
          )}
        >
          {windowTitle ? (
            <BusinessWindow title={windowTitle}>{children}</BusinessWindow>
          ) : (
            children
          )}
        </div>
      </div>

      {footerSlot && (
        <footer className="border-t border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/60 px-4 sm:px-6 py-3">
          {footerSlot}
        </footer>
      )}
    </div>
  );
}

export default PageTemplate;
