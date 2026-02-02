/**
 * Layout pour le module Centre de Commande – Gouvernance
 * Navigation à 3 niveaux complète
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { GovernanceSidebar } from '@/modules/gouvernance/navigation/GovernanceSidebar';
import { GovernanceSubNavigation } from '@/modules/gouvernance/navigation/GouvernanceSubNavigation';
import { GovernanceContentRouter } from '@/modules/gouvernance/components/GovernanceContentRouter';
import type { GovernanceMainCategory } from '@/modules/gouvernance/types/governanceNavigationTypes';
import { useGouvernanceStats } from '@/modules/gouvernance/hooks/useGouvernanceStats';

export default function GouvernanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<GovernanceMainCategory>('strategic');
  const [activeSubCategory, setActiveSubCategory] = useState<string | undefined>('overview');
  const [activeSubSubCategory, setActiveSubSubCategory] = useState<string | undefined>();

  const { stats } = useGouvernanceStats();

  // Déterminer la catégorie active depuis l'URL
  useEffect(() => {
    if (!pathname) return;

    // Mapping des routes vers les catégories
    if (pathname.includes('/governance/dashboard') || pathname.includes('/governance/tendances')) {
      setActiveCategory('strategic');
      if (pathname.includes('/dashboard')) {
        setActiveSubCategory('overview');
        setActiveSubSubCategory('dashboard');
      } else if (pathname.includes('/tendances')) {
        setActiveSubCategory('tendances');
      }
    } else if (pathname.includes('/governance/synthese')) {
      setActiveCategory('strategic');
      setActiveSubCategory('synthese');
      if (pathname.includes('/projets')) setActiveSubSubCategory('projets');
      else if (pathname.includes('/budget')) setActiveSubSubCategory('budget');
      else if (pathname.includes('/jalons')) setActiveSubSubCategory('jalons');
      else if (pathname.includes('/risques')) setActiveSubSubCategory('risques');
      else if (pathname.includes('/validations')) setActiveSubSubCategory('validations');
    } else if (pathname.includes('/governance/attention')) {
      setActiveCategory('attention');
      if (pathname.includes('/depassements')) setActiveSubCategory('depassements');
      else if (pathname.includes('/retards')) setActiveSubCategory('retards');
      else if (pathname.includes('/ressources')) setActiveSubCategory('ressources');
      else if (pathname.includes('/escalades')) setActiveSubCategory('escalades');
    } else if (pathname.includes('/governance/arbitrages')) {
      setActiveCategory('arbitrages');
      if (pathname.includes('/decisions-validees')) setActiveSubCategory('decisions');
      else if (pathname.includes('/en-attente')) setActiveSubCategory('en-attente');
      else if (pathname.includes('/historique')) setActiveSubCategory('historique');
    } else if (pathname.includes('/governance/instances')) {
      setActiveCategory('instances');
      setActiveSubCategory('reunions');
      if (pathname.includes('/reunions-dg')) setActiveSubSubCategory('dg');
      else if (pathname.includes('/reunions-moa-moe')) setActiveSubSubCategory('moa-moe');
      else if (pathname.includes('/reunions-transverses')) setActiveSubSubCategory('transverses');
    } else if (pathname.includes('/governance/conformite')) {
      setActiveCategory('compliance');
      if (pathname.includes('/indicateurs')) setActiveSubCategory('indicateurs');
      else if (pathname.includes('/audit')) setActiveSubCategory('audit');
      else if (pathname.includes('/engagements')) setActiveSubCategory('engagements');
    }
  }, [pathname]);

  // Navigation handlers
  const handleCategoryChange = useCallback((category: string, subCategory?: string) => {
    setActiveCategory(category as GovernanceMainCategory);
    setActiveSubCategory(subCategory);
    setActiveSubSubCategory(undefined); // Reset level 3
  }, []);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setActiveSubCategory(subCategory);
    setActiveSubSubCategory(undefined); // Reset level 3
  }, []);

  const handleSubSubCategoryChange = useCallback((subSubCategory: string) => {
    setActiveSubSubCategory(subSubCategory);
  }, []);

  // Stats pour les badges
  const statsForBadges = {
    strategic: stats?.projets_actifs || 0,
    attention: (stats?.risques_critiques || 0) + (stats?.validations_en_attente || 0),
    arbitrages: stats?.decisions_en_attente || 0,
    instances: 0,
    compliance: stats?.taux_conformite ? 100 - stats.taux_conformite : 0,
  };

  return (
    <div
      className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden bg-slate-950/30"
      role="region"
      aria-label="Gouvernance"
    >
      <div className="flex flex-1 min-h-0 min-w-0 overflow-hidden">
        {/* Sidebar - même style que dashboard (PortalModuleCleanLayout) */}
        <GovernanceSidebar
          activeCategory={activeCategory}
          activeSubCategory={activeSubCategory}
          collapsed={sidebarCollapsed}
          stats={statsForBadges}
          onCategoryChange={handleCategoryChange}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          onOpenCommandPalette={() => {
            // TODO: Implement command palette
          }}
        />

        {/* Zone principale — même structure que dashboard */}
        <div className="flex flex-1 min-h-0 min-w-0 flex-col overflow-hidden">
          {/* Sub Navigation - Levels 2 & 3 (barre type dashboard) */}
          <GovernanceSubNavigation
            mainCategory={activeCategory}
            subCategory={activeSubCategory}
            subSubCategory={activeSubSubCategory}
            onSubCategoryChange={handleSubCategoryChange}
            onSubSubCategoryChange={handleSubSubCategoryChange}
            stats={statsForBadges}
          />

          {/* Titre module + contenu — aligné dashboard */}
          <div className="shrink-0 px-4 py-2 border-b border-slate-200 bg-slate-50 dark:border-slate-800/50 dark:bg-slate-950/40">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200 truncate">
              Gouvernance & Arbitrage
            </h2>
          </div>
          <main
            className="flex-1 min-h-0 min-w-0 overflow-x-hidden overflow-y-auto px-2 sm:px-4 py-2 scrollbar-dashboard bg-white dark:bg-transparent"
            role="main"
          >
            <GovernanceContentRouter
              mainCategory={activeCategory}
              subCategory={activeSubCategory}
              subSubCategory={activeSubSubCategory}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
