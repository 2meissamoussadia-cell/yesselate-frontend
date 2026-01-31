/**
 * Recherche Avancée avec Autocomplétion
 * Permet de rechercher dans tous les éléments analytics avec suggestions intelligentes
 */

'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, X, Command, TrendingUp, Building2, DollarSign, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/application/hooks/useDebounce';
import { highlightMatch } from '@/application/utils/searchUtils';
import { searchAnalytics, type SearchResult as ServiceSearchResult } from '@/lib/services/analyticsSearchService';

interface SearchResult {
  id: string;
  type: 'domain' | 'module' | 'submodule' | 'element' | 'kpi' | 'alert';
  label: string;
  description?: string;
  path: string[];
  score: number;
  matches: Array<{ field: string; positions: number[] }>;
  domainId?: string;
  moduleId?: string;
  subModuleId?: string;
}

interface BTPAdvancedSearchProps {
  onSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

// Hook pour la recherche
const searchableItems: Omit<SearchResult, 'score' | 'matches'>[] = [
  {
    id: 'chantiers',
    type: 'domain',
    label: 'Gestion de Chantiers',
    description: 'Analyse complète des chantiers, lots, avancement et performance',
    path: ['Chantiers'],
  },
  {
    id: 'financier',
    type: 'domain',
    label: 'Gestion Financière',
    description: 'Analyse budgétaire, coûts, marges, trésorerie',
    path: ['Financier'],
  },
  {
    id: 'chantier-1',
    type: 'element',
    label: 'Chantier Centre Commercial',
    description: 'Chantier en cours à Paris',
    path: ['Chantiers', 'Suivi de Chantiers'],
  },
  {
    id: 'kpi-avancement',
    type: 'kpi',
    label: 'Taux d\'avancement',
    description: 'KPI de suivi d\'avancement des chantiers',
    path: ['Chantiers', 'KPIs'],
  },
];

export function BTPAdvancedSearch({
  onSelect,
  placeholder = 'Rechercher... (⌘K)',
  className,
}: BTPAdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // Utiliser l'API de recherche si disponible, sinon fallback sur recherche locale
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setApiResults([]);
      return;
    }

    setIsLoading(true);

    // Essayer d'abord l'API si disponible
    fetch('/api/analytics/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: debouncedQuery, limit: 10 }),
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('API not available');
      })
      .then((data) => {
        if (data.results) {
          // Transformer les résultats de l'API en format SearchResult
          const transformedResults: SearchResult[] = data.results.map((r: any) => ({
            id: r.id,
            type: r.type,
            label: r.label,
            description: r.description,
            path: r.path || (r.domainId ? [r.domainId, r.moduleId].filter(Boolean) : []),
            score: r.score || 0,
            matches: r.matches || [],
            domainId: r.domainId,
            moduleId: r.moduleId,
          }));
          setApiResults(transformedResults);
        } else {
          // Fallback sur recherche locale
          const localResults = searchAnalytics(debouncedQuery, { limit: 10 });
          setApiResults(localResults);
        }
      })
      .catch(() => {
        // Fallback sur recherche locale en cas d'erreur
        const localResults = searchAnalytics(debouncedQuery, { limit: 10 });
        setApiResults(localResults);
      })
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  const results = useMemo<SearchResult[]>(() => {
    if (!debouncedQuery.trim()) {
      return [];
    }
    return apiResults;
  }, [apiResults, debouncedQuery]);

  // Gestion du raccourci clavier ⌘K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation au clavier
  useEffect(() => {
    if (!isOpen || results.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Scroll vers l'élément sélectionné
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (result: SearchResult) => {
    onSelect?.(result);
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'domain':
        return <Building2 className="h-4 w-4" />;
      case 'module':
        return <TrendingUp className="h-4 w-4" />;
      case 'element':
        return <Building2 className="h-4 w-4" />;
      case 'kpi':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'domain':
        return 'text-blue-400';
      case 'module':
        return 'text-emerald-400';
      case 'element':
        return 'text-amber-400';
      case 'kpi':
        return 'text-purple-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Input de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-9 pr-20 bg-slate-900/50 border-slate-700 text-slate-300 placeholder:text-slate-400 focus:border-blue-500"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
              }}
              className="p-1 rounded hover:bg-slate-700"
            >
              <X className="h-3 w-3 text-slate-400" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-700 bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-400">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      {/* Résultats */}
      {isOpen && (query.trim() || results.length > 0 || isLoading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-slate-400">Recherche en cours...</p>
            </div>
          ) : results.length > 0 ? (
            <div ref={resultsRef} className="p-2">
              {results.map((result, index) => (
                <div
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    index === selectedIndex
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : 'hover:bg-slate-800/50 border border-transparent'
                  )}
                >
                  <div className={cn('flex-shrink-0 mt-0.5', getTypeColor(result.type))}>
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-sm font-medium text-slate-200"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(result.label, debouncedQuery),
                        }}
                      />
                      <Badge variant="default" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                    {result.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {result.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      {result.path.map((segment, idx) => (
                        <React.Fragment key={idx}>
                          <span className="text-xs text-slate-400">{segment}</span>
                          {idx < result.path.length - 1 && (
                            <span className="text-xs text-slate-600">/</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant="default" className="text-xs">
                      {Math.round(result.score)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center">
              <Search className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Aucun résultat trouvé</p>
              <p className="text-xs text-slate-400 mt-1">Essayez avec d'autres mots-clés</p>
            </div>
          ) : (
            <div className="p-4">
              <p className="text-xs text-slate-400 mb-2">Suggestions rapides :</p>
              <div className="space-y-1">
                {['Chantiers', 'Financier', 'Ressources Humaines'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setQuery(suggestion);
                      setSelectedIndex(0);
                    }}
                    className="w-full text-left px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

