'use client';

/**
 * BmoModulePage — Template générique pour pages modules BMO (Outlook-like).
 * Réutilisable pour Alertes, Demandes, Validation BC, Gouvernance, etc.
 */

import React, { useCallback, useMemo, type ReactNode } from 'react';
import { OutlookLikeLayout } from '@/components/bmo/layout/OutlookLikeLayout';
import { ModuleSubSidebar } from '@/components/bmo/ModuleSubSidebar';
import { ItemList } from '@/components/bmo/ItemList';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { FilterBar } from '@/components/bmo/ui/FilterBar';
import type { ModuleConfig, SubSidebarSection } from '@/lib/types/module.types';

export interface BmoModulePageProps<T extends { id: string }> {
  /** Clé du module (ex: alerts, demandes) */
  module: string;
  /** Config du module */
  config: ModuleConfig;
  /** Données de la liste */
  items: T[];
  /** ID sélectionné */
  selectedId: string | null;
  /** Callback sélection */
  onSelectItem: (id: string) => void;
  /** ID dossier/folder actif */
  selectedFolderId: string;
  /** Callback changement dossier */
  onSelectFolder: (id: string) => void;
  /** Vue active (filterBar) */
  activeView: string;
  onViewChange: (id: string) => void;
  /** Rendu d'une ligne de liste */
  renderListItem: (item: T, options: { isSelected: boolean }) => ReactNode;
  /** Rendu du panneau détail */
  renderDetail: ReactNode;
  /** Rendu actions rapides */
  renderQuickActions?: ReactNode;
  /** Message liste vide */
  emptyMessage?: string;
  /** Afficher toolbar layout */
  enableLayoutToolbar?: boolean;
  /** Loading */
  isLoading?: boolean;
}

export function BmoModulePage<T extends { id: string }>({
  module,
  config,
  items,
  selectedId,
  onSelectItem,
  selectedFolderId,
  onSelectFolder,
  activeView,
  onViewChange,
  renderListItem,
  renderDetail,
  renderQuickActions,
  emptyMessage = 'Aucun élément',
  enableLayoutToolbar = true,
  isLoading = false,
}: BmoModulePageProps<T>) {
  const sections: SubSidebarSection[] = config.subSidebar?.sections ?? [];

  const sidebar = (
    <ModuleSubSidebar
      sections={sections}
      selectedId={selectedFolderId}
      onSelect={onSelectFolder}
      headerLabel={config.name}
    />
  );

  const filterBar = config.filterBar && (
    <FilterBar
      viewTabs={config.filterBar.views?.map((v) => ({
        id: v.id,
        label: v.label,
        count: v.badge ?? undefined,
      }))}
      activeView={activeView}
      onViewChange={onViewChange}
      sortLabel={config.filterBar.sort?.[0]?.label}
      onSortClick={() => {}}
    />
  );

  const list = (
    <ItemList<T>
      items={items}
      selectedId={selectedId}
      onSelect={onSelectItem}
      emptyMessage={isLoading ? 'Chargement...' : emptyMessage}
      renderItem={renderListItem}
    />
  );

  return (
    <OutlookLikeLayout
      module={module}
      sidebar={sidebar}
      filterBar={filterBar}
      list={list}
      detail={renderDetail}
      quickActions={renderQuickActions}
      subSidebarCollapsible
      enableLayoutToolbar={enableLayoutToolbar}
      enableKeyboardNav={enableLayoutToolbar}
    />
  );
}
