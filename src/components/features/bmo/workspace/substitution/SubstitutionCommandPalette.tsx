/**
 * ====================================================================
 * COMMAND PALETTE: Substitution
 * Palette de commandes rapides avec raccourcis clavier
 * ====================================================================
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Download,
  Settings,
  Filter,
  Star,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';
import { useSubstitutionWorkspaceStore } from '@/lib/stores/substitutionWorkspaceStore';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string;
  category: 'actions' | 'navigation' | 'filters' | 'settings';
  action: () => void;
}

export function SubstitutionCommandPalette({ open, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { openTab } = useSubstitutionWorkspaceStore();

  // Définir toutes les commandes disponibles
  const allCommands: Command[] = useMemo(() => [
    // Actions rapides
    {
      id: 'create-substitution',
      label: 'Créer une substitution',
      description: 'Nouvelle demande de substitution',
      icon: <Plus className="w-4 h-4" />,
      shortcut: '⌘N',
      category: 'actions',
      action: () => {
        logger.debug('Create substitution', { component: 'SubstitutionCommandPalette' });
        onClose();
      },
    },
    {
      id: 'assign-substitute',
      label: 'Assigner un substitut',
      description: 'Trouver et assigner un substitut',
      icon: <Users className="w-4 h-4" />,
      shortcut: '⌘A',
      category: 'actions',
      action: () => {
        logger.debug('Assign substitute', { component: 'SubstitutionCommandPalette' });
        onClose();
      },
    },
    {
      id: 'create-absence',
      label: 'Créer une absence',
      description: 'Nouvelle absence planifiée',
      icon: <Calendar className="w-4 h-4" />,
      category: 'actions',
      action: () => {
        openTab({ type: 'absences', id: 'absences', title: 'Absences', icon: '📅', data: {} });
        onClose();
      },
    },
    {
      id: 'create-delegation',
      label: 'Créer une délégation',
      description: 'Nouvelle délégation de pouvoir',
      icon: <Users className="w-4 h-4" />,
      category: 'actions',
      action: () => {
        openTab({ type: 'delegations', id: 'delegations', title: 'Délégations', icon: '👥', data: {} });
        onClose();
      },
    },
    {
      id: 'export-data',
      label: 'Exporter les données',
      description: 'Télécharger un rapport',
      icon: <Download className="w-4 h-4" />,
      shortcut: '⌘E',
      category: 'actions',
      action: () => {
        logger.debug('Export data', { component: 'SubstitutionCommandPalette' });
        onClose();
      },
    },

    // Navigation
    {
      id: 'nav-overview',
      label: 'Vue d\'ensemble',
      description: 'Tableau de bord principal',
      icon: <FileText className="w-4 h-4" />,
      category: 'navigation',
      action: () => {
        openTab({ type: 'inbox', id: 'overview', title: 'Vue d\'ensemble', icon: '📊', data: { queue: 'all' } });
        onClose();
      },
    },
    {
      id: 'nav-critical',
      label: 'Critiques',
      description: 'Substitutions critiques',
      icon: <AlertTriangle className="w-4 h-4" />,
      category: 'navigation',
      action: () => {
        openTab({ type: 'inbox', id: 'critical', title: 'Critiques', icon: '🚨', data: { queue: 'critical' } });
        onClose();
      },
    },
    {
      id: 'nav-pending',
      label: 'En attente',
      description: 'Substitutions en attente',
      icon: <Clock className="w-4 h-4" />,
      category: 'navigation',
      action: () => {
        openTab({ type: 'inbox', id: 'pending', title: 'En attente', icon: '⏳', data: { queue: 'pending' } });
        onClose();
      },
    },
    {
      id: 'nav-absences',
      label: 'Absences',
      description: 'Gérer les absences',
      icon: <Calendar className="w-4 h-4" />,
      category: 'navigation',
      action: () => {
        openTab({ type: 'absences', id: 'absences', title: 'Absences', icon: '📅', data: {} });
        onClose();
      },
    },
    {
      id: 'nav-delegations',
      label: 'Délégations',
      description: 'Gérer les délégations',
      icon: <Users className="w-4 h-4" />,
      category: 'navigation',
      action: () => {
        openTab({ type: 'delegations', id: 'delegations', title: 'Délégations', icon: '👥', data: {} });
        onClose();
      },
    },
    {
      id: 'nav-historique',
      label: 'Historique',
      description: 'Consulter l\'historique',
      icon: <Clock className="w-4 h-4" />,
      category: 'navigation',
      action: () => {
        openTab({ type: 'historique', id: 'historique', title: 'Historique', icon: '📜', data: {} });
        onClose();
      },
    },
    {
      id: 'nav-analytics',
      label: 'Analytics',
      description: 'Statistiques et analyses',
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'navigation',
      action: () => {
        openTab({ type: 'analytics', id: 'analytics', title: 'Analytics', icon: '📈', data: {} });
        onClose();
      },
    },

    // Filtres
    {
      id: 'filter-bureau',
      label: 'Filtrer par bureau',
      description: 'Appliquer un filtre de bureau',
      icon: <Filter className="w-4 h-4" />,
      category: 'filters',
      action: () => {
        console.log('Filter by bureau');
        onClose();
      },
    },
    {
      id: 'filter-urgency',
      label: 'Filtrer par urgence',
      description: 'Appliquer un filtre d\'urgence',
      icon: <AlertTriangle className="w-4 h-4" />,
      category: 'filters',
      action: () => {
        logger.debug('Filter by urgency', { component: 'SubstitutionCommandPalette' });
        onClose();
      },
    },
    {
      id: 'filter-status',
      label: 'Filtrer par statut',
      description: 'Appliquer un filtre de statut',
      icon: <CheckCircle className="w-4 h-4" />,
      category: 'filters',
      action: () => {
        logger.debug('Filter by status', { component: 'SubstitutionCommandPalette' });
        onClose();
      },
    },

    // Paramètres
    {
      id: 'settings-preferences',
      label: 'Préférences',
      description: 'Gérer les préférences',
      icon: <Settings className="w-4 h-4" />,
      category: 'settings',
      action: () => {
        logger.debug('Open settings', { component: 'SubstitutionCommandPalette' });
        onClose();
      },
    },
  ], [openTab, onClose]);

  // Filtrer les commandes selon la recherche
  const filteredCommands = useMemo(() => {
    if (!search) return allCommands;

    const query = search.toLowerCase();
    return allCommands.filter(cmd =>
      cmd.label.toLowerCase().includes(query) ||
      cmd.description?.toLowerCase().includes(query) ||
      cmd.category.toLowerCase().includes(query)
    );
  }, [search, allCommands]);

  // Grouper par catégorie
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {
      actions: [],
      navigation: [],
      filters: [],
      settings: [],
    };

    filteredCommands.forEach(cmd => {
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [filteredCommands]);

  // Navigation au clavier
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = filteredCommands[selectedIndex];
        if (command) {
          command.action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredCommands]);

  // Reset lors de l'ouverture
  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  const getCategoryLabel = (category: string) => {
    const labels = {
      actions: 'Actions rapides',
      navigation: 'Navigation',
      filters: 'Filtres',
      settings: 'Paramètres',
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-slate-900 border-slate-700">
        {/* Header avec recherche */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une commande..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-white placeholder:text-slate-400"
            autoFocus
          />
          <Badge variant="outline" className="text-slate-400 border-slate-600 flex items-center gap-1">
            <Command className="w-3 h-3" />
            <span className="text-xs">K</span>
          </Badge>
        </div>

        {/* Liste des commandes */}
        <div className="max-h-[500px] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucune commande trouvée</p>
              <p className="text-sm mt-1">Essayez une autre recherche</p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, commands]) => {
              if (commands.length === 0) return null;

              return (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {getCategoryLabel(category)}
                  </div>
                  <div className="space-y-1">
                    {commands.map((command, idx) => {
                      const globalIndex = filteredCommands.indexOf(command);
                      const isSelected = globalIndex === selectedIndex;

                      return (
                        <button
                          key={command.id}
                          onClick={() => command.action()}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                            isSelected
                              ? 'bg-blue-500/20 text-white'
                              : 'text-slate-300 hover:bg-slate-800'
                          )}
                        >
                          <div className={cn(
                            'flex-shrink-0',
                            isSelected ? 'text-blue-400' : 'text-slate-400'
                          )}>
                            {command.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{command.label}</div>
                            {command.description && (
                              <div className="text-xs text-slate-400">{command.description}</div>
                            )}
                          </div>
                          {command.shortcut && (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              {command.shortcut}
                            </Badge>
                          )}
                          {isSelected && (
                            <ArrowRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded">↓</kbd>
              Navigation
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded">↵</kbd>
              Sélectionner
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded">Esc</kbd>
            Fermer
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
