/**
 * Layout harmonisé Maître d'ouvrage — sous-sidebar verticale + zone principale.
 * Même pattern visuel que le dashboard : sidebar repliable au survol, thème sombre.
 * Utilisé par Chantiers, Gouvernance, Engagements, Alertes, Documents.
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { LucideIcon } from 'lucide-react';

export interface PortalModuleTab {
  id: string;
  label: string;
  path: string;
  icon?: LucideIcon;
}

export interface PortalModuleCleanLayoutProps {
  /** Titre du module (pour aria-label de la nav). */
  title: string;
  /** Onglets de la sous-navigation (alignés sur SubNavContext.tabs). */
  tabs: PortalModuleTab[];
  /** Enfants = contenu principal. */
  children: React.ReactNode;
  /** Optionnel : bande KPI au-dessus du contenu. */
  kpiStrip?: React.ReactNode;
  /** Optionnel : actions en haut à droite de la zone principale. */
  headerRight?: React.ReactNode;
  /** Afficher une barre de titre du module au-dessus du contenu (défaut: true). */
  showModuleTitle?: boolean;
  className?: string;
}

/**
 * Layout module avec sous-sidebar verticale (style dashboard).
 * activePath est dérivé de usePathname() dans le parent ou passé en prop.
 */
/** Retourne l'id de l'onglet actif : le plus spécifique dont le path matche pathname. */
function getActiveTabId(pathname: string, tabs: PortalModuleTab[]): string | null {
  const matching = tabs.filter(
    (t) =>
      pathname === t.path || (t.path !== '/' && pathname.startsWith(t.path + '/'))
  );
  if (matching.length === 0) return null;
  const best = matching.sort((a, b) => b.path.length - a.path.length)[0];
  return best?.id ?? null;
}

export function PortalModuleCleanLayout({
  title,
  tabs,
  children,
  kpiStrip,
  headerRight,
  showModuleTitle = true,
  className,
}: PortalModuleCleanLayoutProps) {
  const pathname = usePathname() ?? '';
  const [expanded, setExpanded] = useState(false);
  const activeTabId = useMemo(() => getActiveTabId(pathname, tabs), [pathname, tabs]);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          'flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden',
          'bg-slate-50 dark:bg-slate-950/30',
          className
        )}
      >
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        {/* Sous-sidebar verticale — même style que DashboardSubSidebar */}
        <aside
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className={cn(
            'shrink-0 flex flex-col border-r overflow-y-auto overflow-x-hidden scrollbar-dashboard transition-[width] duration-200 ease-out',
            'border-slate-200 bg-white dark:border-slate-800/70 dark:bg-slate-950/60',
            expanded ? 'w-52' : 'w-14'
          )}
          aria-label={`Sections ${title}`}
          aria-expanded={expanded}
        >
          <div className="py-3 px-2">
            <nav className="space-y-0.5" aria-label={`Sections ${title}`}>
              {tabs.map((tab) => {
                const href = tab.path;
                const active = tab.id === activeTabId;
                const Icon = tab.icon;
                const linkContent = (
                  <Link
                    href={href}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-lg py-2 text-left text-sm transition-colors min-h-[36px]',
                      expanded ? 'px-3 justify-start' : 'px-2 justify-center',
                      active
                        ? 'bg-sky-500/15 text-sky-100 border-l-2 border-sky-500'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border-l-2 border-transparent'
                    )}
                    aria-current={active ? 'page' : undefined}
                    aria-label={tab.label}
                  >
                    {Icon && (
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded">
                        <Icon className="h-3.5 w-3.5 min-h-0 min-w-0" aria-hidden />
                      </span>
                    )}
                    {expanded && <span className="truncate">{tab.label}</span>}
                  </Link>
                );
                const item = expanded ? (
                  linkContent
                ) : (
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {tab.label}
                    </TooltipContent>
                  </Tooltip>
                );
                return <div key={tab.id}>{item}</div>;
              })}
            </nav>
          </div>
        </aside>

        {/* Zone principale */}
        <div
          className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden"
          role="region"
          aria-label="Contenu"
        >
          {headerRight && (
            <div className="shrink-0 flex items-center justify-end gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40">
              {headerRight}
            </div>
          )}
          {kpiStrip && (
            <div className="shrink-0 border-b border-slate-800/60 bg-slate-950/40">
              {kpiStrip}
            </div>
          )}
          {showModuleTitle && (
            <div className="shrink-0 px-4 py-2 border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-950/40">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate" id="module-title">
                {title}
              </h2>
            </div>
          )}
          <div
            className="flex-1 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto px-2 sm:px-4 py-2"
            aria-labelledby={showModuleTitle ? 'module-title' : undefined}
          >
            {children}
          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}

export default PortalModuleCleanLayout;
