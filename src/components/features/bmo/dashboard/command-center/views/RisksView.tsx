/**
 * Vue Risques du Dashboard
 * Risk Radar - Surveillance et gestion des risques
 */

'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  AlertCircle,
  Shield,
  Clock,
  Wallet,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';

// Types
interface RiskItem {
  id: string;
  kind: 'system_alert' | 'blocked_dossier' | 'payment_due' | 'contract_expiry';
  severity: 'critical' | 'warning' | 'watch';
  score: number;
  title: string;
  detail: string;
  source: string;
  explain: string;
  trend: 'up' | 'down' | 'stable';
  createdAt: string;
}

// Données de démo
const mockRisks: RiskItem[] = [
  {
    id: 'RISK-001',
    kind: 'blocked_dossier',
    severity: 'critical',
    score: 92,
    title: 'BC bloqué depuis 5 jours',
    detail: 'BC-2024-0847 • Matériaux Phase 3',
    source: 'BF',
    explain: 'SLA dépassé: substitution recommandée pour rétablir la chaîne de validation.',
    trend: 'up',
    createdAt: '05/01/2026',
  },
  {
    id: 'RISK-002',
    kind: 'payment_due',
    severity: 'critical',
    score: 88,
    title: 'Paiement en retard 3 jours',
    detail: 'PAY-2024-1234 • ACME Corp • 128.5M FCFA',
    source: 'BCG',
    explain: 'Retard: risque réputationnel / pénalités / blocage fournisseur.',
    trend: 'stable',
    createdAt: '07/01/2026',
  },
  {
    id: 'RISK-003',
    kind: 'contract_expiry',
    severity: 'warning',
    score: 72,
    title: 'Contrat expire dans 5 jours',
    detail: 'CTR-2024-0567 • Sous-traitance électricité',
    source: 'BJA',
    explain: 'Expiration proche: sécuriser la signature et la traçabilité.',
    trend: 'down',
    createdAt: '08/01/2026',
  },
  {
    id: 'RISK-004',
    kind: 'system_alert',
    severity: 'warning',
    score: 65,
    title: 'Charge bureau excessive',
    detail: 'BOP • Charge à 95% • 4 goulots détectés',
    source: 'Système',
    explain: 'Alerte préventive: risque de retards en cascade.',
    trend: 'up',
    createdAt: '09/01/2026',
  },
  {
    id: 'RISK-005',
    kind: 'blocked_dossier',
    severity: 'warning',
    score: 58,
    title: 'Arbitrage en attente 3 jours',
    detail: 'ARB-2024-0089 • Conflit ressources',
    source: 'BOP',
    explain: 'Délai de décision allongé: impact sur planning.',
    trend: 'stable',
    createdAt: '07/01/2026',
  },
];

const kindIcons = {
  system_alert: AlertCircle,
  blocked_dossier: Shield,
  payment_due: Wallet,
  contract_expiry: FileText,
};

const kindLabels = {
  system_alert: 'Alerte système',
  blocked_dossier: 'Blocage',
  payment_due: 'Paiement',
  contract_expiry: 'Contrat',
};

