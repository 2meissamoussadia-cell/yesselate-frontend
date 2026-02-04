'use client';

/**
 * DetailPanel — Panneau de détail générique type Outlook.
 * Slots pour header et contenu, réutilisable pour tous les modules BMO.
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch, pas de store.
 * - Props : item, renderHeader, renderContent, emptyMessage, loading.
 * - Page gère : chargement, données, actions.
 * 
 * Améliorations v2 :
 * - État vide riche avec illustration et suggestions
 * - Animations de transition
 * - Raccourcis clavier visibles
 * - Statistiques contextuelles
 */

import React from 'react';
import { cn } from '@/lib/cn';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MousePointerClick, 
  Inbox, 
  ArrowUpRight, 
  Keyboard,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Sparkles,
} from 'lucide-react';

export interface DetailPanelProps<T> {
  item: T | null;
  /** Rendu du header (titre, métadonnées, actions) */
  renderHeader?: (item: T) => React.ReactNode;
  /** Rendu du contenu principal */
  renderContent: (item: T) => React.ReactNode;
  emptyMessage?: string;
  /** Description supplémentaire pour l'état vide */
  emptyDescription?: string;
  /** Icône pour l'état vide */
  emptyIcon?: React.ComponentType<{ className?: string }>;
  /** État de chargement du détail */
  loading?: boolean;
  /** Actions secondaires optionnelles en pied de panneau */
  renderFooter?: (item: T) => React.ReactNode;
  /** Raccourcis clavier à afficher dans l'état vide */
  shortcuts?: Array<{ key: string; label: string; icon?: React.ComponentType<{ className?: string }> }>;
  /** Nombre total d'éléments disponibles */
  totalItems?: number;
  /** Astuces/tips à afficher dans l'état vide */
  tips?: string[];
  className?: string;
}

/** Raccourcis clavier par défaut */
const defaultShortcuts = [
  { key: '↑↓', label: 'Naviguer', icon: ArrowUp },
  { key: '↵', label: 'Ouvrir', icon: CornerDownLeft },
];

/** Composant d'état vide enrichi style Outlook */
function EmptyDetailState({
  message,
  description,
  icon: Icon = Inbox,
  shortcuts = defaultShortcuts,
  totalItems,
  tips,
}: {
  message: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcuts?: Array<{ key: string; label: string; icon?: React.ComponentType<{ className?: string }> }>;
  totalItems?: number;
  tips?: string[];
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in duration-300">
      {/* Illustration animée */}
      <div className="relative mb-6">
        {/* Cercle de fond avec gradient */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
          <Icon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
        </div>
        {/* Badge décoratif */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/50 flex items-center justify-center border-2 border-white dark:border-slate-900">
          <MousePointerClick className="w-4 h-4 text-sky-600 dark:text-sky-400" />
        </div>
      </div>

      {/* Message principal */}
      <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
        {message}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description || 'Sélectionnez un élément dans la liste pour afficher ses détails ici.'}
      </p>

      {/* Statistiques */}
      {typeof totalItems === 'number' && totalItems > 0 && (
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 mb-6">
          <Inbox className="w-4 h-4 text-slate-500" />
          <span className="font-medium">{totalItems}</span>
          <span>élément{totalItems > 1 ? 's' : ''} disponible{totalItems > 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Raccourcis clavier */}
      <div className="w-full max-w-xs">
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <Keyboard className="w-3.5 h-3.5" />
          <span className="font-medium uppercase tracking-wider">Raccourcis</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {shortcuts.map(({ key, label, icon: ShortcutIcon }) => (
            <div 
              key={key} 
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50"
            >
              <kbd className="flex items-center justify-center min-w-[28px] h-6 px-1.5 bg-white dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 text-xs font-mono text-slate-700 dark:text-slate-300 shadow-sm">
                {key}
              </kbd>
              <span className="text-xs text-slate-600 dark:text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tips optionnels */}
      {tips && tips.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/50 max-w-sm">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0" />
            <div className="text-left">
              <p className="text-xs font-medium text-sky-800 dark:text-sky-300 mb-1">Astuce</p>
              <p className="text-xs text-sky-700 dark:text-sky-400">{tips[0]}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function DetailPanel<T>({
  item,
  renderHeader,
  renderContent,
  emptyMessage = 'Sélectionnez un élément',
  emptyDescription,
  emptyIcon,
  loading = false,
  renderFooter,
  shortcuts,
  totalItems,
  tips,
  className,
}: DetailPanelProps<T>) {
  if (!item) {
    return (
      <div
        className={cn(
          'flex-1 flex items-center justify-center',
          'bg-gradient-to-br from-slate-50 to-slate-100/50',
          'dark:from-slate-900/30 dark:to-slate-900/10',
          className
        )}
        aria-live="polite"
      >
        <EmptyDetailState
          message={emptyMessage}
          description={emptyDescription}
          icon={emptyIcon}
          shortcuts={shortcuts}
          totalItems={totalItems}
          tips={tips}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('flex flex-col flex-1 overflow-hidden', className)}>
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800/60 p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col flex-1 min-h-0 overflow-hidden', className)}
      aria-label="Détail"
    >
      {renderHeader && (
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800/60 overflow-hidden">
          {renderHeader(item)}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        {renderContent(item)}
      </div>

      {renderFooter && (
        <div className="shrink-0 border-t border-slate-200 dark:border-slate-800/60">
          {renderFooter(item)}
        </div>
      )}
    </div>
  );
}
