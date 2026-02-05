/**
 * Menu d'actions consolidé pour Missions
 * Regroupe les raccourcis et actions rapides
 */

'use client';

import React from 'react';
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
  Plus,
  Bell,
  BellOff,
} from 'lucide-react';
import { useMissionsCommandCenterStore } from '@/lib/stores/missionsCommandCenterStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/cn';

interface ActionsMenuProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onFilters?: () => void;
}

export function ActionsMenu({ onRefresh, isRefreshing, onFilters }: ActionsMenuProps) {
  const {
    fullscreen,
    toggleFullscreen,
    toggleCommandPalette,
    openModal,
    kpiConfig,
    setKPIConfig,
  } = useMissionsCommandCenterStore();

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
        <DropdownMenuItem
          onClick={() => {
            toggleCommandPalette();
          }}
        >
          <Search className="mr-2 h-4 w-4" />
          Rechercher
          <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            openModal('create-mission');
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle mission
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            if (onFilters) {
              onFilters();
            } else {
              openModal('filters');
            }
          }}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtres avancés
          <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            ⌘F
          </kbd>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            openModal('export');
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          Exporter
          <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            ⌘E
          </kbd>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            onRefresh?.();
          }}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
          Rafraîchir
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            toggleFullscreen();
          }}
        >
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

        <DropdownMenuItem
          onClick={() => {
            setKPIConfig({ visible: !kpiConfig.visible });
          }}
        >
          {kpiConfig.visible ? (
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

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            openModal('stats');
          }}
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Statistiques
          <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            ⌘I
          </kbd>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            openModal('settings');
          }}
        >
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            openModal('shortcuts');
          }}
        >
          <Keyboard className="mr-2 h-4 w-4" />
          Raccourcis
          <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            ?
          </kbd>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            openModal('help');
          }}
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Aide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
