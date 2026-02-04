'use client';

/**
 * EmptyStates — États vides enrichis avec illustrations et CTAs
 * 
 * Caractéristiques :
 * - Illustrations SVG professionnelles
 * - Messages contextuels
 * - CTAs clairs
 * - Suggestions d'actions
 * - Support dark mode
 */

import React from 'react';
import { cn } from '@/lib/cn';
import {
  Inbox,
  Search,
  FileX,
  AlertCircle,
  WifiOff,
  Lock,
  Filter,
  Users,
  Calendar,
  CheckCircle,
  Plus,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { ActionButton } from './ActionButton';

export type EmptyStateType = 
  | 'no-data'
  | 'no-results'
  | 'no-selection'
  | 'error'
  | 'offline'
  | 'permission'
  | 'filter-empty'
  | 'team-empty'
  | 'calendar-empty'
  | 'completed';

export interface EmptyStateProps {
  /** Type d'état vide */
  type?: EmptyStateType;
  /** Titre personnalisé */
  title?: string;
  /** Description personnalisée */
  description?: string;
  /** Icône personnalisée */
  icon?: React.ReactNode;
  /** Action principale */
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /** Action secondaire */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Suggestions/tips */
  suggestions?: string[];
  /** Taille */
  size?: 'sm' | 'md' | 'lg';
  /** Classes additionnelles */
  className?: string;
}

const emptyStateConfig: Record<EmptyStateType, {
  icon: React.ReactNode;
  title: string;
  description: string;
  suggestions?: string[];
}> = {
  'no-data': {
    icon: <Inbox className="w-12 h-12" />,
    title: 'Aucune donnée',
    description: 'Il n\'y a pas encore de données à afficher ici.',
    suggestions: ['Créez votre premier élément', 'Importez des données existantes'],
  },
  'no-results': {
    icon: <Search className="w-12 h-12" />,
    title: 'Aucun résultat',
    description: 'Aucun élément ne correspond à votre recherche.',
    suggestions: ['Vérifiez l\'orthographe', 'Essayez des termes plus généraux', 'Supprimez certains filtres'],
  },
  'no-selection': {
    icon: <FileX className="w-12 h-12" />,
    title: 'Sélectionnez un élément',
    description: 'Cliquez sur un élément de la liste pour afficher ses détails.',
  },
  'error': {
    icon: <AlertCircle className="w-12 h-12" />,
    title: 'Une erreur est survenue',
    description: 'Impossible de charger les données. Veuillez réessayer.',
    suggestions: ['Actualisez la page', 'Vérifiez votre connexion', 'Contactez le support'],
  },
  'offline': {
    icon: <WifiOff className="w-12 h-12" />,
    title: 'Hors ligne',
    description: 'Vous n\'êtes pas connecté à Internet.',
    suggestions: ['Vérifiez votre connexion WiFi', 'Vérifiez vos données mobiles'],
  },
  'permission': {
    icon: <Lock className="w-12 h-12" />,
    title: 'Accès restreint',
    description: 'Vous n\'avez pas les permissions nécessaires pour accéder à ce contenu.',
    suggestions: ['Contactez votre administrateur', 'Demandez un accès'],
  },
  'filter-empty': {
    icon: <Filter className="w-12 h-12" />,
    title: 'Aucun résultat avec ces filtres',
    description: 'Essayez de modifier vos critères de filtrage.',
    suggestions: ['Élargissez la période', 'Sélectionnez plus de catégories'],
  },
  'team-empty': {
    icon: <Users className="w-12 h-12" />,
    title: 'Aucun membre',
    description: 'Cette équipe ne contient aucun membre.',
    suggestions: ['Invitez des collaborateurs', 'Importez depuis un annuaire'],
  },
  'calendar-empty': {
    icon: <Calendar className="w-12 h-12" />,
    title: 'Calendrier vide',
    description: 'Aucun événement prévu pour cette période.',
    suggestions: ['Créez un nouvel événement', 'Changez la période affichée'],
  },
  'completed': {
    icon: <CheckCircle className="w-12 h-12" />,
    title: 'Tout est fait !',
    description: 'Vous n\'avez aucune tâche en attente.',
  },
};

const sizeConfig = {
  sm: {
    container: 'py-8 px-4',
    icon: 'w-10 h-10',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12 px-6',
    icon: 'w-12 h-12',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16 px-8',
    icon: 'w-16 h-16',
    title: 'text-xl',
    description: 'text-base',
  },
};

export function EmptyState({
  type = 'no-data',
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  suggestions,
  size = 'md',
  className,
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const sizes = sizeConfig[size];

  const displayTitle = title ?? config.title;
  const displayDescription = description ?? config.description;
  const displaySuggestions = suggestions ?? config.suggestions;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
    >
      {/* Illustration */}
      <div className="relative mb-6">
        <div className={cn(
          'rounded-full bg-gradient-to-br',
          'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700',
          'flex items-center justify-center',
          size === 'sm' && 'w-16 h-16',
          size === 'md' && 'w-20 h-20',
          size === 'lg' && 'w-24 h-24'
        )}>
          <span className={cn(
            'text-slate-400 dark:text-slate-500',
            sizes.icon,
            '[&>svg]:w-full [&>svg]:h-full'
          )}>
            {icon ?? config.icon}
          </span>
        </div>
        {/* Decorative element */}
        <div className={cn(
          'absolute -bottom-1 -right-1 rounded-full',
          'bg-sky-100 dark:bg-sky-900/30',
          'flex items-center justify-center',
          size === 'sm' && 'w-5 h-5',
          size === 'md' && 'w-6 h-6',
          size === 'lg' && 'w-8 h-8'
        )}>
          <span className={cn(
            'text-sky-500',
            size === 'sm' && 'w-3 h-3',
            size === 'md' && 'w-3.5 h-3.5',
            size === 'lg' && 'w-4 h-4'
          )}>
            {type === 'error' ? '!' : type === 'completed' ? '✓' : '?'}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className={cn(
        'font-semibold text-slate-800 dark:text-slate-200 mb-2',
        sizes.title
      )}>
        {displayTitle}
      </h3>

      {/* Description */}
      <p className={cn(
        'text-slate-500 dark:text-slate-400 max-w-sm mb-6',
        sizes.description
      )}>
        {displayDescription}
      </p>

      {/* Suggestions */}
      {displaySuggestions && displaySuggestions.length > 0 && (
        <ul className="text-sm text-slate-500 dark:text-slate-400 mb-6 space-y-1">
          {displaySuggestions.map((suggestion, i) => (
            <li key={i} className="flex items-center gap-2 justify-center">
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      {(primaryAction || secondaryAction) && (
        <div className="flex items-center gap-3">
          {primaryAction && (
            <ActionButton
              variant="primary"
              size={size === 'sm' ? 'sm' : 'md'}
              iconLeft={primaryAction.icon ?? <Plus className="w-4 h-4" />}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </ActionButton>
          )}
          {secondaryAction && (
            <ActionButton
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'md'}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </ActionButton>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * NoSearchResults — État spécifique pour recherche vide
 */
export function NoSearchResults({
  query,
  onClearSearch,
  className,
}: {
  query?: string;
  onClearSearch?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      type="no-results"
      title={query ? `Aucun résultat pour "${query}"` : 'Aucun résultat'}
      primaryAction={onClearSearch ? {
        label: 'Effacer la recherche',
        onClick: onClearSearch,
        icon: <RefreshCw className="w-4 h-4" />,
      } : undefined}
      className={className}
    />
  );
}

/**
 * ErrorState — État d'erreur avec retry
 */
export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      type="error"
      description={message}
      primaryAction={onRetry ? {
        label: 'Réessayer',
        onClick: onRetry,
        icon: <RefreshCw className="w-4 h-4" />,
      } : undefined}
      className={className}
    />
  );
}

/**
 * NoPermissionState — État d'accès refusé
 */
export function NoPermissionState({
  resource,
  onRequestAccess,
  className,
}: {
  resource?: string;
  onRequestAccess?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      type="permission"
      description={resource 
        ? `Vous n'avez pas accès à ${resource}.` 
        : undefined}
      primaryAction={onRequestAccess ? {
        label: 'Demander l\'accès',
        onClick: onRequestAccess,
        icon: <ArrowRight className="w-4 h-4" />,
      } : undefined}
      className={className}
    />
  );
}

/**
 * AllDoneState — État "tout est fait"
 */
export function AllDoneState({
  message,
  onViewArchive,
  className,
}: {
  message?: string;
  onViewArchive?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      type="completed"
      description={message ?? 'Félicitations ! Vous avez traité toutes vos tâches.'}
      secondaryAction={onViewArchive ? {
        label: 'Voir les archives',
        onClick: onViewArchive,
      } : undefined}
      className={className}
    />
  );
}
