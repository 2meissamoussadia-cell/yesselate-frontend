'use client';

/**
 * OutlookLikeLayout — Layout 3 colonnes type Outlook (sidebar | liste | détail).
 *
 * Contrat :
 * - Présentation uniquement : slots en ReactNode, pas de fetch.
 * - Page gère : données, sélection, filtres, tri, actions.
 *
 * Stratégie responsive (dès V1, détaillée dans docs/bmo/OUTLOOK_LIKE_INTEGRATION.md) :
 * - Desktop (> 1024px) : 3 colonnes visibles (sidebar, liste, détail).
 * - Tablette (768–1024px) : 2 colonnes (liste + détail par défaut) ; sidebar masquée.
 * - Mobile (< 768px) : liste pleine page ; détail masqué ici.
 *
 * Améliorations (optionnelles) :
 * - module: persistance du layout dans localStorage
 * - subSidebarCollapsible: permet de masquer la sidebar (raccourci Ctrl+[)
 * - enableLayoutToolbar: barre flottante pour basculer les colonnes
 * - enableKeyboardNav: raccourcis Ctrl+[, Ctrl+], Ctrl+\
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PanelLeft, List, PanelRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLocalStorage } from '@/application/hooks/useLocalStorage';
import { useLayoutShortcuts } from '@/hooks/useLayoutShortcuts';

const LIST_WIDTH_MIN = 280;
const LIST_WIDTH_MAX = 520;
const LIST_WIDTH_DEFAULT = 420;
const LIST_WIDTH_MAX_PERCENT = 0.6;

export interface LayoutState {
  subSidebarCollapsed: boolean;
  listCollapsed: boolean;
  detailCollapsed: boolean;
  /** Largeur de la colonne liste (px), optionnel — si défini, la colonne est redimensionnable et cette valeur est utilisée. */
  listWidth?: number;
}

export interface OutlookLikeLayoutProps {
  /** Colonne 1 : dossiers / filtres / catégories (masquée < lg) */
  sidebar: React.ReactNode;
  /** Barre de filtres au-dessus de la liste (onglets, tri, filtres rapides) */
  filterBar?: React.ReactNode;
  /** Colonne 2 : liste d'éléments (messages, alertes, tickets) */
  list: React.ReactNode;
  /** Colonne 3 : panneau de détail (masqué < md ; sur mobile la page peut ouvrir une modal ou une route) */
  detail: React.ReactNode;
  /** Barre d'actions au-dessus du contenu (Nouveau…, Supprimer, Archiver, etc.) */
  quickActions?: React.ReactNode;
  /** Clé pour persister l'état du layout (localStorage) */
  module?: string;
  /** Permet de masquer la sidebar via toolbar / raccourcis */
  subSidebarCollapsible?: boolean;
  /** Affiche la barre flottante de contrôle du layout */
  enableLayoutToolbar?: boolean;
  /** Active les raccourcis clavier (Ctrl+[, Ctrl+], Ctrl+\) */
  enableKeyboardNav?: boolean;
  /** Callback quand l'état du layout change */
  onLayoutChange?: (state: LayoutState) => void;
  className?: string;
}

const defaultLayoutState: LayoutState = {
  subSidebarCollapsed: false,
  listCollapsed: false,
  detailCollapsed: false,
  listWidth: LIST_WIDTH_DEFAULT,
};

