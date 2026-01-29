/**
 * Page Retards Critiques
 * Vue des retards critiques nécessitant une intervention immédiate
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { AlertTriangle, Clock, TrendingUp, FileText, DollarSign, Briefcase, CheckCircle2 } from 'lucide-react';
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
import type { DelaysCritiquesData } from '../../types/dashboardDataTypes';
import { formatMoneyEUR } from '../../utils/colorMapping';
import { cn } from '@/lib/utils';

export const DelaysCritiquesPage = memo(function DelaysCritiquesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<DelaysCritiquesData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        plus30Jours: 0,
        plus60Jours: 0,
        impactBudget: 0,
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
      retard.type.toLowerCase().includes(query) ||
      (retard.cause && retard.cause.toLowerCase().includes(query))
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['ID', 'Type', 'Titre', 'Projet', 'Bureau', 'Date échéance', 'Jours de retard', 'Impact budget', 'Cause'];
    const rows = filteredRetards.map(retard => [
      retard.id,
      retard.type,
      retard.titre,
      retard.projet || '',
      retard.bureau,
      new Date(retard.dateEcheance).toLocaleDateString('fr-FR'),
      retard.joursRetard.toString(),
      retard.impactBudgetFormatted || '',
      retard.cause || '',
    ]);
    exportToCSV(rows, headers, `retards-critiques-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredRetards]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredRetards, `retards-critiques-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredRetards]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total retards critiques',
      value: stats.total,
      color: 'rose',
      trend: '+0%',
    },
    {
      id: 'plus-30',
      label: 'Plus de 30 jours',
      value: stats.plus30Jours,
      color: 'rose',
      trend: '+0%',
    },
    {
      id: 'plus-60',
      label: 'Plus de 60 jours',
      value: stats.plus60Jours,
      color: 'rose',
      trend: '+0%',
    },
    {
      id: 'impact-budget',
      label: 'Impact budget',
      value: formatMoneyEUR(stats.impactBudget),
      color: 'amber',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Icônes par type
  const typeIcons = {
    demande: FileText,
    validation: CheckCircle2,
    paiement: DollarSign,
    autre: AlertTriangle,
  };
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredRetards[0]>['columns'] = useMemo(() => [
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (value: string, row) => {
        const Icon = typeIcons[value as keyof typeof typeIcons] || AlertTriangle;
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
        <span className="text-slate-500">-</span>
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
          <Clock className="h-3 w-3 text-rose-400" />
          <span className={cn(
            'font-semibold tabular-nums',
            value >= 60 ? 'text-rose-400' : value >= 30 ? 'text-amber-400' : 'text-slate-300'
          )}>
            {value}j
          </span>
        </div>
      ),
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
    {
      key: 'impactBudgetFormatted',
      label: 'Impact budget',
      sortable: true,
      align: 'right' as const,
      render: (value) => value ? (
        <span className="font-semibold tabular-nums text-amber-400">{value}</span>
      ) : (
        <span className="text-slate-500">-</span>
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
          description={error.message || 'Impossible de charger les retards critiques'}
          icon={AlertTriangle}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Retards Critiques" description="Retards nécessitant une intervention immédiate">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des retards critiques</h3>
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
              title={searchQuery ? "Aucun retard trouvé" : "Aucun retard critique"}
              description={
                searchQuery
                  ? `Aucun retard critique ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucun retard critique nécessitant une intervention."
              }
              icon={AlertTriangle}
              variant="warning"
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

export default DelaysCritiquesPage;
