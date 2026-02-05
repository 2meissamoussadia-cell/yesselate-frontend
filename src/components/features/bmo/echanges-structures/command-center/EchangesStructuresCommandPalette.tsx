/**
 * Command Palette — Échanges Structurés
 * Recherche et navigation rapide (⌘K / Ctrl+K)
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import {
  Search,
  LayoutDashboard,
  Inbox,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Timer,
  BarChart3,
  Settings,
  FileText,
  Filter,
  Plus,
  Download,
  X,
} from 'lucide-react';
import { useEchangesStructuresCommandCenterStore } from '@/lib/stores/echangesStructuresCommandCenterStore';
import { echangesStructuresCategories } from './EchangesStructuresCommandSidebar';
import type { EchangesStructuresMainCategory } from '@/lib/stores/echangesStructuresCommandCenterStore';

interface CommandItem {
  id: string;
  type: 'navigation' | 'action';
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  action: () => void;
}

export function EchangesStructuresCommandPalette() {
  const {
    commandPaletteOpen,
    toggleCommandPalette,
    navigate,
    openModal,
  } = useEchangesStructuresCommandCenterStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const commands: CommandItem[] = React.useMemo(() => {
    const items: CommandItem[] = [];

    echangesStructuresCategories.forEach((cat) => {
      items.push({
        id: `nav-${cat.id}`,
        type: 'navigation',
        label: cat.label,
        description: `Aller à ${cat.label}`,
        icon: cat.icon,
        category: 'Navigation',
        action: () => {
          navigate(cat.id as EchangesStructuresMainCategory, 'all', null);
          toggleCommandPalette();
        },
      });
    });

    items.push({
      id: 'action-create',
      type: 'action',
      label: 'Nouvel échange',
      description: 'Créer un nouvel échange structuré',
      icon: Plus,
      category: 'Actions',
      action: () => {
        openModal('create', {});
        toggleCommandPalette();
      },
    });
    items.push({
      id: 'action-export',
      type: 'action',
      label: 'Exporter',
      description: 'Exporter les données',
      icon: Download,
      category: 'Actions',
      action: () => {
        openModal('export', {});
        toggleCommandPalette();
      },
    });
    items.push({
      id: 'action-filters',
      type: 'action',
      label: 'Filtres',
      description: 'Ouvrir les filtres',
      icon: Filter,
      category: 'Actions',
      action: () => {
        openModal('filters', {});
        toggleCommandPalette();
      },
    });
    items.push({
      id: 'action-stats',
      type: 'action',
      label: 'Statistiques',
      description: 'Voir les statistiques',
      icon: BarChart3,
      category: 'Actions',
      action: () => {
        openModal('stats', {});
        toggleCommandPalette();
      },
    });
    items.push({
      id: 'action-settings',
      type: 'action',
      label: 'Paramètres',
      description: 'Ouvrir les paramètres',
      icon: Settings,
      category: 'Actions',
      action: () => {
        openModal('settings', {});
        toggleCommandPalette();
      },
    });
    items.push({
      id: 'action-shortcuts',
      type: 'action',
      label: 'Raccourcis',
      description: 'Voir les raccourcis clavier',
      icon: FileText,
      category: 'Actions',
      action: () => {
        openModal('shortcuts', {});
        toggleCommandPalette();
      },
    });

    return items;
  }, [navigate, openModal, toggleCommandPalette]);

  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) return commands.slice(0, 20);
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery)
    ).slice(0, 20);
  }, [commands, query]);

  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      const cat = cmd.category || 'Autres';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

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

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!commandPaletteOpen) return null;

  let flatIndex = 0;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={toggleCommandPalette}
      />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[101] animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
            <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
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
          <div className="max-h-[50vh] overflow-y-auto py-2">
            {Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category}>
                <div className="px-4 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {category}
                </div>
                {items.map((cmd) => {
                  const Icon = cmd.icon;
                  const currentIndex = flatIndex++;
                  const isSelected = currentIndex === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onClick={() => cmd.action()}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'bg-slate-700/50 text-slate-100'
                          : 'text-slate-300 hover:bg-slate-800/50'
                      )}
                    >
                      <Icon className="h-4 w-4 text-slate-400 flex-shrink-0" />
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
            ))}
            {filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                Aucun résultat pour &quot;{query}&quot;
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
