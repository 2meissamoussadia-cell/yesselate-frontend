/**
 * Synthèse DG / BMO - Onglet 8
 * Fournit des synthèses périodiques et des rapports consolidés
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  Brain,
  FolderKanban,
  Users,
  Wallet,
  AlertTriangle,
  Scale,
  CheckCircle2,
  XCircle,
  Play,
  Share2,
  Archive,
  ChevronRight,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

// Données mock pour la démo
const syntheses = [
  {
    id: '1',
    type: 'weekly' as const,
    period: 'Semaine du 06/01/2025',
    date: '12/01/2025',
    status: 'generated' as const,
  },
  {
    id: '2',
    type: 'monthly' as const,
    period: 'Décembre 2024',
    date: '05/01/2025',
    status: 'generated' as const,
  },
];

const consolidatedReports = [
  {
    id: '1',
    type: 'projects' as const,
    title: 'Rapport projets consolidé',
    lastUpdate: '11/01/2025',
    status: 'available' as const,
  },
  {
    id: '2',
    type: 'rh' as const,
    title: 'Rapport RH consolidé',
    lastUpdate: '10/01/2025',
    status: 'available' as const,
  },
  {
    id: '3',
    type: 'financial' as const,
    title: 'Rapport finances consolidé',
    lastUpdate: '09/01/2025',
    status: 'available' as const,
  },
  {
    id: '4',
    type: 'risks' as const,
    title: 'Rapport risques consolidé',
    lastUpdate: '08/01/2025',
    status: 'available' as const,
  },
  {
    id: '5',
    type: 'decisions' as const,
    title: 'Rapport décisions consolidé',
    lastUpdate: '07/01/2025',
    status: 'available' as const,
  },
];

const aiRecommendations = [
  {
    id: '1',
    type: 'decision' as const,
    title: 'Recommandation décision - Projet Alpha',
    description: 'Valider rapidement l\'arbitrage budgétaire pour éviter escalade',
    priority: 'high' as const,
    status: 'pending' as const,
  },
  {
    id: '2',
    type: 'optimization' as const,
    title: 'Optimisation ressources - Projet Beta',
    description: 'Réallocation recommandée pour réduire retard',
    priority: 'medium' as const,
    status: 'pending' as const,
  },
];

export function SyntheseDgBmoView() {
  const { navigate, openModal } = useGovernanceCommandCenterStore();
  const [selectedTab, setSelectedTab] = useState<'syntheses' | 'reports' | 'recommendations'>(
    'syntheses'
  );

  const reportIcons = {
    projects: FolderKanban,
    rh: Users,
    financial: Wallet,
    risks: AlertTriangle,
    decisions: Scale,
  };

  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/50">
        <button
          onClick={() => setSelectedTab('syntheses')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'syntheses'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Synthèses périodiques
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('reports')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'reports'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Rapports consolidés
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('recommendations')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'recommendations'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Recommandations IA
            {aiRecommendations.length > 0 && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                {aiRecommendations.length}
              </Badge>
            )}
          </div>
        </button>
      </div>

      {/* Contenu selon l'onglet sélectionné */}
      {selectedTab === 'syntheses' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-medium text-slate-300">Synthèses hebdomadaires / mensuelles</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 hover:text-slate-300"
              onClick={() => openModal('export-config', {})}
            >
              <Play className="h-3 w-3 mr-1" />
              Générer synthèse
            </Button>
          </div>
          <div className="divide-y divide-slate-800/50">
            {syntheses.map((synthesis) => (
              <div
                key={synthesis.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('document-viewer', synthesis)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full',
                      synthesis.type === 'weekly'
                        ? 'bg-blue-500/20'
                        : 'bg-emerald-500/20'
                    )}
                  >
                    <Calendar
                      className={cn(
                        'h-4 w-4',
                        synthesis.type === 'weekly' ? 'text-blue-400' : 'text-emerald-400'
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">
                        Synthèse {synthesis.type === 'weekly' ? 'hebdomadaire' : 'mensuelle'}
                      </p>
                      <Badge className="bg-slate-700/50 text-slate-400 border-slate-600/50 text-xs">
                        {synthesis.period}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">Générée le: {synthesis.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-slate-400 hover:text-slate-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('document-viewer', { ...synthesis, action: 'export' });
                    }}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Exporter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'reports' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-medium text-slate-300">Rapports consolidés</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-500 hover:text-slate-300"
              onClick={() => openModal('export-config', {})}
            >
              <Play className="h-3 w-3 mr-1" />
              Générer rapport
            </Button>
          </div>
          <div className="divide-y divide-slate-800/50">
            {consolidatedReports.map((report) => {
              const Icon = reportIcons[report.type];
              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => openModal('document-viewer', report)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
                      <Icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-slate-300">{report.title}</p>
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                          Disponible
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">
                          Dernière mise à jour: {report.lastUpdate}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-slate-400 hover:text-slate-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('document-viewer', { ...report, action: 'export' });
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-slate-400 hover:text-slate-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal('document-viewer', report);
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedTab === 'recommendations' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-medium text-slate-300">Recommandations IA stratégiques</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {aiRecommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('action-plan', recommendation)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
                    <Brain className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{recommendation.title}</p>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          recommendation.priority === 'high'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        )}
                      >
                        {recommendation.priority === 'high' ? 'Priorité élevée' : 'Priorité moyenne'}
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-slate-400">{recommendation.description}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('action-plan', { ...recommendation, action: 'apply' });
                    }}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-slate-400 hover:text-slate-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('action-plan', recommendation);
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
