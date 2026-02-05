/**
 * Panneau de recherche avancée pour la gouvernance
 * Permet de filtrer par critères multiples
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  X,
  Filter,
  Calendar,
  Users,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface SearchFilters {
  query: string;
  dateFrom?: string;
  dateTo?: string;
  bureaux: string[];
  criticality: string[];
  status: string[];
  type: string[];
}

interface GovernanceSearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  className?: string;
}

export function GovernanceSearchPanel({
  isOpen,
  onClose,
  onSearch,
  className,
}: GovernanceSearchPanelProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    bureaux: [],
    criticality: [],
    status: [],
    type: [],
  });
  
  const bureaux = ['BMO', 'BF', 'BM', 'BA', 'BCT', 'BQC', 'BJ'];
  const criticalityLevels = ['critical', 'high', 'medium', 'low'];
  const statuses = ['pending', 'active', 'resolved', 'blocked'];
  const types = ['raci', 'alert', 'system', 'blocked', 'payment', 'contract'];
  
  const handleToggle = (category: keyof SearchFilters, value: string) => {
    const currentArray = filters[category] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(v => v !== value)
      : [...currentArray, value];
    
    setFilters({ ...filters, [category]: newArray });
  };
  
  const handleReset = () => {
    setFilters({
      query: '',
      bureaux: [],
      criticality: [],
      status: [],
      type: [],
    });
  };
  
  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };
  
  const hasFilters = filters.query || 
    filters.bureaux.length > 0 || 
    filters.criticality.length > 0 ||
    filters.status.length > 0 ||
    filters.type.length > 0 ||
    filters.dateFrom ||
    filters.dateTo;
  
  if (!isOpen) return null;
  
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm',
        className
      )}
      onClick={onClose}
    >
      <Card
        className="w-full max-w-3xl mx-4 border-white/20 bg-slate-900 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-400" />
              Recherche Avancée
            </CardTitle>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Search query */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              <Search className="h-4 w-4 inline mr-2" />
              Recherche textuelle
            </label>
            <Input
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              placeholder="Rechercher dans toutes les données..."
              className="bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>
          
          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">
                <Calendar className="h-4 w-4 inline mr-2" />
                Date début
              </label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-white mb-2 block">
                <Calendar className="h-4 w-4 inline mr-2" />
                Date fin
              </label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          
          {/* Bureaux */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              <Building className="h-4 w-4 inline mr-2" />
              Bureaux
            </label>
            <div className="flex flex-wrap gap-2">
              {bureaux.map((bureau) => (
                <Badge
                  key={bureau}
                  variant="default"
                  className={cn(
                    'cursor-pointer transition-all',
                    filters.bureaux.includes(bureau)
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                  )}
                  onClick={() => handleToggle('bureaux', bureau)}
                >
                  {bureau}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Criticality */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Criticité
            </label>
            <div className="flex flex-wrap gap-2">
              {criticalityLevels.map((level) => (
                <Badge
                  key={level}
                  variant="default"
                  className={cn(
                    'cursor-pointer transition-all capitalize',
                    filters.criticality.includes(level)
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                  )}
                  onClick={() => handleToggle('criticality', level)}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Status */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Statut
            </label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <Badge
                  key={status}
                  variant="default"
                  className={cn(
                    'cursor-pointer transition-all capitalize',
                    filters.status.includes(status)
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                  )}
                  onClick={() => handleToggle('status', status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Type */}
          <div>
            <label className="text-sm font-semibold text-white mb-2 block">
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {types.map((type) => (
                <Badge
                  key={type}
                  variant="default"
                  className={cn(
                    'cursor-pointer transition-all capitalize',
                    filters.type.includes(type)
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                  )}
                  onClick={() => handleToggle('type', type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={!hasFilters}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Rechercher ({filters.bureaux.length + filters.criticality.length + filters.status.length + filters.type.length} filtres)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

