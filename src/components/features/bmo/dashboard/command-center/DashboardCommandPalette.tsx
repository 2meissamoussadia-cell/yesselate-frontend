/**
 * Palette de commandes du Dashboard (⌘K)
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  Zap,
  AlertTriangle,
  Scale,
  Activity,
  FileCheck,
  Wallet,
  FileText,
  Users,
  Settings,
  Download,
  HelpCircle,
  ArrowRight,
  Command,
} from 'lucide-react';
import { useDashboardCommandCenterStore, type DashboardMainCategory } from '@/lib/stores/dashboardCommandCenterStore';
import { dashboardNavigationConfig, findNavNodeById } from '@/modules/dashboard/navigation/dashboardNavigationConfig';
import type { DashboardMainCategory as NavMainCategory } from '@/modules/dashboard/types/dashboardNavigationTypes';
import { useGlobalSearch } from '@/modules/dashboard/hooks/useGlobalSearch';
import { useDashboardKPIs } from '@/lib/hooks/useDashboardKPIs';

interface CommandItem {
  id: string;
  type: 'navigation' | 'action' | 'recent';
  label: string;
  hint?: string;
  icon: React.ElementType;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
  category?: string;
}

export function DashboardCommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, toggleCommandPalette, navigate, openModal } =
    useDashboardCommandCenterStore();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // Récupérer les KPIs pour la recherche globale
  const { kpis } = useDashboardKPIs('year');
  
  // Recherche globale (KPIs, projets, etc.)
  const globalSearchResults = useGlobalSearch(query, kpis);

  // Commandes disponibles - Génération dynamique depuis la config
  const commands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = [];

    // Parcourir toutes les catégories principales
    Object.entries(dashboardNavigationConfig).forEach(([mainId, mainNode]) => {
      const mainCategory = mainId as NavMainCategory;
      
      // Catégorie principale
      const mainLabel = mainNode.label ?? mainId;
      items.push({
        id: `nav-${mainId}`,
        type: 'navigation',
        label: mainLabel,
        hint: `Section ${mainLabel}`,
        icon: mainNode.icon || LayoutDashboard,
        category: 'Navigation',
        keywords: [mainId, mainLabel.toLowerCase()],
        action: () => {
          navigate(mainCategory as unknown as DashboardMainCategory, null, null);
          toggleCommandPalette();
        },
      });

      // Sous-catégories
      mainNode.children?.forEach((subNode) => {
        items.push({
          id: `nav-${mainId}-${subNode.id}`,
          type: 'navigation',
          label: `${mainLabel} → ${subNode.label ?? subNode.id}`,
          hint: subNode.label ?? subNode.id,
          icon: mainNode.icon || LayoutDashboard,
          category: 'Navigation',
          keywords: [mainId, subNode.id, (subNode.label ?? subNode.id).toLowerCase()],
          action: () => {
            navigate(mainCategory as unknown as DashboardMainCategory, subNode.id, null);
            toggleCommandPalette();
          },
        });

        // Pages finales (leaf)
        const subLabel = subNode.label ?? subNode.id;
        subNode.children?.forEach((leafNode) => {
          const leafLabel = leafNode.label ?? leafNode.id;
          items.push({
            id: `nav-${mainId}-${subNode.id}-${leafNode.id}`,
            type: 'navigation',
            label: `${mainLabel} → ${subLabel} → ${leafLabel}`,
            hint: leafLabel,
            icon: mainNode.icon || LayoutDashboard,
            category: 'Navigation',
            keywords: [
              mainId,
              subNode.id,
              leafNode.id,
              leafLabel.toLowerCase(),
            ],
            action: () => {
              navigate(mainCategory as unknown as DashboardMainCategory, subNode.id, leafNode.id);
              toggleCommandPalette();
            },
          });
        });
      });
    });
    
    // Navigation externe
    items.push({
      id: 'nav-substitution',
      type: 'navigation',
      label: 'Substitutions',
      hint: 'Blocages & délégations',
      icon: Users,
      action: () => router.push('/maitre-ouvrage/substitution'),
    });
    items.push({
      id: 'nav-validation-bc',
      type: 'navigation',
      label: 'Validation BC',
      hint: 'Bons de commande',
      icon: FileCheck,
      action: () => router.push('/maitre-ouvrage/validation-bc'),
    });
    items.push({
      id: 'nav-paiements',
      type: 'navigation',
      label: 'Paiements',
      hint: 'Validation paiements',
      icon: Wallet,
      action: () => router.push('/maitre-ouvrage/validation-paiements'),
    });
    items.push({
      id: 'nav-contrats',
      type: 'navigation',
      label: 'Contrats',
      hint: 'Validation contrats',
      icon: FileText,
      action: () => router.push('/maitre-ouvrage/validation-contrats'),
    });
    items.push({
      id: 'nav-governance',
      type: 'navigation',
      label: 'Gouvernance',
      hint: 'Centre de commandement',
      icon: Scale,
      action: () => router.push('/maitre-ouvrage/governance'),
    });
    
    // Actions
    items.push({
      id: 'action-export',
      type: 'action',
      label: 'Exporter',
      hint: 'Export données',
      icon: Download,
      shortcut: '⌘E',
      action: () => openModal('export'),
    });
    items.push({
      id: 'action-settings',
      type: 'action',
      label: 'Paramètres',
      hint: 'Configuration dashboard',
      icon: Settings,
      action: () => openModal('settings'),
    });
    items.push({
      id: 'action-help',
      type: 'action',
      label: 'Aide',
      hint: 'Raccourcis & documentation',
      icon: HelpCircle,
      shortcut: '?',
      action: () => openModal('shortcuts'),
    });

    return items;
  }, [navigate, router, openModal, toggleCommandPalette]);

  // Filtrer les commandes avec recherche améliorée
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    
    const q = query.toLowerCase().trim();
    const queryWords = q.split(/\s+/);
    
    const filtered = commands.filter((cmd) => {
      const searchText = [
        cmd.label.toLowerCase(),
        cmd.hint?.toLowerCase() || '',
        ...(cmd.keywords || []).map(k => k.toLowerCase()),
      ].join(' ');
      
      // Recherche par mots-clés (tous les mots doivent être trouvés)
      return queryWords.every(word => searchText.includes(word));
    });
    
    // Ajouter les résultats de recherche globale (KPIs, etc.)
    const globalItems: CommandItem[] = globalSearchResults.map((result) => ({
      id: result.id,
      type: result.type === 'kpi' ? 'action' : 'navigation',
      label: result.label,
      hint: result.description || result.value?.toString(),
      icon: result.type === 'kpi' ? Activity : LayoutDashboard,
      category: result.type === 'kpi' ? 'KPIs' : 'Données',
      keywords: result.keywords,
      action: result.action,
    }));
    
    // Combiner et trier par pertinence (résultats globaux en premier si score élevé)
    return [...globalItems, ...filtered].sort((a, b) => {
      const aScore = globalSearchResults.find(r => r.id === a.id)?.score || 0;
      const bScore = globalSearchResults.find(r => r.id === b.id)?.score || 0;
      return bScore - aScore;
    });
  }, [commands, query, globalSearchResults]);

  // Reset selection on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Reset on close
  useEffect(() => {
    if (!commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            toggleCommandPalette();
          }
          break;
        case 'Escape':
          e.preventDefault();
          toggleCommandPalette();
          break;
      }
    },
    [filteredCommands, selectedIndex, toggleCommandPalette]
  );

  if (!commandPaletteOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={toggleCommandPalette}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
        <div
          className="w-full max-w-xl bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/50">
            <Command className="w-5 h-5 text-slate-500" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher une commande..."
              className="flex-1 bg-transparent border-0 text-slate-200 placeholder:text-slate-500 focus-visible:ring-0"
            />
            <kbd className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-500 font-mono">
              ESC
            </kbd>
          </div>

          {/* Liste des commandes */}
          <div className="max-h-80 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500">
                Aucune commande trouvée
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((cmd, index) => {
                  const Icon = cmd.icon;
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action();
                        toggleCommandPalette();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isSelected ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                      )}
                    >
                      <div
                        className={cn(
                          'p-1.5 rounded-lg',
                          isSelected ? 'bg-blue-500/20' : 'bg-slate-800/50'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-4 h-4',
                            isSelected ? 'text-blue-400' : 'text-slate-500'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            isSelected ? 'text-slate-200' : 'text-slate-300'
                          )}
                        >
                          {cmd.label}
                        </p>
                        {cmd.hint && (
                          <p className="text-xs text-slate-500 truncate">{cmd.hint}</p>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-xs text-slate-500 font-mono">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {isSelected && <ArrowRight className="w-4 h-4 text-slate-500" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-4">
              <span>
                <kbd className="px-1 py-0.5 rounded bg-slate-800">↑↓</kbd> naviguer
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-slate-800">↵</kbd> sélectionner
              </span>
            </div>
            <span>⌘K pour ouvrir/fermer</span>
          </div>
        </div>
      </div>
    </>
  );
}

