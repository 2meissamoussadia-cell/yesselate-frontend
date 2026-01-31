/**
 * Command Palette pour Conférences
 * Recherche et navigation rapide - Accessible via ⌘K / Ctrl+K
 */

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Search,
  Video,
  LayoutDashboard,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  Briefcase,
  Users,
  Unlock,
  ArrowRight,
  X,
  Download,
} from 'lucide-react';
import { useConferencesCommandCenterStore } from '@/lib/stores/conferencesCommandCenterStore';
import { conferencesCategories } from './ConferencesCommandSidebar';

interface CommandItem {
  id: string;
  type: 'navigation' | 'action';
  label: string;
  description?: string;
  icon: React.ElementType;
  category: string;
  action: () => void;
}

export function ConferencesCommandPalette() {
  const {
    commandPaletteOpen,
    toggleCommandPalette,
    navigate,
    openModal,
  } = useConferencesCommandCenterStore();

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
  const commands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [];

    // Navigation commands from categories
    conferencesCategories.forEach((cat) => {
      items.push({
        id: `nav-${cat.id}`,
        type: 'navigation',
        label: cat.label,
        description: `Naviguer vers ${cat.label}`,
        icon: cat.icon,
        category: 'Navigation',
        action: () => {
          navigate(cat.id as any);
          toggleCommandPalette();
        },
      });
    });

    // Quick actions
    items.push({
      id: 'action-create',
      type: 'action',
      label: 'Créer une conférence',
      description: 'Nouvelle conférence décisionnelle',
      icon: Video,
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

    return items;
  }, [navigate, openModal, toggleCommandPalette]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filteredCommands[selectedIndex];
        if (cmd) {
          cmd.action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex, toggleCommandPalette]);

  if (!commandPaletteOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={toggleCommandPalette}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-start justify-center pt-[20vh] z-50 pointer-events-none">
        <div
          className="w-full max-w-2xl mx-4 bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Rechercher une conférence ou une action..."
              className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-400 outline-none"
            />
            <button
              onClick={toggleCommandPalette}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400">
                Aucun résultat trouvé
              </div>
            ) : (
              Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category}>
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-800/30">
                    {category}
                  </div>
                  {items.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;
                    const Icon = cmd.icon;

                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                          isSelected
                            ? 'bg-purple-500/10 border-l-2 border-purple-400'
                            : 'hover:bg-slate-800/50'
                        )}
                      >
                        <Icon className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-200">
                            {cmd.label}
                          </div>
                          {cmd.description && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-800/50 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>↑↓ Naviguer</span>
              <span>↵ Sélectionner</span>
              <span>Esc Fermer</span>
            </div>
            <span>{filteredCommands.length} résultat(s)</span>
          </div>
        </div>
      </div>
    </>
  );
}

