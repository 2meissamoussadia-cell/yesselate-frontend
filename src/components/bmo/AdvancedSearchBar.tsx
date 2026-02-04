'use client';

/**
 * AdvancedSearchBar — Barre de recherche omnisciente (Ctrl+K)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useSearchStore, type SearchResult, type SearchableEntityType } from '@/lib/search/advanced-search-engine';
import { Search, X, Clock, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/cn';

const TYPE_LABELS: Record<SearchableEntityType, string> = {
  alert: 'Alerte',
  demande: 'Demande',
  validation: 'Validation',
  chantier: 'Chantier',
  document: 'Document',
  user: 'Utilisateur',
};

const TYPE_COLORS: Record<SearchableEntityType, string> = {
  alert: 'text-red-600 bg-red-50 dark:bg-red-950/50',
  demande: 'text-blue-600 bg-blue-50 dark:bg-blue-950/50',
  validation: 'text-green-600 bg-green-50 dark:bg-green-950/50',
  chantier: 'text-orange-600 bg-orange-50 dark:bg-orange-950/50',
  document: 'text-purple-600 bg-purple-50 dark:bg-purple-950/50',
  user: 'text-slate-600 bg-slate-50 dark:bg-slate-800/50',
};

export function AdvancedSearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    search,
    results,
    isSearching,
    recentSearches,
    filters,
    clearSearch,
  } = useSearchStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.trim()) {
      search(q, filters);
      setIsOpen(true);
    } else {
      clearSearch();
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    if (result.item.href && typeof window !== 'undefined') {
      window.location.href = result.item.href;
    }
    setIsOpen(false);
    setQuery('');
    clearSearch();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher alertes, chantiers, documents... (Ctrl+K)"
            className="pl-10 pr-20 h-10"
            onFocus={() => setIsOpen(true)}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => {
                  setQuery('');
                  clearSearch();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <kbd className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0" align="start">
        <div className="max-h-[500px] overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Recherche en cours...
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((result) => (
                <SearchResultItem
                  key={result.item.id}
                  result={result}
                  onSelect={handleSelectResult}
                />
              ))}
            </div>
          ) : query ? (
            <div className="p-4 text-center text-sm text-slate-500">
              Aucun résultat trouvé
            </div>
          ) : (
            <div className="p-3">
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Recherches récentes
                    </span>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((q, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSearch(q)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Suggestions
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['alertes critiques', 'chantiers en retard', 'validations en attente'].map(
                    (label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => handleSearch(label)}
                        className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full"
                      >
                        {label}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SearchResultItem({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: (r: SearchResult) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded',
                TYPE_COLORS[result.item.type]
              )}
            >
              {TYPE_LABELS[result.item.type]}
            </span>
            <span className="text-xs text-slate-500">
              {new Date(result.item.createdAt).toLocaleDateString('fr-FR')}
            </span>
          </div>
          <h4 className="font-medium text-sm mb-1 line-clamp-1">{result.item.title}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {result.item.content || '—'}
          </p>
          {result.item.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {result.item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
