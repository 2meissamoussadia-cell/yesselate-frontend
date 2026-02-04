'use client';

import React, { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Search, Command } from 'lucide-react';
import { useHotkeys } from '@/hooks/useHotkeys';
import { cn } from '@/lib/cn';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  category: string;
  action: () => void;
  hotkey?: string;
}

export function ValidationBCCommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  // Open with Ctrl+K
  useHotkeys(
    'ctrl+k',
    (e: KeyboardEvent) => {
      e.preventDefault();
      setOpen(true);
    },
    []
  );

  // Listen for custom event
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('validation-bc:open-command-palette', handleOpen);
    return () => window.removeEventListener('validation-bc:open-command-palette', handleOpen);
  }, []);

  const commands: CommandItem[] = [
    {
      id: 'open-stats',
      label: 'Voir les statistiques',
      description: 'Statistiques complètes de validation',
      category: 'Actions',
      hotkey: 'Ctrl+S',
      action: () => {
        window.dispatchEvent(new CustomEvent('validation-bc:open-stats'));
        setOpen(false);
      },
    },
    {
      id: 'open-export',
      label: 'Exporter les données',
      description: 'Export CSV, JSON ou PDF',
      category: 'Actions',
      hotkey: 'Ctrl+E',
      action: () => {
        window.dispatchEvent(new CustomEvent('validation-bc:open-export'));
        setOpen(false);
      },
    },
    {
      id: 'open-decision-center',
      label: 'Centre de décision',
      description: 'Documents urgents à traiter',
      category: 'Navigation',
      hotkey: 'Ctrl+D',
      action: () => {
        window.dispatchEvent(new CustomEvent('validation-bc:open-decision-center'));
        setOpen(false);
      },
    },
  ];

  const filteredCommands = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase())
  );

  const categories = [...new Set(filteredCommands.map((cmd) => cmd.category))];

  return (
    <FluentModal
      open={open}
      title="Palette de commandes"
      onClose={() => {
        setOpen(false);
        setQuery('');
      }}
    >
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une action..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200/70 bg-white/90 outline-none focus:ring-2 focus:ring-purple-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white"
            autoFocus
          />
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-4">
          {categories.map((category) => (
            <div key={category}>
              <div className="text-xs font-semibold text-slate-400 uppercase mb-2 px-2">{category}</div>
              <div className="space-y-1">
                {filteredCommands
                  .filter((cmd) => cmd.category === category)
                  .map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{cmd.label}</div>
                        {cmd.description && <div className="text-xs text-slate-400 mt-0.5">{cmd.description}</div>}
                      </div>
                      {cmd.hotkey && (
                        <kbd className="flex-none px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-600 dark:text-slate-400">
                          {cmd.hotkey}
                        </kbd>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Command className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Aucune commande trouvée</p>
            </div>
          )}
        </div>
      </div>
    </FluentModal>
  );
}

