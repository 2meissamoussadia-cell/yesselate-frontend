'use client';

/**
 * Hook "éléments récents" - persistance localStorage
 * Liste des dernières routes visitées (ids ou clés main::sub::leaf), limitée à maxRecentItems.
 */

import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '@/lib/navigation/constants';
import { DEFAULT_SETTINGS } from '@/lib/navigation/constants';

function getStored(key: string, fallback: string[]): string[] {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr : fallback;
  } catch {
    return fallback;
  }
}

function setStored(key: string, value: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export interface UseNavigationRecentOptions {
  /** Persister dans localStorage (défaut: true) */
  persist?: boolean;
  /** Nombre max d'éléments (défaut: DEFAULT_SETTINGS.maxRecentItems) */
  maxItems?: number;
}

export function useNavigationRecent(options: UseNavigationRecentOptions = {}) {
  const {
    persist = true,
    maxItems = DEFAULT_SETTINGS.maxRecentItems,
  } = options;

  const [recentItems, setRecentItems] = useState<string[]>(() =>
    persist ? getStored(STORAGE_KEYS.RECENT_ITEMS, []) : []
  );

  useEffect(() => {
    if (!persist) return;
    setStored(STORAGE_KEYS.RECENT_ITEMS, recentItems);
  }, [persist, recentItems]);

  const addRecent = useCallback(
    (itemKey: string) => {
      if (!itemKey) return;
      setRecentItems((prev) => {
        const next = [itemKey, ...prev.filter((k) => k !== itemKey)].slice(0, maxItems);
        return next;
      });
    },
    [maxItems]
  );

  const clearRecent = useCallback(() => {
    setRecentItems([]);
  }, []);

  const removeRecent = useCallback((itemKey: string) => {
    setRecentItems((prev) => prev.filter((k) => k !== itemKey));
  }, []);

  return {
    recentItems,
    addRecent,
    clearRecent,
    removeRecent,
  };
}
