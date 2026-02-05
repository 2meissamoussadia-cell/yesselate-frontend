/**
 * Demandes Command Center - Command Palette
 * Palette de commandes accessible via ⌘K
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import {
  Search,
  LayoutDashboard,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  TimerOff,
  BarChart3,
  Download,
  Settings,
  Keyboard,
  RefreshCw,
  FileText,
  X,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: typeof Search;
  action: () => void;
  shortcut?: string;
  category: 'navigation' | 'action' | 'tools';
}

export function DemandesCommandPalette() {
  const {
    commandPaletteOpen,
    toggleCommandPalette,
    navigate,
    openModal,
    startRefresh,
    endRefresh,
  } = useDemandesCommandCenterStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      { id: 'nav-overview', label: 'Vue d\'ensemble', icon: LayoutDashboard, action: () => navigate('overview'), category: 'navigation' },
      { id: 'nav-pending', label: 'Demandes en attente', icon: Clock, action: () => navigate('pending'), shortcut: '⌘1', category: 'navigation' },
      { id: 'nav-urgent', label: 'Demandes urgentes', icon: AlertCircle, action: () => navigate('urgent'), shortcut: '⌘2', category: 'navigation' },
      { id: 'nav-validated', label: 'Demandes validées', icon: CheckCircle, action: () => navigate('validated'), shortcut: '⌘3', category: 'navigation' },
      { id: 'nav-rejected', label: 'Demandes rejetées', icon: XCircle, action: () => navigate('rejected'), category: 'navigation' },
      { id: 'nav-overdue', label: 'Demandes en retard', icon: TimerOff, action: () => navigate('overdue'), category: 'navigation' },

      // Actions
      { id: 'action-stats', label: 'Ouvrir statistiques', icon: BarChart3, action: () => openModal('stats'), shortcut: '⌘I', category: 'action' },
      { id: 'action-export', label: 'Exporter les données', icon: Download, action: () => openModal('export'), shortcut: '⌘E', category: 'action' },
      { id: 'action-refresh', label: 'Rafraîchir', icon: RefreshCw, action: () => { startRefresh(); setTimeout(endRefresh, 1500); }, shortcut: '⌘R', category: 'action' },

      // Tools
      { id: 'tools-shortcuts', label: 'Raccourcis clavier', icon: Keyboard, action: () => openModal('shortcuts'), shortcut: '?', category: 'tools' },
      { id: 'tools-settings', label: 'Paramètres', icon: Settings, action: () => openModal('settings'), category: 'tools' },
    ],
    [navigate, openModal, startRefresh, endRefresh]
  );

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

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
            toggleCommandPalette();
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

  const groupedCommands = {
    navigation: filteredCommands.filter((c) => c.category === 'navigation'),
    action: filteredCommands.filter((c) => c.category === 'action'),
    tools: filteredCommands.filter((c) => c.category === 'tools'),
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={toggleCommandPalette}
      />

      {/* Palette */}
      <div className="fixed inset-x-0 top-[20%] z-50 flex justify-center px-4">
        <div className="w-full max-w-xl rounded-xl border border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50">
            <Search className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              autoFocus
              className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 outline-none text-sm"
            />
            <button
              onClick={toggleCommandPalette}
              className="p-1 rounded hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto py-2">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                Aucune commande trouvée
              </div>
            ) : (
              <>
                {/* Navigation */}
                {groupedCommands.navigation.length > 0 && (
                  <div className="px-2 py-1">
                    <p className="px-2 py-1 text-xs font-medium text-slate-400 uppercase">
                      Navigation
                    </p>
                    {groupedCommands.navigation.map((cmd, idx) => {
                      const globalIdx = filteredCommands.indexOf(cmd);
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={selectedIndex === globalIdx}
                          onClick={() => {
                            cmd.action();
                            toggleCommandPalette();
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Actions */}
                {groupedCommands.action.length > 0 && (
                  <div className="px-2 py-1">
                    <p className="px-2 py-1 text-xs font-medium text-slate-400 uppercase">
                      Actions
                    </p>
                    {groupedCommands.action.map((cmd) => {
                      const globalIdx = filteredCommands.indexOf(cmd);
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={selectedIndex === globalIdx}
                          onClick={() => {
                            cmd.action();
                            toggleCommandPalette();
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {/* Tools */}
                {groupedCommands.tools.length > 0 && (
                  <div className="px-2 py-1">
                    <p className="px-2 py-1 text-xs font-medium text-slate-400 uppercase">
                      Outils
                    </p>
                    {groupedCommands.tools.map((cmd) => {
                      const globalIdx = filteredCommands.indexOf(cmd);
                      return (
                        <CommandRow
                          key={cmd.id}
                          command={cmd}
                          isSelected={selectedIndex === globalIdx}
                          onClick={() => {
                            cmd.action();
                            toggleCommandPalette();
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700/50 text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 mr-1">↑↓</kbd>
                naviguer
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 mr-1">↵</kbd>
                sélectionner
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 mr-1">esc</kbd>
                fermer
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function CommandRow({
  command,
  isSelected,
  onClick,
}: {
  command: CommandItem;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = command.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
        isSelected ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:bg-slate-800/50'
      )}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 text-sm">{command.label}</span>
      {command.shortcut && (
        <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-xs text-slate-400">
          {command.shortcut}
        </kbd>
      )}
    </button>
  );
}


