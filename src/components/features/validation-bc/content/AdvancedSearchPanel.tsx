/**
 * Panneau de recherche avancée pour Validation-BC
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  X,
  Calendar,
  DollarSign,
  Building2,
  User,
  FileText,
} from 'lucide-react';

interface AdvancedSearchPanelProps {
  onSearch: (filters: SearchFilters) => void;
  onReset: () => void;
}

export interface SearchFilters {
  query?: string;
  type?: string;
  status?: string;
  bureau?: string;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
  urgent?: boolean;
  demandeur?: string;
}

export function AdvancedSearchPanel({ onSearch, onReset }: AdvancedSearchPanelProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const count = Object.values(filters).filter((v) => v !== undefined && v !== '').length;
    setActiveFiltersCount(count);
    onSearch(filters);
    setOpen(false);
  };

  const handleReset = () => {
    setFilters({});
    setActiveFiltersCount(0);
    onReset();
    setOpen(false);
  };

  const removeFilter = (key: keyof SearchFilters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    const count = Object.values(newFilters).filter((v) => v !== undefined && v !== '').length;
    setActiveFiltersCount(count);
    onSearch(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar + Filter Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher par ID, fournisseur, objet..."
            value={filters.query || ''}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 bg-slate-900/40 border-slate-700/50"
          />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2 relative">
              <Filter className="h-4 w-4" />
              Filtres
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-blue-500">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent className="w-full sm:max-w-lg bg-slate-900 border-slate-700">
            <SheetHeader>
              <SheetTitle className="text-slate-200">Recherche Avancée</SheetTitle>
              <SheetDescription className="text-slate-400">
                Affinez votre recherche avec plusieurs critères
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Type de Document */}
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Type de Document
                </Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bc">Bon de Commande</SelectItem>
                    <SelectItem value="facture">Facture</SelectItem>
                    <SelectItem value="avenant">Avenant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Statut */}
              <div className="space-y-2">
                <Label className="text-slate-300">Statut</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="validated">Validé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                    <SelectItem value="anomaly">Anomalie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bureau */}
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bureau / Service
                </Label>
                <Select
                  value={filters.bureau}
                  onValueChange={(value) => handleFilterChange('bureau', value)}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700">
                    <SelectValue placeholder="Tous les bureaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="achats">Achats</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="juridique">Juridique</SelectItem>
                    <SelectItem value="rh">Ressources Humaines</SelectItem>
                    <SelectItem value="it">IT</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Montant */}
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Montant (FCFA)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-slate-800/50 border-slate-700"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                    className="bg-slate-800/50 border-slate-700"
                  />
                </div>
              </div>

              {/* Période */}
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Période
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="bg-slate-800/50 border-slate-700"
                  />
                  <Input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="bg-slate-800/50 border-slate-700"
                  />
                </div>
              </div>

              {/* Demandeur */}
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Demandeur
                </Label>
                <Input
                  placeholder="Nom du demandeur"
                  value={filters.demandeur || ''}
                  onChange={(e) => handleFilterChange('demandeur', e.target.value)}
                  className="bg-slate-800/50 border-slate-700"
                />
              </div>

              {/* Urgent Only */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={filters.urgent || false}
                  onChange={(e) => handleFilterChange('urgent', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500"
                />
                <Label htmlFor="urgent" className="text-slate-300 cursor-pointer">
                  Documents urgents uniquement
                </Label>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSearch} className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  Réinitialiser
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.type && (
            <Badge variant="outline" className="gap-2">
              Type: {filters.type}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-400"
                onClick={() => removeFilter('type')}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="outline" className="gap-2">
              Statut: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-400"
                onClick={() => removeFilter('status')}
              />
            </Badge>
          )}
          {filters.bureau && (
            <Badge variant="outline" className="gap-2">
              Bureau: {filters.bureau}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-400"
                onClick={() => removeFilter('bureau')}
              />
            </Badge>
          )}
          {(filters.minAmount || filters.maxAmount) && (
            <Badge variant="outline" className="gap-2">
              Montant: {filters.minAmount || '0'} - {filters.maxAmount || '∞'}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-400"
                onClick={() => {
                  removeFilter('minAmount');
                  removeFilter('maxAmount');
                }}
              />
            </Badge>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="outline" className="gap-2">
              Période: {filters.dateFrom || 'début'} - {filters.dateTo || 'fin'}
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-400"
                onClick={() => {
                  removeFilter('dateFrom');
                  removeFilter('dateTo');
                }}
              />
            </Badge>
          )}
          {filters.urgent && (
            <Badge variant="outline" className="gap-2 bg-red-500/10 border-red-500/30 text-red-400">
              Urgents uniquement
              <X
                className="h-3 w-3 cursor-pointer hover:text-red-400"
                onClick={() => removeFilter('urgent')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

