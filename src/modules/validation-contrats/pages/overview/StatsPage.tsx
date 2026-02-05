/**
 * Page : Vue d'ensemble > Statistiques
 */

'use client';

import React from 'react';
import { useContratsStats } from '../../hooks';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';

export function StatsPage() {
  const { data: stats, isLoading, error } = useContratsStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement des statistiques...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement des statistiques</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Statistiques détaillées</h2>
        <p className="text-sm text-slate-400">Analyse approfondie des contrats</p>
      </div>

      {/* Répartition par statut */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <PieChart className="h-5 w-5 text-purple-400" />
          Répartition par statut
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats.parStatut).map(([statut, count]) => (
            <div key={statut} className="text-center">
              <div className="text-2xl font-bold text-slate-200">{count}</div>
              <div className="text-sm text-slate-400 mt-1">{statut.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Répartition par type */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          Répartition par type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats.parType).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="text-2xl font-bold text-slate-200">{count}</div>
              <div className="text-sm text-slate-400 mt-1">{type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Métriques financières */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          Métriques financières
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Montant total</div>
            <div className="text-xl font-bold text-slate-200">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
                minimumFractionDigits: 0,
              }).format(stats.montantTotal)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">En attente</div>
            <div className="text-xl font-bold text-yellow-400">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
                minimumFractionDigits: 0,
              }).format(stats.montantEnAttente)}
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Validés</div>
            <div className="text-xl font-bold text-green-400">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'XOF',
                minimumFractionDigits: 0,
              }).format(stats.montantValides)}
            </div>
          </div>
        </div>
      </div>

      {/* Délai moyen de validation */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
        <h3 className="text-base font-semibold text-slate-200 mb-4">Performance</h3>
        <div className="text-center">
          <div className="text-3xl font-bold text-slate-200 mb-2">
            {stats.delaiMoyenValidation} jours
          </div>
          <div className="text-sm text-slate-400">Délai moyen de validation</div>
        </div>
      </div>
    </div>
  );
}

