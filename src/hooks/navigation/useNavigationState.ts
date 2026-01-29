'use client';

/**
 * Persistance état navigation (sidebar collapsed, sections ouvertes, favoris)
 * localStorage avec clés STORAGE_KEYS
 */

import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '@/lib/navigation/constants';
import { DEFAULT_SETTINGS } from '@/lib/navigation/constants';

function getStored<T>(key: string, fallback: T, parse: (s: string) => T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return parse(raw);
  } catch {
    return fallback;
  }
}

function setStored(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

export interface UseNavigationStateOptions {
  persist?: boolean;
  defaultCollapsed?: boolean;
}

export function useNavigationState(options: UseNavigationStateOptions = {}) {
  const {
    persist = DEFAULT_SETTINGS.persistState,
    defaultCollapsed = DEFAULT_SETTINGS.defaultCollapsed,
  } = options;

  const [isCollapsed, setIsCollapsedState] = useState(defaultCollapsed);
  const [openSectionIds, setOpenSectionIds] = useState<Set<string>>(() => new Set());
  const [favorites, setFavoritesState] = useState<string[]>(() => []);

  // Hydrate from localStorage
  useEffect(() => {
    if (!persist) return;
    const collapsed = getStored(
      STORAGE_KEYS.SIDEBAR_COLLAPSED,
      defaultCollapsed,
      (s) => s === 'true'
    );
    setIsCollapsedState(collapsed);
    const sections = getStored(STORAGE_KEYS.OPEN_SECTIONS, '', (s) => s);
    if (sections) {
      try {
        const ids = JSON.parse(sections) as string[];
        setOpenSectionIds(new Set(Array.isArray(ids) ? ids : []));
      } catch {
        // ignore
      }
    }
    const fav = getStored(STORAGE_KEYS.FAVORITES, '[]', (s) => s);
    try {
      const arr = JSON.parse(fav) as string[];
      setFavoritesState(Array.isArray(arr) ? arr : []);
    } catch {
      // ignore
    }
  }, [persist, defaultCollapsed]);

  const setIsCollapsed = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setIsCollapsedState((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        if (persist) setStored(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
        return next;
      });
    },
    [persist]
  );

  // Persist open sections
  useEffect(() => {
    if (!persist) return;
    setStored(STORAGE_KEYS.OPEN_SECTIONS, JSON.stringify(Array.from(openSectionIds)));
  }, [persist, openSectionIds]);

  // Persist favorites
  useEffect(() => {
    if (!persist) return;
    setStored(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [persist, favorites]);

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSectionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  }, []);

  const isSectionOpen = useCallback(
    (sectionId: string) => openSectionIds.has(sectionId),
    [openSectionIds]
  );

  const addFavorite = useCallback((itemId: string) => {
    setFavoritesState((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]));
  }, []);

  const removeFavorite = useCallback((itemId: string) => {
    setFavoritesState((prev) => prev.filter((id) => id !== itemId));
  }, []);

  const toggleFavorite = useCallback((itemId: string) => {
    setFavoritesState((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsCollapsedState((prev) => {
      const next = !prev;
      if (persist) setStored(STORAGE_KEYS.SIDEBAR_COLLAPSED, String(next));
      return next;
    });
  }, [persist]);

  return {
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
    openSectionIds,
    toggleSection,
    isSectionOpen,
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}
