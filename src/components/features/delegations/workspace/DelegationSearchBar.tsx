'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, X, Loader2, FileText, User, Activity } from 'lucide-react';

interface SearchResult {
  type: 'event' | 'usage' | 'actor';
  id: string;
  title: string;
  subtitle: string;
  date?: Date | string;
}

interface SearchResponse {
  query: string;
  results: {
    events: SearchResult[];
    usages: SearchResult[];
    actors: SearchResult[];
  };
  counts: {
    events: number;
    usages: number;
    actors: number;
    total: number;
  };
}

interface Props {
  delegationId: string;
  onResultClick?: (result: SearchResult) => void;
  className?: string;
}

export function DelegationSearchBar({ delegationId, onResultClick, className }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/delegations/${encodeURIComponent(delegationId)}/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (res.ok) {
        setResults(await res.json());
      }
    } catch (e) {
      console.error('Erreur recherche:', e);
    } finally {
      setLoading(false);
    }
  }, [delegationId]);

  useEffect(() => {
    if (query.length >= 2) {
      const timeout = setTimeout(() => search(query), 300);
      return () => clearTimeout(timeout);
    } else {
      setResults(null);
    }
  }, [query, search]);

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);
    setOpen(false);
    setQuery('');
  };

  const allResults = results ? [
    ...results.results.events,
    ...results.results.usages,
    ...results.results.actors,
  ] : [];

  return (
    <div className={cn('relative', className)}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher dans la délégation..."
          className={cn(
            'w-full pl-10 pr-10 py-2 rounded-xl border border-slate-200/70',
            'bg-white/90 dark:bg-slate-800/90 dark:border-slate-700',
            'text-sm outline-none focus:ring-2 focus:ring-blue-500/30',
            'placeholder:text-slate-400'
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && (query.length >= 2 || results) && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full mt-2 w-full z-20 rounded-xl border border-slate-200/70 bg-white dark:bg-slate-800 dark:border-slate-700 shadow-lg max-h-[400px] overflow-auto">
            {loading ? (
              <div className="p-4 flex items-center justify-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Recherche...
              </div>
            ) : results && allResults.length > 0 ? (
              <>
                {/* Summary */}
                <div className="p-3 border-b border-slate-200/70 dark:border-slate-700 text-xs text-slate-400">
                  {results.counts.total} résultat{results.counts.total > 1 ? 's' : ''} 
                  {' '}({results.counts.events} événements, {results.counts.usages} usages, {results.counts.actors} acteurs)
                </div>

                {/* Results */}
                <div className="divide-y divide-slate-200/50 dark:divide-slate-700/50">
                  {allResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {result.type === 'event' && <Activity className="w-4 h-4 text-blue-500 flex-none mt-0.5" />}
                        {result.type === 'usage' && <FileText className="w-4 h-4 text-emerald-500 flex-none mt-0.5" />}
                        {result.type === 'actor' && <User className="w-4 h-4 text-purple-500 flex-none mt-0.5" />}
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{result.title}</div>
                          <div className="text-xs text-slate-400 truncate">{result.subtitle}</div>
                          {result.date && (
                            <div className="text-xs text-slate-400 mt-0.5">
                              {new Date(result.date).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-sm text-slate-400">
                Aucun résultat pour &quot;{query}&quot;
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}

