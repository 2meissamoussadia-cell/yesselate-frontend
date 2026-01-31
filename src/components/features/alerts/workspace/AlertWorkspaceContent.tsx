'use client';

import { useState, useCallback } from 'react';
import { useAlertWorkspaceStore, type AlertUIState } from '@/lib/stores/alertWorkspaceStore';
import { AlertInboxView } from './views/AlertInboxView';
import { AlertDetailView } from './views/AlertDetailView';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { 
  AlertTriangle, 
  Bell, 
  Shield, 
  CheckCircle, 
  BarChart3,
  Clock,
  AlertCircle,
  Info,
  TrendingUp,
} from 'lucide-react';

/**
 * AlertWorkspaceContent
 * =====================
 * 
 * Composant central qui route vers la bonne vue selon le type d'onglet.
 * 
 * Types d'onglets supportés:
 * - inbox: Liste des alertes (par queue)
 * - alert: Vue détaillée d'une alerte
 * - heatmap: Carte de chaleur des risques
 * - report: Rapport d'analyse
 * - analytics: Tableau de bord analytique
 */

export function AlertWorkspaceContent() {
  const { tabs, activeTabId, openTab } = useAlertWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  // ================================
  // VUE PAR DÉFAUT (pas d'onglet actif)
  // ================================
  if (!activeTab) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70 flex flex-col items-center justify-center text-center min-h-[400px]">
        <AlertTriangle className="w-16 h-16 text-amber-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-2">
          Alertes & Risques
        </h2>
        <p className="text-slate-400 mb-6 max-w-md">
          Surveillez et gérez les alertes système, dossiers bloqués, dépassements SLA et risques projet.
          Traçabilité complète et escalade automatique.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:critical', 
              type: 'inbox', 
              title: 'Critiques', 
              icon: '🔴', 
              data: { queue: 'critical' } 
            })}
          >
            <AlertCircle className="w-4 h-4 text-rose-500" /> Critiques
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:warning', 
              type: 'inbox', 
              title: 'Avertissements', 
              icon: '⚠️', 
              data: { queue: 'warning' } 
            })}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Avertissements
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:blocked', 
              type: 'inbox', 
              title: 'Bloqués', 
              icon: '🚫', 
              data: { queue: 'blocked' } 
            })}
          >
            <Shield className="w-4 h-4 text-orange-500" /> Bloqués
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:resolved', 
              type: 'inbox', 
              title: 'Résolues', 
              icon: '✅', 
              data: { queue: 'resolved' } 
            })}
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Résolues
          </FluentButton>
        </div>

        <div className="mt-6 flex gap-3">
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:sla', 
              type: 'inbox', 
              title: 'SLA dépassés', 
              icon: '⏱️', 
              data: { queue: 'sla' } 
            })}
          >
            <Clock className="w-4 h-4 text-rose-500" /> SLA
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:payment', 
              type: 'inbox', 
              title: 'Paiements', 
              icon: '💰', 
              data: { queue: 'payment' } 
            })}
          >
            <Info className="w-4 h-4 text-blue-500" /> Paiements
          </FluentButton>
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'analytics:overview', 
              type: 'analytics', 
              title: 'Analytics', 
              icon: '📊', 
            })}
          >
            <BarChart3 className="w-4 h-4 text-purple-500" /> Analytics
          </FluentButton>
        </div>
        
        <p className="text-xs text-slate-400 mt-8">
          Astuce: Utilisez les raccourcis <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">Ctrl+1</kbd> à <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">Ctrl+5</kbd> pour ouvrir les files principales.
        </p>
      </div>
    );
  }

  // ================================
  // ROUTING PAR TYPE D'ONGLET
  // ================================

  // Inbox (file de travail)
  if (activeTab.type === 'inbox') {
    return <AlertInboxView tab={activeTab} />;
  }

  // Alerte (vue détaillée)
  if (activeTab.type === 'alert') {
    const alertId = activeTab.data?.alertId || activeTab.id.replace('alert:', '');
    return <AlertDetailView alertId={alertId} />;
  }

  // Heatmap
  if (activeTab.type === 'heatmap') {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Heatmap des Risques
          </h3>
        </div>
        <p className="text-slate-400 text-sm">
          Carte de chaleur interactive des risques par bureau (à venir)
        </p>
      </div>
    );
  }

  // Report
  if (activeTab.type === 'report') {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Rapport d'Analyse
          </h3>
        </div>
        <p className="text-slate-400 text-sm">
          Rapport détaillé des alertes et tendances (à venir)
        </p>
      </div>
    );
  }

  // Analytics
  if (activeTab.type === 'analytics') {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            Analytics & KPIs
          </h3>
        </div>
        <p className="text-slate-400 text-sm">
          Tableau de bord analytique complet (à venir)
        </p>
      </div>
    );
  }

  // Fallback
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70 flex items-center justify-center min-h-[400px]">
      <p className="text-slate-400">Type d'onglet non supporté: {activeTab.type}</p>
    </div>
  );
}

