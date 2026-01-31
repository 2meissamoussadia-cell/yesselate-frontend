/**
 * Page : Historique > Historique des rejets
 */

'use client';

import React, { useState } from 'react';
import { useValidationData, useValidationFilters } from '../../hooks';
import { DocumentCard, DocumentDetailsModal } from '../../components';
import type { DocumentValidation } from '../../types/validationTypes';
import { XCircle, Calendar } from 'lucide-react';

export function HistoriqueRejetsPage() {
  const { filtres } = useValidationFilters();
  const { data: documents, isLoading, error } = useValidationData({
    ...filtres,
    statuts: ['REJETE'],
  });

  const [selectedDocument, setSelectedDocument] = useState<DocumentValidation | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Trier par date de rejet (plus récent en premier)
  const sortedDocuments = documents
    ? [...documents].sort((a, b) => {
        const dateA = a.dateRejet ? new Date(a.dateRejet).getTime() : 0;
        const dateB = b.dateRejet ? new Date(b.dateRejet).getTime() : 0;
        return dateB - dateA;
      })
    : [];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-slate-400">Chargement de l'historique...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-400">Erreur lors du chargement</div>
      </div>
    );
  }

  const handleView = (id: string) => {
    const doc = sortedDocuments.find((d) => d.id === id);
    if (doc) {
      setSelectedDocument(doc);
      setDetailsModalOpen(true);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <XCircle className="h-5 w-5 text-red-400" />
          <h2 className="text-lg font-semibold text-slate-200">Historique des rejets</h2>
        </div>
        <p className="text-sm text-slate-400">
          Historique complet des documents rejetés ({sortedDocuments.length})
        </p>
      </div>

      {sortedDocuments.length > 0 ? (
        <div className="space-y-4">
          {sortedDocuments.map((doc) => (
            <div key={doc.id} className="relative">
              {doc.dateRejet && (
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Rejeté le {new Date(doc.dateRejet).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {doc.validateur && (
                    <>
                      <span>•</span>
                      <span>par {doc.validateur}</span>
                    </>
                  )}
                </div>
              )}
              {doc.commentaire && (
                <div className="text-xs text-red-400 mb-2 bg-red-500/10 border border-red-500/30 rounded p-2">
                  <span className="font-medium">Raison du rejet:</span> {doc.commentaire}
                </div>
              )}
              <DocumentCard document={doc} onView={handleView} />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
          <div className="text-slate-400">Aucun document rejeté dans l'historique</div>
        </div>
      )}

      {/* Modal de détails */}
      {selectedDocument && (
        <DocumentDetailsModal
          open={detailsModalOpen}
          document={selectedDocument}
          onClose={() => {
            setDetailsModalOpen(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
}

