/**
 * Composant générique de liste de documents pour Validation-BC
 * Affiche une table avec pagination, tri et actions
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  getDocuments,
  type ValidationDocument,
  type DocumentsListResponse,
} from '@/lib/services/validation-bc-api';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  Info,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ValidationModal } from '@/components/features/validation-bc/modals';
import type { ValidationAction, ValidationData } from '@/components/features/validation-bc/modals';
import { ValidationBCDetailModal, useValidationBCListNavigation } from '@/components/features/validation-bc/workspace';

interface ValidationBCDocumentsListProps {
  filters?: {
    queue?: string;
    bureau?: string;
    type?: string;
    status?: string;
    urgent?: boolean;
  };
  onDocumentClick?: (doc: ValidationDocument) => void;
  onValidate?: (doc: ValidationDocument) => void;
  onReject?: (doc: ValidationDocument) => void;
  emptyMessage?: string;
}

export function ValidationBCDocumentsList({
  filters = {},
  onDocumentClick,
  onValidate,
  onReject,
  emptyMessage = 'Aucun document trouvé',
}: ValidationBCDocumentsListProps) {
  const [data, setData] = useState<DocumentsListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  // Navigation et modals
  const documentsList = data?.items || [];
  const {
    selectedId,
    handleOpen,
    handleClose,
    handleNext,
    handlePrevious,
  } = useValidationBCListNavigation(documentsList);

  const selectedDocument = documentsList.find((d) => d.id === selectedId) || null;
  
  const [validationAction, setValidationAction] = useState<ValidationAction | null>(null);
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [documentForValidation, setDocumentForValidation] = useState<ValidationDocument | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getDocuments({
        ...filters,
        limit: pageSize,
        offset: page * pageSize,
      });
      setData(response);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    setPage(0); // Reset page when filters change
  }, [filters]);

  // Handlers pour les modals
  const handleDocumentClick = (doc: ValidationDocument) => {
    handleOpen(doc.id);
    onDocumentClick?.(doc);
  };

  const handleValidate = (doc: ValidationDocument) => {
    setDocumentForValidation(doc);
    setValidationAction('validate');
    setValidationModalOpen(true);
    handleClose(); // Close detail modal to show validation modal
    onValidate?.(doc);
  };

  const handleReject = (doc: ValidationDocument) => {
    setDocumentForValidation(doc);
    setValidationAction('reject');
    setValidationModalOpen(true);
    handleClose(); // Close detail modal to show validation modal
    onReject?.(doc);
  };

  const handleRequestInfo = (doc: ValidationDocument) => {
    setDocumentForValidation(doc);
    setValidationAction('request_info');
    setValidationModalOpen(true);
    handleClose(); // Close detail modal to show validation modal
  };

  const handleValidationConfirm = async (data: ValidationData) => {
    if (!documentForValidation) return;

    try {
      // Appel API selon l'action
      if (data.action === 'validate') {
        await fetch(`/api/validation-bc/documents/${documentForValidation.id}/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else if (data.action === 'reject') {
        await fetch(`/api/validation-bc/documents/${documentForValidation.id}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } else if (data.action === 'request_info') {
        await fetch(`/api/validation-bc/documents/${documentForValidation.id}/request-info`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      }

      // Recharger la liste
      await loadDocuments();

      // Fermer les modals
      setValidationModalOpen(false);
      setValidationAction(null);
      setDocumentForValidation(null);

      // Log success
      console.log('Action effectuée avec succès:', data.action);
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    }
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(montant);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: ValidationDocument['status']) => {
    const config = {
      pending: {
        label: 'En attente',
        className: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        icon: Clock,
      },
      validated: {
        label: 'Validé',
        className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        icon: CheckCircle,
      },
      rejected: {
        label: 'Rejeté',
        className: 'bg-red-500/10 text-red-400 border-red-500/30',
        icon: XCircle,
      },
      anomaly: {
        label: 'Anomalie',
        className: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        icon: AlertTriangle,
      },
    };

    const { label, className, icon: Icon } = config[status];

    return (
      <Badge variant="outline" className={cn('flex items-center gap-1', className)}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  const getTypeBadge = (type: ValidationDocument['type']) => {
    const config = {
      bc: { label: 'BC', className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
      facture: { label: 'Facture', className: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
      avenant: { label: 'Avenant', className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
    };

    const { label, className } = config[type];

    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    );
  };

  if (loading && !data) {
    return <DocumentsListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <AlertTriangle className="h-12 w-12 text-red-400" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            Erreur de chargement
          </h3>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button onClick={loadDocuments} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <FileText className="h-12 w-12 text-slate-600" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-200 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-slate-400">
            Aucun document ne correspond aux critères sélectionnés.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(data.total / pageSize);
  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, data.total);

  return (
    <>
      <div className="space-y-4">
        {/* Table */}
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50 hover:bg-slate-800/40">
              <TableHead className="text-slate-300">Document</TableHead>
              <TableHead className="text-slate-300">Fournisseur</TableHead>
              <TableHead className="text-slate-300">Bureau</TableHead>
              <TableHead className="text-slate-300 text-right">Montant</TableHead>
              <TableHead className="text-slate-300">Statut</TableHead>
              <TableHead className="text-slate-300">Date</TableHead>
              <TableHead className="text-slate-300 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((doc) => (
              <TableRow
                key={doc.id}
                className="border-slate-700/50 hover:bg-slate-800/40 transition-colors cursor-pointer"
                onClick={() => handleDocumentClick(doc)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200">{doc.id}</span>
                        {getTypeBadge(doc.type)}
                        {doc.urgent && (
                          <Badge
                            variant="outline"
                            className="bg-red-500/10 text-red-400 border-red-500/30 animate-pulse"
                          >
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 truncate max-w-xs">
                        {doc.objet}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-slate-300">{doc.fournisseur}</span>
                </TableCell>
                <TableCell>
                  <span className="text-slate-400 text-sm">{doc.bureau}</span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium text-slate-200">
                    {formatMontant(doc.montantTTC)}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(doc.status)}</TableCell>
                <TableCell>
                  <span className="text-slate-400 text-sm">
                    {formatDate(doc.dateEmission)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        onClick={(e) => e.stopPropagation()}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDocumentClick(doc);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Voir détails
                      </DropdownMenuItem>
                      {doc.status === 'pending' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleValidate(doc);
                            }}
                            className="text-emerald-400"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Valider
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(doc);
                            }}
                            className="text-red-400"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rejeter
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRequestInfo(doc);
                            }}
                            className="text-amber-400"
                          >
                            <Info className="h-4 w-4 mr-2" />
                            Demander infos
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-slate-400">
          Affichage de {startItem} à {endItem} sur {data.total} documents
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="h-8"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Précédent
          </Button>
          <div className="text-sm text-slate-400">
            Page {page + 1} sur {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="h-8"
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>

    {/* Detail Modal with Navigation */}
    <ValidationBCDetailModal
      documents={documentsList}
      selectedId={selectedId}
      onClose={handleClose}
      onPrevious={handlePrevious}
      onNext={handleNext}
      onValidate={(doc) => {
        handleClose();
        setValidationAction('validate');
        setValidationModalOpen(true);
        onValidate?.(doc);
      }}
      onReject={(doc) => {
        handleClose();
        setValidationAction('reject');
        setValidationModalOpen(true);
        onReject?.(doc);
      }}
      onRequestInfo={(doc) => {
        handleClose();
        setValidationAction('request_info');
        setValidationModalOpen(true);
      }}
    />

    {documentForValidation && (
      <ValidationModal
        document={documentForValidation}
        action={validationAction}
        isOpen={validationModalOpen}
        onClose={() => {
          setValidationModalOpen(false);
          setValidationAction(null);
          setDocumentForValidation(null);
        }}
        onConfirm={handleValidationConfirm}
      />
    )}
  </>
  );
}

function DocumentsListSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/40 overflow-hidden">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-4 bg-slate-700 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-1/4" />
                <div className="h-3 bg-slate-800 rounded w-1/2" />
              </div>
              <div className="h-4 bg-slate-700 rounded w-20" />
              <div className="h-4 bg-slate-700 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

