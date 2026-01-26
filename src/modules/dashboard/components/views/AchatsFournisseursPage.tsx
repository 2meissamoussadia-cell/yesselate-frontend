/**
 * Page Fournisseurs Achats/Contrats (Phase P5)
 * Liste des fournisseurs avec KPIs (OTIF, variance prix)
 */

'use client';

import React, { useMemo, memo, useState, useCallback } from 'react';
import { Building2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SearchFilter } from '../shared/SearchFilter';
import { EmptyState } from '../shared/EmptyState';
import { ExportButton } from '../shared/ExportButton';
import {
  formatKPIPercentage,
} from '../../utils/kpi';
import {
  DashboardPageLayout,
  DashboardSection,
  DashboardGrid,
  DashboardPanel,
  MockDataIndicator,
} from '../shared';
import type { KpisAchatsData } from '../../types/dashboard.readmodels';

interface Fournisseur {
  id: string;
  code: string;
  nom: string;
  nbBl: number;
  otifRatio: number;
  priceVarRatio: number;
}

interface AchatsFournisseursPageProps {
  data?: KpisAchatsData;
}

export const AchatsFournisseursPage = memo(function AchatsFournisseursPage({ data: apiData }: AchatsFournisseursPageProps = {}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Données avec fallback mock si API non disponible
  const fournisseursData = useMemo(() => {
    if (apiData?.topFournisseurs) {
      return apiData.topFournisseurs;
    }

    // Fallback mock
    return [
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
      {
        id: 'F003',
        code: 'FOUR-003',
        nom: 'Équipements BTP',
        nbBl: 8,
        otifRatio: 0.90,
        priceVarRatio: -0.01,
      },
    ];
  }, [apiData]);

  // Filtrer les fournisseurs
  const filteredFournisseurs = useMemo(() => {
    let filtered = fournisseursData;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((f) =>
        f.nom.toLowerCase().includes(query) ||
        f.code.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => b.otifRatio - a.otifRatio);
  }, [fournisseursData, searchQuery]);

  // Export CSV
  const handleExportCSV = useCallback(() => {
    const csvContent = [
      ['Code', 'Nom', 'BL reçus', 'OTIF', 'Variance prix'].join(','),
      ...filteredFournisseurs.map((f) =>
        [
          f.code,
          f.nom,
          f.nbBl,
          (f.otifRatio * 100).toFixed(2) + '%',
          (f.priceVarRatio * 100).toFixed(2) + '%',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fournisseurs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredFournisseurs]);

  // Export JSON
  const handleExportJSON = useCallback(() => {
    const data = filteredFournisseurs.map((f) => ({
      code: f.code,
      nom: f.nom,
      nbBl: f.nbBl,
      otifRatio: f.otifRatio,
      priceVarRatio: f.priceVarRatio,
    }));
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fournisseurs-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredFournisseurs]);

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
                Fournisseurs
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Liste des fournisseurs avec indicateurs de performance (OTIF, variance prix)
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-full sm:w-[360px]">
                <SearchFilter
                  placeholder="Rechercher un fournisseur..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                  totalCount={fournisseursData.length}
                  resultsCount={filteredFournisseurs.length}
                />
              </div>
              <ExportButton onExportCSV={handleExportCSV} onExportJSON={handleExportJSON} label="Exporter" />
            </div>
          </div>

          {/* Liste des fournisseurs */}
          <DashboardSection
            title="Fournisseurs"
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

export default AchatsFournisseursPage;
