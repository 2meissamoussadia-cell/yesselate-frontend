'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'kpi' | 'risk' | 'decision' | 'bureau' | 'action';
  title: string;
  description: string;
  route?: string;
  metadata?: Record<string, any>;
}

interface EnhancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: SearchResult) => void;
  className?: string;
}

export const EnhancedSearch = React.forwardRef<
  { inputRef: React.RefObject<HTMLInputElement> } | null,
  EnhancedSearchProps
>(({ value, onChange, onSelect, className }, ref) => {
  const { darkMode } = useAppStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Exposer la ref pour le focus depuis l'extérieur
  useEffect(() => {
    if (ref && typeof ref === 'object' && 'current' in ref) {
      (ref as any).current = { inputRef };
    }
  }, [ref]);

  // Charger l'historique depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('bmo.search.history');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch {
      // silent
    }
  }, []);

  // Données de recherche (en production, cela viendrait d'une API)
  const searchData: SearchResult[] = useMemo(() => {
    // Simuler des données de recherche
    return [
      { id: '1', type: 'kpi', title: 'Demandes', description: 'Total des demandes traitées', route: '/maitre-ouvrage/demandes' },
      { id: '2', type: 'kpi', title: 'Validations', description: 'Taux de validation', route: '/maitre-ouvrage/demandes?filter=validated' },
      { id: '3', type: 'kpi', title: 'Rejets', description: 'Taux de rejet', route: '/maitre-ouvrage/demandes?filter=rejected' },
      { id: '4', type: 'kpi', title: 'Budget', description: 'Budget traité', route: '/maitre-ouvrage/finances' },
      { id: '5', type: 'risk', title: 'Dossiers bloqués', description: 'Dossiers nécessitant une intervention', route: '/maitre-ouvrage/arbitrages-vivants' },
      { id: '6', type: 'risk', title: 'Risques critiques', description: 'Risques nécessitant une attention', route: '/maitre-ouvrage/alerts' },
      { id: '7', type: 'decision', title: 'Décisions en attente', description: 'Décisions nécessitant validation', route: '/maitre-ouvrage/decisions' },
      { id: '8', type: 'bureau', title: 'Bureau BMO', description: 'Vue du bureau BMO', route: '/maitre-ouvrage/arbitrages-vivants?bureau=BMO' },
      { id: '9', type: 'bureau', title: 'Bureau BF', description: 'Vue du bureau BF', route: '/maitre-ouvrage/arbitrages-vivants?bureau=BF' },
      { id: '10', type: 'action', title: 'Actions prioritaires', description: 'Actions à traiter', route: '/maitre-ouvrage/dashboard' },
    ];
  }, []);

  const filteredResults = useMemo(() => {
    if (!value.trim()) return [];

    const query = value.toLowerCase();
    return searchData.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.type === query
    );
  }, [value, searchData]);

  const suggestions = useMemo(() => {
    if (value.trim()) return [];
    return searchData.slice(0, 5);
  }, [value, searchData]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      // Sauvegarder dans l'historique
      setSearchHistory((prev) => {
        const updated = [value, ...prev.filter((h) => h !== value)].slice(0, 10);
        localStorage.setItem('bmo.search.history', JSON.stringify(updated));
        return updated;
      });

      if (result.route) {
        router.push(result.route);
      }
      if (onSelect) {
        onSelect(result);
      }
      setIsOpen(false);
      onChange('');
    },
    [value, router, onSelect, onChange]
  );

  const getTypeIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'kpi':
        return <TrendingUp className="w-3 h-3" />;
      case 'risk':
        return <AlertTriangle className="w-3 h-3" />;
      case 'decision':
        return <FileText className="w-3 h-3" />;
      case 'bureau':
        return <Search className="w-3 h-3" />;
      default:
        return <Search className="w-3 h-3" />;
    }
  };

  const getTypeColor = (type: SearchResult['type']) => {
    switch (type) {
      case 'kpi':
        return 'text-blue-400';
      case 'risk':
        return 'text-red-400';
      case 'decision':
        return 'text-purple-400';
      case 'bureau':
        return 'text-emerald-400';
      default:
        return 'text-slate-400';
    }
  };

  // Fermer quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher (KPIs, risques, décisions, bureaux...)"
          className={cn('pl-8 pr-8 transition-all', darkMode ? 'bg-slate-800/50' : 'bg-gray-50')}
          aria-label="Recherche globale"
        />
        {value && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 transition-opacity"
            aria-label="Effacer"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Dropdown de résultats */}
      {isOpen && (filteredResults.length > 0 || suggestions.length > 0 || searchHistory.length > 0) && (
        <div
          className={cn(
            'absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-50 max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200',
            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
          )}
        >
          {/* Résultats de recherche */}
          {value.trim() && filteredResults.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="text-[10px] text-slate-400 px-2 py-1">Résultats</div>
              {filteredResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    'w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors hover:bg-slate-800/50',
                    darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100'
                  )}
                >
                  <div className={cn('flex-shrink-0', getTypeColor(result.type))}>
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{result.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{result.description}</div>
                  </div>
                  <Badge variant="default" className="text-[9px]">
                    {result.type}
                  </Badge>
                </button>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {!value.trim() && suggestions.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="text-[10px] text-slate-400 px-2 py-1">Suggestions</div>
              {suggestions.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    'w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors hover:bg-slate-800/50',
                    darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100'
                  )}
                >
                  <div className={cn('flex-shrink-0', getTypeColor(result.type))}>
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{result.title}</div>
                    <div className="text-[10px] text-slate-400 truncate">{result.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Historique */}
          {!value.trim() && searchHistory.length > 0 && (
            <div className="p-2 space-y-1 border-t border-slate-700">
              <div className="text-[10px] text-slate-400 px-2 py-1 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                Historique
              </div>
              {searchHistory.slice(0, 5).map((term, idx) => (
                <button
                  key={idx}
                  onClick={() => onChange(term)}
                  className={cn(
                    'w-full text-left p-2 rounded-lg flex items-center gap-2 transition-colors hover:bg-slate-800/50 text-xs',
                    darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-100'
                  )}
                >
                  <Clock className="w-3 h-3 text-slate-400" />
                  {term}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

EnhancedSearch.displayName = 'EnhancedSearch';
