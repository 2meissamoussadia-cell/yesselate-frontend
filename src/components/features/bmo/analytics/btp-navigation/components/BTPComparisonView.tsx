/**
 * Vue de Comparaison Avancée
 * Permet de comparer plusieurs éléments avec visualisations comparatives
 */

'use client';

import React, { useState } from 'react';
import { BTPVisualization } from './BTPVisualization';
import { BTPIntelligentModal } from './BTPIntelligentModal';
import { GitCompare, X, Plus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/cn';

interface ComparisonItem {
  id: string;
  label: string;
  type: string;
  data: Record<string, any>;
}

interface BTPComparisonViewProps {
  items?: ComparisonItem[];
  onItemsChange?: (items: ComparisonItem[]) => void;
  criteria?: string[];
  className?: string;
}

export function BTPComparisonView({
  items: initialItems = [],
  onItemsChange,
  criteria = [],
  className,
}: BTPComparisonViewProps) {
  const [items, setItems] = useState<ComparisonItem[]>(initialItems);
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>(criteria);
  const [activeTab, setActiveTab] = useState('matrix');

  const addItem = () => {
    const newItem: ComparisonItem = {
      id: `item-${Date.now()}`,
      label: `Élément ${items.length + 1}`,
      type: 'chantier',
      data: {},
    };
    const updated = [...items, newItem];
    setItems(updated);
    onItemsChange?.(updated);
  };

  const removeItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    onItemsChange?.(updated);
  };

  const updateItem = (id: string, updates: Partial<ComparisonItem>) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setItems(updated);
    onItemsChange?.(updated);
  };

  // Données pour la matrice comparative
  const matrixData = items.map((item) => ({
    name: item.label,
    ...selectedCriteria.reduce((acc, crit) => {
      acc[crit] = item.data[crit] || 0;
      return acc;
    }, {} as Record<string, number>),
  }));

  // Données pour le graphique radar
  const radarData = items.map((item) => ({
    name: item.label,
    ...selectedCriteria.reduce((acc, crit) => {
      acc[crit] = item.data[crit] || 0;
      return acc;
    }, {} as Record<string, number>),
  }));

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <GitCompare className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-slate-200">Comparaison</h2>
          <Badge variant="default" className="text-xs">
            {items.length} élément{items.length > 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={addItem} className="text-xs">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
          <Button variant="default" size="sm" className="text-xs">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Sélection des éléments */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Éléments à comparer</h3>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700"
              >
                <Input
                  value={item.label}
                  onChange={(e) => updateItem(item.id, { label: e.target.value })}
                  className="text-xs h-7 w-32"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="h-7 w-7 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {items.length < 5 && (
              <Button
                variant="default"
                size="sm"
                onClick={addItem}
                className="text-xs h-7"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter
              </Button>
            )}
          </div>
        </div>

        {/* Sélection des critères */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Critères de comparaison</h3>
          <div className="flex flex-wrap gap-2">
            {['Budget', 'Avancement', 'Marge', 'Délai', 'Qualité'].map((crit) => (
              <Badge
                key={crit}
                variant={selectedCriteria.includes(crit) ? 'default' : 'gray'}
                className="cursor-pointer text-xs"
                onClick={() => {
                  setSelectedCriteria((prev) =>
                    prev.includes(crit)
                      ? prev.filter((c) => c !== crit)
                      : [...prev, crit]
                  );
                }}
              >
                {crit}
              </Badge>
            ))}
          </div>
        </div>

        {/* Visualisations comparatives */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matrix">Matrice</TabsTrigger>
            <TabsTrigger value="radar">Radar</TabsTrigger>
            <TabsTrigger value="bars">Barres</TabsTrigger>
            <TabsTrigger value="table">Tableau</TabsTrigger>
          </TabsList>

          {/* Matrice Comparative */}
          <TabsContent value="matrix" className="mt-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Matrice Comparative</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-2 text-slate-400">Élément</th>
                      {selectedCriteria.map((crit) => (
                        <th key={crit} className="text-right p-2 text-slate-400">
                          {crit}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-700/50">
                        <td className="p-2 text-slate-300">{item.label}</td>
                        {selectedCriteria.map((crit) => (
                          <td key={crit} className="text-right p-2 text-slate-300">
                            {item.data[crit] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Graphique Radar */}
          <TabsContent value="radar" className="mt-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Performance Multi-Critères</h4>
              <BTPVisualization
                visualization={{
                  id: 'comparison-radar',
                  type: 'radar',
                  dataSource: 'comparison',
                  config: {
                    labelKey: 'name',
                    valueKey: selectedCriteria[0] || 'value',
                  },
                  interactions: { hover: 'tooltip' },
                }}
                data={radarData}
                height={400}
              />
            </div>
          </TabsContent>

          {/* Graphique en Barres */}
          <TabsContent value="bars" className="mt-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Comparaison par Critère</h4>
              <BTPVisualization
                visualization={{
                  id: 'comparison-bars',
                  type: 'bar',
                  dataSource: 'comparison',
                  config: {
                    xAxis: 'name',
                    yAxis: selectedCriteria[0] || 'value',
                  },
                  interactions: { hover: 'tooltip' },
                }}
                data={matrixData}
                height={300}
              />
            </div>
          </TabsContent>

          {/* Tableau Détaillé */}
          <TabsContent value="table" className="mt-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-4">Tableau Comparatif</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-2 text-slate-400">Critère</th>
                      {items.map((item) => (
                        <th key={item.id} className="text-right p-2 text-slate-400">
                          {item.label}
                        </th>
                      ))}
                      <th className="text-right p-2 text-slate-400">Moyenne</th>
                      <th className="text-right p-2 text-slate-400">Écart</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCriteria.map((crit) => {
                      const values = items.map((item) => item.data[crit] || 0);
                      const average = values.reduce((a, b) => a + b, 0) / values.length;
                      return (
                        <tr key={crit} className="border-b border-slate-700/50">
                          <td className="p-2 text-slate-300 font-medium">{crit}</td>
                          {values.map((value, idx) => (
                            <td key={idx} className="text-right p-2 text-slate-300">
                              {value}
                            </td>
                          ))}
                          <td className="text-right p-2 text-slate-300">{average.toFixed(2)}</td>
                          <td className="text-right p-2 text-slate-300">
                            {values.map((v) => Math.abs(v - average).toFixed(2)).join(' / ')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

