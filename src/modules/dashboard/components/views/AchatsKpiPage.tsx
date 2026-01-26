/**
 * Page KPIs Achats/Contrats (Phase P5)
 * Vue détaillée des indicateurs de performance des achats et contrats
 */

'use client';

import React, { useCallback, memo, useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  DollarSign,
  FileText,
  Package,
  Building2,
  Activity,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  Truck,
  Users,
  MapPin,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { SearchFilter } from '../shared/SearchFilter';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { VirtualizedList } from '@/components/shared/VirtualizedList';
import { parseTrendPercent, normalizeKPIColor } from '@lib-root/dashboard/kpi';
import {
  formatKPICurrency,
  formatKPIPercentage,
  formatKPIValue,
} from '../../utils/kpi';
import {
  DashboardPageLayout,
  DashboardSection,
  DashboardGrid,
  DashboardPanel,
  KPICard,
  type KPICardData,
  MockDataIndicator,
} from '../shared';

interface AchatsKPI {
  id: string;
  label: string;
  value: string | number;
  trend?: string | number;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'cyan';
  description?: string;
}

interface Fournisseur {
  id: string;
  code: string;
  nom: string;
  nbBl: number;
  otifRatio: number;
  priceVarRatio: number;
}

interface CommandeOuverte {
  id: string;
  ref: string;
  dateEmission: string;
  delaiJours: number;
  fournisseurCode: string;
  fournisseurNom: string;
  bureauCode?: string;
  chantierCode?: string;
  qteCommande: number;
  qteRecue: number;
  qteRestante: number;
  montantHtCommande: number;
}

interface AchatsKpiPageProps {
  data?: import('../../types/dashboard.readmodels').KpisAchatsData;
}

export const AchatsKpiPage = memo(function AchatsKpiPage({ data: apiData }: AchatsKpiPageProps = {}) {
  const openModal = useDashboardCommandCenterStore((state) => state.openModal);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFournisseur, setFilterFournisseur] = useState<string | null>(null);

  const handleKPIClick = useCallback((kpi: AchatsKPI) => {
    openModal('kpi-drilldown', {
      kpi: {
        label: kpi.label,
        value: kpi.value,
        trend: kpi.trend ? parseTrendPercent(String(kpi.trend)) : undefined,
        trendType: kpi.trendDirection,
        tone: kpi.color === 'emerald' ? 'ok' : kpi.color === 'amber' || kpi.color === 'red' ? 'warn' : 'info',
        icon: kpi.icon,
      },
    });
  }, [openModal]);

  // Données avec fallback mock si API non disponible
  const achatsData = useMemo(() => {
    if (apiData) {
      return {
        leadTimeJours: apiData.leadTimeJours ?? 0,
        conformiteRatio: apiData.conformiteRatio ?? 0,
        priceVarianceRatio: apiData.priceVarianceRatio ?? 0,
        spend30dHt: apiData.spend30dHt ?? 0,
        trends: apiData.trends ?? [],
        topFournisseurs: apiData.topFournisseurs ?? [],
        commandesOuvertes: apiData.commandesOuvertes ?? [],
      };
    }

    // Fallback mock
    return {
      leadTimeJours: 7.5,
      conformiteRatio: 0.92,
      priceVarianceRatio: 0.03,
      spend30dHt: 1250000,
      trends: [],
      topFournisseurs: [
        {
          id: 'F001',
          code: 'FOUR-001',
          nom: 'Fournisseur Principal',
          nbBl: 15,
          otifRatio: 0.95,
          priceVarRatio: 0.02,
        },
        {
          id: 'F002',
          code: 'FOUR-002',
          nom: 'Matériaux SA',
          nbBl: 12,
          otifRatio: 0.88,
          priceVarRatio: 0.05,
        },
      ],
      commandesOuvertes: [
        {
          id: 'BC-001',
          ref: 'BC-2024-001',
          dateEmission: '2024-01-15',
          delaiJours: 11,
          fournisseurCode: 'FOUR-001',
          fournisseurNom: 'Fournisseur Principal',
          bureauCode: 'BMO',
          qteCommande: 100,
          qteRecue: 75,
          qteRestante: 25,
          montantHtCommande: 45000,
        },
      ],
    };
  }, [apiData]);

  // Calculs des KPIs métier Achats/Contrats
  const kpiCalculations = useMemo(() => {
    const { leadTimeJours, conformiteRatio, priceVarianceRatio, spend30dHt } = achatsData;

    return {
      leadTimeJours: Math.round(leadTimeJours * 10) / 10,
      conformiteRatio: Math.round(conformiteRatio * 100),
      priceVarianceRatio: Math.round(priceVarianceRatio * 100 * 100) / 100, // En pourcentage avec 2 décimales
      spend30dHt,
    };
  }, [achatsData]);

  // KPIs principaux
  const achatsKPIs: AchatsKPI[] = useMemo(() => [
    {
      id: '1',
      label: 'Lead time moyen',
      value: `${kpiCalculations.leadTimeJours} j`,
      trend: '-0.5 j',
      trendDirection: 'down',
      icon: Clock,
      color: kpiCalculations.leadTimeJours > 10 ? 'amber' : 'emerald',
      description: 'Délai moyen entre émission BC et réception BL (jours)',
    },
    {
      id: '2',
      label: 'Conformité (OTIF)',
      value: formatKPIPercentage(kpiCalculations.conformiteRatio),
      trend: '+2%',
      trendDirection: 'up',
      icon: CheckCircle2,
      color: kpiCalculations.conformiteRatio >= 90 ? 'emerald' : kpiCalculations.conformiteRatio >= 75 ? 'amber' : 'red',
      description: 'Pourcentage de BL reçus en statut "recu" (proxy OTIF)',
    },
    {
      id: '3',
      label: 'Variance prix',
      value: `${kpiCalculations.priceVarianceRatio > 0 ? '+' : ''}${kpiCalculations.priceVarianceRatio.toFixed(2)}%`,
      trend: kpiCalculations.priceVarianceRatio > 0 ? '+0.5%' : '-0.3%',
      trendDirection: kpiCalculations.priceVarianceRatio > 0 ? 'up' : 'down',
      icon: DollarSign,
      color: Math.abs(kpiCalculations.priceVarianceRatio) > 5 ? 'amber' : Math.abs(kpiCalculations.priceVarianceRatio) > 10 ? 'red' : 'emerald',
      description: 'Écart moyen entre prix reçu et prix de référence (30 jours)',
    },
    {
      id: '4',
      label: 'Dépenses 30j',
      value: formatKPICurrency(kpiCalculations.spend30dHt, 'XOF'),
      trend: '+8%',
      trendDirection: 'up',
      icon: DollarSign,
      color: 'blue',
      description: 'Dépenses HT sur les 30 derniers jours',
    },
  ], [kpiCalculations]);

  // Convertir au format KPICardData
  const achatsKPIsData: KPICardData[] = useMemo(() => {
    return achatsKPIs.map((kpi) => ({
      id: kpi.id,
      label: kpi.label,
      value: kpi.value,
      trend: kpi.trend ? parseTrendPercent(String(kpi.trend)) : undefined,
      trendType: kpi.trendDirection,
      icon: kpi.icon,
      color: normalizeKPIColor(kpi.color),
      description: kpi.description,
      onClick: () => handleKPIClick(kpi),
    }));
  }, [achatsKPIs, handleKPIClick]);

  // Filtrer les commandes ouvertes
  const filteredCommandes = useMemo(() => {
    let filtered = achatsData.commandesOuvertes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((cmd) =>
        cmd.ref.toLowerCase().includes(query) ||
        cmd.fournisseurNom.toLowerCase().includes(query) ||
        cmd.bureauCode?.toLowerCase().includes(query) ||
        cmd.chantierCode?.toLowerCase().includes(query)
      );
    }

    if (filterFournisseur) {
      filtered = filtered.filter((cmd) => cmd.fournisseurCode === filterFournisseur);
    }

    return filtered.sort((a, b) => b.delaiJours - a.delaiJours);
  }, [achatsData.commandesOuvertes, searchQuery, filterFournisseur]);

  // Filtrer les fournisseurs
  const filteredFournisseurs = useMemo(() => {
    let filtered = achatsData.topFournisseurs;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((f) =>
        f.nom.toLowerCase().includes(query) ||
        f.code.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => b.otifRatio - a.otifRatio);
  }, [achatsData.topFournisseurs, searchQuery]);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    const csvContent = [
      ['Référence', 'Fournisseur', 'Qte commandée', 'Qte reçue', 'Qte restante', 'Montant HT', 'Date émission', 'Délai (j)', 'Bureau', 'Chantier'].join(','),
      ...filteredCommandes.map((cmd) =>
        [
          cmd.ref,
          cmd.fournisseurNom,
          cmd.qteCommande,
          cmd.qteRecue,
          cmd.qteRestante,
          cmd.montantHtCommande,
          cmd.dateEmission,
          cmd.delaiJours,
          cmd.bureauCode || '',
          cmd.chantierCode || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commandes-ouvertes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredCommandes]);

  // Export JSON
  const handleExportJSON = useCallback(() => {
    const data = filteredCommandes.map((cmd) => ({
      ref: cmd.ref,
      fournisseur: cmd.fournisseurNom,
      qteCommande: cmd.qteCommande,
      qteRecue: cmd.qteRecue,
      qteRestante: cmd.qteRestante,
      montantHtCommande: cmd.montantHtCommande,
      dateEmission: cmd.dateEmission,
      delaiJours: cmd.delaiJours,
      bureau: cmd.bureauCode,
      chantier: cmd.chantierCode,
    }));
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `commandes-ouvertes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredCommandes]);

  // Rendu d'une carte commande
  const renderCommandeCard = useCallback((cmd: CommandeOuverte) => {
    const isRetard = cmd.delaiJours > 7;
    const isCritique = cmd.delaiJours > 14;
    const progressRatio = cmd.qteCommande > 0 ? (cmd.qteRecue / cmd.qteCommande) * 100 : 0;

    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <h4 className="font-semibold text-white text-sm truncate">{cmd.ref}</h4>
              {isCritique && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  Critique
                </span>
              )}
              {isRetard && !isCritique && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Retard
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate">{cmd.fournisseurNom}</p>
          </div>
          <div className="text-right flex-shrink-0 ml-4">
            <p className="font-semibold text-white text-sm">{formatKPICurrency(cmd.montantHtCommande, 'XOF')}</p>
            <p className="text-xs text-slate-400">{cmd.delaiJours} j</p>
          </div>
        </div>

        {/* Progression quantités */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Quantités</span>
            <span className="text-slate-300 font-medium">
              {cmd.qteRecue} / {cmd.qteCommande} ({progressRatio.toFixed(0)}%)
            </span>
          </div>
          <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                progressRatio >= 100 ? 'bg-emerald-500' : progressRatio >= 50 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${Math.min(progressRatio, 100)}%` }}
            />
          </div>
          {cmd.qteRestante > 0 && (
            <p className="text-xs text-slate-400">
              Restant : <span className="font-semibold text-slate-300">{cmd.qteRestante}</span>
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400">
          {cmd.bureauCode && (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {cmd.bureauCode}
            </span>
          )}
          {cmd.chantierCode && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {cmd.chantierCode}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(cmd.dateEmission).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </div>
    );
  }, []);

  // Rendu d'une carte fournisseur
  const renderFournisseurCard = useCallback((fournisseur: Fournisseur) => {
    return (
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <h4 className="font-semibold text-white text-sm truncate">{fournisseur.nom}</h4>
            </div>
            <p className="text-xs text-slate-400 truncate">{fournisseur.code}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-400 mb-1">BL reçus</p>
            <p className="font-semibold text-white">{fournisseur.nbBl}</p>
          </div>
          <div>
            <p className="text-slate-400 mb-1">OTIF</p>
            <p className={cn(
              'font-semibold',
              fournisseur.otifRatio >= 0.9 ? 'text-emerald-400' : fournisseur.otifRatio >= 0.75 ? 'text-amber-400' : 'text-red-400'
            )}>
              {formatKPIPercentage(fournisseur.otifRatio * 100)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Variance prix</span>
          <span className={cn(
            'font-semibold',
            Math.abs(fournisseur.priceVarRatio) > 0.1 ? 'text-amber-400' : Math.abs(fournisseur.priceVarRatio) > 0.05 ? 'text-amber-300' : 'text-emerald-400'
          )}>
            {fournisseur.priceVarRatio > 0 ? '+' : ''}{(fournisseur.priceVarRatio * 100).toFixed(2)}%
          </span>
        </div>
      </div>
    );
  }, []);

  return (
    <div className="relative">
      <MockDataIndicator message="Données mockées - Phase P5 (Backend en attente)" />
      <TooltipProvider delayDuration={200}>
        <DashboardPageLayout maxWidth="xl" padding="md">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl">
                KPIs Achats & Contrats
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Suivi des achats : Lead time, conformité OTIF, variance prix, dépenses et commandes ouvertes
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-full sm:w-[360px]">
                <SearchFilter
                  placeholder="Rechercher une commande ou un fournisseur..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  totalCount={achatsData.commandesOuvertes.length + achatsData.topFournisseurs.length}
                  resultsCount={filteredCommandes.length + filteredFournisseurs.length}
                />
              </div>
              <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} label="Exporter" />
            </div>
          </div>

          {/* KPIs principaux */}
          <DashboardSection
            title="Indicateurs clés"
            icon={Activity}
          >
            <DashboardGrid columns={3} gap="md">
              {achatsKPIsData.map((kpi) => (
                <KPICard key={kpi.id} kpi={kpi} size="md" />
              ))}
            </DashboardGrid>
          </DashboardSection>

          {/* Commandes ouvertes */}
          <DashboardSection
            title="Commandes ouvertes"
            icon={ShoppingCart}
            action={
              <span className="text-slate-300 text-sm">
                {filteredCommandes.length} commande{filteredCommandes.length > 1 ? 's' : ''} en attente
              </span>
            }
          >
            {filteredCommandes.length === 0 ? (
              <EmptyState
                variant="search"
                title={searchQuery ? "Aucune commande trouvée" : "Aucune commande ouverte"}
                description={searchQuery ? `Aucune commande ne correspond à "${searchQuery}"` : "Toutes les commandes ont été réceptionnées"}
              />
            ) : (
              filteredCommandes.length > 30 ? (
                <VirtualizedList
                  items={filteredCommandes}
                  renderItem={(cmd) => (
                    <DashboardPanel
                      key={cmd.id}
                      padding="md"
                      className={cn(
                        'hover:bg-slate-900/45 hover:border-slate-700/60 transition-colors',
                        cmd.delaiJours > 14 && 'ring-1 ring-red-500/20',
                        cmd.delaiJours > 7 && cmd.delaiJours <= 14 && 'ring-1 ring-amber-500/15'
                      )}
                    >
                      {renderCommandeCard(cmd)}
                    </DashboardPanel>
                  )}
                  estimateSize={120}
                  overscan={5}
                  containerHeight="600px"
                />
              ) : (
                <div className="space-y-3">
                  {filteredCommandes.map((cmd) => (
                    <DashboardPanel
                      key={cmd.id}
                      padding="md"
                      className={cn(
                        'hover:bg-slate-900/45 hover:border-slate-700/60 transition-colors',
                        cmd.delaiJours > 14 && 'ring-1 ring-red-500/20',
                        cmd.delaiJours > 7 && cmd.delaiJours <= 14 && 'ring-1 ring-amber-500/15'
                      )}
                    >
                      {renderCommandeCard(cmd)}
                    </DashboardPanel>
                  ))}
                </div>
              )
            )}
          </DashboardSection>

          {/* Top fournisseurs */}
          <DashboardSection
            title="Top fournisseurs"
            icon={Users}
            action={
              <span className="text-slate-300 text-sm">
                {filteredFournisseurs.length} fournisseur{filteredFournisseurs.length > 1 ? 's' : ''}
              </span>
            }
          >
            {filteredFournisseurs.length === 0 ? (
              <EmptyState
                variant="search"
                title="Aucun fournisseur trouvé"
                description={searchQuery ? `Aucun fournisseur ne correspond à "${searchQuery}"` : "Aucun fournisseur disponible"}
              />
            ) : (
              <DashboardGrid columns={3} gap="md">
                {filteredFournisseurs.map((fournisseur) => (
                  <DashboardPanel key={fournisseur.id} padding="md">
                    {renderFournisseurCard(fournisseur)}
                  </DashboardPanel>
                ))}
              </DashboardGrid>
            )}
          </DashboardSection>
        </DashboardPageLayout>
      </TooltipProvider>
    </div>
  );
});

export default AchatsKpiPage;
