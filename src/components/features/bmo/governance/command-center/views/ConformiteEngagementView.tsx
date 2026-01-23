/**
 * Conformité & Engagement global - Onglet 6
 * Suit la conformité globale de l'entreprise (SLA, réglementaire, audits, processus)
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VirtualizedList } from '@/presentation/components/VirtualizedList/VirtualizedList';
import {
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Building2,
  ChevronRight,
  Play,
  Bell,
  Users,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

// Données mock pour la démo
const slaCompliance = {
  global: 96,
  validation: 94,
  treatment: 97,
  response: 98,
  overruns: [
    { id: '1', type: 'Validation BC', module: 'Validation', count: 12, avgDelay: '2.5j' },
    { id: '2', type: 'Traitement dossier', module: 'Dossiers', count: 8, avgDelay: '1.8j' },
  ],
};

const regulatoryCompliance = {
  qse: { rate: 92, issues: 5 },
  financial: { rate: 98, issues: 1 },
  rh: { rate: 95, issues: 3 },
  rgpd: { rate: 96, issues: 2 },
};

const auditAlerts = [
  {
    id: '1',
    title: 'Non-conformité QSE majeure - Site B',
    type: 'audit' as const,
    severity: 'critical' as const,
    date: '10/01/2025',
    status: 'open' as const,
  },
  {
    id: '2',
    title: 'Alerte sécurité - Accès non autorisés',
    type: 'security' as const,
    severity: 'high' as const,
    date: '11/01/2025',
    status: 'open' as const,
  },
];

const nonConformities = [
  {
    id: '1',
    name: 'Processus validation BC',
    type: 'process' as const,
    reason: 'Non respect procédure validation',
    office: null,
    status: 'open' as const,
  },
  {
    id: '2',
    name: 'Bureau Paris Nord',
    type: 'office' as const,
    reason: 'Non-conformité QSE',
    office: 'Paris Nord',
    status: 'open' as const,
  },
];

export function ConformiteEngagementView() {
  const { navigate, openModal } = useGovernanceCommandCenterStore();
  const [selectedTab, setSelectedTab] = useState<'sla' | 'regulatory' | 'audits' | 'nonconform'>(
    'sla'
  );

  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/50">
        <button
          onClick={() => setSelectedTab('sla')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'sla'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Conformité SLA
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('regulatory')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'regulatory'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Conformité réglementaire
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('audits')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'audits'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Alertes audit & sécurité
            {auditAlerts.length > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                {auditAlerts.length}
              </Badge>
            )}
          </div>
        </button>
        <button
          onClick={() => setSelectedTab('nonconform')}
          className={cn(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            selectedTab === 'nonconform'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-slate-400 hover:text-slate-300'
          )}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Non-conformités
            {nonConformities.length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                {nonConformities.length}
              </Badge>
            )}
          </div>
        </button>
      </div>

      {/* Contenu selon l'onglet sélectionné */}
      {selectedTab === 'sla' && (
        <div className="space-y-4">
          {/* KPIs SLA */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
              <div className="text-xs text-slate-400 mb-1">Conformité globale</div>
              <div className="text-2xl font-bold text-emerald-400">{slaCompliance.global}%</div>
            </div>
            <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
              <div className="text-xs text-slate-400 mb-1">Validation</div>
              <div className="text-2xl font-bold text-slate-300">{slaCompliance.validation}%</div>
            </div>
            <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
              <div className="text-xs text-slate-400 mb-1">Traitement</div>
              <div className="text-2xl font-bold text-slate-300">{slaCompliance.treatment}%</div>
            </div>
            <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 p-4">
              <div className="text-xs text-slate-400 mb-1">Réponse</div>
              <div className="text-2xl font-bold text-slate-300">{slaCompliance.response}%</div>
            </div>
          </div>

          {/* SLA en dépassement */}
          <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-medium text-slate-300">SLA en dépassement</h3>
              </div>
            </div>
            <div className="divide-y divide-slate-800/50">
              {slaCompliance.overruns.map((overrun) => (
                <div
                  key={overrun.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-300">{overrun.type}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">Module: {overrun.module}</span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-amber-400">
                          {overrun.count} dépassements
                        </span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-400">
                          Retard moyen: {overrun.avgDelay}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedTab === 'regulatory' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-medium text-slate-300">Conformité réglementaire</h3>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {Object.entries(regulatoryCompliance).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-300 uppercase">{key}</span>
                  {value.issues > 0 && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                      {value.issues} issues
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        value.rate >= 95
                          ? 'bg-emerald-500'
                          : value.rate >= 90
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${value.rate}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-300 w-12 text-right">
                    {value.rate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'audits' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-medium text-slate-300">Alertes audit & sécurité</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-800/50">
            {auditAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                onClick={() => openModal('audit-detail', alert)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    className={cn(
                      'flex items-center justify-center w-8 h-8 rounded-full',
                      alert.severity === 'critical'
                        ? 'bg-red-500/20'
                        : 'bg-amber-500/20'
                    )}
                  >
                    <FileText
                      className={cn(
                        'h-4 w-4',
                        alert.severity === 'critical' ? 'text-red-400' : 'text-amber-400'
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-300">{alert.title}</p>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          alert.severity === 'critical'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        )}
                      >
                        {alert.type === 'audit' ? 'Audit' : 'Sécurité'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">Date: {alert.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="h-7 px-2 bg-blue-600/80 hover:bg-blue-600 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      openModal('audit-detail', { ...alert, action: 'open' });
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Ouvrir audit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'nonconform' && (
        <div className="bg-slate-900/60 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h3 className="text-sm font-medium text-slate-300">
                Processus / Bureaux non conformes
              </h3>
            </div>
          </div>
          {/* ✅ Liste virtualisée pour performance */}
          <VirtualizedList
            items={nonConformities}
            estimateSize={80}
            overscan={5}
            containerClassName="h-[500px] divide-y divide-slate-800/50"
            getItemKey={(item) => item.id}
            renderItem={(item, index) => {
              return (
                <div
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/30 transition-colors cursor-pointer"
                  onClick={() => openModal('commitment-detail' as any, item)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {item.type === 'office' ? (
                      <Building2 className="h-4 w-4 text-amber-400" />
                    ) : (
                      <ClipboardCheck className="h-4 w-4 text-red-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm text-slate-300">{item.name}</p>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                          {item.type === 'office' ? 'Bureau' : 'Processus'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500">Raison: {item.reason}</span>
                        {item.office && (
                          <>
                            <span className="text-xs text-slate-600">•</span>
                            <span className="text-xs text-slate-400">Bureau: {item.office}</span>
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
                        openModal('commitment-detail' as any, { ...item, action: 'plan' });
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Plan d'action
                    </Button>
                  </div>
                </div>
              );
            }}
          </VirtualizedList>
        </div>
      )}
    </div>
  );
}
