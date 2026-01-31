/**
 * Page Validées - Demandes validées
 */

'use client';

import React from 'react';
import { useDemandesByStatus } from '../../hooks/useDemandesData';
import { EnAttentePage } from './EnAttentePage';

export function ValideesPage() {
  const { data: demandes, isLoading } = useDemandesByStatus('validated');

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="h-64 bg-slate-800/30 rounded-lg animate-pulse" />
      </div>
    );
  }

  const demandesData = demandes || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-200 mb-2">Demandes validées</h1>
          <p className="text-slate-400">{demandesData.length} demande{demandesData.length > 1 ? 's' : ''} validée{demandesData.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {demandesData.length === 0 ? (
        <div className="p-12 text-center rounded-lg border border-slate-700/50 bg-slate-800/30">
          <p className="text-slate-400">Aucune demande validée</p>
        </div>
      ) : (
        <div className="space-y-3">
          {demandesData.map((demande) => (
            <ValideeCard key={demande.id} demande={demande} />
          ))}
        </div>
      )}
    </div>
  );
}

function ValideeCard({ demande }: { demande: any }) {
  return (
    <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
            <div>
              <h3 className="text-base font-medium text-slate-200">{demande.title}</h3>
              <div className="text-sm text-slate-400 mt-1">{demande.reference}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{demande.createdBy}</span>
            <span>Validé le {new Date(demande.updatedAt).toLocaleDateString('fr-FR')}</span>
            <span className="capitalize">{demande.service}</span>
          </div>
        </div>
        <div className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          VALIDÉE
        </div>
      </div>
    </div>
  );
}

