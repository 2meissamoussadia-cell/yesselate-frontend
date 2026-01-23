/**
 * Demandes Command Center - Pending View
 * Liste des demandes en attente
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VirtualizedList } from '@/components/shared/VirtualizedList';
import { useDebounce } from '@/application/hooks/useDebounce';
import {
  Search,
  Filter,
  CheckCircle,
  Clock,
  FileText,
  Receipt,
  FileEdit,
  ArrowRight,
  MoreHorizontal,
} from 'lucide-react';

// Mock data
const mockDemandes = [
  { id: 'BC-2024-0892', title: 'BC Fournitures Bureau', type: 'bc', bureau: 'Achats', amount: 2500000, delay: 5, priority: 'high', date: '2024-01-05' },
  { id: 'FAC-2024-1234', title: 'Facture Transport', type: 'facture', bureau: 'Finance', amount: 850000, delay: 3, priority: 'medium', date: '2024-01-07' },
  { id: 'AVE-2024-0156', title: 'Avenant Contrat Maintenance', type: 'avenant', bureau: 'Juridique', amount: 15000000, delay: 7, priority: 'high', date: '2024-01-03' },
  { id: 'BC-2024-0901', title: 'BC Matériel Informatique', type: 'bc', bureau: 'Achats', amount: 8500000, delay: 2, priority: 'medium', date: '2024-01-08' },
  { id: 'FAC-2024-1256', title: 'Facture Prestataire', type: 'facture', bureau: 'Finance', amount: 4200000, delay: 1, priority: 'low', date: '2024-01-09' },
];

const typeIcons: Record<string, typeof FileText> = {
  bc: FileText,
  facture: Receipt,
  avenant: FileEdit,
};

export function DemandesPendingView() {
  const { navigation, openModal, selectedItems, toggleItemSelection, clearSelection } = useDemandesCommandCenterStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredDemandes = useMemo(() => {
    let filtered = mockDemandes;

    // Filter by sub-category
    if (navigation.subCategory !== 'all') {
      filtered = filtered.filter((d) => {
        if (['bc', 'factures', 'avenants'].includes(navigation.subCategory)) {
          const typeMap: Record<string, string> = { bc: 'bc', factures: 'facture', avenants: 'avenant' };
          return d.type === typeMap[navigation.subCategory];
        }
        if (['achats', 'finance', 'juridique'].includes(navigation.subCategory)) {
          const bureauMap: Record<string, string> = { achats: 'Achats', finance: 'Finance', juridique: 'Juridique' };
          return d.bureau === bureauMap[navigation.subCategory];
        }
        return true;
      });
    }

    // Filter by search (using debounced query)
    if (debouncedSearchQuery) {
      const q = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) => d.id.toLowerCase().includes(q) || d.title.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [navigation.subCategory, debouncedSearchQuery]);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
    return amount.toLocaleString('fr-FR');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-200">En attente de validation</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredDemandes.length} demande(s) en attente de traitement
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-700 text-slate-200 w-64"
            />
          </div>
          <Button variant="default" size="sm" className="border-slate-700 text-slate-400">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Bulk actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <span className="text-sm text-blue-400">
            {selectedItems.length} sélectionné(s)
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
            Valider tout
          </Button>
          <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
            Assigner
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelection}
            className="text-slate-400 hover:text-slate-300"
          >
            Annuler
          </Button>
        </div>
      )}

      {/* List - Virtualized for performance */}
      {filteredDemandes.length > 0 ? (
        <VirtualizedList
          items={filteredDemandes}
          estimateSize={80}
          overscan={5}
          containerHeight="calc(100vh - 400px)"
          containerClassName="rounded-xl border border-slate-700/50 bg-slate-800/30"
          className="p-2"
          renderItem={(demande) => {
            const Icon = typeIcons[demande.type] || FileText;
            const isSelected = selectedItems.includes(demande.id);

            return (
              <div
                key={demande.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl border transition-all mb-2',
                  isSelected
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'
                )}
              >
              {/* Checkbox */}
              <button
                onClick={() => toggleItemSelection(demande.id)}
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-slate-600 hover:border-slate-500'
                )}
              >
                {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
              </button>

              {/* Priority indicator */}
              <div
                className={cn(
                  'w-1.5 h-12 rounded-full flex-shrink-0',
                  demande.priority === 'high'
                    ? 'bg-rose-500'
                    : demande.priority === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-slate-600'
                )}
              />

              {/* Icon */}
              <div
                className={cn(
                  'p-2 rounded-lg flex-shrink-0',
                  demande.priority === 'high'
                    ? 'bg-rose-500/10'
                    : demande.priority === 'medium'
                    ? 'bg-amber-500/10'
                    : 'bg-slate-700/50'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5',
                    demande.priority === 'high'
                      ? 'text-rose-400'
                      : demande.priority === 'medium'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  )}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-500">{demande.id}</span>
                  <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                    {demande.type.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-200 truncate">{demande.title}</p>
              </div>

              {/* Info */}
              <div className="flex flex-col items-end gap-1">
                <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                  {demande.bureau}
                </Badge>
                <span className="text-sm font-medium text-slate-300">
                  {formatAmount(demande.amount)} FCFA
                </span>
              </div>

              {/* Delay */}
              <div className="flex items-center gap-1.5 text-sm">
                <Clock className="w-4 h-4 text-slate-500" />
                <span
                  className={cn(
                    demande.delay > 5
                      ? 'text-rose-400'
                      : demande.delay > 3
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  )}
                >
                  {demande.delay}j
                </span>
              </div>

              {/* Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openModal('demande-detail', { demandeId: demande.id })}
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          );
        }}
        />
      ) : (
        <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
          Aucune demande en attente
        </div>
      )}
    </div>
  );
}


