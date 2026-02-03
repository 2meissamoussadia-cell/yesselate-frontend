/**
 * Store Undo/Redo global — Actions annulables/refaisables type Outlook
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface UndoRedoAction {
  id: string;
  type: string;
  timestamp: number;
  data: unknown;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  description: string;
}

interface UndoRedoState {
  past: UndoRedoAction[];
  future: UndoRedoAction[];
  maxHistorySize: number;

  executeAction: (action: Omit<UndoRedoAction, 'id' | 'timestamp'>) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  clear: () => void;

  canUndo: () => boolean;
  canRedo: () => boolean;
  getHistory: () => UndoRedoAction[];
}

export const useUndoRedoStore = create<UndoRedoState>()(
  devtools(
    (set, get) => ({
      past: [],
      future: [],
      maxHistorySize: 50,

      executeAction: async (actionData) => {
        const action: UndoRedoAction = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          ...actionData,
        };

        await action.redo();

        set((state) => {
          const newPast = [...state.past, action];
          if (newPast.length > state.maxHistorySize) {
            newPast.shift();
          }
          return { past: newPast, future: [] };
        });
      },

      undo: async () => {
        const { past } = get();
        if (past.length === 0) return;

        const action = past[past.length - 1];
        try {
          await action.undo();
          set((state) => ({
            past: state.past.slice(0, -1),
            future: [action, ...state.future],
          }));
        } catch (error) {
          console.error('Undo failed:', error);
          throw error;
        }
      },

      redo: async () => {
        const { future } = get();
        if (future.length === 0) return;

        const action = future[0];
        try {
          await action.redo();
          set((state) => ({
            past: [...state.past, action],
            future: state.future.slice(1),
          }));
        } catch (error) {
          console.error('Redo failed:', error);
          throw error;
        }
      },

      clear: () => set({ past: [], future: [] }),

      canUndo: () => get().past.length > 0,
      canRedo: () => get().future.length > 0,
      getHistory: () => get().past,
    }),
    { name: 'UndoRedoStore' }
  )
);
