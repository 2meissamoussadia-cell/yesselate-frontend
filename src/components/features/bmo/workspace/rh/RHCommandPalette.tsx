'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, Inbox, AlertTriangle, Clock, CheckCircle2, XCircle,
  BarChart3, Download, FileText, ArrowRight, Command,
  Sun, Moon, Keyboard, RefreshCw, HeartPulse, Plane, Wallet,
  Users, Calendar, Bell, Settings, Filter, Plus, Zap, 
  Brain, UserCheck, Clock3, Layers, FolderOpen, History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRHWorkspaceStore } from '@/lib/stores/rhWorkspaceStore';
import { useAppStore } from '@/lib/stores';

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: typeof Search;
  shortcut?: string;
  category: 'navigation' | 'action' | 'settings' | 'search' | 'quick_actions';
  keywords?: string[];
  action: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onOpenStats?: () => void;
  onOpenExport?: () => void;
  onOpenFilters?: () => void;
  onOpenQuickCreate?: () => void;
  onOpenAgentsManager?: () => void;
  onOpenWorkflow?: () => void;
  onOpenPredictive?: () => void;
  onOpenDelegations?: () => void;
  onOpenReminders?: () => void;
  onOpenMultiLevel?: () => void;
  onOpenCalendar?: () => void;
  onOpenTemplates?: () => void;
};

// Event global pour ouvrir la palette depuis d'autres composants
export const COMMAND_PALETTE_EVENT = 'rh:open-command-palette';

