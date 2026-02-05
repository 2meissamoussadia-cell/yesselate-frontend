'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, Clock, TrendingUp, FileText, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { demandesRH } from '@/lib/data/bmo-mock-2';
import { employees } from '@/lib/data/bmo-mock';
import type { HRRequest } from '@/lib/types/bmo.types';

type SearchSuggestion = {
  id: string;
  type: 'demand' | 'agent' | 'bureau' | 'keyword';
  label: string;
  subtitle?: string;
  icon: typeof FileText;
  data?: HRRequest;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelectDemand?: (demandId: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export function RHSmartSearch({ 
  value, 
  onChange, 
  onSelectDemand, 
  placeholder = "Rechercher...",
  autoFocus = false
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Charger les recherches récentes depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('rh-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        logger.error('Error loading recent searches', e as Error, { context: 'RHSmartSearch' });
      }
    }
  }, []);

  // Sauvegarder une recherche
  const saveSearch = (query: string) => {
    if (query.trim().length < 2) return;
    
    const updated = [
      query,
      ...recentSearches.filter(s => s !== query)
    ].slice(0, 10);
    
    setRecentSearches(updated);
    localStorage.setItem('rh-recent-searches', JSON.stringify(updated));
  };

  // Générer les suggestions
  const suggestions = useMemo<SearchSuggestion[]>(() => {
    if (!value.trim()) {
      // Afficher les recherches récentes si pas de query
      return recentSearches.map((search, idx) => ({
        id: `recent-${idx}`,
        type: 'keyword' as const,
        label: search,
        icon: Clock,
      }));
    }

    const query = value.toLowerCase();
    const results: SearchSuggestion[] = [];

    // Recherche dans les demandes
    demandesRH.forEach(d => {
      const matches = [
        d.id.toLowerCase().includes(query),
        d.agent.toLowerCase().includes(query),
        d.bureau.toLowerCase().includes(query),
        d.type.toLowerCase().includes(query),
        d.reason.toLowerCase().includes(query),
      ].some(Boolean);

      if (matches) {
        results.push({
          id: d.id,
          type: 'demand',
          label: `${d.id} - ${d.agent}`,
          subtitle: `${d.type} • ${d.bureau} • ${d.status}`,
          icon: FileText,
          data: d,
        });
      }
    });

    // Recherche d'agents
    employees.forEach(e => {
      if (e.name.toLowerCase().includes(query)) {
        const demandsCount = demandesRH.filter(d => d.agentId === e.id).length;
        if (demandsCount > 0) {
          results.push({
            id: `agent-${e.id}`,
            type: 'agent',
            label: e.name,
            subtitle: `${e.role} • ${e.bureau} • ${demandsCount} demande(s)`,
            icon: User,
          });
        }
      }
    });

    // Recherche de bureaux
    const bureaux = [...new Set(demandesRH.map(d => d.bureau))];
    bureaux.forEach(bureau => {
      if (bureau.toLowerCase().includes(query)) {
        const demandsCount = demandesRH.filter(d => d.bureau === bureau).length;
        results.push({
          id: `bureau-${bureau}`,
          type: 'bureau',
          label: `Bureau ${bureau}`,
          subtitle: `${demandsCount} demande(s)`,
          icon: TrendingUp,
        });
      }
    });

    // Limiter à 10 résultats
    return results.slice(0, 10);
  }, [value, recentSearches]);

  // Navigation clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFocused || suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, suggestions, selectedIndex]);

  // Reset selectedIndex quand les suggestions changent
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions.length]);

  // Scroll vers l'élément sélectionné
  useEffect(() => {
    if (suggestionsRef.current && isFocused) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, isFocused]);

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'demand' && suggestion.data && onSelectDemand) {
      onSelectDemand(suggestion.data.id);
      saveSearch(value);
    } else if (suggestion.type === 'keyword') {
      onChange(suggestion.label);
      inputRef.current?.focus();
    } else {
      onChange(suggestion.label);
      saveSearch(suggestion.label);
    }
    
    setIsFocused(false);
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const showSuggestions = isFocused && suggestions.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Delay pour permettre le clic sur les suggestions
            setTimeout(() => setIsFocused(false), 200);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            "w-full pl-11 pr-10 py-3 rounded-xl border transition-all",
            "bg-white dark:bg-slate-900",
            "focus:outline-none focus:ring-2 focus:ring-orange-500/30",
            isFocused
              ? "border-orange-500 shadow-lg"
              : "border-slate-200 dark:border-slate-700"
          )}
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className={cn(
            "absolute top-full left-0 right-0 mt-2 z-50",
            "rounded-xl border border-slate-200 dark:border-slate-700",
            "bg-white dark:bg-slate-900 shadow-2xl",
            "max-h-[400px] overflow-y-auto"
          )}
        >
          <div className="p-2">
            {value.trim() && (
              <div className="px-3 py-2 text-xs text-slate-400 font-medium">
                {suggestions.length} résultat{suggestions.length > 1 ? 's' : ''}
              </div>
            )}
            
            {suggestions.map((suggestion, idx) => {
              const Icon = suggestion.icon;
              const isSelected = idx === selectedIndex;
              
              return (
                <button
                  key={suggestion.id}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-all",
                    "flex items-center gap-3",
                    isSelected
                      ? "bg-orange-500/10 border border-orange-500/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-none",
                    suggestion.type === 'demand' && "bg-blue-500/10",
                    suggestion.type === 'agent' && "bg-purple-500/10",
                    suggestion.type === 'bureau' && "bg-emerald-500/10",
                    suggestion.type === 'keyword' && "bg-slate-500/10"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      suggestion.type === 'demand' && "text-blue-500",
                      suggestion.type === 'agent' && "text-purple-500",
                      suggestion.type === 'bureau' && "text-emerald-500",
                      suggestion.type === 'keyword' && "text-slate-400"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{suggestion.label}</div>
                    {suggestion.subtitle && (
                      <div className="text-xs text-slate-400 truncate">{suggestion.subtitle}</div>
                    )}
                  </div>
                  
                  {isSelected && (
                    <div className="text-xs text-slate-400 font-mono">↵</div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400">
            💡 Utilisez ↑↓ pour naviguer, ↵ pour sélectionner
          </div>
        </div>
      )}
    </div>
  );
}

