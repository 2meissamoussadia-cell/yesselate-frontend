/**
 * Page : Historique > Historique des validations
 */

'use client';

import React, { useState } from 'react';
import { useValidationData, useValidationFilters } from '../../hooks';
import { DocumentCard, DocumentDetailsModal } from '../../components';
import type { DocumentValidation } from '../../types/validationTypes';
import { CheckCircle2, Calendar } from 'lucide-react';

export function HistoriqueValidationsPage() {
  const { filtres } = useValidationFilters();
  const { data: documents, isLoading, error } = useValidationData({
    ...filtres,
    statuts: ['VALIDE'],
  });

  const [selectedDocument, setSelectedDocument] = useState<DocumentValidation | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Trier par date de validation (plus récent en premier)
  const sortedDocuments = documents
    ? [...documents].sort((a, b) => {
        const dateA = a.dateValidation ? new Date(a.dateValidation).getTime() : 0;
        const dateB = b.dateValidation ? new Date(b.dateValidation).getTime() : 0;
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
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-slate-200">Historique des validations</h2>
        </div>
        <p className="text-sm text-slate-400">
          Historique complet des documents validés ({sortedDocuments.length})
        </p>
      </div>

      {sortedDocuments.length > 0 ? (
        <div className="space-y-4">
          {sortedDocuments.map((doc) => (
            <div key={doc.id} className="relative">
              {doc.dateValidation && (
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Validé le {new Date(doc.dateValidation).toLocaleDateString('fr-FR', {
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
              <DocumentCard document={doc} onView={handleView} />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 rounded-lg border border-slate-700/50 bg-slate-800/30 text-center">
          <div className="text-slate-400">Aucun document validé dans l'historique</div>
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

