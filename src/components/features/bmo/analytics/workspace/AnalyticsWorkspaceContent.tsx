/**
 * AnalyticsWorkspaceContent.tsx
 * ==============================
 * 
 * Composant central qui route vers la bonne vue selon le type d'onglet
 */

'use client';

import { useAnalyticsWorkspaceStore } from '@/lib/stores/analyticsWorkspaceStore';
import { AnalyticsInboxView } from './views/AnalyticsInboxView';
import { AnalyticsDashboardView } from './views/AnalyticsDashboardView';
import { AnalyticsReportView } from './views/AnalyticsReportView';
import { AnalyticsComparisonView } from './views/AnalyticsComparisonView';
import { BarChart3, TrendingUp, Plus, FileText, Download } from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';

export function AnalyticsWorkspaceContent() {
  const { tabs, activeTabId, openTab } = useAnalyticsWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  // ================================
  // VUE PAR DÉFAUT (pas d'onglet actif)
  // ================================
  if (!activeTab) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#1f1f1f]/70 p-8 flex flex-col items-center justify-center text-center min-h-[500px]">
        <BarChart3 className="w-20 h-20 text-orange-400 mb-6" />
        <h2 className="text-3xl font-bold text-slate-200 mb-3">
          Analytics & Insights
        </h2>
        <p className="text-slate-400 mb-8 max-w-2xl text-lg">
          Analysez les performances, identifiez les tendances et prenez des décisions éclairées
          avec des indicateurs en temps réel et des rapports détaillés.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mb-8">
          <button
            onClick={() => openTab({ 
              id: 'dashboard:overview', 
              type: 'dashboard', 
              title: 'Vue d\'ensemble', 
              icon: '📊',
              data: { view: 'overview' }
            })}
            className="p-6 rounded-2xl border-2 border-slate-700 hover:border-orange-500/50 
                     bg-gradient-to-br from-orange-950/20 to-amber-950/20
                     transition-all hover:scale-105 group"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2 text-slate-200">
              Vue d'ensemble
            </h3>
            <p className="text-sm text-slate-400">
              KPIs globaux, tendances et alertes
            </p>
          </button>
          
          <button
            onClick={() => openTab({ 
              id: 'inbox:performance', 
              type: 'inbox', 
              title: 'Performance', 
              icon: '⚡',
              data: { queue: 'performance' }
            })}
            className="p-6 rounded-2xl border-2 border-slate-700 hover:border-emerald-500/50 
                     bg-gradient-to-br from-emerald-950/20 to-green-950/20
                     transition-all hover:scale-105 group"
          >
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2 text-slate-200">
              Performance
            </h3>
            <p className="text-sm text-slate-400">
              Indicateurs de performance opérationnelle
            </p>
          </button>
          
          <button
            onClick={() => openTab({ 
              id: 'inbox:financial', 
              type: 'inbox', 
              title: 'Financier', 
              icon: '💰',
              data: { queue: 'financial' }
            })}
            className="p-6 rounded-2xl border-2 border-slate-700 hover:border-amber-500/50 
                     bg-gradient-to-br from-amber-950/20 to-yellow-950/20
                     transition-all hover:scale-105 group"
          >
            <div className="text-4xl mb-3">💰</div>
            <h3 className="text-lg font-semibold mb-2 text-slate-200">
              Financier
            </h3>
            <p className="text-sm text-slate-400">
              Budget, dépenses et rentabilité
            </p>
          </button>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:trends', 
              type: 'inbox', 
              title: 'Tendances', 
              icon: '📈',
              data: { queue: 'trends' }
            })}
          >
            <TrendingUp className="w-4 h-4" /> Tendances
          </FluentButton>
          
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'inbox:alerts', 
              type: 'inbox', 
              title: 'Alertes', 
              icon: '🚨',
              data: { queue: 'alerts' }
            })}
          >
            <FileText className="w-4 h-4" /> Alertes
          </FluentButton>
          
          <FluentButton
            variant="secondary"
            onClick={() => openTab({ 
              id: 'export:scheduled', 
              type: 'export', 
              title: 'Export', 
              icon: '📥',
              data: { action: 'export' }
            })}
          >
            <Download className="w-4 h-4" /> Export
          </FluentButton>
        </div>
        
        <p className="text-xs text-slate-400 mt-10">
          💡 Astuce: Utilisez <kbd className="px-2 py-1 rounded bg-slate-700 text-xs font-mono text-slate-200">Ctrl+K</kbd> pour ouvrir la palette de commandes
        </p>
      </div>
    );
  }

  // ================================
  // ROUTING PAR TYPE D'ONGLET
  // ================================

  // Inbox (liste des KPIs/métriques)
  if (activeTab.type === 'inbox') {
    return <AnalyticsInboxView tab={activeTab} />;
  }

  // Dashboard (vue d'ensemble)
  if (activeTab.type === 'dashboard') {
    return <AnalyticsDashboardView />;
  }

  // Report (rapport détaillé)
  if (activeTab.type === 'report') {
    return <AnalyticsReportView />;
  }

  // Trend (analyse tendances)
  if (activeTab.type === 'trend') {
    return <AnalyticsDashboardView />;
  }

  // Comparison (comparaison)
  if (activeTab.type === 'comparison') {
    return <AnalyticsComparisonView />;
  }

  // Export
  if (activeTab.type === 'export') {
    return <AnalyticsReportView />;
  }

  // Fallback
  return <div className="p-8 text-center text-slate-400">Vue non gérée: {activeTab.type}</div>;
}

