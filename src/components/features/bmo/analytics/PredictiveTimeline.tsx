'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PredictiveTimelineProps {
  enrichedData: any[];
  monthsAhead?: number;
}

export function PredictiveTimeline({ enrichedData, monthsAhead = 3 }: PredictiveTimelineProps) {
  const { darkMode } = useAppStore();

  const timelineData = useMemo(() => {
    if (enrichedData.length < 3) return [];

    // Calculer la tendance linéaire
    const recentMonths = enrichedData.slice(-6);
    
    const calculateTrend = (values: number[]) => {
      const n = values.length;
      const sumX = (n * (n + 1)) / 2;
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = values.reduce((sum, val, idx) => sum + (idx + 1) * val, 0);
      const sumXX = (n * (n + 1) * (2 * n + 1)) / 6;
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return { slope, intercept };
    };

    const demandes = recentMonths.map(d => d.demandes);
    const validations = recentMonths.map(d => d.validations);
    const budget = recentMonths.map(d => d.budget);

    const demandesTrend = calculateTrend(demandes);
    const validationsTrend = calculateTrend(validations);
    const budgetTrend = calculateTrend(budget);

    // Générer les données historiques
    const historical = enrichedData.map((d, idx) => ({
      month: d.month,
      demandes: d.demandes,
      validations: d.validations,
      budget: d.budget,
      type: 'historical' as const,
    }));

    // Générer les prédictions
    const predictions = [];
    const lastIndex = enrichedData.length;
    
    for (let i = 1; i <= monthsAhead; i++) {
      const monthIndex = lastIndex + i;
      const monthName = new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { month: 'short' });
      
      predictions.push({
        month: monthName,
        demandes: Math.round(demandesTrend.intercept + demandesTrend.slope * (recentMonths.length + i)),
        validations: Math.round(validationsTrend.intercept + validationsTrend.slope * (recentMonths.length + i)),
        budget: Math.max(0, budgetTrend.intercept + budgetTrend.slope * (recentMonths.length + i)),
        type: 'prediction' as const,
      });
    }

    return [...historical, ...predictions];
  }, [enrichedData, monthsAhead]);

  const risks = useMemo(() => {
    const risksList: any[] = [];
    const predictions = timelineData.filter(d => d.type === 'prediction');
    
    predictions.forEach((pred, idx) => {
      const lastActual = enrichedData[enrichedData.length - 1];
      
      // Risque de surcharge
      if (pred.demandes > lastActual.demandes * 1.3) {
        risksList.push({
          month: pred.month,
          type: 'surcharge',
          severity: 'high',
          description: `Surcharge prévue: ${pred.demandes} demandes (+${((pred.demandes - lastActual.demandes) / lastActual.demandes * 100).toFixed(0)}%)`,
        });
      }
      
      // Risque de baisse de validation
      const validationRate = (pred.validations / pred.demandes) * 100;
      if (validationRate < 60) {
        risksList.push({
          month: pred.month,
          type: 'performance',
          severity: 'medium',
          description: `Taux de validation prévu: ${validationRate.toFixed(1)}% (< 60%)`,
        });
      }
    });

    return risksList;
  }, [timelineData, enrichedData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Timeline prédictive ({monthsAhead} mois à venir)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Graphique de projection */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="demandes"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Demandes"
                strokeDasharray={timelineData.some(d => d.type === 'prediction') ? '0' : '5 5'}
                dot={(props: any) => {
                  const isPrediction = timelineData[props.index]?.type === 'prediction';
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={isPrediction ? 4 : 3}
                      fill={isPrediction ? '#F97316' : '#3B82F6'}
                      stroke={isPrediction ? '#fff' : 'none'}
                      strokeWidth={1}
                    />
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="validations"
                stroke="#10B981"
                strokeWidth={2}
                name="Validations"
                strokeDasharray={timelineData.some(d => d.type === 'prediction') ? '0' : '5 5'}
                dot={(props: any) => {
                  const isPrediction = timelineData[props.index]?.type === 'prediction';
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={isPrediction ? 4 : 3}
                      fill={isPrediction ? '#F97316' : '#10B981'}
                      stroke={isPrediction ? '#fff' : 'none'}
                      strokeWidth={1}
                    />
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Légende */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-blue-500"></div>
            <span>Historique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 bg-orange-500 border border-white"></div>
            <span>Prédiction</span>
          </div>
        </div>

        {/* Alertes de risques */}
        {risks.length > 0 && (
          <div className={cn(
            'p-3 rounded-lg border-l-4',
            'border-l-amber-500 bg-amber-500/10'
          )}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-sm">Risques identifiés</span>
            </div>
            <div className="space-y-1">
              {risks.map((risk, idx) => (
                <div key={idx} className="text-xs text-slate-300">
                  <Badge variant="warning" className="text-[9px] mr-2">
                    {risk.month}
                  </Badge>
                  {risk.description}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Résumé des prévisions */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {timelineData
            .filter(d => d.type === 'prediction')
            .slice(0, 3)
            .map((pred, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-2 rounded border',
                  'bg-slate-700/30 border-orange-500/30'
                )}
              >
                <div className="font-semibold text-orange-400 mb-1">{pred.month}</div>
                <div className="text-slate-400">
                  <div>Demandes: {pred.demandes}</div>
                  <div>Validations: {pred.validations}</div>
                  <div>Budget: {pred.budget.toFixed(1)}</div>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

