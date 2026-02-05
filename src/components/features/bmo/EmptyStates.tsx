'use client';
import React from 'react';
import { 
  Inbox, 
  Search, 
  FileQuestion, 
  AlertCircle, 
  Plus, 
  RefreshCw,
  FolderOpen,
  Users,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/cn';

// ============================================
// TYPES
// ============================================

export type EmptyStateType = 
  | 'default' 
  | 'search' 
  | 'error' 
  | 'no-data' 
  | 'no-results' 
  | 'no-items' 
  | 'no-files' 
  | 'no-users' 
  | 'no-events' 
  | 'no-stats';

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  image?: string;
}

// ============================================
// CONFIGURATIONS PAR TYPE
// ============================================

const emptyStateConfigs: Record<EmptyStateType, Partial<EmptyStateProps>> = {
  default: {
    icon: <Inbox className="w-12 h-12" />,
    title: 'Aucun élément',
    message: 'Il n\'y a pas encore d\'éléments à afficher.',
  },
  search: {
    icon: <Search className="w-12 h-12" />,
    title: 'Aucun résultat',
    message: 'Aucun résultat ne correspond à votre recherche. Essayez avec d\'autres mots-clés.',
  },
  error: {
    icon: <AlertCircle className="w-12 h-12" />,
    title: 'Erreur de chargement',
    message: 'Impossible de charger les données. Veuillez réessayer plus tard.',
  },
  'no-data': {
    icon: <FileQuestion className="w-12 h-12" />,
    title: 'Aucune donnée',
    message: 'Aucune donnée disponible pour le moment.',
  },
  'no-results': {
    icon: <Search className="w-12 h-12" />,
    title: 'Aucun résultat trouvé',
    message: 'Votre recherche n\'a retourné aucun résultat.',
  },
  'no-items': {
    icon: <Inbox className="w-12 h-12" />,
    title: 'Aucun élément',
    message: 'Il n\'y a aucun élément dans cette liste pour le moment.',
  },
  'no-files': {
    icon: <FolderOpen className="w-12 h-12" />,
    title: 'Aucun fichier',
    message: 'Aucun fichier n\'a été ajouté pour le moment.',
  },
  'no-users': {
    icon: <Users className="w-12 h-12" />,
    title: 'Aucun utilisateur',
    message: 'Aucun utilisateur trouvé.',
  },
  'no-events': {
    icon: <Calendar className="w-12 h-12" />,
    title: 'Aucun événement',
    message: 'Aucun événement planifié pour le moment.',
  },
  'no-stats': {
    icon: <BarChart3 className="w-12 h-12" />,
    title: 'Aucune statistique',
    message: 'Aucune donnée statistique disponible pour le moment.',
  },
};

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function EmptyState({
  type = 'default',
  title,
  message,
  icon,
  action,
  secondaryAction,
  className,
  image,
}: EmptyStateProps) {
  const config = emptyStateConfigs[type];
  const finalTitle = title || config.title;
  const finalMessage = message || config.message;
  const finalIcon = icon || config.icon;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 rounded-xl',
        'bg-slate-800/30 border border-slate-700/50',
        'text-center',
        className
      )}
    >
      {/* Image ou Icône */}
      {image ? (
        <img src={image} alt={finalTitle} className="w-32 h-32 mb-4 object-contain opacity-50" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 mb-4">
          {finalIcon}
        </div>
      )}

      {/* Titre */}
      <h3 className="text-lg font-semibold text-slate-200 mb-2">{finalTitle}</h3>

      {/* Message */}
      <p className="text-sm text-slate-400 max-w-md mb-6">{finalMessage}</p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {action && (
            <button
              onClick={action.onClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              {action.icon || <Plus className="w-4 h-4" />}
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 text-slate-200 font-medium hover:bg-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPOSANTS SPÉCIALISÉS
// ============================================

interface EmptySearchProps {
  query?: string;
  onClear?: () => void;
  onNewSearch?: () => void;
}

export function EmptySearch({ query, onClear, onNewSearch }: EmptySearchProps) {
  return (
    <EmptyState
      type="search"
      message={
        query
          ? `Aucun résultat pour "${query}". Essayez avec d'autres mots-clés.`
          : 'Aucun résultat trouvé. Modifiez vos critères de recherche.'
      }
      action={onNewSearch ? { label: 'Nouvelle recherche', onClick: onNewSearch } : undefined}
      secondaryAction={onClear ? { label: 'Effacer', onClick: onClear } : undefined}
    />
  );
}

interface EmptyListProps {
  itemName?: string;
  onCreate?: () => void;
}

export function EmptyList({ itemName = 'élément', onCreate }: EmptyListProps) {
  return (
    <EmptyState
      type="no-items"
      title={`Aucun ${itemName}`}
      message={`Il n'y a aucun ${itemName} dans cette liste pour le moment.`}
      action={
        onCreate
          ? {
              label: `Créer un ${itemName}`,
              onClick: onCreate,
              icon: <Plus className="w-4 h-4" />,
            }
          : undefined
      }
    />
  );
}

interface EmptyErrorProps {
  onRetry?: () => void;
  error?: string;
}

export function EmptyError({ onRetry, error }: EmptyErrorProps) {
  return (
    <EmptyState
      type="error"
      message={error || 'Une erreur est survenue lors du chargement des données.'}
      action={onRetry ? { label: 'Réessayer', onClick: onRetry, icon: <RefreshCw className="w-4 h-4" /> } : undefined}
    />
  );
}

interface EmptyFiltersProps {
  onClearFilters?: () => void;
}

export function EmptyFilters({ onClearFilters }: EmptyFiltersProps) {
  return (
    <EmptyState
      type="no-results"
      title="Aucun résultat avec ces filtres"
      message="Aucun élément ne correspond aux filtres sélectionnés. Modifiez vos critères pour voir plus de résultats."
      action={
        onClearFilters
          ? {
              label: 'Réinitialiser les filtres',
              onClick: onClearFilters,
              icon: <RefreshCw className="w-4 h-4" />,
            }
          : undefined
      }
    />
  );
}


