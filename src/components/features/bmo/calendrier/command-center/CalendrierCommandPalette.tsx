/**
 * Command Palette pour Calendrier
 * Recherche rapide et navigation (⌘K)
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  CalendarDays,
  Clock,
  Users,
  Building2,
  X,
  ArrowRight,
  Calendar,
  GanttChart,
  List,
  Table,
  Download,
  Bell,
  Filter,
} from 'lucide-react';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';
import { calendrierDomains } from './CalendrierCommandSidebar';
import { getSectionsForDomain } from './CalendrierSubNavigation';
import type { CalendrierDomain } from '@/lib/types/calendrier.types';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: string;
  keywords?: string[];
}

interface CalendrierCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CalendrierCommandPalette({
  isOpen,
  onClose,
}: CalendrierCommandPaletteProps) {
  const { navigate, navigation, contextFilters, setContextFilters, openModal, setFiltersPanelOpen } = useCalendrierStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Générer les commandes
  const commands = useMemo(() => {
    const cmdList: Command[] = [];

    // Navigation par domaine
    calendrierDomains.forEach((domain) => {
      const sections = getSectionsForDomain(domain.id);
      sections.forEach((section) => {
        section.views?.forEach((view) => {
          cmdList.push({
            id: `nav:${domain.id}:${section.id}:${view.id}`,
            label: `${domain.label} > ${section.label} > ${view.label}`,
            description: `Naviguer vers ${view.label}`,
            icon: getViewIcon(view.id),
            action: () => {
              navigate(domain.id, section.id, view.id, navigation.period || 'month');
              onClose();
            },
            category: '📋 Navigation',
            keywords: [domain.label, section.label, view.label, domain.id, section.id, view.id],
          });
        });
      });
    });

    // Actions rapides
    cmdList.push(
      {
        id: 'action:export',
        label: 'Exporter période',
        description: 'Exporter le calendrier (iCal, Excel)',
        icon: Download,
        action: () => {
          openModal('export', {
            domain: navigation.domain,
            section: navigation.section,
            period: navigation.period || 'month',
          });
          onClose();
        },
        category: '⚡ Actions',
        keywords: ['export', 'excel', 'ical', 'télécharger'],
      },
      {
        id: 'action:filters',
        label: 'Ouvrir filtres',
        description: 'Filtrer par chantier, équipe, type',
        icon: Filter,
        action: () => {
          setFiltersPanelOpen(true);
          onClose();
        },
        category: '⚡ Actions',
        keywords: ['filtres', 'filters', 'chantier', 'équipe'],
      },
      {
        id: 'action:alert',
        label: 'Configurer alerte',
        description: 'Créer une alerte personnalisée',
        icon: Bell,
        action: () => {
          openModal('alert-config');
          onClose();
        },
        category: '⚡ Actions',
        keywords: ['alerte', 'alert', 'notification'],
      }
    );

    // Redirections vers autres modules
    cmdList.push(
      {
        id: 'redirect:contrats',
        label: 'Aller à Contrats',
        description: 'Module Contrats & SLA',
        icon: Building2,
        action: () => {
          window.location.href = '/maitre-ouvrage/validation-contrats';
        },
        category: '🔗 Modules',
        keywords: ['contrats', 'sla', 'validation'],
      },
      {
        id: 'redirect:chantiers',
        label: 'Aller à Gestion Chantiers',
        description: 'Module Projets & Chantiers',
        icon: Building2,
        action: () => {
          window.location.href = '/maitre-ouvrage/projets-en-cours';
        },
        category: '🔗 Modules',
        keywords: ['chantiers', 'projets', 'gestion'],
      },
      {
        id: 'redirect:rh',
        label: 'Aller à RH',
        description: 'Module Ressources Humaines',
        icon: Users,
        action: () => {
          window.location.href = '/maitre-ouvrage/employes';
        },
        category: '🔗 Modules',
        keywords: ['rh', 'ressources', 'employes', 'absences'],
      },
      {
        id: 'redirect:governance',
        label: 'Aller à Gouvernance',
        description: 'Module Gouvernance & Instances',
        icon: CalendarDays,
        action: () => {
          window.location.href = '/maitre-ouvrage/governance';
        },
        category: '🔗 Modules',
        keywords: ['gouvernance', 'instances', 'réunions'],
      }
    );

    return cmdList;
  }, [navigate, navigation.period, onClose]);

  // Filtrer les commandes selon la recherche
  const filteredCommands = useMemo(() => {
    if (!searchQuery.trim()) return commands;

    const query = searchQuery.toLowerCase();
    return commands.filter((cmd) => {
      const searchableText = [
        cmd.label,
        cmd.description,
        ...(cmd.keywords || []),
      ]
        .join(' ')
        .toLowerCase();
      return searchableText.includes(query);
    });
  }, [commands, searchQuery]);

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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-slate-900 border border-slate-800/50 rounded-lg shadow-2xl z-50 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <Search className="h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une commande..."
              className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 outline-none"
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Commands List */}
        <div className="flex-1 overflow-y-auto p-2">
          {Object.entries(groupedCommands).length > 0 ? (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-4">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {category}
                </div>
                <div className="space-y-1">
                  {cmds.map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.id}
                        onClick={cmd.action}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left',
                          'hover:bg-slate-800/50 transition-colors',
                          'group'
                        )}
                      >
                        <div className="flex-shrink-0 p-1.5 rounded bg-slate-800/50 group-hover:bg-slate-700/50">
                          <Icon className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-200">
                            {cmd.label}
                          </div>
                          {cmd.description && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-400">
                Aucune commande trouvée pour "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>↑↓ Naviguer</span>
            <span>↵ Sélectionner</span>
            <span>Esc Fermer</span>
          </div>
          <Badge variant="gray" className="text-xs">
            {filteredCommands.length} résultat{filteredCommands.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>
    </>
  );
}

function getViewIcon(viewId: string) {
  switch (viewId) {
    case 'gantt':
      return GanttChart;
    case 'calendar':
      return Calendar;
    case 'timeline':
      return Clock;
    case 'list':
      return List;
    case 'table':
      return Table;
    default:
      return CalendarDays;
  }
}

