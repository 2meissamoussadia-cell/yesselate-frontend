/**
 * Exemple d'utilisation des charts lazy-loaded
 * 
 * Montre comment utiliser LineChart, BarChart, AreaChart, PieChart
 * avec le système de lazy loading automatique
 */

'use client';

import React from 'react';
import { LineChart, BarChart, AreaChart, PieChart } from '../index';
import type { LineChartProps, BarChartProps, AreaChartProps, PieChartProps } from '../index';

// ============================================
// EXEMPLE 1 : LineChart
// ============================================

export function LineChartExample() {
  const data = [
    { date: '2024-01', demandes: 120, validations: 95 },
    { date: '2024-02', demandes: 150, validations: 120 },
    { date: '2024-03', demandes: 180, validations: 140 },
  ];

  const series: LineChartProps['series'] = [
    { dataKey: 'demandes', name: 'Demandes', color: '#3b82f6' },
    { dataKey: 'validations', name: 'Validations', color: '#10b981' },
  ];

  return (
    <LineChart
      data={data}
      xAxisKey="date"
      series={series}
      title="Évolution des demandes"
      showLegend={true}
    />
  );
}

// ============================================
// EXEMPLE 2 : BarChart
// ============================================

export function BarChartExample() {
  const data = [
    { mois: 'Jan', budget: 50000, depense: 45000 },
    { mois: 'Fév', budget: 60000, depense: 55000 },
    { mois: 'Mar', budget: 70000, depense: 65000 },
  ];

  const series: BarChartProps['series'] = [
    { dataKey: 'budget', name: 'Budget prévu' },
    { dataKey: 'depense', name: 'Dépenses réelles' },
  ];

  return (
    <BarChart
      data={data}
      xAxisKey="mois"
      series={series}
      title="Budget vs Dépenses"
      showLegend={true}
    />
  );
}

// ============================================
// EXEMPLE 3 : AreaChart
// ============================================

export function AreaChartExample() {
  const data = [
    { jour: 'Lun', actif: 45, inactif: 5 },
    { jour: 'Mar', actif: 52, inactif: 8 },
    { jour: 'Mer', actif: 48, inactif: 12 },
  ];

  const series: AreaChartProps['series'] = [
    { dataKey: 'actif', name: 'Projets actifs', opacity: 0.3 },
    { dataKey: 'inactif', name: 'Projets inactifs', opacity: 0.2 },
  ];

  return (
    <AreaChart
      data={data}
      xAxisKey="jour"
      series={series}
      title="Répartition des projets"
      showLegend={true}
    />
  );
}

// ============================================
// EXEMPLE 4 : PieChart
// ============================================

export function PieChartExample() {
  const data = [
    { name: 'Validé', value: 45 },
    { name: 'En attente', value: 30 },
    { name: 'Rejeté', value: 15 },
    { name: 'En cours', value: 10 },
  ];

  return (
    <PieChart
      data={data}
      dataKey="value"
      nameKey="name"
      title="Statut des validations"
      showLegend={true}
    />
  );
}

// ============================================
// EXEMPLE 5 : Utilisation dans une page
// ============================================

export function ChartsPageExample() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-200">Graphiques du Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartExample />
        <BarChartExample />
        <AreaChartExample />
        <PieChartExample />
      </div>
    </div>
  );
}
