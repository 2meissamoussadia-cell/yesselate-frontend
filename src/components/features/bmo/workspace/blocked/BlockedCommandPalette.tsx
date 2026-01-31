'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Inbox, AlertTriangle, AlertCircle, Clock, CheckCircle2, XCircle,
  BarChart3, Download, FileText, ArrowRight, Command, Zap, Shield,
  Sun, Moon, Keyboard, RefreshCw, Building2, Users, Calendar, 
  LayoutGrid, TrendingUp, History, Eye, GitBranch, ArrowUpRight, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBlockedWorkspaceStore } from '@/lib/stores/blockedWorkspaceStore';
import { useAppStore } from '@/lib/stores';

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: typeof Search;
  shortcut?: string;
  category: 'navigation' | 'action' | 'settings' | 'quick_actions' | 'resolution';
  keywords?: string[];
  action: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenStats?: () => void;
  onOpenExport?: () => void;
  onOpenDecisionCenter?: () => void;
  onOpenMatrix?: () => void;
  onOpenTimeline?: () => void;
  onOpenAudit?: () => void;
  onRefresh?: () => void;
};

export function BlockedCommandPalette({ 
  open, 
  onClose, 
  onOpenStats, 
  onOpenExport,
  onOpenDecisionCenter,
  onOpenMatrix,
  onOpenTimeline,
  onOpenAudit,
  onRefresh
}: Props) {
  const { openTab } = useBlockedWorkspaceStore();
  const { darkMode, toggleDarkMode } = useAppStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Charger les commandes récentes
  useEffect(() => {
    try {
      const stored = localStorage.getItem('blocked:recent-commands');
      if (stored) setRecentCommands(JSON.parse(stored));
    } catch {}
  }, []);

  const saveRecentCommand = useCallback((commandId: string) => {
    setRecentCommands(prev => {
      const updated = [commandId, ...prev.filter(id => id !== commandId)].slice(0, 5);
      try {
        localStorage.setItem('blocked:recent-commands', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const executeCommand = useCallback((cmd: CommandItem) => {
    saveRecentCommand(cmd.id);
    cmd.action();
  }, [saveRecentCommand]);

  // Commandes disponibles
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Navigation par impact
      { 
        id: 'nav-all', 
        label: 'Tous les blocages', 
        description: `Voir tous les dossiers bloqués`, 
        icon: Inbox, 
        shortcut: '⌘1', 
        category: 'navigation', 
        keywords: ['tous', 'all', 'list', 'liste'], 
        action: () => {
          openTab({ type: 'inbox', id: 'inbox:all', title: 'Tous les blocages', icon: '🚧', data: { queue: 'all' } });
          onClose();
        }
      },
      { 
        id: 'nav-critical', 
        label: 'Blocages critiques', 
        description: 'Impact critique - Action immédiate requise', 
        icon: AlertCircle, 
        shortcut: '⌘2', 
        category: 'navigation', 
        keywords: ['critique', 'critical', 'urgent', 'rouge'], 
        action: () => {
          openTab({ type: 'inbox', id: 'inbox:critical', title: 'Critiques', icon: '🚨', data: { queue: 'critical', impact: 'critical' } });
          onClose();
        }
      },
      { 
        id: 'nav-high', 
        label: 'Impact élevé', 
        description: 'Dossiers à traiter en priorité', 
        icon: AlertTriangle, 
        shortcut: '⌘3', 
        category: 'navigation', 
        keywords: ['high', 'élevé', 'priority', 'orange'], 
        action: () => {
          openTab({ type: 'inbox', id: 'inbox:high', title: 'Impact élevé', icon: '⚠️', data: { queue: 'high', impact: 'high' } });
          onClose();
        }
      },
      { 
        id: 'nav-medium', 
        label: 'Impact moyen', 
        description: 'Blocages à surveiller', 
        icon: Clock, 
        shortcut: '⌘4', 
        category: 'navigation', 
        keywords: ['medium', 'moyen', 'watch'], 
        action: () => {
          openTab({ type: 'inbox', id: 'inbox:medium', title: 'Impact moyen', icon: '📊', data: { queue: 'medium', impact: 'medium' } });
          onClose();
        }
      },

      // Vues spéciales
      { 
        id: 'view-matrix', 
        label: 'Matrice d\'urgence', 
        description: 'Vue Impact × Délai pour priorisation', 
        icon: LayoutGrid, 
        shortcut: '⌘M', 
        category: 'navigation', 
        keywords: ['matrix', 'matrice', 'urgence', 'priorité', 'grid'], 
        action: () => {
          if (onOpenMatrix) {
            onOpenMatrix();
          } else {
            openTab({ type: 'matrix', id: 'matrix:main', title: 'Matrice d\'urgence', icon: '📐', data: {} });
          }
          onClose();
        }
      },
      { 
        id: 'view-timeline', 
        label: 'Timeline blocages', 
        description: 'Vue chronologique des blocages', 
        icon: History, 
        shortcut: '⌘T', 
        category: 'navigation', 
        keywords: ['timeline', 'chrono', 'historique', 'temps'], 
        action: () => {
          if (onOpenTimeline) {
            onOpenTimeline();
          } else {
            openTab({ type: 'timeline', id: 'timeline:main', title: 'Timeline', icon: '📅', data: {} });
          }
          onClose();
        }
      },
      { 
        id: 'view-bureaux', 
        label: 'Par bureau', 
        description: 'Blocages groupés par bureau responsable', 
        icon: Building2, 
        category: 'navigation', 
        keywords: ['bureau', 'department', 'service', 'équipe'], 
        action: () => {
          openTab({ type: 'bureau', id: 'bureau:all', title: 'Par bureau', icon: '🏢', data: {} });
          onClose();
        }
      },

      // Actions de résolution
      { 
        id: 'act-decision', 
        label: 'Centre de décision', 
        description: 'Arbitrer et débloquer les situations critiques', 
        icon: Zap, 
        shortcut: '⌘D', 
        category: 'resolution', 
        keywords: ['décision', 'arbitrage', 'débloquer', 'action'], 
        action: () => {
          if (onOpenDecisionCenter) onOpenDecisionCenter();
          onClose();
        }
      },
      { 
        id: 'act-escalate', 
        label: 'Escalade CODIR', 
        description: 'Escalader les blocages au comité de direction', 
        icon: ArrowUpRight, 
        shortcut: '⌘E', 
        category: 'resolution', 
        keywords: ['escalade', 'codir', 'direction', 'hierarchy'], 
        action: () => {
          openTab({ type: 'escalation', id: 'escalation:new', title: 'Escalade', icon: '⬆️', data: { action: 'escalate' } });
          onClose();
        }
      },
      { 
        id: 'act-substitute', 
        label: 'Substitution', 
        description: 'Exercer le pouvoir de substitution BMO', 
        icon: Shield, 
        shortcut: '⌘S', 
        category: 'resolution', 
        keywords: ['substitution', 'pouvoir', 'bmo', 'autorité'], 
        action: () => {
          openTab({ type: 'substitution', id: 'substitution:new', title: 'Substitution', icon: '⚡', data: { action: 'substitute' } });
          onClose();
        }
      },
      { 
        id: 'act-resolve', 
        label: 'Résolution rapide', 
        description: 'Wizard de résolution guidée', 
        icon: CheckCircle2, 
        category: 'resolution', 
        keywords: ['résoudre', 'resolve', 'fix', 'corriger'], 
        action: () => {
          openTab({ type: 'resolution', id: `resolution:${Date.now()}`, title: 'Résolution', icon: '✅', data: { action: 'resolve' } });
          onClose();
        }
      },

      // Actions système
      { 
        id: 'act-audit', 
        label: 'Registre d\'audit', 
        description: 'Voir l\'historique des décisions et hash de traçabilité', 
        icon: Eye, 
        category: 'action', 
        keywords: ['audit', 'trace', 'hash', 'log', 'historique'], 
        action: () => {
          if (onOpenAudit) {
            onOpenAudit();
          } else {
            openTab({ type: 'audit', id: 'audit:main', title: 'Audit', icon: '🔐', data: {} });
          }
          onClose();
        }
      },
      { 
        id: 'act-refresh', 
        label: 'Rafraîchir', 
        description: 'Actualiser les données en temps réel', 
        icon: RefreshCw, 
        shortcut: '⌘R', 
        category: 'action', 
        keywords: ['refresh', 'reload', 'actualiser'], 
        action: () => {
          if (onRefresh) onRefresh();
          else window.location.reload();
          onClose();
        }
      },
      
      // Paramètres
      { 
        id: 'set-theme', 
        label: darkMode ? 'Mode clair' : 'Mode sombre', 
        description: 'Basculer le thème de l\'interface', 
        icon: darkMode ? Sun : Moon, 
        category: 'settings', 
        keywords: ['theme', 'dark', 'light', 'sombre', 'clair'], 
        action: () => {
          toggleDarkMode();
          onClose();
        }
      },
      { 
        id: 'set-shortcuts', 
        label: 'Raccourcis clavier', 
        description: 'Voir tous les raccourcis disponibles', 
        icon: Keyboard, 
        shortcut: 'Shift+?', 
        category: 'settings', 
        keywords: ['help', 'aide', 'hotkeys', 'keyboard'], 
        action: () => {
          onClose();
        }
      },
    ];
    
    // Actions avec callbacks dynamiques
    if (onOpenStats) {
      items.push({ 
        id: 'act-stats', 
        label: 'Statistiques', 
        description: 'Tableau de bord et métriques des blocages', 
        icon: BarChart3, 
        shortcut: '⌘I', 
        category: 'action',
        keywords: ['stats', 'metrics', 'kpi', 'dashboard'],
        action: () => { onOpenStats(); onClose(); }
      });
    }
    
    if (onOpenExport) {
      items.push({ 
        id: 'act-export', 
        label: 'Exporter', 
        description: 'Exporter le registre des blocages', 
        icon: Download, 
        shortcut: '⌘X', 
        category: 'action',
        keywords: ['export', 'download', 'télécharger', 'excel', 'pdf', 'json'],
        action: () => { onOpenExport(); onClose(); }
      });
    }

    return items;
  }, [openTab, onClose, darkMode, toggleDarkMode, onOpenStats, onOpenExport, onOpenDecisionCenter, onOpenMatrix, onOpenTimeline, onOpenAudit, onRefresh]);

  // Filtrer avec scoring
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      const recentItems = recentCommands
        .map(id => commands.find(c => c.id === id))
        .filter((c): c is CommandItem => c !== undefined);
      
      const otherItems = commands.filter(c => !recentCommands.includes(c.id));
      return [...recentItems, ...otherItems];
    }
    
    const q = query.toLowerCase();
    
    const scored = commands.map(cmd => {
      let score = 0;
      
      if (cmd.label.toLowerCase() === q) score += 100;
      else if (cmd.label.toLowerCase().startsWith(q)) score += 80;
      else if (cmd.label.toLowerCase().includes(q)) score += 60;
      
      if (cmd.description?.toLowerCase().includes(q)) score += 40;
      if (cmd.keywords?.some(kw => kw.toLowerCase().includes(q))) score += 50;
      if (cmd.keywords?.some(kw => kw.toLowerCase() === q)) score += 30;
      
      const recentIndex = recentCommands.indexOf(cmd.id);
      if (recentIndex !== -1) score += (5 - recentIndex) * 5;
      
      return { cmd, score };
    });
    
    return scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ cmd }) => cmd);
  }, [commands, query, recentCommands]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const len = filteredCommands.length;
    if (len === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % len);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + len) % len);
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          setSelectedIndex(prev => (prev - 1 + len) % len);
        } else {
          setSelectedIndex(prev => (prev + 1) % len);
        }
        break;
      case 'Enter':
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) executeCommand(selected);
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        onClose();
        break;
      case 'Home':
        e.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setSelectedIndex(len - 1);
        break;
    }
  }, [filteredCommands, selectedIndex, onClose, executeCommand]);

  useEffect(() => {
    if (!listRef.current) return;
    const selectedEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  // Grouper par catégorie
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {
      resolution: [],
      navigation: [],
      action: [],
      quick_actions: [],
      settings: [],
    };
    
    filteredCommands.forEach(cmd => {
      if (groups[cmd.category]) {
        groups[cmd.category].push(cmd);
      }
    });

    const result: { category: string; items: CommandItem[] }[] = [];

    if (!query.trim() && recentCommands.length > 0) {
      const recentItems = recentCommands
        .map(id => commands.find(c => c.id === id))
        .filter((c): c is CommandItem => c !== undefined)
        .slice(0, 3);
      
      if (recentItems.length > 0) {
        result.push({ category: 'recent', items: recentItems });
      }
    }
    
    const categoryOrder = ['resolution', 'navigation', 'action', 'quick_actions', 'settings'];
    categoryOrder.forEach(category => {
      if (groups[category] && groups[category].length > 0) {
        const items = query.trim() 
          ? groups[category] 
          : groups[category].filter(item => !recentCommands.slice(0, 3).includes(item.id));
        if (items.length > 0) {
          result.push({ category, items });
        }
      }
    });
    
    return result;
  }, [filteredCommands, query, recentCommands, commands]);

  if (!open) return null;

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    action: 'Actions',
    settings: 'Paramètres',
    quick_actions: 'Actions rapides',
    resolution: '⚡ Résolution & Arbitrage',
    recent: '⏱ Récents',
  };

  const categoryIcons: Record<string, typeof Search> = {
    navigation: Inbox,
    action: TrendingUp,
    settings: Keyboard,
    quick_actions: Zap,
    resolution: Shield,
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
          <Search className="w-5 h-5 text-orange-500 flex-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher une action ou vue..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-lg placeholder:text-slate-400"
          />
          <kbd className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Résultats */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto scroll-smooth">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune commande trouvée</p>
              <p className="text-sm mt-1">Essayez avec d&apos;autres mots-clés</p>
            </div>
          ) : (
            <div className="py-2">
              {groupedCommands.map(({ category, items }) => {
                const CategoryIcon = categoryIcons[category] || Search;
                const label = categoryLabels[category] || category;
                
                return (
                  <div key={category} className="mb-1">
                    <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {category !== 'recent' && <CategoryIcon className="w-3 h-3" />}
                      {label}
                    </div>
                    {items.map((cmd) => {
                      const globalIdx = filteredCommands.indexOf(cmd);
                      const isSelected = globalIdx === selectedIndex;
                      const Icon = cmd.icon;
                      const isRecent = category === 'recent';
                      const isResolution = cmd.category === 'resolution';
                      
                      return (
                        <button
                          key={`${category}-${cmd.id}`}
                          data-index={globalIdx}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 transition-all text-left group",
                            isSelected
                              ? isResolution 
                                ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            isSelected 
                              ? isResolution ? "bg-orange-500/20" : "bg-blue-500/20"
                              : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700"
                          )}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium flex items-center gap-2">
                              {cmd.label}
                              {isRecent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                  Récent
                                </span>
                              )}
                              {isResolution && !isRecent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                  BMO
                                </span>
                              )}
                            </div>
                            {cmd.description && (
                              <div className="text-xs text-slate-400 truncate">{cmd.description}</div>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <kbd className={cn(
                              "px-2 py-1 rounded text-xs font-mono transition-colors",
                              isSelected 
                                ? isResolution ? "bg-orange-500/20 text-orange-600" : "bg-blue-500/20 text-blue-600" 
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
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono">↑↓</kbd>
                Naviguer
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono">↵</kbd>
                Sélectionner
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 font-mono">ESC</kbd>
                Fermer
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Command className="w-3 h-3" />
              <span className="text-orange-500 font-medium">Dossiers Bloqués</span>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

