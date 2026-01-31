'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Star, StarOff, Pin, X } from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';

interface Favorite {
  id: string;
  type: 'bc' | 'facture' | 'avenant';
  title: string;
  pinned: boolean;
  note?: string;
  addedAt: string;
}

interface ValidationBCFavoritesContextValue {
  favorites: Favorite[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (document: Omit<Favorite, 'addedAt' | 'pinned' | 'note'>) => void;
  removeFavorite: (id: string) => void;
  togglePin: (id: string) => void;
  updateNote: (id: string, note: string) => void;
}

const ValidationBCFavoritesContext = createContext<ValidationBCFavoritesContextValue | null>(null);

export function useValidationBCFavorites() {
  const context = useContext(ValidationBCFavoritesContext);
  if (!context) {
    throw new Error('useValidationBCFavorites must be used within ValidationBCFavoritesProvider');
  }
  return context;
}

const LS_KEY = 'bmo.validation-bc.favorites.v1';

export function ValidationBCFavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Failed to save favorites:', error);
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some((fav) => fav.id === id);
    },
    [favorites]
  );

  const toggleFavorite = useCallback((document: Omit<Favorite, 'addedAt' | 'pinned' | 'note'>) => {
    setFavorites((prev) => {
      const exists = prev.find((fav) => fav.id === document.id);
      if (exists) {
        return prev.filter((fav) => fav.id !== document.id);
      } else {
        return [
          ...prev,
          {
            ...document,
            pinned: false,
            addedAt: new Date().toISOString(),
          },
        ];
      }
    });
  }, []);

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  }, []);

  const togglePin = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.map((fav) => (fav.id === id ? { ...fav, pinned: !fav.pinned } : fav))
    );
  }, []);

  const updateNote = useCallback((id: string, note: string) => {
    setFavorites((prev) =>
      prev.map((fav) => (fav.id === id ? { ...fav, note } : fav))
    );
  }, []);

  const value: ValidationBCFavoritesContextValue = {
    favorites,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    togglePin,
    updateNote,
  };

  return <ValidationBCFavoritesContext.Provider value={value}>{children}</ValidationBCFavoritesContext.Provider>;
}

// Component to display favorites panel
export function ValidationBCFavoritesPanel({ onOpenDocument }: { onOpenDocument: (id: string) => void }) {
  const { favorites, removeFavorite, togglePin } = useValidationBCFavorites();

  const pinnedFavorites = favorites.filter((fav) => fav.pinned).sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  const regularFavorites = favorites.filter((fav) => !fav.pinned).sort((a, b) => b.addedAt.localeCompare(a.addedAt));

  if (favorites.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-8 text-center dark:border-slate-800 dark:bg-[#1f1f1f]/70">
        <Star className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <div className="font-medium text-slate-600 dark:text-slate-400 mb-1">Aucun favori</div>
        <div className="text-sm text-slate-400">
          Cliquez sur l'étoile dans un document pour l'ajouter aux favoris
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Pinnés */}
      {pinnedFavorites.length > 0 && (
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold">Épinglés ({pinnedFavorites.length})</h3>
          </div>
          <div className="space-y-2">
            {pinnedFavorites.map((fav) => (
              <div
                key={fav.id}
                className="p-3 rounded-xl bg-white/80 dark:bg-[#141414]/40 border border-amber-200/50 dark:border-amber-800/30 flex items-start gap-3"
              >
                <button
                  onClick={() => onOpenDocument(fav.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="font-medium text-sm truncate">{fav.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {fav.type === 'bc' ? '📄 BC' : fav.type === 'facture' ? '🧾 Facture' : '📝 Avenant'}
                  </div>
                </button>
                <div className="flex items-center gap-1 flex-none">
                  <button
                    onClick={() => togglePin(fav.id)}
                    className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    title="Retirer l'épingle"
                  >
                    <Pin className="w-4 h-4 text-amber-500" />
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30"
                    title="Retirer des favoris"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-épinglés */}
      {regularFavorites.length > 0 && (
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            <h3 className="font-semibold">Favoris ({regularFavorites.length})</h3>
          </div>
          <div className="space-y-2">
            {regularFavorites.map((fav) => (
              <div
                key={fav.id}
                className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/30 flex items-start gap-3 transition-colors"
              >
                <button
                  onClick={() => onOpenDocument(fav.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="font-medium text-sm truncate">{fav.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {fav.type === 'bc' ? '📄 BC' : fav.type === 'facture' ? '🧾 Facture' : '📝 Avenant'}
                  </div>
                </button>
                <div className="flex items-center gap-1 flex-none">
                  <button
                    onClick={() => togglePin(fav.id)}
                    className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30"
                    title="Épingler"
                  >
                    <Pin className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => removeFavorite(fav.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30"
                    title="Retirer des favoris"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Quick favorites button component
export function ValidationBCQuickFavorites({ onOpenDocument }: { onOpenDocument: (id: string) => void }) {
  const { favorites } = useValidationBCFavorites();

  const pinnedFavorites = favorites.filter((fav) => fav.pinned).slice(0, 5);

  if (pinnedFavorites.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">Favoris :</span>
      {pinnedFavorites.map((fav) => (
        <button
          key={fav.id}
          onClick={() => onOpenDocument(fav.id)}
          className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:hover:bg-amber-900/30 text-xs font-medium transition-colors flex items-center gap-1.5"
          title={fav.title}
        >
          <Star className="w-3 h-3 text-amber-500" />
          <span className="max-w-[100px] truncate">{fav.title}</span>
        </button>
      ))}
    </div>
  );
}

