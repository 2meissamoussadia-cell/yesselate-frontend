'use client';

/**
 * UndoRedoToolbar — Barre Annuler/Refaire + historique
 */

import React from 'react';
import { Undo, Redo, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useUndoRedoStore } from '@/lib/stores/undo-redo-store';

export function UndoRedoToolbar() {
  const undo = useUndoRedoStore((s) => s.undo);
  const redo = useUndoRedoStore((s) => s.redo);
  const canUndo = useUndoRedoStore((s) => s.canUndo());
  const canRedo = useUndoRedoStore((s) => s.canRedo());
  const getHistory = useUndoRedoStore((s) => s.getHistory);

  const history = getHistory();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => undo()}
        disabled={!canUndo}
        title="Annuler (Ctrl+Z)"
        className="h-8 w-8 p-0"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => redo()}
        disabled={!canRedo}
        title="Refaire (Ctrl+Shift+Z)"
        className="h-8 w-8 p-0"
      >
        <Redo className="h-4 w-4" />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            title="Historique"
            className="h-8 w-8 p-0"
          >
            <History className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Historique des actions</h4>
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune action</p>
            ) : (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {[...history].reverse().map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between text-xs p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded"
                  >
                    <span className="flex-1 truncate">{action.description}</span>
                    <span className="text-slate-500 shrink-0 ml-2">
                      {new Date(action.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
