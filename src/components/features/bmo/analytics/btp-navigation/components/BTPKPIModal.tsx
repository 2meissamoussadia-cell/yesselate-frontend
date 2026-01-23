/**
 * Modale d'Analyse de KPI
 * Affiche l'analyse complète d'un KPI avec historique, comparaisons, causes, recommandations
 */

'use client';

import React, { useState } from 'react';
import { useAnalyticsData } from '@/lib/hooks/useAnalyticsData';
import { BTPIntelligentModal } from './BTPIntelligentModal';
import { BTPVisualization } from './BTPVisualization';
import { TrendingUp, TrendingDown, AlertCircle, Lightbulb, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { KPIDefinition } from '@/lib/config/analyticsDisplayLogic';

interface BTPKPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: KPIDefinition;
  currentValue?: number;
  target?: number;
}

export function BTPKPIModal({ isOpen, onClose, kpi, currentValue = 0, target }: BTPKPIModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Charger l'historique du KPI
  const historyDataSource = {
    id: `kpi-${kpi.id}-history`,
    endpoint: `/api/analytics/kpis/${kpi.id}/timeseries`,
    cache: { ttl: 300000, key: `kpi-${kpi.id}-history` },
  };

  const { data: historyResponse } = useAnalyticsData({
    dataSource: historyDataSource,
    enabled: isOpen,
  });

  // Transformer les données d'historique
  const historyData = React.useMemo(() => {
    const response = historyResponse as any;
    if (response?.data && Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short' }),
        value: item.value || 0,
      }));
    }
    // Fallback avec données mockées
    return [
      { date: 'Jan', value: 100 },
      { date: 'Fév', value: 105 },
      { date: 'Mar', value: 110 },
      { date: 'Avr', value: 108 },
      { date: 'Mai', value: 115 },
      { date: 'Jun', value: currentValue },
    ];
  }, [historyResponse, currentValue]);

  // Charger les données de comparaison
  const comparisonDataSource = {
    id: `kpi-${kpi.id}-comparison`,
    endpoint: `/api/analytics/kpis/${kpi.id}/comparison`,
    cache: { ttl: 300000, key: `kpi-${kpi.id}-comparison` },
  };

  const { data: comparisonResponse } = useAnalyticsData({
    dataSource: comparisonDataSource,
    enabled: isOpen && activeTab === 'comparisons',
  });

  const comparisonData = React.useMemo(() => {
    const response = comparisonResponse as any;
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    // Fallback avec données mockées
    return [
      { name: 'Élément 1', value: 100 },
      { name: 'Élément 2', value: 95 },
      { name: 'Élément 3', value: 110 },
      { name: 'Moyenne', value: 102 },
    ];
  }, [comparisonResponse]);

  // Charger les données de causes
  const causesDataSource = {
    id: `kpi-${kpi.id}-causes`,
    endpoint: `/api/analytics/kpis/${kpi.id}/causes`,
    cache: { ttl: 300000, key: `kpi-${kpi.id}-causes` },
  };

  const { data: causesResponse } = useAnalyticsData({
    dataSource: causesDataSource,
    enabled: isOpen && activeTab === 'causes',
  });

  const causesData = React.useMemo(() => {
    const response = causesResponse as any;
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    // Fallback avec données mockées
    return [
      { factor: 'Facteur A', impact: 35, type: 'positive' },
      { factor: 'Facteur B', impact: -20, type: 'negative' },
      { factor: 'Facteur C', impact: 15, type: 'positive' },
    ];
  }, [causesResponse]);

  // Charger les recommandations
  const recommendationsDataSource = {
    id: `kpi-${kpi.id}-recommendations`,
    endpoint: `/api/analytics/kpis/${kpi.id}/recommendations`,
    cache: { ttl: 300000, key: `kpi-${kpi.id}-recommendations` },
  };

  const { data: recommendationsResponse } = useAnalyticsData({
    dataSource: recommendationsDataSource,
    enabled: isOpen && activeTab === 'recommendations',
  });

  const recommendations = React.useMemo(() => {
    const response = recommendationsResponse as any;
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    // Fallback avec données mockées
    return [
      {
        id: '1',
        title: 'Optimiser le processus',
        description: 'Mettre en place un processus d\'optimisation pour améliorer le KPI',
        impact: 'Élevé',
        priority: 'high',
      },
      {
        id: '2',
        title: 'Réallouer les ressources',
        description: 'Réallouer les ressources pour améliorer la performance',
        impact: 'Moyen',
        priority: 'medium',
      },
    ];
  }, [recommendationsResponse]);

  return (
    <BTPIntelligentModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Analyse: ${kpi.label}`}
      description={`Analyse complète du KPI ${kpi.label}`}
      size="xl"
      actions={[
        {
          label: 'Configurer',
          onClick: () => {
            setActiveTab('settings');
          },
          icon: Settings,
        },
      ]}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="comparisons">Comparaisons</TabsTrigger>
          <TabsTrigger value="causes">Causes</TabsTrigger>
          <TabsTrigger value="settings">Paramétrage</TabsTrigger>
          <TabsTrigger value="recommendations">IA</TabsTrigger>
        </TabsList>

        {/* Vue d'Ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Valeur actuelle</p>
              <p className="text-2xl font-bold text-slate-200">
                {currentValue.toLocaleString()} {kpi.unit}
              </p>
            </div>
            {target && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <p className="text-xs text-slate-400 mb-1">Objectif</p>
                <p className="text-2xl font-bold text-slate-200">
                  {target.toLocaleString()} {kpi.unit}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Écart: {((currentValue / target) * 100 - 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Évolution récente</p>
            <BTPVisualization
              visualization={{
                id: 'kpi-history',
                type: 'line',
                dataSource: 'kpi-history',
                config: { xAxis: 'date', yAxis: 'value' },
                interactions: { hover: 'tooltip' },
              }}
              data={historyData}
              height={200}
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="default" className="text-xs">
              Statut: {currentValue >= (target || 0) ? 'Atteint' : 'En cours'}
            </Badge>
            <Badge variant="default" className="text-xs">
              Tendance: <TrendingUp className="h-3 w-3 inline ml-1" />
            </Badge>
          </div>
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history" className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm font-semibold text-slate-300 mb-4">Historique complet</p>
            <BTPVisualization
              visualization={{
                id: 'kpi-full-history',
                type: 'area',
                dataSource: 'kpi-full-history',
                config: { xAxis: 'date', yAxis: 'value' },
                interactions: { hover: 'tooltip', zoom: true },
              }}
              data={historyData}
              height={300}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Moyenne</p>
              <p className="text-lg font-semibold text-slate-200">102.5 {kpi.unit}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Minimum</p>
              <p className="text-lg font-semibold text-slate-200">95 {kpi.unit}</p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <p className="text-xs text-slate-400 mb-1">Maximum</p>
              <p className="text-lg font-semibold text-slate-200">115 {kpi.unit}</p>
            </div>
          </div>
        </TabsContent>

        {/* Comparaisons */}
        <TabsContent value="comparisons" className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm font-semibold text-slate-300 mb-4">Comparaison avec autres éléments</p>
            <BTPVisualization
              visualization={{
                id: 'kpi-comparison',
                type: 'bar',
                dataSource: 'kpi-comparison',
                config: { xAxis: 'name', yAxis: 'value' },
                interactions: { hover: 'tooltip' },
              }}
              data={comparisonData}
              height={250}
            />
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm font-semibold text-slate-300 mb-4">Comparaison avec références</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <span className="text-sm text-slate-300">Moyenne secteur</span>
                <span className="text-sm font-semibold text-slate-200">98 {kpi.unit}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                <span className="text-sm text-slate-300">Meilleure pratique</span>
                <span className="text-sm font-semibold text-slate-200">120 {kpi.unit}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Causes */}
        <TabsContent value="causes" className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm font-semibold text-slate-300 mb-4">Facteurs influençant le KPI</p>
            <div className="space-y-3">
              {causesData.map((cause: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-900/50 rounded">
                  <div className="flex items-center gap-2">
                    {cause.type === 'positive' ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-sm text-slate-300">{cause.factor}</span>
                  </div>
                  <Badge
                    variant={cause.type === 'positive' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {cause.impact > 0 ? '+' : ''}
                    {cause.impact}%
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm font-semibold text-slate-300 mb-4">Graphique de contribution</p>
            <BTPVisualization
              visualization={{
                id: 'kpi-contribution',
                type: 'bar',
                dataSource: 'kpi-contribution',
                config: { xAxis: 'factor', yAxis: 'impact' },
                interactions: { hover: 'tooltip' },
              }}
              data={causesData.map((c: any) => ({ factor: c.factor, impact: Math.abs(c.impact) }))}
              height={200}
            />
          </div>
        </TabsContent>

        {/* Paramétrage */}
        <TabsContent value="settings" className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <p className="text-sm font-semibold text-slate-300 mb-4">Configuration du KPI</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Formule de calcul</label>
                <p className="text-sm text-slate-300">{kpi.calculation || 'Non définie'}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Source de données</label>
                <p className="text-sm text-slate-300">{kpi.apiEndpoint}</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Période de calcul</label>
                <p className="text-sm text-slate-300">Mensuel</p>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Seuils d'alerte</label>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="default" className="text-xs">Warning: 80%</Badge>
                  <Badge variant="destructive" className="text-xs">Critical: 60%</Badge>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Recommandations IA */}
        <TabsContent value="recommendations" className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-blue-400" />
              <p className="text-sm font-semibold text-slate-300">Recommandations IA</p>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec: any) => (
                <div
                  key={rec.id}
                  className="bg-slate-900/50 rounded-lg p-3 border border-slate-700"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-sm font-medium text-slate-300">{rec.title}</h5>
                    <Badge
                      variant={rec.priority === 'high' ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{rec.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Impact: {rec.impact}</span>
                    <Button variant="ghost" size="sm" className="text-xs ml-auto">
                      Appliquer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </BTPIntelligentModal>
  );
}

