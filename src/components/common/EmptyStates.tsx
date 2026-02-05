/**
 * Empty States Components
 * ========================
 * 
 * Composants pour afficher les états vides (listes, recherches, etc.)
 */

'use client';

import React, { ReactNode } from 'react';
import { 
  FileQuestion, 
  Search, 
  Inbox, 
  FolderOpen, 
  Database,
  Filter,
  AlertCircle,
  Plus,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/cn';

// ============================================
// EMPTY STATE BASE
// ============================================

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {/* Icon */}
      {icon && (
        <div className="mb-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              {action.icon}
              {action.label}
            </button>
          )}

          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// EMPTY LIST
// ============================================

interface EmptyListProps {
  title?: string;
  description?: string;
  onAdd?: () => void;
  addLabel?: string;
}

export function EmptyList({
  title = 'Aucun élément',
  description = 'Il n\'y a aucun élément à afficher pour le moment.',
  onAdd,
  addLabel = 'Ajouter un élément',
}: EmptyListProps) {
  return (
    <EmptyState
      icon={<Inbox className="w-12 h-12 text-slate-400" />}
      title={title}
      description={description}
      action={
        onAdd
          ? {
              label: addLabel,
              onClick: onAdd,
              icon: <Plus className="w-5 h-5" />,
            }
          : undefined
      }
    />
  );
}

// ============================================
// EMPTY SEARCH
// ============================================

interface EmptySearchProps {
  query: string;
  onReset?: () => void;
}

export function EmptySearch({ query, onReset }: EmptySearchProps) {
  return (
    <EmptyState
      icon={<Search className="w-12 h-12 text-slate-400" />}
      title="Aucun résultat trouvé"
      description={`Aucun résultat pour "${query}". Essayez avec d'autres mots-clés ou vérifiez l'orthographe.`}
      action={
        onReset
          ? {
              label: 'Réinitialiser la recherche',
              onClick: onReset,
            }
          : undefined
      }
    />
  );
}

// ============================================
// EMPTY FILTER
// ============================================

interface EmptyFilterProps {
  onClearFilters?: () => void;
}

export function EmptyFilter({ onClearFilters }: EmptyFilterProps) {
  return (
    <EmptyState
      icon={<Filter className="w-12 h-12 text-slate-400" />}
      title="Aucun résultat avec ces filtres"
      description="Essayez de modifier ou supprimer certains filtres pour voir plus de résultats."
      action={
        onClearFilters
          ? {
              label: 'Supprimer les filtres',
              onClick: onClearFilters,
            }
          : undefined
      }
    />
  );
}

// ============================================
// EMPTY FOLDER
// ============================================

interface EmptyFolderProps {
  onUpload?: () => void;
}

export function EmptyFolder({ onUpload }: EmptyFolderProps) {
  return (
    <EmptyState
      icon={<FolderOpen className="w-12 h-12 text-slate-400" />}
      title="Dossier vide"
      description="Ce dossier ne contient aucun fichier pour le moment."
      action={
        onUpload
          ? {
              label: 'Ajouter des fichiers',
              onClick: onUpload,
              icon: <Plus className="w-5 h-5" />,
            }
          : undefined
      }
    />
  );
}

// ============================================
// EMPTY DATA
// ============================================

interface EmptyDataProps {
  onRefresh?: () => void;
}

export function EmptyData({ onRefresh }: EmptyDataProps) {
  return (
    <EmptyState
      icon={<Database className="w-12 h-12 text-slate-400" />}
      title="Aucune donnée disponible"
      description="Il n'y a pas de données à afficher pour le moment."
      action={
        onRefresh
          ? {
              label: 'Actualiser',
              onClick: onRefresh,
              icon: <RefreshCw className="w-5 h-5" />,
            }
          : undefined
      }
    />
  );
}

// ============================================
// ERROR STATE
// ============================================

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Une erreur est survenue',
  description = 'Impossible de charger les données. Veuillez réessayer.',
  onRetry,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={<AlertCircle className="w-12 h-12 text-red-500" />}
      title={title}
      description={description}
      action={
        onRetry
          ? {
              label: 'Réessayer',
              onClick: onRetry,
              icon: <RefreshCw className="w-5 h-5" />,
            }
          : undefined
      }
    />
  );
}

// ============================================
// NOT FOUND
// ============================================

interface NotFoundProps {
  title?: string;
  description?: string;
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export function NotFound({
  title = 'Page non trouvée',
  description = 'La page que vous recherchez n\'existe pas ou a été déplacée.',
  onGoBack,
  onGoHome,
}: NotFoundProps) {
  return (
    <EmptyState
      icon={<FileQuestion className="w-12 h-12 text-slate-400" />}
      title={title}
      description={description}
      action={
        onGoHome
          ? {
              label: 'Retour à l\'accueil',
              onClick: onGoHome,
            }
          : undefined
      }
      secondaryAction={
        onGoBack
          ? {
              label: 'Retour',
              onClick: onGoBack,
            }
          : undefined
      }
    />
  );
}

// ============================================
// EMPTY CARD (pour grilles)
// ============================================

interface EmptyCardProps {
  message?: string;
  onAdd?: () => void;
}

export function EmptyCard({ message = 'Aucun élément', onAdd }: EmptyCardProps) {
  return (
    <div className="p-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
      <div className="text-center">
        <div className="mb-3 inline-flex p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
          <Plus className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
          {message}
        </p>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        )}
      </div>
    </div>
  );
}
