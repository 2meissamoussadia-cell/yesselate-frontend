/**
 * Command Palette pour Évaluations
 * Recherche rapide et navigation par raccourcis clavier
 */

'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/cn';
import {
  Search,
  ClipboardCheck,
  LayoutDashboard,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Building2,
  BarChart3,
  Archive,
  Download,
  RefreshCw,
  Filter,
  Plus,
  Eye,
  Calendar,
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  category: string;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
}

interface EvaluationsCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (category: string, subCategory?: string) => void;
  onOpenEvaluation?: (id: string) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  onCreate?: () => void;
  evaluations?: Array<{ id: string; employeeName: string; status: string }>;
}

export function EvaluationsCommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onOpenEvaluation,
  onExport,
  onRefresh,
  onCreate,
  evaluations = [],
}: EvaluationsCommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Commandes de base
  const baseCommands: Command[] = useMemo(
    () => [
      // Navigation
      {
        id: 'nav-overview',
        label: 'Vue d\'ensemble',
        description: 'Tableau de bord des évaluations',
        icon: <LayoutDashboard className="w-4 h-4 text-blue-400" />,
        category: 'Navigation',
        action: () => {
          onNavigate('overview');
          onClose();
        },
        keywords: ['overview', 'général', 'accueil', 'dashboard'],
        shortcut: '⌘1',
      },
      {
        id: 'nav-scheduled',
        label: 'Planifiées',
        description: 'Évaluations à venir',
        icon: <Clock className="w-4 h-4 text-purple-400" />,
        category: 'Navigation',
        action: () => {
          onNavigate('scheduled');
          onClose();
        },
        keywords: ['planifiées', 'scheduled', 'à venir', 'prochaines'],
        shortcut: '⌘2',
      },
      {
        id: 'nav-in-progress',
        label: 'En cours',
        description: 'Évaluations en cours de réalisation',
        icon: <PlayCircle className="w-4 h-4 text-blue-400" />,
        category: 'Navigation',
        action: () => {
          onNavigate('in_progress');
          onClose();
        },
        keywords: ['en cours', 'in progress', 'actives'],
      },
      {
        id: 'nav-completed',
        label: 'Complétées',
        description: 'Évaluations terminées',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
        category: 'Navigation',
        action: () => {
          onNavigate('completed');
          onClose();
        },
        keywords: ['complétées', 'completed', 'terminées', 'fini'],
      },
      {
        id: 'nav-recommendations',
        label: 'Recommandations',
        description: 'Gérer les recommandations RH',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
        category: 'Navigation',
        action: () => {
          onNavigate('recommendations');
          onClose();
        },
        keywords: ['recommandations', 'recos', 'rh', 'formations'],
      },
      {
        id: 'nav-scores',
        label: 'Scores',
        description: 'Analyses des scores',
        icon: <TrendingUp className="w-4 h-4 text-green-400" />,
        category: 'Navigation',
        action: () => {
          onNavigate('scores');
          onClose();
        },
        keywords: ['scores', 'performances', 'notes'],
      },
      {
        id: 'nav-bureaux',
        label: 'Par bureau',
        description: 'Évaluations par bureau',
        icon: <Building2 className="w-4 h-4 text-slate-400" />,
        category: 'Navigation',
        action: () => {
          onNavigate('bureaux');
          onClose();
        },
        keywords: ['bureaux', 'bureau', 'par bureau'],
      },
      {
        id: 'nav-analytics',
        label: 'Analytics',
        description: 'Statistiques et analyses',
        icon: <BarChart3 className="w-4 h-4 text-indigo-400" />,
        category: 'Navigation',
        action: () => {
          onNavigate('analytics');
          onClose();
        },
        keywords: ['analytics', 'statistiques', 'stats', 'analyses'],
      },
      {
        id: 'nav-archive',
        label: 'Archives',
        description: 'Évaluations archivées',
        icon: <Archive className="w-4 h-4 text-slate-400" />,
        category: 'Navigation',
        action: () => {
          onNavigate('archive');
          onClose();
        },
        keywords: ['archives', 'anciennes', 'historique'],
      },

      // Actions
      {
        id: 'action-create',
        label: 'Créer une évaluation',
        description: 'Planifier une nouvelle évaluation',
        icon: <Plus className="w-4 h-4 text-emerald-400" />,
        category: 'Actions',
        action: () => {
          onCreate?.();
          onClose();
        },
        keywords: ['créer', 'nouvelle', 'ajouter', 'planifier'],
        shortcut: '⌘N',
      },
      {
        id: 'action-export',
        label: 'Exporter',
        description: 'Exporter les évaluations',
        icon: <Download className="w-4 h-4 text-blue-400" />,
        category: 'Actions',
        action: () => {
          onExport?.();
          onClose();
        },
        keywords: ['exporter', 'export', 'télécharger', 'csv', 'excel'],
        shortcut: '⌘E',
      },
      {
        id: 'action-refresh',
        label: 'Actualiser',
        description: 'Rafraîchir les données',
        icon: <RefreshCw className="w-4 h-4 text-slate-400" />,
        category: 'Actions',
        action: () => {
          onRefresh?.();
          onClose();
        },
        keywords: ['actualiser', 'refresh', 'rafraîchir', 'reload'],
        shortcut: '⌘R',
      },

      // Recherche d'évaluations
      ...evaluations.slice(0, 10).map((evalItem) => ({
        id: `eval-${evalItem.id}`,
        label: evalItem.employeeName,
        description: `Évaluation ${evalItem.id} - ${evalItem.status}`,
        icon: <Eye className="w-4 h-4 text-purple-400" />,
        category: 'Évaluations',
        action: () => {
          onOpenEvaluation?.(evalItem.id);
          onClose();
        },
        keywords: [evalItem.id, evalItem.employeeName.toLowerCase(), evalItem.status],
      })),
    ],
    [onNavigate, onClose, onExport, onRefresh, onCreate, onOpenEvaluation, evaluations]
  );

  // Filtrer les commandes selon la recherche
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return baseCommands;

    const query = search.toLowerCase();
    return baseCommands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query) ||
        cmd.description?.toLowerCase().includes(query) ||
        cmd.keywords?.some((kw) => kw.toLowerCase().includes(query))
    );
  }, [baseCommands, search]);

  // Réinitialiser l'index lors de la recherche
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Focus input quand ouvert
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Navigation clavier
  useEffect(() => {
    if (!isOpen) return;

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
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  // Grouper par catégorie
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const categoryLabels: Record<string, string> = {
    Navigation: 'Navigation',
    Actions: 'Actions',
    Évaluations: 'Évaluations récentes',
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[12vh]">
      <div
        className="w-full max-w-2xl mx-4 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-blue-400 flex-none" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une évaluation, une action..."
            className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-400 outline-none text-base"
          />
          <kbd className="px-2 py-1 rounded bg-slate-800 text-xs font-mono text-slate-400 border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {Object.entries(groupedCommands).map(([category, commands]) => (
            <div key={category} className="py-2">
              <div className="px-4 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {categoryLabels[category] || category}
              </div>
              {commands.map((cmd, idx) => {
                const globalIndex = filteredCommands.indexOf(cmd);
                const isSelected = globalIndex === selectedIndex;

                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      isSelected ? 'bg-blue-500/10 border-l-2 border-l-blue-400' : 'hover:bg-slate-800/50'
                    )}
                  >
                    <div className="flex-shrink-0">{cmd.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-200">{cmd.label}</div>
                      {cmd.description && (
                        <div className="text-xs text-slate-400 mt-0.5 truncate">{cmd.description}</div>
                      )}
                    </div>
                    {cmd.shortcut && (
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono text-slate-400 border border-slate-700">
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {filteredCommands.length === 0 && (
            <div className="px-4 py-12 text-center">
              <p className="text-slate-400">Aucun résultat trouvé</p>
              <p className="text-xs text-slate-600 mt-1">Essayez une autre recherche</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
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

