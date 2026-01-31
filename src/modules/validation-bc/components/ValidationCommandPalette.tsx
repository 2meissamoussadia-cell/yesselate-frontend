/**
 * Palette de commandes pour Validation-BC
 */

'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileCheck,
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  TrendingUp,
  Users,
  Building2,
  Shield,
  Search,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { validationNavigation, type ValidationNavItem } from '../navigation/validationNavigationConfig';
import { useValidationBCCommandCenterStore } from '@/lib/stores/validationBCCommandCenterStore';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  keywords?: string[];
  action: () => void;
}

export function ValidationCommandPalette() {
  const router = useRouter();
  const {
    commandPaletteOpen,
    toggleCommandPalette,
    navigate,
    toggleFiltersPanel,
  } = useValidationBCCommandCenterStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Build command list
  const commands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [];

    // Navigation commands from navigation config
    validationNavigation.forEach((mainNode) => {
      // Main category
      items.push({
        id: `nav-${mainNode.id}`,
        label: mainNode.label,
        description: `Aller à ${mainNode.label}`,
        icon: mainNode.icon,
        category: 'Navigation',
        keywords: [mainNode.label.toLowerCase(), mainNode.id],
        action: () => {
          navigate(mainNode.id as any, null);
          const defaultChild = mainNode.children?.[0];
          if (defaultChild?.route) {
            router.push(defaultChild.route);
          }
          toggleCommandPalette();
        },
      });

      // Sub-categories
      mainNode.children?.forEach((child) => {
        items.push({
          id: `nav-${mainNode.id}-${child.id}`,
          label: `${mainNode.label} → ${child.label}`,
          description: `Aller à ${child.label}`,
          icon: child.icon,
          category: 'Navigation',
          keywords: [child.label.toLowerCase(), child.id, mainNode.label.toLowerCase()],
          action: () => {
            navigate(mainNode.id as any, child.id as any);
            if (child.route) {
              router.push(child.route);
            }
            toggleCommandPalette();
          },
        });
      });
    });

    // Quick actions
    items.push({
      id: 'action-refresh',
      label: 'Rafraîchir les données',
      description: 'Actualiser les statistiques et documents',
      icon: RefreshCw,
      category: 'Actions rapides',
      keywords: ['refresh', 'rafraîchir', 'actualiser'],
      action: () => {
        window.location.reload();
        toggleCommandPalette();
      },
    });

    items.push({
      id: 'action-filters',
      label: 'Ouvrir les filtres',
      description: 'Afficher le panneau de filtres',
      icon: Filter,
      category: 'Actions rapides',
      keywords: ['filtres', 'filters', 'rechercher'],
      action: () => {
        toggleFiltersPanel();
        toggleCommandPalette();
      },
    });

    return items;
  }, [navigate, router, toggleCommandPalette, toggleFiltersPanel]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      return commands;
    }

    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.keywords?.some((k) => k.includes(q))
    );
  }, [commands, query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          selected.action();
        }
      } else if (e.key === 'Escape') {
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex, toggleCommandPalette]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll to selected item
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-command-item]');
      const selectedItem = items[selectedIndex] as HTMLElement;
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!commandPaletteOpen) return null;

  // Group by category
  const groupedCommands = filteredCommands.reduce(
    (acc, cmd) => {
      if (!acc[cmd.category]) {
        acc[cmd.category] = [];
      }
      acc[cmd.category].push(cmd);
      return acc;
    },
    {} as Record<string, CommandItem[]>
  );

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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une page, action..."
              className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-400 text-sm outline-none"
            />
            <kbd className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">ESC</kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                Aucun résultat pour "{query}"
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {category}
                  </div>
                  {items.map((cmd) => {
                    const index = flatIndex++;
                    const isSelected = index === selectedIndex;
                    const Icon = cmd.icon;

                    return (
                      <button
                        key={cmd.id}
                        data-command-item
                        onClick={cmd.action}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                          isSelected
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'text-slate-300 hover:bg-slate-800/50'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{cmd.label}</div>
                          {cmd.description && (
                            <div className="text-xs text-slate-400 truncate">{cmd.description}</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">↓</kbd>
                <span>Naviguer</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Enter</kbd>
                <span>Sélectionner</span>
              </span>
            </div>
            <span>{filteredCommands.length} résultat{filteredCommands.length > 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </>
  );
}
