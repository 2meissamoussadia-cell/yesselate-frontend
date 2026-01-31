'use client';

/**
 * DocumentsContentPane — Panneau droit de l’explorateur Documents & Contrats.
 * Command bar type File Explorer + liste/tableau de documents.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { FolderPlus, Upload, Search } from 'lucide-react';

export function DocumentsContentPane() {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Command bar type File Explorer */}
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-950/80 text-xs text-slate-100 shrink-0'
        )}
        role="toolbar"
        aria-label="Actions documents"
      >
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-colors"
        >
          <FolderPlus className="h-3.5 w-3.5" aria-hidden />
          Nouveau dossier
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-colors"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden />
          Importer
        </button>
        <div className="flex-1 min-w-2" />
        <label className="relative flex items-center">
          <Search
            className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Rechercher…"
            className={cn(
              'w-48 pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-xs text-slate-100 placeholder:text-slate-400',
              'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 focus:ring-offset-slate-950'
            )}
            aria-label="Rechercher dans les documents"
          />
        </label>
      </div>

      {/* Liste de fichiers / contrats */}
      <div className="flex-1 min-w-0 max-w-full overflow-x-hidden overflow-y-auto p-4 min-h-0">
        <div className="rounded-xl border border-slate-800/60 bg-slate-950/60 p-4 text-xs text-slate-200 min-h-[200px]">
          Tableau / cartes de documents…
        </div>
      </div>
    </div>
  );
}
