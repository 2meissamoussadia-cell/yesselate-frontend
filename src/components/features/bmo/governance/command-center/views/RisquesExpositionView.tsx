/**
 * Risques majeurs & Exposition - Onglet 5
 * Consolide la vision des risques majeurs et calcule l'exposition globale
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  ShieldAlert,
  Gavel,
  AlertCircle,
  Server,
  DollarSign,
  TrendingUp,
  AlertOctagon,
  ChevronRight,
  Play,
  FileText,
  Users,
  ExternalLink,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

// Données mock pour la démo
const projectRisks = [
  {
    id: '1',
    title: 'Retard critique - Projet Alpha',
    probability: 'high' as const,
    impact: 'critical' as const,
    project: 'Projet Alpha',
    exposure: '450K€',
    status: 'unmitigated' as const,
    requiresAction: true,
  },
  {
    id: '2',
    title: 'Dépassement budgétaire majeur - Projet Beta',
    probability: 'medium' as const,
    impact: 'high' as const,
    project: 'Projet Beta',
    exposure: '680K€',
    status: 'mitigating' as const,
    requiresAction: true,
  },
  {
    id: '3',
    title: 'Ressources non disponibles - Projet Gamma',
    probability: 'high' as const,
    impact: 'high' as const,
    project: 'Projet Gamma',
    exposure: '320K€',
    status: 'unmitigated' as const,
    requiresAction: false,
  },
];

const highStakeLitigations = [
  {
    id: '1',
    title: 'Litige contractuel - Projet Iota',
    type: 'Contractuel',
    financialStake: '1.8M€',
    reputationImpact: 'high' as const,
    status: 'en-cours' as const,
    priority: 'critical' as const,
  },
  {
    id: '2',
    title: 'Litige technique - Projet Kappa',
    type: 'Technique',
    financialStake: '450K€',
    reputationImpact: 'medium' as const,
    status: 'en-cours' as const,
    priority: 'high' as const,
  },
];

const qseIncidents = [
  {
    id: '1',
    title: 'Incident sécurité - Site A',
    type: 'Sécurité',
    severity: 'critical' as const,
    date: '10/01/2025',
    status: 'en-cours' as const,
    requiresAudit: true,
  },
  {
    id: '2',
    title: 'Non-conformité environnementale',
    type: 'Environnement',
    severity: 'high' as const,
    date: '08/01/2025',
    status: 'en-cours' as const,
    requiresAudit: true,
  },
];

const systemIncidents = [
  {
    id: '1',
    title: 'Panne serveur critique',
    type: 'Panne',
    severity: 'critical' as const,
    date: '11/01/2025',
    impact: 'Système de validation BC',
    status: 'resolved' as const,
  },
  {
    id: '2',
    title: 'Tentative d\'intrusion détectée',
    type: 'Sécurité',
    severity: 'high' as const,
    date: '09/01/2025',
    impact: 'Système central',
    status: 'en-cours' as const,
  },
];

// Calculs d'exposition
const financialExposure = {
  projects: '1.45M€',
  litigations: '2.25M€',
  qse: '120K€',
  system: '85K€',
  total: '3.90M€',
};

const reputationExposure = {
  projects: 'Moyen',
  litigations: 'Élevé',
  qse: 'Élevé',
  system: 'Faible',
  global: 'Moyen-Élevé',
};

export function RisquesExpositionView() {
  const { navigate, openModal } = useGovernanceCommandCenterStore();
  const [selectedTab, setSelectedTab] = useState<
    'risks' | 'litigations' | 'qse' | 'system' | 'exposure'
  >('risks');

  return (
    <div className="p-4 space-y-4">
      {/* Exposition consolidée (en haut) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-medium text-slate-300">Exposition financière</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Projets</span>
              <span className="text-sm text-slate-300">{financialExposure.projects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Litiges</span>
              <span className="text-sm text-slate-300">{financialExposure.litigations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">QSE</span>
              <span className="text-sm text-slate-300">{financialExposure.qse}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Système</span>
              <span className="text-sm text-slate-300">{financialExposure.system}</span>
            </div>
            <div className="border-t border-slate-800/50 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Total</span>
                <span className="text-lg font-bold text-amber-400">
                  {financialExposure.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-purple-400" />
            <h3 className="text-sm font-medium text-slate-300">Exposition réputationnelle</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Projets</span>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                {reputationExposure.projects}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Litiges</span>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {reputationExposure.litigations}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">QSE</span>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {reputationExposure.qse}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Système</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                {reputationExposure.system}
              </Badge>
            </div>
            <div className="border-t border-slate-800/50 pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Global</span>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                  {reputationExposure.global}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/50">
        <button
          onClick={() => setSelectedTab('risks')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'risks'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Risques projets
            {projectRisks.length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {projectRisks.length}
              </Badge>
            )}
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('litigations')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'litigations'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <Gavel className="h-4 w-4" />
            Litiges à fort enjeu
            {highStakeLitigations.length > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                {highStakeLitigations.length}
              </Badge>
            )}
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('qse')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'qse'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Incidents QSE
            {qseIncidents.length > 0 && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                {qseIncidents.length}
              </Badge>
            )}
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('system')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'system'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Incidents système
            {systemIncidents.length > 0 && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                {systemIncidents.length}
              </Badge>
            )}
          </div>
        </button>
      </div>

      {/* Contenu selon l'onglet sélectionné */}
      {selectedTab === 'risks' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-medium text-slate-300">Risques projets critiques</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {projectRisks.map((risk) => (
              <div
                key={risk.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('risk-detail', risk)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full',
                      risk.impact === 'critical'
                        ? 'bg-red-500/20'
                        : risk.impact === 'high'
                        ? 'bg-amber-500/20'
                        : 'bg-blue-500/20'
                    )}
                  >
                    <AlertTriangle
                      className={cn(
                        'h-4 w-4',
                        risk.impact === 'critical'
                          ? 'text-red-400'
                          : risk.impact === 'high'
                          ? 'text-amber-400'
                          : 'text-blue-400'
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{risk.title}</p>
                      {risk.requiresAction && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                          Action requise
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">Projet: {risk.project}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          risk.probability === 'high'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        )}
                      >
                        Probabilité: {risk.probability === 'high' ? 'Élevée' : 'Moyenne'}
                      </Badge>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-amber-400">Exposition: {risk.exposure}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-blue-600/80 hover:bg-blue-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('risk-detail', { ...risk, action: 'mitigate' });
                    }}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Plan mitigation
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'litigations' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Gavel className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-medium text-slate-300">Litiges à fort enjeu</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {highStakeLitigations.map((litigation) => (
              <div
                key={litigation.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('project-detail', litigation)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20">
                    <Gavel className="h-4 w-4 text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{litigation.title}</p>
                      <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                        {litigation.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-amber-400">
                        Enjeu financier: {litigation.financialStake}
                      </span>
                      <span className="text-xs text-slate-600">•</span>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          litigation.reputationImpact === 'high'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        )}
                      >
                        Impact réputationnel: {litigation.reputationImpact === 'high' ? 'Élevé' : 'Moyen'}
                      </Badge>
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
                      openModal('project-detail', litigation);
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

      {selectedTab === 'qse' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-blue-400" />
              <h3 className="text-sm font-medium text-slate-300">Incidents QSE majeurs</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {qseIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('alert-detail', incident)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full',
                      incident.severity === 'critical'
                        ? 'bg-red-500/20'
                        : 'bg-amber-500/20'
                    )}
                  >
                    <AlertCircle
                      className={cn(
                        'h-4 w-4',
                        incident.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{incident.title}</p>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          incident.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        )}
                      >
                        {incident.severity === 'critical' ? 'Critique' : 'Élevé'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">Type: {incident.type}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">Date: {incident.date}</span>
                      {incident.requiresAudit && (
                        <>
                          <span className="text-xs text-slate-600">•</span>
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            Audit requis
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-blue-600/80 hover:bg-blue-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('alert-detail', { ...incident, action: 'audit' });
                    }}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Lancer audit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'system' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-purple-400" />
              <h3 className="text-sm font-medium text-slate-300">Incidents système critiques</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {systemIncidents.map((incident) => (
              <div
                key={incident.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('alert-detail', incident)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full',
                      incident.severity === 'critical'
                        ? 'bg-red-500/20'
                        : 'bg-amber-500/20'
                    )}
                  >
                    <Server
                      className={cn(
                        'h-4 w-4',
                        incident.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{incident.title}</p>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          incident.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border-red-500/30'
                        )}
                      >
                        {incident.status === 'resolved' ? 'Résolu' : 'En cours'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-400">Type: {incident.type}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">Date: {incident.date}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">Impact: {incident.impact}</span>
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
                      openModal('alert-detail', incident);
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
