'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAlertWorkspaceStore } from '@/lib/stores/alertWorkspaceStore';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/utils';
import { 
  Search, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Shield,
  Clock,
  TrendingUp,
  Download, 
  Sun, 
  Moon, 
  RefreshCw, 
  ChevronRight, 
  Keyboard,
  FileCheck, 
  Printer, 
  BarChart2,
  Bell,
  DollarSign,
  FileText,
} from 'lucide-react';
import { useAppStore } from '@/lib/stores';

type Command = {
  id: string;
  title: string;
  description?: string;
  category: 'navigation' | 'actions' | 'analytics' | 'settings';
  icon: typeof AlertCircle;
  shortcut?: string;
  action: () => void;
};

export function AlertCommandPalette() {
  const { openTab } = useAlertWorkspaceStore();
  const { darkMode, setDarkMode } = useAppStore();
  
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Commandes disponibles
  const commands = useMemo<Command[]>(() => [
    // Navigation - Alertes critiques
    {
      id: 'nav:critical',
      title: 'Alertes critiques',
      description: 'Voir toutes les alertes critiques nécessitant une action immédiate',
      category: 'navigation',
      icon: AlertCircle,
      shortcut: 'Ctrl+1',
      action: () => openTab({ 
        id: 'inbox:critical', 
        type: 'inbox', 
        title: 'Critiques', 
        icon: '🔴', 
        data: { queue: 'critical' } 
      }),
    },
    {
      id: 'nav:warning',
      title: 'Avertissements',
      description: 'Alertes d\'avertissement nécessitant une attention',
      category: 'navigation',
      icon: AlertTriangle,
      shortcut: 'Ctrl+2',
      action: () => openTab({ 
        id: 'inbox:warning', 
        type: 'inbox', 
        title: 'Avertissements', 
        icon: '⚠️', 
        data: { queue: 'warning' } 
      }),
    },
    {
      id: 'nav:blocked',
      title: 'Dossiers bloqués',
      description: 'Voir tous les dossiers bloqués nécessitant intervention',
      category: 'navigation',
      icon: Shield,
      shortcut: 'Ctrl+3',
      action: () => openTab({ 
        id: 'inbox:blocked', 
        type: 'inbox', 
        title: 'Bloqués', 
        icon: '🚫', 
        data: { queue: 'blocked' } 
      }),
    },
    {
      id: 'nav:sla',
      title: 'SLA dépassés',
      description: 'Alertes pour les délais de traitement dépassés',
      category: 'navigation',
      icon: Clock,
      shortcut: 'Ctrl+4',
      action: () => openTab({ 
        id: 'inbox:sla', 
        type: 'inbox', 
        title: 'SLA', 
        icon: '⏱️', 
        data: { queue: 'sla' } 
      }),
    },
    {
      id: 'nav:resolved',
      title: 'Alertes résolues',
      description: 'Historique des alertes résolues',
      category: 'navigation',
      icon: CheckCircle,
      shortcut: 'Ctrl+5',
      action: () => openTab({ 
        id: 'inbox:resolved', 
        type: 'inbox', 
        title: 'Résolues', 
        icon: '✅', 
        data: { queue: 'resolved' } 
      }),
    },
    // Navigation - Par type
    {
      id: 'nav:payment',
      title: 'Alertes paiements',
      description: 'Alertes liées aux paiements et validations financières',
      category: 'navigation',
      icon: DollarSign,
      action: () => openTab({ 
        id: 'inbox:payment', 
        type: 'inbox', 
        title: 'Paiements', 
        icon: '💰', 
        data: { queue: 'payment' } 
      }),
    },
    {
      id: 'nav:contract',
      title: 'Alertes contrats',
      description: 'Alertes liées aux contrats (expiration, signature)',
      category: 'navigation',
      icon: FileText,
      action: () => openTab({ 
        id: 'inbox:contract', 
        type: 'inbox', 
        title: 'Contrats', 
        icon: '📄', 
        data: { queue: 'contract' } 
      }),
    },
    {
      id: 'nav:budget',
      title: 'Alertes budget',
      description: 'Dépassements budgétaires et seuils',
      category: 'navigation',
      icon: TrendingUp,
      action: () => openTab({ 
        id: 'inbox:budget', 
        type: 'inbox', 
        title: 'Budgets', 
        icon: '📊', 
        data: { queue: 'budget' } 
      }),
    },
    {
      id: 'nav:info',
      title: 'Informations système',
      description: 'Notifications et informations générales',
      category: 'navigation',
      icon: Info,
      action: () => openTab({ 
        id: 'inbox:info', 
        type: 'inbox', 
        title: 'Info', 
        icon: 'ℹ️', 
        data: { queue: 'info' } 
      }),
    },
    // Analytics
    {
      id: 'ana:overview',
      title: 'Tableau de bord analytics',
      description: 'Vue d\'ensemble des métriques et KPIs',
      category: 'analytics',
      icon: BarChart2,
      shortcut: 'Ctrl+A',
      action: () => openTab({ 
        id: 'analytics:overview', 
        type: 'analytics', 
        title: 'Analytics', 
        icon: '📊' 
      }),
    },
    {
      id: 'ana:heatmap',
      title: 'Heatmap des risques',
      description: 'Carte de chaleur des risques par bureau',
      category: 'analytics',
      icon: TrendingUp,
      action: () => openTab({ 
        id: 'heatmap:bureaux', 
        type: 'heatmap', 
        title: 'Heatmap', 
        icon: '🗺️' 
      }),
    },
    // Actions
    {
      id: 'act:export',
      title: 'Exporter les alertes',
      description: 'Télécharger les alertes en CSV ou JSON',
      category: 'actions',
      icon: Download,
      shortcut: 'Ctrl+E',
      action: () => {
        window.dispatchEvent(new CustomEvent('alert:open-export'));
      },
    },
    {
      id: 'act:report',
      title: 'Générer un rapport',
      description: 'Créer un rapport d\'analyse des alertes',
      category: 'actions',
      icon: FileText,
      action: () => openTab({ 
        id: 'report:monthly', 
        type: 'report', 
        title: 'Rapport', 
        icon: '📄' 
      }),
    },
    {
      id: 'act:verify',
      title: 'Vérifier l\'intégrité',
      description: 'Vérifier la traçabilité des actions',
      category: 'actions',
      icon: FileCheck,
      action: () => {
        window.dispatchEvent(new CustomEvent('alert:verify-integrity'));
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
        window.dispatchEvent(new CustomEvent('alert:open-help'));
      },
    },
  ], [darkMode, setDarkMode, openTab]);

  // Filtrage par recherche fuzzy
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c => 
      c.title.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
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
      setQuery('');
      setSelected(0);
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(prev => (prev + 1) % filtered.length);
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(prev => (prev - 1 + filtered.length) % filtered.length);
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = filtered[selected];
      if (cmd) {
        cmd.action();
        setOpen(false);
        setQuery('');
        setSelected(0);
      }
    }
  }, [open, filtered, selected]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Focus input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Categories
  const groupedCommands = useMemo(() => {
    const grouped: Record<string, Command[]> = {
      navigation: [],
      analytics: [],
      actions: [],
      settings: [],
    };
    
    filtered.forEach(cmd => {
      grouped[cmd.category].push(cmd);
    });
    
    return grouped;
  }, [filtered]);

  return (
    <FluentModal
      open={open}
      onClose={() => setOpen(false)}
      title=""
      maxWidth="2xl"
    >
      <div className="flex flex-col max-h-[70vh]">
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher une action ou une vue..."
            className="flex-1 bg-transparent text-slate-700 dark:text-slate-200 placeholder:text-slate-400 outline-none text-sm"
          />
          <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600">
            ESC
          </kbd>
        </div>

        {/* Commands list */}
        <div className="overflow-y-auto flex-1 py-2">
          {Object.entries(groupedCommands).map(([category, cmds]) => {
            if (cmds.length === 0) return null;
            
            const categoryLabels: Record<string, string> = {
              navigation: 'Navigation',
              analytics: 'Analytics',
              actions: 'Actions',
              settings: 'Paramètres',
            };
            
            return (
              <div key={category} className="mb-4">
                <div className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  {categoryLabels[category]}
                </div>
                {cmds.map((cmd, idx) => {
                  const globalIdx = filtered.indexOf(cmd);
                  const isSelected = globalIdx === selected;
                  const Icon = cmd.icon;
                  
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        setOpen(false);
                        setQuery('');
                        setSelected(0);
                      }}
                      onMouseEnter={() => setSelected(globalIdx)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isSelected && 'bg-purple-500/10 dark:bg-purple-500/20',
                        !isSelected && 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      )}
                    >
                      <Icon className={cn(
                        'w-4 h-4 shrink-0',
                        isSelected ? 'text-purple-500' : 'text-slate-400'
                      )} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          {cmd.title}
                        </div>
                        {cmd.description && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {cmd.description}
                          </div>
                        )}
                      </div>
                      
                      {cmd.shortcut && (
                        <kbd className="px-2 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600 shrink-0">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      
                      {isSelected && (
                        <ChevronRight className="w-4 h-4 text-purple-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Aucune commande trouvée</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↓</kbd>
              pour naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Enter</kbd>
              pour sélectionner
            </span>
          </div>
          <span>
            Appuyez sur <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Ctrl+K</kbd> pour ouvrir
          </span>
        </div>
      </div>
    </FluentModal>
  );
}

