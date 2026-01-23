/**
 * Demandes Command Center - Rejected View
 * Liste des demandes rejetées
 */

'use client';

import React from 'react';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VirtualizedList } from '@/components/shared/VirtualizedList';
import {
  XCircle,
  ArrowRight,
  User,
  Calendar,
} from 'lucide-react';

const mockRejected = [
  { id: 'BC-2024-0789', title: 'BC Équipement Non Conforme', bureau: 'Achats', reason: 'Budget insuffisant', rejectedBy: 'M. Koné', rejectedAt: '2024-01-08' },
  { id: 'FAC-2024-1156', title: 'Facture Doublon', bureau: 'Finance', reason: 'Facture en double', rejectedBy: 'Mme Diallo', rejectedAt: '2024-01-07' },
];

export function DemandesRejectedView() {
  const { openModal } = useDemandesCommandCenterStore();

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-200 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-slate-400" />
          Demandes Rejetées
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {mockRejected.length} demande(s) rejetée(s)
        </p>
      </div>

      {/* List - Virtualized for performance */}
      {mockRejected.length > 0 ? (
        <VirtualizedList
          items={mockRejected}
          estimateSize={100}
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
            <div className="p-2 rounded-lg bg-slate-700/50 flex-shrink-0">
              <XCircle className="w-5 h-5 text-slate-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-slate-500">{demande.id}</span>
                <Badge variant="default" className="text-xs">
                  Rejeté
                </Badge>
              </div>
              <p className="text-sm font-medium text-slate-200 truncate">{demande.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">Motif: {demande.reason}</p>
            </div>

            {/* Info */}
            <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
              {demande.bureau}
            </Badge>

            {/* Rejected by */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <User className="w-3.5 h-3.5" />
              <span>{demande.rejectedBy}</span>
            </div>

            {/* Rejected at */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{demande.rejectedAt}</span>
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
          <p className="text-sm">Aucune demande rejetée</p>
        </div>
      )}
    </div>
  );
}