export function RisksView() {
  const { navigation, openModal } = useDashboardCommandCenterStore();
  const [snoozedRisks, setSnoozedRisks] = useState<Set<string>>(new Set());

  const { data: risksData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getRisks({ limit: 50 }), []);
  const baseRisks: RiskItem[] = useMemo(() => {
    const api = (risksData as any)?.risks;
    if (!Array.isArray(api) || api.length === 0) return mockRisks;
    return api.map((r: any) => ({
      id: String(r.id),
      kind: (r.kind as any) || 'system_alert',
      severity: (r.severity as any) || 'warning',
      score: Number(r.score ?? 0),
      title: String(r.title ?? ''),
      detail: String(r.detail ?? ''),
      source: String(r.source ?? ''),
      explain: String(r.explain ?? ''),
      trend: (r.trend as any) || 'stable',
      createdAt: String(r.createdAt ?? ''),
    }));
  }, [risksData]);

  // Filtrer selon le sous-onglet
  const filteredRisks = useMemo(() => {
    let risks = baseRisks.filter((r) => !snoozedRisks.has(r.id));

    switch (navigation.subCategory) {
      case 'critical':
        risks = risks.filter((r) => r.severity === 'critical');
        break;
      case 'warnings':
        risks = risks.filter((r) => r.severity === 'warning');
        break;
      case 'blocages':
        risks = risks.filter((r) => r.kind === 'blocked_dossier');
        break;
      case 'payments':
        risks = risks.filter((r) => r.kind === 'payment_due');
        break;
      case 'contracts':
        risks = risks.filter((r) => r.kind === 'contract_expiry');
        break;
    }

    return risks.sort((a, b) => b.score - a.score);
  }, [baseRisks, navigation.subCategory, snoozedRisks]);

  const snoozeRisk = (id: string) => {
    setSnoozedRisks((prev) => new Set(prev).add(id));
  };

  // Statistiques
  const stats = useMemo(() => {
    const total = baseRisks.length || 1;
    return {
      critical: baseRisks.filter((r) => r.severity === 'critical').length,
      warning: baseRisks.filter((r) => r.severity === 'warning').length,
      avgScore: Math.round(baseRisks.reduce((acc, r) => acc + r.score, 0) / total),
      trending: baseRisks.filter((r) => r.trend === 'up').length,
    };
  }, [baseRisks]);

  return (
    <div className="p-6 space-y-6 max-w-[1800px] mx-auto">
      {/* Header avec stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-200">Risk Radar</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Surveillance et gestion des risques en temps réel
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium text-slate-200">{stats.critical} critiques</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-200">{stats.warning} warnings</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <span className="text-sm text-slate-400">Score moyen:</span>
            <span className="text-sm font-bold text-slate-200">{stats.avgScore}</span>
          </div>
        </div>
      </div>

      {/* Liste des risques */}
      <div className="space-y-3">
        {filteredRisks.map((risk) => {
          const Icon = kindIcons[risk.kind];

          return (
            <div
              key={risk.id}
              className={cn(
                'p-4 rounded-xl border-l-4 transition-all',
                'border-l-slate-600 bg-slate-800/30 hover:bg-slate-800/50'
              )}
            >
              <div className="flex items-start gap-4">
                {/* Icône */}
                <div
                  className={cn(
                    'p-2 rounded-lg flex-shrink-0 border border-slate-700/50 bg-slate-800/50'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      risk.severity === 'critical'
                        ? 'text-rose-400'
                        : risk.severity === 'warning'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                    )}
                  />
                </div>

                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">{risk.id}</span>
                    <Badge
                      variant={
                        risk.severity === 'critical'
                          ? 'destructive'
                          : risk.severity === 'warning'
                          ? 'warning'
                          : 'default'
                      }
                      className="text-xs"
                    >
                      {kindLabels[risk.kind]}
                    </Badge>
                    <Badge variant="default" className="text-xs border-slate-700 text-slate-400">
                      {risk.source}
                    </Badge>
                    {risk.trend === 'up' && (
                      <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    {risk.trend === 'down' && (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-200">{risk.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{risk.detail}</p>
                  <p className="text-xs text-slate-500 italic mt-2">{risk.explain}</p>
                </div>

                {/* Score */}
                <div className="text-center flex-shrink-0">
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      risk.severity === 'critical'
                        ? 'text-rose-400'
                        : risk.severity === 'warning'
                        ? 'text-amber-400'
                        : 'text-blue-400'
                    )}
                  >
                    {risk.score}
                  </p>
                  <p className="text-xs text-slate-600">score</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openModal('risk-detail', { risk })}
                    className="text-slate-400 hover:text-slate-200"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => snoozeRisk(risk.id)}
                    className="text-slate-400 hover:text-slate-200"
                    title="Masquer 2h"
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredRisks.length === 0 && (
        <div className="text-center py-12 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-200 font-medium">Aucun risque détecté</p>
          <p className="text-sm text-slate-500 mt-1">
            Tout est sous contrôle dans cette catégorie
          </p>
        </div>
      )}

      {/* Risques masqués */}
      {snoozedRisks.size > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-400">
              {snoozedRisks.size} risque(s) masqué(s) pour 2h
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSnoozedRisks(new Set())}
            className="text-slate-400 hover:text-slate-200"
          >
            <Eye className="w-4 h-4 mr-1" />
            Afficher tout
          </Button>
        </div>
      )}
    </div>
  );
}

