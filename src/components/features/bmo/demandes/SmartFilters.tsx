'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Calendar } from 'lucide-react';
import { bureaux } from '@/lib/data';

interface SmartFiltersProps {
  filters: {
    bureau?: string[];
    type?: string[];
    priority?: string[];
    status?: string[];
    dateFrom?: string;
    dateTo?: string;
    amountMin?: string;
    amountMax?: string;
    project?: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function SmartFilters({ filters, onFiltersChange }: SmartFiltersProps) {
  const { darkMode } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.bureau?.length,
    filters.type?.length,
    filters.priority?.length,
    filters.status?.length,
    filters.dateFrom,
    filters.dateTo,
    filters.amountMin,
    filters.amountMax,
    filters.project,
  ].filter(Boolean).length;

  const demandTypes = ['Achat', 'Paiement', 'Validation', 'Information', 'Autre'];
  const priorities = ['urgent', 'high', 'normal'];
  const statuses = ['pending', 'validated', 'rejected'];

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = (key: 'bureau' | 'type' | 'priority' | 'status', value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    updateFilter(key, updated.length > 0 ? updated : undefined);
  };

  const clearFilters = () => {
    onFiltersChange({});
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
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
          'absolute top-full left-0 mt-2 w-[600px] z-50 shadow-xl max-h-[80vh] overflow-y-auto',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filtres intelligents
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
            {/* Bureaux */}
            <div>
              <label className="text-xs font-medium mb-2 block">Bureaux</label>
              <div className="flex flex-wrap gap-2">
                {bureaux.map(bureau => (
                  <Badge
                    key={bureau.code}
                    variant={filters.bureau?.includes(bureau.code) ? 'default' : 'gray'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('bureau', bureau.code)}
                  >
                    {bureau.code}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Types */}
            <div>
              <label className="text-xs font-medium mb-2 block">Types</label>
              <div className="flex flex-wrap gap-2">
                {demandTypes.map(type => (
                  <Badge
                    key={type}
                    variant={filters.type?.includes(type) ? 'default' : 'gray'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('type', type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Priorités */}
            <div>
              <label className="text-xs font-medium mb-2 block">Priorités</label>
              <div className="flex flex-wrap gap-2">
                {priorities.map(priority => (
                  <Badge
                    key={priority}
                    variant={filters.priority?.includes(priority) ? 'default' : 'gray'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('priority', priority)}
                  >
                    {priority}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Statuts */}
            <div>
              <label className="text-xs font-medium mb-2 block">Statuts</label>
              <div className="flex flex-wrap gap-2">
                {statuses.map(status => (
                  <Badge
                    key={status}
                    variant={filters.status?.includes(status) ? 'default' : 'gray'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayFilter('status', status)}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium mb-1.5 block flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date de début
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value || undefined)}
                  className={cn(
                    'w-full p-2 rounded text-xs',
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                  )}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Date de fin
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value || undefined)}
                  className={cn(
                    'w-full p-2 rounded text-xs',
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                  )}
                />
              </div>
            </div>

            {/* Montant */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Montant minimum</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.amountMin || ''}
                  onChange={(e) => updateFilter('amountMin', e.target.value || undefined)}
                  className={cn(
                    'w-full p-2 rounded text-xs',
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                  )}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Montant maximum</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={filters.amountMax || ''}
                  onChange={(e) => updateFilter('amountMax', e.target.value || undefined)}
                  className={cn(
                    'w-full p-2 rounded text-xs',
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                  )}
                />
              </div>
            </div>

            {/* Projet */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">Projet</label>
              <input
                type="text"
                placeholder="PRJ-..."
                value={filters.project || ''}
                onChange={(e) => updateFilter('project', e.target.value || undefined)}
                className={cn(
                  'w-full p-2 rounded text-xs',
                  darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                )}
              />
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

