/**
 * Vue Risques du Dashboard
 * Risk Radar - Surveillance et gestion des risques
 */

'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
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
import { SectionTitle, RiskScoreCard, DataCard } from '@/components/features/bmo/dashboard/components';
import type { RiskScoreCardData } from '@/components/features/bmo/dashboard/components';

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
  const openModal = useDashboardCommandCenterStore((s) => s.openModal);
  const subCategory = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const subSubCategory = useDashboardCommandCenterStore((s) => s.navigation.subSubCategory);
  const navigation = { subCategory, subSubCategory } as const;
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

  // Filtrer selon le sous-onglet (Version 4)
  const filteredRisks = useMemo(() => {
    let risks = baseRisks.filter((r) => !snoozedRisks.has(r.id));

    switch (navigation.subCategory) {
      case 'critical': // Critiques
        risks = risks.filter((r) => r.severity === 'critical');
        break;
      case 'warnings': // Avertissements
        risks = risks.filter((r) => r.severity === 'warning');
        break;
      case 'type': // Par type (Version 4)
        switch (navigation.subSubCategory) {
          case 'paiements-retard':
            risks = risks.filter((r) => r.kind === 'payment_due');
            break;
          case 'contrats-expires':
            risks = risks.filter((r) => r.kind === 'contract_expiry');
            break;
          case 'blocages':
            risks = risks.filter((r) => r.kind === 'blocked_dossier');
            break;
          case 'alertes-systeme':
            risks = risks.filter((r) => r.kind === 'system_alert');
            break;
        }
        break;
      case 'analyse': // Analyse (Version 4)
        // Pour l'analyse, on garde tous les risques pour l'analyse
        break;
      case 'actions-correctives': // Actions correctives (Version 4)
        // Filtrer les risques avec actions correctives
        break;
      case 'blocages': // Legacy
        risks = risks.filter((r) => r.kind === 'blocked_dossier');
        break;
      case 'payments': // Legacy
        risks = risks.filter((r) => r.kind === 'payment_due');
        break;
      case 'contracts': // Legacy
        risks = risks.filter((r) => r.kind === 'contract_expiry');
        break;
    }

    return risks.sort((a, b) => b.score - a.score);
  }, [baseRisks, navigation.subCategory, navigation.subSubCategory, snoozedRisks]);

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

  // Convertir les risques pour RiskScoreCard
  const risksForComponent: RiskScoreCardData[] = useMemo(() => {
    return filteredRisks.map((risk) => ({
      id: risk.id,
      titre: risk.title,
      description: risk.detail,
      score: risk.score,
      impact: (risk.severity === 'critical' ? 'critique' : risk.severity === 'warning' ? 'majeur' : 'moyen') as RiskScoreCardData['impact'],
      probabilite: (risk.score >= 80 ? 'elevee' : risk.score >= 60 ? 'moyenne' : 'faible') as RiskScoreCardData['probabilite'],
      source: risk.source,
    }));
  }, [filteredRisks]);

  return (
    <div className="p-6 space-y-8 max-w-[1920px] mx-auto">
      {/* Header harmonisé - Version 4 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <SectionTitle
          icon={AlertTriangle}
          title={
            navigation.subCategory === 'type' ? 'Risques par type' :
            navigation.subCategory === 'analyse' ? 'Analyse des risques' :
            navigation.subCategory === 'actions-correctives' ? 'Actions correctives' :
            'Risques'
          }
          subtitle={
            navigation.subCategory === 'analyse' ? 'Tendances, causes racines et prévisions' :
            navigation.subCategory === 'actions-correctives' ? 'Suivi des actions correctives' :
            'Surveillance et gestion des risques en temps réel'
          }
          size="lg"
        />

        <div className="flex items-center gap-4">
          <DataCard
            value={stats.critical}
            label="Critiques"
            badgeVariant="critical"
            icon={AlertCircle}
          />
          <DataCard
            value={stats.warning}
            label="Warnings"
            badgeVariant="warning"
            icon={AlertTriangle}
          />
          <DataCard
            value={stats.avgScore}
            label="Score moyen"
            icon={Shield}
          />
        </div>
      </div>

      {/* Liste des risques avec composant réutilisable */}
      {risksForComponent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {risksForComponent.map((risk) => (
            <RiskScoreCard
              key={risk.id}
              risk={risk}
              onClick={() => openModal('risk-detail', { riskId: risk.id })}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <Shield className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-200 font-medium">Aucun risque détecté</p>
          <p className="text-sm text-slate-400 mt-1">
            Tout est sous contrôle dans cette catégorie
          </p>
        </div>
      )}

      {/* Risques masqués */}
      {snoozedRisks.size > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-slate-400" />
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

