/**
 * Layout pour le module Calendrier & Planification v3.0
 * Navigation à 3 niveaux avec Sidebar, SubNavigation et ContentRouter
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCalendrierCommandCenterStore } from '@/lib/stores/calendrierCommandCenterStore';
import {
  CalendrierSidebar,
  CalendrierSubNavigation,
  type CalendrierMainCategory,
} from '@/modules/calendrier';
import { CalendrierContentRouter } from '@/modules/calendrier/components';
import { useCalendrierFiltersStore } from '@/modules/calendrier/stores/calendrierFiltersStore';
import { CalendrierCommandPalette } from '@/components/features/bmo/calendrier/command-center';
import { NotificationsPanel } from '@/components/shared/NotificationsPanel';
import { cn } from '@/lib/utils';

export default function CalendrierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    navigation,
    sidebarCollapsed,
    toggleSidebar,
    navigate,
    goBack,
  } = useCalendrierCommandCenterStore();

  const { stats } = useCalendrierFiltersStore();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsPanelOpen, setNotificationsPanelOpen] = useState(false);

  // Mapper CalendrierStats vers Record<string, number> pour la sidebar
  const statsForSidebar = React.useMemo<Record<string, number> | undefined>(() => {
    if (!stats) return undefined;
    return {
      overview: stats.jalons_total_count || 0,
      retards: stats.jalons_retard_count || 0,
      'sla-risque': stats.jalons_at_risk_count || 0,
      'retards-detectes': stats.retards_detectes_count || 0,
      'sur-allocation': stats.sur_allocation_ressources_count || 0,
    };
  }, [stats]);

  // Synchroniser URL ↔ Navigation Store au chargement
  useEffect(() => {
    if (pathname) {
      // Parser l'URL pour déterminer la navigation
      const pathParts = pathname.split('/').filter(Boolean);
      const calendrierIndex = pathParts.indexOf('calendrier');
      
      if (calendrierIndex >= 0 && pathParts.length > calendrierIndex + 1) {
        const mainCategory = pathParts[calendrierIndex + 1] as CalendrierMainCategory;
        const subCategory = pathParts[calendrierIndex + 2] || null;
        const subSubCategory = pathParts[calendrierIndex + 3] || null;
        
        // Si la navigation est différente de l'URL, mettre à jour le store
        if (navigation.mainCategory !== mainCategory || 
            navigation.subCategory !== subCategory ||
            navigation.subSubCategory !== subSubCategory) {
          navigate(mainCategory, subCategory, subSubCategory);
        }
      } else if (!navigation.mainCategory) {
        // Pas d'URL spécifique, initialiser avec overview
        navigate('overview', null, null);
      }
    }
  }, [pathname]); // Ne pas inclure navigation pour éviter les boucles

  // Initialiser la navigation si nécessaire
  useEffect(() => {
    if (!navigation.mainCategory) {
      navigate('overview', null, null);
    }
  }, [navigation.mainCategory, navigate]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (['input', 'textarea', 'select'].includes(target?.tagName?.toLowerCase() || '')) return;

      const isMod = e.metaKey || e.ctrlKey;

      // ⌘K - Palette de commandes
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // ⌘B - Toggle sidebar
      if (isMod && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }

      // Alt+← - Retour (si historique disponible)
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar, goBack]);

  const handleOpenCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const handleCategoryChange = (category: CalendrierMainCategory, subCategory?: string) => {
    navigate(category, subCategory || null, null);
  };

  const handleSubCategoryChange = (subCategory: string) => {
    navigate(navigation.mainCategory, subCategory, null);
  };

  const handleSubSubCategoryChange = (subSubCategory: string) => {
    navigate(navigation.mainCategory, navigation.subCategory || null, subSubCategory);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Sidebar Navigation - Level 1 */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
          onClick={toggleSidebar}
        />
      )}
      <CalendrierSidebar
        activeCategory={navigation.mainCategory}
        activeSubCategory={navigation.subCategory}
        collapsed={sidebarCollapsed}
        stats={statsForSidebar}
        onCategoryChange={handleCategoryChange}
        onToggleCollapse={toggleSidebar}
        onOpenCommandPalette={handleOpenCommandPalette}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sub Navigation - Level 2 & 3 */}
        <CalendrierSubNavigation
          mainCategory={navigation.mainCategory}
          subCategory={navigation.subCategory}
          subSubCategory={navigation.subSubCategory}
          onSubCategoryChange={handleSubCategoryChange}
          onSubSubCategoryChange={handleSubSubCategoryChange}
          stats={(stats as unknown) as Record<string, number> | undefined}
        />

        {/* Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-x-hidden overflow-y-auto">
            <CalendrierContentRouter
              mainCategory={navigation.mainCategory}
              subCategory={navigation.subCategory}
              subSubCategory={navigation.subSubCategory}
            />
          </div>
        </main>
      </div>

      {/* Command Palette */}
      {commandPaletteOpen && (
        <CalendrierCommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
      )}

      {/* Notifications Panel */}
      <NotificationsPanel
        isOpen={notificationsPanelOpen}
        onClose={() => setNotificationsPanelOpen(false)}
        moduleName="Calendrier"
      />
    </div>
  );
}
