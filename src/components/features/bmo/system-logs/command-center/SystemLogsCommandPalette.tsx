/**
 * Command Palette pour System Logs
 * Recherche rapide, navigation et actions
 */

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useSystemLogsCommandCenterStore } from '@/lib/stores/systemLogsCommandCenterStore';
import { systemLogsCategories } from './SystemLogsCommandSidebar';
import {
  Terminal,
  Search,
  AlertTriangle,
  FileText,
  Shield,
  Download,
  FileCheck,
  RefreshCw,
  Settings,
  TrendingUp,
  Database,
  X,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  icon: LucideIcon;
  category: string;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
  badge?: number | string;
}

export function SystemLogsCommandPalette() {
  const {
    commandPaletteOpen,
    toggleCommandPalette,
    navigate,
    openModal,
    setGlobalSearch,
    navigation,
  } = useSystemLogsCommandCenterStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = useMemo(
    () => [
      // Navigation - Catégories
      ...systemLogsCategories.map((cat) => ({
        id: `nav-${cat.id}`,
        label: cat.label,
        icon: cat.icon,
        category: '📂 Navigation',
        action: () => {
          navigate(cat.id as any, 'all');
          toggleCommandPalette();
        },
        keywords: [cat.label.toLowerCase(), cat.id],
        badge: cat.badge,
      })),

      // Actions rapides
      {
        id: 'action-export-json',
        label: 'Exporter en JSON',
        icon: Download,
        category: '⚡ Actions',
        action: () => {
          openModal('export', { format: 'json' });
          toggleCommandPalette();
        },
        keywords: ['export', 'json', 'télécharger'],
        shortcut: '⌘E',
      },
      {
        id: 'action-export-csv',
        label: 'Exporter en CSV',
        icon: Download,
        category: '⚡ Actions',
        action: () => {
          openModal('export', { format: 'csv' });
          toggleCommandPalette();
        },
        keywords: ['export', 'csv', 'excel'],
      },
      {
        id: 'action-integrity-scan',
        label: 'Scanner l\'intégrité',
        icon: FileCheck,
        category: '⚡ Actions',
        action: () => {
          openModal('integrity-scan');
          toggleCommandPalette();
        },
        keywords: ['intégrité', 'scan', 'hash', 'vérifier'],
      },
      {
        id: 'action-refresh',
        label: 'Rafraîchir',
        icon: RefreshCw,
        category: '⚡ Actions',
        action: () => {
          window.location.reload();
        },
        keywords: ['refresh', 'actualiser', 'recharger'],
        shortcut: '⌘R',
      },
      {
        id: 'action-stats',
        label: 'Statistiques',
        icon: TrendingUp,
        category: '⚡ Actions',
        action: () => {
          openModal('stats');
          toggleCommandPalette();
        },
        keywords: ['stats', 'statistiques', 'métriques'],
        shortcut: '⌘S',
      },
      {
        id: 'action-settings',
        label: 'Paramètres',
        icon: Settings,
        category: '⚡ Actions',
        action: () => {
          openModal('settings');
          toggleCommandPalette();
        },
        keywords: ['paramètres', 'settings', 'config'],
      },

      // Filtres rapides
      {
        id: 'filter-critical',
        label: 'Filtrer: Critiques',
        icon: AlertTriangle,
        category: '🔍 Filtres',
        action: () => {
          navigate('by-level', 'critical');
          toggleCommandPalette();
        },
        keywords: ['critique', 'critical', 'erreur'],
      },
      {
        id: 'filter-security',
        label: 'Filtrer: Sécurité',
        icon: Shield,
        category: '🔍 Filtres',
        action: () => {
          navigate('security', 'all');
          toggleCommandPalette();
        },
        keywords: ['sécurité', 'security', 'auth'],
      },
      {
        id: 'filter-incidents',
        label: 'Voir les incidents',
        icon: FileText,
        category: '🔍 Filtres',
        action: () => {
          navigate('incidents', 'all');
          toggleCommandPalette();
        },
        keywords: ['incidents', 'cas', 'tickets'],
      },
    ],
    [navigate, openModal, toggleCommandPalette]
  );

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.keywords?.some((k) => k.includes(q)) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  useEffect(() => {
    if (!commandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) selected.action();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex, toggleCommandPalette]);

  useEffect(() => {
    if (commandPaletteOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const categoryLabels: Record<string, string> = {
    '📂 Navigation': 'Navigation',
    '⚡ Actions': 'Actions',
    '🔍 Filtres': 'Filtres',
  };

  const groupedCommands = filteredCommands.reduce<Record<string, Command[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/60 backdrop-blur-sm"
      onClick={toggleCommandPalette}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une commande, catégorie, filtre..."
            className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-400 outline-none text-sm"
          />
          <button
            onClick={toggleCommandPalette}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Commands List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucune commande trouvée</p>
            </div>
          ) : (
            <div className="py-2">
              {Object.entries(groupedCommands).map(([category, cmds]) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {categoryLabels[category] || category}
                  </div>
                  {cmds.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const Icon = cmd.icon;
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                          isSelected
                            ? 'bg-blue-500/10 text-slate-200'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                        )}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="flex-1 text-sm">{cmd.label}</span>
                        {cmd.badge && (
                          <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded">
                            {cmd.badge}
                          </span>
                        )}
                        {cmd.shortcut && (
                          <kbd className="px-2 py-0.5 text-xs bg-slate-800 text-slate-400 rounded border border-slate-700">
                            {cmd.shortcut}
                          </kbd>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-800/50 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↓</kbd>
              <span>Naviguer</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↵</kbd>
              <span>Sélectionner</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">ESC</kbd>
              <span>Fermer</span>
            </span>
          </div>
          <span>{filteredCommands.length} commande{filteredCommands.length > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}

