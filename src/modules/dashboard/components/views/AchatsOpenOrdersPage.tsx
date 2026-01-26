/**
 * Page Commandes Ouvertes Achats/Contrats (Phase P5)
 * Liste des commandes ouvertes (BC non soldés) avec quantités
 */

'use client';

import React, { useMemo, memo, useState, useCallback } from 'react';
import { ShoppingCart, FileText, Clock, Building2, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { SearchFilter } from '../shared/SearchFilter';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import { VirtualizedList } from '@/components/shared/VirtualizedList';
import {
  formatKPICurrency,
} from '../../utils/kpi';
import {
  DashboardPageLayout,
  DashboardSection,
  DashboardPanel,
  MockDataIndicator,
} from '../shared';
import type { KpisAchatsData } from '../../types/dashboard.readmodels';

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

interface AchatsOpenOrdersPageProps {
  data?: KpisAchatsData;
}

export const AchatsOpenOrdersPage = memo(function AchatsOpenOrdersPage({ data: apiData }: AchatsOpenOrdersPageProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFournisseur, setFilterFournisseur] = useState<string | null>(null);

  // Données avec fallback mock si API non disponible
  const commandesData = useMemo(() => {
    if (apiData?.commandesOuvertes) {
      return apiData.commandesOuvertes;
    }

    // Fallback mock
    return [
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
      {
        id: 'BC-002',
        ref: 'BC-2024-002',
        dateEmission: '2024-01-18',
        delaiJours: 8,
        fournisseurCode: 'FOUR-002',
        fournisseurNom: 'Matériaux SA',
        bureauCode: 'BF',
        qteCommande: 50,
        qteRecue: 30,
        qteRestante: 20,
        montantHtCommande: 28000,
      },
    ];
  }, [apiData]);

  // Filtrer les commandes ouvertes
  const filteredCommandes = useMemo(() => {
    let filtered = commandesData;

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
  }, [commandesData, searchQuery, filterFournisseur]);

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

  return (
    <div className="relative">
      <MockDataIndicator message="Données mockées - Phase P5 (Backend en attente)" />
      <TooltipProvider delayDuration={200}>
        <DashboardPageLayout maxWidth="xl" padding="md">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-slate-50 font-semibold text-xl sm:text-2xl">
                Commandes ouvertes
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Liste des bons de commande en attente de réception complète
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-full sm:w-[360px]">
                <SearchFilter
                  placeholder="Rechercher une commande..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  totalCount={commandesData.length}
                  resultsCount={filteredCommandes.length}
                />
              </div>
              <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} label="Exporter" />
            </div>
          </div>

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
        </DashboardPageLayout>
      </TooltipProvider>
    </div>
  );
});

export default AchatsOpenOrdersPage;
