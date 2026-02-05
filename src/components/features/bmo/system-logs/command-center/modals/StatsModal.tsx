'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { BarChart3, X } from 'lucide-react';

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
}

export function StatsModal({ open, onClose }: StatsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className={cn(
          'w-full max-w-2xl rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col overflow-hidden shadow-2xl',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-800/30">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-slate-400" />
            <h2 className="text-lg font-semibold text-slate-100">Statistiques logs</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-400">Graphiques et agrégats (par niveau, catégorie, période). À brancher sur l’API stats.</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 text-center">
              <div className="text-2xl font-bold text-slate-200">—</div>
              <div className="text-xs text-slate-400">Total logs</div>
            </div>
            <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 text-center">
              <div className="text-2xl font-bold text-slate-200">—</div>
              <div className="text-xs text-slate-400">Erreurs (24h)</div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
