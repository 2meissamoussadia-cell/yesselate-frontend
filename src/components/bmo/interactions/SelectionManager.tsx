'use client';

/**
 * SelectionManager — Gestion de la sélection multiple type Outlook
 * Ctrl+clic = toggle, Shift+clic = plage
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface SelectionContextValue {
  selectedIds: Set<string>;
  lastSelectedId: string | null;
  isSelected: (id: string) => boolean;
  select: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  selectRange: (fromId: string, toId: string, allIds: string[]) => void;
  toggle: (id: string) => void;
  clear: () => void;
  selectAll: (ids: string[]) => void;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const select = useCallback((id: string) => {
    setSelectedIds(new Set([id]));
    setLastSelectedId(id);
  }, []);

  const selectMultiple = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
    setLastSelectedId(ids[ids.length - 1] ?? null);
  }, []);

  const selectRange = useCallback((fromId: string, toId: string, allIds: string[]) => {
    const fromIndex = allIds.indexOf(fromId);
    const toIndex = allIds.indexOf(toId);
    if (fromIndex === -1 || toIndex === -1) return;
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    const rangeIds = allIds.slice(start, end + 1);
    setSelectedIds((prev) => new Set([...prev, ...rangeIds]));
    setLastSelectedId(toId);
  }, []);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setLastSelectedId(id);
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
    setLastSelectedId(ids[ids.length - 1] ?? null);
  }, []);

  return (
    <SelectionContext.Provider
      value={{
        selectedIds,
        lastSelectedId,
        isSelected,
        select,
        selectMultiple,
        selectRange,
        toggle,
        clear,
        selectAll,
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
}

export function useSelectionClick(itemId: string, allIds: string[]) {
  const { select, toggle, selectRange, lastSelectedId } = useSelection();

  return useCallback(
    (e: React.MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        toggle(itemId);
      } else if (e.shiftKey && lastSelectedId) {
        selectRange(lastSelectedId, itemId, allIds);
      } else {
        select(itemId);
      }
    },
    [itemId, allIds, select, toggle, selectRange, lastSelectedId]
  );
}
