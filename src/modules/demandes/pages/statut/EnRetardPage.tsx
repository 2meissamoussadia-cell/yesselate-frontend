/**
 * Page En Retard - Demandes en retard
 */

'use client';

import React, { useMemo } from 'react';
import { useDemandesByStatus } from '../../hooks/useDemandesData';

interface EnRetardPageProps {
  filterService?: string;
}

export function EnRetardPage({ filterService }: EnRetardPageProps = {}) {
  const { data: demandes, isLoading } = useDemandesByStatus('overdue');

  // Filtrer par service si fourni (niveau 3)
  const filteredDemandes = useMemo(() => {
    if (!filterService || !demandes) return demandes;
    return demandes.filter((d) => d.service === filterService);
  }, [demandes, filterService]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-64 bg-slate-800/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  const demandesData = filteredDemandes || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-200 mb-2">Demandes en retard</h1>
          <p className="text-slate-400">{demandesData.length} demande{demandesData.length > 1 ? 's' : ''} en retard</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-500/30 bg-orange-500/10">
          <span className="text-orange-400 font-medium">{demandesData.length}</span>
        </div>
      </div>

      {demandesData.length === 0 ? (
        <div className="p-12 text-center rounded-lg border border-slate-700/50 bg-slate-800/30">
          <p className="text-slate-400">Aucune demande en retard</p>
        </div>
      ) : (
        <div className="space-y-3">
          {demandesData.map((demande) => (
            <EnRetardCard key={demande.id} demande={demande} />
          ))}
        </div>
      )}
    </div>
  );
}

function EnRetardCard({ demande }: { demande: any }) {
  const daysOverdue = demande.dueDate
    ? Math.floor((new Date().getTime() - new Date(demande.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="p-4 rounded-lg border border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
            <div>
              <h3 className="text-base font-medium text-slate-200">{demande.title}</h3>
              <div className="text-sm text-slate-400 mt-1">{demande.reference}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{demande.createdBy}</span>
            {demande.dueDate && (
              <span className="text-orange-400">Échéance: {new Date(demande.dueDate).toLocaleDateString('fr-FR')}</span>
            )}
            <span className="capitalize">{demande.service}</span>
          </div>
        </div>
        <div className="px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
          {daysOverdue}j de retard
        </div>
      </div>
    </div>
  );
}

