/**
 * Header pour Validation-BC
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileCheck,
  Search,
  Bell,
  ChevronLeft,
  RefreshCw,
  MoreHorizontal,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useValidationBCCommandCenterStore } from '@/lib/stores/validationBCCommandCenterStore';
import { useValidationStats } from '../hooks';

interface ValidationHeaderProps {
  onRefresh?: () => void;
  onSearch?: () => void;
  isRefreshing?: boolean;
  hasUrgentItems?: boolean;
}

export function ValidationHeader({
  onRefresh,
  onSearch,
  isRefreshing = false,
  hasUrgentItems = false,
}: ValidationHeaderProps) {
  const { navigation, navigationHistory, goBack, toggleSidebar, toggleFullscreen, fullscreen } =
    useValidationBCCommandCenterStore();
  const { data: stats } = useValidationStats();

  const currentCategoryLabel = React.useMemo(() => {
    const categoryLabels: Record<string, string> = {
      overview: "Vue d'ensemble",
      types: 'Par type de document',
      statut: 'Par statut',
      historique: 'Historique',
      analyse: 'Analyse & gouvernance',
    };
    return categoryLabels[navigation.mainCategory] || 'Validation-BC';
  }, [navigation.mainCategory]);

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {/* Back Button */}
        {navigationHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
            title="Retour (Alt+←)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Title */}
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-amber-400" />
          <h1 className="text-base font-semibold text-slate-200">Validation-BC</h1>
          <Badge
            variant="default"
            className="text-xs bg-slate-800/50 text-slate-300 border-slate-700/50"
          >
            v2.0
          </Badge>
        </div>

        {/* Urgent indicator */}
        {hasUrgentItems && stats && stats.urgents > 0 && (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
            {stats.urgents} urgent{stats.urgents > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSearch}
          className="h-8 px-3 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="text-xs hidden sm:inline">Rechercher</span>
          <kbd className="ml-2 text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded hidden sm:inline">
            ⌘K
          </kbd>
        </Button>

        <div className="w-px h-4 bg-slate-700/50 mx-1" />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 relative text-slate-400 hover:text-slate-300"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {hasUrgentItems && stats && stats.urgents > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {stats.urgents}
            </span>
          )}
        </Button>

        {/* Actions Menu */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
