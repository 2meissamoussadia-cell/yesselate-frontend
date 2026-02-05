'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { TrendingUp, TrendingDown, Target, AlertTriangle, BarChart3 } from 'lucide-react';
import type { Bureau } from '@/lib/types/bmo.types';

interface MultiBureauComparatorProps {
  bureaux: Bureau[];
  performanceData: any[];
  enrichedData: any[];
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

export function MultiBureauComparator({
  bureaux,
  performanceData,
  enrichedData,
}: MultiBureauComparatorProps) {
  const { darkMode } = useAppStore();
  const [selectedMetric, setSelectedMetric] = useState<'tauxValidation' | 'charge' | 'efficacite' | 'score'>('score');
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('desc');

  const bureauMetrics = useMemo(() => {
    const metrics: BureauMetrics[] = bureaux.map(bureau => {
      const bureauData = enrichedData.filter((d: any) => d.bureau === bureau.code);
      
      const totalDemandes = bureauData.reduce((sum: number, d: any) => sum + (d.demandes || 0), 0);
      const totalValidations = bureauData.reduce((sum: number, d: any) => sum + (d.validations || 0), 0);
      const totalRejets = bureauData.reduce((sum: number, d: any) => sum + (d.rejets || 0), 0);
      
      const tauxValidation = totalDemandes > 0 ? (totalValidations / totalDemandes) * 100 : 0;
      const tauxRejet = totalDemandes > 0 ? (totalRejets / totalDemandes) * 100 : 0;
      const charge = bureau.tasks || 0;
      const efficacite = bureau.completion || 0;
      
      // Score composite (0-100)
      const score = (
        tauxValidation * 0.4 +
        efficacite * 0.3 +
        (100 - tauxRejet) * 0.2 +
        (charge > 0 ? Math.min(100, (bureauData.length / charge) * 100) : 0) * 0.1
      );

      return {
        code: bureau.code,
        name: bureau.name,
        demandes: totalDemandes,
        validations: totalValidations,
        rejets: totalRejets,
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
  }, [bureaux, enrichedData, selectedMetric, sortBy]);

  const maxValues = useMemo(() => {
    return {
      tauxValidation: Math.max(...bureauMetrics.map(m => m.tauxValidation)),
      charge: Math.max(...bureauMetrics.map(m => m.charge)),
      efficacite: Math.max(...bureauMetrics.map(m => m.efficacite)),
      score: Math.max(...bureauMetrics.map(m => m.score)),
    };
  }, [bureauMetrics]);

  const getRankColor = (rank: number, total: number) => {
    const percentage = (rank / total) * 100;
    if (percentage <= 25) return 'text-emerald-400'; // Top 25%
    if (percentage <= 50) return 'text-blue-400'; // Top 50%
    if (percentage <= 75) return 'text-amber-400'; // Top 75%
    return 'text-red-400'; // Bottom 25%
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Comparateur multi-bureaux
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMetric} onValueChange={(v: string) => setSelectedMetric(v as any)}>
              <SelectTrigger className={cn(
                'text-xs px-2 py-1 rounded border h-8 min-w-[140px]',
                'bg-slate-700 border-slate-600 text-white'
              )}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">Score global</SelectItem>
                <SelectItem value="tauxValidation">Taux validation</SelectItem>
                <SelectItem value="efficacite">Efficacité</SelectItem>
                <SelectItem value="charge">Charge</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setSortBy(sortBy === 'desc' ? 'asc' : 'desc')}
            >
              {sortBy === 'desc' ? '↓' : '↑'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bureauMetrics.map((bureau, idx) => {
            const rank = idx + 1;
            const maxValue = maxValues[selectedMetric];
            const percentage = (bureau[selectedMetric] / maxValue) * 100;

            return (
              <div
                key={bureau.code}
                className={cn(
                  'p-4 rounded-lg border-l-4 transition-all hover:shadow-md',
                  'bg-slate-700/30 border-slate-600',
                  rank <= 3 && 'border-l-orange-500'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm',
                      rank === 1 && 'bg-amber-500 text-white',
                      rank === 2 && 'bg-slate-500 text-white',
                      rank === 3 && 'bg-orange-600 text-white',
                      rank > 3 && 'bg-slate-600 text-slate-300'
                    )}>
                      {rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <BureauTag bureau={bureau.code} />
                        <span className="font-semibold text-sm">{bureau.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>Demandes: {bureau.demandes}</span>
                        <span>•</span>
                        <span>Validations: {bureau.validations}</span>
                        <span>•</span>
                        <span>Rejets: {bureau.rejets}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn('text-lg font-bold', getRankColor(rank, bureauMetrics.length))}>
                      {bureau[selectedMetric].toFixed(1)}
                      {selectedMetric === 'tauxValidation' || selectedMetric === 'efficacite' ? '%' : ''}
                    </div>
                    <div className="text-xs text-slate-400">
                      {selectedMetric === 'score' ? 'Score' :
                       selectedMetric === 'tauxValidation' ? 'Validation' :
                       selectedMetric === 'efficacite' ? 'Efficacité' : 'Charge'}
                    </div>
                  </div>
                </div>

                {/* Barres de progression */}
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Taux validation</span>
                      <span className={cn(
                        'font-semibold',
                        bureau.tauxValidation >= 80 ? 'text-emerald-400' :
                        bureau.tauxValidation >= 60 ? 'text-amber-400' : 'text-red-400'
                      )}>
                        {bureau.tauxValidation.toFixed(1)}%
                      </span>
                    </div>
                    <div className={cn(
                      'h-2 rounded-full overflow-hidden',
                      'bg-slate-700'
                    )}>
                      <div
                        className={cn(
                          'h-full transition-all',
                          bureau.tauxValidation >= 80 ? 'bg-emerald-500' :
                          bureau.tauxValidation >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        )}
                        style={{ width: `${bureau.tauxValidation}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Efficacité</span>
                      <span className={cn(
                        'font-semibold',
                        bureau.efficacite >= 80 ? 'text-emerald-400' :
                        bureau.efficacite >= 60 ? 'text-blue-400' : 'text-amber-400'
                      )}>
                        {bureau.efficacite.toFixed(0)}%
                      </span>
                    </div>
                    <div className={cn(
                      'h-2 rounded-full overflow-hidden',
                      'bg-slate-700'
                    )}>
                      <div
                        className={cn(
                          'h-full transition-all',
                          bureau.efficacite >= 80 ? 'bg-emerald-500' :
                          bureau.efficacite >= 60 ? 'bg-blue-500' : 'bg-amber-500'
                        )}
                        style={{ width: `${bureau.efficacite}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Badges de performance */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-700/50">
                  {bureau.tauxValidation >= 85 && (
                    <Badge variant="success" className="text-[9px]">
                      <Target className="w-3 h-3 mr-1" />
                      Excellent
                    </Badge>
                  )}
                  {bureau.tauxRejet > 20 && (
                    <Badge variant="urgent" className="text-[9px]">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Rejets élevés
                    </Badge>
                  )}
                  {bureau.charge > 20 && (
                    <Badge variant="warning" className="text-[9px]">
                      Charge élevée
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

