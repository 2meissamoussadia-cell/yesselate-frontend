'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { keys: 'Ctrl+K', label: 'Palette de commandes' },
  { keys: 'Echap', label: 'Fermer' },
  { keys: 'Ctrl+E', label: 'Export' },
  { keys: 'Ctrl+I', label: 'Scan intégrité' },
  { keys: 'Ctrl+S', label: 'Statistiques' },
];

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn(
          'w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col overflow-hidden shadow-2xl',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-800/30">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-100">Raccourcis</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 space-y-3">
          {SHORTCUTS.map(({ keys, label }) => (
            <div key={keys} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">{label}</span>
              <kbd className="rounded border border-slate-600 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-200">{keys}</kbd>
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
