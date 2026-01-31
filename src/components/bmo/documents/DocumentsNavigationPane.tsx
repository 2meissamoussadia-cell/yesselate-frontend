'use client';

/**
 * DocumentsNavigationPane — Volet gauche de l’explorateur Documents & Contrats.
 * Favoris, Programmes, Chantiers, Contrats.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Star, FolderKanban, FileText, Briefcase } from 'lucide-react';

const sections = [
  { id: 'favorites', label: 'Favoris', icon: Star },
  { id: 'programs', label: 'Programmes', icon: FolderKanban },
  { id: 'projects', label: 'Chantiers', icon: Briefcase },
  { id: 'contracts', label: 'Contrats', icon: FileText },
] as const;

export function DocumentsNavigationPane() {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="p-3 text-xs text-slate-200">
      {sections.map((s) => {
        const Icon = s.icon;
        const isActive = activeId === s.id;
        return (
          <div key={s.id} className="mb-3">
            <p className="px-2 mb-1 text-[0.7rem] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden />
              {s.label}
            </p>
            <ul className="space-y-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => setActiveId(isActive ? null : s.id)}
                  className={cn(
                    'w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 transition-colors',
                    isActive
                      ? 'bg-slate-800/80 text-slate-100'
                      : 'hover:bg-slate-800/80 text-slate-300'
                  )}
                >
                  Exemple élément
                </button>
              </li>
            </ul>
          </div>
        );
      })}
    </div>
  );
}
