'use client';

import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter } from 'lucide-react';

interface AlertFiltersProps {
  filters: {
    severity?: string;
    type?: string;
    bureau?: string;
    period?: string;
  };
  onFilterChange: (key: string, value: string | undefined) => void;
  onReset: () => void;
  alertCounts: {
    critical: number;
    warning: number;
    success: number;
    total: number;
  };
}

export function AlertFilters({
  filters,
  onFilterChange,
  onReset,
  alertCounts,
}: AlertFiltersProps) {
  const { darkMode } = useAppStore();
  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);

  return (
    <div
      className={cn(
        'p-3 rounded-lg border',
        darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold">Filtres</span>
          {hasActiveFilters && (
            <Badge variant="default" className="text-[9px]">
              {Object.values(filters).filter((v) => v !== undefined).length}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            size="xs"
            variant="ghost"
            onClick={onReset}
            className="text-[10px] h-5"
          >
            <X className="w-3 h-3 mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {/* Filtre Sévérité */}
        <div>
          <label className="text-[10px] text-slate-400 mb-1 block">Sévérité</label>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() =>
                onFilterChange('severity', filters.severity === 'critical' ? undefined : 'critical')
              }
              className={cn(
                'px-2 py-1 rounded text-[9px] font-medium transition-colors',
                filters.severity === 'critical'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : darkMode
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100',
                'border'
              )}
            >
              🚨 {alertCounts.critical}
            </button>
            <button
              onClick={() =>
                onFilterChange('severity', filters.severity === 'warning' ? undefined : 'warning')
              }
              className={cn(
                'px-2 py-1 rounded text-[9px] font-medium transition-colors',
                filters.severity === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : darkMode
                  ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                  : 'bg-white text-gray-600 hover:bg-gray-100',
                'border'
              )}
            >
              ⚠️ {alertCounts.warning}
            </button>
          </div>
        </div>

        {/* Filtre Type */}
        <div>
          <label className="text-[10px] text-slate-400 mb-1 block">Type</label>
          <Select
            value={filters.type || '__all__'}
            onValueChange={(v) => onFilterChange('type', v === '__all__' ? undefined : v)}
          >
            <SelectTrigger className={cn(
              'w-full px-2 py-1 rounded text-[9px] border h-8',
              darkMode
                ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                : 'bg-white border-gray-300 text-gray-700'
            )}>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tous</SelectItem>
              <SelectItem value="system">Système</SelectItem>
              <SelectItem value="blocked">Bloqués</SelectItem>
              <SelectItem value="payment">Paiements</SelectItem>
              <SelectItem value="contract">Contrats</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtre Bureau */}
        <div>
          <label className="text-[10px] text-slate-400 mb-1 block">Bureau</label>
          <Select
            value={filters.bureau || '__all__'}
            onValueChange={(v) => onFilterChange('bureau', v === '__all__' ? undefined : v)}
          >
            <SelectTrigger className={cn(
              'w-full px-2 py-1 rounded text-[9px] border h-8',
              darkMode
                ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                : 'bg-white border-gray-300 text-gray-700'
            )}>
              <SelectValue placeholder="Bureau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Tous</SelectItem>
              <SelectItem value="BMO">BMO</SelectItem>
              <SelectItem value="BF">BF</SelectItem>
              <SelectItem value="BM">BM</SelectItem>
              <SelectItem value="BCT">BCT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtre Période */}
        <div>
          <label className="text-[10px] text-slate-400 mb-1 block">Période</label>
          <Select
            value={filters.period || '__all__'}
            onValueChange={(v) => onFilterChange('period', v === '__all__' ? undefined : v)}
          >
            <SelectTrigger className={cn(
              'w-full px-2 py-1 rounded text-[9px] border h-8',
              darkMode
                ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                : 'bg-white border-gray-300 text-gray-700'
            )}>
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Toutes</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="week">7 derniers jours</SelectItem>
              <SelectItem value="month">30 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

