'use client';

/**
 * Centre d'alertes — Module pilote architecture Outlook-like (Phase 2A)
 * Layout 3 colonnes : sidebar | liste | détail.
 * Barre d'actions type Outlook : case tout sélectionner, Archive, Flag, Corbeille, Marquer lu, menu …
 * Colonne de checkboxes par ligne pour la sélection multiple.
 */

import dynamic from 'next/dynamic';
import { useState, useCallback, useMemo, useDeferredValue, useEffect, useRef, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useAuth } from '@lib-root/contexts/AuthContext';
import { Plus, Check, UserPlus, ChevronLeft, ChevronRight, ChevronDown, Archive, Flag, Trash2, Mail, MoreHorizontal, HelpCircle, Loader2, Building2, List } from 'lucide-react';
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
import { useIsMobile } from '@/application/hooks/useMediaQuery';
import { SelectionProvider, useSelection } from '@/components/bmo/interactions/SelectionManager';
import { AlertListRow } from '@/components/bmo/alerts/AlertListRow';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

const AlertDetailPanel = dynamic(
  () => import('@/components/bmo/alerts/AlertDetailPanel').then((m) => ({ default: m.AlertDetailPanel })),
  { ssr: false, loading: () => <div className="flex items-center justify-center p-8 text-slate-500">Chargement du détail…</div> }
);

const CreateAlertDialog = dynamic(
  () => import('@/components/bmo/alerts/CreateAlertDialog').then((m) => ({ default: m.CreateAlertDialog })),
  { ssr: false }
);
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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

const PER_PAGE_OPTIONS = [25, 50, 100] as const;

const URL_FOLDER_IDS = new Set(['toutes', 'critiques', 'importantes', 'en-attente', 'technique', 'planning', 'qualite', 'securite', 'financier']);
const URL_VIEW_MODES = new Set(['list', 'byChantier', 'byTitle']);

