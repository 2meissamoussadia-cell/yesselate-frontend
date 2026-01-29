'use client';

/**
 * Favoris du dashboard - persistance localStorage (clés main::sub::leaf)
 * Même clé STORAGE_KEYS.FAVORITES que lib/navigation pour compatibilité.
 */

import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS } from '@/lib/navigation/constants';

const STORAGE_KEY = STORAGE_KEYS.FAVORITES;

function getStored(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function setStored(value: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function useDashboardFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => getStored());

  useEffect(() => {
    setStored(favorites);
  }, [favorites]);

  const addFavorite = useCallback((key: string) => {
    if (!key) return;
    setFavorites((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  const removeFavorite = useCallback((key: string) => {
    setFavorites((prev) => prev.filter((k) => k !== key));
  }, []);

  const toggleFavorite = useCallback((key: string) => {
    if (!key) return;
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const isFavorite = useCallback(
    (key: string) => favorites.includes(key),
    [favorites]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
