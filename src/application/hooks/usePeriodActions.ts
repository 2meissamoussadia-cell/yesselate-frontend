/**
 * usePeriodActions Hook
 * Centralise toutes les actions disponibles sur les périodes
 */

import { useCallback } from 'react';
import { useAnalyticsCommandCenterStore } from '@/lib/stores/analyticsCommandCenterStore';
import { useAnalyticsToast } from '@/components/features/bmo/analytics/workspace/AnalyticsToast';
import type { PeriodData } from '@/domain/analytics/entities/Period';
import type { AnalyticsMainCategory } from '@/lib/stores/analyticsCommandCenterStore';

interface ActionContext {
  category?: AnalyticsMainCategory;
  subCategory?: string;
  priority?: 'high' | 'medium' | 'low';
  [key: string]: any;
}

/**
 * Génère le contenu CSV pour l'export
 */
function generateCSV(data: PeriodData[]): string {
  const headers = ['Période', 'Label', 'Valeur', 'Évolution'];
  const rows = data.map(p => [
    p.period,
    p.label,
    p.value.toString(),
    p.trend?.toString() || '0',
  ]);

  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n');
}

/**
 * Télécharge un fichier
 */
function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Hook pour gérer les actions sur les périodes
 * 
 * @param period - Période courante (optionnelle)
 * @param category - Catégorie analytics
 * @param subCategory - Sous-catégorie
 * @returns Objet avec toutes les actions disponibles
 */
export function usePeriodActions(
  period?: PeriodData,
  category?: AnalyticsMainCategory,
  subCategory?: string
) {
  const { openModal } = useAnalyticsCommandCenterStore();
  const toast = useAnalyticsToast();
  const periodLabel = period?.label || 'période actuelle';

  const createAlert = useCallback((context?: ActionContext) => {
    openModal('alert-config', {
      context: 'period-comparison',
      period: periodLabel,
      category: category || context?.category,
      subCategory: subCategory || context?.subCategory,
      value: period?.value || 0,
      ...context,
    });
    toast.success(`Configuration d'alerte pour ${periodLabel}`);
  }, [openModal, toast, periodLabel, period, category, subCategory]);

  const createTask = useCallback((context?: ActionContext) => {
    openModal('create-task', {
      context: 'period-comparison',
      period: periodLabel,
      category: category || context?.category,
      subCategory: subCategory || context?.subCategory,
      initialTitle: `Action correctrice - ${periodLabel}`,
      initialDescription: `Plan d'action pour corriger les écarts observés sur la période ${periodLabel}`,
      initialPriority: subCategory === 'critical' ? 'high' : 'medium',
      ...context,
    });
    toast.success(`Tâche créée pour ${periodLabel}`);
  }, [openModal, toast, periodLabel, category, subCategory]);

  const scheduleMeeting = useCallback((context?: ActionContext) => {
    openModal('schedule-meeting', {
      context: 'period-comparison',
      period: periodLabel,
      category: category || context?.category,
      subCategory: subCategory || context?.subCategory,
      initialTitle: `Réunion d'analyse - ${periodLabel}`,
      initialDescription: `Analyse de l'évolution des ${subCategory === 'critical' ? 'alertes critiques' : subCategory === 'warning' ? 'avertissements' : 'alertes résolues'} sur la période ${periodLabel}`,
      meetingType: subCategory === 'critical' || context?.priority === 'high' ? 'urgent' : 'regular',
      ...context,
    });
    toast.success(`Réunion planifiée pour ${periodLabel}`);
  }, [openModal, toast, periodLabel, category, subCategory]);

  const generateReport = useCallback((data?: PeriodData[]) => {
    openModal('report', {
      context: 'period-comparison',
      period: periodLabel,
      category: category,
      subCategory: subCategory,
      data: data || [],
    });
    toast.info(`Génération du rapport pour ${periodLabel}`);
  }, [openModal, toast, periodLabel, category, subCategory]);

  const exportData = useCallback((data: PeriodData[]) => {
    const csvContent = generateCSV(data);
    const filename = `comparaison-periodes-${subCategory || 'all'}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvContent, filename);
    toast.success('Données exportées avec succès');
  }, [toast, subCategory]);

  return {
    createAlert,
    createTask,
    scheduleMeeting,
    generateReport,
    exportData,
  };
}

