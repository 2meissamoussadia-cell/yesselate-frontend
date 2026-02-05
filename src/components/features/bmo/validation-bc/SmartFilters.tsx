'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bureaux } from '@/lib/data';

interface SmartFiltersProps {
  filters: {
    bureau?: string[];
    type?: string[];
    supplier?: string[];
    priority?: string[];
    status?: string[];
    project?: string[];
    minAmount?: number;
    maxAmount?: number;
    dateFrom?: string;
    dateTo?: string;
  };
  onFiltersChange: (filters: any) => void;
}

export function SmartFilters({ filters, onFiltersChange }: SmartFiltersProps) {
  const hasActiveFilters = Object.values(filters).some(
    value => value !== undefined && 
    (Array.isArray(value) ? value.length > 0 : value !== '')
  );

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof typeof filters];
    onFiltersChange(newFilters);
  };

  const resetFilters = () => {
    onFiltersChange({});
  };

  const supplierOptions = ['Fournisseur A', 'Fournisseur B', 'Fournisseur C', 'Autre'];
  const typeOptions = ['BC Standard', 'BC Urgent', 'BC Framework', 'Autre'];
  const priorityOptions = ['urgent', 'high', 'normal', 'low'];
  const statusOptions = ['pending', 'validated', 'rejected'];

  return (
    <Card className="border-slate-700/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold">Filtres intelligents</span>
            {hasActiveFilters && (
              <Badge variant="info" className="text-xs">
                {Object.values(filters).filter(v => 
                  v !== undefined && (Array.isArray(v) ? v.length > 0 : v !== '')
                ).length} actif(s)
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              size="xs"
              variant="ghost"
              onClick={resetFilters}
              className="text-xs"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Réinitialiser
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Bureau */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Bureau</label>
            <Select
              value={filters.bureau?.[0] || '__all__'}
              onValueChange={(value: string) => {
                if (value && value !== '__all__') {
                  updateFilter('bureau', [value]);
                } else {
                  removeFilter('bureau');
                }
              }}
            >
              <SelectTrigger className={cn(
                'w-full px-2 py-1.5 text-xs rounded border h-9',
                'bg-slate-800 border-slate-700 text-slate-300'
              )}>
                <SelectValue placeholder="Bureau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tous les bureaux</SelectItem>
                {bureaux.map(b => (
                  <SelectItem key={b.code} value={b.code}>{b.code} - {b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.bureau && filters.bureau.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {filters.bureau.map(bureau => (
                  <Badge key={bureau} variant="default" className="text-[10px]">
                    {bureau}
                    <button
                      onClick={() => updateFilter('bureau', filters.bureau?.filter(b => b !== bureau))}
                      className="ml-1"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Priorité */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Priorité</label>
            <Select
              value={filters.priority?.[0] || '__all__'}
              onValueChange={(value: string) => {
                if (value && value !== '__all__') {
                  updateFilter('priority', [value]);
                } else {
                  removeFilter('priority');
                }
              }}
            >
              <SelectTrigger className={cn(
                'w-full px-2 py-1.5 text-xs rounded border h-9',
                'bg-slate-800 border-slate-700 text-slate-300'
              )}>
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Toutes les priorités</SelectItem>
                {priorityOptions.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statut */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Statut</label>
            <Select
              value={filters.status?.[0] || '__all__'}
              onValueChange={(value: string) => {
                if (value && value !== '__all__') {
                  updateFilter('status', [value]);
                } else {
                  removeFilter('status');
                }
              }}
            >
              <SelectTrigger className={cn(
                'w-full px-2 py-1.5 text-xs rounded border h-9',
                'bg-slate-800 border-slate-700 text-slate-300'
              )}>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">Tous les statuts</SelectItem>
                {statusOptions.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fournisseur */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Fournisseur</label>
            <input
              type="text"
              value={filters.supplier?.[0] || ''}
              onChange={(e) => {
                if (e.target.value) {
                  updateFilter('supplier', [e.target.value]);
                } else {
                  removeFilter('supplier');
                }
              }}
              placeholder="Rechercher..."
              className={cn(
                'w-full px-2 py-1.5 text-xs rounded border',
                'bg-slate-800 border-slate-700 text-slate-300'
              )}
            />
          </div>

          {/* Montant min */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Montant min (FCFA)</label>
            <input
              type="number"
              value={filters.minAmount || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                if (value) {
                  updateFilter('minAmount', value);
                } else {
                  removeFilter('minAmount');
                }
              }}
              placeholder="0"
              className={cn(
                'w-full px-2 py-1.5 text-xs rounded border',
                'bg-slate-800 border-slate-700 text-slate-300'
              )}
            />
          </div>

          {/* Montant max */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Montant max (FCFA)</label>
            <input
              type="number"
              value={filters.maxAmount || ''}
              onChange={(e) => {
                const value = e.target.value ? parseFloat(e.target.value) : undefined;
                if (value) {
                  updateFilter('maxAmount', value);
                } else {
                  removeFilter('maxAmount');
                }
              }}
              placeholder="∞"
              className={cn(
                'w-full px-2 py-1.5 text-xs rounded border',
                'bg-slate-800 border-slate-700 text-slate-300'
              )}
            />
          </div>

          {/* Date de */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Date de</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => {
                if (e.target.value) {
                  updateFilter('dateFrom', e.target.value);
                } else {
                  removeFilter('dateFrom');
                }
              }}
              className={cn(
                'w-full px-2 py-1.5 text-xs rounded border',
                'bg-slate-800 border-slate-700 text-slate-300'
              )}
            />
          </div>

          {/* Date à */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Date à</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => {
                if (e.target.value) {
                  updateFilter('dateTo', e.target.value);
                } else {
                  removeFilter('dateTo');
                }
              }}
              className={cn(
                'w-full px-2 py-1.5 text-xs rounded border',
                'bg-slate-800 border-slate-700 text-slate-300'
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

