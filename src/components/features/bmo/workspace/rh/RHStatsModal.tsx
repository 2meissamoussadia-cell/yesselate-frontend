'use client';

import { useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { demandesRH } from '@/lib/data/bmo-mock-2';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Calendar,
  DollarSign, AlertTriangle, CheckCircle2, Clock, XCircle
} from 'lucide-react';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RHStatsModal({ open, onOpenChange }: Props) {
  // Calcul des statistiques avancées
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    
    // Demandes ce mois
    const thisMonthDemands = demandesRH.filter(d => {
      const demandDate = d.date.split('/');
      const month = parseInt(demandDate[1]) - 1;
      return month === thisMonth;
    });
    
    // Demandes mois dernier
    const lastMonthDemands = demandesRH.filter(d => {
      const demandDate = d.date.split('/');
      const month = parseInt(demandDate[1]) - 1;
      return month === lastMonth;
    });
    
    // Statistiques par type
    const byType = {
      Congé: demandesRH.filter(d => d.type === 'Congé').length,
      Dépense: demandesRH.filter(d => d.type === 'Dépense').length,
      Maladie: demandesRH.filter(d => d.type === 'Maladie').length,
      Déplacement: demandesRH.filter(d => d.type === 'Déplacement').length,
      Paie: demandesRH.filter(d => d.type === 'Paie').length,
    };
    
    // Statistiques par bureau
    const byBureau = demandesRH.reduce((acc, d) => {
      acc[d.bureau] = (acc[d.bureau] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Statistiques par statut
    const byStatus = {
      pending: demandesRH.filter(d => d.status === 'pending').length,
      validated: demandesRH.filter(d => d.status === 'validated').length,
      rejected: demandesRH.filter(d => d.status === 'rejected').length,
    };
    
    // Taux de validation
    const totalProcessed = byStatus.validated + byStatus.rejected;
    const validationRate = totalProcessed > 0 
      ? Math.round((byStatus.validated / totalProcessed) * 100) 
      : 0;
    
    // Délai moyen de traitement (simulation)
    const avgProcessingTime = 2.3;
    
    // Tendance
    const trend = thisMonthDemands.length > lastMonthDemands.length 
      ? 'up' 
      : thisMonthDemands.length < lastMonthDemands.length 
        ? 'down' 
        : 'same';
    
    const trendPercent = lastMonthDemands.length > 0
      ? Math.abs(Math.round(((thisMonthDemands.length - lastMonthDemands.length) / lastMonthDemands.length) * 100))
      : 0;
    
    // Montants
    const totalAmounts = demandesRH.reduce((sum, d) => {
      if (d.amount && typeof d.amount === 'string') {
        return sum + parseFloat(d.amount.replace(/,/g, ''));
      }
      return sum;
    }, 0);
    
    const avgAmount = demandesRH.filter(d => d.amount).length > 0
      ? totalAmounts / demandesRH.filter(d => d.amount).length
      : 0;
    
    // Jours de congés
    const totalDays = demandesRH.reduce((sum, d) => sum + (d.days || 0), 0);
    const avgDays = demandesRH.filter(d => d.days).length > 0
      ? totalDays / demandesRH.filter(d => d.days).length
      : 0;
    
    // Top employés
    const byEmployee = demandesRH.reduce((acc, d) => {
      acc[d.agent] = (acc[d.agent] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topEmployees = Object.entries(byEmployee)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    // Urgences
    const urgentCount = demandesRH.filter(d => 
      d.priority === 'urgent' && d.status === 'pending'
    ).length;
    
    return {
      total: demandesRH.length,
      thisMonth: thisMonthDemands.length,
      lastMonth: lastMonthDemands.length,
      trend,
      trendPercent,
      byType,
      byBureau,
      byStatus,
      validationRate,
      avgProcessingTime,
      totalAmounts,
      avgAmount,
      totalDays,
      avgDays,
      topEmployees,
      urgentCount,
    };
  }, []);

  return (
    <FluentModal
      open={open}
      title="Statistiques RH Avancées"
      onClose={() => onOpenChange(false)}
      maxWidth="5xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        {/* Vue d'ensemble */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-orange-500" />
            Vue d&apos;ensemble
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.total}
                </div>
                <div className="text-xs text-slate-400">Total demandes</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-600">
                  {stats.byStatus.pending}
                </div>
                <div className="text-xs text-slate-400">En attente</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.validationRate}%
                </div>
                <div className="text-xs text-slate-400">Taux validation</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.avgProcessingTime}j
                </div>
                <div className="text-xs text-slate-400">Délai moyen</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tendance */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              {stats.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
              {stats.trend === 'down' && <TrendingDown className="w-4 h-4 text-emerald-500" />}
              {stats.trend === 'same' && <BarChart3 className="w-4 h-4 text-slate-400" />}
              Tendance mensuelle
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Ce mois-ci</div>
                <div className="text-3xl font-bold">{stats.thisMonth}</div>
              </div>
              
              <div className="flex items-center gap-2">
                {stats.trend === 'up' && (
                  <Badge variant="destructive">
                    +{stats.trendPercent}%
                  </Badge>
                )}
                {stats.trend === 'down' && (
                  <Badge variant="success">
                    -{stats.trendPercent}%
                  </Badge>
                )}
                {stats.trend === 'same' && (
                  <Badge variant="default">
                    Stable
                  </Badge>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-sm text-slate-400">Mois dernier</div>
                <div className="text-2xl font-semibold text-slate-400">{stats.lastMonth}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Répartition par type */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            Répartition par type
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(stats.byType).map(([type, count]) => {
              const icons: Record<string, string> = {
                Congé: '🏖️',
                Dépense: '💸',
                Maladie: '🏥',
                Déplacement: '✈️',
                Paie: '💰',
              };
              
              const percent = Math.round((count / stats.total) * 100);
              
              return (
                <Card key={type}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{icons[type]}</span>
                        <span className="font-medium">{type}</span>
                      </div>
                      <Badge variant="default">{count}</Badge>
                    </div>
                    
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-orange-500 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    
                    <div className="text-xs text-slate-400 mt-1">
                      {percent}% du total
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Répartition par bureau */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            Répartition par bureau
          </h3>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                {Object.entries(stats.byBureau)
                  .sort((a, b) => b[1] - a[1])
                  .map(([bureau, count]) => {
                    const percent = Math.round((count / stats.total) * 100);
                    
                    return (
                      <div key={bureau} className="flex items-center gap-3">
                        <div className="w-16 text-sm font-medium">{bureau}</div>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="w-12 text-right text-sm font-semibold">{count}</div>
                        <div className="w-16 text-right text-xs text-slate-400">{percent}%</div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques financières */}
        {stats.totalAmounts > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Impact financier
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400 mb-1">Montant total</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {stats.totalAmounts.toLocaleString()} FCFA
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400 mb-1">Montant moyen</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(stats.avgAmount).toLocaleString()} FCFA
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Statistiques congés */}
        {stats.totalDays > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Jours d&apos;absence
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400 mb-1">Total jours</div>
                  <div className="text-2xl font-bold text-amber-600">
                    {stats.totalDays}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-400 mb-1">Durée moyenne</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.avgDays.toFixed(1)} jours
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Top employés */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            Top 5 employés (nombre de demandes)
          </h3>
          
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                {stats.topEmployees.map(([employee, count], idx) => (
                  <div 
                    key={employee}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      idx === 0 && "bg-amber-500 text-white",
                      idx === 1 && "bg-slate-400 text-white",
                      idx === 2 && "bg-orange-600 text-white",
                      idx >= 3 && "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    )}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 text-sm font-medium">{employee}</div>
                    <Badge variant="default">{count} demandes</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes */}
        {stats.urgentCount > 0 && (
          <Card className="border-red-500/50 bg-red-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <div className="font-semibold text-red-600 dark:text-red-400">
                    {stats.urgentCount} demande(s) urgente(s) en attente
                  </div>
                  <div className="text-sm text-slate-400">
                    Action immédiate requise
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </FluentModal>
  );
}

