/**
 * DragDropContext Component
 * Contexte pour gérer le drag & drop global
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface DragItem {
  id: string;
  type: string;
  data: any;
}

interface DragDropContextValue {
  draggedItem: DragItem | null;
  setDraggedItem: (item: DragItem | null) => void;
  isDragging: boolean;
  startDrag: (item: DragItem) => void;
  endDrag: () => void;
}

export const DragDropContext = createContext<DragDropContextValue | undefined>(
  undefined
);

export interface DragDropProviderProps {
  children: React.ReactNode;
}

export function DragDropProvider({ children }: DragDropProviderProps) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);

  const startDrag = useCallback((item: DragItem) => {
    setDraggedItem(item);
  }, []);

  const endDrag = useCallback(() => {
    setDraggedItem(null);
  }, []);

  return (
    <DragDropContext.Provider
      value={{
        draggedItem,
        setDraggedItem,
        isDragging: draggedItem !== null,
        startDrag,
        endDrag,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
}

