/**
 * Dashboard personnalisable — Phase 2 #9 audit ERP BTP 2026.
 * Inspiré Procore : ordre et visibilité des widgets, sauvegarde en localStorage.
 * Drag & drop via @dnd-kit pour réordonner les widgets.
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Settings2, Save, ChevronUp, ChevronDown, Plus, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAchievementsStore } from '@/lib/stores/achievementsStore';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface WidgetDefinition {
  label: string;
  component: React.ReactNode;
}

export interface CustomizableDashboardProps {
  /** Catalogue des widgets : id → { label, component } */
  widgets: Record<string, WidgetDefinition>;
  /** Ordre par défaut des ids (si non chargé depuis le storage) */
  defaultOrder: string[];
  /** Clé localStorage (ex: "cockpit-dg-widgets") */
  storageKey?: string;
  className?: string;
}

const STORAGE_KEY_DEFAULT = 'dashboard-widget-order';

function loadOrder(storageKey: string, defaultOrder: string[]): string[] {
  if (typeof window === 'undefined') return defaultOrder;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaultOrder;
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : defaultOrder;
  } catch {
    return defaultOrder;
  }
}

function saveOrder(storageKey: string, order: string[]) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(order));
  } catch {
    /* ignore */
  }
}

/** Widget sortable (drag handle + transform) — utilisé uniquement en mode édition. */
function SortableWidgetItem({
  id,
  editing,
  children,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
}: {
  id: string;
  editing: boolean;
  children: React.ReactNode;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !editing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-xl border overflow-hidden',
        'bg-white dark:bg-slate-900/60',
        editing ? 'border-slate-400 dark:border-slate-600 ring-2 ring-sky-500/30' : 'border-slate-200 dark:border-slate-800/60',
        isDragging && 'opacity-60 shadow-xl z-10'
      )}
    >
      {editing && (
        <div className="absolute left-2 top-2 z-10 flex items-center gap-1">
          <span
            className="cursor-grab active:cursor-grabbing rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200 touch-none"
            aria-label="Glisser pour réordonner"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="h-4 w-4" />
          </span>
        </div>
      )}
      {editing && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-30"
            aria-label="Remonter"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-30"
            aria-label="Descendre"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="rounded p-1.5 text-rose-400 hover:bg-rose-900/30 hover:text-rose-300"
            aria-label="Retirer le widget"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className={cn('p-2', editing && 'pl-10')}>{children}</div>
    </div>
  );
}

export function CustomizableDashboard({
  widgets,
  defaultOrder,
  storageKey = STORAGE_KEY_DEFAULT,
  className,
}: CustomizableDashboardProps) {
  const [order, setOrder] = useState<string[]>(() => loadOrder(storageKey, defaultOrder));
  const [editing, setEditing] = useState(false);

  // Filtrer l'ordre pour ne garder que les ids encore présents dans le catalogue
  const visibleIds = order.filter((id) => widgets[id]);
  const availableToAdd = Object.keys(widgets).filter((id) => !visibleIds.includes(id));

  const addWidget = useCallback(
    (id: string) => {
      setOrder((prev) => [...prev.filter((i) => i !== id), id]);
    },
    []
  );

  const removeWidget = useCallback((id: string) => {
    setOrder((prev) => prev.filter((i) => i !== id));
  }, []);

  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }, []);

  const moveDown = useCallback((index: number) => {
    setOrder((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((prev) => {
      const ids = prev.filter((i) => widgets[i]);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex === -1 || newIndex === -1) return prev;
      return arrayMove(ids, oldIndex, newIndex);
    });
  }, [widgets]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const unlockAchievement = useAchievementsStore((s) => s.unlock);
  const handleSave = useCallback(() => {
    saveOrder(storageKey, visibleIds);
    setEditing(false);
    unlockAchievement('dashboard_custom');
  }, [storageKey, visibleIds, unlockAchievement]);

  // Persister au changement d'ordre (optionnel : on peut ne sauver qu'au clic "Sauvegarder")
  useEffect(() => {
    if (!editing && visibleIds.length > 0) {
      saveOrder(storageKey, visibleIds);
    }
  }, [editing, storageKey, visibleIds]);

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

      {/* Panneau Ajouter widget (mode édition) */}
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

      {/* Grille de widgets (drag & drop en mode édition) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {visibleIds.length === 0 ? (
          <div className="col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/50 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Aucun widget affiché. Cliquez sur « Personnaliser » pour ajouter des widgets.
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={visibleIds} strategy={verticalListSortingStrategy}>
              {visibleIds.map((id, index) => (
                <SortableWidgetItem
                  key={id}
                  id={id}
                  editing={editing}
                  onMoveUp={() => moveUp(index)}
                  onMoveDown={() => moveDown(index)}
                  onRemove={() => removeWidget(id)}
                  canMoveUp={index > 0}
                  canMoveDown={index < visibleIds.length - 1}
                >
                  {widgets[id].component}
                </SortableWidgetItem>
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
