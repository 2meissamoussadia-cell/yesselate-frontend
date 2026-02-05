/**
 * Composant EmptyState réutilisable pour les vues Calendrier
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title = 'Aucun élément',
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {Icon && (
        <div className="mb-4 p-3 rounded-full bg-slate-800/50 border border-slate-700/50">
          <Icon className="h-6 w-6 text-slate-400" />
        </div>
      )}
      <h3 className="text-sm font-medium text-slate-300 mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

