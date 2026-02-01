'use client';

/**
 * BmoSidebar — Sidebar BMO qui lit la config bmoModules.
 * Groupes : PILOTAGE, EXÉCUTION, SUPPORT.
 * Logo entreprise : un seul emplacement (sidebar) pour éviter doublon avec la topbar.
 * Dashboard (cockpit) : lien avec query pour forcer la vue Cockpit DG et réaction au clic.
 */

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { bmoModules, bmoModuleGroupLabels, getModuleByPath } from '@/lib/navigation/bmoModules';

/** URL du dashboard (PILOTAGE > Dashboard). Force une navigation visible au clic. */
const DASHBOARD_COCKPIT_HREF = '/maitre-ouvrage/dashboard?main=pilotage&sub=dashboard&leaf=default';

const COMPANY_LOGO_SRC = '/images/log_yessalate.png';

export interface BmoSidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
  className?: string;
}

export function BmoSidebar({
  collapsed = false,
  onCollapse,
  className,
}: BmoSidebarProps) {
  const pathname = usePathname();
  const currentModule = getModuleByPath(pathname ?? '');

  const byGroup = React.useMemo(() => {
    const g: Record<string, typeof bmoModules> = { pilotage: [], execution: [], support: [], systeme: [] };
    for (const m of bmoModules) {
      if (g[m.group]) g[m.group].push(m);
    }
    return g;
  }, []);

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white border-r border-slate-200 text-slate-900 dark:bg-slate-950 dark:border-slate-800/70 dark:text-slate-100 shrink-0 overflow-hidden',
        collapsed ? 'w-14' : 'w-56',
        className
      )}
      aria-label="Navigation BMO"
    >
      {/* Logo entreprise (un seul emplacement — pas de doublon avec la topbar) */}
      <div className="flex items-center justify-between gap-2 h-14 px-2 border-b border-slate-200 dark:border-slate-800/70 shrink-0 min-w-0">
        {collapsed ? (
          <>
            <div className="relative w-7 h-7 flex-shrink-0">
              <Image
                src={COMPANY_LOGO_SRC}
                alt="YESSALATE BMO"
                fill
                className="object-contain"
                sizes="28px"
                priority
              />
            </div>
            {onCollapse && (
              <button
                type="button"
                onClick={onCollapse}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:hover:bg-slate-800/80 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shrink-0"
                aria-label="Ouvrir le menu"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" aria-hidden />
              </button>
            )}
          </>
        ) : (
          <>
            <Link
              href="/maitre-ouvrage/dashboard"
              onClick={() => onCollapse?.()}
              className="flex items-center gap-2 min-w-0 flex-1"
              aria-label="Accueil YESSALATE BMO"
            >
              <span className="relative w-8 h-8 flex-shrink-0 rounded overflow-hidden">
                <Image
                  src={COMPANY_LOGO_SRC}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="32px"
                  priority
                />
              </span>
              <span className="text-xs font-semibold tracking-wider text-amber-600 dark:text-amber-400/90 truncate">
                YESSALATE BMO
              </span>
            </Link>
            {onCollapse && (
              <button
                type="button"
                onClick={onCollapse}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:hover:bg-slate-800/80 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shrink-0"
                aria-label="Réduire le menu"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
              </button>
            )}
          </>
        )}
      </div>

      {/* Modules par groupe */}
      <nav className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto py-2 scrollbar-dashboard">
        {(['pilotage', 'execution', 'support', 'systeme'] as const).map((group) => (
          <div key={group} className={cn(!collapsed && 'mb-4')}>
            {!collapsed && (
              <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-amber-600 dark:text-amber-400/80 uppercase">
                {bmoModuleGroupLabels[group]}
              </div>
            )}
            <ul className="space-y-0.5">
              {byGroup[group].map((m) => {
                const Icon = m.icon;
                const isDashboard = m.id === 'cockpit';
                const href = isDashboard ? DASHBOARD_COCKPIT_HREF : m.href;
                const isActive =
                  currentModule?.id === m.id ||
                  (pathname ?? '').startsWith(m.href);
                return (
                  <li key={m.id}>
                    <Link
                      href={href}
                      onClick={() => onCollapse?.()}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 text-sm transition-colors',
                        collapsed ? 'justify-center' : '',
                        isActive
                          ? 'bg-blue-600/20 text-slate-50 border-l-2 border-blue-500'
                          : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:hover:bg-slate-800/80 dark:text-slate-300 dark:hover:text-slate-100 border-l-2 border-transparent'
                      )}
                      aria-current={isActive ? 'page' : undefined}
                      aria-label={m.label}
                    >
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{m.label}</span>
                          {m.badge != null && m.badge > 0 && (
                            <span className="shrink-0 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-medium flex items-center justify-center">
                              {m.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="border-t border-slate-800/70 p-2">
          <Link
            href={`${pathname?.startsWith('/maitre-ouvrage') ? '/maitre-ouvrage' : ''}/parametres`}
            onClick={() => onCollapse?.()}
            className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            Paramètres
          </Link>
        </div>
      )}
    </aside>
  );
}
