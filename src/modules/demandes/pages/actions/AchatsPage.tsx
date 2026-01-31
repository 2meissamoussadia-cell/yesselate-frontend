/**
 * Page Actions Achats - Actions prioritaires Achats
 */

'use client';

import React from 'react';
import { useDemandesByService } from '../../hooks/useDemandesData';
import { EnAttentePage } from '../statut/EnAttentePage';

export function AchatsPage() {
  const { data: demandes, isLoading } = useDemandesByService('achats');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-64 bg-slate-800/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  const demandesData = demandes?.filter((d) => d.status === 'urgent' || d.status === 'pending') || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-200 mb-2">Actions prioritaires - Achats</h1>
        <p className="text-slate-400">{demandesData.length} action{demandesData.length > 1 ? 's' : ''} prioritaire{demandesData.length > 1 ? 's' : ''} pour le service Achats</p>
      </div>

      {demandesData.length === 0 ? (
        <div className="p-12 text-center rounded-lg border border-slate-700/50 bg-slate-800/30">
          <p className="text-slate-400">Aucune action prioritaire</p>
        </div>
      ) : (
        <div className="space-y-3">
          {demandesData.map((demande) => (
            <ActionCard key={demande.id} demande={demande} />
          ))}
        </div>
      )}
    </div>
  );
}

function ActionCard({ demande }: { demande: any }) {
  return (
    <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={demande.status === 'urgent' ? 'w-2 h-2 rounded-full bg-red-500' : 'w-2 h-2 rounded-full bg-amber-500'} />
            <div>
              <h3 className="text-base font-medium text-slate-200">{demande.title}</h3>
              <div className="text-sm text-slate-400 mt-1">{demande.reference}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{demande.createdBy}</span>
            <span>{new Date(demande.createdAt).toLocaleDateString('fr-FR')}</span>
            {demande.montant && (
              <span className="text-slate-400">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(demande.montant)}
              </span>
            )}
          </div>
        </div>
        <div className="px-2 py-1 rounded text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
          ACHATS
        </div>
      </div>
    </div>
  );
}

