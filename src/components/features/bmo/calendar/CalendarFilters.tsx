'use client';

import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter } from 'lucide-react';
import { bureaux } from '@/lib/data';

interface CalendarFiltersProps {
  filters: {
    bureau?: string;
    project?: string;
    type?: string;
    priority?: string;
  };
  onFiltersChange: (filters: {
    bureau?: string;
    project?: string;
    type?: string;
    priority?: string;
  }) => void;
}

export function CalendarFilters({ filters, onFiltersChange }: CalendarFiltersProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();

  const eventTypes = [
    { value: 'meeting', label: 'Réunion' },
    { value: 'visio', label: 'Visio' },
    { value: 'deadline', label: 'Échéance' },
    { value: 'site', label: 'Visite terrain' },
    { value: 'intervention', label: 'Intervention' },
    { value: 'audit', label: 'Audit' },
    { value: 'formation', label: 'Formation' },
  ];

  const priorities = [
    { value: 'critical', label: 'Critique' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'Haute' },
    { value: 'normal', label: 'Normale' },
  ];

  const activeFiltersCount = Object.values(filters).filter(v => v).length;

  const clearFilters = () => {
    onFiltersChange({});
    addToast('Filtres réinitialisés', 'info');
  };

  return (
    <div className={cn(
      'p-4 rounded-lg border',
      darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <h3 className="text-sm font-semibold">Filtres de visualisation BMO</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="info" className="text-xs">{activeFiltersCount}</Badge>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Bureau */}
        <div>
          <label className="block text-xs font-semibold mb-1">Bureau</label>
          <Select
            value={filters.bureau || '__all__'}
            onValueChange={(v: string) => onFiltersChange({ ...filters, bureau: v === '__all__' ? undefined : v })}
          >
            <SelectTrigger className={cn(
              'w-full px-2 py-1.5 rounded text-xs border h-9',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-slate-200'
                : 'bg-white border-gray-300 text-gray-700'
            )}>
              <SelectValue placeholder="Bureau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tous les bureaux</SelectItem>
              {bureaux.map((b) => (
                <SelectItem key={b.code} value={b.code}>
                  {b.code} - {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type d'activité */}
        <div>
          <label className="block text-xs font-semibold mb-1">Type</label>
          <Select
            value={filters.type || '__all__'}
            onValueChange={(v: string) => onFiltersChange({ ...filters, type: v === '__all__' ? undefined : v })}
          >
            <SelectTrigger className={cn(
              'w-full px-2 py-1.5 rounded text-xs border h-9',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-slate-200'
                : 'bg-white border-gray-300 text-gray-700'
            )}>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tous les types</SelectItem>
              {eventTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priorité */}
        <div>
          <label className="block text-xs font-semibold mb-1">Priorité</label>
          <Select
            value={filters.priority || '__all__'}
            onValueChange={(v: string) => onFiltersChange({ ...filters, priority: v === '__all__' ? undefined : v })}
          >
            <SelectTrigger className={cn(
              'w-full px-2 py-1.5 rounded text-xs border h-9',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-slate-200'
                : 'bg-white border-gray-300 text-gray-700'
            )}>
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Toutes les priorités</SelectItem>
              {priorities.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Projet */}
        <div>
          <label className="block text-xs font-semibold mb-1">Projet</label>
          <input
            type="text"
            value={filters.project || ''}
            onChange={(e) => onFiltersChange({ ...filters, project: e.target.value || undefined })}
            placeholder="Filtrer par projet..."
            className={cn(
              'w-full px-2 py-1.5 rounded text-xs border',
              darkMode
                ? 'bg-slate-700 border-slate-600 text-slate-200 placeholder-slate-500'
                : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
            )}
          />
        </div>
      </div>

      {/* Badges actifs */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700/30">
          {filters.bureau && (
            <Badge variant="info" className="text-xs">
              Bureau: {filters.bureau}
              <button
                onClick={() => onFiltersChange({ ...filters, bureau: undefined })}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.type && (
            <Badge variant="info" className="text-xs">
              Type: {eventTypes.find(t => t.value === filters.type)?.label}
              <button
                onClick={() => onFiltersChange({ ...filters, type: undefined })}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="info" className="text-xs">
              Priorité: {priorities.find(p => p.value === filters.priority)?.label}
              <button
                onClick={() => onFiltersChange({ ...filters, priority: undefined })}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.project && (
            <Badge variant="info" className="text-xs">
              Projet: {filters.project}
              <button
                onClick={() => onFiltersChange({ ...filters, project: undefined })}
                className="ml-1 hover:opacity-70"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

