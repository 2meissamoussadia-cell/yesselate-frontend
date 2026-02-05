/**
 * Dashboard personnalisable avec grille drag & drop (Phase 2 #9)
 * Utilise react-grid-layout : glisser-déposer + redimensionnement.
 * Sauvegarde layout (x, y, w, h) en localStorage.
 */

'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Settings2, Save, Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  ResponsiveGridLayout,
  useContainerWidth,
  type LayoutItem,
  type Layout,
} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export interface GridWidgetDefinition {
  label: string;
  component: React.ReactNode;
  /** Dimensions par défaut (w, h) — optionnel */
  defaultSize?: { w: number; h: number };
}

export interface GridCustomizableDashboardProps {
  widgets: Record<string, GridWidgetDefinition | { label: string; component: React.ReactNode }>;
  defaultOrder: string[];
  storageKey?: string;
  className?: string;
  /** Activer drag en mode édition uniquement */
  editModeOnly?: boolean;
}

const STORAGE_KEY_DEFAULT = 'dashboard-grid-layout';

function layoutToOrder(layout: Layout): string[] {
  return [...layout].sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y)).map((i) => i.i);
}

function defaultLayout(
  ids: string[],
  widgets: Record<string, GridWidgetDefinition | { label: string; component: React.ReactNode }>
): Layout {
  return ids.map((id, index) => {
    const def = widgets[id] as GridWidgetDefinition | undefined;
    const { w = 6, h = 2 } = (def && 'defaultSize' in def ? def.defaultSize : null) ?? {};
    const cols = 12;
    const x = (index * 6) % cols;
    const y = Math.floor((index * 6) / cols) * 2;
    return {
      i: id,
      x,
      y,
      w,
      h,
      minW: 2,
      minH: 1,
    };
  });
}

function loadLayout(
  storageKey: string,
  defaultIds: string[],
  widgets: Record<string, GridWidgetDefinition | { label: string; component: React.ReactNode }>
): Layout {
  if (typeof window === 'undefined') return defaultLayout(defaultIds, widgets);
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultLayout(defaultIds, widgets);
    const parsed = JSON.parse(raw) as LayoutItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultLayout(defaultIds, widgets);
    const valid = parsed.filter((i) => typeof i.i === 'string' && widgets[i.i]);
    return valid.length > 0 ? valid : defaultLayout(defaultIds, widgets);
  } catch {
    return defaultLayout(defaultIds, widgets);
  }
}

function saveLayout(storageKey: string, layout: Layout) {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify(layout.map((i) => ({ i: i.i, x: i.x, y: i.y, w: i.w, h: i.h })))
    );
  } catch {
    // ignore
  }
}

