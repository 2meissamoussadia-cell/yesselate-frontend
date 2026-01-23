/**
 * Page KPIs Projets
 * Vue détaillée des indicateurs de performance des chantiers et projets
 */

'use client';

import React, { useCallback, memo, useMemo, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Target, 
  MapPin,
  Calendar,
  FileText,
  Gavel,
  Building2,
  Activity,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SparklineChart } from '../shared/SparklineChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { AnimatedBadge } from '../shared/AnimatedBadge';
import { SearchFilter } from '../shared/SearchFilter';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';

interface ProjetKPI {
  id: string;
  label: string;
  value: string | number;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple';
  sparkline?: number[];
  description?: string;
}

interface Projet {
  id: string;
  nom: string;
  region: string;
  avancement: number;
  retard: number; // jours de retard
  budget: {
    alloue: number;
    consomme: number;
    pourcentage: number;
  };
  statut: 'normal' | 'retard' | 'critique';
  litiges: number;
  risque: 'low' | 'medium' | 'high';
}

function ProjetKpiPage() {
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  const [searchQuery, setSearchQuery] = useState('');

  const handleKPIClick = useCallback((kpi: ProjetKPI) => {
    openModal('kpi-drilldown', {
      kpi: {
        label: kpi.label,
        value: kpi.value,
        delta: kpi.trend,
        tone: kpi.color === 'emerald' ? 'ok' : kpi.color === 'amber' || kpi.color === 'red' ? 'warn' : 'info',
        trend: kpi.trendDirection === 'up' ? 'up' : kpi.trendDirection === 'down' ? 'down' : 'neutral',
        icon: kpi.icon,
      },
    });
  }, [openModal]);

  // KPIs principaux avec sparklines
  const projetKPIs: ProjetKPI[] = [
    {
      id: '1',
      label: 'Projets actifs',
      value: 24,
      trend: '+2',
      trendDirection: 'up',
      icon: Target,
      color: 'blue',
      sparkline: [20, 21, 22, 22, 23, 23, 24],
      description: 'Nombre total de projets en cours',
    },
    {
      id: '2',
      label: 'Avancement moyen',
      value: '78%',
      trend: '+3%',
      trendDirection: 'up',
      icon: Activity,
      color: 'emerald',
      sparkline: [72, 73, 74, 75, 76, 77, 78],
      description: 'Pourcentage moyen d\'avancement des projets',
    },
    {
      id: '3',
      label: 'Projets en retard',
      value: 3,
      trend: '-2',
      trendDirection: 'down',
      icon: Clock,
      color: 'amber',
      sparkline: [7, 6, 5, 4, 4, 3, 3],
      description: 'Projets avec retard de planning',
    },
    {
      id: '4',
      label: 'Retard moyen',
      value: '5.2j',
      trend: '-1.3j',
      trendDirection: 'down',
      icon: Calendar,
      color: 'amber',
      sparkline: [8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.2],
      description: 'Délai moyen de retard en jours',
    },
    {
      id: '5',
      label: 'Litiges actifs',
      value: 4,
      trend: '-1',
      trendDirection: 'down',
      icon: Gavel,
      color: 'red',
      sparkline: [7, 6, 6, 5, 5, 4, 4],
      description: 'Litiges en cours nécessitant résolution',
    },
    {
      id: '6',
      label: 'Budget consommé',
      value: '67%',
      trend: '+2%',
      trendDirection: 'up',
      icon: DollarSign,
      color: 'purple',
      sparkline: [60, 62, 63, 64, 65, 66, 67],
      description: 'Pourcentage du budget total consommé',
    },
  ];

  // Projets avec détails
  const projets: Projet[] = useMemo(() => [
    {
      id: 'P001',
      nom: 'Villa Diamniadio',
      region: 'Dakar',
      avancement: 85,
      retard: 0,
      budget: { alloue: 36400000, consomme: 24500000, pourcentage: 67 },
      statut: 'normal',
      litiges: 0,
      risque: 'low',
    },
    {
      id: 'P002',
      nom: 'Complexe Résidentiel',
      region: 'Thiès',
      avancement: 65,
      retard: 8,
      budget: { alloue: 28200000, consomme: 22100000, pourcentage: 78 },
      statut: 'retard',
      litiges: 1,
      risque: 'medium',
    },
    {
      id: 'P003',
      nom: 'Infrastructure Route',
      region: 'Saint-Louis',
      avancement: 72,
      retard: 15,
      budget: { alloue: 45800000, consomme: 48200000, pourcentage: 105 },
      statut: 'critique',
      litiges: 2,
      risque: 'high',
    },
    {
      id: 'P004',
      nom: 'École Primaire',
      region: 'Dakar',
      avancement: 55,
      retard: 3,
      budget: { alloue: 18500000, consomme: 9900000, pourcentage: 53 },
      statut: 'normal',
      litiges: 0,
      risque: 'low',
    },
    {
      id: 'P005',
      nom: 'Centre de Santé',
      region: 'Thiès',
      avancement: 92,
      retard: 0,
      budget: { alloue: 12500000, consomme: 11400000, pourcentage: 91 },
      statut: 'normal',
      litiges: 1,
      risque: 'medium',
    },
  ], []);

  // Filtrer les projets selon la recherche
  const filteredProjets = useMemo(() => {
    if (!searchQuery.trim()) return projets;
    const query = searchQuery.toLowerCase();
    return projets.filter(
      (p) =>
        p.nom.toLowerCase().includes(query) ||
        p.region.toLowerCase().includes(query)
    );
  }, [searchQuery, projets]);

  // Fonction utilitaire pour formater les montants
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(value).replace('XOF', 'FCFA');
  };

  // Fonctions d'export
  const handleExportCSV = useCallback(() => {
    const headers = ['Projet', 'Région', 'Avancement (%)', 'Retard (jours)', 'Budget Alloué', 'Budget Consommé', 'Pourcentage', 'Statut', 'Litiges', 'Risque'];
    const rows = filteredProjets.map(p => [
      p.nom,
      p.region,
      p.avancement.toString(),
      p.retard.toString(),
      formatCurrency(p.budget.alloue),
      formatCurrency(p.budget.consomme),
      p.budget.pourcentage.toString(),
      p.statut,
      p.litiges.toString(),
      p.risque,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projets-kpis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredProjets]);

  const handleExportJSON = useCallback(() => {
    const data = filteredProjets.map(p => ({
      projet: p.nom,
      region: p.region,
      avancement: p.avancement,
      retard: p.retard,
      budget: {
        alloue: p.budget.alloue,
        consomme: p.budget.consomme,
        pourcentage: p.budget.pourcentage,
      },
      statut: p.statut,
      litiges: p.litiges,
      risque: p.risque,
    }));
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `projets-kpis-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredProjets]);

  // Performance par région
  const performanceRegion = [
    { region: 'Dakar', projets: 12, avancement: 82, retard: 1 },
    { region: 'Thiès', projets: 7, avancement: 75, retard: 2 },
    { region: 'Saint-Louis', projets: 5, avancement: 68, retard: 1 },
  ];

  return (
    <TooltipProvider delayDuration={200}>
      <div className="p-6 space-y-6 animate-fadeIn">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">KPIs Chantiers & Projets</h1>
            <p className="text-slate-400">Suivi de l'avancement, retards, litiges et performance par région</p>
          </div>
          <ExportButton
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            label="Exporter"
          />
        </div>

        {/* Recherche */}
        <div className="max-w-md">
          <SearchFilter
            placeholder="Rechercher un projet ou une région..."
            value={searchQuery}
            onChange={setSearchQuery}
            totalCount={projets.length}
            resultsCount={filteredProjets.length}
          />
        </div>

        {/* KPIs principaux */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Indicateurs clés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projetKPIs.map((kpi) => {
              const Icon = kpi.icon;
              const isPositive = (kpi.trendDirection === 'up' && kpi.id !== '3' && kpi.id !== '5') || 
                               (kpi.trendDirection === 'down' && (kpi.id === '3' || kpi.id === '5'));
              const isNegative = !isPositive && kpi.trendDirection !== 'neutral';

              return (
                <Tooltip key={kpi.id}>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => handleKPIClick(kpi)}
                      className={cn(
                        'rounded-xl p-5 border-2 transition-all duration-300 cursor-pointer',
                        'hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20',
                        'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                        kpi.color === 'blue' && 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/50 hover:border-blue-400',
                        kpi.color === 'emerald' && 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/50 hover:border-emerald-400',
                        kpi.color === 'amber' && 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/50 hover:border-amber-400',
                        kpi.color === 'red' && 'bg-gradient-to-br from-red-500/20 to-red-600/10 border-red-500/50 hover:border-red-400',
                        kpi.color === 'purple' && 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/50 hover:border-purple-400'
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
                            kpi.color === 'emerald' && 'bg-emerald-500/20 text-emerald-400',
                            kpi.color === 'amber' && 'bg-amber-500/20 text-amber-400',
                            kpi.color === 'red' && 'bg-red-500/20 text-red-400',
                            kpi.color === 'purple' && 'bg-purple-500/20 text-purple-400'
                          )}
                        >
                          <Icon className="h-5 w-5" />
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
                            color={kpi.color}
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
                          !isPositive && !isNegative && 'text-slate-400'
                        )}
                      >
                        <div className="flex items-center gap-1 font-medium">
                          {kpi.trendDirection !== 'neutral' && (
                            <>
                              {isPositive ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              <span>{kpi.trend}</span>
                            </>
                          )}
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
        </section>

      {/* Liste des projets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400" />
            Détails par projet
          </h2>
          {searchQuery && (
            <span className="text-sm text-slate-400">
              {filteredProjets.length} projet{filteredProjets.length > 1 ? 's' : ''} trouvé{filteredProjets.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {filteredProjets.length === 0 ? (
          <EmptyState
            variant="search"
            title={searchQuery ? "Aucun projet trouvé" : "Aucun projet disponible"}
            description={searchQuery ? `Aucun projet ne correspond à "${searchQuery}"` : "Aucun projet n'est disponible pour le moment"}
            action={
              searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Effacer la recherche
                </button>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredProjets.map((projet) => (
            <div
              key={projet.id}
              className={cn(
                'rounded-xl p-5 border-2 bg-slate-800/40',
                projet.statut === 'normal' && 'border-slate-700/40',
                projet.statut === 'retard' && 'border-amber-500/50 bg-amber-500/5',
                projet.statut === 'critique' && 'border-red-500/50 bg-red-500/5'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-white">{projet.nom}</h3>
                    <AnimatedBadge
                      variant={projet.risque === 'high' ? 'critical' : projet.risque === 'medium' ? 'warning' : 'success'}
                      pulse={projet.risque === 'high'}
                    >
                      Risque {projet.risque === 'low' ? 'Faible' : projet.risque === 'medium' ? 'Moyen' : 'Élevé'}
                    </AnimatedBadge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="h-3 w-3" />
                    <span>{projet.region}</span>
                  </div>
                </div>
                {projet.retard > 0 && (
                  <div className="flex items-center gap-2 text-amber-400">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">{projet.retard}j de retard</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Avancement */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Avancement</span>
                    <span className="text-sm font-semibold text-white">{projet.avancement}%</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        projet.avancement >= 80 && 'bg-emerald-500',
                        projet.avancement >= 60 && projet.avancement < 80 && 'bg-amber-500',
                        projet.avancement < 60 && 'bg-red-500'
                      )}
                      style={{ width: `${projet.avancement}%` }}
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Budget</span>
                    <span className="text-sm font-semibold text-white">{projet.budget.pourcentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-500',
                        projet.budget.pourcentage <= 80 && 'bg-emerald-500',
                        projet.budget.pourcentage > 80 && projet.budget.pourcentage <= 100 && 'bg-amber-500',
                        projet.budget.pourcentage > 100 && 'bg-red-500'
                      )}
                      style={{ width: `${Math.min(projet.budget.pourcentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {formatCurrency(projet.budget.consomme)} / {formatCurrency(projet.budget.alloue)}
                  </div>
                </div>

                {/* Litiges */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">Litiges</span>
                    <div className="flex items-center gap-1">
                      {projet.litiges > 0 && <Gavel className="h-3 w-3 text-amber-400" />}
                      <span className={cn(
                        'text-sm font-semibold',
                        projet.litiges === 0 ? 'text-emerald-400' : 'text-amber-400'
                      )}>
                        {projet.litiges}
                      </span>
                    </div>
                  </div>
                  {projet.litiges > 0 && (
                    <p className="text-xs text-amber-400">Action requise</p>
                  )}
                  {projet.litiges === 0 && (
                    <p className="text-xs text-slate-500">Aucun litige</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Performance par région */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-purple-400" />
          Performance par région
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performanceRegion.map((perf) => (
            <div
              key={perf.region}
              className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-purple-400" />
                <h3 className="text-base font-semibold text-white">{perf.region}</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Projets</span>
                    <span className="text-sm font-semibold text-white">{perf.projets}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Avancement moyen</span>
                    <span className="text-sm font-semibold text-white">{perf.avancement}%</span>
                  </div>
                  <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${perf.avancement}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Projets en retard</span>
                    <span className={cn(
                      'text-sm font-semibold',
                      perf.retard === 0 ? 'text-emerald-400' : 'text-amber-400'
                    )}>
                      {perf.retard}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
    </TooltipProvider>
  );
}

export default memo(ProjetKpiPage);
