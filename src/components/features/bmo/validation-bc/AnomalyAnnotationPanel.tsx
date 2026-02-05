'use client';

/**
 * Panel d'Anomalies et Annotations - Version Sophistiquée
 * Design moderne aligné avec les pages Analytics et Gouvernance
 * Fonctionnalités avancées : recherche, filtres, statistiques, édition inline
 * ✅ Modal de confirmation, raccourcis clavier, tri, gestion d'erreurs, états de chargement
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { useBMOStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import {
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  X,
  Plus,
  Edit2,
  Trash2,
  Save,
  Search,
  Filter,
  TrendingUp,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  Info,
  FileWarning,
  Sparkles,
  Loader2,
  ArrowUpDown,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import type {
  DocumentAnomaly,
  DocumentAnnotation,
  DocumentType,
} from '@/lib/types/document-validation.types';
import { AnomalyDetailModal } from './AnomalyDetailModal';
import { BatchActionsBar } from './components/BatchActionsBar';
import { ExportModal, type ExportConfig } from './modals/ExportModal';
import { AnnotationDetailModal } from './modals/AnnotationDetailModal';
import { Checkbox } from '@/components/ui/checkbox';

interface AnomalyAnnotationPanelProps {
  documentId: string;
  documentType: DocumentType;
  anomalies: DocumentAnomaly[];
  annotations: DocumentAnnotation[];
  onAddAnnotation: (annotation: Omit<DocumentAnnotation, 'id' | 'createdAt'>) => void;
  onResolveAnomaly: (anomalyId: string) => void;
  onUpdateAnnotation?: (annotationId: string, comment: string) => void;
  onDeleteAnnotation?: (annotationId: string) => void;
}

type AnnotationType = 'comment' | 'correction' | 'approval' | 'rejection';
type SeverityFilter = 'all' | 'critical' | 'error' | 'warning' | 'info';
type SortOrder = 'date-desc' | 'date-asc' | 'severity';

export function AnomalyAnnotationPanel({
  documentId,
  documentType,
  anomalies,
  annotations,
  onAddAnnotation,
  onResolveAnomaly,
  onUpdateAnnotation,
  onDeleteAnnotation,
}: AnomalyAnnotationPanelProps) {
  const { addToast } = useBMOStore();
  
  // State
  const [showAddAnnotation, setShowAddAnnotation] = useState(false);
  const [selectedField, setSelectedField] = useState<string>('');
  const [annotationComment, setAnnotationComment] = useState('');
  const [annotationType, setAnnotationType] = useState<AnnotationType>('comment');
  const [linkedAnomalyId, setLinkedAnomalyId] = useState<string>('');
  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
  const [expandedSections, setExpandedSections] = useState({
    anomalies: true,
    resolved: false,
    annotations: true,
  });
  
  // Confirmation modal
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    annotationId: string | null;
  }>({ open: false, annotationId: null });
  
  // Loading states
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [resolvingAnomalyId, setResolvingAnomalyId] = useState<string | null>(null);
  
  // Modal detail anomaly
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Selection states
  const [selectedAnomalyIds, setSelectedAnomalyIds] = useState<Set<string>>(new Set());
  const [selectedAnnotationIds, setSelectedAnnotationIds] = useState<Set<string>>(new Set());
  
  // Pagination states
  const [currentPageAnomalies, setCurrentPageAnomalies] = useState(1);
  const [currentPageAnnotations, setCurrentPageAnnotations] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // Modal states
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [annotationDetailModalOpen, setAnnotationDetailModalOpen] = useState(false);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  
  // Loading states for batch actions
  const [isBulkResolving, setIsBulkResolving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Refs for keyboard shortcuts
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Computed
  const unresolvedAnomalies = anomalies.filter(a => !a.resolved);
  const resolvedAnomalies = anomalies.filter(a => a.resolved);

  // Champs disponibles
  const availableFields = [
    'montant_ht', 'montant_ttc', 'tva', 'date_emission', 'date_limite',
    'fournisseur', 'projet', 'objet', 'bc_associe', 'motif', 'impact_financier', 'impact_delai'
  ];

  // Fonction de tri
  const sortAnomalies = (items: DocumentAnomaly[]) => {
    const sorted = [...items];
    switch (sortOrder) {
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.detectedAt).getTime() - new Date(b.detectedAt).getTime());
        break;
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime());
        break;
      case 'severity':
        const severityOrder: Record<string, number> = {
          critical: 0,
          error: 1,
          warning: 2,
          info: 3,
        };
        sorted.sort((a, b) => {
          const aOrder = severityOrder[a.severity] ?? 99;
          const bOrder = severityOrder[b.severity] ?? 99;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
        });
        break;
    }
    return sorted;
  };

  const sortAnnotations = (items: DocumentAnnotation[]) => {
    const sorted = [...items];
    switch (sortOrder) {
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'date-desc':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }
    return sorted;
  };

  // Filtrage et tri des anomalies
  const filteredUnresolvedAnomalies = useMemo(() => {
    const filtered = unresolvedAnomalies.filter(anomaly => {
      const matchesSeverity = severityFilter === 'all' || anomaly.severity === severityFilter;
      const matchesSearch = !searchQuery || 
        anomaly.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        anomaly.field?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSeverity && matchesSearch;
    });
    return sortAnomalies(filtered);
  }, [unresolvedAnomalies, severityFilter, searchQuery, sortOrder]);

  const filteredResolvedAnomalies = useMemo(() => {
    const filtered = resolvedAnomalies.filter(anomaly => {
      const matchesSearch = !searchQuery || 
        anomaly.message.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    return sortAnomalies(filtered);
  }, [resolvedAnomalies, searchQuery, sortOrder]);

  // Filtrage et tri des annotations
  const filteredAnnotations = useMemo(() => {
    const filtered = annotations.filter(annotation => {
      const matchesSearch = !searchQuery || 
        annotation.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        annotation.field?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
    return sortAnnotations(filtered);
  }, [annotations, searchQuery, sortOrder]);

  // Statistiques
  const stats = useMemo(() => {
    const critical = unresolvedAnomalies.filter(a => a.severity === 'critical' || a.severity === 'error').length;
    const warnings = unresolvedAnomalies.filter(a => a.severity === 'warning').length;
    return {
      total: anomalies.length,
      unresolved: unresolvedAnomalies.length,
      resolved: resolvedAnomalies.length,
      critical,
      warnings,
      annotations: annotations.length,
    };
  }, [anomalies, unresolvedAnomalies, resolvedAnomalies, annotations]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape pour annuler
      if (e.key === 'Escape') {
        if (showAddAnnotation) {
          setShowAddAnnotation(false);
          setAnnotationComment('');
          setSelectedField('');
          setLinkedAnomalyId('');
        }
        if (editingAnnotationId) {
          handleCancelEdit();
        }
        if (confirmDelete.open) {
          setConfirmDelete({ open: false, annotationId: null });
        }
      }
      
      // Enter + Ctrl/Cmd pour sauvegarder (formulaire d'ajout)
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && showAddAnnotation && !isAdding) {
        e.preventDefault();
        handleAddAnnotation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddAnnotation, editingAnnotationId, confirmDelete.open, isAdding]);

  // Auto-focus sur le textarea quand le formulaire s'ouvre
  useEffect(() => {
    if (showAddAnnotation && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [showAddAnnotation]);

  // Auto-focus sur le textarea d'édition
  useEffect(() => {
    if (editingAnnotationId && editTextareaRef.current) {
      setTimeout(() => editTextareaRef.current?.focus(), 100);
    }
  }, [editingAnnotationId]);

  // Handlers avec gestion d'erreurs et loading
  const handleAddAnnotation = async () => {
    if (!annotationComment.trim()) {
      addToast('Le commentaire est obligatoire', 'warning');
      return;
    }

    setIsAdding(true);
    try {
      onAddAnnotation({
        documentId,
        documentType,
        field: selectedField || undefined,
        comment: annotationComment,
        anomalyId: linkedAnomalyId || undefined,
        createdBy: 'BMO-USER',
        type: annotationType,
      });

      setAnnotationComment('');
      setSelectedField('');
      setLinkedAnomalyId('');
      setShowAddAnnotation(false);
      addToast('Annotation ajoutée avec succès', 'success');
    } catch (error) {
      logger.error('Erreur lors de l\'ajout de l\'annotation', error instanceof Error ? error : undefined, { component: 'AnomalyAnnotationPanel' });
      addToast('Erreur lors de l\'ajout de l\'annotation', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleResolveAnomaly = async (anomalyId: string) => {
    setResolvingAnomalyId(anomalyId);
    try {
      await Promise.resolve(onResolveAnomaly(anomalyId));
      addToast('Anomalie marquée comme résolue', 'success');
    } catch (error) {
      logger.error('Erreur lors de la résolution de l\'anomalie', error instanceof Error ? error : undefined, { component: 'AnomalyAnnotationPanel' });
      addToast('Erreur lors de la résolution de l\'anomalie', 'error');
    } finally {
      setResolvingAnomalyId(null);
    }
  };

  const handleStartEdit = (annotation: DocumentAnnotation) => {
    setEditingAnnotationId(annotation.id);
    setEditingComment(annotation.comment);
  };

  const handleSaveEdit = async () => {
    if (!editingComment.trim() || !editingAnnotationId || !onUpdateAnnotation) return;
    
    setIsUpdating(true);
    try {
      await Promise.resolve(onUpdateAnnotation(editingAnnotationId, editingComment));
      setEditingAnnotationId(null);
      setEditingComment('');
      addToast('Annotation modifiée avec succès', 'success');
    } catch (error) {
      logger.error('Erreur lors de la modification de l\'annotation', error instanceof Error ? error : undefined, { component: 'AnomalyAnnotationPanel' });
      addToast('Erreur lors de la modification de l\'annotation', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingAnnotationId(null);
    setEditingComment('');
  };

  const handleDeleteClick = (annotationId: string) => {
    if (!onDeleteAnnotation) return;
    setConfirmDelete({ open: true, annotationId });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete.annotationId || !onDeleteAnnotation) return;
    
    setIsDeleting(true);
    try {
      await Promise.resolve(onDeleteAnnotation(confirmDelete.annotationId));
      setConfirmDelete({ open: false, annotationId: null });
      addToast('Annotation supprimée avec succès', 'success');
    } catch (error) {
      logger.error('Erreur lors de la suppression de l\'annotation', error instanceof Error ? error : undefined, { component: 'AnomalyAnnotationPanel' });
      addToast('Erreur lors de la suppression de l\'annotation', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Handler pour copier le texte
  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      addToast('Texte copié dans le presse-papiers', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      logger.error('Erreur lors de la copie', error instanceof Error ? error : undefined, { component: 'AnomalyAnnotationPanel' });
      addToast('Erreur lors de la copie', 'error');
    }
  };

  // Handlers pour sélection multiple
  const handleToggleAnomalySelection = (anomalyId: string) => {
    setSelectedAnomalyIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(anomalyId)) {
        newSet.delete(anomalyId);
      } else {
        newSet.add(anomalyId);
      }
      return newSet;
    });
  };

  const handleToggleAnnotationSelection = (annotationId: string) => {
    setSelectedAnnotationIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(annotationId)) {
        newSet.delete(annotationId);
      } else {
        newSet.add(annotationId);
      }
      return newSet;
    });
  };

  const handleSelectAllAnomalies = () => {
    if (selectedAnomalyIds.size === filteredUnresolvedAnomalies.length) {
      setSelectedAnomalyIds(new Set());
    } else {
      setSelectedAnomalyIds(new Set(filteredUnresolvedAnomalies.map(a => a.id)));
    }
  };

  const handleSelectAllAnnotations = () => {
    if (selectedAnnotationIds.size === filteredAnnotations.length) {
      setSelectedAnnotationIds(new Set());
    } else {
      setSelectedAnnotationIds(new Set(filteredAnnotations.map(a => a.id)));
    }
  };

  const handleClearSelection = () => {
    setSelectedAnomalyIds(new Set());
    setSelectedAnnotationIds(new Set());
  };

  // Handlers pour batch actions
  const handleBulkResolve = async (anomalyIds: string[]) => {
    setIsBulkResolving(true);
    try {
      await Promise.all(anomalyIds.map(id => handleResolveAnomaly(id)));
      handleClearSelection();
      addToast(`${anomalyIds.length} anomalie(s) résolue(s)`, 'success');
    } catch (error) {
      console.error('Erreur lors de la résolution groupée:', error);
      addToast('Erreur lors de la résolution groupée', 'error');
    } finally {
      setIsBulkResolving(false);
    }
  };

  const handleBulkDelete = async (annotationIds: string[]) => {
    if (!onDeleteAnnotation) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(annotationIds.map(id => Promise.resolve(onDeleteAnnotation!(id))));
      handleClearSelection();
      addToast(`${annotationIds.length} annotation(s) supprimée(s)`, 'success');
    } catch (error) {
      logger.error('Erreur lors de la suppression groupée', error instanceof Error ? error : undefined, { component: 'AnomalyAnnotationPanel' });
      addToast('Erreur lors de la suppression groupée', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleExportSelected = (anomalyIds?: string[], annotationIds?: string[]) => {
    setExportModalOpen(true);
    // Les IDs seront utilisés dans le modal d'export
  };

  const handleExport = async (config: ExportConfig) => {
    setIsExporting(true);
    try {
      // Préparer les données à exporter selon le scope
      let dataToExport: any[] = [];
      
      if (config.scope === 'selected') {
        const selectedAnomalies = anomalies.filter(a => selectedAnomalyIds.has(a.id));
        const selectedAnnotations = annotations.filter(a => selectedAnnotationIds.has(a.id));
        dataToExport = [...selectedAnomalies, ...selectedAnnotations];
      } else if (config.scope === 'filtered') {
        dataToExport = [...filteredUnresolvedAnomalies, ...filteredAnnotations];
        if (config.options.includeResolved) {
          dataToExport = [...dataToExport, ...filteredResolvedAnomalies];
        }
      } else {
        dataToExport = [...anomalies, ...annotations];
        if (config.options.includeResolved) {
          dataToExport = [...dataToExport, ...resolvedAnomalies];
        }
      }

      // Simuler l'export (à remplacer par un vrai export)
      console.log('Export config:', config);
      logger.debug('Data to export', { component: 'AnomalyAnnotationPanel', count: dataToExport?.length });
      
      // Ici, vous pouvez appeler votre service d'export
      // await exportService.export(dataToExport, config);
      
      addToast(`Export ${config.format.toUpperCase()} réussi`, 'success');
      setExportModalOpen(false);
    } catch (error) {
      logger.error('Erreur lors de l\'export', error instanceof Error ? error : undefined, { component: 'AnomalyAnnotationPanel' });
      addToast('Erreur lors de l\'export', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Pagination
  const paginatedUnresolvedAnomalies = useMemo(() => {
    const start = (currentPageAnomalies - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredUnresolvedAnomalies.slice(start, end);
  }, [filteredUnresolvedAnomalies, currentPageAnomalies, itemsPerPage]);

  const paginatedAnnotations = useMemo(() => {
    const start = (currentPageAnnotations - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAnnotations.slice(start, end);
  }, [filteredAnnotations, currentPageAnnotations, itemsPerPage]);

  const totalPagesAnomalies = Math.ceil(filteredUnresolvedAnomalies.length / itemsPerPage);
  const totalPagesAnnotations = Math.ceil(filteredAnnotations.length / itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Header avec Statistiques */}
      <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-200">Anomalies & Annotations</h3>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowAddAnnotation(!showAddAnnotation)}
                className="h-8 text-slate-400 hover:text-slate-200"
                disabled={isAdding}
                aria-label="Ajouter une nouvelle annotation"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Nouvelle annotation
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ajouter une nouvelle annotation</TooltipContent>
          </Tooltip>
        </div>

        {/* Statistiques en temps réel */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard
            label="Total"
            value={stats.total}
            icon={FileWarning}
            color="text-slate-400"
          />
          <StatCard
            label="Non résolues"
            value={stats.unresolved}
            icon={AlertTriangle}
            color={stats.unresolved > 0 ? 'text-amber-400' : 'text-emerald-400'}
            badge={stats.critical > 0 ? `${stats.critical} critiques` : undefined}
          />
          <StatCard
            label="Résolues"
            value={stats.resolved}
            icon={CheckCircle}
            color="text-emerald-400"
          />
          <StatCard
            label="Annotations"
            value={stats.annotations}
            icon={MessageSquare}
            color="text-blue-400"
          />
        </div>

        {/* Recherche, Filtres et Tri */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher dans les anomalies et annotations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-slate-800/50 border-slate-700/50 text-sm"
              />
            </div>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const orders: SortOrder[] = ['date-desc', 'date-asc', 'severity'];
                      const currentIndex = orders.indexOf(sortOrder);
                      setSortOrder(orders[(currentIndex + 1) % orders.length]);
                    }}
                    className="h-9 px-2 text-slate-400 hover:text-slate-200"
                    aria-label="Trier les éléments"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                    {sortOrder === 'date-desc' ? 'Récent' : sortOrder === 'date-asc' ? 'Ancien' : 'Sévérité'}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {sortOrder === 'date-desc' ? 'Tri par date décroissante' : sortOrder === 'date-asc' ? 'Tri par date croissante' : 'Tri par sévérité'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'critical', 'error', 'warning', 'info'] as SeverityFilter[]).map(severity => (
              <Button
                key={severity}
                size="sm"
                variant={severityFilter === severity ? 'default' : 'ghost'}
                onClick={() => setSeverityFilter(severity)}
                className={cn(
                  'h-8 px-2 text-xs',
                  severityFilter === severity
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                )}
              >
                {severity === 'all' ? 'Tous' : severity}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout d'annotation */}
      {showAddAnnotation && (
        <div className="bg-slate-900/60 border border-blue-500/30 rounded-lg p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Nouvelle annotation
            </h4>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddAnnotation(false);
                setAnnotationComment('');
                setSelectedField('');
                setLinkedAnomalyId('');
              }}
              className="h-7 w-7 p-0"
              disabled={isAdding}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Type</label>
              <Select
                value={annotationType}
                onValueChange={(value: string) => setAnnotationType(value as AnnotationType)}
                disabled={isAdding}
              >
                <SelectTrigger className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:ring-2 focus:ring-blue-500/50">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comment">Commentaire</SelectItem>
                  <SelectItem value="correction">Correction</SelectItem>
                  <SelectItem value="approval">Approbation</SelectItem>
                  <SelectItem value="rejection">Rejet</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Champ (optionnel)</label>
              <Select
                value={selectedField || '__all__'}
                onValueChange={(value: string) => setSelectedField(value === '__all__' ? '' : value)}
                disabled={isAdding}
              >
                <SelectTrigger className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:ring-2 focus:ring-blue-500/50">
                  <SelectValue placeholder="Champ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous les champs</SelectItem>
                  {availableFields.map(field => (
                    <SelectItem key={field} value={field}>
                      {field.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {unresolvedAnomalies.length > 0 && (
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Lier à une anomalie (optionnel)</label>
              <Select
                value={linkedAnomalyId || '__none__'}
                onValueChange={(value: string) => setLinkedAnomalyId(value === '__none__' ? '' : value)}
                disabled={isAdding}
              >
                <SelectTrigger className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:ring-2 focus:ring-blue-500/50">
                  <SelectValue placeholder="Anomalie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Aucune</SelectItem>
                  {unresolvedAnomalies.map(anomaly => (
                    <SelectItem key={anomaly.id} value={anomaly.id}>
                      {anomaly.field} - {anomaly.type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">Commentaire *</label>
            <textarea
              ref={textareaRef}
              value={annotationComment}
              onChange={(e) => setAnnotationComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-sm bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
              placeholder="Saisir votre commentaire... (Ctrl+Enter pour sauvegarder)"
              disabled={isAdding}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleAddAnnotation();
                }
              }}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleAddAnnotation}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isAdding || !annotationComment.trim()}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Enregistrer
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAddAnnotation(false);
                setAnnotationComment('');
                setSelectedField('');
                setLinkedAnomalyId('');
              }}
              disabled={isAdding}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      {/* Anomalies non résolues */}
      {unresolvedAnomalies.length > 0 && (
        <Section
          title={
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span>Anomalies actives</span>
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs">
                {filteredUnresolvedAnomalies.length}
              </Badge>
            </div>
          }
          expanded={expandedSections.anomalies}
          onToggle={() => toggleSection('anomalies')}
        >
          <div className="space-y-2">
            {filteredUnresolvedAnomalies.length === 0 ? (
              <EmptyState message="Aucune anomalie ne correspond aux filtres" />
            ) : (
              <>
                {/* Sélection multiple */}
                {filteredUnresolvedAnomalies.length > 0 && (
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-800/50">
                    <Checkbox
                      checked={selectedAnomalyIds.size === filteredUnresolvedAnomalies.length && filteredUnresolvedAnomalies.length > 0}
                      onCheckedChange={handleSelectAllAnomalies}
                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                    <span className="text-xs text-slate-400">
                      {selectedAnomalyIds.size > 0
                        ? `${selectedAnomalyIds.size} sélectionnée(s)`
                        : 'Tout sélectionner'}
                    </span>
                  </div>
                )}
                {paginatedUnresolvedAnomalies.map((anomaly) => (
                  <div key={anomaly.id} className="flex items-start gap-2">
                    <Checkbox
                      checked={selectedAnomalyIds.has(anomaly.id)}
                      onCheckedChange={() => handleToggleAnomalySelection(anomaly.id)}
                      className="mt-3 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <AnomalyCard
                        anomaly={anomaly}
                        onResolve={handleResolveAnomaly}
                        isResolving={resolvingAnomalyId === anomaly.id}
                        onClick={() => {
                          setSelectedAnomalyId(anomaly.id);
                          setDetailModalOpen(true);
                        }}
                        onCopy={handleCopy}
                        copiedId={copiedId}
                      />
                    </div>
                  </div>
                ))}
                {/* Pagination */}
                {totalPagesAnomalies > 1 && (
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        Page {currentPageAnomalies} sur {totalPagesAnomalies}
                      </span>
                      <Select
                        value={String(itemsPerPage)}
                        onValueChange={(value: string) => {
                          setItemsPerPage(Number(value));
                          setCurrentPageAnomalies(1);
                        }}
                      >
                        <SelectTrigger className="w-auto min-w-[100px] text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 par page</SelectItem>
                          <SelectItem value="25">25 par page</SelectItem>
                          <SelectItem value="50">50 par page</SelectItem>
                          <SelectItem value="100">100 par page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCurrentPageAnomalies(prev => Math.max(1, prev - 1))}
                        disabled={currentPageAnomalies === 1}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-xs text-slate-400 px-2">
                        {currentPageAnomalies} / {totalPagesAnomalies}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCurrentPageAnomalies(prev => Math.min(totalPagesAnomalies, prev + 1))}
                        disabled={currentPageAnomalies === totalPagesAnomalies}
                        className="h-7 w-7 p-0"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Section>
      )}

      {/* Anomalies résolues */}
      {resolvedAnomalies.length > 0 && (
        <Section
          title={
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <span>Anomalies résolues</span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                {filteredResolvedAnomalies.length}
              </Badge>
            </div>
          }
          expanded={expandedSections.resolved}
          onToggle={() => toggleSection('resolved')}
        >
          <div className="space-y-2">
            {filteredResolvedAnomalies.map((anomaly) => (
              <ResolvedAnomalyCard key={anomaly.id} anomaly={anomaly} />
            ))}
          </div>
        </Section>
      )}

      {/* Annotations */}
      <Section
        title={
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-400" />
            <span>Annotations</span>
            <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs">
              {filteredAnnotations.length}
            </Badge>
          </div>
        }
        expanded={expandedSections.annotations}
        onToggle={() => toggleSection('annotations')}
      >
        <div className="space-y-3">
          {filteredAnnotations.length === 0 && !showAddAnnotation ? (
            <EmptyState
              icon={MessageSquare}
              message="Aucune annotation pour le moment"
              action={
                <Button
                  size="sm"
                  onClick={() => setShowAddAnnotation(true)}
                  className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Ajouter une annotation
                </Button>
              }
            />
          ) : (
            <>
              {/* Sélection multiple */}
              {filteredAnnotations.length > 0 && (
                <div className="flex items-center gap-2 pb-2 border-b border-slate-800/50">
                  <Checkbox
                    checked={selectedAnnotationIds.size === filteredAnnotations.length && filteredAnnotations.length > 0}
                    onCheckedChange={handleSelectAllAnnotations}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className="text-xs text-slate-400">
                    {selectedAnnotationIds.size > 0
                      ? `${selectedAnnotationIds.size} sélectionnée(s)`
                      : 'Tout sélectionner'}
                  </span>
                </div>
              )}
              {paginatedAnnotations.map((annotation) => (
                <div key={annotation.id} className="flex items-start gap-2">
                  <Checkbox
                    checked={selectedAnnotationIds.has(annotation.id)}
                    onCheckedChange={() => handleToggleAnnotationSelection(annotation.id)}
                    className="mt-3 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <AnnotationCard
                      annotation={annotation}
                      isEditing={editingAnnotationId === annotation.id}
                      editingComment={editingComment}
                      onEditingCommentChange={setEditingComment}
                      onStartEdit={handleStartEdit}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={handleCancelEdit}
                      onDelete={handleDeleteClick}
                      canEdit={!!onUpdateAnnotation}
                      canDelete={!!onDeleteAnnotation}
                      isUpdating={isUpdating && editingAnnotationId === annotation.id}
                      editTextareaRef={editTextareaRef}
                      onCopy={handleCopy}
                      copiedId={copiedId}
                    />
                  </div>
                </div>
              ))}
              {/* Pagination */}
              {totalPagesAnnotations > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      Page {currentPageAnnotations} sur {totalPagesAnnotations}
                    </span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(value: string) => {
                        setItemsPerPage(Number(value));
                        setCurrentPageAnnotations(1);
                      }}
                    >
                      <SelectTrigger className="w-auto min-w-[100px] text-xs bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-300 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 par page</SelectItem>
                        <SelectItem value="25">25 par page</SelectItem>
                        <SelectItem value="50">50 par page</SelectItem>
                        <SelectItem value="100">100 par page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCurrentPageAnnotations(prev => Math.max(1, prev - 1))}
                      disabled={currentPageAnnotations === 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs text-slate-400 px-2">
                      {currentPageAnnotations} / {totalPagesAnnotations}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCurrentPageAnnotations(prev => Math.min(totalPagesAnnotations, prev + 1))}
                      disabled={currentPageAnnotations === totalPagesAnnotations}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Section>

      {/* Modal de confirmation de suppression */}
      <Dialog open={confirmDelete.open} onOpenChange={(open) => !open && setConfirmDelete({ open: false, annotationId: null })}>
        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md">
          <DialogHeader>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-slate-200">
                  Supprimer l'annotation
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-400 mt-1">
                  Cette action est irréversible. L'annotation sera définitivement supprimée.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete({ open: false, annotationId: null })}
              disabled={isDeleting}
              className="border-slate-700 text-slate-400"
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Anomaly Detail Modal */}
      {selectedAnomalyId && (
        <AnomalyDetailModal
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedAnomalyId(null);
          }}
          anomaly={filteredUnresolvedAnomalies.find(a => a.id === selectedAnomalyId) || null}
          anomalies={filteredUnresolvedAnomalies}
          annotations={annotations}
          onResolve={async (anomalyId) => {
            await handleResolveAnomaly(anomalyId);
            // Fermer le modal après résolution
            setDetailModalOpen(false);
            setSelectedAnomalyId(null);
          }}
          isResolving={resolvingAnomalyId === selectedAnomalyId}
          onNavigatePrev={(prevAnomaly) => {
            setSelectedAnomalyId(prevAnomaly.id);
          }}
          onNavigateNext={(nextAnomaly) => {
            setSelectedAnomalyId(nextAnomaly.id);
          }}
        />
      )}

      {/* Annotation Detail Modal */}
      {selectedAnnotationId && (
        <AnnotationDetailModal
          isOpen={annotationDetailModalOpen}
          onClose={() => {
            setAnnotationDetailModalOpen(false);
            setSelectedAnnotationId(null);
          }}
          annotation={annotations.find(a => a.id === selectedAnnotationId) || null}
          annotations={annotations}
        />
      )}

      {/* Batch Actions Bar */}
      <BatchActionsBar
        selectedCount={selectedAnomalyIds.size + selectedAnnotationIds.size}
        selectedAnomalyIds={selectedAnomalyIds}
        selectedAnnotationIds={selectedAnnotationIds}
        onResolveSelected={handleBulkResolve}
        onExportSelected={handleExportSelected}
        onDeleteSelected={handleBulkDelete}
        onClear={handleClearSelection}
        isResolving={isBulkResolving}
        isExporting={isExporting}
        isDeleting={isBulkDeleting}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        filteredCount={filteredUnresolvedAnomalies.length + filteredAnnotations.length}
        selectedAnomalyCount={selectedAnomalyIds.size}
        selectedAnnotationCount={selectedAnnotationIds.size}
        hasFilters={severityFilter !== 'all' || searchQuery.length > 0}
      />
    </div>
  );
}

// Composants auxiliaires

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  badge,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: string;
}) {
  return (
    <div className="bg-slate-800/40 rounded-lg p-3 border border-slate-700/30">
      <div className="flex items-center justify-between mb-1">
        <Icon className={cn('h-4 w-4', color)} />
        {badge && (
          <span className="text-[10px] text-slate-400">{badge}</span>
        )}
      </div>
      <div className={cn('text-lg font-bold', color)}>{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}

function Section({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
          {title}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {expanded && (
        <div className="px-4 py-3 border-t border-slate-800/50 animate-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
}

function AnomalyCard({
  anomaly,
  onResolve,
  isResolving,
  onClick,
  onCopy,
  copiedId,
}: {
  anomaly: DocumentAnomaly;
  onResolve: (id: string) => void;
  isResolving: boolean;
  onClick?: () => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const isCopied = copiedId === `anomaly-${anomaly.id}`;
  const severityColors = {
    critical: 'border-red-500/30 bg-red-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    warning: 'border-amber-500/30 bg-amber-500/10',
    info: 'border-blue-500/30 bg-blue-500/10',
  };

  return (
    <div 
      className={cn(
        'p-3 rounded-lg border transition-all hover:border-opacity-60',
        severityColors[anomaly.severity],
        onClick && 'cursor-pointer hover:scale-[1.01]'
      )}
      onClick={(e) => {
        // Ne pas ouvrir le modal si on clique sur le bouton Résoudre
        if ((e.target as HTMLElement).closest('button')) return;
        onClick?.();
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge
              className={cn(
                'text-[10px] font-medium border',
                anomaly.severity === 'critical' || anomaly.severity === 'error'
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : anomaly.severity === 'warning'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              )}
            >
              {anomaly.severity}
            </Badge>
            {anomaly.field && (
              <span className="text-xs text-slate-400">{anomaly.field}</span>
            )}
            <Badge className="text-[10px] bg-slate-800/50 text-slate-400 border border-slate-700/50">
              {anomaly.type.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-sm text-slate-200 mb-1.5 leading-relaxed">{anomaly.message}</p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(anomaly.detectedAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onCopy(anomaly.message, `anomaly-${anomaly.id}`)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                aria-label="Copier le message"
              >
                {isCopied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isCopied ? 'Copié !' : 'Copier le message'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                onClick={() => onResolve(anomaly.id)}
                className="h-8 bg-emerald-600 hover:bg-emerald-700"
                disabled={isResolving}
                aria-label="Marquer comme résolu"
              >
                {isResolving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                    Résoudre
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Marquer cette anomalie comme résolue</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

function ResolvedAnomalyCard({ anomaly }: { anomaly: DocumentAnomaly }) {
  return (
    <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-300 line-through">{anomaly.message}</p>
          {anomaly.resolvedAt && anomaly.resolvedBy && (
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <CheckCircle className="h-3 w-3 text-emerald-400" />
              Résolu le {new Date(anomaly.resolvedAt).toLocaleDateString('fr-FR')} par {anomaly.resolvedBy}
            </div>
          )}
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs flex-shrink-0">
          Résolu
        </Badge>
      </div>
    </div>
  );
}

function AnnotationCard({
  annotation,
  isEditing,
  editingComment,
  onEditingCommentChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  canEdit,
  canDelete,
  isUpdating,
  editTextareaRef,
  onCopy,
  copiedId,
}: {
  annotation: DocumentAnnotation;
  isEditing: boolean;
  editingComment: string;
  onEditingCommentChange: (value: string) => void;
  onStartEdit: (annotation: DocumentAnnotation) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  isUpdating: boolean;
  editTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
}) {
  const isCopied = copiedId === `annotation-${annotation.id}`;
  const typeColors = {
    comment: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    correction: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    approval: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejection: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div
      className={cn(
        'p-4 rounded-lg border border-slate-700/30 bg-slate-800/30 transition-all',
        'hover:border-slate-700/50 hover:bg-slate-800/40'
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn('text-[10px] font-medium border', typeColors[annotation.type || 'comment'])}>
            {annotation.type || 'comment'}
          </Badge>
          {annotation.field && (
            <span className="text-xs text-slate-400">
              Champ: {annotation.field.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        {(canEdit || canDelete) && !isEditing && (
          <div className="flex gap-1 flex-shrink-0">
            {canEdit && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onStartEdit(annotation)}
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(annotation.id)}
                className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            ref={editTextareaRef}
            value={editingComment}
            onChange={(e) => onEditingCommentChange(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm bg-slate-900/50 border border-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
            disabled={isUpdating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                onSaveEdit();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                onCancelEdit();
              }
            }}
          />
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={onSaveEdit} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isUpdating || !editingComment.trim()}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Enregistrer
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={onCancelEdit}
              disabled={isUpdating}
            >
              Annuler
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-200 leading-relaxed mb-2">{annotation.comment}</p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {annotation.createdBy}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(annotation.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon = Info,
  message,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-400 mb-3">{message}</p>
      {action}
    </div>
  );
}