export function GridCustomizableDashboard({
  widgets,
  defaultOrder,
  storageKey = STORAGE_KEY_DEFAULT,
  className,
  editModeOnly = true,
}: GridCustomizableDashboardProps) {
  const { width, containerRef, mounted } = useContainerWidth({ measureBeforeMount: false });
  const [editing, setEditing] = useState(false);

  const initialLayout = useMemo(
    () => loadLayout(storageKey, defaultOrder, widgets),
    [storageKey, defaultOrder, widgets]
  );

  const [layouts, setLayouts] = useState<{ lg: Layout }>({ lg: initialLayout });

  const visibleIds = useMemo(() => layoutToOrder(layouts.lg), [layouts.lg]);
  const availableToAdd = Object.keys(widgets).filter((id) => !visibleIds.includes(id));

  const handleLayoutChange = useCallback(
    (_layout: Layout, newLayouts: { lg?: Layout }) => {
      const lg = newLayouts.lg ?? layouts.lg;
      setLayouts({ lg });
      if (!editing) saveLayout(storageKey, lg);
    },
    [editing, storageKey, layouts.lg]
  );

  const handleSave = useCallback(() => {
    saveLayout(storageKey, layouts.lg);
    setEditing(false);
  }, [storageKey, layouts.lg]);

  const addWidget = useCallback((id: string) => {
    const def = widgets[id] as GridWidgetDefinition | undefined;
    const { w = 6, h = 2 } = (def && 'defaultSize' in def ? def.defaultSize : null) ?? {};
    const layout = layouts.lg;
    const maxY = layout.length > 0 ? Math.max(...layout.map((i) => i.y + i.h)) : 0;
    setLayouts({
      lg: [...layout, { i: id, x: 0, y: maxY, w, h, minW: 2, minH: 1 }],
    });
  }, [widgets, layouts.lg]);

  const removeWidget = useCallback((id: string) => {
    setLayouts((prev) => ({
      lg: prev.lg.filter((i) => i.i !== id),
    }));
  }, []);

  useEffect(() => {
    if (!editing && layouts.lg.length > 0) {
      saveLayout(storageKey, layouts.lg);
    }
  }, [editing, storageKey, layouts.lg]);

  const isDraggable = !editModeOnly || editing;
  const isResizable = !editModeOnly || editing;

  return (
    <div className={cn('relative', className)}>
      {/* Bouton Personnaliser / Sauvegarder */}
      <button
        type="button"
        onClick={() => (editing ? handleSave() : setEditing(true))}
        className={cn(
          'fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-950',
          editing ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-sky-600 hover:bg-sky-500 text-white'
        )}
        aria-label={editing ? 'Sauvegarder la disposition' : 'Personnaliser le dashboard'}
      >
        {editing ? <Save className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
        <span className="text-sm font-medium">{editing ? 'Sauvegarder' : 'Personnaliser'}</span>
      </button>

      {/* Panneau Ajouter widget */}
      {editing && availableToAdd.length > 0 && (
        <div className="fixed left-4 top-28 z-[30] w-56 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 p-4 shadow-xl">
          <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-slate-200">Ajouter un widget</h3>
          <div className="space-y-1">
            {availableToAdd.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => addWidget(id)}
                className="flex w-full items-center gap-2 rounded-lg bg-sky-600/80 px-3 py-2 text-left text-xs text-white hover:bg-sky-500"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                {widgets[id].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grille react-grid-layout */}
      <div ref={containerRef} className="min-h-[400px]">
        {mounted && visibleIds.length > 0 && width > 0 ? (
          <ResponsiveGridLayout
            width={width}
            className="layout"
            layouts={layouts}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={80}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            dragConfig={{
              enabled: isDraggable,
              handle: editing ? '.drag-handle' : undefined,
              threshold: 3,
              bounded: true,
            }}
            resizeConfig={{
              enabled: isResizable,
              handles: ['se', 's', 'e'],
            }}
            onLayoutChange={handleLayoutChange}
          >
            {visibleIds.map((id) => (
              <div
                key={id}
                className={cn(
                  'rounded-xl border overflow-hidden',
                  'bg-white dark:bg-slate-900/60',
                  editing ? 'border-slate-400 dark:border-slate-600 ring-2 ring-sky-500/30' : 'border-slate-200 dark:border-slate-800/60'
                )}
              >
                {editing && (
                  <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
                    <span
                      className="drag-handle cursor-grab active:cursor-grabbing rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200 touch-none"
                      aria-label="Glisser pour déplacer"
                    >
                      ⋮⋮
                    </span>
                    <button
                      type="button"
                      onClick={() => removeWidget(id)}
                      className="rounded p-1.5 text-rose-400 hover:bg-rose-900/30 hover:text-rose-300"
                      aria-label="Retirer le widget"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className={cn('p-4 h-full overflow-auto', editing && 'pt-12')}>{widgets[id]?.component}</div>
              </div>
            ))}
          </ResponsiveGridLayout>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/50 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Aucun widget affiché. Cliquez sur « Personnaliser » pour ajouter des widgets.
          </div>
        )}
      </div>
    </div>
  );
}
