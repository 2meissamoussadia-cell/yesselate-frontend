'use client';

/**
 * Hook navigation clavier sidebar - Arrow Up/Down, Tab
 * Déplace le focus entre les éléments focusables (boutons) du conteneur.
 */

import { useCallback, useRef, useEffect } from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export interface UseSidebarKeyboardNavOptions {
  /** Conteneur (scroll area) contenant les items focusables */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Activer la navigation clavier (défaut: true) */
  enabled?: boolean;
}

export function useSidebarKeyboardNav(options: UseSidebarKeyboardNavOptions) {
  const { containerRef, enabled = true } = options;
  const lastKeyRef = useRef<'ArrowDown' | 'ArrowUp' | null>(null);

  const getFocusables = useCallback((): HTMLElement[] => {
    const el = containerRef.current;
    if (!el) return [];
    return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  }, [containerRef]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (!enabled || !containerRef.current) return;
      const target = e.target as HTMLElement;
      if (!containerRef.current.contains(target)) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        lastKeyRef.current = 'ArrowDown';
        const list = getFocusables();
        const idx = list.indexOf(target);
        if (idx < list.length - 1) list[idx + 1]?.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        lastKeyRef.current = 'ArrowUp';
        const list = getFocusables();
        const idx = list.indexOf(target);
        if (idx > 0) list[idx - 1]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        const list = getFocusables();
        list[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        const list = getFocusables();
        list[list.length - 1]?.focus();
      }
    },
    [enabled, containerRef, getFocusables]
  );

  return { onKeyDown };
}
