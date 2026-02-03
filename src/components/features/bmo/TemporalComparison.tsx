'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Minus, Calendar, ArrowRight } from 'lucide-react';
import { ComparisonWidget } from './ComparisonWidget';

interface TemporalComparisonProps {
  currentData: {
    period: string;
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  };
  historicalData: Array<{
    period: string;
    demandes: number;
    validations: number;
    rejets: number;
    budget: number;
  }>;
  className?: string;
}

export function TemporalComparison({
  currentData,
  historicalData,
  className,
}: TemporalComparisonProps) {
  const { darkMode } = useAppStore();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  // Trouver la période sélectionnée dans l'historique
  const comparisonData = useMemo(() => {
    if (!selectedPeriod) return null;

    const found = historicalData.find((d) => d.period === selectedPeriod);
    if (!found) return null;

    return {
      period: found.period,
      demandes: found.demandes,
      validations: found.validations,
      rejets: found.rejets,
      budget: found.budget,
    };
  }, [selectedPeriod, historicalData]);

  const calculateVariation = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const variations = useMemo(() => {
    if (!comparisonData) return null;

    return {
      demandes: calculateVariation(currentData.demandes, comparisonData.demandes),
      validations: calculateVariation(currentData.validations, comparisonData.validations),
      rejets: calculateVariation(currentData.rejets, comparisonData.rejets),
      budget: calculateVariation(currentData.budget, comparisonData.budget),
    };
  }, [currentData, comparisonData]);

  const availablePeriods = useMemo(() => {
    return historicalData
      .filter((d) => d.period !== currentData.period)
      .map((d) => d.period)
      .reverse();
  }, [historicalData, currentData.period]);

  return (
    <DashboardCard
      title="📊 Comparaison Temporelle"
      subtitle="Comparez avec n'importe quelle période"
      icon="📊"
      borderColor="#6366F1"
      className={className}
    >
      <div className="space-y-4">
        {/* Sélecteur de période */}
        <div className="space-y-2">
          <label className="text-xs font-semibold">Période de comparaison</label>
          <div className="flex gap-2">
            <Select value={selectedPeriod || '__none__'} onValueChange={(v) => setSelectedPeriod(v === '__none__' ? '' : v)}>
              <SelectTrigger
                className={cn(
                  'flex-1 h-9 text-xs rounded-lg',
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-gray-50 border-gray-200 text-gray-800'
                )}
              >
                <SelectValue placeholder="Sélectionner une période..." />
              </SelectTrigger>
              <SelectContent className={darkMode ? 'border-slate-700 bg-slate-900 text-slate-100' : 'border-gray-200 bg-white text-gray-800'}>
                <SelectItem value="__none__">Sélectionner une période...</SelectItem>
                {availablePeriods.map((period) => (
                  <SelectItem key={period} value={period}>{period}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparaison */}
        {comparisonData && variations && (
          <div className="space-y-3 pt-2 border-t border-slate-700">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-[10px] text-slate-400 mb-1">Période actuelle</div>
                <div className="font-semibold">{currentData.period}</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 mb-1">Période comparée</div>
                <div className="font-semibold">{comparisonData.period}</div>
              </div>
            </div>

            {/* Métriques comparées */}
            <div className="space-y-2">
              <ComparisonWidget
                label="Demandes"
                current={currentData.demandes}
                previous={comparisonData.demandes}
              />
              <ComparisonWidget
                label="Validations"
                current={currentData.validations}
                previous={comparisonData.validations}
              />
              <ComparisonWidget
                label="Rejets"
                current={currentData.rejets}
                previous={comparisonData.rejets}
              />
              <ComparisonWidget
                label="Budget"
                current={currentData.budget}
                previous={comparisonData.budget}
                format={(v) => `${(v / 1000000).toFixed(1)} Mds FCFA`}
              />
            </div>

            {/* Résumé des variations */}
            <div className="pt-2 border-t border-slate-700">
              <div className="text-[10px] text-slate-400 mb-2">Résumé des variations</div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(variations).map(([key, value]) => {
                  const isPositive = value > 0;
                  const isNegative = value < 0;
                  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

                  return (
                    <div
                      key={key}
                      className={cn(
                        'p-2 rounded-lg flex items-center gap-2',
                        darkMode ? 'bg-slate-800/30' : 'bg-gray-50'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-3 h-3',
                          isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-slate-400 capitalize">{key}</div>
                        <div
                          className={cn(
                            'text-xs font-semibold',
                            isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400'
                          )}
                        >
                          {isPositive ? '+' : ''}
                          {value.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!comparisonData && (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Sélectionnez une période pour comparer</p>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

