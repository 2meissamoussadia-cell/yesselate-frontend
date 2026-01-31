'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar } from 'lucide-react';
import { bureaux } from '@/lib/data';

interface AdvancedFiltersProps {
  filters: {
    period?: 'month' | 'quarter' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
    bureaux?: string[];
    type?: string;
    minDemandes?: number;
    maxTauxRejet?: number;
    minTauxValidation?: number;
  };
  onFiltersChange: (filters: any) => void;
}

export function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const { darkMode } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const activeFiltersCount = [
    filters.period,
    filters.startDate,
    filters.endDate,
    filters.bureaux?.length,
    filters.type,
    Number.isFinite(filters.minDemandes) ? filters.minDemandes : null,
    Number.isFinite(filters.maxTauxRejet) ? filters.maxTauxRejet : null,
    Number.isFinite(filters.minTauxValidation) ? filters.minTauxValidation : null,
  ].filter(Boolean).length;

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setIsOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="default"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={cn(
          'gap-2',
          activeFiltersCount > 0 && 'bg-orange-500/10 border-orange-500/50'
        )}
      >
        <Filter className="w-4 h-4" />
        Filtres avancés
        {activeFiltersCount > 0 && (
          <Badge variant="default" className="ml-1">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className={cn(
          'absolute top-full left-0 mt-2 w-[500px] z-50 shadow-xl',
          'bg-slate-800 border-slate-700'
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres avancés
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Période */}
            <div>
              <label className="text-xs font-medium mb-1.5 block flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Période
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['month', 'quarter', 'year', 'custom'].map(period => (
                  <Button
                    key={period}
                    size="sm"
                    variant={filters.period === period ? 'default' : 'ghost'}
                    onClick={() => updateFilter('period', period)}
                    className="text-xs"
                  >
                    {period === 'month' ? 'Mois' : 
                     period === 'quarter' ? 'Trimestre' :
                     period === 'year' ? 'Année' : 'Personnalisée'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Dates personnalisées */}
            {filters.period === 'custom' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Date de début</label>
                  <input
                    type="date"
                    value={filters.startDate || ''}
                    onChange={(e) => updateFilter('startDate', e.target.value)}
                    className={cn(
                      'w-full p-2 rounded text-xs border',
                      'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                    )}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Date de fin</label>
                  <input
                    type="date"
                    value={filters.endDate || ''}
                    onChange={(e) => updateFilter('endDate', e.target.value)}
                    className={cn(
                      'w-full p-2 rounded text-xs border',
                      'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                    )}
                  />
                </div>
              </div>
            )}

            {/* Bureaux */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">Bureaux</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded">
                {bureaux.map(bureau => (
                  <Badge
                    key={bureau.code}
                    variant={filters.bureaux?.includes(bureau.code) ? 'default' : 'gray'}
                    className="cursor-pointer"
                    onClick={() => {
                      const current = filters.bureaux || [];
                      if (current.includes(bureau.code)) {
                        updateFilter('bureaux', current.filter(b => b !== bureau.code));
                      } else {
                        updateFilter('bureaux', [...current, bureau.code]);
                      }
                    }}
                  >
                    {bureau.code}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Seuils */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">Seuils (qualité)</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Min demandes</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={Number.isFinite(filters.minDemandes) ? String(filters.minDemandes) : ''}
                    onChange={(e) => updateFilter('minDemandes', e.target.value === '' ? undefined : Number(e.target.value))}
                    className={cn(
                      'w-full p-2 rounded text-xs border',
                      'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                    )}
                    placeholder="ex: 50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Max taux rejet %</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    value={Number.isFinite(filters.maxTauxRejet) ? String(filters.maxTauxRejet) : ''}
                    onChange={(e) => updateFilter('maxTauxRejet', e.target.value === '' ? undefined : Number(e.target.value))}
                    className={cn(
                      'w-full p-2 rounded text-xs border',
                      'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                    )}
                    placeholder="ex: 20"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 mb-1 block">Min taux validation %</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    value={Number.isFinite(filters.minTauxValidation) ? String(filters.minTauxValidation) : ''}
                    onChange={(e) => updateFilter('minTauxValidation', e.target.value === '' ? undefined : Number(e.target.value))}
                    className={cn(
                      'w-full p-2 rounded text-xs border',
                      'bg-slate-700 border-slate-600 text-white placeholder:text-slate-400'
                    )}
                    placeholder="ex: 80"
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                Les seuils s'appliquent aux données après filtres période/bureaux.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Réinitialiser
              </Button>
              <Badge variant="info">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} actif{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

