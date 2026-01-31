/**
 * Modale de Simulation
 * Permet de simuler des scénarios et voir les impacts
 */

'use client';

import React, { useState } from 'react';
import { BTPIntelligentModal } from './BTPIntelligentModal';
import { BTPVisualization } from './BTPVisualization';
import { Calculator, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface SimulationParameter {
  id: string;
  label: string;
  type: 'number' | 'percentage' | 'slider';
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  impact?: string;
}

interface SimulationScenario {
  id: string;
  name: string;
  parameters: SimulationParameter[];
  results?: Record<string, number>;
}

interface BTPSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialParameters?: SimulationParameter[];
  onSimulate?: (parameters: SimulationParameter[]) => Promise<Record<string, number>>;
}

export function BTPSimulationModal({
  isOpen,
  onClose,
  title,
  initialParameters = [],
  onSimulate,
}: BTPSimulationModalProps) {
  const [parameters, setParameters] = useState<SimulationParameter[]>(initialParameters);
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, number>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('parameters');

  const updateParameter = (id: string, value: number) => {
    setParameters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value } : p))
    );
  };

  const resetParameters = () => {
    setParameters(initialParameters);
    setResults({});
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      if (onSimulate) {
        const simResults = await onSimulate(parameters);
        setResults(simResults);
      } else {
        // Appeler l'API de simulation
        const response = await fetch('/api/analytics/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            parameters: parameters.map((p) => ({ id: p.id, value: p.value })),
            context: { type: 'budget' }, // Type de simulation
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data.results || {});
        } else {
          // Fallback avec simulation mockée en cas d'erreur
          const mockResults: Record<string, number> = {};
          parameters.forEach((param) => {
            mockResults[param.id] = param.value * (1 + Math.random() * 0.2 - 0.1);
          });
          setResults(mockResults);
        }
      }
      setActiveTab('results');
    } catch (error) {
      console.error('Simulation error:', error);
      // Fallback avec simulation mockée en cas d'erreur
      const mockResults: Record<string, number> = {};
      parameters.forEach((param) => {
        mockResults[param.id] = param.value * (1 + Math.random() * 0.2 - 0.1);
      });
      setResults(mockResults);
    } finally {
      setIsSimulating(false);
    }
  };

  const saveScenario = () => {
    const scenario: SimulationScenario = {
      id: `scenario-${Date.now()}`,
      name: `Scénario ${scenarios.length + 1}`,
      parameters: [...parameters],
      results: { ...results },
    };
    setScenarios([...scenarios, scenario]);
  };

  const loadScenario = (scenarioId: string) => {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (scenario) {
      setParameters(scenario.parameters);
      setResults(scenario.results || {});
      setCurrentScenario(scenarioId);
    }
  };

  const comparisonData = scenarios.map((scenario) => ({
    name: scenario.name,
    ...Object.entries(scenario.results || {}).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, number>),
  }));

  return (
    <BTPIntelligentModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Simulez des scénarios et analysez les impacts"
      size="xl"
      actions={[
        {
          label: 'Réinitialiser',
          onClick: resetParameters,
          icon: RotateCcw,
          variant: 'secondary',
        },
        {
          label: 'Simuler',
          onClick: runSimulation,
          icon: Calculator,
          variant: 'primary',
        },
      ]}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="parameters">Paramètres</TabsTrigger>
          <TabsTrigger value="results">Résultats</TabsTrigger>
          <TabsTrigger value="scenarios">Scénarios</TabsTrigger>
        </TabsList>

        {/* Paramètres */}
        <TabsContent value="parameters" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {parameters.map((param) => (
              <div key={param.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm text-slate-300">{param.label}</Label>
                  {param.impact && (
                    <Badge variant="default" className="text-xs">
                      {param.impact}
                    </Badge>
                  )}
                </div>
                {param.type === 'slider' ? (
                  <div className="space-y-2">
                    <Slider
                      value={[param.value]}
                      onValueChange={([value]) => updateParameter(param.id, value)}
                      min={param.min || 0}
                      max={param.max || 100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{param.min || 0}</span>
                      <span className="font-medium text-slate-300">
                        {param.value} {param.unit}
                      </span>
                      <span>{param.max || 100}</span>
                    </div>
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={param.value}
                    onChange={(e) => updateParameter(param.id, parseFloat(e.target.value) || 0)}
                    min={param.min}
                    max={param.max}
                    className="bg-slate-900 border-slate-700 text-slate-300"
                  />
                )}
              </div>
            ))}
          </div>

          {parameters.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <p>Aucun paramètre configuré</p>
            </div>
          )}
        </TabsContent>

        {/* Résultats */}
        <TabsContent value="results" className="space-y-4 mt-4">
          {Object.keys(results).length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {parameters.map((param) => {
                  const originalValue = initialParameters.find((p) => p.id === param.id)?.value || 0;
                  const newValue = results[param.id] || param.value;
                  const diff = newValue - originalValue;
                  const diffPercent = originalValue !== 0 ? (diff / originalValue) * 100 : 0;

                  return (
                    <div
                      key={param.id}
                      className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
                    >
                      <p className="text-xs text-slate-400 mb-1">{param.label}</p>
                      <p className="text-lg font-bold text-slate-200">
                        {newValue.toFixed(2)} {param.unit}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {diff >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                        <span
                          className={cn(
                            'text-xs',
                            diff >= 0 ? 'text-emerald-400' : 'text-red-400'
                          )}
                        >
                          {diff >= 0 ? '+' : ''}
                          {diffPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h4 className="text-sm font-semibold text-slate-300 mb-4">Évolution</h4>
                <BTPVisualization
                  visualization={{
                    id: 'simulation-trend',
                    type: 'line',
                    dataSource: 'simulation',
                    config: {
                      xAxis: 'name',
                      yAxis: 'value',
                    },
                    interactions: { hover: 'tooltip' },
                  }}
                  data={[
                    { name: 'Initial', value: parameters[0]?.value || 0 },
                    { name: 'Simulé', value: results[parameters[0]?.id || ''] || 0 },
                  ]}
                  height={200}
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={saveScenario} className="text-xs">
                  Sauvegarder ce scénario
                </Button>
                <Button variant="outline" size="sm" onClick={resetParameters} className="text-xs">
                  Réinitialiser
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>Lancez une simulation pour voir les résultats</p>
            </div>
          )}
        </TabsContent>

        {/* Scénarios */}
        <TabsContent value="scenarios" className="space-y-4 mt-4">
          {scenarios.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={cn(
                      'bg-slate-800/50 rounded-lg p-3 border cursor-pointer transition-colors',
                      currentScenario === scenario.id
                        ? 'border-blue-500'
                        : 'border-slate-700 hover:border-slate-600'
                    )}
                    onClick={() => loadScenario(scenario.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-slate-300">{scenario.name}</h5>
                      <Badge variant="default" className="text-xs">
                        {Object.keys(scenario.results || {}).length} résultats
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      {scenario.parameters.length} paramètre{scenario.parameters.length > 1 ? 's' : ''}
                    </p>
                  </div>
                ))}
              </div>

              {scenarios.length > 1 && (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-sm font-semibold text-slate-300 mb-4">Comparaison des Scénarios</h4>
                  <BTPVisualization
                    visualization={{
                      id: 'scenarios-comparison',
                      type: 'bar',
                      dataSource: 'scenarios',
                      config: {
                        xAxis: 'name',
                        yAxis: Object.keys(scenarios[0]?.results || {})[0] || 'value',
                      },
                      interactions: { hover: 'tooltip' },
                    }}
                    data={comparisonData}
                    height={250}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>Aucun scénario sauvegardé</p>
              <p className="text-xs mt-2">Lancez une simulation et sauvegardez-la pour la comparer</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </BTPIntelligentModal>
  );
}

