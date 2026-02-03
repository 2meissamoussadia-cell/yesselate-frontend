/**
 * Hook Undo/Redo avec raccourcis clavier (Ctrl+Z, Ctrl+Shift+Z)
 */

import { useEffect } from 'react';
import { useUndoRedoStore } from '@/lib/stores/undo-redo-store';

export function useUndoRedo() {
  const undo = useUndoRedoStore((s) => s.undo);
  const redo = useUndoRedoStore((s) => s.redo);
  const canUndo = useUndoRedoStore((s) => s.canUndo);
  const canRedo = useUndoRedoStore((s) => s.canRedo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return { undo, redo, canUndo: canUndo(), canRedo: canRedo() };
}
