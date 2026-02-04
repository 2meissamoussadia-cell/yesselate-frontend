'use client';

/**
 * MessageListContextMenu — Menu contextuel pour une ligne de liste (messages, alertes).
 *
 * Contrat :
 * - Présentation uniquement : pas de fetch, pas de logique métier.
 * - Props : position (x, y), item (optionnel, pour affichage), actions[], onAction(id), onClose.
 * - Page gère : état d’ouverture/position, liste des actions, exécution des actions (marquer lu, archiver, etc.).
 * - S’ouvre au clic droit sur la ligne ou au clic sur le bouton « … » de la ligne.
 */

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { BmoMessage } from './types';

export interface MessageListContextMenuAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  /** Séparateur visuel après cet item (optionnel) */
  separatorAfter?: boolean;
}

export interface MessageListContextMenuProps {
  /** Position en pixels (viewport). */
  x: number;
  y: number;
  /** Élément concerné (optionnel, pour en-tête du menu). */
  item?: BmoMessage | null;
  /** Actions proposées ; la page fournit les callbacks via onAction. */
  actions: MessageListContextMenuAction[];
  /** Appelé quand l’utilisateur choisit une action (id de l’action). */
  onAction: (actionId: string) => void;
  /** Fermeture du menu (clic dehors, Escape, ou après action). */
  onClose: () => void;
  className?: string;
}

export function MessageListContextMenu({
  x,
  y,
  item,
  actions,
  onAction,
  onClose,
  className,
}: MessageListContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleAction = (actionId: string) => {
    const action = actions.find((a) => a.id === actionId);
    if (action?.disabled) return;
    onAction(actionId);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-[100] min-w-[200px] max-w-[280px] rounded-xl border border-slate-200 dark:border-slate-700/60',
        'bg-white dark:bg-slate-900/95 backdrop-blur shadow-xl py-1',
        'animate-in fade-in zoom-in-95 duration-150',
        className
      )}
      style={{ left: x, top: y }}
      role="menu"
      aria-label="Actions"
    >
      {item && (
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate" title={item.subject}>
            {item.subject || '(Sans objet)'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 shrink-0"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {actions.map((action) => (
        <React.Fragment key={action.id}>
          <button
            type="button"
            role="menuitem"
            disabled={action.disabled}
            onClick={() => handleAction(action.id)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
              'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70',
              'disabled:opacity-50 disabled:pointer-events-none'
            )}
          >
            {action.icon && <span className="text-slate-500 dark:text-slate-400 shrink-0">{action.icon}</span>}
            {action.label}
          </button>
          {action.separatorAfter && (
            <div className="my-1 border-t border-slate-100 dark:border-slate-800" aria-hidden />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
