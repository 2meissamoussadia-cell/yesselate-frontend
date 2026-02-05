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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';

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
  /** Contenu optionnel à gauche (ex. case « tout sélectionner » + menu déroulant) */
  leading?: React.ReactNode;
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

/** Échelle visuelle barre : icônes 16px fixes (référence pour checkboxes et icônes liste) */
const iconSize = 'h-[16px] w-[16px] shrink-0';
const defaultActions: QuickActionItem[] = [
  {
    id: 'delete',
    icon: <Trash2 className={iconSize} />,
    label: 'Supprimer',
    variant: 'ghost',
    hasDropdown: false,
    onClick: () => {},
  },
  {
    id: 'archive',
    icon: <Archive className={iconSize} />,
    label: 'Archiver',
    variant: 'ghost',
    onClick: () => {},
  },
  {
    id: 'mark',
    icon: <Flag className={iconSize} />,
    label: 'Marquer / démarquer',
    variant: 'ghost',
    hasDropdown: true,
    onClick: () => {},
  },
];

export const QuickActionsBar = React.memo(function QuickActionsBar({
  leading,
  primaryLabel = 'Nouveau message',
  primaryIcon = <Mail className={iconSize} />,
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
        'flex items-center gap-1.5 px-3 py-2.5 text-sm',
        className
      )}
    >
      {leading != null && (
        <>
          {leading}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 self-center" aria-hidden />
        </>
      )}
      <Button
        variant="info"
        size="sm"
        className="gap-1.5 text-sm h-8 min-w-[9rem] px-3 shrink-0"
        onClick={onPrimaryClick}
        aria-label={primaryLabel}
      >
        {primaryIcon}
        {primaryLabel}
        <ChevronDown className={iconSize + ' opacity-80'} />
      </Button>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 self-center" aria-hidden />

      <TooltipProvider>
        {actions.map((action) => {
          const isDisabledBySelection = !hasSelection && ['delete', 'archive', 'mark'].includes(action.id);
          const isDisabled = action.disabled ?? isDisabledBySelection;

          return (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <Button
                    variant={action.variant === 'primary' ? 'default' : (action.variant ?? 'ghost')}
                    size="sm"
                    className="gap-1.5 text-sm h-8 text-slate-700 dark:text-slate-300"
                    disabled={isDisabled}
                    onClick={action.onClick}
                    aria-label={action.label}
                  >
                    {action.icon}
                    <span className="hidden sm:inline">{action.label}</span>
                    {action.hasDropdown && <ChevronDown className="h-[14px] w-[14px] opacity-70 shrink-0" />}
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isDisabledBySelection ? (
                  <span>Sélectionnez un élément pour utiliser cette action</span>
                ) : (
                  <span>{action.label}</span>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>

      {onMoreClick && (
        <>
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 self-center" aria-hidden />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-600 dark:text-slate-400"
            onClick={onMoreClick}
            aria-label="Plus d'actions"
          >
            <MoreHorizontal className={iconSize + ' shrink-0'} />
          </Button>
        </>
      )}

      {hasSelection && (
        <span className="ml-auto text-xs text-slate-600 dark:text-slate-400">
          {selectedCount} élément{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
});
