/**
 * Hook pour gérer les raccourcis clavier dans Arbitrages-Vivants
 * Pattern cohérent avec le dashboard
 */

'use client';

import { useEffect, useCallback } from 'react';

interface UseArbitragesKeyboardShortcutsOptions {
  onCommandPalette?: () => void;
  onRefresh?: () => void;
  onFullscreen?: () => void;
  onGoBack?: () => void;
  onToggleSidebar?: () => void;
  onHelp?: () => void;
  enabled?: boolean;
}

export function useArbitragesKeyboardShortcuts({
  onCommandPalette,
  onRefresh,
  onFullscreen,
  onGoBack,
  onToggleSidebar,
  onHelp,
  enabled = true,
}: UseArbitragesKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const target = e.target as HTMLElement;
      // Ignorer si on tape dans un input/textarea/contenteditable
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;
      const isAlt = e.altKey;

      // Ctrl+K : Command Palette
      if (isMod && e.key === 'k') {
        e.preventDefault();
        onCommandPalette?.();
        return;
      }

      // Ctrl+R : Refresh
      if (isMod && e.key === 'r' && !e.shiftKey) {
        e.preventDefault();
        onRefresh?.();
        return;
      }

      // F11 : Fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        onFullscreen?.();
        return;
      }

      // Alt+Left : Back
      if (isAlt && e.key === 'ArrowLeft') {
        e.preventDefault();
        onGoBack?.();
        return;
      }

      // Ctrl+B : Toggle sidebar
      if (isMod && e.key === 'b') {
        e.preventDefault();
        onToggleSidebar?.();
        return;
      }

      // F1 : Help
      if (e.key === 'F1') {
        e.preventDefault();
        onHelp?.();
        return;
      }
    },
    [enabled, onCommandPalette, onRefresh, onFullscreen, onGoBack, onToggleSidebar, onHelp]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
