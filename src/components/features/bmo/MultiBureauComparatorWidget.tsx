'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { DashboardCard } from './DashboardCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BureauTag } from './BureauTag';
import { TrendingUp, TrendingDown, BarChart3, ArrowUpDown } from 'lucide-react';
import { ResponsiveContainer } from 'recharts';

interface Bureau {
  code: string;
  name?: string;
  completion?: number;
  tasks?: number;
}

interface MultiBureauComparatorWidgetProps {
  bureaux: Bureau[];
  periodData: Array<{ month?: string; demandes: number; validations: number; rejets: number; budget: number }>;
  className?: string;
}

interface BureauMetrics {
  code: string;
  name: string;
  demandes: number;
  validations: number;
  rejets: number;
  tauxValidation: number;
  tauxRejet: number;
  charge: number;
  efficacite: number;
  score: number;
}

export function MultiBureauComparatorWidget({
  bureaux,
  periodData,
  className,
}: MultiBureauComparatorWidgetProps) {
  const { darkMode } = useAppStore();
  const [selectedMetric, setSelectedMetric] = useState<'tauxValidation' | 'charge' | 'efficacite' | 'score'>('score');
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'radar'>('table');

  const bureauMetrics = useMemo(() => {
    const metrics: BureauMetrics[] = bureaux.map((bureau, index) => {
      // Simulation des données par bureau (à remplacer par vraies données)
      // Utilisation d'un seed basé sur le code du bureau pour consistance serveur/client
      const seed = bureau.code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const seededRandom = (min: number, max: number, offset: number = 0) => {
        const x = Math.sin(seed + offset) * 10000;
        return Math.floor((x - Math.floor(x)) * (max - min) + min);
      };

      const baseDemandes = seededRandom(50, 150, index);
      const baseValidations = Math.floor(baseDemandes * 0.75);
      const baseRejets = baseDemandes - baseValidations;

      const tauxValidation = baseDemandes > 0 ? (baseValidations / baseDemandes) * 100 : 0;
      const tauxRejet = baseDemandes > 0 ? (baseRejets / baseDemandes) * 100 : 0;
      const charge = bureau.tasks || seededRandom(10, 60, index + 100);
      const efficacite = bureau.completion || seededRandom(70, 100, index + 200);

      // Score composite (0-100)
      const score = tauxValidation * 0.4 + efficacite * 0.3 + (100 - tauxRejet) * 0.2 + Math.min(100, charge) * 0.1;

      return {
        code: bureau.code,
        name: bureau.name || bureau.code,
        demandes: baseDemandes,
        validations: baseValidations,
        rejets: baseRejets,
        tauxValidation,
        tauxRejet,
        charge,
        efficacite,
        score,
      };
    });

    // Trier selon la métrique sélectionnée
    return metrics.sort((a, b) => {
      const aValue = a[selectedMetric];
      const bValue = b[selectedMetric];
      return sortBy === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [bureaux, selectedMetric, sortBy]);

  const radarData = useMemo(() => {
    return bureauMetrics.slice(0, 5).map((bureau) => ({
      bureau: bureau.code,
      'Taux Validation': bureau.tauxValidation,
      'Efficacité': bureau.efficacite,
      'Charge': bureau.charge,
      'Score': bureau.score,
    }));
  }, [bureauMetrics]);

  const getRankColor = (rank: number, total: number) => {
    const percentage = (rank / total) * 100;
    if (percentage <= 25) return 'text-emerald-400';
    if (percentage <= 50) return 'text-blue-400';
    if (percentage <= 75) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <DashboardCard
      title="📊 Comparateur Multi-Bureaux"
      subtitle="Comparaison des performances par bureau"
      icon="📊"
      borderColor="#6366F1"
      className={className}
    >
      <div className="space-y-4">
        {/* Contrôles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {(['tauxValidation', 'charge', 'efficacite', 'score'] as const).map((metric) => (
              <Button
                key={metric}
                size="sm"
                variant={selectedMetric === metric ? 'warning' : 'ghost'}
                onClick={() => setSelectedMetric(metric)}
                className="text-xs capitalize"
              >
                {metric === 'tauxValidation'
                  ? 'Validation'
                  : metric === 'efficacite'
                  ? 'Efficacité'
                  : metric === 'charge'
                  ? 'Charge'
                  : 'Score'}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSortBy(sortBy === 'desc' ? 'asc' : 'desc')}
            className="text-xs"
          >
            <ArrowUpDown className="w-3 h-3 mr-1" />
            {sortBy === 'desc' ? 'Décroissant' : 'Croissant'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setViewMode(viewMode === 'table' ? 'radar' : 'table')}
            className="text-xs"
          >
            {viewMode === 'table' ? <BarChart3 className="w-3 h-3 mr-1" /> : <BarChart3 className="w-3 h-3 mr-1" />}
            {viewMode === 'table' ? 'Graphique' : 'Tableau'}
          </Button>
        </div>

        {/* Vue Graphique Radar - Simplifié pour compatibilité */}
        {viewMode === 'radar' && (
          <div className="h-64 p-4 rounded-lg bg-slate-800/30 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-2">Graphique radar</p>
              <p className="text-[10px] text-slate-400">
                Visualisation comparée des performances par bureau
              </p>
              <div className="mt-4 space-y-1">
                {radarData.slice(0, 3).map((item, idx) => (
                  <div key={item.bureau} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: `hsl(${idx * 60}, 70%, 50%)` }}
                    />
                    <span>{item.bureau}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vue Tableau */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className={cn('border-b', darkMode ? 'border-slate-700' : 'border-gray-200')}>
                  <th className="p-2 text-left">Rang</th>
                  <th className="p-2 text-left">Bureau</th>
                  <th className="p-2 text-right">Demandes</th>
                  <th className="p-2 text-right">Validations</th>
                  <th className="p-2 text-right">Taux Val.</th>
                  <th className="p-2 text-right">Efficacité</th>
                  <th className="p-2 text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {bureauMetrics.map((bureau, idx) => (
                  <tr
                    key={bureau.code}
                    className={cn(
                      'border-b transition-colors',
                      darkMode ? 'border-slate-700/50 hover:bg-slate-800/50' : 'border-gray-100 hover:bg-gray-50'
                    )}
                  >
                    <td className="p-2">
                      <span className={cn('font-bold', getRankColor(idx + 1, bureauMetrics.length))}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="p-2">
                      <BureauTag bureau={bureau.code} />
                    </td>
                    <td className="p-2 text-right">{bureau.demandes}</td>
                    <td className="p-2 text-right">{bureau.validations}</td>
                    <td className="p-2 text-right">
                      <Badge variant={bureau.tauxValidation >= 80 ? 'success' : bureau.tauxValidation >= 60 ? 'info' : 'warning'} className="text-[9px]">
                        {bureau.tauxValidation.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="p-2 text-right">
                      <Badge variant={bureau.efficacite >= 80 ? 'success' : bureau.efficacite >= 60 ? 'info' : 'warning'} className="text-[9px]">
                        {bureau.efficacite.toFixed(0)}%
                      </Badge>
                    </td>
                    <td className="p-2 text-right">
                      <span className={cn('font-bold', getScoreColor(bureau.score))}>
                        {bureau.score.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

