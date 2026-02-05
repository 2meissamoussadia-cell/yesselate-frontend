'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDelegationWorkspaceStore } from '@/lib/stores/delegationWorkspaceStore';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/cn';
import { 
  Search, Key, Shield, Clock, XCircle, Pause, Activity,
  Download, Sun, Moon, RefreshCw, ChevronRight, Keyboard,
  Plus, FileCheck, Printer, BarChart2, AlertTriangle,
  ListChecks, Filter, Settings, Users, Zap, History,
  Bell, Star, FileText, Copy, Trash2, Edit
} from 'lucide-react';
import { useAppStore } from '@/lib/stores';

type Command = {
  id: string;
  title: string;
  description?: string;
  category: 'navigation' | 'actions' | 'create' | 'settings';
  icon: typeof Key;
  shortcut?: string;
  action: () => void;
};

export function DelegationCommandPalette() {
  const { openTab } = useDelegationWorkspaceStore();
  const { darkMode, setDarkMode } = useAppStore();
  
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Commandes disponibles
  const commands = useMemo<Command[]>(() => [
    // Création
    {
      id: 'create:delegation',
      title: 'Nouvelle délégation',
      description: 'Créer une nouvelle délégation de pouvoir',
      category: 'create',
      icon: Plus,
      shortcut: 'Ctrl+N',
      action: () => openTab({ 
        id: `wizard:create:${Date.now()}`, 
        type: 'wizard', 
        title: 'Nouvelle délégation', 
        icon: '➕', 
        data: { action: 'create' } 
      }),
    },
    // Navigation
    {
      id: 'nav:active',
      title: 'Délégations actives',
      description: 'Voir toutes les délégations en cours',
      category: 'navigation',
      icon: Shield,
      shortcut: 'Ctrl+1',
      action: () => openTab({ id: 'inbox:active', type: 'inbox', title: 'Actives', icon: '✅', data: { queue: 'active' } }),
    },
    {
      id: 'nav:expiring',
      title: 'Délégations expirant bientôt',
      description: 'Délégations expirant dans les 7 prochains jours',
      category: 'navigation',
      icon: Clock,
      shortcut: 'Ctrl+2',
      action: () => openTab({ id: 'inbox:expiring_soon', type: 'inbox', title: 'Expirent bientôt', icon: '⏰', data: { queue: 'expiring_soon' } }),
    },
    {
      id: 'nav:expired',
      title: 'Délégations expirées',
      description: 'Délégations ayant dépassé leur date de fin',
      category: 'navigation',
      icon: Clock,
      shortcut: 'Ctrl+3',
      action: () => openTab({ id: 'inbox:expired', type: 'inbox', title: 'Expirées', icon: '📅', data: { queue: 'expired' } }),
    },
    {
      id: 'nav:revoked',
      title: 'Délégations révoquées',
      description: 'Délégations révoquées définitivement',
      category: 'navigation',
      icon: XCircle,
      shortcut: 'Ctrl+4',
      action: () => openTab({ id: 'inbox:revoked', type: 'inbox', title: 'Révoquées', icon: '⛔', data: { queue: 'revoked' } }),
    },
    {
      id: 'nav:suspended',
      title: 'Délégations suspendues',
      description: 'Délégations temporairement suspendues',
      category: 'navigation',
      icon: Pause,
      shortcut: 'Ctrl+5',
      action: () => openTab({ id: 'inbox:suspended', type: 'inbox', title: 'Suspendues', icon: '⏸️', data: { queue: 'suspended' } }),
    },
    // Actions
    {
      id: 'act:stats',
      title: 'Statistiques',
      description: 'Voir les statistiques détaillées',
      category: 'actions',
      icon: BarChart2,
      shortcut: 'Ctrl+S',
      action: () => {
        // Dispatch custom event pour ouvrir les stats
        window.dispatchEvent(new CustomEvent('delegation:open-stats'));
      },
    },
    {
      id: 'act:export',
      title: 'Exporter les délégations',
      description: 'Télécharger en CSV ou JSON',
      category: 'actions',
      icon: Download,
      shortcut: 'Ctrl+E',
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:open-export'));
      },
    },
    {
      id: 'act:verify',
      title: 'Vérifier l\'intégrité',
      description: 'Vérifier la chaîne d\'audit',
      category: 'actions',
      icon: FileCheck,
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:verify-integrity'));
      },
    },
    {
      id: 'act:print',
      title: 'Imprimer',
      description: 'Imprimer la vue actuelle',
      category: 'actions',
      icon: Printer,
      shortcut: 'Ctrl+P',
      action: () => window.print(),
    },
    {
      id: 'act:refresh',
      title: 'Rafraîchir les données',
      description: 'Recharger les données depuis le serveur',
      category: 'actions',
      icon: RefreshCw,
      action: () => window.location.reload(),
    },
    // Settings
    {
      id: 'set:theme',
      title: darkMode ? 'Activer le mode clair' : 'Activer le mode sombre',
      description: 'Basculer le thème de l\'interface',
      category: 'settings',
      icon: darkMode ? Sun : Moon,
      action: () => setDarkMode(!darkMode),
    },
    {
      id: 'set:shortcuts',
      title: 'Raccourcis clavier',
      description: 'Voir tous les raccourcis disponibles',
      category: 'settings',
      icon: Keyboard,
      shortcut: 'Shift+?',
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:open-help'));
      },
    },
    // Actions métier avancées
    {
      id: 'act:decision-center',
      title: 'Centre de décision',
      description: 'Traiter les délégations expirant bientôt',
      category: 'actions',
      icon: ListChecks,
      shortcut: 'Ctrl+D',
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:open-decision-center'));
      },
    },
    {
      id: 'act:batch-extend',
      title: 'Prolonger en masse',
      description: 'Prolonger plusieurs délégations sélectionnées',
      category: 'actions',
      icon: Clock,
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:batch-extend'));
      },
    },
    {
      id: 'act:batch-revoke',
      title: 'Révoquer en masse',
      description: 'Révoquer plusieurs délégations sélectionnées',
      category: 'actions',
      icon: Trash2,
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:batch-revoke'));
      },
    },
    {
      id: 'act:duplicate',
      title: 'Dupliquer une délégation',
      description: 'Créer une copie d\'une délégation existante',
      category: 'create',
      icon: Copy,
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:duplicate'));
      },
    },
    {
      id: 'act:simulator',
      title: 'Simulateur d\'acte',
      description: 'Tester si une action serait autorisée',
      category: 'actions',
      icon: Zap,
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:open-simulator'));
      },
    },
    {
      id: 'act:audit-trail',
      title: 'Journal d\'audit complet',
      description: 'Voir l\'historique détaillé des actions',
      category: 'actions',
      icon: History,
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:open-audit-trail'));
      },
    },
    {
      id: 'act:alerts',
      title: 'Gérer les alertes',
      description: 'Configurer et voir les alertes actives',
      category: 'actions',
      icon: Bell,
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:manage-alerts'));
      },
    },
    {
      id: 'nav:watchlist',
      title: 'Watchlist (épinglés)',
      description: 'Voir les délégations épinglées',
      category: 'navigation',
      icon: Star,
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:open-watchlist'));
      },
    },
    {
      id: 'act:generate-report',
      title: 'Générer un rapport',
      description: 'Créer un rapport de conformité',
      category: 'actions',
      icon: FileText,
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:generate-report'));
      },
    },
    {
      id: 'nav:by-bureau',
      title: 'Par bureau',
      description: 'Filtrer par bureau/département',
      category: 'navigation',
      icon: Users,
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:filter-by-bureau'));
      },
    },
    {
      id: 'set:preferences',
      title: 'Préférences utilisateur',
      description: 'Personnaliser l\'interface',
      category: 'settings',
      icon: Settings,
      shortcut: 'Ctrl+,',
      action: () => {
        window.dispatchEvent(new CustomEvent('delegation:open-settings'));
      },
    },
  ], [darkMode, setDarkMode, openTab]);

  // Filtrage par recherche
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset selection when filtered results change
  useEffect(() => {
    setSelected(0);
  }, [filtered.length]);

  // Keyboard handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Open/close with Ctrl+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setOpen(prev => !prev);
      setQuery('');
      setSelected(0);
      return;
    }

    if (!open) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(prev => Math.min(prev + 1, filtered.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(prev => Math.max(prev - 1, 0));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[selected];
      if (cmd) {
        cmd.action();
        setOpen(false);
        setQuery('');
      }
    }
  }, [open, filtered, selected]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Listen for external open events (from Ctrl+K hotkey in page)
  useEffect(() => {
    const handleOpenPalette = () => {
      setOpen(true);
      setQuery('');
      setSelected(0);
    };
    
    window.addEventListener('delegation:open-command-palette', handleOpenPalette);
    return () => window.removeEventListener('delegation:open-command-palette', handleOpenPalette);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Group commands by category
  const grouped = useMemo(() => {
    const groups: Record<string, Command[]> = { create: [], navigation: [], actions: [], settings: [] };
    filtered.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });
    return groups;
  }, [filtered]);

  const categoryLabels: Record<string, string> = {
    create: 'Créer',
    navigation: 'Navigation',
    actions: 'Actions',
    settings: 'Paramètres',
  };

  let itemIndex = -1;

  return (
    <FluentModal
      open={open}
      title=""
      onClose={() => setOpen(false)}
      hideHeader
    >
      <div className="p-0">
        {/* Search input */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une commande..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200/70 bg-white/90
                         dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-400">
              Esc
            </kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-auto p-2">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Aucun résultat pour &quot;{query}&quot;
            </div>
          )}

          {Object.entries(grouped).map(([category, cmds]) => {
            if (cmds.length === 0) return null;

            return (
              <div key={category} className="mb-2">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase">
                  {categoryLabels[category]}
                </div>
                {cmds.map(cmd => {
                  itemIndex++;
                  const isSelected = itemIndex === selected;
                  const Icon = cmd.icon;

                  return (
                    <button
                      key={cmd.id}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                        isSelected 
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400" 
                          : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      )}
                      onClick={() => {
                        cmd.action();
                        setOpen(false);
                        setQuery('');
                      }}
                    >
                      <Icon className={cn("w-4 h-4 flex-none", isSelected ? "text-purple-500" : "text-slate-400")} />
                      <div className="flex-1 text-left min-w-0">
                        <div className="truncate">{cmd.title}</div>
                        {cmd.description && (
                          <div className="text-xs text-slate-400 truncate">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="flex-none px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-400 font-mono">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      <ChevronRight className={cn("w-4 h-4 flex-none", isSelected ? "opacity-100" : "opacity-0")} />
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">↑↓</kbd>
            <span>Navigation</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 ml-2">↵</kbd>
            <span>Sélectionner</span>
          </div>
          <div>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Ctrl+K</kbd>
          </div>
        </div>
      </div>
    </FluentModal>
  );
}

