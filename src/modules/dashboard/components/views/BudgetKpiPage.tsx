/**
 * Page KPIs Budget
 * Affiche les indicateurs budgétaires et financiers
 * Version optimisée avec paiements en retard et rentabilité
 */

'use client';

import React, { useCallback, memo, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, PieChart, BarChart3, AlertTriangle, CheckCircle, Clock, Calendar, TrendingDown as TrendingDownIcon, Percent, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SparklineChart } from '../shared/SparklineChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { ExportButton } from '../shared/ExportButton';

interface PaiementRetard {
  id: string;
  projet: string;
  montant: number;
  joursRetard: number;
  priorite: 'critique' | 'haute' | 'moyenne';
}

interface Rentabilite {
  id: string;
  projet: string;
  investissement: number;
  retourAttendu: number;
  retourReel: number;
  marge: number;
}

function BudgetKpiPage() {
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);

  const handleKPIClick = useCallback((kpi: any) => {
    openModal('kpi-drilldown', {
      kpi: {
        label: kpi.label,
        value: kpi.value,
        delta: kpi.trend,
        tone: kpi.color === 'emerald' || kpi.color === 'cyan' ? 'ok' : kpi.color === 'amber' || kpi.color === 'orange' ? 'warn' : kpi.color === 'red' ? 'crit' : 'info',
        trend: kpi.trendDirection === 'up' ? 'up' : kpi.trendDirection === 'down' ? 'down' : 'neutral',
        icon: kpi.icon,
      },
    });
  }, [openModal]);

  // Données budgétaires avec sparklines
  const budgetKPIs = [
    {
      id: 'total',
      label: 'Budget total',
      value: '4.2 Mds',
      trend: '+5%',
      trendDirection: 'up' as const,
      icon: DollarSign,
      color: 'blue',
      description: 'FCFA alloués',
      sparkline: [3.8, 3.9, 4.0, 4.0, 4.1, 4.1, 4.2],
    },
    {
      id: 'consomme',
      label: 'Budget consommé',
      value: '67%',
      trend: '+2%',
      trendDirection: 'up' as const,
      icon: Wallet,
      color: 'orange',
      description: 'du budget total',
      sparkline: [60, 62, 63, 64, 65, 66, 67],
    },
    {
      id: 'reste',
      label: 'Budget restant',
      value: '1.4 Mds',
      trend: '-2%',
      trendDirection: 'down' as const,
      icon: PieChart,
      color: 'emerald',
      description: 'FCFA disponibles',
      sparkline: [1.6, 1.55, 1.5, 1.45, 1.42, 1.41, 1.4],
    },
    {
      id: 'moyen',
      label: 'Budget moyen/projet',
      value: '125M',
      trend: '—',
      trendDirection: 'neutral' as const,
      icon: BarChart3,
      color: 'purple',
      description: 'FCFA par projet',
      sparkline: [120, 122, 123, 124, 124, 125, 125],
    },
    {
      id: 'paiements',
      label: 'Paiements en retard',
      value: '8.5M',
      trend: '-2.1M',
      trendDirection: 'down' as const,
      icon: Calendar,
      color: 'red',
      description: 'FCFA non réglés',
      sparkline: [12.5, 11.8, 11.0, 10.5, 9.8, 9.2, 8.5],
    },
    {
      id: 'rentabilite',
      label: 'Rentabilité moyenne',
      value: '18%',
      trend: '+2%',
      trendDirection: 'up' as const,
      icon: Percent,
      color: 'emerald',
      description: 'marge bénéficiaire',
      sparkline: [14, 15, 15.5, 16, 16.5, 17, 18],
    },
    {
      id: 'alerte',
      label: 'Projets en alerte',
      value: '3',
      trend: '-1',
      trendDirection: 'down' as const,
      icon: AlertTriangle,
      color: 'amber',
      description: 'dépassement budget',
      sparkline: [5, 5, 4, 4, 4, 3, 3],
    },
    {
      id: 'conforme',
      label: 'Conformité budget',
      value: '94%',
      trend: '+1%',
      trendDirection: 'up' as const,
      icon: CheckCircle,
      color: 'cyan',
      description: 'projets conformes',
      sparkline: [90, 91, 91.5, 92, 92.5, 93, 94],
    },
  ];

  const budgetDetails = [
    {
      projet: 'Villa Diamniadio',
      budget: '36.4M',
      consomme: '24.7M',
      pourcentage: 68,
      statut: 'normal' as const,
    },
    {
      projet: 'Complexe Résidentiel',
      budget: '28.2M',
      consomme: '22.1M',
      pourcentage: 78,
      statut: 'attention' as const,
    },
    {
      projet: 'Infrastructure Route',
      budget: '45.8M',
      consomme: '48.2M',
      pourcentage: 105,
      statut: 'alerte' as const,
    },
  ];

  // Paiements en retard
  const paiementsRetard: PaiementRetard[] = [
    {
      id: 'p1',
      projet: 'Villa Diamniadio',
      montant: 3200000,
      joursRetard: 15,
      priorite: 'haute',
    },
    {
      id: 'p2',
      projet: 'Complexe Résidentiel',
      montant: 2800000,
      joursRetard: 25,
      priorite: 'critique',
    },
    {
      id: 'p3',
      projet: 'École Primaire',
      montant: 1500000,
      joursRetard: 8,
      priorite: 'moyenne',
    },
    {
      id: 'p4',
      projet: 'Centre de Santé',
      montant: 1000000,
      joursRetard: 5,
      priorite: 'moyenne',
    },
  ];

  // Rentabilité par projet
  const rentabilite: Rentabilite[] = [
    {
      id: 'r1',
      projet: 'Villa Diamniadio',
      investissement: 36400000,
      retourAttendu: 7280000,
      retourReel: 6900000,
      marge: 19,
    },
    {
      id: 'r2',
      projet: 'Complexe Résidentiel',
      investissement: 28200000,
      retourAttendu: 5640000,
      retourReel: 5100000,
      marge: 18,
    },
    {
      id: 'r3',
      projet: 'Infrastructure Route',
      investissement: 45800000,
      retourAttendu: 9160000,
      retourReel: 8500000,
      marge: 19,
    },
    {
      id: 'r4',
      projet: 'École Primaire',
      investissement: 18500000,
      retourAttendu: 3700000,
      retourReel: 3600000,
      marge: 19,
    },
  ];

  // Fonctions d'export
  const handleExportCSV = useCallback(() => {
    const headers = ['Projet', 'Investissement', 'Retour Attendu', 'Retour Réel', 'Marge (%)'];
    const rows = rentabilite.map(r => [
      r.projet,
      formatCurrency(r.investissement),
      formatCurrency(r.retourAttendu),
      formatCurrency(r.retourReel),
      r.marge.toString(),
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-rentabilite-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [rentabilite]);

  const handleExportJSON = useCallback(() => {
    const data = {
      kpis: budgetKPIs.map(kpi => ({
        label: kpi.label,
        value: kpi.value,
        trend: kpi.trend,
      })),
      rentabilite: rentabilite.map(r => ({
        projet: r.projet,
        investissement: r.investissement,
        retourAttendu: r.retourAttendu,
        retourReel: r.retourReel,
        marge: r.marge,
      })),
      paiementsRetard: paiementsRetard.map(p => ({
        projet: p.projet,
        montant: p.montant,
        joursRetard: p.joursRetard,
        priorite: p.priorite,
      })),
    };
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-kpis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [budgetKPIs, rentabilite, paiementsRetard]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="p-6 space-y-6 animate-fadeIn">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">KPIs Budget</h1>
            <p className="text-slate-400">Indicateurs budgétaires et financiers</p>
          </div>
          <ExportButton
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            label="Exporter"
          />
        </div>

        {/* Cartes KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {budgetKPIs.map((kpi) => {
            const Icon = kpi.icon;
            const isPositive = (kpi.trendDirection === 'up' && (kpi.id === 'total' || kpi.id === 'rentabilite' || kpi.id === 'conforme')) || 
                             (kpi.trendDirection === 'down' && (kpi.id === 'paiements' || kpi.id === 'alerte'));
            const isNegative = !isPositive && kpi.trendDirection !== 'neutral';
            const isNeutral = kpi.trendDirection === 'neutral';
            const sparklineColor = kpi.color === 'blue' ? 'blue' : 
                                  kpi.color === 'orange' || kpi.color === 'amber' ? 'amber' : 
                                  kpi.color === 'red' ? 'red' : 
                                  kpi.color === 'cyan' || kpi.color === 'emerald' ? 'emerald' : 'purple';

            return (
              <Tooltip key={kpi.id}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => handleKPIClick(kpi)}
                    className={cn(
                      'bg-gradient-to-br rounded-xl p-5 border-2 transition-all duration-300 cursor-pointer',
                      'hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                      kpi.color === 'blue' && 'from-blue-500/20 to-blue-600/10 border-blue-500/50 hover:border-blue-400',
                      kpi.color === 'orange' && 'from-orange-500/20 to-orange-600/10 border-orange-500/50 hover:border-orange-400',
                      kpi.color === 'emerald' && 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/50 hover:border-emerald-400',
                      kpi.color === 'purple' && 'from-purple-500/20 to-purple-600/10 border-purple-500/50 hover:border-purple-400',
                      kpi.color === 'red' && 'from-red-500/20 to-red-600/10 border-red-500/50 hover:border-red-400',
                      kpi.color === 'cyan' && 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/50 hover:border-cyan-400',
                      kpi.color === 'amber' && 'from-amber-500/20 to-amber-600/10 border-amber-500/50 hover:border-amber-400'
                    )}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleKPIClick(kpi);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                          kpi.color === 'blue' && 'bg-blue-500/20 text-blue-400',
                          kpi.color === 'orange' && 'bg-orange-500/20 text-orange-400',
                          kpi.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
                          kpi.color === 'purple' && 'bg-purple-500/20 text-purple-400',
                          kpi.color === 'red' && 'bg-red-500/20 text-red-400',
                          kpi.color === 'cyan' && 'bg-cyan-500/20 text-cyan-400',
                          kpi.color === 'amber' && 'bg-amber-500/20 text-amber-400'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-400 truncate">{kpi.label}</p>
                          <Info className="h-3 w-3 text-slate-500 flex-shrink-0" />
                        </div>
                        <p className="text-2xl font-bold text-white">{kpi.value}</p>
                      </div>
                    </div>

                    {/* Sparkline */}
                    {kpi.sparkline && (
                      <div className="mb-2">
                        <SparklineChart
                          data={kpi.sparkline}
                          color={sparklineColor}
                          width={60}
                          height={20}
                        />
                      </div>
                    )}

                    <div
                      className={cn(
                        'flex items-center justify-between text-xs',
                        isPositive && 'text-emerald-400',
                        isNegative && 'text-red-400',
                        isNeutral && 'text-slate-400'
                      )}
                    >
                      <div className="flex items-center gap-1 font-medium">
                        {!isNeutral && (
                          <>
                            {isPositive ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            <span>{kpi.trend}</span>
                          </>
                        )}
                        {isNeutral && <span>{kpi.trend}</span>}
                      </div>
                      <span className="text-slate-500 text-[10px]">Cliquer pour détails</span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">{kpi.label}</p>
                    {kpi.description && (
                      <p className="text-xs text-slate-300">{kpi.description}</p>
                    )}
                    <p className="text-xs text-slate-400 pt-1 border-t border-slate-700">
                      Cliquez pour voir les détails et l'historique
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

      {/* Détails par projet */}
      <div className="mt-8 bg-slate-800/40 border border-slate-700/40 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Budget par Projet</h2>
        <div className="space-y-4">
          {budgetDetails.map((detail, index) => (
            <div
              key={index}
              className={cn(
                'p-4 rounded-lg border',
                detail.statut === 'normal' && 'bg-slate-700/30 border-slate-600/50',
                detail.statut === 'attention' && 'bg-orange-500/10 border-orange-500/30',
                detail.statut === 'alerte' && 'bg-red-500/10 border-red-500/30'
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">{detail.projet}</h3>
                <span
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    detail.statut === 'normal' && 'bg-green-500/20 text-green-400',
                    detail.statut === 'attention' && 'bg-orange-500/20 text-orange-400',
                    detail.statut === 'alerte' && 'bg-red-500/20 text-red-400'
                  )}
                >
                  {detail.pourcentage}%
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Budget alloué</span>
                  <span className="text-white font-medium">{detail.budget} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Budget consommé</span>
                  <span className="text-white font-medium">{detail.consomme} FCFA</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden mt-2">
                  <div
                    className={cn(
                      'h-full transition-all duration-300',
                      detail.pourcentage <= 80 && 'bg-green-500',
                      detail.pourcentage > 80 && detail.pourcentage <= 100 && 'bg-orange-500',
                      detail.pourcentage > 100 && 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(detail.pourcentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paiements en retard */}
      <div className="mt-8 bg-slate-800/40 border border-slate-700/40 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-red-400" />
          Paiements en retard
        </h2>
        {paiementsRetard.length > 0 ? (
          <div className="space-y-4">
            {paiementsRetard.map((paiement) => (
              <div
                key={paiement.id}
                className={cn(
                  'p-4 rounded-lg border-2',
                  paiement.priorite === 'critique' && 'bg-red-500/10 border-red-500/30',
                  paiement.priorite === 'haute' && 'bg-amber-500/10 border-amber-500/30',
                  paiement.priorite === 'moyenne' && 'bg-blue-500/10 border-blue-500/30'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{paiement.projet}</h3>
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      paiement.priorite === 'critique' && 'bg-red-500/20 text-red-400',
                      paiement.priorite === 'haute' && 'bg-amber-500/20 text-amber-400',
                      paiement.priorite === 'moyenne' && 'bg-blue-500/20 text-blue-400'
                    )}
                  >
                    {paiement.priorite === 'critique' ? 'Critique' : paiement.priorite === 'haute' ? 'Haute' : 'Moyenne'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>{paiement.joursRetard} jours de retard</span>
                  </div>
                  <span className="text-white font-semibold">{formatCurrency(paiement.montant)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-emerald-400" />
            <p>Aucun paiement en retard</p>
          </div>
        )}
      </div>

      {/* Rentabilité par projet */}
      <div className="mt-6 bg-slate-800/40 border border-slate-700/40 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Percent className="h-5 w-5 text-emerald-400" />
          Rentabilité par projet
        </h2>
        <div className="space-y-4">
          {rentabilite.map((rent) => (
            <div
              key={rent.id}
              className="p-4 rounded-lg border border-slate-700/40 bg-slate-700/20"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">{rent.projet}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-emerald-400">{rent.marge}%</span>
                  <span className="text-xs text-slate-400">marge</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">Investissement</p>
                  <p className="text-white font-medium">{formatCurrency(rent.investissement)}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Retour attendu</p>
                  <p className="text-white font-medium">{formatCurrency(rent.retourAttendu)}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Retour réel</p>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{formatCurrency(rent.retourReel)}</p>
                    {rent.retourReel >= rent.retourAttendu ? (
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-3 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-500',
                    rent.marge >= 18 ? 'bg-emerald-500' : 'bg-amber-500'
                  )}
                  style={{ width: `${Math.min((rent.marge / 25) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Informations supplémentaires */}
      <div className="mt-6 bg-slate-800/40 border border-slate-700/40 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Contexte</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <p className="text-slate-400 mb-2">Dernière mise à jour</p>
            <p>{new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-2">Période d'analyse</p>
            <p>Exercice en cours</p>
          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}

export default memo(BudgetKpiPage);

