/**
 * Demandes Command Center - Urgent View
 * Liste des demandes urgentes
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useDemandesCommandCenterStore } from '@/lib/stores/demandesCommandCenterStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VirtualizedList } from '@/components/shared/VirtualizedList';
import {
  AlertCircle,
  Clock,
  ArrowRight,
  Zap,
  TrendingUp,
} from 'lucide-react';

const mockUrgent = [
  { id: 'BC-2024-0892', title: 'BC Fournitures Bureau - URGENT', bureau: 'Achats', amount: 2500000, delay: 5, reason: 'SLA critique dépassé' },
  { id: 'AVE-2024-0156', title: 'Avenant Contrat Maintenance', bureau: 'Juridique', amount: 15000000, delay: 7, reason: 'Blocage opérationnel' },
  { id: 'BC-2024-0878', title: 'BC Équipements Sécurité', bureau: 'Achats', amount: 5800000, delay: 6, reason: 'Impact sécurité' },
];

export function DemandesUrgentView() {
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
            <AlertCircle className="w-5 h-5 text-rose-400" />
            Demandes Urgentes
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {mockUrgent.length} demande(s) nécessitant une action immédiate
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <Zap className="w-4 h-4 text-rose-400" />
          <span className="text-sm font-medium text-rose-400">Priorité maximale</span>
        </div>
      </div>

      {/* Alert banner */}
      <div className="p-4 rounded-xl border-l-4 border-l-rose-500 bg-rose-500/5 flex items-center gap-4">
        <AlertCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-200">
            Attention: {mockUrgent.length} demandes dépassent le SLA critique
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            Ces demandes bloquent des opérations métier critiques
          </p>
        </div>
        <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white">
          Traiter en priorité
        </Button>
      </div>

      {/* List - Virtualized for performance */}
      {mockUrgent.length > 0 ? (
        <VirtualizedList
          items={mockUrgent}
          estimateSize={120}
          overscan={5}
          containerHeight="calc(100vh - 400px)"
          containerClassName="rounded-xl border border-slate-700/50 bg-slate-800/30"
          className="p-2"
          renderItem={(demande) => (
            <div
              key={demande.id}
              className="p-4 rounded-xl border-l-4 border-l-rose-500 bg-rose-500/5 hover:bg-rose-500/10 transition-colors mb-3"
            >
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="p-2 rounded-lg bg-rose-500/10 flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-400" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-500">{demande.id}</span>
                  <Badge variant="destructive" className="text-xs">
                    URGENT
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-200">{demande.title}</p>
                <p className="text-xs text-rose-400 mt-1">{demande.reason}</p>
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
                <Clock className="w-4 h-4 text-rose-400" />
                <span className="text-rose-400 font-medium">{demande.delay}j</span>
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
          </div>
        )}
        />
      ) : (
        <div className="p-8 text-center text-slate-500 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <p className="text-sm">Aucune demande urgente</p>
        </div>
      )}
    </div>
  );
}


