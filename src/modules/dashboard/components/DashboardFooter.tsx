/**
 * Composant DashboardFooter
 * Affiche le footer avec métriques, raccourcis clavier et statut de connexion
 * Extrait de DashboardContent pour améliorer la maintenabilité
 */

'use client';

import { memo, useCallback, useMemo } from 'react';
import { Info, Focus, Mic, MicOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/cn';
import { safeArea } from '../utils/safeArea';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { LiveIndicator } from './shared/LiveIndicator';
import { PresenceIndicator } from './shared/PresenceIndicator';

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
  /** Phase 2 #8: dernière maj données → ● LIVE + timestamp dynamique */
  lastUpdate?: Date | null;
  /** Phase 2 #8: WebSocket connecté = badge LIVE, sinon fallback réseau */
  wsConnected?: boolean;
  /** Phase 2 #11: toggle mode Focus (masque sidebar/header) */
  onToggleFocus?: () => void;
  /** Phase 2 #11: true si mode Focus actif */
  focusMode?: boolean;
  /** Phase 3 #22: afficher indicateur présence (collaboration temps réel) */
  showPresence?: boolean;
  /** Phase 3 #23: commandes vocales — support navigateur */
  voiceSupported?: boolean;
  /** Phase 3 #23: micro en écoute */
  voiceListening?: boolean;
  /** Phase 3 #23: toggle écoute vocale */
  onVoiceToggle?: () => void;
}

export const DashboardFooter = memo(function DashboardFooter({
  version = '5.7',
  performanceMetrics = { loadTime: 0 },
  isOnline = true,
  autoRefreshEnabled = false,
  refreshInterval = 60000,
  onShowShortcuts,
  lastUpdate,
  onToggleFocus,
  focusMode = false,
  showPresence = false,
  voiceSupported = false,
  voiceListening = false,
  onVoiceToggle,
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
    isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
  ), [isOnline]);

  return (
    <div className={cn(
      "border-t border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/40 backdrop-blur-xl px-2 sm:px-4 py-2 sm:py-3 text-xs text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0 min-w-0 overflow-hidden",
      safeArea.pbFallback()
    )}>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0 flex-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-medium text-slate-700 dark:text-slate-300 cursor-help whitespace-nowrap">Dashboard v{version}</span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p className="font-semibold">Version {version}</p>
              <p className="text-slate-300">Dashboard BTP ERP</p>
            </div>
          </TooltipContent>
        </Tooltip>
        {(lastUpdate != null) && (
          <LiveIndicator lastUpdate={lastUpdate} showTimestamp isLive={wsConnected ?? isOnline} className="hidden sm:inline-flex" />
        )}
        {showPresence && (
          <>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">•</span>
            <PresenceIndicator className="hidden sm:inline-flex" showCount />
          </>
        )}
        {voiceSupported && onVoiceToggle && (
          <>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">•</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onVoiceToggle}
                  className={cn(
                    'hidden sm:inline-flex items-center gap-1 min-h-[44px] px-2 py-1 rounded transition-colors',
                    voiceListening ? 'bg-rose-500/20 text-rose-400' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100'
                  )}
                  aria-label={voiceListening ? 'Arrêter l\'écoute vocale' : 'Activer les commandes vocales'}
                >
                  {voiceListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                  <span className="text-[10px]">{voiceListening ? 'Micro ON' : 'Micro'}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Commandes vocales : « actualiser », « exporter », « mode focus », « palette », « raccourcis »</TooltipContent>
            </Tooltip>
          </>
        )}
        <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">•</span>
        {onToggleFocus && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onToggleFocus}
                  className="hidden sm:inline-flex items-center gap-1 min-h-[44px] px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded whitespace-nowrap"
                  aria-label={focusMode ? 'Quitter le mode Focus' : 'Mode Focus (contenu uniquement)'}
                >
                  <Focus className="h-3 w-3 flex-shrink-0" />
                  <span className="text-[10px]">{focusMode ? 'Quitter Focus' : 'Focus'}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">Mode Focus : masquer menu et en-tête (Ctrl+Shift+F)</TooltipContent>
            </Tooltip>
            <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">•</span>
          </>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="hidden sm:inline-flex items-center gap-1 min-h-[44px] px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded whitespace-nowrap"
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
                <span>Afficher cette aide</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">?</kbd>
              </div>
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
                <span>Mode Focus (contenu uniquement)</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+Shift+F</kbd>
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
                <span>Mode Focus (contenu uniquement)</span>
                <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-[10px]">Ctrl+Shift+F</kbd>
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
                {isOnline ? 'Connexion active' : 'Connexion perdue'}
              </p>
              {!isOnline && (
                <>
                  <p className="text-amber-400">
                    Le refresh automatique est suspendu
                  </p>
                  <p className="text-slate-300 text-[10px] pt-1 border-t border-slate-700 mt-1">
                    Reconnexion automatique à la restauration du réseau
                  </p>
                </>
              )}
              {isOnline && autoRefreshEnabled && (
                <p className="text-slate-300">
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
