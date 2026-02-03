'use client';

/**
 * CommandPalette — Palette de commandes Cmd+K / Ctrl+K
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Command } from 'cmdk';

export interface CommandPaletteItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  category: string;
  keywords?: string[];
  action: () => void;
}

export interface CommandPaletteProps {
  items: CommandPaletteItem[];
}

export function CommandPalette({ items }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const grouped = items.reduce<Record<string, CommandPaletteItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0"
      onClick={() => setOpen(false)}
    >
      <div
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl"
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
        >
          <div className="flex items-center border-b border-slate-200 dark:border-slate-700 px-4">
            <span className="mr-3 text-slate-400">⌘</span>
            <Command.Input
              placeholder="Rechercher actions, modules, chantiers..."
              className="flex-1 py-4 text-base outline-none bg-transparent"
            />
            <kbd className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded">
              Esc
            </kbd>
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-8 text-center text-sm text-slate-500">
              Aucun résultat trouvé.
            </Command.Empty>
            {Object.entries(grouped).map(([category, categoryItems]) => (
              <Command.Group key={category} heading={category}>
                {categoryItems.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${item.label} ${item.keywords?.join(' ') ?? ''}`}
                    onSelect={() => {
                      item.action();
                      setOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer aria-selected:bg-sky-50 dark:aria-selected:bg-sky-900/30 aria-selected:text-sky-700 dark:aria-selected:text-sky-300"
                  >
                    {item.icon && <span className="w-5 h-5 shrink-0">{item.icon}</span>}
                    <span className="flex-1">{item.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </div>
    </div>,
    document.body
  );
}