export function OutlookLikeLayout({
  sidebar,
  filterBar,
  list,
  detail,
  quickActions,
  module,
  subSidebarCollapsible = false,
  enableLayoutToolbar = false,
  enableKeyboardNav = false,
  onLayoutChange,
  className,
}: OutlookLikeLayoutProps) {
  const [storedState, setStoredState, _remove] = useLocalStorage<LayoutState>(
    module ? `bmo-layout-${module}` : 'bmo-layout-temp',
    defaultLayoutState
  );
  const layoutState = module ? storedState : defaultLayoutState;

  const [localState, setLocalState] = useState(layoutState);
  const state = module ? storedState : localState;
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMdUp, setIsMdUp] = useState(true);

  useEffect(() => {
    const mq = typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)') : null;
    if (!mq) return;
    setIsMdUp(mq.matches);
    const onChange = () => setIsMdUp(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setState = useCallback(
    (updater: LayoutState | ((prev: LayoutState) => LayoutState)) => {
      const next = typeof updater === 'function' ? updater(state) : updater;
      if (module) {
        setStoredState(next);
      } else {
        setLocalState(next);
      }
      onLayoutChange?.(next);
    },
    [module, state, setStoredState, onLayoutChange]
  );

  const toggleSubSidebar = useCallback(() => {
    if (subSidebarCollapsible) {
      setState((prev) => ({ ...prev, subSidebarCollapsed: !prev.subSidebarCollapsed }));
    }
  }, [subSidebarCollapsible, setState]);

  const toggleList = useCallback(() => {
    setState((prev) => ({ ...prev, listCollapsed: !prev.listCollapsed }));
  }, [setState]);

  const toggleDetail = useCallback(() => {
    setState((prev) => ({ ...prev, detailCollapsed: !prev.detailCollapsed }));
  }, [setState]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      const startX = e.clientX;
      const startWidth = state.listWidth ?? LIST_WIDTH_DEFAULT;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        const nextWidth = startWidth + delta;
        const container = containerRef.current;
        const maxPx = container
          ? Math.min(LIST_WIDTH_MAX, container.getBoundingClientRect().width * LIST_WIDTH_MAX_PERCENT)
          : LIST_WIDTH_MAX;
        const clamped = Math.round(Math.min(maxPx, Math.max(LIST_WIDTH_MIN, nextWidth)));
        setState((prev) => ({ ...prev, listWidth: clamped }));
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [setState, state.listWidth]
  );

  const listWidth = state.listWidth ?? LIST_WIDTH_DEFAULT;

  useLayoutShortcuts(
    {
      ...(subSidebarCollapsible && { 'Ctrl+[': toggleSubSidebar }),
      'Ctrl+]': toggleList,
      'Ctrl+\\': toggleDetail,
    },
    enableKeyboardNav && enableLayoutToolbar
  );

  useEffect(() => {
    onLayoutChange?.(state);
  }, [state, onLayoutChange]);

  const showSidebar = !subSidebarCollapsible || !state.subSidebarCollapsed;
  const showList = !state.listCollapsed;
  const showDetail = !state.detailCollapsed;

  return (
    <div
      className={cn(
        'flex flex-col flex-1 min-h-0 min-w-0 max-w-full overflow-hidden',
        'bg-gray-50 dark:bg-slate-950/30',
        className
      )}
    >
      {quickActions && (
        <div
          className="shrink-0 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/40"
          aria-label="Actions rapides"
        >
          {quickActions}
        </div>
      )}

      <div
        ref={containerRef}
        className={cn(
          'flex flex-1 min-h-0 h-0 min-w-0 overflow-hidden relative',
          isResizing && 'select-none'
        )}
      >
        {/* Colonne 1 : sidebar dossiers — visible lg+ ; figée en hauteur, pas de scroll (seules liste + détail défilent) */}
        {showSidebar && (
          <aside
            className={cn(
              'hidden lg:flex lg:shrink-0 lg:flex-col lg:min-h-0',
              'lg:w-[220px] lg:min-w-[200px] lg:max-w-[280px]',
              'border-r border-slate-200 dark:border-slate-800/60',
              'bg-white dark:bg-slate-950/50 overflow-hidden',
              'transition-[width] duration-200 ease-out'
            )}
            aria-label="Dossiers"
          >
            {sidebar}
          </aside>
        )}

        {/* Colonne 2 : zone liste — barre filtres figée, seule la liste défile ; scrollbar dans la bande de redimensionnement */}
        {showList && (
          <section
            className={cn(
              'flex flex-col min-h-0 overflow-hidden',
              'border-r border-slate-200 dark:border-slate-800/60',
              'bg-slate-50/80 dark:bg-slate-900/50',
              'flex-1 min-w-0 md:flex-none md:shrink-0',
              'max-md:min-w-0 max-md:max-w-full'
            )}
            style={
              isMdUp
                ? { width: listWidth, minWidth: LIST_WIDTH_MIN, maxWidth: '60%' }
                : undefined
            }
            aria-label="Liste"
          >
            {filterBar && (
              <div
                className="shrink-0 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/40"
                aria-label="Filtres"
              >
                {filterBar}
              </div>
            )}
            {/* Liste + bande commune : scrollbar dessinée dans la bande de resize (trait rouge) ; fine bande resize à droite */}
            <div className="flex flex-1 min-h-0 min-w-0 relative">
              <div
                className={cn(
                  'flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden scrollbar-dashboard overscroll-contain',
                  'md:-mr-3 md:z-10'
                )}
              >
                <div className="min-h-full md:pr-3">{list}</div>
              </div>
              {showDetail && isMdUp && (
                <>
                  <div
                    className="hidden md:block shrink-0 w-3 pointer-events-none"
                    aria-hidden
                  />
                  <button
                    type="button"
                    onClick={(e) => e.preventDefault()}
                    onMouseDown={handleResizeStart}
                    className={cn(
                      'hidden md:flex absolute right-0 top-0 bottom-0 w-1 z-20',
                      'items-center justify-center cursor-col-resize',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset'
                    )}
                    aria-label="Redimensionner la colonne liste"
                    title="Glisser pour redimensionner"
                  />
                </>
              )}
            </div>
          </section>
        )}

        {/* Colonne 3 : panneau détail — seule la zone détail défile (type Outlook/Gmail), reste figé */}
        {showDetail && (
          <section
            className={cn(
              'hidden md:flex flex-1 min-w-[280px] min-h-0 overflow-hidden flex-col',
              'bg-white dark:bg-slate-950/40'
            )}
            aria-label="Détail"
          >
            {detail}
          </section>
        )}

        {/* Toolbar flottante */}
        {enableLayoutToolbar && (
          <LayoutToolbar
            onToggleSubSidebar={subSidebarCollapsible ? toggleSubSidebar : undefined}
            onToggleList={toggleList}
            onToggleDetail={toggleDetail}
            state={state}
          />
        )}
      </div>
    </div>
  );
}

function LayoutToolbar({
  onToggleSubSidebar,
  onToggleList,
  onToggleDetail,
  state,
}: {
  onToggleSubSidebar?: () => void;
  onToggleList: () => void;
  onToggleDetail: () => void;
  state: LayoutState;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-40',
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg',
        'p-2 flex items-center gap-1',
        'transition-opacity duration-200',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      role="toolbar"
      aria-label="Contrôles du layout"
    >
      {onToggleSubSidebar && (
        <button
          type="button"
          onClick={onToggleSubSidebar}
          className={cn(
            'p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
            state.subSidebarCollapsed && 'bg-slate-200 dark:bg-slate-700'
          )}
          title="Masquer/afficher la sidebar (Ctrl+[)"
        >
          <PanelLeft className="h-4 w-4 text-slate-600 dark:text-slate-300" />
        </button>
      )}
      <button
        type="button"
        onClick={onToggleList}
        className={cn(
          'p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
          state.listCollapsed && 'bg-slate-200 dark:bg-slate-700'
        )}
        title="Masquer/afficher la liste (Ctrl+])"
      >
        <List className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </button>
      <button
        type="button"
        onClick={onToggleDetail}
        className={cn(
          'p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
          state.detailCollapsed && 'bg-slate-200 dark:bg-slate-700'
        )}
        title="Masquer/afficher le détail (Ctrl+\)"
      >
        <PanelRight className="h-4 w-4 text-slate-600 dark:text-slate-300" />
      </button>
    </div>
  );
}
