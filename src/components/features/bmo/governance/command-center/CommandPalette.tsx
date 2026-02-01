/**
 * Command Palette - Recherche et navigation rapide
 * Accessible via ⌘K / Ctrl+K
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  FolderKanban,
  AlertTriangle,
  Users,
  Wallet,
  Shield,
  Workflow,
  LayoutDashboard,
  ArrowRight,
  Clock,
  FileText,
  AlertCircle,
  Target,
  X,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';
import { mainCategories, subCategories } from './config';

interface CommandItem {
  id: string;
  type: 'navigation' | 'action' | 'search-result';
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  category?: string;
  action: () => void;
}

export function CommandPalette() {
  const {
    commandPaletteOpen,
    toggleCommandPalette,
    navigate,
    openModal,
  } = useGovernanceCommandCenterStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Build command list
  const commands: CommandItem[] = React.useMemo(() => {
    const items: CommandItem[] = [];

    // Navigation commands
    mainCategories.forEach((cat) => {
      items.push({
        id: `nav-${cat.id}`,
        type: 'navigation',
        label: cat.label,
        description: cat.description,
        icon: cat.icon,
        category: 'Navigation',
        action: () => {
          navigate(cat.id as any);
          toggleCommandPalette();
        },
      });

      // Sub-categories
      const subs = subCategories[cat.id] || [];
      subs.forEach((sub) => {
        items.push({
          id: `nav-${cat.id}-${sub.id}`,
          type: 'navigation',
          label: `${cat.label} → ${sub.label}`,
          icon: sub.icon || cat.icon,
          category: 'Navigation',
          action: () => {
            navigate(cat.id as any, sub.id as any);
            toggleCommandPalette();
          },
        });
      });
    });

    // Quick actions
    items.push({
      id: 'action-new-decision',
      type: 'action',
      label: 'Nouvelle décision',
      description: 'Créer une décision à prendre',
      icon: Target,
      category: 'Actions rapides',
      action: () => {
        openModal('decision', { isNew: true });
        toggleCommandPalette();
      },
    });

    items.push({
      id: 'action-new-escalation',
      type: 'action',
      label: 'Nouvelle escalade',
      description: 'Escalader un problème',
      icon: AlertTriangle,
      category: 'Actions rapides',
      action: () => {
        openModal('escalation', { isNew: true });
        toggleCommandPalette();
      },
    });

    items.push({
      id: 'action-export',
      type: 'action',
      label: 'Exporter les données',
      description: 'Export Excel ou PDF',
      icon: FileText,
      category: 'Actions rapides',
      action: () => {
        openModal('export-config', {});
        toggleCommandPalette();
      },
    });

    return items;
  }, [navigate, openModal, toggleCommandPalette]);

  // Filter commands based on query
  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) return commands.slice(0, 15);

    const lowerQuery = query.toLowerCase();
    return commands.filter((cmd) =>
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.description?.toLowerCase().includes(lowerQuery)
    ).slice(0, 15);
  }, [commands, query]);

  // Group by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      const cat = cmd.category || 'Autres';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
          }
          break;
        case 'Escape':
          e.preventDefault();
          toggleCommandPalette();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex, toggleCommandPalette]);

  if (!commandPaletteOpen) return null;

  let flatIndex = 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={toggleCommandPalette}
      />

      {/* Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-50">
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Rechercher une page, action..."
              className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-400 text-sm outline-none"
            />
            <kbd className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[50vh] overflow-y-auto py-2">
            {Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-1.5">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                    {category}
                  </span>
                </div>
                {items.map((item) => {
                  const currentIndex = flatIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                        isSelected ? 'bg-blue-500/20' : 'hover:bg-slate-800/50'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        isSelected ? 'bg-blue-500/30' : 'bg-slate-800'
                      )}>
                        <Icon className={cn(
                          'h-4 w-4',
                          isSelected ? 'text-blue-400' : 'text-slate-400'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'text-sm truncate',
                          isSelected ? 'text-slate-200' : 'text-slate-400'
                        )}>
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="text-xs text-slate-600 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {isSelected && (
                        <ArrowRight className="h-4 w-4 text-blue-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                Aucun résultat pour "{query}"
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800 bg-slate-900/80 text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="bg-slate-800 px-1 rounded">↑↓</kbd> naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="bg-slate-800 px-1 rounded">↵</kbd> sélectionner
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="bg-slate-800 px-1 rounded">⌘K</kbd> ouvrir/fermer
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

