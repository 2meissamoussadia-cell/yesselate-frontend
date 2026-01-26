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
import { AnimatedBadge } from '../shared/AnimatedBadge';
import { EnterpriseBadge } from '../shared/EnterpriseBadge';
import { SearchFilter } from '../shared/SearchFilter';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { VirtualizedList } from '@/components/shared/VirtualizedList';
import { parseTrendPercent, formatCurrency, normalizeKPIColor } from '@lib-root/dashboard/kpi';
import {
  calculateAvancementMoyen,
  calculateBudgetConsomme,
  calculateResteAEngager,
  calculateMargePrevisionnelle,
  formatKPICurrency,
  formatKPIPercentage,
} from '../../utils/kpi';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  DashboardPanel,
  KPICard,
  type KPICardData,
  MockDataIndicator,
} from '../shared';

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

interface ProjetKpiPageProps {
  data?: import('../../types/dashboard.readmodels').KpisProjetsData;
}

export const ProjetKpiPage = memo(function ProjetKpiPage({ data: apiData }: ProjetKpiPageProps = {}) {
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  const [searchQuery, setSearchQuery] = useState('');

  const handleKPIClick = useCallback((kpi: ProjetKPI) => {
    openModal('kpi-drilldown', {
      kpi: {
        label: kpi.label,
        value: kpi.value,
        trend: parseTrendPercent(kpi.trend),
        trendType: kpi.trendDirection,
        tone: kpi.color === 'emerald' ? 'ok' : kpi.color === 'amber' || kpi.color === 'red' ? 'warn' : 'info',
        icon: kpi.icon,
      },
    });
  }, [openModal]);

  // Projets avec détails : utiliser les données API si disponibles, sinon fallback sur mock
  const projets: Projet[] = useMemo(() => {
    // Si on a des données API, les transformer vers le format Projet
    if (apiData?.projets && apiData.projets.length > 0) {
      return apiData.projets.map((p) => {
        const budgetRatio = p.budget > 0 ? (p.consomme / p.budget) * 100 : 0;
        // Déterminer le statut basé sur la progression et le budget
        let statut: 'normal' | 'retard' | 'critique' = 'normal';
        if (p.progression < 50 && budgetRatio > 100) statut = 'critique';
        else if (p.progression < 70 || budgetRatio > 90) statut = 'retard';
        
        // Déterminer le risque basé sur la progression et le budget
        let risque: 'low' | 'medium' | 'high' = 'low';
        if (p.progression < 50 || budgetRatio > 100) risque = 'high';
        else if (p.progression < 70 || budgetRatio > 80) risque = 'medium';
        
        return {
          id: p.id,
          nom: p.nom,
          region: 'Non spécifié', // L'API ne fournit pas la région pour l'instant
          avancement: p.progression,
          retard: 0, // L'API ne fournit pas le retard pour l'instant
          budget: {
            alloue: p.budget,
            consomme: p.consomme,
            pourcentage: Math.round(budgetRatio),
          },
          statut,
          litiges: 0, // L'API ne fournit pas les litiges pour l'instant
          risque,
        };
      });
    }
    
    // Fallback sur données mockées
    return [
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
    ];
  }, [apiData]);

  // Calculs des KPIs métier BTP (Direction/CODIR)
  const kpiCalculations = useMemo(() => {
    const avancementMoyen = calculateAvancementMoyen(projets);
    const totalBudgetAlloue = projets.reduce((sum, p) => sum + p.budget.alloue, 0);
    const totalBudgetConsomme = projets.reduce((sum, p) => sum + p.budget.consomme, 0);
    const budgetConsommePct = calculateBudgetConsomme(totalBudgetConsomme, totalBudgetAlloue);
    const totalEngage = totalBudgetConsomme * 0.85; // Estimation: 85% du consommé est engagé
    const resteAEngager = calculateResteAEngager(totalBudgetAlloue, totalBudgetConsomme, totalEngage);
    const coutPrevu = totalBudgetAlloue * 0.95; // Estimation: 95% du budget alloué
    const margePrevisionnelle = calculateMargePrevisionnelle(totalBudgetAlloue, coutPrevu);
    const retardsMajeurs = projets.filter(p => p.retard >= 7).length;
    const retardsMajeursJours = projets
      .filter(p => p.retard >= 7)
      .reduce((sum, p) => sum + p.retard, 0);
    const risquesCritiques = projets.filter(p => p.risque === 'high').length;
    const risquesCritiquesImpact = projets
      .filter(p => p.risque === 'high')
      .reduce((sum, p) => sum + p.budget.alloue, 0);

    return {
      avancementMoyen,
      budgetConsommePct,
      resteAEngager,
      margePrevisionnelle,
      retardsMajeurs,
      retardsMajeursJours,
      risquesCritiques,
      risquesCritiquesImpact,
    };
  }, [projets]);

  // KPIs principaux avec sparklines (enrichis avec KPIs métier BTP)
  const projetKPIs: ProjetKPI[] = useMemo(() => [
    {
      id: '1',
      label: 'Projets actifs',
      value: apiData?.total ?? projets.length,
      trend: '+2',
      trendDirection: 'up',
      icon: Target,
      color: 'blue',
      sparkline: [20, 21, 22, 22, 23, 23, projets.length],
      description: 'Nombre total de projets en cours',
    },
    {
      id: '2',
      label: 'Avancement moyen',
      value: formatKPIPercentage(kpiCalculations.avancementMoyen),
      trend: '+3%',
      trendDirection: 'up',
      icon: Activity,
      color: 'emerald',
      sparkline: [72, 73, 74, 75, 76, 77, kpiCalculations.avancementMoyen],
      description: 'Pourcentage moyen d\'avancement des chantiers',
    },
    {
      id: '3',
      label: '% Budget consommé',
      value: formatKPIPercentage(kpiCalculations.budgetConsommePct),
      trend: '+2%',
      trendDirection: 'up',
      icon: DollarSign,
      color: kpiCalculations.budgetConsommePct > 80 ? 'amber' : 'emerald',
      sparkline: [60, 62, 63, 64, 65, 66, kpiCalculations.budgetConsommePct],
      description: 'Pourcentage du budget total consommé',
    },
    {
      id: '4',
      label: 'Reste à engager',
      value: formatKPICurrency(kpiCalculations.resteAEngager, 'FCFA'),
      trend: '-5%',
      trendDirection: 'down',
      icon: FileText,
      color: 'blue',
      description: 'Montant restant à engager',
    },
    {
      id: '5',
      label: 'Marge prévisionnelle',
      value: formatKPIPercentage(kpiCalculations.margePrevisionnelle),
      trend: '+1%',
      trendDirection: 'up',
      icon: Target,
      color: kpiCalculations.margePrevisionnelle > 10 ? 'emerald' : 'amber',
      description: 'Marge prévisionnelle sur budget',
    },
    {
      id: '6',
      label: 'Risques critiques',
      value: `${kpiCalculations.risquesCritiques} (${formatKPICurrency(kpiCalculations.risquesCritiquesImpact, 'FCFA')})`,
      trend: '+1',
      trendDirection: 'up',
      icon: AlertTriangle,
      color: kpiCalculations.risquesCritiques > 0 ? 'red' : 'emerald',
      description: `Nombre de risques critiques et impact budgétaire`,
    },
    {
      id: '7',
      label: 'Retards majeurs',
      value: `${kpiCalculations.retardsMajeurs} (${kpiCalculations.retardsMajeursJours}j)`,
      trend: '-1',
      trendDirection: 'down',
      icon: Clock,
      color: kpiCalculations.retardsMajeurs > 0 ? 'amber' : 'emerald',
      description: 'Projets avec retard ≥ 7 jours et total jours de retard',
    },
  ], [projets, kpiCalculations, apiData]);

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

  // Utilise formatMoneyXOF centralisé depuis colorMapping.ts

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
            {formatCurrency(projet.budget.consomme, 'XOF')} / {formatCurrency(projet.budget.alloue, 'XOF')}
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
  ), []);

  // Fonctions d'export
  const handleExportCSV = useCallback(() => {
    const headers = ['Projet', 'Région', 'Avancement (%)', 'Retard (jours)', 'Budget Alloué', 'Budget Consommé', 'Pourcentage', 'Statut', 'Litiges', 'Risque'];
    const rows = filteredProjets.map(p => [
      p.nom,
      p.region,
      p.avancement.toString(),
      p.retard.toString(),
      formatKPICurrency(p.budget.alloue, 'FCFA'),
      formatKPICurrency(p.budget.consomme, 'FCFA'),
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

  // Convertir projetKPIs au format KPICardData
  const projetKPIsData: KPICardData[] = useMemo(() => {
    return projetKPIs.map((kpi) => ({
      id: kpi.id,
      label: kpi.label,
      value: kpi.value,
      trend: parseTrendPercent(kpi.trend),
      trendType: kpi.trendDirection,
      icon: kpi.icon,
      color: normalizeKPIColor(kpi.color),
      description: kpi.description,
      sparkline: kpi.sparkline,
      onClick: () => handleKPIClick(kpi),
    }));
  }, [projetKPIs, handleKPIClick]);

  return (
    <div className="relative">
      <MockDataIndicator message="Données mockées - Phase 1 (Backend en attente)" />
      <TooltipProvider delayDuration={200}>
        <DashboardPageLayout maxWidth="xl" padding="md">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl">
              KPIs Chantiers & Projets
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Suivi de l'avancement, retards, litiges et performance par région
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
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
          </div>
        </div>

        {/* KPIs principaux */}
        <DashboardSection
          title="Indicateurs clés"
          icon={Activity}
        >
          <DashboardGrid columns={3} gap="md">
            {projetKPIsData.map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} size="md" />
            ))}
          </DashboardGrid>
        </DashboardSection>

        {/* Liste des projets */}
        <DashboardSection
          title="Détails par projet"
          icon={FileText}
          action={
            searchQuery ? (
              <span className="text-slate-300 text-sm">
                {filteredProjets.length} projet{filteredProjets.length > 1 ? 's' : ''} trouvé{filteredProjets.length > 1 ? 's' : ''}
              </span>
            ) : undefined
          }
        >
          {filteredProjets.length === 0 ? (
            <EmptyState
              variant="search"
              title={searchQuery ? "Aucun projet trouvé" : "Aucun projet disponible"}
              description={searchQuery ? `Aucun projet ne correspond à "${searchQuery}"` : "Aucun projet n'est disponible pour le moment"}
              action={
                searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
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
                  <DashboardPanel
                    key={projet.id}
                    padding="md"
                    className={cn(
                      'hover:bg-slate-900/45 hover:border-slate-700/60 transition-colors',
                      projet.statut === 'retard' && 'ring-1 ring-amber-500/15',
                      projet.statut === 'critique' && 'ring-1 ring-rose-500/20'
                    )}
                  >
                    {renderProjetCard(projet)}
                  </DashboardPanel>
                )}
                estimateSize={280}
                overscan={5}
                containerHeight="600px"
              />
            ) : (
              <div className="space-y-4">
                {filteredProjets.map((projet) => (
                  <DashboardPanel
                    key={projet.id}
                    padding="md"
                    className={cn(
                      'hover:bg-slate-900/45 hover:border-slate-700/60 transition-colors',
                      projet.statut === 'retard' && 'ring-1 ring-amber-500/15',
                      projet.statut === 'critique' && 'ring-1 ring-rose-500/20'
                    )}
                  >
                    {renderProjetCard(projet)}
                  </DashboardPanel>
                ))}
              </div>
            )
          )}
        </DashboardSection>

        {/* Performance par région */}
        <DashboardSection
          title="Performance par région"
          icon={MapPin}
        >
          <DashboardGrid columns={3} gap="md">
            {performanceRegion.map((perf) => (
              <DashboardPanel key={perf.region} padding="md">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="text-purple-400 h-4 w-4 flex-shrink-0" />
                  <h3 className="font-semibold text-white text-sm">{perf.region}</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-xs">Projets</span>
                      <span className="font-semibold text-white text-sm">{perf.projets}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400 text-xs">Avancement moyen</span>
                      <span className="font-semibold text-white text-sm">{perf.avancement}%</span>
                    </div>
                    <div className="bg-slate-700/50 rounded-full overflow-hidden h-1">
                      <div
                        className="h-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${perf.avancement}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-300 text-xs">Projets en retard</span>
                      <span className={cn(
                        'font-semibold text-sm',
                        perf.retard === 0 ? 'text-emerald-400' : 'text-amber-400'
                      )}>
                        {perf.retard}
                      </span>
                    </div>
                  </div>
                </div>
              </DashboardPanel>
            ))}
          </DashboardGrid>
        </DashboardSection>
        </DashboardPageLayout>
      </TooltipProvider>
    </div>
  );
});

export default ProjetKpiPage;
