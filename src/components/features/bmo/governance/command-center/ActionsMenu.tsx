/**
 * Menu d'actions consolidé
 * Regroupe les raccourcis et actions rapides
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Search,
  Download,
  Filter,
  RefreshCw,
  Maximize2,
  Minimize2,
  Settings,
  HelpCircle,
  Keyboard,
  Moon,
  Sun,
  Bell,
  BellOff,
  LayoutGrid,
  List,
  ChevronRight,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

interface ActionsMenuProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenFilters?: () => void;
}

export function ActionsMenu({ onRefresh, isRefreshing, onOpenFilters }: ActionsMenuProps) {
  const {
    fullscreen,
    toggleFullscreen,
    toggleCommandPalette,
    openModal,
    kpiConfig,
    setKPIConfig,
  } = useGovernanceCommandCenterStore();

  const [isOpen, setIsOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowShortcuts(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shortcuts = [
    { key: '⌘K', label: 'Recherche rapide' },
    { key: '⌘F', label: 'Filtres avancés' },
    { key: '⌘E', label: 'Exporter' },
    { key: 'F11', label: 'Plein écran' },
    { key: 'Alt+←', label: 'Retour' },
    { key: '?', label: 'Aide' },
  ];

  const actions = [
    {
      id: 'search',
      icon: Search,
      label: 'Rechercher',
      shortcut: '⌘K',
      onClick: () => {
        toggleCommandPalette();
        setIsOpen(false);
      },
    },
    {
      id: 'filter',
      icon: Filter,
      label: 'Filtres avancés',
      shortcut: '⌘F',
      onClick: () => {
        if (onOpenFilters) {
          onOpenFilters();
        } else {
          openModal('filters-advanced', {});
        }
        setIsOpen(false);
      },
    },
    {
      id: 'export',
      icon: Download,
      label: 'Exporter',
      shortcut: '⌘E',
      onClick: () => {
        openModal('export-config', {});
        setIsOpen(false);
      },
    },
    { id: 'divider1', divider: true },
    {
      id: 'refresh',
      icon: RefreshCw,
      label: 'Rafraîchir',
      onClick: () => {
        onRefresh?.();
        setIsOpen(false);
      },
      spinning: isRefreshing,
    },
    {
      id: 'fullscreen',
      icon: fullscreen ? Minimize2 : Maximize2,
      label: fullscreen ? 'Quitter plein écran' : 'Plein écran',
      shortcut: 'F11',
      onClick: () => {
        toggleFullscreen();
        setIsOpen(false);
      },
    },
    {
      id: 'kpi-toggle',
      icon: kpiConfig.visible ? BellOff : Bell,
      label: kpiConfig.visible ? 'Masquer les KPIs' : 'Afficher les KPIs',
      onClick: () => {
        setKPIConfig({ visible: !kpiConfig.visible });
        setIsOpen(false);
      },
    },
    { id: 'divider2', divider: true },
    {
      id: 'shortcuts',
      icon: Keyboard,
      label: 'Raccourcis clavier',
      hasSubmenu: true,
      onClick: () => setShowShortcuts(!showShortcuts),
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Paramètres',
      onClick: () => {
        setIsOpen(false);
      },
    },
    {
      id: 'help',
      icon: HelpCircle,
      label: 'Aide',
      shortcut: '?',
      onClick: () => {
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'h-8 w-8 p-0',
          isOpen ? 'bg-slate-800 text-slate-200' : 'text-slate-400 hover:text-slate-300'
        )}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {/* Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-slate-700 bg-slate-900 shadow-xl z-50 overflow-hidden">
          <div className="py-1">
            {actions.map((action) => {
              if (action.divider) {
                return <div key={action.id} className="my-1 h-px bg-slate-800" />;
              }

              const Icon = action.icon!;
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', action.spinning && 'animate-spin')} />
                    <span>{action.label}</span>
                  </div>
                  {action.shortcut && (
                    <kbd className="text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {action.shortcut}
                    </kbd>
                  )}
                  {action.hasSubmenu && (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Shortcuts submenu */}
          {showShortcuts && (
            <div className="border-t border-slate-800 py-2 px-3">
              <p className="text-xs font-medium text-slate-400 uppercase mb-2">Raccourcis</p>
              <div className="space-y-1">
                {shortcuts.map((s) => (
                  <div key={s.key} className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{s.label}</span>
                    <kbd className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

