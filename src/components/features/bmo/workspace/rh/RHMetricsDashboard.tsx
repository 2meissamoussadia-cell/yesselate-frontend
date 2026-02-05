'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { demandesRH } from '@/lib/data/bmo-mock-2';
import { 
  TrendingUp, TrendingDown, Minus, Clock, Users, FileText,
  CheckCircle2, XCircle, AlertTriangle, BarChart3, PieChart,
  Target, Zap, Award, Calendar, DollarSign, Activity
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type MetricCard = {
  id: string;
  label: string;
  value: number | string;
  previousValue?: number;
  unit?: string;
  icon: typeof TrendingUp;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  target?: number;
};

type ChartData = {
  label: string;
  value: number;
  color: string;
};

// ============================================
// COMPOSANTS
// ============================================

function TrendIndicator({ trend, value }: { trend?: 'up' | 'down' | 'neutral'; value?: number }) {
  if (!trend || trend === 'neutral') {
    return <Minus className="w-4 h-4 text-slate-400" />;
  }

  if (trend === 'up') {
    return (
      <div className="flex items-center gap-1 text-emerald-500">
        <TrendingUp className="w-4 h-4" />
        {value !== undefined && <span className="text-xs font-medium">+{value}%</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-red-500">
      <TrendingDown className="w-4 h-4" />
      {value !== undefined && <span className="text-xs font-medium">{value}%</span>}
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
      <div 
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

function MiniChart({ data }: { data: ChartData[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  return (
    <div className="flex items-center gap-1 h-8">
      {data.map((d, i) => (
        <div
          key={i}
          className={cn("rounded-sm transition-all", d.color)}
          style={{ 
            height: `${Math.max((d.value / Math.max(...data.map(x => x.value))) * 100, 10)}%`,
            width: '12px',
          }}
          title={`${d.label}: ${d.value} (${((d.value / total) * 100).toFixed(1)}%)`}
        />
      ))}
    </div>
  );
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function RHMetricsDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [selectedPeriod]);

  // Calcul des métriques
  const metrics = useMemo(() => {
    const pending = demandesRH.filter(d => d.status === 'pending');
    const validated = demandesRH.filter(d => d.status === 'validated');
    const rejected = demandesRH.filter(d => d.status === 'rejected');
    const urgent = pending.filter(d => d.priority === 'urgent');
    
    // Calcul du taux de validation
    const total = validated.length + rejected.length;
    const validationRate = total > 0 ? ((validated.length / total) * 100).toFixed(1) : 0;
    
    // Temps moyen de traitement (simulé)
    const avgProcessingTime = 2.5; // jours
    
    // Montant total des dépenses validées
    const totalAmount = validated
      .filter(d => d.type === 'Dépense' && d.amount)
      .reduce((sum, d) => {
        const amount = typeof d.amount === 'string' 
          ? parseFloat(d.amount.replace(/,/g, ''))
          : 0;
        return sum + amount;
      }, 0);

    return {
      pending: pending.length,
      validated: validated.length,
      rejected: rejected.length,
      urgent: urgent.length,
      validationRate,
      avgProcessingTime,
      totalAmount,
      total: demandesRH.length,
    };
  }, []);

  // Distribution par type
  const typeDistribution = useMemo<ChartData[]>(() => {
    const types = ['Congé', 'Dépense', 'Maladie', 'Déplacement', 'Paie'];
    const colors = ['bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-blue-500', 'bg-purple-500'];
    
    return types.map((type, i) => ({
      label: type,
      value: demandesRH.filter(d => d.type === type).length,
      color: colors[i],
    }));
  }, []);

  // Distribution par bureau
  const bureauDistribution = useMemo<ChartData[]>(() => {
    const bureaux = [...new Set(demandesRH.map(d => d.bureau))];
    const colors = ['bg-orange-500', 'bg-teal-500', 'bg-pink-500', 'bg-indigo-500', 'bg-cyan-500'];
    
    return bureaux.map((bureau, i) => ({
      label: bureau,
      value: demandesRH.filter(d => d.bureau === bureau).length,
      color: colors[i % colors.length],
    }));
  }, []);

  // Cartes de métriques principales
  const metricCards: MetricCard[] = [
    {
      id: 'pending',
      label: 'En attente',
      value: metrics.pending,
      icon: Clock,
      color: 'bg-amber-500/10 text-amber-500',
      trend: metrics.pending > 10 ? 'up' : 'neutral',
      trendValue: 12,
      target: 5,
    },
    {
      id: 'validated',
      label: 'Validées',
      value: metrics.validated,
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 text-emerald-500',
      trend: 'up',
      trendValue: 8,
    },
    {
      id: 'rejected',
      label: 'Rejetées',
      value: metrics.rejected,
      icon: XCircle,
      color: 'bg-red-500/10 text-red-500',
      trend: metrics.rejected > 5 ? 'up' : 'down',
      trendValue: -5,
    },
    {
      id: 'urgent',
      label: 'Urgentes',
      value: metrics.urgent,
      icon: AlertTriangle,
      color: 'bg-rose-500/10 text-rose-500',
      trend: metrics.urgent > 3 ? 'up' : 'neutral',
    },
    {
      id: 'rate',
      label: 'Taux validation',
      value: `${metrics.validationRate}%`,
      icon: Target,
      color: 'bg-blue-500/10 text-blue-500',
      trend: Number(metrics.validationRate) > 80 ? 'up' : 'down',
      target: 90,
    },
    {
      id: 'time',
      label: 'Délai moyen',
      value: metrics.avgProcessingTime,
      unit: 'jours',
      icon: Activity,
      color: 'bg-purple-500/10 text-purple-500',
      trend: metrics.avgProcessingTime < 3 ? 'up' : 'down',
      target: 2,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de période */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-500" />
            Tableau de bord RH
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Vue d&apos;ensemble des performances
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {(['day', 'week', 'month', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                selectedPeriod === period
                  ? "bg-white dark:bg-slate-700 shadow-sm"
                  : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {period === 'day' ? 'Jour' : period === 'week' ? 'Semaine' : period === 'month' ? 'Mois' : 'Année'}
            </button>
          ))}
        </div>
      </div>

      {/* Cartes de métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metricCards.map(card => {
          const Icon = card.icon;
          return (
            <Card key={card.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("p-2 rounded-xl", card.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <TrendIndicator trend={card.trend} value={card.trendValue} />
                </div>

                <div className="text-2xl font-bold">
                  {card.value}
                  {card.unit && <span className="text-sm font-normal text-slate-400 ml-1">{card.unit}</span>}
                </div>
                <div className="text-xs text-slate-400 mt-1">{card.label}</div>

                {card.target && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span>Objectif: {card.target}</span>
                      <span>{Math.round((Number(card.value) / card.target) * 100)}%</span>
                    </div>
                    <ProgressBar 
                      value={Number(card.value)} 
                      max={card.target} 
                      color={Number(card.value) >= card.target ? 'bg-emerald-500' : 'bg-amber-500'}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Graphiques de distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distribution par type */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-orange-500" />
              Répartition par type
            </h3>

            <div className="space-y-3">
              {typeDistribution.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", item.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm text-slate-400">{item.value}</span>
                    </div>
                    <ProgressBar 
                      value={item.value} 
                      max={Math.max(...typeDistribution.map(d => d.value))} 
                      color={item.color}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <MiniChart data={typeDistribution} />
            </div>
          </CardContent>
        </Card>

        {/* Distribution par bureau */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Répartition par bureau
            </h3>

            <div className="space-y-3">
              {bureauDistribution.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", item.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-sm text-slate-400">{item.value}</span>
                    </div>
                    <ProgressBar 
                      value={item.value} 
                      max={Math.max(...bureauDistribution.map(d => d.value))} 
                      color={item.color}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <MiniChart data={bureauDistribution} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPIs supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Montant total */}
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Montant total validé</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {metrics.totalAmount.toLocaleString()} FCFA
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Dépenses approuvées
                </div>
              </div>
              <DollarSign className="w-12 h-12 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Score de performance</div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  92%
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  +5% vs période précédente
                </div>
              </div>
              <Award className="w-12 h-12 text-blue-500/30" />
            </div>
          </CardContent>
        </Card>

        {/* Productivité */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400 mb-1">Demandes / jour</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  8.5
                </div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Objectif: 10 / jour
                </div>
              </div>
              <Activity className="w-12 h-12 text-purple-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

