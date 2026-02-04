'use client';

/**
 * CalendarLayout — Layout pour vues calendrier / planning.
 * Gabarit C : sub-sidebar (vues/filtres) + zone calendrier + détail optionnel.
 *
 * Contrat :
 * - Présentation uniquement : slots.
 * - Utilisé pour : Planning, Conférences, Calendrier.
 *
 * Responsive :
 * - Desktop : sidebar + calendrier + détail
 * - Tablette : calendrier + détail (sidebar en drawer)
 * - Mobile : calendrier pleine page (détail en route/modal)
 */

import React from 'react';
import { cn } from '@/lib/cn';

export interface CalendarLayoutProps {
  /** Colonne gauche : dossiers/vues (ex: Agenda, Jalons, Événements) */
  sidebar?: React.ReactNode;
  /** Zone centrale : calendrier ou kanban */
  calendarContent: React.ReactNode;
  /** Panneau droit optionnel : détail de l'événement sélectionné */
  detailContent?: React.ReactNode;
  /** Barre d'actions au-dessus */
  quickActions?: React.ReactNode;
  className?: string;
}

export function CalendarLayout({
  sidebar,
  calendarContent,
  detailContent,
  quickActions,
  className,
}: CalendarLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col flex-1 min-h-0 min-w-0 max-w-full overflow-hidden',
        'bg-gray-50 dark:bg-slate-950/30',
        className
      )}
    >
      {quickActions && (
        <div
          className="shrink-0 border-b border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-950/40"
          aria-label="Actions rapides"
        >
          {quickActions}
        </div>
      )}

      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        {/* Sidebar — visible lg+ */}
        {sidebar && (
          <aside
            className={cn(
              'hidden lg:flex lg:shrink-0 lg:w-64 lg:min-w-[14rem] lg:max-w-xs',
              'border-r border-slate-200 dark:border-slate-800/60',
              'bg-white dark:bg-slate-950/50 overflow-y-auto'
            )}
            aria-label="Vues"
          >
            {sidebar}
          </aside>
        )}

        {/* Zone calendrier — flex-1 */}
        <section
          className={cn(
            'flex flex-col flex-1 min-w-0 overflow-hidden',
            detailContent ? 'lg:max-w-[calc(100%-28rem)]' : ''
          )}
          aria-label="Calendrier"
        >
          <div className="flex-1 min-h-0 overflow-hidden">{calendarContent}</div>
        </section>

        {/* Panneau détail — visible md+ si fourni */}
        {detailContent && (
          <section
            className={cn(
              'hidden md:flex flex-1 min-w-0 max-w-md overflow-hidden flex-col',
              'border-l border-slate-200 dark:border-slate-800/60',
              'bg-white dark:bg-slate-950/40'
            )}
            aria-label="Détail"
          >
            {detailContent}
          </section>
        )}
      </div>
    </div>
  );
}
