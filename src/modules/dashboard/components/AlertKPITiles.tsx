// src/modules/dashboard/components/AlertKPITiles.tsx
// Phase P15: Moteur d'alertes - Tuiles KPI pour alertes

'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { KpiTile } from './KpiTile';
import { useAlertStats } from '../hooks/useAlerts';

/**
 * Composant pour afficher les tuiles KPI d'alertes
 * Affiche les compteurs d'incidents par gravité
 * Phase P15: Moteur d'alertes
 */
export function AlertKPITiles() {
  const { data, isLoading } = useAlertStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-slate-800/30 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const stats = data?.stats;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <KpiTile
        label="Alertes critiques"
        value={stats.critical_open || 0}
        color="rose"
        Icon={AlertTriangle}
        trendSentiment={stats.critical_open > 0 ? 'negative' : 'neutral'}
        onClick={() => {
          // TODO: Ouvrir modal ou naviguer vers la liste des alertes critiques
          console.log('Open critical alerts');
        }}
      />
      <KpiTile
        label="Alertes warning"
        value={stats.warning_open || 0}
        color="amber"
        Icon={AlertCircle}
        trendSentiment={stats.warning_open > 0 ? 'negative' : 'neutral'}
        onClick={() => {
          // TODO: Ouvrir modal ou naviguer vers la liste des alertes warning
          console.log('Open warning alerts');
        }}
      />
      <KpiTile
        label="Alertes info"
        value={stats.info_open || 0}
        color="cyan"
        Icon={Info}
        trendSentiment="neutral"
        onClick={() => {
          // TODO: Ouvrir modal ou naviguer vers la liste des alertes info
          console.log('Open info alerts');
        }}
      />
    </div>
  );
}
