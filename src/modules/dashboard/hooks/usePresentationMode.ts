/**
 * Hook pour gérer le mode présentation/fullscreen
 * - Toggle avec F11
 * - Masque sidebar/navigation automatiquement
 * - Auto-hide UI après inactivité
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useLogger } from '@/lib/utils/logger';

export function usePresentationMode() {
  const log = useLogger('usePresentationMode');
  const presentationMode = useDashboardCommandCenterStore((s) => s.displayConfig.presentationMode);
  const setDisplayConfig = useDashboardCommandCenterStore((s) => s.setDisplayConfig);
  const sidebarCollapsed = useDashboardCommandCenterStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useDashboardCommandCenterStore((s) => s.toggleSidebar);
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasSidebarCollapsedRef = useRef(sidebarCollapsed);

  // Toggle mode présentation
  const togglePresentationMode = useCallback(() => {
    const newMode = !presentationMode;
    setDisplayConfig({ presentationMode: newMode });
    
    // En mode présentation, masquer la sidebar si elle était visible
    if (newMode && !sidebarCollapsed) {
      wasSidebarCollapsedRef.current = false;
      toggleSidebar();
    } else if (!newMode && !wasSidebarCollapsedRef.current) {
      // Restaurer la sidebar si elle était visible avant
      toggleSidebar();
    }
    
    log.debug('Mode présentation', { enabled: newMode });
  }, [presentationMode, setDisplayConfig, sidebarCollapsed, toggleSidebar, log]);

  // Gérer F11 pour fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F11 pour toggle présentation
      if (e.key === 'F11') {
        e.preventDefault();
        togglePresentationMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePresentationMode]);

  // Gérer fullscreen API (optionnel, pour vrai fullscreen navigateur)
  useEffect(() => {
    if (!presentationMode) return;

    const handleFullscreenChange = () => {
      const isFullscreen = !!document.fullscreenElement;
      if (!isFullscreen && presentationMode) {
        // Si l'utilisateur sort du fullscreen, désactiver le mode présentation
        setDisplayConfig({ presentationMode: false });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [presentationMode, setDisplayConfig]);

  // Auto-hide UI après 3s d'inactivité (en mode présentation)
  useEffect(() => {
    if (!presentationMode) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      inactivityTimerRef.current = setTimeout(() => {
        // Masquer les éléments UI (peut être étendu)
        log.debug('Auto-hide UI après inactivité');
      }, 3000);
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [presentationMode, log]);

  return {
    presentationMode,
    togglePresentationMode,
  };
}
