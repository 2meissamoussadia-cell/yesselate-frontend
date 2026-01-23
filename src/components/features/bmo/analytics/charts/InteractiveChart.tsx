/**
 * Composant de graphique interactif pour Analytics
 * Supporte plusieurs types de graphiques avec interactions avancées
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Maximize2,
  Settings,
  RefreshCw,
} from 'lucide-react';

export type ChartType = 'line' | 'bar' | 'area' | 'pie';

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface InteractiveChartProps {
  title: string;
  data: ChartDataPoint[];
  type?: ChartType;
  height?: number;
  /** Couleurs personnalisées pour les séries */
  colors?: string[];
  /** Clés des données à afficher (pour les graphiques multi-séries) */
  dataKeys?: string[];
  /** Afficher la légende */
  showLegend?: boolean;
  /** Afficher la grille */
  showGrid?: boolean;
  /** Activer le zoom */
  enableZoom?: boolean;
  /** Activer l'export */
  enableExport?: boolean;
  /** Callback lors du clic sur un point */
  onDataPointClick?: (data: ChartDataPoint) => void;
  /** Afficher les tendances */
  showTrend?: boolean;
  /** Période de comparaison */
  comparisonPeriod?: string;
}

const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

export const InteractiveChart = React.memo<InteractiveChartProps>(
  ({
    title,
    data,
    type = 'line',
    height = 300,
    colors = DEFAULT_COLORS,
    dataKeys = ['value'],
    showLegend = true,
    showGrid = true,
    enableZoom = false,
    enableExport = true,
    onDataPointClick,
    showTrend = true,
    comparisonPeriod,
  }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedDataKey, setSelectedDataKey] = useState<string | null>(null);

    // Calculer les statistiques et tendances
    const stats = useMemo(() => {
      if (data.length === 0) return null;

      const values = data.map((d) => d.value);
      const total = values.reduce((sum, val) => sum + val, 0);
      const avg = total / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);

      // Calculer la tendance
      const firstValue = values[0];
      const lastValue = values[values.length - 1];
      const trend = lastValue - firstValue;
      const trendPercent = firstValue !== 0 ? ((trend / firstValue) * 100).toFixed(1) : '0';

      return {
        total,
        avg: avg.toFixed(2),
        max,
        min,
        trend,
        trendPercent,
        isPositive: trend >= 0,
      };
    }, [data]);

    // Tooltip personnalisé
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (!active || !payload || payload.length === 0) return null;

      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-300">{entry.name}:</span>
              <span className="font-semibold">{entry.value?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    };

    // Export des données
    const handleExport = () => {
      const csvContent = [
        ['Name', ...dataKeys].join(','),
        ...data.map((row) => [row.name, ...dataKeys.map((key) => row[key])].join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    };

    // Rendu du graphique selon le type
    const renderChart = () => {
      const commonProps = {
        data,
        onClick: onDataPointClick ? (data: any) => onDataPointClick(data.activePayload?.[0]?.payload) : undefined,
      };

      switch (type) {
        case 'line':
          return (
            <LineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  opacity={selectedDataKey && selectedDataKey !== key ? 0.3 : 1}
                />
              ))}
            </LineChart>
          );

        case 'bar':
          return (
            <BarChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  opacity={selectedDataKey && selectedDataKey !== key ? 0.3 : 1}
                />
              ))}
            </BarChart>
          );

        case 'area':
          return (
            <AreaChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#374151" />}
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                  opacity={selectedDataKey && selectedDataKey !== key ? 0.3 : 1}
                />
              ))}
            </AreaChart>
          );

        case 'pie':
          return (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={height / 3}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              {showLegend && <Legend />}
            </PieChart>
          );

        default:
          return null;
      }
    };

    return (
      <div
        className={`bg-gray-800 rounded-lg p-4 border border-gray-700 ${
          isFullscreen ? 'fixed inset-4 z-50' : ''
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {comparisonPeriod && (
              <p className="text-sm text-gray-400 mt-1">vs {comparisonPeriod}</p>
            )}
          </div>

          {/* Stats et tendances */}
          {showTrend && stats && (
            <div className="flex items-center gap-4 mr-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Tendance</p>
                <div
                  className={`flex items-center gap-1 ${
                    stats.isPositive ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {stats.isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="font-semibold">{stats.trendPercent}%</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Moyenne</p>
                <p className="font-semibold text-white">{stats.avg}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {enableExport && (
              <button
                onClick={handleExport}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Exporter les données"
              >
                <Download className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            >
              <Maximize2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Graphique */}
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={isFullscreen ? '90%' : height}>
            {renderChart()}
          </ResponsiveContainer>
        ) : (
          <div
            className="flex items-center justify-center text-gray-500"
            style={{ height }}
          >
            Aucune donnée disponible
          </div>
        )}
      </div>
    );
  }
);

InteractiveChart.displayName = 'InteractiveChart';

