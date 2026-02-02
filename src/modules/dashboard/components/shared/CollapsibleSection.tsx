/**
 * Section repliable pour le dashboard — réduit la densité visuelle.
 * Recommandation audit : accordion / sections repliables.
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';

export type CollapsibleSectionPriority = 'critical' | 'normal';

export interface CollapsibleSectionProps {
  /** Titre de la section */
  title: string;
  /** Contenu affiché quand la section est dépliée */
  children: React.ReactNode;
  /** Dépliée par défaut */
  defaultExpanded?: boolean;
  /** Nombre d’éléments (badge optionnel) */
  itemCount?: number;
  /** Priorité : critical = bordure gauche accentuée si dépliée */
  priority?: CollapsibleSectionPriority;
  /** Id pour persistance / accessibilité */
  id?: string;
  /** Classe du conteneur */
  className?: string;
  /** Cacher la section quand affichage "synthétique" et priorité non critique (optionnel) */
  hideWhenCollapsed?: boolean;
}

export function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
  itemCount,
  priority = 'normal',
  id: idProp,
  className,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const id = idProp ?? `section-${title.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div
      id={id}
      className={cn(
        'collapsible-section rounded-2xl border overflow-hidden backdrop-blur-sm transition-all duration-300',
        'border-slate-200 bg-white dark:border-slate-800/70 dark:bg-slate-950/80',
        'shadow-sm dark:shadow-[0_4px_24px_-8px_rgba(0,0,0,0.35)] hover:shadow-md dark:hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]',
        priority === 'critical' && isExpanded && 'border-l-4 border-l-amber-500/60',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full px-4 py-3 min-h-[44px] flex items-center justify-between gap-3',
          'hover:bg-slate-100 dark:hover:bg-slate-900/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 focus-visible:ring-inset',
          'text-left'
        )}
        aria-expanded={isExpanded}
        aria-controls={`${id}-content`}
        aria-label={isExpanded ? `Replier : ${title}` : `Déplier : ${title}`}
      >
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</span>
        <div className="flex items-center gap-2">
          {itemCount != null && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400 rounded-full bg-slate-200 dark:bg-slate-800/60 px-2 py-0.5">
              {itemCount} élément{itemCount !== 1 ? 's' : ''}
            </span>
          )}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" aria-hidden />
          )}
        </div>
      </button>
      <div
        id={`${id}-content`}
        role="region"
        aria-labelledby={id}
        className={cn(
          'transition-[grid-template-rows] duration-300 ease-out',
          isExpanded ? 'grid-template-rows: 1fr' : 'grid-template-rows: 0fr'
        )}
        style={{
          display: 'grid',
          gridTemplateRows: isExpanded ? '1fr' : '0fr',
        }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-200 dark:border-slate-800/60 px-4 pb-4 pt-3">{children}</div>
        </div>
      </div>
    </div>
  );
}
