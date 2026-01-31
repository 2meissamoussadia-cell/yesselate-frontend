/**
 * Menu d'actions consolidé pour Employés
 * Regroupe les raccourcis et actions rapides
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Search,
  Download,
  Filter,
  RefreshCw,
  Maximize2,
  Minimize2,
  Settings,
  HelpCircle,
  Keyboard,
  BarChart3,
  Bell,
  BellOff,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionsMenuProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onFilters?: () => void;
  onSearch?: () => void;
  onExport?: () => void;
  onStats?: () => void;
  onSettings?: () => void;
  onShortcuts?: () => void;
  onHelp?: () => void;
  onToggleFullscreen?: () => void;
  fullscreen?: boolean;
  onToggleKPIs?: () => void;
  kpisVisible?: boolean;
}

export function ActionsMenu({
  onRefresh,
  isRefreshing,
  onFilters,
  onSearch,
  onExport,
  onStats,
  onSettings,
  onShortcuts,
  onHelp,
  onToggleFullscreen,
  fullscreen,
  onToggleKPIs,
  kpisVisible = true,
}: ActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
          title="Actions"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {onSearch && (
          <DropdownMenuItem onClick={onSearch}>
            <Search className="mr-2 h-4 w-4" />
            Rechercher
            <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </DropdownMenuItem>
        )}

        {onFilters && (
          <DropdownMenuItem onClick={onFilters}>
            <Filter className="mr-2 h-4 w-4" />
            Filtres avancés
            <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              ⌘F
            </kbd>
          </DropdownMenuItem>
        )}

        {onExport && (
          <DropdownMenuItem onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
            <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              ⌘E
            </kbd>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {onRefresh && (
          <DropdownMenuItem onClick={onRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
            Rafraîchir
          </DropdownMenuItem>
        )}

        {onToggleFullscreen && (
          <DropdownMenuItem onClick={onToggleFullscreen}>
            {fullscreen ? (
              <>
                <Minimize2 className="mr-2 h-4 w-4" />
                Quitter plein écran
              </>
            ) : (
              <>
                <Maximize2 className="mr-2 h-4 w-4" />
                Plein écran
              </>
            )}
            <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              F11
            </kbd>
          </DropdownMenuItem>
        )}

        {onToggleKPIs && (
          <DropdownMenuItem onClick={onToggleKPIs}>
            {kpisVisible ? (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Masquer les KPIs
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Afficher les KPIs
              </>
            )}
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {onStats && (
          <DropdownMenuItem onClick={onStats}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Statistiques
            <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              ⌘I
            </kbd>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {onSettings && (
          <DropdownMenuItem onClick={onSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Paramètres
          </DropdownMenuItem>
        )}

        {onShortcuts && (
          <DropdownMenuItem onClick={onShortcuts}>
            <Keyboard className="mr-2 h-4 w-4" />
            Raccourcis
            <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              ?
            </kbd>
          </DropdownMenuItem>
        )}

        {onHelp && (
          <DropdownMenuItem onClick={onHelp}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Aide
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

