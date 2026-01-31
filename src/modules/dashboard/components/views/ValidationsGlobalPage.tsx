/**
 * Page Validations — Vue globale
 * VERSION OPTIMISÉE - KPIs, statistiques et suivi des validations
 * Affiche les indicateurs de performance des validations (BC, factures, avenants)
 */

'use client';

import React, { memo, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
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
  ExternalLink,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataCard } from '@/components/features/bmo/dashboard/components';
import { EnterpriseBadge } from '../shared/EnterpriseBadge';
import { mapColorToTone } from '../../utils/colorMapping';
import { 
  parseTrendPercent, 
  normalizeKPIColor, 
  formatMoneyCompact, 
  formatKPIValue, 
  formatKPIPercentage 
} from '@lib-root/dashboard/kpi';
import { getAppForCategory } from '../../domain';
import { VALIDATION_STATE_LABELS } from '@/domain/gouvernance/workflows';
import { 
  DashboardPageLayout, 
  DashboardSection, 
  DashboardGrid, 
  DashboardPanel,
  KPICard,
  type KPICardData,
  MockDataIndicator,
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
  const appMeta = useMemo(() => getAppForCategory('performance'), []);

  // Statistiques par bureau (déclaré avant kpiCalculations qui en dépend)
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

  // Calculs des KPIs métier BTP (Opérations/Conduite de travaux)
  const kpiCalculations = useMemo(() => {
    // Cycle visa moyen (délai moyen BC/avenants/factures)
    const cycleVisaMoyen = bureauStats.reduce((sum, b) => sum + b.tempsMoyen, 0) / bureauStats.length;
    
    // Blocages actifs par bureau
    const blocagesParBureau = bureauStats.map(b => ({
      bureau: b.code,
      blocages: b.enAttente, // Estimation: en attente = blocages
    }));
    const totalBlocages = blocagesParBureau.reduce((sum, b) => sum + b.blocages, 0);
    
    // Taux de situations validées (mois en cours)
    const totalValidations = bureauStats.reduce((sum, b) => sum + b.validees + b.enAttente + b.rejetees, 0);
    const totalValidees = bureauStats.reduce((sum, b) => sum + b.validees, 0);
    const tauxSituationsValidees = totalValidations > 0 ? (totalValidees / totalValidations) * 100 : 0;
    
    return {
      cycleVisaMoyen,
      blocagesParBureau,
      totalBlocages,
      tauxSituationsValidees,
    };
  }, [bureauStats]);

  // KPIs principaux (enrichis avec KPIs métier BTP Opérations)
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
      id: 'taux_situations_validees',
      label: 'Taux situations validées',
      value: formatKPIPercentage(kpiCalculations.tauxSituationsValidees),
      trend: '+2%',
      trendType: 'up',
      icon: CheckCircle,
      color: 'emerald',
      description: 'Mois en cours',
    },
    {
      id: 'cycle_visa',
      label: 'Cycle visa moyen',
      value: formatKPIValue(kpiCalculations.cycleVisaMoyen, 'h', 1),
      trend: '-0.3h',
      trendType: 'down',
      icon: Clock,
      color: kpiCalculations.cycleVisaMoyen < 3 ? 'emerald' : kpiCalculations.cycleVisaMoyen < 5 ? 'amber' : 'red',
      description: 'Délai moyen BC/avenants/factures',
    },
    {
      id: 'blocages_actifs',
      label: 'Blocages actifs',
      value: kpiCalculations.totalBlocages.toString(),
      trend: '-5',
      trendType: 'down',
      icon: AlertTriangle,
      color: kpiCalculations.totalBlocages < 10 ? 'emerald' : kpiCalculations.totalBlocages < 20 ? 'amber' : 'red',
      description: `Par bureau: ${kpiCalculations.blocagesParBureau.map(b => `${b.bureau}:${b.blocages}`).join(', ')}`,
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
      id: 'sla_compliance',
      label: 'Conformité SLA',
      value: '94%',
      trend: '+2%',
      trendType: 'up',
      icon: Shield,
      color: 'purple',
      description: 'Respect des délais',
    },
  ], [kpiCalculations]);

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

  // Utilise formatMoneyCompact centralisé depuis @/lib/dashboard/kpi

  // Convertir kpis au format KPICardData
  const kpisData: KPICardData[] = useMemo(() => {
    return kpis.map((k) => ({
      id: k.id,
      label: k.label,
      value: k.value,
      trend: parseTrendPercent(k.trend),
      trendType: k.trendType,
      icon: k.icon,
      color: normalizeKPIColor(k.color),
      description: k.description,
      onClick: k.onClick,
    }));
  }, [kpis]);

  // Charge consolidée par bureau (pour Achats/Bureau des Marchés)
  const chargeConsolidee = useMemo(() => {
    return bureauStats.map(bureau => ({
      ...bureau,
      chargeTotale: bureau.enAttente + bureau.validees + bureau.rejetees,
      chargeEnAttente: bureau.enAttente,
      chargeValidees: bureau.validees,
      chargeRejetees: bureau.rejetees,
      delaiMoyenJours: bureau.tempsMoyen * 24, // Conversion heures -> jours
      conformite: bureau.slaCompliance,
    }));
  }, [bureauStats]);

  const chargeTotale = useMemo(() => {
    return chargeConsolidee.reduce((sum, b) => sum + b.chargeTotale, 0);
  }, [chargeConsolidee]);

  return (
    <div className="relative min-w-0 max-w-full overflow-x-hidden">
      <MockDataIndicator message="Données mockées - Phase 1 (Backend en attente)" />
      {/* Redistribution : accès aux modules dédiés Validation BC / Contrats */}
      <div className="mb-4 rounded-xl border border-slate-800/70 bg-slate-900/40 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-slate-400">Accès modules :</span>
        <Link
          href="/maitre-ouvrage/validation-bc"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/60 hover:text-slate-100 transition-colors"
        >
          <FileCheck className="h-3.5 w-3.5" />
          Validation BC / Factures
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </Link>
        <Link
          href="/maitre-ouvrage/validation-contrats"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-950/50 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800/60 hover:text-slate-100 transition-colors"
        >
          <Building2 className="h-3.5 w-3.5" />
          Validation contrats
          <ExternalLink className="h-3 w-3 text-slate-400" />
        </Link>
      </div>
      <DashboardPageLayout maxWidth="xl" padding="md">
        {/* Logique métier (Odoo-style) : App → Modèle → Workflow */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800/60 bg-slate-900/40 px-2 py-1">
            <span className="font-medium text-slate-400">App</span>
            <span>{appMeta.name}</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800/60 bg-slate-900/40 px-2 py-1">
            <span className="font-medium text-slate-400">Modèle</span>
            <span>Validation</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800/60 bg-slate-900/40 px-2 py-1">
            <span className="font-medium text-slate-400">Workflow</span>
            <span>pending → approved | rejected | cancelled</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800/60 bg-slate-900/40 px-2 py-1">
            <span className="font-medium text-slate-400">Libellés (domaine)</span>
            <span>{Object.values(VALIDATION_STATE_LABELS).join(', ')}</span>
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl">
            Validations — Vue globale
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Performance & KPIs (règles domaine: gouvernance/validation) — suivi BC, factures et avenants
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
                  {v.bureau} · {formatMoneyCompact(v.montant)} · {v.dateCreation}
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

      {/* Charge consolidée (Achats / Bureau des Marchés) */}
      <DashboardSection>
        <DashboardPanel 
          title="Charge consolidée par bureau" 
          description="Délais, conformité, volumétrie — Vue Achats/Bureau des Marchés"
          className="bg-slate-900/40"
        >
          <div className="mb-4 p-3 rounded-lg bg-slate-950/35 border border-slate-800/60">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-400">Charge totale</div>
                <div className="text-2xl font-bold text-white">{chargeTotale} validations</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400">Délai moyen</div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatKPIValue(chargeConsolidee.reduce((sum, b) => sum + b.delaiMoyenJours, 0) / chargeConsolidee.length, 'j', 1)}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {chargeConsolidee.map((bureau) => (
              <div
                key={bureau.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-800/60 bg-slate-950/35 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-200">{bureau.bureau}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {bureau.chargeTotale} validations • {bureau.chargeEnAttente} en attente
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-200">
                      {formatKPIValue(bureau.delaiMoyenJours, 'j', 1)}
                    </div>
                    <div className="text-xs text-slate-400">Délai moyen</div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      'text-sm font-semibold',
                      bureau.conformite >= 95 ? 'text-emerald-400' : bureau.conformite >= 90 ? 'text-amber-400' : 'text-rose-400'
                    )}>
                      {bureau.conformite}%
                    </div>
                    <div className="text-xs text-slate-400">Conformité SLA</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-200">
                      {bureau.chargeValidees}
                    </div>
                    <div className="text-xs text-slate-400">Validées</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DashboardPanel>
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
    </div>
  );
});

export default ValidationsGlobalPage;
