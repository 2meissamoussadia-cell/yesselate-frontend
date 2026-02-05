'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Save, Filter } from 'lucide-react';

interface SavedView {
  id: string;
  name: string;
  filters: {
    period?: string;
    bureaux?: string[];
    search?: string;
  };
}

interface AdvancedFiltersProps {
  period: string;
  onPeriodChange: (period: string) => void;
  bureaux: string[];
  selectedBureaux: string[];
  onBureauxChange: (bureaux: string[]) => void;
  search: string;
  onSearchChange: (search: string) => void;
  savedViews?: SavedView[];
  onSaveView?: (name: string) => void;
  onLoadView?: (view: SavedView) => void;
  className?: string;
}

export function AdvancedFilters({
  period,
  onPeriodChange,
  bureaux,
  selectedBureaux,
  onBureauxChange,
  search,
  onSearchChange,
  savedViews = [],
  onSaveView,
  onLoadView,
  className,
}: AdvancedFiltersProps) {
  const { darkMode } = useAppStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewName, setViewName] = useState('');

  const handleToggleBureau = useCallback(
    (bureau: string) => {
      if (selectedBureaux.includes(bureau)) {
        onBureauxChange(selectedBureaux.filter((b) => b !== bureau));
      } else {
        onBureauxChange([...selectedBureaux, bureau]);
      }
    },
    [selectedBureaux, onBureauxChange]
  );

  const handleSave = useCallback(() => {
    if (viewName.trim() && onSaveView) {
      onSaveView(viewName.trim());
      setViewName('');
    }
  }, [viewName, onSaveView]);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs"
        >
          <Filter className="w-3 h-3 mr-1" />
          Filtres avancés
        </Button>
        {selectedBureaux.length > 0 && (
          <Badge variant="info" className="text-[9px]">
            {selectedBureaux.length} bureau{selectedBureaux.length > 1 ? 'x' : ''}
          </Badge>
        )}
      </div>

      {isExpanded && (
        <div
          className={cn(
            'rounded-lg border p-3 space-y-3',
            darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-gray-200'
          )}
        >
          {/* Période */}
          <div>
            <label className={cn('text-xs font-semibold mb-1 block', darkMode ? 'text-slate-300' : 'text-gray-700')}>
              Période
            </label>
            <div className="flex gap-1">
              {['month', 'quarter', 'year'].map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={period === p ? 'warning' : 'ghost'}
                  onClick={() => onPeriodChange(p)}
                  className="text-xs capitalize"
                >
                  {p === 'month' ? 'Mois' : p === 'quarter' ? 'Trimestre' : 'Année'}
                </Button>
              ))}
            </div>
          </div>

          {/* Bureaux */}
          <div>
            <label className={cn('text-xs font-semibold mb-1 block', darkMode ? 'text-slate-300' : 'text-gray-700')}>
              Bureaux ({selectedBureaux.length}/{bureaux.length})
            </label>
            <div className="flex flex-wrap gap-1">
              {bureaux.map((bureau) => {
                const isSelected = selectedBureaux.includes(bureau);
                return (
                  <Button
                    key={bureau}
                    size="sm"
                    variant={isSelected ? 'warning' : 'ghost'}
                    onClick={() => handleToggleBureau(bureau)}
                    className="text-xs"
                  >
                    {bureau}
                  </Button>
                );
              })}
              {selectedBureaux.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onBureauxChange([])}
                  className="text-xs"
                >
                  <X className="w-3 h-3" />
                  Tout effacer
                </Button>
              )}
            </div>
          </div>

          {/* Vues sauvegardées */}
          {savedViews.length > 0 && (
            <div>
              <label className={cn('text-xs font-semibold mb-1 block', darkMode ? 'text-slate-300' : 'text-gray-700')}>
                Vues sauvegardées
              </label>
              <div className="flex flex-wrap gap-1">
                {savedViews.map((view) => (
                  <Badge
                    key={view.id}
                    variant="info"
                    className="text-[9px] cursor-pointer hover:opacity-80"
                    onClick={() => onLoadView?.(view)}
                  >
                    {view.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sauvegarder vue */}
          {onSaveView && (
            <div>
              <label className={cn('text-xs font-semibold mb-1 block', darkMode ? 'text-slate-300' : 'text-gray-700')}>
                Sauvegarder cette vue
              </label>
              <div className="flex gap-1">
                <Input
                  value={viewName}
                  onChange={(e) => setViewName(e.target.value)}
                  placeholder="Nom de la vue..."
                  className="text-xs flex-1"
                />
                <Button size="sm" variant="secondary" onClick={handleSave} className="text-xs">
                  <Save className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

