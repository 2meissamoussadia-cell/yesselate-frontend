/**
 * Composant DashboardFooter
 * Affiche le footer avec métriques, raccourcis clavier et statut de connexion
 * Extrait de DashboardContent pour améliorer la maintenabilité
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';

interface DashboardFooterProps {
  version?: string;
  performanceMetrics?: {
    loadTime: number;
    renderTime?: number;
  };
  isOnline?: boolean;
  autoRefreshEnabled?: boolean;
  refreshInterval?: number;
  onShowShortcuts?: () => void;
}

export const DashboardFooter = memo(function DashboardFooter({
  version = '5.7',
  performanceMetrics = { loadTime: 0 },
  isOnline = true,
  autoRefreshEnabled = false,
  refreshInterval = 60000,
  onShowShortcuts,
}: DashboardFooterProps) {
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);

  // Mémoriser handleShortcutsClick pour éviter les re-renders
  const handleShortcutsClick = useCallback(() => {
    if (onShowShortcuts) {
      onShowShortcuts();
    } else {
      // Fallback: ouvrir le modal via le store
      openModal('shortcuts');
    }
  }, [onShowShortcuts, openModal]);

  // Mémoriser les className pour éviter les re-renders
  const connectionStatusClassName = useMemo(() => cn(
    "inline-flex items-center gap-2 px-2.5 py-1 rounded-md border transition-all cursor-help",
    isOnline 
      ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40" 
      : "bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40"
  ), [isOnline]);

  const connectionTextClassName = useMemo(() => cn(
    "font-medium text-xs",
    isOnline ? "text-emerald-400" : "text-amber-400"
  ), [isOnline]);

  return (
    <div className="border-t border-slate-800/60 bg-gradient-to-r from-slate-900/60 via-slate-900/40 to-slate-900/60 backdrop-blur-xl px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 shadow-lg shadow-black/10 min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0 flex-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-medium text-slate-400 cursor-help whitespace-nowrap">Dashboard v{version}</span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p className="font-semibold">Version {version}</p>
              <p className="text-slate-400">Dashboard BTP ERP</p>
            </div>
          </TooltipContent>
        </Tooltip>
        <span className="text-slate-600 hidden sm:inline">•</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded px-1 whitespace-nowrap"
              aria-label="Raccourcis clavier"
              onClick={handleShortcutsClick}
            >
              <Info className="h-3 w-3 flex-shrink-0" />
              <span className="text-[10px]">Raccourcis</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1.5 text-xs">
              <div className="font-semibold mb-2">Raccourcis clavier</div>
              <div className="flex items-center justify-between gap-4">
                <span>Ouvrir la palette</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Actualiser</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+R</kbd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Exporter CSV</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+E</kbd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Exporter JSON</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+Shift+E</kbd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Focus recherche</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+F</kbd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Toggle auto-refresh</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Alt+A</kbd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Toggle sidebar</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+B</kbd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Raccourcis</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+/</kbd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Fermer notifications</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Esc</kbd>
              </div>
              {performanceMetrics.loadTime > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-700">
                  <div className="flex items-center justify-between gap-4">
                    <span>Dernier chargement</span>
                    <span className="text-emerald-400">{performanceMetrics.loadTime.toFixed(0)}ms</span>
                  </div>
                  {performanceMetrics.renderTime && performanceMetrics.renderTime > 0 && (
                    <div className="flex items-center justify-between gap-4 mt-1">
                      <span>Temps de rendu</span>
                      <span className="text-emerald-400">{performanceMetrics.renderTime.toFixed(0)}ms</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Indicateur de connexion réseau amélioré */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(connectionStatusClassName, "whitespace-nowrap")}>
              <span className="relative flex h-2 w-2 flex-shrink-0">
                {isOnline ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                )}
              </span>
              <span className={cn(connectionTextClassName, "whitespace-nowrap")}>
                {isOnline ? "Connecté" : "Hors ligne"}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1 text-xs">
              <p className="font-semibold">
                {isOnline ? "✅ Connexion active" : "⚠️ Connexion perdue"}
              </p>
              {!isOnline && (
                <>
                  <p className="text-amber-400">
                    Le refresh automatique est suspendu
                  </p>
                  <p className="text-slate-400 text-[10px] pt-1 border-t border-slate-700 mt-1">
                    Reconnexion automatique à la restauration du réseau
                  </p>
                </>
              )}
              {isOnline && autoRefreshEnabled && (
                <p className="text-slate-400">
                  Refresh automatique: {Math.round(refreshInterval / 1000 / 60)} min
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
});
