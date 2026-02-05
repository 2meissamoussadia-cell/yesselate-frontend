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
    { date: '2024-01', demandes: 120, validations: 95, budget: 100 },
    { date: '2024-02', demandes: 150, validations: 120, budget: 110 },
    { date: '2024-03', demandes: 180, validations: 140, budget: 130 },
  ];

  return (
    <LineChart
      data={data}
      title="Évolution des demandes"
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
    { key: 'actif', label: 'Projets actifs', color: '#3b82f6' },
    { key: 'inactif', label: 'Projets inactifs', color: '#10b981' },
  ];

  return (
    <AreaChart
      data={data}
      series={series}
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
