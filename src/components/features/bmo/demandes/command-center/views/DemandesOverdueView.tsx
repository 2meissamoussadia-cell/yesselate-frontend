/**
 * Demandes Command Center - Overdue View
 * Liste des demandes en retard
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VirtualizedList } from '@/components/shared/VirtualizedList';
import {
  TimerOff,
  Clock,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

const mockOverdue = [
  { id: 'BC-2024-0756', title: 'BC Maintenance Annuelle', bureau: 'Achats', amount: 4500000, delay: 12, slaLimit: 5 },
  { id: 'FAC-2024-1089', title: 'Facture Équipements', bureau: 'Finance', amount: 8200000, delay: 8, slaLimit: 3 },
  { id: 'AVE-2024-0134', title: 'Avenant Extension', bureau: 'Juridique', amount: 12000000, delay: 15, slaLimit: 7 },
];

export function DemandesOverdueView() {
  const { openModal } = useDemandesCommandCenterStore();

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
    return amount.toLocaleString('fr-FR');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <TimerOff className="w-5 h-5 text-orange-400" />
            Demandes en Retard
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {mockOverdue.length} demande(s) ayant dépassé le SLA
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <AlertTriangle className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400">SLA dépassé</span>
        </div>
      </div>

      {/* Alert */}
      <div className="p-4 rounded-xl border-l-4 border-l-orange-500 bg-orange-500/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-200">
              Ces demandes sont en retard par rapport au SLA défini
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Une action corrective est nécessaire pour éviter les pénalités
            </p>
          </div>
        </div>
      </div>

      {/* List - Virtualized for performance */}
      {mockOverdue.length > 0 ? (
        <VirtualizedList
          items={mockOverdue}
          estimateSize={120}
          overscan={5}
          containerHeight="calc(100vh - 400px)"
          containerClassName="rounded-xl border border-slate-700/50 bg-slate-800/30"
          className="p-2"
          renderItem={(demande) => {
            const overdueBy = demande.delay - demande.slaLimit;

            return (
              <div
                key={demande.id}
                className="p-4 rounded-xl border-l-4 border-l-orange-500 bg-orange-500/5 hover:bg-orange-500/10 transition-colors mb-3"
              >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="p-2 rounded-lg bg-orange-500/10 flex-shrink-0">
                  <TimerOff className="w-5 h-5 text-orange-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-400">{demande.id}</span>
                    <Badge variant="warning" className="text-xs">
                      +{overdueBy}j retard
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-slate-200">{demande.title}</p>
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
                <div className="flex flex-col items-end gap-0.5">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-orange-400 font-medium">{demande.delay}j</span>
                  </div>
                  <span className="text-xs text-slate-400">SLA: {demande.slaLimit}j</span>
                </div>

                {/* Action */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openModal('demande-detail', { demandeId: demande.id })}
                  className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        }}
        />
      ) : (
        <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
          Aucune demande en retard
        </div>
      )}
    </div>
  );
}


