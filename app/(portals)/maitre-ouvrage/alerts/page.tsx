'use client';

/**
 * Centre d'alertes — Module pilote architecture Outlook-like (Phase 2A)
 * Layout 3 colonnes : sidebar | liste | détail.
 * Utilise API /api/alerts + hooks + composants dédiés.
 */

import { useState, useCallback, useMemo } from 'react';
import { Plus, Check, UserPlus } from 'lucide-react';
import { OutlookLikeLayout } from '@/components/bmo/layout/OutlookLikeLayout';
import { ModuleSubSidebar } from '@/components/bmo/ModuleSubSidebar';
import { ItemList } from '@/components/bmo/ItemList';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { FilterBar } from '@/components/bmo/ui/FilterBar';
import { alertsModuleConfig } from '@/lib/config/modules/alerts.config';
import { useAlertes } from '@/hooks/alerts/useAlertes';
import { SelectionProvider } from '@/components/bmo/interactions/SelectionManager';
import { AlertListRow } from '@/components/bmo/alerts/AlertListRow';
import { AlertDetailPanel } from '@/components/bmo/alerts/AlertDetailPanel';
import { CreateAlertDialog } from '@/components/bmo/alerts/CreateAlertDialog';
import type { AlerteBTP, AlerteFilters, CategorieAlerte } from '@/lib/types/alerts-btp.types';

export default function AlertsCenterPage() {
  const [selectedFolderId, setSelectedFolderId] = useState('toutes');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('toutes');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogType, setCreateDialogType] = useState('technique');

  const filters = useMemo((): AlerteFilters => {
    const f: AlerteFilters = {};
    switch (selectedFolderId) {
      case 'critiques':
      case 'importantes':
        f.niveaux = [selectedFolderId === 'critiques' ? 'critique' : 'important'];
        break;
      case 'en-attente':
        f.statuts = ['non-traite'];
        break;
      case 'technique':
      case 'planning':
      case 'qualite':
      case 'securite':
      case 'financier':
        f.categories = [selectedFolderId as CategorieAlerte];
        break;
      default:
        break;
    }
    return f;
  }, [selectedFolderId]);

  const { data, isLoading, error, refetch } = useAlertes({
    filters,
    sort: { field: 'date', order: 'desc' },
    limit: 100,
  });

  const alertes = data?.data ?? [];
  const found = selectedId ? alertes.find((a) => a.id === selectedId) : undefined;
  const selectedItem = found ?? null;

  // Gestion de l'erreur
  if (error) {
    console.error('[AlertsCenterPage] Erreur:', error);
  }

  const handleSelectFolder = useCallback((id: string) => setSelectedFolderId(id), []);
  const handleSelectItem = useCallback((id: string) => setSelectedId(id), []);
  const handlePrimaryClick = useCallback(() => {
    setCreateDialogType('technique');
    setCreateDialogOpen(true);
  }, []);

  const sections = alertsModuleConfig.subSidebar?.sections ?? [];

  const quickActions = (
    <QuickActionsBar
      primaryLabel="Nouvelle alerte"
      primaryIcon={<Plus className="h-5 w-5" />}
      onPrimaryClick={handlePrimaryClick}
      selectedCount={selectedId ? 1 : 0}
      actions={[
        {
          id: 'traiter',
          icon: <Check className="h-5 w-5" />,
          label: 'Traiter',
          variant: 'ghost',
          disabled: !selectedId,
          onClick: () => {},
        },
        {
          id: 'assigner',
          icon: <UserPlus className="h-5 w-5" />,
          label: 'Assigner',
          variant: 'ghost',
          disabled: !selectedId,
          onClick: () => {},
        },
      ]}
    />
  );

  const filterBar = (
    <FilterBar
      viewTabs={[
        { id: 'critiques', label: 'Critiques', count: alertes.filter((a) => a.niveau === 'critique').length },
        { id: 'toutes', label: 'Toutes', count: alertes.length },
      ]}
      activeView={activeView}
      onViewChange={setActiveView}
      activeFilters={activeFilters}
      onFilterToggle={(id) =>
        setActiveFilters((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
      }
      sortLabel="Date création"
      onSortClick={() => {}}
    />
  );

  const sidebar = (
    <ModuleSubSidebar
      sections={sections}
      selectedId={selectedFolderId}
      onSelect={handleSelectFolder}
      headerLabel="Centre d'alertes"
    />
  );

  const list = (
    <ItemList<AlerteBTP>
      items={alertes}
      isLoading={isLoading}
      error={error ? new Error(error instanceof Error ? error.message : 'Erreur chargement alertes') : null}
      selectedId={selectedId}
      onSelect={handleSelectItem}
      onRetry={() => refetch()}
      emptyMessage="Aucune alerte"
      emptyState={{
        title: 'Aucune alerte',
        description: 'Il n\'y a pas d\'alertes dans cette catégorie pour le moment.',
        action: {
          label: 'Créer une alerte',
          onClick: handlePrimaryClick,
        },
      }}
      renderItem={(item, { isSelected }) => (
        <AlertListRow
          alerte={item}
          selected={isSelected}
          onClick={() => handleSelectItem(item.id)}
        />
      )}
    />
  );

  const detail = (
    <AlertDetailPanel alerte={selectedItem ?? null} loading={isLoading} />
  );

  return (
    <SelectionProvider>
      <OutlookLikeLayout
        module="alerts"
        sidebar={sidebar}
        filterBar={filterBar}
        list={list}
        detail={detail}
        quickActions={quickActions}
        subSidebarCollapsible
        enableLayoutToolbar
        enableKeyboardNav
      />
      <CreateAlertDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        type={createDialogType}
      />
    </SelectionProvider>
  );
}
