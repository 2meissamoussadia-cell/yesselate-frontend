'use client';

/**
 * QuickActionsBar — Barre d'actions rapides type Outlook (Nouveau…, Supprimer, Archiver, etc.).
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch, pas de store.
 * - Props : primaryLabel, primaryIcon, onPrimaryClick, actions[], selectedCount, onMoreClick.
 * - Page gère : sélection, exécution des actions (nouveau message, suppression, archivage, etc.).
 */

import React from 'react';
import { Mail, Trash2, Archive, Flag, ChevronDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QuickActionItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  hasDropdown?: boolean;
  onClick: () => void;
}

export interface QuickActionsBarProps {
  /** Bouton primaire (ex. "Nouveau message") */
  primaryLabel?: string;
  primaryIcon?: React.ReactNode;
  onPrimaryClick?: () => void;
  /** Actions secondaires (Supprimer, Archiver, Marquer, etc.) */
  actions?: QuickActionItem[];
  /** Nombre d'éléments sélectionnés (affiche "X élément(s) sélectionné(s)" si > 0) */
  selectedCount?: number;
  /** Menu overflow "..." (optionnel) */
  onMoreClick?: () => void;
  className?: string;
}

const defaultActions: QuickActionItem[] = [
  {
    id: 'delete',
    icon: <Trash2 className="h-5 w-5" />,
    label: 'Supprimer',
    variant: 'ghost',
    hasDropdown: false,
    onClick: () => {},
  },
  {
    id: 'archive',
    icon: <Archive className="h-5 w-5" />,
    label: 'Archiver',
    variant: 'ghost',
    onClick: () => {},
  },
  {
    id: 'mark',
    icon: <Flag className="h-5 w-5" />,
    label: 'Marquer / démarquer',
    variant: 'ghost',
    hasDropdown: true,
    onClick: () => {},
  },
];

export function QuickActionsBar({
  primaryLabel = 'Nouveau message',
  primaryIcon = <Mail className="h-5 w-5" />,
  onPrimaryClick,
  actions = defaultActions,
  selectedCount = 0,
  onMoreClick,
  className,
}: QuickActionsBarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-3',
        className
      )}
    >
      <Button
        variant="info"
        size="default"
        className="gap-2"
        onClick={onPrimaryClick}
        aria-label={primaryLabel}
      >
        {primaryIcon}
        {primaryLabel}
        <ChevronDown className="h-4 w-4 opacity-80" />
      </Button>

      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" aria-hidden />

      {actions.map((action) => (
        <Button
          key={action.id}
          variant={action.variant ?? 'ghost'}
          size="sm"
          className="gap-1.5 text-slate-700 dark:text-slate-300"
          disabled={action.disabled ?? (hasSelection ? false : ['delete', 'archive', 'mark'].includes(action.id))}
          onClick={action.onClick}
          aria-label={action.label}
        >
          {action.icon}
          <span className="hidden sm:inline">{action.label}</span>
          {action.hasDropdown && <ChevronDown className="h-3.5 w-3.5 opacity-70" />}
        </Button>
      ))}

      {onMoreClick && (
        <>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" aria-hidden />
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-600 dark:text-slate-400"
            onClick={onMoreClick}
            aria-label="Plus d'actions"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </>
      )}

      {hasSelection && (
        <span className="ml-auto text-sm text-slate-600 dark:text-slate-400">
          {selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
