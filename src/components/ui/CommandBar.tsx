'use client';

/**
 * CommandBar — Barre de commandes type Explorer / app Windows.
 * Accepte soit actions (icône ComponentType), soit items (icône ReactNode, primary = overflow).
 */

import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AccessibleButton } from './AccessibleButton';
import {
  Plus,
  Download,
  Filter,
  RefreshCw,
  LayoutGrid,
  List,
} from 'lucide-react';

export interface CommandBarAction {
  id: string;
  label: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

/** Item BMO : icône en ReactNode, primary = visible (sinon dans overflow). */
export interface CommandBarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
}

export interface CommandBarProps {
  /** Actions (icône ComponentType) — affichées toutes visibles */
  actions?: CommandBarAction[];
  /** Items BMO (icône ReactNode) — primary = visibles, autres dans overflow "…" */
  items?: CommandBarItem[];
  className?: string;
}

const defaultActions: CommandBarAction[] = [
  { id: 'new', label: 'Nouveau', icon: Plus },
  { id: 'export', label: 'Exporter', icon: Download },
  { id: 'filter', label: 'Filtrer', icon: Filter },
  { id: 'refresh', label: 'Mettre à jour', icon: RefreshCw },
  { id: 'view-grid', label: 'Vue grille', icon: LayoutGrid },
  { id: 'view-list', label: 'Vue liste', icon: List },
];

function CommandBarOverflow({ items }: { items: CommandBarItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-center rounded-lg p-1.5 border border-slate-700 bg-slate-900/90 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 focus:ring-offset-slate-950"
        aria-label="Plus d'actions"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <MoreHorizontal className="h-4 w-4 text-slate-200" aria-hidden />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-800 bg-slate-950/95 shadow-xl z-50 py-1"
          role="menu"
        >
          <ul className="text-xs text-slate-100">
            {items.map((item) => (
              <li key={item.id} role="none">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  disabled={item.disabled}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 flex items-center gap-2 disabled:opacity-50"
                >
                  {item.icon && (
                    <span className="h-4 w-4 [&>svg]:h-4 [&>svg]:w-4 text-slate-400">{item.icon}</span>
                  )}
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CommandBar({ actions, items, className }: CommandBarProps) {
  const effectiveActions = actions ?? (items ? undefined : defaultActions);

  if (items != null) {
    const primary = items.filter((i) => !i.disabled && i.primary !== false);
    const secondary = items.filter((i) => !i.disabled && i.primary === false);
    return (
      <div
        className={cn(
          'flex items-center gap-1 px-3 md:px-4 py-1.5 md:py-2',
          'border-b border-slate-800/70 bg-slate-950/80 text-xs text-slate-100',
          className
        )}
        role="toolbar"
        aria-label="Barre de commandes"
      >
        <div className="flex items-center gap-1 md:gap-2 flex-wrap">
          {primary.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5',
                'border border-slate-700 bg-slate-900/90 hover:bg-slate-800',
                'transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 focus:ring-offset-slate-950',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
              aria-label={item.label}
            >
              {item.icon && (
                <span className="h-4 w-4 flex items-center justify-center text-slate-200 [&>svg]:h-4 [&>svg]:w-4">
                  {item.icon}
                </span>
              )}
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-2" />
        {secondary.length > 0 && <CommandBarOverflow items={secondary} />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 border-b border-slate-800/70 bg-slate-950/80',
        className
      )}
      role="toolbar"
      aria-label="Barre de commandes"
    >
      {effectiveActions?.map((action) => {
        const Icon = action.icon;
        return (
          <AccessibleButton
            key={action.id}
            onClick={action.onClick ?? (() => {})}
            ariaLabel={action.label}
            variant="default"
            className="inline-flex items-center gap-1.5"
          >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
            {action.label}
          </AccessibleButton>
        );
      })}
    </div>
  );
}
