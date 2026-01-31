/**
 * BureauComparisonModal.tsx
 * =========================
 * 
 * Modal de comparaison détaillée des bureaux
 * Affiche des graphiques, tableaux et métriques comparatives
 */

'use client';

import React, { useState, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, TrendingDown, ArrowUpDown, DollarSign, Activity, 
  CheckCircle2, XCircle, Clock, Target, BarChart3, Building2
} from 'lucide-react';
import { calculateBureauPerformance, calculateFinancialPerformance } from '@/lib/data/analytics';
import { formatFCFA } from '@/lib/utils/format-currency';
import { bureaux } from '@/lib/data';
import { cn } from '@/lib/utils';

interface BureauComparisonModalProps {
  open: boolean;
  onClose: () => void;
  data?: {
    selectedBureaux?: string[];
  };
}

export function BureauComparisonModal({ open, onClose, data }: BureauComparisonModalProps) {
  const [selectedBureaux, setSelectedBureaux] = useState<string[]>(
    data?.selectedBureaux || []
  );
  const [viewMode, setViewMode] = useState<'performance' | 'financial' | 'overview'>('overview');

  const bureauPerf = useMemo(() => calculateBureauPerformance(), []);
  const financialPerf = useMemo(() => calculateFinancialPerformance(), []);

  // Si aucun bureau n'est sélectionné, sélectionner les 5 premiers par défaut
  const effectiveSelectedBureaux = useMemo(() => {
    if (selectedBureaux.length > 0) return selectedBureaux;
    return bureauPerf.slice(0, 5).map(b => b.bureauCode);
  }, [selectedBureaux, bureauPerf]);

  const toggleBureau = (code: string) => {
    setSelectedBureaux(prev => 
      prev.includes(code) 
        ? prev.filter(b => b !== code)
        : [...prev, code]
    );
  };

  const selectedPerformanceData = useMemo(() => {
    return bureauPerf.filter(b => effectiveSelectedBureaux.includes(b.bureauCode));
  }, [bureauPerf, effectiveSelectedBureaux]);

  const selectedFinancialData = useMemo(() => {
    return financialPerf.filter(b => effectiveSelectedBureaux.includes(b.bureauCode));
  }, [financialPerf, effectiveSelectedBureaux]);

  // Données pour graphiques
  const performanceChartData = selectedPerformanceData.map(b => ({
    bureau: b.bureauCode,
    score: b.score,
    validation: b.validationRate,
    sla: b.slaCompliance,
    delai: Math.max(0, 100 - b.avgDelay * 10),
    total: b.totalDemands,
  }));

  const financialChartData = selectedFinancialData.map(b => ({
    bureau: b.bureauCode,
    budgetUtilization: b.budgetUtilization,
    marginRate: b.marginRate,
    collectionRate: b.collectionRate,
    revenues: b.revenues / 1000000, // En millions
    expenses: b.expenses / 1000000,
  }));

  // Données pour radar
  const radarData = [
    {
      metric: 'Score',
      ...Object.fromEntries(selectedPerformanceData.map(b => [b.bureauCode, b.score])),
    },
    {
      metric: 'Validation %',
      ...Object.fromEntries(selectedPerformanceData.map(b => [b.bureauCode, b.validationRate])),
    },
    {
      metric: 'SLA %',
      ...Object.fromEntries(selectedPerformanceData.map(b => [b.bureauCode, b.slaCompliance])),
    },
    {
      metric: 'Efficacité',
      ...Object.fromEntries(selectedPerformanceData.map(b => [b.bureauCode, Math.max(0, 100 - b.avgDelay * 10)])),
    },
  ];

  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-400" />
          <span>Comparaison des Bureaux</span>
        </div>
      }
      maxWidth="5xl"
      dark
    >
      <div className="space-y-6">
        {/* Sélection des bureaux */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Sélectionner les bureaux à comparer ({effectiveSelectedBureaux.length} sélectionné{effectiveSelectedBureaux.length > 1 ? 's' : ''})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {bureaux.map((bureau) => {
              const perf = bureauPerf.find(b => b.bureauCode === bureau.code);
              const isSelected = effectiveSelectedBureaux.includes(bureau.code);
              
              return (
                <button
                  key={bureau.code}
                  onClick={() => toggleBureau(bureau.code)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    isSelected
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{bureau.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-200 truncate">{bureau.code}</div>
                      <div className="text-xs text-slate-400 truncate">{bureau.name}</div>
                    </div>
                  </div>
                  {perf && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        className={cn(
                          'text-xs',
                          perf.score >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          perf.score >= 60 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border-red-500/30'
                        )}
                      >
                        {perf.score}
                      </Badge>
                      <span className="text-xs text-slate-400">{perf.totalDemands} dem.</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs de vue */}
        <div className="flex gap-2 border-b border-slate-700">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
            { id: 'performance', label: 'Performance', icon: Activity },
            { id: 'financial', label: 'Financier', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id as typeof viewMode)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2',
                  viewMode === tab.id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenu selon la vue */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Métriques clés */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedPerformanceData.map((bureau, idx) => (
                <div key={bureau.bureauCode} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{bureaux.find(b => b.code === bureau.bureauCode)?.icon}</span>
                    <span className="font-semibold text-sm text-slate-200">{bureau.bureauCode}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Score</span>
                      <Badge className={cn(
                        'text-xs',
                        bureau.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                        bureau.score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-red-500/20 text-red-400'
                      )}>
                        {bureau.score}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Validation</span>
                      <span className="text-xs text-slate-300">{bureau.validationRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">SLA</span>
                      <span className="text-xs text-slate-300">{bureau.slaCompliance}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Graphique en barres */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Comparaison des performances</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="bureau" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    wrapperStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="score" fill="#F97316" name="Score" />
                  <Bar dataKey="validation" fill="#3B82F6" name="Validation %" />
                  <Bar dataKey="sla" fill="#10B981" name="SLA %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Graphique radar */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Analyse radar</h3>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#475569" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                  {effectiveSelectedBureaux.map((code, idx) => (
                    <Radar
                      key={code}
                      name={code}
                      dataKey={code}
                      stroke={COLORS[idx % COLORS.length]}
                      fill={COLORS[idx % COLORS.length]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Tooltip 
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    wrapperStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }} 
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {viewMode === 'performance' && (
          <div className="space-y-6">
            {/* Tableau de performance */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-200">Détails de performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Bureau</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Score</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Total</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Validées</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">En attente</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Rejetées</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Retard</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Taux Valid.</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">SLA %</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Délai moy.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPerformanceData.map((bureau) => (
                      <tr key={bureau.bureauCode} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span>{bureaux.find(b => b.code === bureau.bureauCode)?.icon}</span>
                            <div>
                              <div className="text-sm font-medium text-slate-200">{bureau.bureauCode}</div>
                              <div className="text-xs text-slate-400">{bureau.bureauName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge className={cn(
                            'text-xs',
                            bureau.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                            bureau.score >= 60 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          )}>
                            {bureau.score}
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-4 text-sm text-slate-300">{bureau.totalDemands}</td>
                        <td className="text-center py-3 px-4 text-sm text-emerald-400">{bureau.validated}</td>
                        <td className="text-center py-3 px-4 text-sm text-amber-400">{bureau.pending}</td>
                        <td className="text-center py-3 px-4 text-sm text-red-400">{bureau.rejected}</td>
                        <td className="text-center py-3 px-4 text-sm text-red-400">{bureau.overdue}</td>
                        <td className="text-center py-3 px-4 text-sm text-slate-300">{bureau.validationRate}%</td>
                        <td className="text-center py-3 px-4 text-sm text-slate-300">{bureau.slaCompliance}%</td>
                        <td className="text-center py-3 px-4 text-sm text-slate-300">{bureau.avgDelay}j</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'financial' && (
          <div className="space-y-6">
            {/* Graphique financier */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Comparaison financière</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis dataKey="bureau" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e2e8f0',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    wrapperStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#e2e8f0'
                    }} 
                  />
                  <Legend />
                  <Bar dataKey="revenues" fill="#10B981" name="Revenus (M FCFA)" />
                  <Bar dataKey="expenses" fill="#F97316" name="Dépenses (M FCFA)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tableau financier */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-200">Détails financiers</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">Bureau</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">Budget Total</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">Consommé</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">Restant</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Utilisation</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">Revenus</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">Dépenses</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400">Résultat Net</th>
                      <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">Marge %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFinancialData.map((bureau) => (
                      <tr key={bureau.bureauCode} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span>{bureaux.find(b => b.code === bureau.bureauCode)?.icon}</span>
                            <div>
                              <div className="text-sm font-medium text-slate-200">{bureau.bureauCode}</div>
                              <div className="text-xs text-slate-400">{bureau.bureauName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-slate-300">{formatFCFA(bureau.budgetTotal)}</td>
                        <td className="text-right py-3 px-4 text-sm text-slate-300">{formatFCFA(bureau.budgetConsumed)}</td>
                        <td className="text-right py-3 px-4 text-sm text-emerald-400">{formatFCFA(bureau.budgetRemaining)}</td>
                        <td className="text-center py-3 px-4">
                          <Badge className={cn(
                            'text-xs',
                            bureau.budgetUtilization >= 90 ? 'bg-red-500/20 text-red-400' :
                            bureau.budgetUtilization >= 75 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          )}>
                            {bureau.budgetUtilization}%
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4 text-sm text-emerald-400">{formatFCFA(bureau.revenues)}</td>
                        <td className="text-right py-3 px-4 text-sm text-red-400">{formatFCFA(bureau.expenses)}</td>
                        <td className="text-right py-3 px-4 text-sm font-medium">
                          <span className={bureau.netResult >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {formatFCFA(bureau.netResult)}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge className={cn(
                            'text-xs',
                            bureau.marginRate >= 20 ? 'bg-emerald-500/20 text-emerald-400' :
                            bureau.marginRate >= 10 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          )}>
                            {bureau.marginRate.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <FluentButton variant="secondary" onClick={onClose}>
            Fermer
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

