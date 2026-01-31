/**
 * Page Service Juridique - Toutes les demandes du service Juridique
 */

'use client';

import React from 'react';
import { useDemandesByService } from '../../hooks/useDemandesData';
import { FinanceServicePage } from './FinanceServicePage';

export function JuridiqueServicePage() {
  const { data: demandes, isLoading } = useDemandesByService('juridique');

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
      <div>
        <h1 className="text-2xl font-bold text-slate-200 mb-2">Service Juridique</h1>
        <p className="text-slate-400">{demandesData.length} demande{demandesData.length > 1 ? 's' : ''} pour le service Juridique</p>
      </div>

      {demandesData.length === 0 ? (
        <div className="p-12 text-center rounded-lg border border-slate-700/50 bg-slate-800/30">
          <p className="text-slate-400">Aucune demande pour ce service</p>
        </div>
      ) : (
        <div className="space-y-3">
          {demandesData.map((demande) => (
            <ServiceDemandeCard key={demande.id} demande={demande} service="JURIDIQUE" />
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceDemandeCard({ demande, service }: { demande: any; service: string }) {
  return (
    <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0 mt-1.5" />
            <div>
              <h3 className="text-base font-medium text-slate-200">{demande.title}</h3>
              <div className="text-sm text-slate-400 mt-1">{demande.reference}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>{demande.createdBy}</span>
            <span>{new Date(demande.createdAt).toLocaleDateString('fr-FR')}</span>
            <span className="capitalize">{demande.status}</span>
          </div>
        </div>
        <div className="px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
          {service}
        </div>
      </div>
    </div>
  );
}

