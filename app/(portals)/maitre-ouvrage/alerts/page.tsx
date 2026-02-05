'use client';

/**
 * Centre d'alertes — Module pilote architecture Outlook-like (Phase 2A)
 * Layout 3 colonnes : sidebar | liste | détail.
 * Barre d'actions type Outlook : case tout sélectionner, Archive, Flag, Corbeille, Marquer lu, menu …
 * Colonne de checkboxes par ligne pour la sélection multiple.
 */

import { useState, useCallback, useMemo, useDeferredValue } from 'react';
import { Plus, Check, UserPlus, ChevronLeft, ChevronRight, ChevronDown, Archive, Flag, Trash2, Mail, MoreHorizontal } from 'lucide-react';
import { OutlookLikeLayout } from '@/components/bmo/layout/OutlookLikeLayout';
import { ModuleSubSidebar } from '@/components/bmo/ModuleSubSidebar';
import { ItemList } from '@/components/bmo/ItemList';
import { QuickActionsBar } from '@/components/bmo/ui/QuickActionsBar';
import { FilterBar } from '@/components/bmo/ui/FilterBar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { alertsModuleConfig } from '@/lib/config/modules/alerts.config';
import { useAlertes } from '@/hooks/alerts/useAlertes';
import {
  useUpdateAlerte,
  useDeleteAlerte,
  useTraiterAlerte,
  useAssignerAlerte,
} from '@/hooks/alerts/useAlerteMutations';
import { logger } from '@/lib/utils/logger';
import { SelectionProvider, useSelection } from '@/components/bmo/interactions/SelectionManager';
import { AlertListRow } from '@/components/bmo/alerts/AlertListRow';
import { AlertDetailPanel } from '@/components/bmo/alerts/AlertDetailPanel';
import { CreateAlertDialog } from '@/components/bmo/alerts/CreateAlertDialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
  AlerteBTP,
  AlerteFilters,
  CategorieAlerte,
  NiveauAlerte,
  StatutAlerte,
} from '@/lib/types/alerts-btp.types';

const NIVEAUX: { id: string; label: string }[] = [
  { id: 'critique', label: 'Critique' },
  { id: 'important', label: 'Important' },
  { id: 'normal', label: 'Normal' },
  { id: 'faible', label: 'Faible' },
];
const CATEGORIES: { id: CategorieAlerte; label: string }[] = [
  { id: 'technique', label: 'Technique' },
  { id: 'planning', label: 'Planning' },
  { id: 'qualite', label: 'Qualité' },
  { id: 'securite', label: 'Sécurité' },
  { id: 'financier', label: 'Financier' },
];
const STATUTS: { id: string; label: string }[] = [
  { id: 'non-traite', label: 'Non traité' },
  { id: 'en-cours', label: 'En cours' },
  { id: 'traite', label: 'Traité' },
  { id: 'cloture', label: 'Clôturé' },
];

const ALERTES_PER_PAGE = 25;

