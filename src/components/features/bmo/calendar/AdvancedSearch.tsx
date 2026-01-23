'use client';

import { useState, useMemo } from 'react';
import { Search, X, Filter, Calendar, Tag, Users, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CalendarEvent } from '@/lib/types/bmo.types';
import { bureaux } from '@/lib/data';

interface AdvancedSearchProps {
  activities: CalendarEvent[];
  onSelectActivity: (activityId: string) => void;
  onFilterChange?: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  query: string;
  bureau?: string;
  type?: string;
  priority?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  participants?: string[];
}

export function AdvancedSearch({ activities, onSelectActivity, onFilterChange }: AdvancedSearchProps) {
  const { darkMode } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ query: '' });

  const filteredActivities = useMemo(() => {
    let results = [...activities];

    // Recherche textuelle
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(a =>
        a.title?.toLowerCase().includes(query) ||
        (a as any).description?.toLowerCase().includes(query) ||
        a.project?.toLowerCase().includes(query) ||
        a.location?.toLowerCase().includes(query)
      );
    }

    // Filtre bureau
    if (filters.bureau) {
      results = results.filter(a => a.bureau === filters.bureau);
    }

    // Filtre type
    if (filters.type) {
      results = results.filter(a => a.type === filters.type);
    }

    // Filtre priorité
    if (filters.priority) {
      results = results.filter(a => a.priority === filters.priority);
    }

    // Filtre date
    if (filters.dateRange?.start && filters.dateRange?.end) {
      results = results.filter(a => {
        const activityDate = new Date(a.date);
        const start = new Date(filters.dateRange!.start);
        const end = new Date(filters.dateRange!.end);
        return activityDate >= start && activityDate <= end;
      });
    }

    return results;
  }, [activities, filters]);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange?.(updated);
  };

  const clearFilters = () => {
    setFilters({ query: '' });
    onFilterChange?.({ query: '' });
  };

  return (
    <div className="relative">
      {/* Bouton de recherche */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'gap-2',
          isOpen && 'bg-orange-500/10 text-orange-400'
        )}
      >
        <Search className="w-4 h-4" />
        Recherche avancée
        {Object.values(filters).some(v => v && (typeof v !== 'string' || v !== '')) && (
          <Badge variant="default" className="ml-1">
            {filteredActivities.length}
          </Badge>
        )}
      </Button>

      {/* Panneau de recherche */}
      {isOpen && (
        <Card className={cn(
          'absolute top-full right-0 mt-2 w-[600px] z-50 shadow-xl',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Search className="w-4 h-4" />
                Recherche avancée
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
            {/* Recherche textuelle */}
            <div>
              <label className="text-xs font-medium mb-1.5 block">Recherche</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Titre, description, projet, lieu..."
                  value={filters.query}
                  onChange={(e) => updateFilters({ query: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Filtres rapides */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-medium mb-1.5 block flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Bureau
                </label>
                <select
                  value={filters.bureau || ''}
                  onChange={(e) => updateFilters({ bureau: e.target.value || undefined })}
                  className={cn(
                    'w-full text-xs px-2 py-1.5 rounded border',
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                  )}
                >
                  <option value="">Tous</option>
                  {bureaux.map(b => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Type
                </label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => updateFilters({ type: e.target.value || undefined })}
                  className={cn(
                    'w-full text-xs px-2 py-1.5 rounded border',
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                  )}
                >
                  <option value="">Tous</option>
                  <option value="meeting">Réunion</option>
                  <option value="visio">Visio</option>
                  <option value="deadline">Échéance</option>
                  <option value="site">Visite terrain</option>
                  <option value="delivery">Livraison</option>
                  <option value="legal">Juridique</option>
                  <option value="training">Formation</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Priorité
                </label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => updateFilters({ priority: e.target.value || undefined })}
                  className={cn(
                    'w-full text-xs px-2 py-1.5 rounded border',
                    darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                  )}
                >
                  <option value="">Toutes</option>
                  <option value="critical">Critique</option>
                  <option value="urgent">Urgente</option>
                  <option value="high">Haute</option>
                  <option value="normal">Normale</option>
                  <option value="low">Basse</option>
                </select>
              </div>
            </div>

            {/* Plage de dates */}
            <div>
              <label className="text-xs font-medium mb-1.5 block flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Plage de dates
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) => updateFilters({
                    dateRange: {
                      start: e.target.value,
                      end: filters.dateRange?.end || e.target.value
                    }
                  })}
                  className="text-xs"
                />
                <Input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) => updateFilters({
                    dateRange: {
                      start: filters.dateRange?.start || e.target.value,
                      end: e.target.value
                    }
                  })}
                  className="text-xs"
                />
              </div>
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
                {filteredActivities.length} résultat{filteredActivities.length > 1 ? 's' : ''}
              </Badge>
            </div>

            {/* Résultats */}
            {filters.query || filters.bureau || filters.type || filters.priority ? (
              <div className="max-h-60 overflow-y-auto space-y-1 border-t border-slate-700/50 pt-2">
                {filteredActivities.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">Aucun résultat</p>
                ) : (
                  filteredActivities.slice(0, 10).map(activity => (
                    <div
                      key={activity.id}
                      onClick={() => {
                        onSelectActivity(activity.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'p-2 rounded text-xs cursor-pointer transition-colors',
                        darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-100'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{activity.title}</span>
                        <Badge variant={activity.priority === 'critical' || activity.priority === 'urgent' ? 'urgent' : 'default'} className="text-[9px]">
                          {activity.priority}
                        </Badge>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {activity.date} • {activity.time} • {activity.bureau}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