function AlertsCenterInner() {
  const selection = useSelection();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const prevUserIdRef = useRef<string | null>(null);
  const lastRefetchTimeRef = useRef<number>(0);
  const urlSyncedRef = useRef(false);
  const urlWriteSkippedRef = useRef(false);
  const REFETCH_COOLDOWN_MS = 2000;

  const [selectedFolderId, setSelectedFolderId] = useState('toutes');
  const [activeView, setActiveView] = useState('toutes');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createDialogType, setCreateDialogType] = useState('technique');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [densityMode, setDensityMode] = useState<'normal' | 'compact'>('normal');
  const [viewMode, setViewMode] = useState<'list' | 'byChantier' | 'byTitle'>('list');
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

  // Lecture URL au montage : restaurer folder, view, sort, page, perPage, q
  useEffect(() => {
    if (urlSyncedRef.current) return;
    urlSyncedRef.current = true;
    const folder = searchParams.get('folder');
    if (folder && URL_FOLDER_IDS.has(folder)) setSelectedFolderId(folder);
    const view = searchParams.get('view');
    if (view && URL_VIEW_MODES.has(view)) setViewMode(view as 'list' | 'byChantier' | 'byTitle');
    const sort = searchParams.get('sort');
    if (sort === 'asc' || sort === 'desc') setSortOrder(sort);
    const p = searchParams.get('page');
    if (p) {
      const n = parseInt(p, 10);
      if (!Number.isNaN(n) && n >= 1) setPage(n);
    }
    const pp = searchParams.get('perPage');
    if (pp) {
      const n = parseInt(pp, 10);
      if ([25, 50, 100].includes(n)) setPerPage(n);
    }
    const q = searchParams.get('q');
    if (q != null && q !== '') setSearchQuery(decodeURIComponent(q));
    const density = searchParams.get('density');
    if (density === 'compact') setDensityMode('compact');
  }, [searchParams]);

  // Écriture URL à chaque changement d'état (partage de vue) — on ignore la 1re exécution pour ne pas écraser l'URL lue au montage
  useEffect(() => {
    if (!urlWriteSkippedRef.current) {
      urlWriteSkippedRef.current = true;
      return;
    }
    const params = new URLSearchParams();
    if (selectedFolderId && selectedFolderId !== 'toutes') params.set('folder', selectedFolderId);
    if (viewMode !== 'list') params.set('view', viewMode);
    if (sortOrder !== 'desc') params.set('sort', sortOrder);
    if (page > 1) params.set('page', String(page));
    if (perPage !== 25) params.set('perPage', String(perPage));
    if (searchQuery.trim()) params.set('q', encodeURIComponent(searchQuery.trim()));
    if (densityMode !== 'normal') params.set('density', densityMode);
    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    if (typeof window !== 'undefined' && `${window.location.pathname}${window.location.search}` !== next) {
      router.replace(next, { scroll: false });
    }
  }, [pathname, router, selectedFolderId, viewMode, sortOrder, page, perPage, searchQuery, densityMode]);

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
    limit: perPage,
    page,
  });

  const throttledRefetch = useCallback(() => {
    const now = Date.now();
    if (now - lastRefetchTimeRef.current < REFETCH_COOLDOWN_MS) return;
    lastRefetchTimeRef.current = now;
    refetch();
  }, [refetch]);

  // Invalidation du cache au changement d'utilisateur (évite données d'un autre user)
  useEffect(() => {
    const uid = user?.id ?? null;
    if (prevUserIdRef.current !== null && prevUserIdRef.current !== uid) {
      queryClient.invalidateQueries({ queryKey: ['alertes-btp'] });
      queryClient.invalidateQueries({ queryKey: ['alerte-btp'] });
      refetch();
    }
    prevUserIdRef.current = uid;
  }, [user?.id, queryClient, refetch]);

  const updateAlerte = useUpdateAlerte();
  const deleteAlerte = useDeleteAlerte();
  const traiterAlerte = useTraiterAlerte();
  const assignerAlerte = useAssignerAlerte();

  const rawData = data?.data ?? [];
  const apiTotal = data?.total ?? rawData.length;
  const apiTotalPages = data?.totalPages ?? 1;
  const total = apiTotal;
  const totalPages =
    apiTotalPages > 1 ? apiTotalPages : Math.max(1, Math.ceil(rawData.length / perPage));
  const alertes =
    apiTotalPages <= 1 && rawData.length > perPage
      ? rawData.slice((page - 1) * perPage, page * perPage)
      : rawData;

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
    if (activeFilters.includes('action-requise')) {
      list = list.filter((a) => a.statut === 'non-traite');
    }
    if (activeFilters.includes('cette-semaine')) {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      list = list.filter((a) => {
        const created = a.dateCreation instanceof Date ? a.dateCreation : new Date(a.dateCreation);
        return created >= weekAgo;
      });
    }
    if (activeFilters.includes('non-affecte')) {
      list = list.filter((a) => !a.assigneA?.nom || a.assigneA.nom === '—' || a.assigneA.nom === '-');
    }
    if (activeFilters.includes('en-retard')) {
      const now = new Date();
      list = list.filter((a) => {
        const ech = a.dateEcheance instanceof Date ? a.dateEcheance : a.dateEcheance ? new Date(a.dateEcheance) : null;
        return ech != null && ech < now;
      });
    }
    if (activeFilters.includes('impact-50k')) {
      list = list.filter((a) => (a.impactBudget?.montant ?? 0) >= 50000);
    }
    return list;
  }, [alertes, searchQuery, deferredAdvancedFilters, activeFilters]);

  const hasQuickFilters = activeFilters.some((f) =>
    ['action-requise', 'cette-semaine', 'non-affecte', 'en-retard', 'impact-50k'].includes(f)
  );
  const hasClientFilters = Boolean(searchQuery?.trim() || activeFilterCount > 0 || hasQuickFilters);
  const totalDisplayed = hasClientFilters ? alertesFiltered.length : total;
  const totalPagesDisplay =
    hasClientFilters
      ? Math.max(1, Math.ceil(alertesFiltered.length / perPage))
      : totalPages;
  const itemsToShow = hasClientFilters
    ? alertesFiltered.slice((page - 1) * perPage, page * perPage)
    : alertesFiltered;

  const allIds = useMemo(() => alertesFiltered.map((a) => a.id), [alertesFiltered]);
  const selectedId =
    selection.lastSelectedId && alertesFiltered.some((a) => a.id === selection.lastSelectedId)
      ? selection.lastSelectedId
      : alertesFiltered.find((a) => selection.selectedIds.has(a.id))?.id ?? null;
  const selectedCount = selection.selectedIds.size;
  const found = selectedId ? alertesFiltered.find((a) => a.id === selectedId) : undefined;
  const selectedItem = found ?? null;

  /** Alertes actuellement sélectionnées (pour affichage dans les modales de confirmation) */
  const selectedAlertesForConfirm = useMemo(
    () => alertesFiltered.filter((a) => selection.selectedIds.has(a.id)),
    [alertesFiltered, selection.selectedIds]
  );

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
    setPage((prev) => Math.max(1, Math.min(totalPagesDisplay, p)));
  }, [totalPagesDisplay]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeFilterCount]);

  useEffect(() => {
    if (page > totalPagesDisplay) setPage(totalPagesDisplay);
  }, [page, totalPagesDisplay]);

  useEffect(() => {
    setPage(1);
  }, [perPage]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
        e.preventDefault();
        setShortcutsHelpOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const [goToPageInput, setGoToPageInput] = useState('');
  const handleGoToPageSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const n = parseInt(goToPageInput, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= totalPagesDisplay) {
        goToPage(n);
        setGoToPageInput('');
      }
    },
    [goToPageInput, totalPagesDisplay, goToPage]
  );

  // Gestion de l'erreur
  if (error) {
    logger.error('Erreur chargement alertes', error instanceof Error ? error : undefined, { component: 'AlertsCenterPage' });
  }

  const handleSelectFolder = useCallback((id: string) => {
    setSelectedFolderId(id);
    setPage(1);
    setActiveFilters([]);
    selection.clear();
  }, [selection]);
  const handlePrimaryClick = useCallback(() => {
    setCreateDialogType('technique');
    setCreateDialogOpen(true);
  }, []);

  const handleSortClick = useCallback(() => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  }, []);

  const handleArchive = useCallback(() => setConfirmArchiveOpen(true), []);
  const handleArchiveConfirm = useCallback(() => {
    const count = selection.selectedIds.size;
    Array.from(selection.selectedIds).forEach((id) => {
      updateAlerte.mutate({ id, data: { statut: 'archive' } });
    });
    selection.clear();
    setConfirmArchiveOpen(false);
    setActionFeedback(count === 1 ? '1 alerte archivée' : `${count} alertes archivées`);
    setTimeout(() => setActionFeedback(null), 4000);
  }, [selection, updateAlerte]);
  const handleMarkImportant = useCallback(() => {
    Array.from(selection.selectedIds).forEach((id) => {
      updateAlerte.mutate({ id, data: { urgent: true } });
    });
  }, [selection, updateAlerte]);
  const handleDelete = useCallback(() => setConfirmDeleteOpen(true), []);
  const handleDeleteConfirm = useCallback(() => {
    const count = selection.selectedIds.size;
    Array.from(selection.selectedIds).forEach((id) => {
      deleteAlerte.mutate(id);
    });
    selection.clear();
    setConfirmDeleteOpen(false);
    setActionFeedback(count === 1 ? '1 alerte supprimée' : `${count} alertes supprimées`);
    setTimeout(() => setActionFeedback(null), 4000);
  }, [selection, deleteAlerte]);
  const handleMarkRead = useCallback(() => {
    Array.from(selection.selectedIds).forEach((id) => {
      updateAlerte.mutate({ id, data: { statut: 'traite' } });
    });
  }, [selection, updateAlerte]);
  const handleTraiter = useCallback(() => {
    const count = selection.selectedIds.size;
    Array.from(selection.selectedIds).forEach((id) => {
      traiterAlerte.mutate({ id });
    });
    selection.clear();
    setActionFeedback(count === 1 ? 'Alerte marquée comme traitée' : `${count} alertes marquées comme traitées`);
    setTimeout(() => setActionFeedback(null), 4000);
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

  const baseSections = alertsModuleConfig.subSidebar?.sections ?? [];
  const countCritiques = useMemo(
    () => alertes.filter((a) => a.niveau === 'critique').length,
    [alertes]
  );
  const sections = useMemo(() => {
    return baseSections.map((sec) => ({
      ...sec,
      items: sec.items.map((item) => {
        const badgeOverride =
          item.id === 'toutes' ? total : item.id === 'critiques' ? countCritiques : undefined;
        return badgeOverride !== undefined ? { ...item, badge: badgeOverride } : item;
      }),
    }));
  }, [baseSections, total, countCritiques]);

  const selectAllChecked =
    alertesFiltered.length > 0 && selectedCount === alertesFiltered.length;
  const selectAllIndeterminate =
    alertesFiltered.length > 0 && selectedCount > 0 && selectedCount < alertesFiltered.length;
  const handleSelectAllChange = useCallback(
    (checked: boolean) => {
      if (checked) selection.selectAll(allIds);
      else selection.clear();
    },
    [selection, allIds]
  );

  const quickActionsLeading = (
    <div className="flex items-center gap-2 h-8">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <span className="shrink-0 w-[16px] h-[16px] flex items-center justify-center">
                <Checkbox
                  checked={selectAllChecked ? true : selectAllIndeterminate ? 'indeterminate' : false}
                  onCheckedChange={handleSelectAllChange}
                  aria-label={
                    selectAllChecked
                      ? 'Tout désélectionner'
                      : selectAllIndeterminate
                        ? 'Tout sélectionner (sélection partielle)'
                        : 'Tout sélectionner'
                  }
                />
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 hidden sm:inline whitespace-nowrap">
                Tout
              </span>
            </label>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {selectAllChecked
              ? 'Tout désélectionner'
              : selectAllIndeterminate
                ? `${selectedCount} sélectionnée(s) — cliquer pour tout sélectionner`
                : 'Tout sélectionner (page actuelle)'}
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
      trailing={
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 min-h-[44px] px-2 text-slate-600 dark:text-slate-400 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
                onClick={() => setShortcutsHelpOpen(true)}
                aria-label="Raccourcis clavier (appuyez sur ?)"
              >
                <HelpCircle className="h-5 w-5 shrink-0" />
                <span className="hidden sm:inline text-xs">? aide</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Raccourcis clavier (?)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      }
      actions={[
        {
          id: 'archive',
          icon: <Archive className="h-[16px] w-[16px] shrink-0" />,
          label: 'Archiver',
          variant: 'ghost',
          disabled: selectedCount === 0,
          disabledTooltip: 'Sélectionnez au moins une alerte',
          onClick: handleArchive,
        },
        {
          id: 'flag',
          icon: <Flag className="h-[16px] w-[16px] shrink-0" />,
          label: 'Marquer important',
          variant: 'ghost',
          disabled: selectedCount === 0,
          disabledTooltip: 'Sélectionnez au moins une alerte',
          onClick: handleMarkImportant,
        },
        {
          id: 'delete',
          icon: <Trash2 className="h-[16px] w-[16px] shrink-0" />,
          label: 'Supprimer',
          variant: 'ghost',
          disabled: selectedCount === 0,
          disabledTooltip: 'Sélectionnez au moins une alerte',
          onClick: handleDelete,
        },
        {
          id: 'mark-read',
          icon: <Mail className="h-[16px] w-[16px] shrink-0" />,
          label: 'Marquer comme lu',
          variant: 'ghost',
          disabled: selectedCount === 0,
          disabledTooltip: 'Sélectionnez au moins une alerte',
          onClick: handleMarkRead,
        },
        {
          id: 'traiter',
          icon: <Check className="h-[16px] w-[16px] shrink-0" />,
          label: selectedCount > 1 ? `Traiter (${selectedCount})` : 'Traiter',
          variant: 'ghost',
          disabled: selectedCount === 0,
          disabledTooltip: 'Sélectionnez au moins une alerte',
          onClick: handleTraiter,
        },
        {
          id: 'assigner',
          icon: <UserPlus className="h-[16px] w-[16px] shrink-0" />,
          label: 'Assigner',
          variant: 'ghost',
          disabled: selectedCount === 0,
          disabledTooltip: 'Sélectionnez au moins une alerte',
          onClick: handleAssigner,
        },
      ]}
    />
  );

  const filterBar = (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {actionFeedback ?? (totalDisplayed === 0 ? 'Aucun résultat' : `${totalDisplayed > 99 ? '99+' : totalDisplayed} résultat${(totalDisplayed > 99 ? 99 : totalDisplayed) > 1 ? 's' : ''}`)}
      </div>
      <FilterBar
      viewTabs={[
        { id: 'critiques', label: 'Critiques', count: alertes.filter((a) => a.niveau === 'critique').length, color: 'red' },
        { id: 'toutes', label: 'Toutes', count: totalDisplayed },
      ]}
      activeView={activeView}
      onViewChange={setActiveView}
      activeFilters={activeFilters}
      onFilterToggle={(id) =>
        setActiveFilters((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
      }
      sortLabel={`Date création (${sortOrder === 'desc' ? 'récent d\'abord' : 'ancien d\'abord'})`}
      onSortClick={handleSortClick}
      onAdvancedFilterClick={() => setFilterPanelOpen(true)}
      advancedFilterCount={activeFilterCount}
      quickFilters={[
        { id: 'action-requise', icon: 'AlertCircle', label: 'Action requise' },
        { id: 'cette-semaine', icon: 'Calendar', label: 'Cette semaine' },
        { id: 'non-affecte', icon: 'UserPlus', label: 'Non affecté' },
        { id: 'en-retard', icon: 'Clock', label: 'En retard' },
        { id: 'impact-50k', icon: 'DollarSign', label: 'Impact >50k€' },
      ]}
      searchPlaceholder="Rechercher (max. 120 car.)…"
      searchMaxLength={120}
      searchValue={searchQuery}
      onSearch={(q) => setSearchQuery(q)}
      onSearchClear={() => setSearchQuery('')}
    />
    </>
  );

  const sidebar = (
    <ModuleSubSidebar
      sections={sections}
      selectedId={selectedFolderId}
      onSelect={handleSelectFolder}
      headerLabel="Centre d'alertes"
    />
  );

  const groupsByChantier = useMemo(() => {
    const m = new Map<string, AlerteBTP[]>();
    for (const a of itemsToShow) {
      const key = a.chantier?.nom?.trim() || 'Sans chantier';
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(a);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [itemsToShow]);

  type ChantierGroupStats = {
    chantierNom: string;
    items: AlerteBTP[];
    countCritique: number;
    countImportant: number;
    countNormal: number;
    countFaible: number;
    totalRetardJours: number;
    totalBudget: number;
    devise: string;
  };
  const chantierGroupsWithStats = useMemo((): ChantierGroupStats[] => {
    return groupsByChantier.map(([chantierNom, items]) => {
      let countCritique = 0, countImportant = 0, countNormal = 0, countFaible = 0;
      let totalRetardJours = 0, totalBudget = 0;
      let devise = '€';
      for (const a of items) {
        if (a.niveau === 'critique') countCritique++;
        else if (a.niveau === 'important') countImportant++;
        else if (a.niveau === 'normal') countNormal++;
        else countFaible++;
        if (a.impactPlanning?.retard) {
          totalRetardJours += a.impactPlanning.unite === 'semaines' ? a.impactPlanning.retard * 7 : a.impactPlanning.retard;
        }
        if (a.impactBudget?.montant) {
          totalBudget += a.impactBudget.montant;
          if (a.impactBudget.devise) devise = a.impactBudget.devise;
        }
      }
      return {
        chantierNom,
        items,
        countCritique,
        countImportant,
        countNormal,
        countFaible,
        totalRetardJours,
        totalBudget,
        devise,
      };
    });
  }, [groupsByChantier]);

  const [chantierExpanded, setChantierExpanded] = useState<Record<string, boolean>>({});
  const toggleChantierExpanded = useCallback((key: string) => {
    setChantierExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  /** Regroupement par titre (alertes similaires) — clé = titre normalisé */
  const groupsByTitle = useMemo(() => {
    const m = new Map<string, AlerteBTP[]>();
    for (const a of itemsToShow) {
      const key = (a.titre?.trim() || 'Sans titre').toLowerCase();
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(a);
    }
    return Array.from(m.entries())
      .map(([key, items]) => [items[0]!.titre?.trim() || 'Sans titre', items] as const)
      .sort(([, a], [, b]) => b.length - a.length);
  }, [itemsToShow]);

  const [titleExpanded, setTitleExpanded] = useState<Record<string, boolean>>({});
  const toggleTitleExpanded = useCallback((key: string) => {
    setTitleExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const list = (
    <div className="flex flex-col h-full min-h-0 w-full min-w-0">
      {/* Légende (compacte) + indicateur chargement + densité + vue */}
      <div
        className="shrink-0 px-4 py-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"
        role="note"
        aria-label="Légende et options d'affichage"
      >
        <span className="inline-block w-1 h-3 rounded-full bg-red-500 dark:bg-red-400 shrink-0" aria-hidden />
        <span>Critique</span>
        {selectedCount > 0 && (
          <span className="text-sky-700 dark:text-sky-300 font-medium" role="status">
            {selectedCount} sélectionnée{selectedCount > 1 ? 's' : ''}
          </span>
        )}
        {isLoading && (
          <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400" role="status" aria-live="polite">
            <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" aria-hidden />
            Chargement…
          </span>
        )}
        <span className="w-px h-4 bg-slate-200 dark:bg-slate-600 shrink-0" aria-hidden />
        <div className="flex items-center gap-1">
          <span className="shrink-0">Densité :</span>
          <Button
            variant={densityMode === 'normal' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setDensityMode('normal')}
            aria-pressed={densityMode === 'normal'}
          >
            Normale
          </Button>
          <Button
            variant={densityMode === 'compact' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setDensityMode('compact')}
            aria-pressed={densityMode === 'compact'}
          >
            Compacte
          </Button>
        </div>
        <span className="w-px h-4 bg-slate-200 dark:bg-slate-600 shrink-0" aria-hidden />
        <div className="flex items-center gap-1">
          <span className="shrink-0">Vue :</span>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs inline-flex items-center gap-1"
            onClick={() => setViewMode('list')}
            aria-pressed={viewMode === 'list'}
            aria-label="Vue liste"
          >
            <List className="h-3 w-3 shrink-0" aria-hidden />
            Liste
          </Button>
          <Button
            variant={viewMode === 'byChantier' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs inline-flex items-center gap-1"
            onClick={() => setViewMode('byChantier')}
            aria-pressed={viewMode === 'byChantier'}
            aria-label="Vue par chantier"
          >
            <Building2 className="h-3 w-3 shrink-0" aria-hidden />
            Par chantier
          </Button>
          <Button
            variant={viewMode === 'byTitle' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-6 px-2 text-xs inline-flex items-center gap-1"
            onClick={() => setViewMode('byTitle')}
            aria-pressed={viewMode === 'byTitle'}
            aria-label="Vue regroupée par type"
          >
            <List className="h-3 w-3 shrink-0" aria-hidden />
            Regroupées
          </Button>
        </div>
      </div>
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden scrollbar-dashboard">
        {error && (
          <div
            role="alert"
            className="mx-4 mt-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm flex items-center justify-between gap-2 flex-wrap"
          >
            <span>Erreur de chargement. Vérifiez votre connexion ou réessayez.</span>
            <Button variant="outline" size="sm" onClick={throttledRefetch} className="shrink-0 focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
              Réessayer
            </Button>
          </div>
        )}
        {viewMode === 'byChantier' && !isLoading && itemsToShow.length > 0 ? (
          <div className="flex flex-col py-2" role="list">
            {chantierGroupsWithStats.map((group) => {
              const expanded = chantierExpanded[group.chantierNom] !== false;
              return (
                <div key={group.chantierNom} className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900/40">
                  <div
                    className="px-4 py-3 flex flex-wrap items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700"
                    role="heading"
                    aria-level={2}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" aria-hidden />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{group.chantierNom}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-normal tabular-nums">
                        ({group.items.length} alerte{group.items.length > 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {group.countCritique > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200">
                          🔴 {group.countCritique} critique{group.countCritique > 1 ? 's' : ''}
                        </span>
                      )}
                      {group.countImportant > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-200">
                          ⚠️ {group.countImportant} importante{group.countImportant > 1 ? 's' : ''}
                        </span>
                      )}
                      {group.countNormal > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200">
                          ℹ️ {group.countNormal} info
                        </span>
                      )}
                      {group.countFaible > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          {group.countFaible} faible{group.countFaible > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {(group.totalRetardJours > 0 || group.totalBudget > 0) && (
                      <div className="text-[11px] text-slate-600 dark:text-slate-400">
                        Impact global :
                        {group.totalRetardJours > 0 && (
                          <span className="font-medium text-orange-700 dark:text-orange-300 ml-1">
                            +{group.totalRetardJours}j retard
                          </span>
                        )}
                        {group.totalBudget > 0 && (
                          <span className="font-medium text-green-700 dark:text-green-300 ml-1">
                            +{group.totalBudget.toLocaleString()} {group.devise}
                          </span>
                        )}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-7 px-2 text-xs"
                      onClick={() => toggleChantierExpanded(group.chantierNom)}
                      aria-expanded={expanded}
                      aria-label={expanded ? 'Replier la liste' : 'Déplier la liste'}
                    >
                      {expanded ? 'Replier' : 'Déplier'}
                    </Button>
                  </div>
                  {expanded && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          role="presentation"
                          onClick={(e) => handleRowClick(e, item.id)}
                        >
                          <AlertListRow
                            alerte={item}
                            selected={selectedId === item.id}
                            onClick={undefined}
                            showCheckbox
                            checked={selection.isSelected(item.id)}
                            onCheckboxChange={() => selection.toggle(item.id)}
                            compact={densityMode === 'compact'}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : viewMode === 'byTitle' && !isLoading && itemsToShow.length > 0 ? (
          <div className="flex flex-col py-2" role="list">
            {groupsByTitle.map(([title, titleItems]) => {
              const key = title.toLowerCase().replace(/\s+/g, '-');
              const expanded = titleExpanded[key] !== false;
              return (
                <div key={key} className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900/40">
                  <div
                    className="px-4 py-3 flex flex-wrap items-center gap-2 text-sm bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700"
                    role="heading"
                    aria-level={2}
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-full">{title}</span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums shrink-0">
                      ({titleItems.length} alerte{titleItems.length > 1 ? 's' : ''})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-7 px-2 text-xs"
                      onClick={() => toggleTitleExpanded(key)}
                      aria-expanded={expanded}
                      aria-label={expanded ? 'Replier' : 'Déplier'}
                    >
                      {expanded ? 'Replier' : 'Déplier'}
                    </Button>
                  </div>
                  {expanded && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                      {titleItems.map((item) => (
                        <div
                          key={item.id}
                          role="presentation"
                          onClick={(e) => handleRowClick(e, item.id)}
                        >
                          <AlertListRow
                            alerte={item}
                            selected={selectedId === item.id}
                            onClick={undefined}
                            showCheckbox
                            checked={selection.isSelected(item.id)}
                            onCheckboxChange={() => selection.toggle(item.id)}
                            compact={densityMode === 'compact'}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <ItemList<AlerteBTP>
            items={itemsToShow}
            isLoading={isLoading}
            virtualizeThreshold={20}
            skeletonAnimation="slow"
            error={error ? new Error(error instanceof Error ? error.message : 'Erreur chargement alertes') : null}
            selectedId={selectedId}
            onSelect={(id, e) => e && handleRowClick(e, id)}
            onRetry={throttledRefetch}
            emptyMessage={hasClientFilters ? 'Aucun résultat' : 'Aucune alerte'}
            emptyState={
              hasClientFilters && totalDisplayed === 0
                ? {
                    title: 'Aucun résultat',
                    description: 'Aucune alerte ne correspond à votre recherche ou à vos filtres. Modifiez les critères.',
                    action: {
                      label: 'Modifier la recherche',
                      onClick: () => setFilterPanelOpen(true),
                    },
                  }
                : {
                    title: 'Aucune alerte',
                    description: "Il n'y a pas d'alertes dans cette catégorie pour le moment.",
                    action: {
                      label: 'Créer une alerte',
                      onClick: handlePrimaryClick,
                    },
                  }
            }
            renderItem={(item, { isSelected }) => (
              <AlertListRow
                alerte={item}
                selected={isSelected}
                onClick={undefined}
                showCheckbox
                checked={selection.isSelected(item.id)}
                onCheckboxChange={() => selection.toggle(item.id)}
                compact={densityMode === 'compact'}
              />
            )}
          />
        )}
      </div>
      {(totalPagesDisplay > 1 || totalDisplayed > 0) && (
        <div
          className="shrink-0 flex items-center justify-between gap-2 px-4 py-2 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/40 text-xs text-slate-600 dark:text-slate-400"
          role="navigation"
          aria-label="Pagination"
        >
          <span className="tabular-nums">
            {totalDisplayed === 0
              ? '0 sur 0'
              : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, totalDisplayed)} sur ${totalDisplayed > 99 ? '99+' : totalDisplayed}`}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <form onSubmit={handleGoToPageSubmit} className="flex items-center gap-1">
              <label htmlFor="alerts-goto-page" className="sr-only">
                Aller à la page
              </label>
              <Input
                id="alerts-goto-page"
                type="number"
                min={1}
                max={totalPagesDisplay}
                placeholder="Page"
                value={goToPageInput}
                onChange={(e) => setGoToPageInput(e.target.value)}
                className="w-14 h-8 text-xs py-1 px-2 tabular-nums"
                aria-label="Numéro de page"
              />
              <Button type="submit" variant="ghost" size="sm" className="h-8 px-2 text-xs">
                Aller
              </Button>
            </form>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="h-8 text-xs rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2"
              aria-label="Éléments par page"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}/page
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed border border-transparent disabled:border-slate-200 dark:disabled:border-slate-700"
              aria-label="Page précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="min-w-[4rem] text-center font-medium tabular-nums text-slate-700 dark:text-slate-300">
                Page {page} / {totalPagesDisplay}
              </span>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPagesDisplay}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed border border-transparent disabled:border-slate-200 dark:disabled:border-slate-700"
              aria-label="Page suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const detailPanelProps = useMemo(
    () => ({
      alerte: selectedItem ?? null,
      loading: isLoading,
      onPrevious: currentIndex > 0 ? handlePrevious : undefined,
      onNext:
        currentIndex >= 0 && currentIndex < alertesFiltered.length - 1 ? handleNext : undefined,
      activeView,
      positionIndex: selectedId && alertesFiltered.length > 0 ? currentIndex + 1 : undefined,
      positionTotal: alertesFiltered.length > 0 ? alertesFiltered.length : undefined,
      onTraiter: selectedItem
        ? () => traiterAlerte.mutate({ id: selectedItem.id })
        : undefined,
      onAssigner: selectedItem
        ? () => assignerAlerte.mutate({ id: selectedItem.id, userId: 'current-user' })
        : undefined,
      onCloturer: selectedItem
        ? () => updateAlerte.mutate({ id: selectedItem.id, data: { statut: 'cloture' } })
        : undefined,
      onArchiver: selectedItem
        ? () => updateAlerte.mutate({ id: selectedItem.id, data: { statut: 'archive' } })
        : undefined,
      onCommentSubmit: selectedItem ? () => refetch() : undefined,
      recapStats: {
        total: totalDisplayed,
        critiques: countCritiques,
        enAttente: alertes.filter((a) => a.statut === 'non-traite').length,
      },
      onViewChantier: (chantierId: string) => {
        const url = `/maitre-ouvrage/chantiers?id=${encodeURIComponent(chantierId)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      },
    }),
    [
      selectedItem,
      selectedId,
      isLoading,
      currentIndex,
      alertesFiltered.length,
      activeView,
      handlePrevious,
      handleNext,
      traiterAlerte,
      assignerAlerte,
      updateAlerte,
      refetch,
      totalDisplayed,
      countCritiques,
      alertes,
      router,
    ]
  );

  const detail = <AlertDetailPanel {...detailPanelProps} />;

  return (
    <>
      {/* Sur mobile (< 768px), le panneau détail du layout est masqué : on l'affiche dans un Sheet au clic sur une alerte */}
      {isMobile && (
        <Sheet
          open={!!selectedItem}
          onOpenChange={(open) => {
            if (!open) selection.clear();
          }}
        >
          <SheetContent
            side="right"
            className="w-full sm:max-w-lg p-0 flex flex-col overflow-hidden"
          >
            <div className="flex-1 min-h-0 overflow-y-auto">
              <AlertDetailPanel
                {...detailPanelProps}
                onClose={() => selection.clear()}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}
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

      <Dialog open={confirmArchiveOpen} onOpenChange={setConfirmArchiveOpen}>
        <DialogContent
          onClose={() => setConfirmArchiveOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (document.activeElement as HTMLElement)?.tagName !== 'BUTTON') {
              e.preventDefault();
              handleArchiveConfirm();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Archiver les alertes</DialogTitle>
            <DialogDescription>
              {selectedCount === 1
                ? 'Cette alerte sera archivée. L\'archivage est réversible — vous pourrez la retrouver dans les archives.'
                : `${selectedCount} alertes seront archivées. L'archivage est réversible — vous pourrez les retrouver dans les archives.`}
            </DialogDescription>
            {selectedAlertesForConfirm.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Alertes concernées :</p>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-0.5 max-h-32 overflow-y-auto mt-1">
                  {selectedAlertesForConfirm.slice(0, 10).map((a) => (
                    <li key={a.id}>
                      <span className="font-mono">{a.numero}</span>
                      {a.titre ? ` — ${a.titre.length > 50 ? `${a.titre.slice(0, 50)}…` : a.titre}` : ''}
                    </li>
                  ))}
                  {selectedAlertesForConfirm.length > 10 && (
                    <li className="text-slate-500">… et {selectedAlertesForConfirm.length - 10} autre(s)</li>
                  )}
                </ul>
              </div>
            )}
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmArchiveOpen(false)} className="focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
              Annuler (Echap.)
            </Button>
            <Button
              variant="default"
              onClick={handleArchiveConfirm}
              disabled={updateAlerte.isPending}
              className="focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 min-w-[6rem]"
              aria-busy={updateAlerte.isPending}
            >
              {updateAlerte.isPending ? 'Archivage…' : 'Archiver (Entrée)'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent
          onClose={() => setConfirmDeleteOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (document.activeElement as HTMLElement)?.tagName !== 'BUTTON') {
              e.preventDefault();
              handleDeleteConfirm();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Supprimer les alertes</DialogTitle>
            <DialogDescription>
              {selectedCount === 1
                ? 'Cette alerte sera supprimée définitivement. Cette action est irréversible.'
                : `${selectedCount} alertes seront supprimées définitivement. Cette action est irréversible.`}
            </DialogDescription>
            {selectedAlertesForConfirm.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Alertes concernées :</p>
                <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-0.5 max-h-32 overflow-y-auto mt-1">
                  {selectedAlertesForConfirm.slice(0, 10).map((a) => (
                    <li key={a.id}>
                      <span className="font-mono">{a.numero}</span>
                      {a.titre ? ` — ${a.titre.length > 50 ? `${a.titre.slice(0, 50)}…` : a.titre}` : ''}
                    </li>
                  ))}
                  {selectedAlertesForConfirm.length > 10 && (
                    <li className="text-slate-500">… et {selectedAlertesForConfirm.length - 10} autre(s)</li>
                  )}
                </ul>
              </div>
            )}
          </DialogHeader>
          <DialogFooter className="gap-3 sm:gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)} className="focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2">
              Annuler (Echap.)
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteAlerte.isPending}
              className="focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 min-w-[6rem]"
              aria-busy={deleteAlerte.isPending}
            >
              {deleteAlerte.isPending ? 'Suppression…' : 'Supprimer (Entrée)'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={shortcutsHelpOpen} onOpenChange={setShortcutsHelpOpen}>
        <DialogContent onClose={() => setShortcutsHelpOpen(false)} className="max-w-md">
          <DialogHeader>
            <DialogTitle>Raccourcis clavier — Centre d&apos;alertes</DialogTitle>
            <DialogDescription>
              Utilisez ces raccourcis pour naviguer et agir plus rapidement.
            </DialogDescription>
          </DialogHeader>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4 py-1 border-b border-slate-100 dark:border-slate-800">
              <dt className="text-slate-600 dark:text-slate-400">Recherche / commandes</dt>
              <dd><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">K</kbd></dd>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-slate-100 dark:border-slate-800">
              <dt className="text-slate-600 dark:text-slate-400">Masquer / afficher la sidebar</dt>
              <dd><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">[</kbd></dd>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-slate-100 dark:border-slate-800">
              <dt className="text-slate-600 dark:text-slate-400">Masquer / afficher la liste</dt>
              <dd><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">]</kbd></dd>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-slate-100 dark:border-slate-800">
              <dt className="text-slate-600 dark:text-slate-400">Masquer / afficher le détail</dt>
              <dd><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">\</kbd></dd>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-slate-100 dark:border-slate-800">
              <dt className="text-slate-600 dark:text-slate-400">Ajouter / retirer de la sélection</dt>
              <dd><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">Ctrl</kbd> + clic</dd>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-slate-100 dark:border-slate-800">
              <dt className="text-slate-600 dark:text-slate-400">Sélectionner une plage</dt>
              <dd><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">Shift</kbd> + clic</dd>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-slate-100 dark:border-slate-800">
              <dt className="text-slate-600 dark:text-slate-400">Fermer modales / annuler</dt>
              <dd><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">Echap.</kbd></dd>
            </div>
            <div className="flex justify-between gap-4 py-1 border-b border-slate-100 dark:border-slate-800">
              <dt className="text-slate-600 dark:text-slate-400">Confirmer (dans une modale)</dt>
              <dd><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">Entrée</kbd></dd>
            </div>
            <div className="flex justify-between gap-4 py-1">
              <dt className="text-slate-600 dark:text-slate-400">Afficher cette aide</dt>
              <dd><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs">?</kbd></dd>
            </div>
          </dl>
        </DialogContent>
      </Dialog>

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
    <ErrorBoundary>
      <Suspense fallback={<div className="flex items-center justify-center min-h-[40vh] text-slate-500">Chargement des alertes…</div>}>
        <SelectionProvider>
          <AlertsCenterInner />
        </SelectionProvider>
      </Suspense>
    </ErrorBoundary>
  );
}