function AlertsCenterInner() {
  const selection = useSelection();
  const [selectedFolderId, setSelectedFolderId] = useState('toutes');
  const [activeView, setActiveView] = useState('toutes');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogType, setCreateDialogType] = useState('technique');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{
    niveaux: string[];
    categories: string[];
    statuts: string[];
    dateDebut: string;
    dateFin: string;
    libelle: string;
    objet: string;
    bureaux: string;
    numeroProjet: string;
    numero: string;
    bonDeCommande: string;
    numeroContrat: string;
    numeroAvenant: string;
    incident: boolean;
  }>({
    niveaux: [],
    categories: [],
    statuts: [],
    dateDebut: '',
    dateFin: '',
    libelle: '',
    objet: '',
    bureaux: '',
    numeroProjet: '',
    numero: '',
    bonDeCommande: '',
    numeroContrat: '',
    numeroAvenant: '',
    incident: false,
  });

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
    if (advancedFilters.niveaux.length > 0)
      f.niveaux = [...new Set([...(f.niveaux ?? []), ...advancedFilters.niveaux])] as NiveauAlerte[];
    if (advancedFilters.categories.length > 0)
      f.categories = [...new Set([...(f.categories ?? []), ...advancedFilters.categories])] as CategorieAlerte[];
    if (advancedFilters.statuts.length > 0)
      f.statuts = [...new Set([...(f.statuts ?? []), ...advancedFilters.statuts])] as StatutAlerte[];
    if (advancedFilters.dateDebut)
      f.dateDebut = new Date(advancedFilters.dateDebut);
    if (advancedFilters.dateFin)
      f.dateFin = new Date(advancedFilters.dateFin);
    if (advancedFilters.incident) f.urgent = true;
    return f;
  }, [selectedFolderId, advancedFilters]);

  const deferredAdvancedFilters = useDeferredValue(advancedFilters);

  const { data, isLoading, error, refetch } = useAlertes({
    filters,
    sort: { field: 'date', order: sortOrder },
    limit: ALERTES_PER_PAGE,
    page,
  });

  const updateAlerte = useUpdateAlerte();
  const deleteAlerte = useDeleteAlerte();
  const traiterAlerte = useTraiterAlerte();
  const assignerAlerte = useAssignerAlerte();

  const rawData = data?.data ?? [];
  const apiTotal = data?.total ?? rawData.length;
  const apiTotalPages = data?.totalPages ?? 1;
  const total = apiTotal;
  const totalPages =
    apiTotalPages > 1 ? apiTotalPages : Math.max(1, Math.ceil(rawData.length / ALERTES_PER_PAGE));
  const alertes =
    apiTotalPages <= 1 && rawData.length > ALERTES_PER_PAGE
      ? rawData.slice((page - 1) * ALERTES_PER_PAGE, page * ALERTES_PER_PAGE)
      : rawData;

  const hasClientFilters = Boolean(searchQuery?.trim() || activeFilterCount > 0);
  const activeFilterCount = useMemo(() => {
    let n =
      advancedFilters.niveaux.length +
      advancedFilters.categories.length +
      advancedFilters.statuts.length;
    if (advancedFilters.dateDebut) n += 1;
    if (advancedFilters.dateFin) n += 1;
    if (advancedFilters.libelle.trim()) n += 1;
    if (advancedFilters.objet.trim()) n += 1;
    if (advancedFilters.bureaux.trim()) n += 1;
    if (advancedFilters.numeroProjet.trim()) n += 1;
    if (advancedFilters.numero.trim()) n += 1;
    if (advancedFilters.bonDeCommande.trim()) n += 1;
    if (advancedFilters.numeroContrat.trim()) n += 1;
    if (advancedFilters.numeroAvenant.trim()) n += 1;
    if (advancedFilters.incident) n += 1;
    return n;
  }, [advancedFilters]);

  const alertesFiltered = useMemo(() => {
    let list = alertes;
    const q = searchQuery?.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.titre?.toLowerCase().includes(q) ||
          a.numero?.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q))
      );
    }
    const {
      dateDebut,
      dateFin,
      libelle,
      objet,
      bureaux,
      numeroProjet,
      numero,
      bonDeCommande,
      numeroContrat,
      numeroAvenant,
      incident,
    } = advancedFilters;
    if (dateDebut) {
      const d = new Date(dateDebut);
      d.setHours(0, 0, 0, 0);
      list = list.filter((a) => {
        const created = a.dateCreation instanceof Date ? a.dateCreation : new Date(a.dateCreation);
        return created >= d;
      });
    }
    if (dateFin) {
      const d = new Date(dateFin);
      d.setHours(23, 59, 59, 999);
      list = list.filter((a) => {
        const created = a.dateCreation instanceof Date ? a.dateCreation : new Date(a.dateCreation);
        return created <= d;
      });
    }
    const match = (s: string | undefined, term: string) =>
      !term || (s && s.toLowerCase().includes(term.toLowerCase()));
    if (libelle) list = list.filter((a) => match(a.titre, libelle));
    if (objet)
      list = list.filter(
        (a) => match(a.titre, objet) || match(a.description, objet)
      );
    if (bureaux)
      list = list.filter(
        (a) =>
          match((a as { bureau?: string }).bureau, bureaux) ||
          match(a.chantier?.nom, bureaux) ||
          match(a.description, bureaux)
      );
    if (numeroProjet)
      list = list.filter((a) => match(a.chantier?.code, numeroProjet) || match(a.chantier?.nom, numeroProjet));
    if (numero) list = list.filter((a) => match(a.numero, numero));
    if (bonDeCommande) list = list.filter((a) => match(a.description, bonDeCommande));
    if (numeroContrat) list = list.filter((a) => match(a.description, numeroContrat));
    if (numeroAvenant) list = list.filter((a) => match(a.description, numeroAvenant));
    if (incident)
      list = list.filter(
        (a) =>
          a.urgent ||
          (a.tags && a.tags.some((t) => /incident/i.test(t))) ||
          (a.description && /incident/i.test(a.description))
      );
    return list;
  }, [alertes, searchQuery, deferredAdvancedFilters]);

  const allIds = useMemo(() => alertesFiltered.map((a) => a.id), [alertesFiltered]);
  const selectedId =
    selection.lastSelectedId && alertesFiltered.some((a) => a.id === selection.lastSelectedId)
      ? selection.lastSelectedId
      : alertesFiltered.find((a) => selection.selectedIds.has(a.id))?.id ?? null;
  const selectedCount = selection.selectedIds.size;
  const found = selectedId ? alertesFiltered.find((a) => a.id === selectedId) : undefined;
  const selectedItem = found ?? null;

  const handleRowClick = useCallback(
    (e: React.MouseEvent, itemId: string) => {
      if (e.ctrlKey || e.metaKey) {
        selection.toggle(itemId);
      } else if (e.shiftKey && selection.lastSelectedId) {
        selection.selectRange(selection.lastSelectedId, itemId, allIds);
      } else {
        selection.select(itemId);
      }
    },
    [selection, allIds]
  );

  const goToPage = useCallback((p: number) => {
    setPage((prev) => Math.max(1, Math.min(totalPages, p)));
  }, [totalPages]);

  // Gestion de l'erreur
  if (error) {
    logger.error('Erreur chargement alertes', error instanceof Error ? error : undefined, { component: 'AlertsCenterPage' });
  }

  const handleSelectFolder = useCallback((id: string) => {
    setSelectedFolderId(id);
    setPage(1);
    selection.clear();
  }, [selection]);
  const handlePrimaryClick = useCallback(() => {
    setCreateDialogType('technique');
    setCreateDialogOpen(true);
  }, []);

  const handleSortClick = useCallback(() => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  }, []);

  const handleArchive = useCallback(() => {
    Array.from(selection.selectedIds).forEach((id) => {
      updateAlerte.mutate({ id, data: { statut: 'archive' } });
    });
    selection.clear();
  }, [selection, updateAlerte]);
  const handleMarkImportant = useCallback(() => {
    Array.from(selection.selectedIds).forEach((id) => {
      updateAlerte.mutate({ id, data: { urgent: true } });
    });
  }, [selection, updateAlerte]);
  const handleDelete = useCallback(() => {
    Array.from(selection.selectedIds).forEach((id) => {
      deleteAlerte.mutate(id);
    });
    selection.clear();
  }, [selection, deleteAlerte]);
  const handleMarkRead = useCallback(() => {
    Array.from(selection.selectedIds).forEach((id) => {
      updateAlerte.mutate({ id, data: { statut: 'traite' } });
    });
  }, [selection, updateAlerte]);
  const handleTraiter = useCallback(() => {
    Array.from(selection.selectedIds).forEach((id) => {
      traiterAlerte.mutate({ id });
    });
    selection.clear();
  }, [selection, traiterAlerte]);
  const handleAssigner = useCallback(() => {
    const firstId = Array.from(selection.selectedIds)[0];
    if (firstId) {
      assignerAlerte.mutate({ id: firstId, userId: 'current-user' });
    }
  }, [selection, assignerAlerte]);

  const currentIndex = selectedId
    ? alertesFiltered.findIndex((a) => a.id === selectedId)
    : -1;
  const handlePrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    const prev = alertesFiltered[currentIndex - 1];
    if (prev) selection.select(prev.id);
  }, [currentIndex, alertesFiltered, selection]);
  const handleNext = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= alertesFiltered.length - 1) return;
    const next = alertesFiltered[currentIndex + 1];
    if (next) selection.select(next.id);
  }, [currentIndex, alertesFiltered, selection]);

  const sections = alertsModuleConfig.subSidebar?.sections ?? [];

  const selectAllChecked =
    alertesFiltered.length > 0 && selectedCount === alertesFiltered.length;
  const handleSelectAllChange = useCallback(
    (checked: boolean) => {
      if (checked) selection.selectAll(allIds);
      else selection.clear();
    },
    [selection, allIds]
  );

  const quickActionsLeading = (
    <div className="flex items-center gap-1 h-8">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center shrink-0 w-[16px] h-[16px]">
              <Checkbox
                checked={selectAllChecked}
                onCheckedChange={handleSelectAllChange}
                aria-label={selectAllChecked ? 'Tout désélectionner' : 'Tout sélectionner'}
              />
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {selectAllChecked ? 'Tout désélectionner' : 'Tout sélectionner'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-600 dark:text-slate-400 shrink-0"
            aria-label="Options de sélection"
          >
            <ChevronDown className="h-[16px] w-[16px] shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => selection.selectAll(allIds)}>
            Tout sélectionner
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => selection.clear()}>
            Tout désélectionner
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const quickActions = (
    <QuickActionsBar
      leading={quickActionsLeading}
      primaryLabel="Nouvelle alerte"
      primaryIcon={<Plus className="h-[16px] w-[16px] shrink-0" />}
      onPrimaryClick={handlePrimaryClick}
      selectedCount={selectedCount}
      onMoreClick={() => {}}
      actions={[
        {
          id: 'archive',
          icon: <Archive className="h-[16px] w-[16px] shrink-0" />,
          label: 'Archiver',
          variant: 'ghost',
          disabled: selectedCount === 0,
          onClick: handleArchive,
        },
        {
          id: 'flag',
          icon: <Flag className="h-[16px] w-[16px] shrink-0" />,
          label: 'Marquer important',
          variant: 'ghost',
          disabled: selectedCount === 0,
          onClick: handleMarkImportant,
        },
        {
          id: 'delete',
          icon: <Trash2 className="h-[16px] w-[16px] shrink-0" />,
          label: 'Supprimer',
          variant: 'ghost',
          disabled: selectedCount === 0,
          onClick: handleDelete,
        },
        {
          id: 'mark-read',
          icon: <Mail className="h-[16px] w-[16px] shrink-0" />,
          label: 'Marquer comme lu',
          variant: 'ghost',
          disabled: selectedCount === 0,
          onClick: handleMarkRead,
        },
        {
          id: 'traiter',
          icon: <Check className="h-[16px] w-[16px] shrink-0" />,
          label: 'Traiter',
          variant: 'ghost',
          disabled: selectedCount === 0,
          onClick: handleTraiter,
        },
        {
          id: 'assigner',
          icon: <UserPlus className="h-[16px] w-[16px] shrink-0" />,
          label: 'Assigner',
          variant: 'ghost',
          disabled: selectedCount === 0,
          onClick: handleAssigner,
        },
      ]}
    />
  );

  const activeFilterCount = useMemo(() => {
    let n =
      advancedFilters.niveaux.length +
      advancedFilters.categories.length +
      advancedFilters.statuts.length;
    if (advancedFilters.dateDebut) n += 1;
    if (advancedFilters.dateFin) n += 1;
    if (advancedFilters.libelle.trim()) n += 1;
    if (advancedFilters.objet.trim()) n += 1;
    if (advancedFilters.bureaux.trim()) n += 1;
    if (advancedFilters.numeroProjet.trim()) n += 1;
    if (advancedFilters.numero.trim()) n += 1;
    if (advancedFilters.bonDeCommande.trim()) n += 1;
    if (advancedFilters.numeroContrat.trim()) n += 1;
    if (advancedFilters.numeroAvenant.trim()) n += 1;
    if (advancedFilters.incident) n += 1;
    return n;
  }, [advancedFilters]);

  const filterBar = (
    <FilterBar
      viewTabs={[
        { id: 'critiques', label: 'Critiques', count: alertes.filter((a) => a.niveau === 'critique').length },
        { id: 'toutes', label: 'Toutes', count: total },
      ]}
      activeView={activeView}
      onViewChange={setActiveView}
      activeFilters={activeFilters}
      onFilterToggle={(id) =>
        setActiveFilters((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
      }
      sortLabel={`Date création ${sortOrder === 'desc' ? '↓' : '↑'}`}
      onSortClick={handleSortClick}
      onAdvancedFilterClick={() => setFilterPanelOpen(true)}
      advancedFilterCount={activeFilterCount}
      searchPlaceholder="Rechercher par titre, numéro, description…"
      onSearch={(q) => setSearchQuery(q)}
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
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-dashboard">
        <ItemList<AlerteBTP>
          items={alertesFiltered}
          isLoading={isLoading}
          error={error ? new Error(error instanceof Error ? error.message : 'Erreur chargement alertes') : null}
          selectedId={selectedId}
          onSelect={(id, e) => e && handleRowClick(e, id)}
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
              onClick={undefined}
              showCheckbox
              checked={selection.isSelected(item.id)}
              onCheckboxChange={() => selection.toggle(item.id)}
            />
          )}
        />
      </div>
      {totalPages > 1 && (
        <div
          className="shrink-0 flex items-center justify-between gap-2 px-3 py-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-400"
          role="navigation"
          aria-label="Pagination"
        >
          <span>
            {(page - 1) * ALERTES_PER_PAGE + 1}–{Math.min(page * ALERTES_PER_PAGE, total)} sur {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="min-w-[4rem] text-center font-medium">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const detail = (
    <AlertDetailPanel
      alerte={selectedItem ?? null}
      loading={isLoading}
      onPrevious={currentIndex > 0 ? handlePrevious : undefined}
      onNext={currentIndex >= 0 && currentIndex < alertesFiltered.length - 1 ? handleNext : undefined}
      onTraiter={
        selectedItem
          ? () => {
              traiterAlerte.mutate({ id: selectedItem.id });
            }
          : undefined
      }
      onAssigner={
        selectedItem
          ? () => {
              assignerAlerte.mutate({ id: selectedItem.id, userId: 'current-user' });
            }
          : undefined
      }
      onCloturer={
        selectedItem
          ? () => {
              updateAlerte.mutate({ id: selectedItem.id, data: { statut: 'cloture' } });
            }
          : undefined
      }
      onArchiver={
        selectedItem
          ? () => {
              updateAlerte.mutate({ id: selectedItem.id, data: { statut: 'archive' } });
            }
          : undefined
      }
      onCommentSubmit={
        selectedItem
          ? () => {
              refetch();
            }
          : undefined
      }
    />
  );

  return (
    <>
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
      <Sheet open={filterPanelOpen} onOpenChange={setFilterPanelOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto scrollbar-dashboard">
          <SheetHeader>
            <SheetTitle>Filtres avancés</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="filter-date-debut" className="text-sm font-medium">
                  Date (début)
                </Label>
                <Input
                  id="filter-date-debut"
                  type="date"
                  value={advancedFilters.dateDebut}
                  onChange={(e) =>
                    setAdvancedFilters((prev) => ({ ...prev, dateDebut: e.target.value }))
                  }
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="filter-date-fin" className="text-sm font-medium">
                  Date (fin)
                </Label>
                <Input
                  id="filter-date-fin"
                  type="date"
                  value={advancedFilters.dateFin}
                  onChange={(e) =>
                    setAdvancedFilters((prev) => ({ ...prev, dateFin: e.target.value }))
                  }
                  className="h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-libelle" className="text-sm font-medium">
                Libellé
              </Label>
              <Input
                id="filter-libelle"
                type="text"
                placeholder="Rechercher par libellé"
                value={advancedFilters.libelle}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({ ...prev, libelle: e.target.value }))
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-objet" className="text-sm font-medium">
                Objet
              </Label>
              <Input
                id="filter-objet"
                type="text"
                placeholder="Rechercher par objet"
                value={advancedFilters.objet}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({ ...prev, objet: e.target.value }))
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-bureaux" className="text-sm font-medium">
                Bureaux
              </Label>
              <Input
                id="filter-bureaux"
                type="text"
                placeholder="Bureau(x)"
                value={advancedFilters.bureaux}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({ ...prev, bureaux: e.target.value }))
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-numero-projet" className="text-sm font-medium">
                Numéro projet
              </Label>
              <Input
                id="filter-numero-projet"
                type="text"
                placeholder="Numéro ou code projet"
                value={advancedFilters.numeroProjet}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({ ...prev, numeroProjet: e.target.value }))
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-numero" className="text-sm font-medium">
                Numéro
              </Label>
              <Input
                id="filter-numero"
                type="text"
                placeholder="Numéro alerte"
                value={advancedFilters.numero}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({ ...prev, numero: e.target.value }))
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-bon-commande" className="text-sm font-medium">
                Bon de commande
              </Label>
              <Input
                id="filter-bon-commande"
                type="text"
                placeholder="Réf. bon de commande"
                value={advancedFilters.bonDeCommande}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({ ...prev, bonDeCommande: e.target.value }))
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-numero-contrat" className="text-sm font-medium">
                Numéro contrat
              </Label>
              <Input
                id="filter-numero-contrat"
                type="text"
                placeholder="Réf. contrat"
                value={advancedFilters.numeroContrat}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({ ...prev, numeroContrat: e.target.value }))
                }
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-numero-avenant" className="text-sm font-medium">
                Numéro avenant
              </Label>
              <Input
                id="filter-numero-avenant"
                type="text"
                placeholder="Réf. avenant"
                value={advancedFilters.numeroAvenant}
                onChange={(e) =>
                  setAdvancedFilters((prev) => ({ ...prev, numeroAvenant: e.target.value }))
                }
                className="h-9"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
                <Checkbox
                  checked={advancedFilters.incident}
                  onCheckedChange={(checked) =>
                    setAdvancedFilters((prev) => ({ ...prev, incident: !!checked }))
                  }
                />
                Incident
              </label>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Niveau</h4>
              <div className="flex flex-wrap gap-2">
                {NIVEAUX.map((n) => (
                  <label
                    key={n.id}
                    className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400"
                  >
                    <Checkbox
                      checked={advancedFilters.niveaux.includes(n.id)}
                      onCheckedChange={(checked) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          niveaux: checked
                            ? [...prev.niveaux, n.id]
                            : prev.niveaux.filter((id) => id !== n.id),
                        }))
                      }
                    />
                    {n.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Catégorie</h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400"
                  >
                    <Checkbox
                      checked={advancedFilters.categories.includes(c.id)}
                      onCheckedChange={(checked) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          categories: checked
                            ? [...prev.categories, c.id]
                            : prev.categories.filter((id) => id !== c.id),
                        }))
                      }
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Statut</h4>
              <div className="flex flex-wrap gap-2">
                {STATUTS.map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400"
                  >
                    <Checkbox
                      checked={advancedFilters.statuts.includes(s.id)}
                      onCheckedChange={(checked) =>
                        setAdvancedFilters((prev) => ({
                          ...prev,
                          statuts: checked
                            ? [...prev.statuts, s.id]
                            : prev.statuts.filter((id) => id !== s.id),
                        }))
                      }
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() =>
                setAdvancedFilters({
                  niveaux: [],
                  categories: [],
                  statuts: [],
                  dateDebut: '',
                  dateFin: '',
                  libelle: '',
                  objet: '',
                  bureaux: '',
                  numeroProjet: '',
                  numero: '',
                  bonDeCommande: '',
                  numeroContrat: '',
                  numeroAvenant: '',
                  incident: false,
                })
              }
            >
              Réinitialiser les filtres
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default function AlertsCenterPage() {
  return (
    <SelectionProvider>
      <AlertsCenterInner />
    </SelectionProvider>
  );
}
