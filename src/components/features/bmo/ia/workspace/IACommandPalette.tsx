/**
 * IACommandPalette.tsx
 * 
 * Palette de commandes pour le workspace IA
 * Permet de rechercher rapidement des modules et d'exécuter des actions
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useIACommandCenterStore } from '@/lib/stores/iaCommandCenterStore';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  Brain,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileText,
  Lightbulb,
  Download,
  Settings,
  History,
  PlayCircle,
  RefreshCw,
  PowerOff,
  Power,
  LayoutDashboard,
  AlertCircle,
  X,
  Command,
} from 'lucide-react';
import { aiModules as aiModulesData, aiHistory } from '@/lib/data';
import { iaCategories } from '@/components/features/bmo/ia/command-center';

interface Command {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'urgent';
}

export function IACommandPalette() {
  const { commandPaletteOpen, toggleCommandPalette, navigate } = useIACommandCenterStore();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Normalisation pour recherche
  const normalize = (s: string) =>
    (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

  // Dispatcher des événements personnalisés pour les modals
  const dispatchEvent = useCallback((eventName: string) => {
    window.dispatchEvent(new CustomEvent(eventName));
    toggleCommandPalette();
  }, [toggleCommandPalette]);

  // Définir toutes les commandes disponibles
  const commands: Command[] = useMemo(() => {
    const cmdList: Command[] = [
      // === CATÉGORIES PRINCIPALES ===
      {
        id: 'category:modules',
        label: 'Modules',
        icon: <LayoutDashboard className="w-4 h-4 text-purple-400" />,
        category: '📋 Navigation',
        action: () => {
          navigate('modules', 'all', null);
          toggleCommandPalette();
        },
        keywords: ['modules', 'tous', 'liste'],
        shortcut: '⌘1',
      },
      {
        id: 'category:active',
        label: 'Modules Actifs',
        icon: <PlayCircle className="w-4 h-4 text-emerald-400" />,
        category: '📋 Navigation',
        action: () => {
          navigate('active', 'all', null);
          toggleCommandPalette();
        },
        keywords: ['actifs', 'en cours', 'running'],
      },
      {
        id: 'category:training',
        label: 'En Formation',
        icon: <RefreshCw className="w-4 h-4 text-amber-400" />,
        category: '📋 Navigation',
        action: () => {
          navigate('training', 'all', null);
          toggleCommandPalette();
        },
        keywords: ['formation', 'training', 'apprentissage'],
      },
      {
        id: 'category:history',
        label: 'Historique',
        icon: <History className="w-4 h-4 text-blue-400" />,
        category: '📋 Navigation',
        action: () => {
          navigate('history', 'all', null);
          toggleCommandPalette();
        },
        keywords: ['historique', 'history', 'exécutions'],
        shortcut: '⌘H',
      },
      {
        id: 'category:analysis',
        label: 'Analyses',
        icon: <BarChart3 className="w-4 h-4 text-blue-400" />,
        category: '📋 Navigation',
        action: () => {
          navigate('analysis', 'all', null);
          toggleCommandPalette();
        },
        keywords: ['analyses', 'analysis'],
      },
      {
        id: 'category:prediction',
        label: 'Prédictions',
        icon: <TrendingUp className="w-4 h-4 text-purple-400" />,
        category: '📋 Navigation',
        action: () => {
          navigate('prediction', 'all', null);
          toggleCommandPalette();
        },
        keywords: ['prédictions', 'prediction', 'forecast'],
      },
      {
        id: 'category:anomaly',
        label: 'Anomalies',
        icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
        category: '📋 Navigation',
        action: () => {
          navigate('anomaly', 'all', null);
          toggleCommandPalette();
        },
        keywords: ['anomalies', 'anomaly', 'erreurs'],
      },
      {
        id: 'category:reports',
        label: 'Rapports',
        icon: <FileText className="w-4 h-4 text-amber-400" />,
        category: '📋 Navigation',
        action: () => {
          navigate('reports', 'all', null);
          toggleCommandPalette();
        },
        keywords: ['rapports', 'reports'],
      },
      {
        id: 'category:recommendations',
        label: 'Recommandations',
        icon: <Lightbulb className="w-4 h-4 text-yellow-400" />,
        category: '📋 Navigation',
        action: () => {
          navigate('recommendations', 'all', null);
          toggleCommandPalette();
        },
        keywords: ['recommandations', 'recommendations', 'suggestions'],
      },
      {
        id: 'category:settings',
        label: 'Paramètres',
        icon: <Settings className="w-4 h-4 text-slate-400" />,
        category: '📋 Navigation',
        action: () => {
          navigate('settings', 'all', null);
          toggleCommandPalette();
        },
        keywords: ['paramètres', 'settings', 'config'],
        shortcut: '⌘,',
      },

      // === MODULES (recherche dynamique) ===
      ...aiModulesData.map((module) => ({
        id: `module:${module.id}`,
        label: module.name,
        icon: <Brain className="w-4 h-4 text-purple-400" />,
        category: '🧠 Modules',
        action: () => {
          // TODO: Ouvrir le module en modal
          dispatchEvent(`ia:open-module:${module.id}`);
        },
        keywords: [module.id, module.name, module.type, module.description],
        badge: module.status === 'active' ? 'actif' : module.status === 'training' ? 'formation' : undefined,
        badgeVariant: (module.status === 'active' ? 'success' : module.status === 'training' ? 'warning' : 'default') as 'default' | 'success' | 'warning' | 'urgent',
      })),

      // === ACTIONS ===
      {
        id: 'action:export',
        label: 'Exporter les données',
        icon: <Download className="w-4 h-4 text-blue-400" />,
        category: '⚡ Actions',
        action: () => dispatchEvent('ia:open-export'),
        keywords: ['export', 'télécharger', 'excel', 'csv'],
        shortcut: '⌘E',
      },
      {
        id: 'action:settings',
        label: 'Paramètres IA',
        icon: <Settings className="w-4 h-4 text-slate-400" />,
        category: '⚡ Actions',
        action: () => dispatchEvent('ia:open-settings'),
        keywords: ['settings', 'paramètres', 'config'],
      },
    ];

    return cmdList;
  }, [navigate, toggleCommandPalette, dispatchEvent]);

  // Filtrer les commandes selon la recherche
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;

    const searchLower = normalize(search);
    return commands.filter((cmd) => {
      const labelMatch = normalize(cmd.label).includes(searchLower);
      const keywordMatch = cmd.keywords?.some((kw) => normalize(kw).includes(searchLower));
      const categoryMatch = normalize(cmd.category).includes(searchLower);
      return labelMatch || keywordMatch || categoryMatch;
    });
  }, [commands, search]);

  // Grouper par catégorie
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Reset selected index when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        toggleCommandPalette();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const selectedCommand = filteredCommands[selectedIndex];
        if (selectedCommand) {
          selectedCommand.action();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredCommands, selectedIndex, toggleCommandPalette]);

  // Reset search on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Calculer l'index global dans groupedCommands
  let globalIndex = 0;
  let selectedCommand: Command | null = null;
  for (const category of Object.keys(groupedCommands)) {
    const categoryCommands = groupedCommands[category];
    if (selectedIndex >= globalIndex && selectedIndex < globalIndex + categoryCommands.length) {
      selectedCommand = categoryCommands[selectedIndex - globalIndex];
      break;
    }
    globalIndex += categoryCommands.length;
  }

  // Flatten commands for index calculation
  const flatCommands = Object.values(groupedCommands).flat();
  const actualSelectedCommand = flatCommands[selectedIndex] || null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={toggleCommandPalette}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-slate-900 rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/50">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un module, une catégorie ou une action..."
            className="flex-1 bg-transparent border-0 outline-none text-slate-200 placeholder:text-slate-400 text-sm"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-600 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun résultat pour "{search}"</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, categoryCommands]) => (
              <div key={category}>
                {/* Category Header */}
                <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-800/50 sticky top-0">
                  {category}
                </div>
                {/* Commands */}
                {categoryCommands.map((cmd, idx) => {
                  const flatIndex = Object.keys(groupedCommands)
                    .slice(0, Object.keys(groupedCommands).indexOf(category))
                    .reduce((acc, cat) => acc + groupedCommands[cat].length, 0) + idx;
                  const isSelected = flatIndex === selectedIndex;

                  return (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'bg-purple-500/10 border-l-2 border-purple-400'
                          : 'hover:bg-slate-800/50 border-l-2 border-transparent'
                      )}
                    >
                      <div className="flex-shrink-0">{cmd.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-200 font-medium truncate">{cmd.label}</span>
                          {cmd.badge && (
                            <Badge
                              variant={cmd.badgeVariant || 'default'}
                              className="text-xs"
                            >
                              {cmd.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {cmd.shortcut && (
                        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-600 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700/50 bg-slate-800/30 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span>↑↓ Naviguer</span>
            <span>↵ Sélectionner</span>
            <span>ESC Fermer</span>
          </div>
          <span>{filteredCommands.length} résultat(s)</span>
        </div>
      </div>
    </div>
  );
}

