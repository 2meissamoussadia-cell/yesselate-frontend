'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import type { Demand } from '@/lib/types/bmo.types';

interface IntelligentSearchProps {
  demands: Demand[];
  onSelect: (demandId: string) => void;
  onFilterChange?: (query: string) => void;
}

export function IntelligentSearch({ demands, onSelect, onFilterChange }: IntelligentSearchProps) {
  const { darkMode } = useAppStore();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];

    const lowerQuery = query.toLowerCase();
    
    return demands
      .filter(d => {
        const matchesId = d.id.toLowerCase().includes(lowerQuery);
        const matchesSubject = d.subject.toLowerCase().includes(lowerQuery);
        const matchesBureau = d.bureau.toLowerCase().includes(lowerQuery);
        const matchesType = d.type.toLowerCase().includes(lowerQuery);
        return matchesId || matchesSubject || matchesBureau || matchesType;
      })
      .slice(0, 8);
  }, [query, demands]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length >= 2);
    onFilterChange?.(value);
  };

  const handleSelect = (demandId: string) => {
    onSelect(demandId);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative flex-1 max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          type="text"
          placeholder="🔍 Rechercher par code, bureau, type, mot-clé..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className={cn(
            'pl-10 pr-10',
            darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          )}
        />
        {query && (
          <button
            onClick={() => handleQueryChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Résultats de recherche */}
      {isOpen && results.length > 0 && (
        <Card className={cn(
          'absolute top-full left-0 right-0 mt-2 z-50 shadow-xl max-h-96 overflow-y-auto',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        )}>
          <CardContent className="p-2">
            <div className="space-y-1">
              {results.map((demand) => (
                <div
                  key={demand.id}
                  onClick={() => handleSelect(demand.id)}
                  className={cn(
                    'p-2 rounded-lg cursor-pointer transition-colors hover:bg-orange-500/10',
                    darkMode ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-orange-400">{demand.id}</span>
                        <Badge variant={demand.priority === 'urgent' ? 'urgent' : demand.priority === 'high' ? 'warning' : 'default'}>
                          {demand.priority}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{demand.subject}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span>{demand.bureau}</span>
                        <span>•</span>
                        <span>{demand.type}</span>
                      </div>
                    </div>
                    <span className="text-xs text-amber-400 font-semibold ml-2">{demand.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overlay pour fermer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

