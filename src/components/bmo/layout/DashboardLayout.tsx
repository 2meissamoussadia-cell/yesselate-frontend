'use client';

/**
 * DashboardLayout — Layout pour vues synthèse (grille KPIs, widgets).
 * Gabarit B : zone unique sans liste/détail.
 *
 * Contrat :
 * - Présentation uniquement : slots enfants.
 * - Utilisé pour : Dashboard DG, Admin, Cockpit.
 */

import React from 'react';
import { cn } from '@/lib/cn';

export interface DashboardLayoutProps {
  /** Barre d'actions optionnelle au-dessus du contenu */
  quickActions?: React.ReactNode;
  /** Contenu principal (grille de widgets, KPIs) */
  children: React.ReactNode;
  className?: string;
}

export function DashboardLayout({
  quickActions,
  children,
  className,
}: DashboardLayoutProps) {
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

      <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6" aria-label="Contenu">
        {children}
      </main>
    </div>
  );
}
