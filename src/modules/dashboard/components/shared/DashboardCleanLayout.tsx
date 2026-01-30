/**
 * Dashboard Clean & Corporate — Procore / SAP Fiori style.
 * 4 zones : Header 64px | Sidebar 72px | Main | Bottom 56px.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FolderKanban, Users, Wallet, Bell, Settings, Search } from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

const SIDEBAR_ITEMS = [
  { id: 'overview', icon: LayoutDashboard, label: 'Accueil', main: 'overview' as const, sub: 'summary' as const, leaf: null as string | null },
  { id: 'chantiers', icon: FolderKanban, label: 'Chantiers', main: 'performance' as const, sub: 'delays' as const, leaf: 'critiques' as const },
  { id: 'equipe', icon: Users, label: 'Équipe', main: 'overview' as const, sub: 'kpis' as const, leaf: 'highlights' as const },
  { id: 'finance', icon: Wallet, label: 'Finance', main: 'overview' as const, sub: 'kpis' as const, leaf: 'highlights' as const },
  { id: 'alertes', icon: Bell, label: 'Alertes', main: 'overview' as const, sub: 'alerts' as const, leaf: 'actives' as const },
] as const;


export interface DashboardCleanLayoutProps {
  children: React.ReactNode;
  /** Contenu du header à droite (défaut: alertes + paramètres). Ignoré si hideHeader. */
  headerRight?: React.ReactNode;
  /** Dernière mise à jour affichée en bas */
  lastUpdate?: string;
  /** BMO v1 : masque la barre recherche/alertes/paramètres (évite doublon avec BMOHeader + PageTemplate) */
  hideHeader?: boolean;
}

export function DashboardCleanLayout({
  children,
  headerRight,
  lastUpdate = '30s',
  hideHeader = false,
}: DashboardCleanLayoutProps) {
  const navigate = useDashboardCommandCenterStore((s) => s.navigate);
  const main = useDashboardCommandCenterStore((s) => s.navigation.mainCategory);
  const sub = useDashboardCommandCenterStore((s) => s.navigation.subCategory);

  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [sidebarHover, setSidebarHover] = useState(false);
  const expanded = sidebarExpanded || sidebarHover;
  const toggleSidebar = useCallback(() => setSidebarExpanded((v) => !v), []);

  // Mode BMO (hideHeader) : pas de sidebar ni barre du bas pour éviter doublon avec le shell BMO ; fond sombre cohérent
  const embedMode = hideHeader;

  return (
    <div
      className={cn(
        'h-full min-h-0 flex flex-col',
        embedMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-white'
      )}
    >
      {!hideHeader && (
        <header className="h-16 shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-4 sm:px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-sm">
              <span className="font-bold text-white text-lg">Y</span>
            </div>
            <span className="font-semibold text-sm sm:text-base truncate">DG Cockpit</span>
          </div>
          <div className="hidden md:block w-72 lg:w-96 mx-4">
            <label className="sr-only">Rechercher</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="search"
                placeholder="Chantier, ouvrier, fournisseur..."
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-100/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                aria-label="Rechercher chantier, ouvrier, fournisseur"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {headerRight ?? (
              <>
                <div className="relative w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400" title="Alertes">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                </div>
                <button
                  type="button"
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  title="Paramètres"
                  aria-label="Paramètres"
                >
                  <Settings className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </button>
              </>
            )}
          </div>
        </header>
      )}

      {embedMode ? (
        /* BMO : contenu seul, plein écran, scroll interne. Pas de <main> (déjà dans BmoLayoutShell). */
        <div
          className="flex-1 min-h-0 min-w-0 overflow-auto flex flex-col scrollbar-dashboard"
          role="region"
          aria-label="Contenu dashboard"
        >
          {children}
        </div>
      ) : (
        <>
          <div className="flex flex-1 min-h-0">
            {/* SIDEBAR CLEAN — réduite par défaut (icônes seules), se déplie au survol ou au clic */}
            <aside
              className={cn(
                'shrink-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col py-3 gap-0.5 transition-all duration-200 ease-out overflow-hidden',
                expanded ? 'w-48' : 'w-14'
              )}
              onMouseEnter={() => setSidebarHover(true)}
              onMouseLeave={() => setSidebarHover(false)}
            >
              {SIDEBAR_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  main === item.main &&
                  (item.sub ? sub === item.sub || (item.id === 'overview' && (sub === 'summary' || !sub)) : true);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.main, item.sub, item.leaf)}
                    className={cn(
                      'flex items-center gap-2 py-2.5 rounded-xl transition-all min-w-0',
                      expanded ? 'px-3 justify-start' : 'px-2 justify-center',
                      isActive
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                    title={item.label}
                    aria-current={isActive ? 'page' : undefined}
                    aria-label={item.label}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" aria-hidden />
                    {expanded && (
                      <span className="text-xs font-medium truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={toggleSidebar}
                className={cn(
                  'mt-auto flex items-center gap-2 py-2 rounded-xl transition-colors text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
                  expanded ? 'px-3 justify-start' : 'px-2 justify-center w-full'
                )}
                aria-label={expanded ? 'Réduire le menu' : 'Déplier le menu'}
                title={expanded ? 'Réduire' : 'Déplier'}
              >
                <span className="text-lg leading-none" aria-hidden>{expanded ? '◀' : '▶'}</span>
                {expanded && <span className="text-xs">Réduire</span>}
              </button>
            </aside>

            <main className="flex-1 min-w-0 overflow-auto flex flex-col">
              {children}
            </main>
          </div>

          <div className="h-14 shrink-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 px-4 sm:px-6 flex items-center gap-3 sm:gap-4 shadow-lg">
            <button
              type="button"
              className="w-12 h-12 rounded-xl bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white shadow-lg hover:shadow-blue-500/25 transition-all font-medium"
              title="Nouveau"
              aria-label="Nouveau"
            >
              +
            </button>
            <button
              type="button"
              className="w-12 h-12 rounded-xl bg-green-500 hover:bg-green-600 flex items-center justify-center text-white shadow-lg hover:shadow-green-500/25 transition-all"
              title="Budget"
              aria-label="Budget"
            >
              <Wallet className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="w-12 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white shadow-lg hover:shadow-orange-500/25 transition-all"
              title="Contact"
              aria-label="Contact"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0" />
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">Dernière maj : {lastUpdate}</span>
          </div>
        </>
      )}
    </div>
  );
}
