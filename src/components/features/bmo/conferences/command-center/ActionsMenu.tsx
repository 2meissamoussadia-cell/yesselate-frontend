/**
 * Menu d'actions consolidé pour Conférences
 * Regroupe les raccourcis et actions rapides
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
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
  Video,
  FileText,
  Calendar,
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
  onExport?: () => void;
  onCreate?: () => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onToggleCommandPalette?: () => void;
}

export function ActionsMenu({
  onRefresh,
  isRefreshing,
  onFilters,
  onExport,
  onCreate,
  fullscreen,
  onToggleFullscreen,
  onToggleCommandPalette,
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
        <DropdownMenuItem onClick={onCreate}>
          <Video className="mr-2 h-4 w-4" />
          Créer une conférence
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onToggleCommandPalette}>
          <Search className="mr-2 h-4 w-4" />
          Rechercher
          <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            ⌘K
          </kbd>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onFilters}>
          <Filter className="mr-2 h-4 w-4" />
          Filtres avancés
          <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            ⌘F
          </kbd>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={onExport}>
          <Download className="mr-2 h-4 w-4" />
          Exporter
          <kbd className="ml-auto text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            ⌘E
          </kbd>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onRefresh} disabled={isRefreshing}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
          Rafraîchir
        </DropdownMenuItem>

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

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Calendar className="mr-2 h-4 w-4" />
          Calendrier
        </DropdownMenuItem>

        <DropdownMenuItem>
          <FileText className="mr-2 h-4 w-4" />
          Rapports
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Paramètres
        </DropdownMenuItem>

        <DropdownMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          Aide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

