/**
 * Page : Vue d'ensemble > Statistiques
 */

'use client';

import React from 'react';
import { useValidationStats } from '../../hooks';
import { FileCheck, ShoppingCart, Receipt, FileText } from 'lucide-react';
import { cn } from '@/lib/cn';

export function StatsPage() {
  const { data: stats, isLoading, error } = useValidationStats();

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

  const statsCards = [
    {
      icon: ShoppingCart,
      label: 'Bons de Commande',
      value: stats.parType.BC,
      color: 'blue',
    },
    {
      icon: Receipt,
      label: 'Factures',
      value: stats.parType.FACTURE,
      color: 'green',
    },
    {
      icon: FileText,
      label: 'Avenants',
      value: stats.parType.AVENANT,
      color: 'purple',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-200 mb-1">Statistiques détaillées</h2>
        <p className="text-sm text-slate-400">
          Répartition des documents par type, statut et service
        </p>
      </div>

      {/* Répartition par type */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Répartition par type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsCards.map((card) => {
            const Icon = card.icon;
            const percentage = stats.totalDocuments > 0 
              ? ((card.value / stats.totalDocuments) * 100).toFixed(1)
              : '0';

            return (
              <div
                key={card.label}
                className={cn(
                  'p-4 rounded-lg border',
                  card.color === 'blue' && 'bg-blue-500/10 border-blue-500/30 text-blue-400',
                  card.color === 'green' && 'bg-green-500/10 border-green-500/30 text-green-400',
                  card.color === 'purple' && 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{card.label}</span>
                </div>
                <div className="text-2xl font-bold mb-1">{card.value}</div>
                <div className="text-xs opacity-75">{percentage}% du total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Répartition par statut */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Répartition par statut</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border bg-amber-500/10 border-amber-500/30 text-amber-400">
            <div className="text-xs font-medium mb-1">En Attente</div>
            <div className="text-2xl font-bold">{stats.enAttente}</div>
          </div>
          <div className="p-4 rounded-lg border bg-emerald-500/10 border-emerald-500/30 text-emerald-400">
            <div className="text-xs font-medium mb-1">Validés</div>
            <div className="text-2xl font-bold">{stats.valides}</div>
          </div>
          <div className="p-4 rounded-lg border bg-red-500/10 border-red-500/30 text-red-400">
            <div className="text-xs font-medium mb-1">Rejetés</div>
            <div className="text-2xl font-bold">{stats.rejetes}</div>
          </div>
          <div className="p-4 rounded-lg border bg-orange-500/10 border-orange-500/30 text-orange-400">
            <div className="text-xs font-medium mb-1">Urgents</div>
            <div className="text-2xl font-bold">{stats.urgents}</div>
          </div>
        </div>
      </div>

      {/* Répartition par service */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Répartition par service</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.parService).map(([service, count]) => {
            const percentage = stats.totalDocuments > 0 
              ? ((count / stats.totalDocuments) * 100).toFixed(1)
              : '0';

            return (
              <div
                key={service}
                className="p-4 rounded-lg border bg-slate-800/50 border-slate-700/50 text-slate-300"
              >
                <div className="text-xs font-medium mb-1">{service}</div>
                <div className="text-2xl font-bold mb-1">{count}</div>
                <div className="text-xs opacity-75">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

