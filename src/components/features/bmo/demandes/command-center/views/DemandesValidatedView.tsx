/**
 * Demandes Command Center - Validated View
 * Liste des demandes validées
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
  CheckCircle,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';

const mockValidated = [
  { id: 'BC-2024-0845', title: 'BC Fournitures Générales', bureau: 'Achats', amount: 1200000, validatedBy: 'M. Koné', validatedAt: '2024-01-09 14:32' },
  { id: 'FAC-2024-1198', title: 'Facture Maintenance', bureau: 'Finance', amount: 3500000, validatedBy: 'Mme Diallo', validatedAt: '2024-01-09 11:15' },
  { id: 'BC-2024-0832', title: 'BC Transport', bureau: 'Achats', amount: 850000, validatedBy: 'M. Koné', validatedAt: '2024-01-08 16:45' },
  { id: 'FAC-2024-1175', title: 'Facture Prestation', bureau: 'Finance', amount: 7800000, validatedBy: 'M. Traoré', validatedAt: '2024-01-08 09:20' },
];

export function DemandesValidatedView() {
  const { openModal } = useDemandesCommandCenterStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    return amount.toLocaleString('fr-FR');
  };

  const filtered = useMemo(() => {
    if (!debouncedSearchQuery) return mockValidated;
    return mockValidated.filter(
      (d) =>
        d.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        d.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [debouncedSearchQuery]);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Demandes Validées
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length} demande(s) validée(s) récemment
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-800/50 border-slate-700 text-slate-200 w-64"
          />
        </div>
      </div>

      {/* List - Virtualized for performance */}
      {filtered.length > 0 ? (
        <VirtualizedList
          items={filtered}
          estimateSize={80}
          overscan={5}
          containerHeight="calc(100vh - 400px)"
          containerClassName="rounded-xl border border-slate-700/50 bg-slate-800/30"
          className="p-2"
          renderItem={(demande) => (
            <div
              key={demande.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors mb-2"
            >
            {/* Icon */}
            <div className="p-2 rounded-lg bg-emerald-500/10 flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-500">{demande.id}</span>
                <Badge variant="success" className="text-xs">
                  Validé
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

            {/* Validated by */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <User className="w-3.5 h-3.5" />
              <span>{demande.validatedBy}</span>
            </div>

            {/* Validated at */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{demande.validatedAt}</span>
            </div>

            {/* Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openModal('demande-detail', { demandeId: demande.id })}
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-300"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        />
      ) : (
        <div className="p-8 text-center text-slate-500 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <p className="text-sm">Aucune demande validée trouvée</p>
        </div>
      )}
    </div>
  );
}


