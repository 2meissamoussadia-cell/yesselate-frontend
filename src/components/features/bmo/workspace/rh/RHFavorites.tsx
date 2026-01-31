'use client';

import { useState, useCallback, useEffect, createContext, useContext, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { demandesRH } from '@/lib/data/bmo-mock-2';
import type { HRRequest } from '@/lib/types/bmo.types';
import { 
  Star, Pin, Trash2, Eye, Clock, Calendar, 
  Building2, ChevronRight, X
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type FavoriteItem = {
  demandId: string;
  addedAt: string;
  note?: string;
  isPinned: boolean;
};

type FavoritesContextType = {
  favorites: FavoriteItem[];
  addFavorite: (demandId: string, note?: string) => void;
  removeFavorite: (demandId: string) => void;
  togglePin: (demandId: string) => void;
  updateNote: (demandId: string, note: string) => void;
  isFavorite: (demandId: string) => boolean;
  isPinned: (demandId: string) => boolean;
};

// ============================================
// CONTEXT
// ============================================

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}

// ============================================
// PROVIDER
// ============================================

export function RHFavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // Charger depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('rh-favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem('rh-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = useCallback((demandId: string, note?: string) => {
    setFavorites(prev => {
      if (prev.some(f => f.demandId === demandId)) return prev;
      return [...prev, {
        demandId,
        addedAt: new Date().toLocaleString('fr-FR'),
        note,
        isPinned: false,
      }];
    });
  }, []);

  const removeFavorite = useCallback((demandId: string) => {
    setFavorites(prev => prev.filter(f => f.demandId !== demandId));
  }, []);

  const togglePin = useCallback((demandId: string) => {
    setFavorites(prev => prev.map(f =>
      f.demandId === demandId ? { ...f, isPinned: !f.isPinned } : f
    ));
  }, []);

  const updateNote = useCallback((demandId: string, note: string) => {
    setFavorites(prev => prev.map(f =>
      f.demandId === demandId ? { ...f, note } : f
    ));
  }, []);

  const isFavorite = useCallback((demandId: string) => {
    return favorites.some(f => f.demandId === demandId);
  }, [favorites]);

  const isPinned = useCallback((demandId: string) => {
    return favorites.find(f => f.demandId === demandId)?.isPinned ?? false;
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      togglePin,
      updateNote,
      isFavorite,
      isPinned,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// ============================================
// BOUTON FAVORIS
// ============================================

type FavoriteButtonProps = {
  demandId: string;
  size?: 'sm' | 'md';
  showLabel?: boolean;
};

export function RHFavoriteButton({ demandId, size = 'md', showLabel = false }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isFav = isFavorite(demandId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) {
      removeFavorite(demandId);
    } else {
      addFavorite(demandId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg transition-all",
        size === 'sm' ? "p-1.5" : "p-2",
        isFav
          ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
          : "text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
      )}
      title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Star className={cn(
        size === 'sm' ? "w-4 h-4" : "w-5 h-5",
        isFav && "fill-current"
      )} />
      {showLabel && (
        <span className="text-sm font-medium">
          {isFav ? "Favori" : "Favoris"}
        </span>
      )}
    </button>
  );
}

// ============================================
// PANNEAU FAVORIS
// ============================================

type FavoritesPanelProps = {
  onOpenDemand?: (demandId: string) => void;
};

export function RHFavoritesPanel({ onOpenDemand }: FavoritesPanelProps) {
  const { favorites, removeFavorite, togglePin, updateNote } = useFavorites();
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');

  // Récupérer les demandes correspondantes
  const favoriteDemands = favorites
    .map(fav => {
      const demand = demandesRH.find(d => d.id === fav.demandId);
      return demand ? { ...demand, favorite: fav } : null;
    })
    .filter((d): d is (HRRequest & { favorite: FavoriteItem }) => d !== null)
    .sort((a, b) => {
      // Épinglés en premier
      if (a.favorite.isPinned !== b.favorite.isPinned) {
        return a.favorite.isPinned ? -1 : 1;
      }
      return 0;
    });

  const handleSaveNote = (demandId: string) => {
    updateNote(demandId, noteValue);
    setEditingNote(null);
    setNoteValue('');
  };

  const TYPE_ICONS: Record<string, string> = {
    Congé: '🏖️',
    Dépense: '💸',
    Maladie: '🏥',
    Déplacement: '✈️',
    Paie: '💰',
  };

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Star className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <h3 className="font-semibold mb-1">Aucun favori</h3>
          <p className="text-sm text-slate-400">
            Ajoutez des demandes en favoris pour y accéder rapidement
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Mes favoris ({favorites.length})
          </h3>
        </div>

        <div className="space-y-2">
          {favoriteDemands.map(demand => (
            <div
              key={demand.id}
              className={cn(
                "p-3 rounded-xl border transition-all cursor-pointer",
                "hover:border-orange-500/50 hover:shadow-sm",
                demand.favorite.isPinned
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-slate-200 dark:border-slate-700"
              )}
              onClick={() => onOpenDemand?.(demand.id)}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{TYPE_ICONS[demand.type] || '📄'}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">{demand.id}</span>
                    {demand.favorite.isPinned && (
                      <Pin className="w-3 h-3 text-amber-500" />
                    )}
                    <Badge 
                      variant={
                        demand.status === 'validated' ? 'success' :
                        demand.status === 'rejected' ? 'destructive' :
                        demand.priority === 'urgent' ? 'urgent' : 'default'
                      }
                      className="text-[10px]"
                    >
                      {demand.status === 'validated' ? '✓' :
                       demand.status === 'rejected' ? '✕' :
                       demand.priority === 'urgent' ? '🔥' : '⏳'}
                    </Badge>
                  </div>

                  <div className="font-medium text-sm mt-0.5">{demand.agent}</div>
                  
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>{demand.type}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {demand.bureau}
                    </span>
                  </div>

                  {/* Note */}
                  {editingNote === demand.id ? (
                    <div className="mt-2 flex gap-2" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={noteValue}
                        onChange={e => setNoteValue(e.target.value)}
                        placeholder="Ajouter une note..."
                        className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 
                                 bg-white dark:bg-slate-900"
                        autoFocus
                        onKeyDown={e => e.key === 'Enter' && handleSaveNote(demand.id)}
                      />
                      <button
                        onClick={() => handleSaveNote(demand.id)}
                        className="px-2 py-1 rounded bg-orange-500 text-white text-xs"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => { setEditingNote(null); setNoteValue(''); }}
                        className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : demand.favorite.note ? (
                    <div 
                      className="mt-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400"
                      onClick={e => {
                        e.stopPropagation();
                        setEditingNote(demand.id);
                        setNoteValue(demand.favorite.note || '');
                      }}
                    >
                      📝 {demand.favorite.note}
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => togglePin(demand.id)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      demand.favorite.isPinned
                        ? "text-amber-500 bg-amber-500/10"
                        : "text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                    title={demand.favorite.isPinned ? "Désépingler" : "Épingler"}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  
                  {!demand.favorite.note && (
                    <button
                      onClick={() => {
                        setEditingNote(demand.id);
                        setNoteValue('');
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Ajouter une note"
                    >
                      📝
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeFavorite(demand.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Retirer des favoris"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400 text-center">
          💡 Épinglez vos demandes importantes pour les garder en haut
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// QUICK ADD FAVORIS (mini version)
// ============================================

export function RHQuickFavorites({ onOpenDemand }: { onOpenDemand?: (id: string) => void }) {
  const { favorites, removeFavorite } = useFavorites();
  
  const pinnedFavorites = favorites
    .filter(f => f.isPinned)
    .slice(0, 5);

  if (pinnedFavorites.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-400 flex items-center gap-1">
        <Pin className="w-3 h-3" /> Épinglés:
      </span>
      {pinnedFavorites.map(fav => {
        const demand = demandesRH.find(d => d.id === fav.demandId);
        if (!demand) return null;
        
        return (
          <button
            key={fav.demandId}
            onClick={() => onOpenDemand?.(fav.demandId)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-600 
                     dark:text-amber-400 text-xs font-medium hover:bg-amber-500/20 transition-colors"
          >
            {fav.demandId.split('-').pop()}
            <X
              className="w-3 h-3 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                removeFavorite(fav.demandId);
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

