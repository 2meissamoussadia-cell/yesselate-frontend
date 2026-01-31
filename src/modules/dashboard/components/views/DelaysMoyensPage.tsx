/**
 * Page Retards Moyens
 * Vue des retards moyens nécessitant un suivi
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { Clock, AlertCircle, TrendingUp, TrendingDown, FileText, DollarSign, CheckCircle2, ExternalLink } from 'lucide-react';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardPanel,
  KPICard,
  type KPICardData,
  DashboardDataTable,
  type DashboardDataTableProps,
  DashboardPageSkeleton,
} from '../shared';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { SearchFilter } from '../shared/SearchFilter';
import { useDashboardData } from '../../hooks/useDashboardData';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';
import type { DelaysMoyensData } from '../../types/dashboardDataTypes';
import { cn } from '@/lib/utils';

export const DelaysMoyensPage = memo(function DelaysMoyensPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<DelaysMoyensData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        entre7et30Jours: 0,
        entre30et60Jours: 0,
        enAmelioration: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredRetards = useMemo(() => {
    if (!data?.retards) return [];
    if (!searchQuery.trim()) return data.retards;
    
    const query = searchQuery.toLowerCase();
    return data.retards.filter(retard => 
      retard.titre.toLowerCase().includes(query) ||
      (retard.projet && retard.projet.toLowerCase().includes(query)) ||
      retard.bureau.toLowerCase().includes(query) ||
      retard.type.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['ID', 'Type', 'Titre', 'Projet', 'Bureau', 'Date échéance', 'Jours de retard', 'Tendance'];
    const rows = filteredRetards.map(retard => [
      retard.id,
      retard.type,
      retard.titre,
      retard.projet || '',
      retard.bureau,
      new Date(retard.dateEcheance).toLocaleDateString('fr-FR'),
      retard.joursRetard.toString(),
      retard.tendance === 'up' ? '↑' : retard.tendance === 'down' ? '↓' : '→',
    ]);
    exportToCSV(rows, headers, `retards-moyens-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredRetards]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredRetards, `retards-moyens-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredRetards]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total retards moyens',
      value: stats.total,
      color: 'amber',
      trend: '+0%',
    },
    {
      id: '7-30',
      label: '7-30 jours',
      value: stats.entre7et30Jours,
      color: 'amber',
      trend: '+0%',
    },
    {
      id: '30-60',
      label: '30-60 jours',
      value: stats.entre30et60Jours,
      color: 'rose',
      trend: '+0%',
    },
    {
      id: 'amelioration',
      label: 'En amélioration',
      value: stats.enAmelioration,
      color: 'emerald',
      trend: '-0%',
    },
  ], [stats]);
  
  // ✅ Icônes par type
  const typeIcons = {
    demande: FileText,
    validation: CheckCircle2,
    paiement: DollarSign,
    autre: Clock,
  };
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredRetards[0]>['columns'] = useMemo(() => [
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string, row) => {
        const Icon = typeIcons[value as keyof typeof typeIcons] || Clock;
        return (
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" />
            <span className="text-slate-300 text-sm uppercase">{value}</span>
          </div>
        );
      },
    },
    {
      key: 'titre',
      label: 'Titre',
      sortable: true,
      render: (value) => (
        <span className="font-medium text-slate-200">{value}</span>
      ),
    },
    {
      key: 'projet',
      label: 'Projet',
      sortable: true,
      render: (value) => value ? (
        <span className="text-slate-300">{value}</span>
      ) : (
        <span className="text-slate-400">-</span>
      ),
    },
    {
      key: 'bureau',
      label: 'Bureau',
      sortable: true,
      render: (value) => (
        <span className="text-slate-300">{value}</span>
      ),
    },
    {
      key: 'joursRetard',
      label: 'Jours de retard',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <div className="flex items-center justify-end gap-1">
          <Clock className="h-3 w-3 text-amber-400" />
          <span className={cn(
            'font-semibold tabular-nums',
            value >= 30 ? 'text-amber-400' : 'text-slate-300'
          )}>
            {value}j
          </span>
        </div>
      ),
    },
    {
      key: 'tendance',
      label: 'Tendance',
      sortable: true,
      render: (value: 'up' | 'down' | 'stable' | undefined) => {
        if (!value) return <span className="text-slate-400">-</span>;
        const icons = {
          up: <TrendingUp className="h-4 w-4 text-rose-400" />,
          down: <TrendingDown className="h-4 w-4 text-emerald-400" />,
          stable: <Clock className="h-4 w-4 text-slate-400" />,
        };
        const labels = {
          up: '↑ Détérioration',
          down: '↓ Amélioration',
          stable: '→ Stable',
        };
        return (
          <div className="flex items-center gap-1">
            {icons[value]}
            <span className="text-sm text-slate-300">{labels[value]}</span>
          </div>
        );
      },
    },
    {
      key: 'dateEcheance',
      label: 'Date échéance',
      sortable: true,
      render: (value: string) => (
        <span className="text-slate-300 text-sm">
          {new Date(value).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
  ], []);
  
  if (isLoading) {
    return <DashboardPageSkeleton />;
  }
  
  if (error) {
    return (
      <DashboardPageLayout>
        <EmptyState
          title="Erreur de chargement"
          description={error.message || 'Impossible de charger les retards moyens'}
          icon={Clock}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      {/* Redistribution : accès au module Alertes > Projets > Retards */}
      <div className="mb-4 rounded-xl border border-slate-800/70 bg-slate-900/40 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-slate-400">Accès module :</span>
        <Link
          href="/maitre-ouvrage/alerts/projets/retards"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/60 hover:text-slate-100 transition-colors"
        >
          <Clock className="h-3.5 w-3.5" />
          Centre d&apos;alertes — Retards projets
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </Link>
      </div>
      <DashboardSection title="Retards Moyens" description="Retards nécessitant un suivi">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des retards moyens</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher un retard..."
                totalCount={data?.retards.length || 0}
                resultsCount={filteredRetards.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredRetards.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucun retard trouvé" : "Aucun retard moyen"}
              description={
                searchQuery
                  ? `Aucun retard moyen ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucun retard moyen nécessitant un suivi."
              }
              icon={Clock}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredRetards}
              columns={columns}
              pagination
              pageSize={20}
              searchable={false}
            />
          )}
        </DashboardPanel>
      </DashboardSection>
    </DashboardPageLayout>
  );
});

export default DelaysMoyensPage;
