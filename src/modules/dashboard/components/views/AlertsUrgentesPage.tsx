/**
 * Page Alertes Urgentes
 * Vue des alertes urgentes (warning et critical) nécessitant une attention immédiate
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
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
import type { AlertsUrgentesData } from '../../types/dashboardDataTypes';
import { AlertDetailModal } from '../AlertDetailModal';
import type { AlertEvent } from '../../hooks/useAlerts';

export const AlertsUrgentesPage = memo(function AlertsUrgentesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<AlertEvent | null>(null);
  
  // ✅ Charger les données depuis l'API
  const { data, isLoading, error } = useDashboardData<AlertsUrgentesData>();
  
  // ✅ Calculer les KPIs depuis les données réelles
  const stats = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        critiques: 0,
        urgentes: 0,
      };
    }
    return data.stats;
  }, [data]);
  
  // ✅ Filtrer les données
  const filteredAlerts = useMemo(() => {
    if (!data?.alerts) return [];
    if (!searchQuery.trim()) return data.alerts;
    
    const query = searchQuery.toLowerCase();
    return data.alerts.filter(alert => 
      alert.ruleName.toLowerCase().includes(query) ||
      alert.severity.toLowerCase().includes(query) ||
      (alert.bureau && alert.bureau.toLowerCase().includes(query)) ||
      (alert.domain && alert.domain.toLowerCase().includes(query))
    );
  }, [data, searchQuery]);
  
  // ✅ Export CSV
  const handleExportCSV = useCallback(() => {
    const headers = ['Règle', 'Sévérité', 'Bureau', 'Domaine', 'Première vue', 'Dernière vue', 'Occurrences'];
    const rows = filteredAlerts.map(alert => [
      alert.ruleName,
      alert.severity === 'critical' ? 'Critique' : 'Urgente',
      alert.bureau || '',
      alert.domain || '',
      new Date(alert.firstSeen).toLocaleDateString('fr-FR'),
      new Date(alert.lastSeen).toLocaleDateString('fr-FR'),
      alert.count.toString(),
    ]);
    exportToCSV(rows, headers, `alertes-urgentes-${new Date().toISOString().split('T')[0]}.csv`);
  }, [filteredAlerts]);
  
  // ✅ Export JSON
  const handleExportJSON = useCallback(() => {
    exportToJSON(filteredAlerts, `alertes-urgentes-${new Date().toISOString().split('T')[0]}.json`);
  }, [filteredAlerts]);
  
  // ✅ KPIs calculés
  const kpis: KPICardData[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total alertes urgentes',
      value: stats.total,
      color: 'amber',
      trend: '+0%',
    },
    {
      id: 'critiques',
      label: 'Critiques',
      value: stats.critiques,
      color: 'rose',
      trend: '+0%',
    },
    {
      id: 'urgentes',
      label: 'Urgentes',
      value: stats.urgentes,
      color: 'amber',
      trend: '+0%',
    },
  ], [stats]);
  
  // ✅ Colonnes pour le tableau
  const columns: DashboardDataTableProps<typeof filteredAlerts[0]>['columns'] = useMemo(() => [
    {
      key: 'ruleName',
      label: 'Règle',
      sortable: true,
      render: (value, row) => (
        <span className="font-medium text-slate-200">{value}</span>
      ),
    },
    {
      key: 'severity',
      label: 'Sévérité',
      sortable: true,
      render: (value: string) => {
        const severityColors = {
          critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${severityColors[value as keyof typeof severityColors] || ''}`}>
            {value === 'critical' ? 'Critique' : 'Urgente'}
          </span>
        );
      },
    },
    {
      key: 'bureau',
      label: 'Bureau',
      sortable: true,
      render: (value) => value || <span className="text-slate-500">-</span>,
    },
    {
      key: 'domain',
      label: 'Domaine',
      sortable: true,
      render: (value) => value || <span className="text-slate-500">-</span>,
    },
    {
      key: 'lastSeen',
      label: 'Dernière vue',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleString('fr-FR'),
    },
    {
      key: 'count',
      label: 'Occurrences',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => (
        <span className="font-semibold tabular-nums">{value}</span>
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
          description={error.message || 'Impossible de charger les alertes urgentes'}
          icon={AlertTriangle}
          variant="error"
        />
      </DashboardPageLayout>
    );
  }
  
  return (
    <DashboardPageLayout>
      <DashboardSection title="Alertes Urgentes" description="Alertes critiques et urgentes nécessitant une attention immédiate">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {kpis.map((kpi) => (
            <KPICard key={kpi.id} kpi={kpi} size="md" />
          ))}
        </div>

        <DashboardPanel>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-200">Liste des alertes urgentes</h3>
            <div className="flex items-center gap-3">
              <SearchFilter
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Rechercher une alerte..."
                totalCount={data?.alerts.length || 0}
                resultsCount={filteredAlerts.length}
              />
              <ExportButton 
                onExportCSV={handleExportCSV} 
                onExportJSON={handleExportJSON} 
              />
            </div>
          </div>

          {filteredAlerts.length === 0 ? (
            <EmptyState
              title={searchQuery ? "Aucune alerte trouvée" : "Aucune alerte urgente"}
              description={
                searchQuery
                  ? `Aucune alerte urgente ne correspond à "${searchQuery}"`
                  : "Il n'y a actuellement aucune alerte urgente nécessitant votre attention."
              }
              icon={AlertTriangle}
              variant="info"
            />
          ) : (
            <DashboardDataTable
              data={filteredAlerts}
              columns={columns}
              onRowClick={(alert) => {
                // Convertir au format AlertEvent pour le modal
                setSelectedAlert({
                  id: alert.id,
                  ruleId: alert.ruleId,
                  ruleName: alert.ruleName,
                  severity: alert.severity,
                  status: alert.status,
                  firstSeen: alert.firstSeen,
                  lastSeen: alert.lastSeen,
                  count: alert.count,
                  payload: alert.payload,
                  labels: alert.labels,
                });
              }}
              pagination
              pageSize={20}
              searchable={false}
            />
          )}
        </DashboardPanel>
      </DashboardSection>
      
      {/* Modal de détail */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}
    </DashboardPageLayout>
  );
});

export default AlertsUrgentesPage;
