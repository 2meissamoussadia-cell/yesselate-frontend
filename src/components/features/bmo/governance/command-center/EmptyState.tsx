/**
 * Composant d'état vide
 * Affiché quand il n'y a pas de données
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Inbox,
  Search,
  Filter,
  Plus,
  RefreshCw,
  FileX,
  AlertCircle,
} from 'lucide-react';

type EmptyStateVariant = 'no-data' | 'no-results' | 'filtered' | 'error';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const defaultConfig: Record<EmptyStateVariant, { icon: React.ComponentType<{ className?: string }>; title: string; description: string }> = {
  'no-data': {
    icon: Inbox,
    title: 'Aucune donnée',
    description: 'Il n\'y a aucun élément à afficher pour le moment.',
  },
  'no-results': {
    icon: Search,
    title: 'Aucun résultat',
    description: 'Votre recherche n\'a retourné aucun résultat.',
  },
  'filtered': {
    icon: Filter,
    title: 'Aucun élément',
    description: 'Aucun élément ne correspond aux filtres sélectionnés.',
  },
  'error': {
    icon: AlertCircle,
    title: 'Erreur de chargement',
    description: 'Une erreur est survenue lors du chargement des données.',
  },
};

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  icon,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const config = defaultConfig[variant];
  const Icon = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mb-4">
        <Icon className={cn(
          'h-8 w-8',
          variant === 'error' ? 'text-red-400' : 'text-slate-400'
        )} />
      </div>

      <h3 className="text-base font-medium text-slate-300 mb-1">
        {displayTitle}
      </h3>

      <p className="text-sm text-slate-400 max-w-sm mb-6">
        {displayDescription}
      </p>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              className={cn(
                variant === 'error'
                  ? 'bg-slate-700 hover:bg-slate-600'
                  : 'bg-blue-600 hover:bg-blue-700'
              )}
              size="sm"
            >
              {variant === 'error' ? (
                <RefreshCw className="h-4 w-4 mr-1.5" />
              ) : (
                <Plus className="h-4 w-4 mr-1.5" />
              )}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="border-slate-700 text-slate-400"
              size="sm"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Composant de chargement
 */
export function LoadingState({
  message = 'Chargement...',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4',
        className
      )}
    >
      <div className="relative w-10 h-10 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
        <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}

