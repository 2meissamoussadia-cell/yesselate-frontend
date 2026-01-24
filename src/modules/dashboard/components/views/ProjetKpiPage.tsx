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
  Activity
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { KPICard } from '@/components/features/bmo/dashboard/components';
import { AnimatedBadge } from '../shared/AnimatedBadge';
import { EnterpriseBadge } from '../shared/EnterpriseBadge';
import { SearchFilter } from '../shared/SearchFilter';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { DashboardPageShell } from '../shared/DashboardPageShell';
import { DashboardPanel } from '../shared/DashboardPanel';
import { VirtualizedList } from '@/components/shared/VirtualizedList';

interface ProjetKPI {
  id: string;
  label: string;
  value: string | number;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
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

export const ProjetKpiPage = memo(function ProjetKpiPage() {
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  const [searchQuery, setSearchQuery] = useState('');

  const handleKPIClick = useCallback((kpi: ProjetKPI) => {
    openModal('kpi-drilldown', {
      kpi: {
        label: kpi.label,
        value: kpi.value,
        trend: typeof kpi.trend === 'string' ? parseFloat(kpi.trend.replace(/[^\d.-]/g, '')) || 0 : 0,
        trendType: kpi.trendDirection,
        tone: kpi.color === 'emerald' ? 'ok' : kpi.color === 'amber' || kpi.color === 'red' ? 'warn' : 'info',
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

  // Fonction de rendu pour une carte projet (réutilisable pour virtualisation)
  const renderProjetCard = useCallback((projet: Projet) => (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-[2px]',
          projet.statut === 'normal' && 'bg-slate-300/40',
          projet.statut === 'retard' && 'bg-amber-400/80',
          projet.statut === 'critique' && 'bg-rose-400/80'
        )}
      />
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 min-w-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="text-lg font-bold text-white truncate min-w-0">{projet.nom}</h3>
              </TooltipTrigger>
              <TooltipContent>
                <p>{projet.nom}</p>
              </TooltipContent>
            </Tooltip>
                    <EnterpriseBadge
                      variant={projet.risque === 'high' ? 'critique' : projet.risque === 'medium' ? 'haute' : 'faible'}
                      size="sm"
                      className="flex-shrink-0"
                    >
                      Risque {projet.risque === 'low' ? 'Faible' : projet.risque === 'medium' ? 'Moyen' : 'Élevé'}
                    </EnterpriseBadge>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300 min-w-0">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate min-w-0">{projet.region}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{projet.region}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        {projet.retard > 0 && (
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{projet.retard}j de retard</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4 min-w-0">
        {/* Avancement */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(0.5rem, 0.75vw, 0.75rem)' }}>
            <span className="text-slate-300" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>Avancement</span>
            <span className="font-semibold text-white" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>{projet.avancement}%</span>
          </div>
          <div className="bg-slate-700/50 rounded-full overflow-hidden" style={{ height: 'clamp(0.25rem, 0.375vw, 0.5rem)' }}>
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
          <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(0.5rem, 0.75vw, 0.75rem)' }}>
            <span className="text-slate-300" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>Budget</span>
            <span className="font-semibold text-white" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>{projet.budget.pourcentage}%</span>
          </div>
          <div className="bg-slate-700/50 rounded-full overflow-hidden" style={{ height: 'clamp(0.25rem, 0.375vw, 0.5rem)' }}>
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
          <div className="text-slate-400" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)', marginTop: 'clamp(0.25rem, 0.5vw, 0.5rem)' }}>
            {formatCurrency(projet.budget.consomme)} / {formatCurrency(projet.budget.alloue)}
          </div>
        </div>

        {/* Litiges */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(0.5rem, 0.75vw, 0.75rem)' }}>
            <span className="text-slate-300" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>Litiges</span>
            <div className="flex items-center" style={{ gap: 'clamp(0.25rem, 0.5vw, 0.5rem)' }}>
              {projet.litiges > 0 && <Gavel className="text-amber-400" style={{ width: 'clamp(0.75rem, 0.875vw, 0.875rem)', height: 'clamp(0.75rem, 0.875vw, 0.875rem)', minWidth: '0.75rem', minHeight: '0.75rem' }} />}
              <span className={cn(
                'font-semibold',
                projet.litiges === 0 ? 'text-emerald-400' : 'text-amber-400'
              )}
              style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
                {projet.litiges}
              </span>
            </div>
          </div>
          {projet.litiges > 0 && (
            <p className="text-amber-400" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>Action requise</p>
          )}
          {projet.litiges === 0 && (
            <p className="text-slate-500" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>Aucun litige</p>
          )}
        </div>
      </div>
    </>
  ), [formatCurrency]);

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
      <DashboardPageShell
        title="KPIs Chantiers & Projets"
        subtitle="Suivi de l'avancement, retards, litiges et performance par région"
        rightSlot={
          <>
            <div className="w-full sm:w-[360px]">
              <SearchFilter
                placeholder="Rechercher un projet ou une région..."
                value={searchQuery}
                onChange={setSearchQuery}
                totalCount={projets.length}
                resultsCount={filteredProjets.length}
              />
            </div>
            <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} label="Exporter" />
          </>
        }
      >
        <DashboardPanel>
          <div style={{ padding: 'clamp(1rem, 1.5vw, 1.5rem)' }}>
            {/* KPIs principaux */}
            <section className="min-w-0">
              <h2 className="font-semibold text-white flex items-center break-words" style={{ fontSize: 'clamp(0.875rem, 1.5vw, 1.125rem)', marginBottom: 'clamp(0.75rem, 1vw, 1rem)', gap: 'clamp(0.5rem, 0.75vw, 0.75rem)' }}>
                <Activity className="text-blue-400 flex-shrink-0" style={{ width: 'clamp(1rem, 1.25vw, 1.25rem)', height: 'clamp(1rem, 1.25vw, 1.25rem)', minWidth: '1rem', minHeight: '1rem' }} />
                <span className="min-w-0">Indicateurs clés</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0" style={{ gap: 'clamp(0.75rem, 1vw, 1rem)' }}>
              {projetKPIs.map((kpi) => (
                <KPICard
                  key={kpi.id}
                  kpi={{
                    id: kpi.id,
                    label: kpi.label,
                    value: kpi.value,
                    trend: typeof kpi.trend === 'string' ? parseFloat(kpi.trend.replace(/[^\d.-]/g, '')) || 0 : 0,
                    trendType: kpi.trendDirection,
                    icon: kpi.icon,
                    color: (kpi.color === 'red' ? 'rose' : kpi.color) as any,
                    description: kpi.description,
                    sparkline: kpi.sparkline,
                    onClick: () => handleKPIClick(kpi),
                  }}
                  size="md"
                />
              ))}
              </div>
            </section>
          </div>
        </DashboardPanel>

      {/* Liste des projets */}
      <DashboardPanel>
        <div style={{ padding: 'clamp(1rem, 1.5vw, 1.5rem)' }}>
          <section className="min-w-0">
            <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
              <h2 className="font-semibold text-white flex items-center" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', gap: 'clamp(0.5rem, 0.75vw, 0.75rem)' }}>
                <FileText className="text-blue-400" style={{ width: 'clamp(1rem, 1.25vw, 1.25rem)', height: 'clamp(1rem, 1.25vw, 1.25rem)', minWidth: '1rem', minHeight: '1rem' }} />
                Détails par projet
              </h2>
              {searchQuery && (
                <span className="text-slate-300" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
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
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                  style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}
                >
                  Effacer la recherche
                </button>
              )
            }
          />
        ) : (
          // Virtualisation conditionnelle (si >30 items pour performance)
          filteredProjets.length > 30 ? (
            <VirtualizedList
              items={filteredProjets}
              renderItem={(projet) => (
                <div
                  key={projet.id}
                  className={cn(
                    'relative rounded-2xl border border-slate-800/60 bg-slate-900/30',
                    'transition-colors duration-200 hover:bg-slate-900/45 hover:border-slate-700/60',
                    projet.statut === 'retard' && 'ring-1 ring-amber-500/15',
                    projet.statut === 'critique' && 'ring-1 ring-rose-500/20'
                  )}
                  style={{ padding: 'clamp(1rem, 1.5vw, 1.25rem)', marginBottom: 'clamp(1rem, 1.5vw, 1.25rem)' }}
                >
                  {renderProjetCard(projet)}
                </div>
              )}
              estimateSize={280}
              overscan={5}
              containerHeight="600px"
            />
          ) : (
            <div style={{ gap: 'clamp(1rem, 1.5vw, 1.25rem)' }} className="space-y-4">
              {filteredProjets.map((projet) => (
                <div
                  key={projet.id}
                  className={cn(
                    'relative rounded-2xl border border-slate-800/60 bg-slate-900/30',
                    'transition-colors duration-200 hover:bg-slate-900/45 hover:border-slate-700/60',
                    projet.statut === 'retard' && 'ring-1 ring-amber-500/15',
                    projet.statut === 'critique' && 'ring-1 ring-rose-500/20'
                  )}
                  style={{ padding: 'clamp(1rem, 1.5vw, 1.25rem)' }}
                >
                  {renderProjetCard(projet)}
                </div>
              ))}
            </div>
          )
        )}
          </section>
        </div>
      </DashboardPanel>

      {/* Performance par région */}
      <DashboardPanel>
        <div style={{ padding: 'clamp(1rem, 1.5vw, 1.5rem)' }}>
          <section className="min-w-0">
            <h2 className="font-semibold text-white flex items-center" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', marginBottom: 'clamp(1rem, 1.5vw, 1.25rem)', gap: 'clamp(0.5rem, 0.75vw, 0.75rem)' }}>
              <MapPin className="text-purple-400" style={{ width: 'clamp(1rem, 1.25vw, 1.25rem)', height: 'clamp(1rem, 1.25vw, 1.25rem)', minWidth: '1rem', minHeight: '1rem' }} />
              Performance par région
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0" style={{ gap: 'clamp(0.75rem, 1vw, 1rem)' }}>
              {performanceRegion.map((perf) => (
                <div
                  key={perf.region}
                  className="bg-slate-950/30 border border-slate-800/60 rounded-xl"
                  style={{ padding: 'clamp(1rem, 1.5vw, 1.25rem)' }}
                >
                  <div className="flex items-center" style={{ gap: 'clamp(0.5rem, 0.75vw, 0.75rem)', marginBottom: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
                    <MapPin className="text-purple-400" style={{ width: 'clamp(0.875rem, 1vw, 1rem)', height: 'clamp(0.875rem, 1vw, 1rem)', minWidth: '0.875rem', minHeight: '0.875rem' }} />
                    <h3 className="font-semibold text-white" style={{ fontSize: 'clamp(0.875rem, 1vw, 1rem)' }}>{perf.region}</h3>
                  </div>
                  <div style={{ gap: 'clamp(0.75rem, 1vw, 1rem)' }} className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(0.25rem, 0.5vw, 0.5rem)' }}>
                        <span className="text-slate-300" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>Projets</span>
                        <span className="font-semibold text-white" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>{perf.projets}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(0.25rem, 0.5vw, 0.5rem)' }}>
                        <span className="text-slate-400" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>Avancement moyen</span>
                        <span className="font-semibold text-white" style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>{perf.avancement}%</span>
                      </div>
                      <div className="bg-slate-700/50 rounded-full overflow-hidden" style={{ height: 'clamp(0.25rem, 0.375vw, 0.5rem)' }}>
                        <div
                          className="h-full bg-purple-500 transition-all duration-500"
                          style={{ width: `${perf.avancement}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(0.25rem, 0.5vw, 0.5rem)' }}>
                        <span className="text-slate-300" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.75rem)' }}>Projets en retard</span>
                        <span className={cn(
                          'font-semibold',
                          perf.retard === 0 ? 'text-emerald-400' : 'text-amber-400'
                        )}
                        style={{ fontSize: 'clamp(0.75rem, 1vw, 0.875rem)' }}>
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
      </DashboardPanel>
      </DashboardPageShell>
    </TooltipProvider>
  );
});

export default ProjetKpiPage;
