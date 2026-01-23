/**
 * Composants de graphiques pour le Dashboard utilisant Chart.js
 */

'use client';

import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TrendData {
  date: string;
  demandes: number;
  validations: number;
  budget: number;
}

interface MonthlyComparisonData {
  month: string;
  actuel: number;
  precedent: number;
}

interface CategoryDistributionData {
  category: string;
  count: number;
  percentage: number;
}

interface DashboardChartsProps {
  trends?: TrendData[];
  monthlyComparison?: MonthlyComparisonData[];
  categoryDistribution?: CategoryDistributionData[];
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#cbd5e1',
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#f1f5f9',
      bodyColor: '#cbd5e1',
      borderColor: 'rgba(148, 163, 184, 0.2)',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(148, 163, 184, 0.1)',
      },
      ticks: {
        color: '#94a3b8',
        font: {
          size: 11,
        },
      },
    },
  },
};

export function TrendsChart({ trends }: { trends?: TrendData[] }) {
  const chartData = useMemo(() => {
    if (!trends || trends.length === 0) return null;

    const labels = trends.map(t => {
      const date = new Date(t.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Demandes',
          data: trends.map(t => t.demandes),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Validations (%)',
          data: trends.map(t => t.validations * 100),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };
  }, [trends]);

  if (!chartData) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <p className="text-sm">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line
        data={chartData}
        options={{
          ...chartOptions,
          scales: {
            ...chartOptions.scales,
            y: {
              ...chartOptions.scales.y,
              position: 'left',
            },
            y1: {
              type: 'linear' as const,
              display: true,
              position: 'right' as const,
              grid: {
                drawOnChartArea: false,
              },
              ticks: {
                color: '#94a3b8',
                callback: function(value) {
                  return value + '%';
                },
              },
            },
          },
        }}
      />
    </div>
  );
}

export function MonthlyComparisonChart({ data }: { data?: MonthlyComparisonData[] }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    return {
      labels: data.map(d => d.month),
      datasets: [
        {
          label: 'Mois actuel',
          data: data.map(d => d.actuel),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
        {
          label: 'Mois précédent',
          data: data.map(d => d.precedent),
          backgroundColor: 'rgba(148, 163, 184, 0.7)',
          borderColor: 'rgb(148, 163, 184)',
          borderWidth: 1,
        },
      ],
    };
  }, [data]);

  if (!chartData) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <p className="text-sm">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
}

export function CategoryDistributionChart({ data }: { data?: CategoryDistributionData[] }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(139, 92, 246, 0.8)',
    ];

    return {
      labels: data.map(d => d.category),
      datasets: [
        {
          data: data.map(d => d.count),
          backgroundColor: colors.slice(0, data.length),
          borderColor: colors.slice(0, data.length).map(c => c.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    };
  }, [data]);

  if (!chartData) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <p className="text-sm">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <Doughnut
        data={chartData}
        options={{
          ...chartOptions,
          plugins: {
            ...chartOptions.plugins,
            legend: {
              ...chartOptions.plugins.legend,
              position: 'right' as const,
            },
          },
        }}
      />
    </div>
  );
}

export function DashboardCharts({ trends, monthlyComparison, categoryDistribution }: DashboardChartsProps) {
  return (
    <div className="space-y-6">
      {trends && trends.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">Évolution (30 derniers jours)</h3>
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
            <TrendsChart trends={trends} />
          </div>
        </div>
      )}

      {monthlyComparison && monthlyComparison.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">Comparaison mensuelle</h3>
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
            <MonthlyComparisonChart data={monthlyComparison} />
          </div>
        </div>
      )}

      {categoryDistribution && categoryDistribution.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">Répartition par catégorie</h3>
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
            <CategoryDistributionChart data={categoryDistribution} />
          </div>
        </div>
      )}
    </div>
  );
}


