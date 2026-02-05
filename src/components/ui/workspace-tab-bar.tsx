'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { X } from 'lucide-react';

/**
 * WorkspaceTabBar — Composant générique robuste pour les onglets
 * ==============================================================
 * 
 * FIX CRITIQUE : L'onglet est un DIV avec role="tab", pas un <button>.
 * Le bouton "X" est un vrai <button> séparé avec stopPropagation.
 * Cela évite le bug HTML "button dans button" qui casse les clics.
 */

export type WorkspaceTabItem = {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isDirty?: boolean;
  closeable?: boolean;
};

export interface WorkspaceTabBarProps {
  tabs: WorkspaceTabItem[];
  activeId: string | null;
  onActivate: (id: string) => void;
  onClose: (id: string) => void;
  className?: string;
  showCloseAll?: boolean;
  onCloseAll?: () => void;
}

export function WorkspaceTabBar({
  tabs,
  activeId,
  onActivate,
  onClose,
  className,
  showCloseAll = false,
  onCloseAll,
}: WorkspaceTabBarProps) {
  if (!tabs.length) return null;

  return (
    <div
      className={cn(
        'w-full overflow-x-auto',
        'rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur-md',
        'dark:border-slate-800 dark:bg-[#141414]/60',
        className
      )}
      role="tablist"
      aria-label="Onglets de travail"
    >
      <div className="flex min-w-max items-stretch gap-1 p-1">
        {tabs.map((t) => {
          const active = t.id === activeId;
          const closeable = t.closeable !== false;
          
          return (
            <div
              key={t.id}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onActivate(t.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onActivate(t.id);
                }
              }}
              className={cn(
                'group relative flex items-center gap-2',
                'rounded-xl px-3 py-2 text-sm select-none cursor-pointer',
                'transition-colors duration-150',
                active
                  ? 'bg-slate-900/5 text-slate-900 dark:bg-white/10 dark:text-white'
                  : 'text-slate-600 hover:bg-slate-900/5 dark:text-slate-300 dark:hover:bg-white/10'
              )}
            >
              {/* Icône */}
              {t.icon && (
                <span className="flex-none text-base">{t.icon}</span>
              )}
              
              {/* Titre */}
              <span className="max-w-[200px] truncate">
                {t.title}
              </span>
              
              {/* Indicateur dirty */}
              {t.isDirty && (
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-none" title="Modifications non enregistrées" />
              )}

              {/* Bouton fermer — vrai <button>, pas imbriqué */}
              {closeable && (
                <button
                  type="button"
                  className={cn(
                    'ml-1 inline-flex h-5 w-5 items-center justify-center rounded-md',
                    'opacity-0 group-hover:opacity-60 hover:!opacity-100',
                    'hover:bg-slate-900/10 dark:hover:bg-white/10',
                    'transition-opacity duration-150'
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onClose(t.id);
                  }}
                  aria-label={`Fermer ${t.title}`}
                  title="Fermer l'onglet"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}
        
        {/* Bouton fermer tout */}
        {showCloseAll && tabs.length > 1 && onCloseAll && (
          <button
            type="button"
            className={cn(
              'ml-2 px-2 py-1 text-xs rounded-lg',
              'text-slate-400 hover:text-slate-600 hover:bg-slate-100',
              'dark:hover:text-slate-200 dark:hover:bg-slate-800',
              'transition-colors'
            )}
            onClick={onCloseAll}
            title="Fermer tous les onglets"
          >
            Fermer tout
          </button>
        )}
      </div>
    </div>
  );
}

