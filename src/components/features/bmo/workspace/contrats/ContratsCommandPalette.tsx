'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useContratsWorkspaceStore } from '@/lib/stores/contratsWorkspaceStore';
import {
  Search, ArrowRight, ClipboardList, FileText, GitCompare, Clock,
  MessageSquare, CheckCircle, Shield, BarChart3, Download, RefreshCw,
  Filter, Star, AlertTriangle, XCircle
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'navigation' | 'action' | 'filter' | 'export';
  shortcut?: string;
  action: () => void;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenStats: () => void;
  onOpenExport: () => void;
  onRefresh: () => void;
}

export function ContratsCommandPalette({ open, onClose, onOpenStats, onOpenExport, onRefresh }: Props) {
  const { openTab, setFilter, clearFilter } = useContratsWorkspaceStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = useMemo(() => [
    // Navigation
    {
      id: 'nav-inbox',
      label: 'Contrats à valider',
      description: 'Liste des contrats en attente de validation',
      icon: ClipboardList,
      category: 'navigation',
      shortcut: '⌘1',
      action: () => {
        openTab({ type: 'inbox', title: 'À valider', icon: '📋', data: { queue: 'pending' } });
        onClose();
      },
    },
    {
      id: 'nav-urgent',
      label: 'Contrats urgents',
      description: 'Contrats avec échéance proche',
      icon: AlertTriangle,
      category: 'navigation',
      shortcut: '⌘2',
      action: () => {
        openTab({ type: 'inbox', id: 'inbox:urgent', title: 'Urgents', icon: '🚨', data: { queue: 'critical' } });
        onClose();
      },
    },
    {
      id: 'nav-negotiation',
      label: 'En négociation',
      description: 'Contrats en cours de négociation',
      icon: MessageSquare,
      category: 'navigation',
      action: () => {
        openTab({ type: 'inbox', id: 'inbox:negotiation', title: 'Négociation', icon: '💬', data: { queue: 'negotiation' } });
        onClose();
      },
    },
    {
      id: 'nav-validated',
      label: 'Contrats validés',
      description: 'Historique des validations',
      icon: CheckCircle,
      category: 'navigation',
      action: () => {
        openTab({ type: 'inbox', id: 'inbox:validated', title: 'Validés', icon: '✅', data: { queue: 'validated' } });
        onClose();
      },
    },
    {
      id: 'nav-rejected',
      label: 'Contrats rejetés',
      description: 'Historique des rejets',
      icon: XCircle,
      category: 'navigation',
      action: () => {
        openTab({ type: 'inbox', id: 'inbox:rejected', title: 'Rejetés', icon: '❌', data: { queue: 'rejected' } });
        onClose();
      },
    },
    {
      id: 'nav-timeline',
      label: 'Timeline',
      description: 'Vue chronologique des contrats',
      icon: Clock,
      category: 'navigation',
      action: () => {
        openTab({ type: 'timeline', title: 'Timeline', icon: '📅', data: {} });
        onClose();
      },
    },
    {
      id: 'nav-audit',
      label: 'Registre d\'audit',
      description: 'Historique des décisions',
      icon: Shield,
      category: 'navigation',
      action: () => {
        openTab({ type: 'audit', title: 'Audit', icon: '🔍', data: {} });
        onClose();
      },
    },
    {
      id: 'nav-analytics',
      label: 'Analytics',
      description: 'Statistiques et tendances',
      icon: BarChart3,
      category: 'navigation',
      shortcut: '⌘I',
      action: () => {
        onOpenStats();
        onClose();
      },
    },

    // Actions
    {
      id: 'action-refresh',
      label: 'Rafraîchir les données',
      description: 'Actualiser la liste des contrats',
      icon: RefreshCw,
      category: 'action',
      shortcut: '⌘R',
      action: () => {
        onRefresh();
        onClose();
      },
    },
    {
      id: 'action-export',
      label: 'Exporter',
      description: 'Exporter les contrats',
      icon: Download,
      category: 'action',
      shortcut: '⌘X',
      action: () => {
        onOpenExport();
        onClose();
      },
    },

    // Filters
    {
      id: 'filter-clear',
      label: 'Effacer les filtres',
      description: 'Réinitialiser tous les filtres',
      icon: Filter,
      category: 'filter',
      action: () => {
        clearFilter();
        onClose();
      },
    },
    {
      id: 'filter-type-travaux',
      label: 'Filtrer: Travaux',
      description: 'Contrats de travaux uniquement',
      icon: Filter,
      category: 'filter',
      action: () => {
        setFilter({ type: 'travaux' });
        onClose();
      },
    },
    {
      id: 'filter-type-fourniture',
      label: 'Filtrer: Fourniture',
      description: 'Contrats de fourniture uniquement',
      icon: Filter,
      category: 'filter',
      action: () => {
        setFilter({ type: 'fourniture' });
        onClose();
      },
    },
    {
      id: 'filter-montant-high',
      label: 'Filtrer: Montant > 100M',
      description: 'Contrats de plus de 100 millions FCFA',
      icon: Filter,
      category: 'filter',
      action: () => {
        setFilter({ minMontant: 100000000 });
        onClose();
      },
    },
  ], [openTab, onClose, onOpenStats, onOpenExport, onRefresh, clearFilter, setFilter]);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    
    const q = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.description?.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Group by category
  const groupedCommands = useMemo(() => {
    const groups: { category: string; items: Command[] }[] = [];
    const categoryOrder = ['navigation', 'action', 'filter', 'export'];
    
    categoryOrder.forEach(cat => {
      const items = filteredCommands.filter(c => c.category === cat);
      if (items.length > 0) {
        groups.push({ category: cat, items });
      }
    });

    return groups;
  }, [filteredCommands]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!open) return null;

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    action: 'Actions',
    filter: 'Filtres',
    export: 'Export',
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-4 rounded-2xl border border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-slate-800 dark:bg-[#1f1f1f]/95 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200/70 dark:border-slate-800">
          <Search className="w-5 h-5 text-purple-500 flex-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher une action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-lg placeholder:text-slate-400"
          />
          <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun résultat pour "{query}"</p>
            </div>
          ) : (
            <div className="py-2">
              {groupedCommands.map(({ category, items }) => (
                <div key={category} className="mb-1">
                  <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {categoryLabels[category]}
                  </div>
                  {items.map((cmd) => {
                    const globalIdx = filteredCommands.indexOf(cmd);
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = cmd.icon;

                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 transition-all text-left group",
                          isSelected
                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg transition-colors",
                          isSelected
                            ? "bg-purple-500/20"
                            : "bg-slate-100 dark:bg-slate-800"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{cmd.label}</div>
                          {cmd.description && (
                            <div className="text-xs text-slate-400 truncate">{cmd.description}</div>
                          )}
                        </div>
                        {cmd.shortcut && (
                          <kbd className={cn(
                            "px-2 py-1 rounded text-xs font-mono transition-colors",
                            isSelected
                              ? "bg-purple-500/20 text-purple-600"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          )}>
                            {cmd.shortcut}
                          </kbd>
                        )}
                        <ArrowRight className={cn(
                          "w-4 h-4 flex-none transition-all",
                          isSelected ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                        )} />
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">↑↓</kbd> naviguer</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700">↵</kbd> sélectionner</span>
            </div>
            <span>{filteredCommands.length} commandes</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

