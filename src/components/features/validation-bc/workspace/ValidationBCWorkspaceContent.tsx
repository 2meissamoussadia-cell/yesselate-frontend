'use client';

import React, { useState, useEffect } from 'react';
import { useValidationBCWorkspaceStore } from '@/lib/stores/validationBCWorkspaceStore';
import { getDocuments, getDocumentById, validateDocument, rejectDocument } from '@/lib/services/validation-bc-api';
import type { ValidationDocument } from '@/lib/services/validation-bc-api';
import { FileText, Loader2, AlertCircle, CheckCircle, XCircle, Clock, Package, FileSpreadsheet, FileEdit, Eye, Download, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ValidationBCDocumentView } from './ValidationBCDocumentView';

// Composant Inbox: liste des documents
function InboxContent({ queue }: { queue: string }) {
  const [documents, setDocuments] = useState<ValidationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { openTab } = useValidationBCWorkspaceStore();

  useEffect(() => {
    async function loadDocuments() {
      try {
        setLoading(true);
        setError(null);
        const response = await getDocuments({ queue, limit: 50 });
        setDocuments(response.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }

    loadDocuments();
  }, [queue]);

  const handleOpenDocument = (doc: ValidationDocument) => {
    openTab({
      id: `document:${doc.type}:${doc.id}`,
      type: doc.type,
      title: doc.id,
      icon: doc.type === 'bc' ? '📄' : doc.type === 'facture' ? '🧾' : '📝',
      data: { documentId: doc.id, type: doc.type },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-12 h-12 mb-3" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <FileText className="w-16 h-16 mb-3 opacity-30" />
        <p className="text-lg font-medium">Aucun document</p>
        <p className="text-sm">Cette file est vide</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card
          key={doc.id}
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-purple-300 dark:hover:border-purple-700"
          onClick={() => handleOpenDocument(doc)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {doc.type === 'bc' && <Package className="w-5 h-5 text-blue-500" />}
                {doc.type === 'facture' && <FileSpreadsheet className="w-5 h-5 text-green-500" />}
                {doc.type === 'avenant' && <FileEdit className="w-5 h-5 text-orange-500" />}
                <CardTitle className="text-base">{doc.id}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {doc.urgent && (
                  <Badge variant="destructive" className="text-xs">
                    URGENT
                  </Badge>
                )}
                {doc.status === 'pending' && (
                  <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-300">
                    <Clock className="w-3 h-3 mr-1" />
                    En attente
                  </Badge>
                )}
                {doc.status === 'validated' && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Validé
                  </Badge>
                )}
                {doc.status === 'rejected' && (
                  <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-300">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejeté
                  </Badge>
                )}
                {doc.status === 'anomaly' && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Anomalie
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{doc.objet}</p>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{doc.fournisseur}</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(doc.montantTTC)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{doc.bureau}</span>
              <span>{new Date(doc.dateEmission).toLocaleDateString('fr-FR')}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Composant Document: détails d'un document
function DocumentContent({ documentId }: { documentId: string }) {
  const [document, setDocument] = useState<ValidationDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [comment, setComment] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    async function loadDocument() {
      try {
        setLoading(true);
        setError(null);
        const doc = await getDocumentById(documentId);
        setDocument(doc);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    }

    loadDocument();
  }, [documentId]);

  const handleValidate = async () => {
    if (!document) return;
    try {
      setValidating(true);
      await validateDocument(document.id, { comment: comment || undefined });
      // Recharger le document
      const updated = await getDocumentById(documentId);
      setDocument(updated);
      setComment('');
    } catch (err) {
      alert('Erreur de validation: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setValidating(false);
    }
  };

  const handleReject = async () => {
    if (!document || !rejectReason) return;
    try {
      setRejecting(true);
      await rejectDocument(document.id, { reason: rejectReason, comment: comment || undefined });
      // Recharger le document
      const updated = await getDocumentById(documentId);
      setDocument(updated);
      setComment('');
      setRejectReason('');
    } catch (err) {
      alert('Erreur de rejet: ' + (err instanceof Error ? err.message : 'Erreur inconnue'));
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-12 h-12 mb-3" />
        <p className="font-medium">{error || 'Document non trouvé'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{document.id}</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                {document.type === 'bc' ? 'Bon de commande' : document.type === 'facture' ? 'Facture' : 'Avenant'}
              </p>
            </div>
            <div className="flex gap-2">
              {document.status === 'pending' && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                  En attente
                </Badge>
              )}
              {document.status === 'validated' && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  Validé
                </Badge>
              )}
              {document.status === 'rejected' && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                  Rejeté
                </Badge>
              )}
              {document.urgent && (
                <Badge variant="destructive">URGENT</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 uppercase">Fournisseur</label>
              <p className="font-medium">{document.fournisseur}</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase">Bureau</label>
              <p className="font-medium">{document.bureau}</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-400 uppercase">Objet</label>
              <p className="font-medium">{document.objet}</p>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase">Montant HT</label>
              <p className="font-medium text-lg">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(document.montantHT)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-400 uppercase">Montant TTC</label>
              <p className="font-medium text-lg text-purple-600">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(document.montantTTC)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions de validation */}
      {document.status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actions de validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Commentaire (optionnel)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ajoutez un commentaire..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleValidate}
                disabled={validating || rejecting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {validating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Valider
              </Button>
              <Button
                onClick={() => {
                  const reason = prompt('Raison du rejet:');
                  if (reason) {
                    setRejectReason(reason);
                    handleReject();
                  }
                }}
                disabled={validating || rejecting}
                variant="destructive"
                className="flex-1"
              >
                {rejecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
                Rejeter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {document.timeline && document.timeline.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historique</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {document.timeline.map((event) => (
                <div key={event.id} className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">{event.action}</p>
                    <p className="text-xs text-slate-400">
                      {event.actorName} • {new Date(event.timestamp).toLocaleString('fr-FR')}
                    </p>
                    {event.details && <p className="text-xs text-slate-600 mt-1">{event.details}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function ValidationBCWorkspaceContent() {
  const { tabs, activeTabId } = useValidationBCWorkspaceStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-slate-400">
        <FileText className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg font-medium">Aucun onglet sélectionné</p>
        <p className="text-sm">Ouvrez un BC, une facture ou un avenant pour commencer</p>
      </div>
    );
  }

  // Render content based on tab type
  if (activeTab.type === 'inbox') {
    const queue = activeTab.data?.queue || 'all';
    return <InboxContent queue={queue} />;
  }

  if (activeTab.type === 'bc' || activeTab.type === 'facture' || activeTab.type === 'avenant') {
    const documentId = activeTab.data?.documentId || activeTab.id.split(':').pop() || '';
    const documentType = activeTab.type as 'bc' | 'facture' | 'avenant';
    if (!documentId) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-red-500">
          <AlertCircle className="w-12 h-12 mb-3" />
          <p className="font-medium">ID de document manquant</p>
        </div>
      );
    }
    // Utiliser le nouveau composant ValidationBCDocumentView avec données mockées
    return <ValidationBCDocumentView documentId={documentId} documentType={documentType} />;
  }

  // Type d'onglet non reconnu
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
        <h3 className="text-lg font-semibold mb-2">{activeTab.title}</h3>
        <p className="text-sm text-slate-400">Type: {activeTab.type}</p>
        {activeTab.data && (
          <pre className="mt-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-xs overflow-auto">
            {JSON.stringify(activeTab.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
