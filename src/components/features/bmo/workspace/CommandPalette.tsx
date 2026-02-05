'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Inbox, AlertTriangle, Clock, CheckCircle2, XCircle,
  BarChart3, Download, FileText, ArrowRight, Command,
  Sun, Moon, Keyboard, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { useAppStore } from '@/lib/stores';

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: typeof Search;
  shortcut?: string;
  category: 'navigation' | 'action' | 'settings' | 'search';
  action: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenStats: () => void;
  onOpenExport: () => void;
};

export function CommandPalette({ open, onClose, onOpenStats, onOpenExport }: Props) {
  const { openTab } = useWorkspaceStore();
  const { darkMode, toggleDarkMode } = useAppStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentDemands, setRecentDemands] = useState<Array<{ id: string; subject: string }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Charger les demandes récentes
  useEffect(() => {
    if (!open) return;
    
    fetch('/api/demands?queue=pending', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        const items = (data.items ?? []).slice(0, 5);
        setRecentDemands(items.map((d: { id: string; subject: string }) => ({ id: d.id, subject: d.subject })));
      })
      .catch(() => {});
  }, [open]);

  // Commandes disponibles
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Navigation
      { id: 'nav-pending', label: 'À traiter', description: 'Ouvrir les demandes en attente', icon: Inbox, shortcut: '⌘1', category: 'navigation', action: () => {
        openTab({ type: 'inbox', id: 'inbox:pending', title: 'À traiter', icon: '📥', data: { queue: 'pending' } });
        onClose();
      }},
      { id: 'nav-urgent', label: 'Urgentes', description: 'Demandes prioritaires urgentes', icon: AlertTriangle, shortcut: '⌘2', category: 'navigation', action: () => {
        openTab({ type: 'inbox', id: 'inbox:urgent', title: 'Urgentes', icon: '🔥', data: { queue: 'urgent' } });
        onClose();
      }},
      { id: 'nav-overdue', label: 'En retard', description: 'Demandes hors SLA', icon: Clock, shortcut: '⌘3', category: 'navigation', action: () => {
        openTab({ type: 'inbox', id: 'inbox:overdue', title: 'En retard', icon: '⏱️', data: { queue: 'overdue' } });
        onClose();
      }},
      { id: 'nav-validated', label: 'Validées', description: 'Historique des validations', icon: CheckCircle2, shortcut: '⌘4', category: 'navigation', action: () => {
        openTab({ type: 'inbox', id: 'inbox:validated', title: 'Validées', icon: '✅', data: { queue: 'validated' } });
        onClose();
      }},
      { id: 'nav-rejected', label: 'Rejetées', description: 'Historique des rejets', icon: XCircle, category: 'navigation', action: () => {
        openTab({ type: 'inbox', id: 'inbox:rejected', title: 'Rejetées', icon: '❌', data: { queue: 'rejected' } });
        onClose();
      }},
      
      // Actions
      { id: 'act-stats', label: 'Statistiques', description: 'Voir les stats en temps réel', icon: BarChart3, shortcut: '⌘S', category: 'action', action: () => {
        onOpenStats();
        onClose();
      }},
      { id: 'act-export', label: 'Exporter', description: 'Exporter les demandes', icon: Download, shortcut: '⌘E', category: 'action', action: () => {
        onOpenExport();
        onClose();
      }},
      { id: 'act-refresh', label: 'Rafraîchir', description: 'Actualiser les données', icon: RefreshCw, category: 'action', action: () => {
        window.location.reload();
        onClose();
      }},
      
      // Settings
      { id: 'set-theme', label: darkMode ? 'Mode clair' : 'Mode sombre', description: 'Basculer le thème', icon: darkMode ? Sun : Moon, shortcut: '⌘D', category: 'settings', action: () => {
        toggleDarkMode();
        onClose();
      }},
      { id: 'set-shortcuts', label: 'Raccourcis clavier', description: 'Voir tous les raccourcis', icon: Keyboard, shortcut: '?', category: 'settings', action: () => {
        // Trigger shortcuts panel
        onClose();
      }},
    ];

    // Ajouter les demandes récentes comme résultats de recherche
    recentDemands.forEach(d => {
      items.push({
        id: `demand-${d.id}`,
        label: d.id,
        description: d.subject,
        icon: FileText,
        category: 'search',
        action: () => {
          openTab({
            type: 'demand',
            id: `demand:${d.id}`,
            title: `${d.id} — ${d.subject.slice(0, 20)}`,
            icon: '📄',
            data: { demandId: d.id },
          });
          onClose();
        },
      });
    });

    return items;
  }, [darkMode, toggleDarkMode, openTab, onClose, onOpenStats, onOpenExport, recentDemands]);

  // Filtrer les commandes
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      // Afficher par catégorie
      return commands.filter(c => c.category !== 'search');
    }
    
    const q = query.toLowerCase();
    return commands.filter(c => 
      c.label.toLowerCase().includes(q) || 
      c.description?.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Navigation clavier
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) selected.action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // Reset selection quand query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input quand ouvert
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;
  if (typeof window === 'undefined') return null;

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    action: 'Actions',
    settings: 'Paramètres',
    search: 'Demandes récentes',
  };

  // Grouper par catégorie
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  let globalIndex = 0;

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-start justify-center pt-[15vh]">
        <div 
          className={cn(
            "w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden",
            "bg-white/95 dark:bg-[#1a1a1c]/95 backdrop-blur-xl",
            "border-slate-200/70 dark:border-slate-800"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/70 dark:border-slate-800">
            <Command className="w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Rechercher une commande, une demande..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-lg placeholder:text-slate-400"
            />
            <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono">
              esc
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-auto p-2">
            {filteredCommands.length === 0 && (
              <div className="px-4 py-8 text-center text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucun résultat pour &quot;{query}&quot;</p>
              </div>
            )}

            {Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="mb-2">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase">
                  {categoryLabels[category] ?? category}
                </div>
                {items.map((cmd) => {
                  const isSelected = selectedIndex === globalIndex;
                  const currentIndex = globalIndex;
                  globalIndex++;
                  const Icon = cmd.icon;
                  
                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
                        isSelected 
                          ? "bg-blue-500/10 dark:bg-blue-500/20" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-none",
                        isSelected ? "bg-blue-500/20 text-blue-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-sm text-slate-400 truncate">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono flex-none">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-blue-500 flex-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">↑↓</kbd>
                naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">↵</kbd>
                sélectionner
              </span>
            </div>
            <span>⌘K pour ouvrir</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

