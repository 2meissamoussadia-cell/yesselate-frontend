/**
 * Page Validations — Vue globale
 * VERSION OPTIMISÉE - KPIs, statistiques et suivi des validations
 * Affiche les indicateurs de performance des validations (BC, factures, avenants)
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import {
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Users,
  Building2,
  BarChart3,
  Zap,
  Shield,
  Download,
  Search,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataCard } from '@/components/features/bmo/dashboard/components';
import { EnterpriseBadge } from '../shared/EnterpriseBadge';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  DashboardPanel,
  KPICard,
  type KPICardData,
} from '../shared';

interface ValidationKPI {
  id: string;
  label: string;
  value: string;
  trend: string;
  trendType: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'orange' | 'red' | 'emerald' | 'purple' | 'cyan';
  description: string;
  onClick?: () => void;
}

interface BureauValidation {
  id: string;
  bureau: string;
  code: string;
  enAttente: number;
  validees: number;
  rejetees: number;
  tempsMoyen: number; // heures
  slaCompliance: number; // %
  evolution: number; // %
}

interface ValidationRecent {
  id: string;
  reference: string;
  type: 'bc' | 'facture' | 'avenant';
  bureau: string;
  montant: number;
  statut: 'en_attente' | 'validee' | 'rejetee';
  dateCreation: string;
  delai: number; // jours
  priorite: 'critique' | 'haute' | 'normale';
}

export const ValidationsGlobalPage = memo(function ValidationsGlobalPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // KPIs principaux
  const kpis: ValidationKPI[] = useMemo(() => [
    {
      id: 'total',
      label: 'Total validations',
      value: '342',
      trend: '+18',
      trendType: 'up',
      icon: FileCheck,
      color: 'blue',
      description: 'Ce mois (vs mois précédent)',
    },
    {
      id: 'en_attente',
      label: 'En attente',
      value: '28',
      trend: '-5',
      trendType: 'down',
      icon: Clock,
      color: 'amber',
      description: 'En cours de traitement',
    },
    {
      id: 'validees',
      label: 'Validées',
      value: '298',
      trend: '+22',
      trendType: 'up',
      icon: CheckCircle,
      color: 'emerald',
      description: 'Taux de validation: 87%',
    },
    {
      id: 'rejetees',
      label: 'Rejetées',
      value: '16',
      trend: '+1',
      trendType: 'up',
      icon: XCircle,
      color: 'red',
      description: 'Taux de rejet: 5%',
    },
    {
      id: 'temps_moyen',
      label: 'Temps moyen',
      value: '2.4h',
      trend: '-0.3h',
      trendType: 'down',
      icon: Zap,
      color: 'cyan',
      description: 'Traitement moyen',
    },
    {
      id: 'sla_compliance',
      label: 'Conformité SLA',
      value: '94%',
      trend: '+2%',
      trendType: 'up',
      icon: Shield,
      color: 'purple',
      description: 'Respect des délais',
    },
  ], []);

  // Statistiques par bureau
  const bureauStats: BureauValidation[] = useMemo(() => [
    {
      id: 'bmo',
      bureau: 'Bureau Maître d\'Ouvrage',
      code: 'BMO',
      enAttente: 5,
      validees: 45,
      rejetees: 2,
      tempsMoyen: 2.1,
      slaCompliance: 96,
      evolution: 5.2,
    },
    {
      id: 'bf',
      bureau: 'Bureau Financier',
      code: 'BF',
      enAttente: 8,
      validees: 38,
      rejetees: 3,
      tempsMoyen: 1.8,
      slaCompliance: 94,
      evolution: 3.1,
    },
    {
      id: 'bop',
      bureau: 'Bureau Opérationnel',
      code: 'BOP',
      enAttente: 12,
      validees: 52,
      rejetees: 5,
      tempsMoyen: 3.2,
      slaCompliance: 88,
      evolution: -2.5,
    },
    {
      id: 'bex',
      bureau: 'Bureau Exécution',
      code: 'BEX',
      enAttente: 3,
      validees: 28,
      rejetees: 1,
      tempsMoyen: 1.9,
      slaCompliance: 98,
      evolution: 4.8,
    },
  ], []);

  // Validations récentes
  const recentValidations: ValidationRecent[] = useMemo(() => [
    {
      id: 'v1',
      reference: 'BC-2024-001',
      type: 'bc',
      bureau: 'BMO',
      montant: 1250000,
      statut: 'en_attente',
      dateCreation: '2024-01-20',
      delai: 2,
      priorite: 'haute',
    },
    {
      id: 'v2',
      reference: 'FAC-2024-045',
      type: 'facture',
      bureau: 'BF',
      montant: 850000,
      statut: 'validee',
      dateCreation: '2024-01-19',
      delai: -1,
      priorite: 'normale',
    },
    {
      id: 'v3',
      reference: 'AV-2024-012',
      type: 'avenant',
      bureau: 'BOP',
      montant: 320000,
      statut: 'rejetee',
      dateCreation: '2024-01-18',
      delai: -3,
      priorite: 'critique',
    },
  ], []);

  const filteredBureaux = useMemo(() => {
    const s = searchQuery.trim().toLowerCase();
    if (!s) return bureauStats;
    return bureauStats.filter((b) => 
      b.bureau.toLowerCase().includes(s) || 
      b.code.toLowerCase().includes(s)
    );
  }, [searchQuery, bureauStats]);

  const formatMoney = (n: number): string => {
    if (!Number.isFinite(n)) return '—';
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`;
    if (Math.abs(n) >= 1_000) return `${Math.round(n / 1_000)} K`;
    return `${n}`;
  };

  // Helper pour mapper les couleurs de manière sûre
  const mapColorToKPICardColor = useCallback((color: ValidationKPI['color']): KPICardData['color'] => {
    switch (color) {
      case 'orange':
        return 'amber';
      case 'red':
        return 'rose';
      case 'blue':
      case 'emerald':
      case 'purple':
      case 'cyan':
        return color;
      default:
        return 'blue';
    }
  }, []);

  // Convertir kpis au format KPICardData
  const kpisData: KPICardData[] = useMemo(() => {
    return kpis.map((k) => ({
      id: k.id,
      label: k.label,
      value: k.value,
      trend: typeof k.trend === 'string' ? parseFloat(k.trend.replace(/[^\d.-]/g, '')) || 0 : 0,
      trendType: k.trendType,
      icon: k.icon,
      color: mapColorToKPICardColor(k.color),
      description: k.description,
      onClick: k.onClick,
    }));
  }, [kpis, mapColorToKPICardColor]);

  return (
    <DashboardPageLayout maxWidth="xl" padding="md">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl">
            Validations — Vue globale
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Performance & KPIs — suivi des validations BC, factures et avenants
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search 
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" 
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un bureau…"
              className="bg-slate-950/40 border-slate-800/70 pl-9 w-[200px] sm:w-[260px]"
            />
          </div>
          <Button
            variant="outline"
            className="border-slate-800/70 bg-slate-950/30 hover:bg-slate-900/40"
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI GRID */}
      <DashboardSection
        title="Indicateurs clés"
        subtitle="Synthèse instantanée — clique un KPI pour ouvrir le détail"
        icon={FileCheck}
      >
        <DashboardGrid columns={3} gap="md">
          {kpisData.map((k) => (
            <KPICard key={k.id} kpi={k} size="md" />
          ))}
        </DashboardGrid>
      </DashboardSection>

      {/* Statistiques par bureau */}
      <DashboardSection
        title="Performance par bureau"
        subtitle="Statistiques détaillées par bureau métier"
        icon={Building2}
      >
        <div className="space-y-3">
          {filteredBureaux.map((b) => {
            const total = b.enAttente + b.validees + b.rejetees;
            const tauxValidation = total > 0 ? (b.validees / total) * 100 : 0;

            return (
              <DashboardPanel
                key={b.id}
                padding="md"
                className="hover:bg-slate-950/45 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="text-blue-400 h-4 w-4" />
                      <div className="font-semibold text-slate-50 text-sm">
                        {b.code} — {b.bureau}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <div className="text-slate-400 text-xs">En attente</div>
                        <div className="font-semibold text-amber-400 text-sm">{b.enAttente}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Validées</div>
                        <div className="font-semibold text-emerald-400 text-sm">{b.validees}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Temps moyen</div>
                        <div className="font-semibold text-slate-100 text-sm">{b.tempsMoyen}h</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">SLA</div>
                        <div className="font-semibold text-cyan-400 text-sm">{b.slaCompliance}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <EnterpriseBadge
                      variant={tauxValidation >= 85 ? 'success' : tauxValidation >= 70 ? 'haute' : 'critique'}
                      size="sm"
                    >
                      {Math.round(tauxValidation)}%
                    </EnterpriseBadge>
                    <div className={cn(
                      'flex items-center text-xs gap-1',
                      b.evolution >= 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {b.evolution >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {Math.abs(b.evolution)}%
                    </div>
                  </div>
                </div>
              </DashboardPanel>
            );
          })}
        </div>
      </DashboardSection>

      {/* Validations récentes */}
      <DashboardSection
        title="Validations récentes"
        subtitle="Dernières validations traitées"
        icon={FileCheck}
      >
        <div className="space-y-3">
          {recentValidations.map((v) => (
            <DashboardPanel
              key={v.id}
              padding="md"
              className="flex items-center justify-between hover:bg-slate-950/45 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="text-blue-400 h-4 w-4" />
                  <div className="font-semibold text-slate-50 text-sm">{v.reference}</div>
                  <Badge
                    className={cn(
                      'text-xs',
                      v.type === 'bc' && 'bg-blue-500/15 text-blue-300 border border-blue-500/30',
                      v.type === 'facture' && 'bg-purple-500/15 text-purple-300 border border-purple-500/30',
                      v.type === 'avenant' && 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    )}
                  >
                    {v.type === 'bc' ? 'BC' : v.type === 'facture' ? 'Facture' : 'Avenant'}
                  </Badge>
                </div>
                <div className="text-slate-400 text-xs">
                  {v.bureau} · {formatMoney(v.montant)} FCFA · {v.dateCreation}
                </div>
              </div>

              <div className="flex items-center shrink-0 gap-3">
                <EnterpriseBadge
                  variant={v.statut === 'validee' ? 'success' : v.statut === 'rejetee' ? 'critique' : 'haute'}
                  size="sm"
                >
                  {v.statut === 'validee' ? 'Validée' : v.statut === 'rejetee' ? 'Rejetée' : 'En attente'}
                </EnterpriseBadge>
                {v.delai < 0 && (
                  <Badge className="bg-red-500/15 text-red-300 border border-red-500/30 text-xs">
                    Retard: {Math.abs(v.delai)}j
                  </Badge>
                )}
              </div>
            </DashboardPanel>
          ))}
        </div>
      </DashboardSection>

      {/* Contexte / méta */}
      <DashboardGrid columns={3} gap="md">
        <DataCard
          title="Période d'analyse"
          value="Mois en cours"
          label="Filtre"
        />
        <DataCard
          title="Qualité données"
          value="OK"
          label="Contrôles"
          badge="94%"
          badgeVariant="default"
        />
        <DataCard
          title="Dernière mise à jour"
          value="Il y a 5 min"
          label="Horodatage"
          badge="Live"
          badgeVariant="success"
        />
      </DashboardGrid>
    </DashboardPageLayout>
  );
});

export default ValidationsGlobalPage;