export function RHCommandPalette({ 
  open, 
  onClose, 
  onOpenStats, 
  onOpenExport,
  onOpenFilters,
  onOpenQuickCreate,
  onOpenAgentsManager,
  onOpenWorkflow,
  onOpenPredictive,
  onOpenDelegations,
  onOpenReminders,
  onOpenMultiLevel,
  onOpenCalendar,
  onOpenTemplates
}: Props) {
  const { openTab } = useRHWorkspaceStore();
  const { darkMode, toggleDarkMode } = useAppStore();
  
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Charger les commandes récentes depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('rh:recent-commands');
      if (stored) setRecentCommands(JSON.parse(stored));
    } catch {}
  }, []);

  // Sauvegarder une commande récente
  const saveRecentCommand = useCallback((commandId: string) => {
    setRecentCommands(prev => {
      const updated = [commandId, ...prev.filter(id => id !== commandId)].slice(0, 5);
      try {
        localStorage.setItem('rh:recent-commands', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Exécuter une commande avec tracking
  const executeCommand = useCallback((cmd: CommandItem) => {
    saveRecentCommand(cmd.id);
    cmd.action();
  }, [saveRecentCommand]);

  // Commandes disponibles
  const commands = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [
      // Navigation
      { id: 'nav-pending', label: 'À traiter', description: 'Demandes RH en attente', icon: Inbox, shortcut: '⌘1', category: 'navigation', keywords: ['pending', 'attente', 'inbox'], action: () => {
        openTab({ type: 'inbox', id: 'inbox:pending', title: 'À traiter', icon: '⏳', data: { queue: 'pending' } });
        onClose();
      }},
      { id: 'nav-urgent', label: 'Urgentes', description: 'Demandes prioritaires urgentes', icon: AlertTriangle, shortcut: '⌘2', category: 'navigation', keywords: ['urgent', 'prioritaire', 'critique'], action: () => {
        openTab({ type: 'inbox', id: 'inbox:urgent', title: 'Urgentes', icon: '🚨', data: { queue: 'urgent' } });
        onClose();
      }},
      { id: 'nav-conges', label: 'Congés', description: 'Toutes les demandes de congés', icon: HeartPulse, shortcut: '⌘3', category: 'navigation', keywords: ['vacances', 'repos', 'absence', 'leave'], action: () => {
        openTab({ type: 'inbox', id: 'inbox:conges', title: 'Congés', icon: '🏖️', data: { queue: 'Congé' } });
        onClose();
      }},
      { id: 'nav-depenses', label: 'Dépenses', description: 'Remboursements et frais', icon: Wallet, keywords: ['remboursement', 'frais', 'expense', 'note'], category: 'navigation', action: () => {
        openTab({ type: 'inbox', id: 'inbox:depenses', title: 'Dépenses', icon: '💸', data: { queue: 'Dépense' } });
        onClose();
      }},
      { id: 'nav-deplacements', label: 'Déplacements', description: 'Missions et déplacements', icon: Plane, keywords: ['mission', 'voyage', 'transport', 'travel'], category: 'navigation', action: () => {
        openTab({ type: 'inbox', id: 'inbox:deplacements', title: 'Déplacements', icon: '✈️', data: { queue: 'Déplacement' } });
        onClose();
      }},
      { id: 'nav-validated', label: 'Validées', description: 'Historique des validations', icon: CheckCircle2, shortcut: '⌘4', category: 'navigation', keywords: ['approuvé', 'accepté', 'approved'], action: () => {
        openTab({ type: 'inbox', id: 'inbox:validated', title: 'Validées', icon: '✅', data: { queue: 'validated' } });
        onClose();
      }},
      { id: 'nav-rejected', label: 'Rejetées', description: 'Historique des rejets', icon: XCircle, keywords: ['refusé', 'rejeté', 'denied'], category: 'navigation', action: () => {
        openTab({ type: 'inbox', id: 'inbox:rejected', title: 'Rejetées', icon: '❌', data: { queue: 'rejected' } });
        onClose();
      }},
      
      // Actions rapides
      { id: 'act-refresh', label: 'Rafraîchir', description: 'Actualiser les données', icon: RefreshCw, shortcut: '⌘R', category: 'action', keywords: ['reload', 'actualiser', 'refresh'], action: () => {
        window.location.reload();
        onClose();
      }},
      
      // Settings
      { id: 'set-theme', label: darkMode ? 'Mode clair' : 'Mode sombre', description: 'Basculer le thème', icon: darkMode ? Sun : Moon, shortcut: '⌘D', category: 'settings', keywords: ['theme', 'dark', 'light', 'sombre', 'clair'], action: () => {
        toggleDarkMode();
        onClose();
      }},
      { id: 'set-shortcuts', label: 'Raccourcis clavier', description: 'Voir tous les raccourcis', icon: Keyboard, shortcut: 'Shift+?', category: 'settings', keywords: ['help', 'aide', 'hotkeys'], action: () => {
        onClose();
      }},
    ];
    
    // Actions avec callbacks dynamiques
    if (onOpenStats) {
      items.push({ 
        id: 'act-stats', 
        label: 'Statistiques', 
        description: 'Voir les stats en temps réel', 
        icon: BarChart3, 
        shortcut: '⌘S', 
        category: 'action',
        keywords: ['metrics', 'kpi', 'dashboard'],
        action: () => { onOpenStats(); onClose(); }
      });
    }
    
    if (onOpenExport) {
      items.push({ 
        id: 'act-export', 
        label: 'Exporter', 
        description: 'Exporter les demandes RH', 
        icon: Download, 
        shortcut: '⌘E', 
        category: 'action',
        keywords: ['download', 'télécharger', 'excel', 'pdf'],
        action: () => { onOpenExport(); onClose(); }
      });
    }

    if (onOpenFilters) {
      items.push({ 
        id: 'act-filters', 
        label: 'Filtres avancés', 
        description: 'Filtrer les demandes par critères', 
        icon: Filter, 
        shortcut: '⌘F', 
        category: 'action',
        keywords: ['recherche', 'search', 'critères'],
        action: () => { onOpenFilters(); onClose(); }
      });
    }

    if (onOpenQuickCreate) {
      items.push({ 
        id: 'act-quick-create', 
        label: 'Nouvelle demande', 
        description: 'Créer rapidement une demande', 
        icon: Plus, 
        shortcut: '⌘N', 
        category: 'quick_actions',
        keywords: ['créer', 'new', 'ajouter', 'add'],
        action: () => { onOpenQuickCreate(); onClose(); }
      });
    }

    if (onOpenAgentsManager) {
      items.push({ 
        id: 'act-agents', 
        label: 'Gestion des agents', 
        description: 'Gérer les agents RH', 
        icon: Users, 
        shortcut: '⌘G', 
        category: 'quick_actions',
        keywords: ['employés', 'personnel', 'staff'],
        action: () => { onOpenAgentsManager(); onClose(); }
      });
    }

    if (onOpenWorkflow) {
      items.push({ 
        id: 'act-workflow', 
        label: 'Workflows', 
        description: 'Gérer les workflows automatisés', 
        icon: Zap, 
        shortcut: '⌘W', 
        category: 'quick_actions',
        keywords: ['automation', 'règles', 'automatisation'],
        action: () => { onOpenWorkflow(); onClose(); }
      });
    }

    if (onOpenPredictive) {
      items.push({ 
        id: 'act-predictive', 
        label: 'Analytics IA', 
        description: 'Prédictions et analyses IA', 
        icon: Brain, 
        shortcut: '⌘I', 
        category: 'quick_actions',
        keywords: ['ai', 'intelligence', 'prédiction', 'tendances'],
        action: () => { onOpenPredictive(); onClose(); }
      });
    }

    if (onOpenDelegations) {
      items.push({ 
        id: 'act-delegations', 
        label: 'Délégations', 
        description: 'Gérer les délégations de pouvoir', 
        icon: UserCheck, 
        shortcut: '⌘L', 
        category: 'quick_actions',
        keywords: ['déléguer', 'substitute', 'remplaçant'],
        action: () => { onOpenDelegations(); onClose(); }
      });
    }

    if (onOpenReminders) {
      items.push({ 
        id: 'act-reminders', 
        label: 'Rappels', 
        description: 'Système de rappels intelligent', 
        icon: Clock3, 
        shortcut: '⌘P', 
        category: 'quick_actions',
        keywords: ['reminder', 'notification', 'deadline', 'échéance'],
        action: () => { onOpenReminders(); onClose(); }
      });
    }

    if (onOpenMultiLevel) {
      items.push({ 
        id: 'act-multilevel', 
        label: 'Validations multi-niveaux', 
        description: 'Processus de validation complexe', 
        icon: Layers, 
        shortcut: '⌘M', 
        category: 'quick_actions',
        keywords: ['approval', 'hiérarchie', 'étapes'],
        action: () => { onOpenMultiLevel(); onClose(); }
      });
    }

    if (onOpenCalendar) {
      items.push({ 
        id: 'act-calendar', 
        label: 'Calendrier absences', 
        description: 'Vue calendrier des absences', 
        icon: Calendar, 
        shortcut: '⌘C', 
        category: 'quick_actions',
        keywords: ['planning', 'schedule', 'disponibilité'],
        action: () => { onOpenCalendar(); onClose(); }
      });
    }

    if (onOpenTemplates) {
      items.push({ 
        id: 'act-templates', 
        label: 'Templates réponse', 
        description: 'Modèles de réponse prédéfinis', 
        icon: FolderOpen, 
        shortcut: '⌘T', 
        category: 'quick_actions',
        keywords: ['modèle', 'réponse', 'template'],
        action: () => { onOpenTemplates(); onClose(); }
      });
    }

    return items;
  }, [openTab, onClose, darkMode, toggleDarkMode, onOpenStats, onOpenExport, onOpenFilters, 
      onOpenQuickCreate, onOpenAgentsManager, onOpenWorkflow, onOpenPredictive, 
      onOpenDelegations, onOpenReminders, onOpenMultiLevel, onOpenCalendar, onOpenTemplates]);

  // Filtrer les commandes selon la recherche (avec scoring)
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      // Sans recherche: montrer les récentes d'abord, puis toutes les autres
      const recentItems = recentCommands
        .map(id => commands.find(c => c.id === id))
        .filter((c): c is CommandItem => c !== undefined);
      
      const otherItems = commands.filter(c => !recentCommands.includes(c.id));
      return [...recentItems, ...otherItems];
    }
    
    const q = query.toLowerCase();
    
    // Scoring de pertinence
    const scored = commands.map(cmd => {
      let score = 0;
      
      // Correspondance exacte du label = score max
      if (cmd.label.toLowerCase() === q) score += 100;
      // Label commence par la recherche
      else if (cmd.label.toLowerCase().startsWith(q)) score += 80;
      // Label contient la recherche
      else if (cmd.label.toLowerCase().includes(q)) score += 60;
      
      // Description
      if (cmd.description?.toLowerCase().includes(q)) score += 40;
      
      // Keywords
      if (cmd.keywords?.some(kw => kw.toLowerCase().includes(q))) score += 50;
      if (cmd.keywords?.some(kw => kw.toLowerCase() === q)) score += 30;
      
      // Boost pour les commandes récentes
      const recentIndex = recentCommands.indexOf(cmd.id);
      if (recentIndex !== -1) score += (5 - recentIndex) * 5;
      
      return { cmd, score };
    });
    
    return scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ cmd }) => cmd);
  }, [commands, query, recentCommands]);

  // Réinitialiser la sélection quand les résultats changent
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Focus input à l'ouverture
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  // Navigation clavier améliorée
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const len = filteredCommands.length;
    if (len === 0) return;

    switch (e.key) {
      case 'ArrowDown':
      case 'Tab':
        if (!e.shiftKey) {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % len);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + len) % len);
        break;
      case 'Tab':
        if (e.shiftKey) {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + len) % len);
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

  // Scroll automatique vers l'élément sélectionné
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
      quick_actions: [],
      navigation: [],
      action: [],
      settings: [],
      search: [],
    };
    
    filteredCommands.forEach(cmd => {
      if (groups[cmd.category]) {
        groups[cmd.category].push(cmd);
      }
    });

    // Si pas de recherche et il y a des récents, ajouter une section "Récents"
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
    
    // Ordre personnalisé des catégories
    const categoryOrder = ['quick_actions', 'navigation', 'action', 'settings', 'search'];
    categoryOrder.forEach(category => {
      if (groups[category] && groups[category].length > 0) {
        // Filtrer les récents déjà affichés
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
    search: 'Recherche',
    quick_actions: 'Actions rapides',
  };

  const categoryIcons: Record<string, typeof Search> = {
    navigation: Inbox,
    action: Zap,
    settings: Settings,
    search: Search,
    quick_actions: Plus,
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl mx-4 rounded-2xl border border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-2xl dark:border-slate-800 dark:bg-[#1f1f1f]/95 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Recherche */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200/70 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 flex-none" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher une commande..."
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
                const label = category === 'recent' ? '⏱ Récents' : categoryLabels[category];
                
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
                      
                      return (
                        <button
                          key={`${category}-${cmd.id}`}
                          data-index={globalIdx}
                          onClick={() => executeCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-3 transition-all text-left group",
                            isSelected
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                          )}
                        >
                          <div className={cn(
                            "p-2 rounded-lg transition-colors",
                            isSelected 
                              ? "bg-blue-500/20" 
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
                            </div>
                            {cmd.description && (
                              <div className="text-xs text-slate-400 truncate">{cmd.description}</div>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <kbd className={cn(
                              "px-2 py-1 rounded text-xs font-mono transition-colors",
                              isSelected 
                                ? "bg-blue-500/20 text-blue-600 dark:text-blue-400" 
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

        {/* Footer - Tips */}
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
              Console RH
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

