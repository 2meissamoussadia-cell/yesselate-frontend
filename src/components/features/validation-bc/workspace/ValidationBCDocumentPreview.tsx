'use client';

import { useState, useCallback } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/utils';
import { 
  FileText, Download, ExternalLink, Eye, ZoomIn, ZoomOut,
  RotateCw, Printer, Share2, Check, X, Maximize2, ChevronLeft, ChevronRight,
  File, FileImage, FileSpreadsheet, Archive, FileCheck, AlertTriangle,
  Clock, User, Calendar
} from 'lucide-react';

// ============================================
// Types
// ============================================
export interface DocumentPiece {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'word' | 'image' | 'archive' | 'other';
  url?: string;
  size?: string;
  date: string;
  uploadedBy?: string;
  status: 'verified' | 'pending' | 'rejected' | 'missing';
  required: boolean;
  category: 'bon_commande' | 'facture' | 'devis' | 'justificatif' | 'avenant' | 'autre';
  comment?: string;
}

interface ValidationBCDocumentPreviewProps {
  documents: DocumentPiece[];
  readOnly?: boolean;
  onVerify?: (id: string, verified: boolean, comment?: string) => void;
  onRequestDocument?: (category: string, message: string) => void;
}

// ============================================
// Constants
// ============================================
const DOC_ICONS = {
  pdf: { icon: FileText, color: 'text-red-500' },
  excel: { icon: FileSpreadsheet, color: 'text-emerald-500' },
  word: { icon: File, color: 'text-blue-500' },
  image: { icon: FileImage, color: 'text-purple-500' },
  archive: { icon: Archive, color: 'text-amber-500' },
  other: { icon: File, color: 'text-slate-400' },
};

const STATUS_CONFIG = {
  verified: { 
    label: 'Vérifié', 
    bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: Check
  },
  pending: { 
    label: 'En attente', 
    bg: 'bg-amber-50 dark:bg-amber-950/30', 
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    icon: Clock
  },
  rejected: { 
    label: 'Rejeté', 
    bg: 'bg-red-50 dark:bg-red-950/30', 
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
    icon: X
  },
  missing: { 
    label: 'Manquant', 
    bg: 'bg-slate-50 dark:bg-slate-900/30', 
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-dashed border-slate-300 dark:border-slate-700',
    icon: AlertTriangle
  },
};

const CATEGORY_LABELS = {
  bon_commande: 'Bon de commande',
  facture: 'Facture',
  devis: 'Devis',
  justificatif: 'Pièce justificative',
  avenant: 'Avenant',
  autre: 'Autre document',
};

// ============================================
// Component
// ============================================
export function ValidationBCDocumentPreview({
  documents,
  readOnly = false,
  onVerify,
  onRequestDocument,
}: ValidationBCDocumentPreviewProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentPiece | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState('');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestCategory, setRequestCategory] = useState<string>('justificatif');
  const [requestMessage, setRequestMessage] = useState('');

  const getDocIcon = useCallback((type: DocumentPiece['type']) => {
    const config = DOC_ICONS[type];
    const Icon = config.icon;
    return <Icon className={cn('w-5 h-5', config.color)} />;
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => { setZoom(100); setRotation(0); };

  const handleVerify = (verified: boolean) => {
    if (!selectedDoc) return;
    if (!verified) {
      setRejectModalOpen(true);
    } else {
      onVerify?.(selectedDoc.id, true);
      setSelectedDoc(null);
    }
  };

  const handleRejectConfirm = () => {
    if (!selectedDoc) return;
    onVerify?.(selectedDoc.id, false, rejectComment);
    setRejectModalOpen(false);
    setRejectComment('');
    setSelectedDoc(null);
  };

  const handleRequestSubmit = () => {
    onRequestDocument?.(requestCategory, requestMessage);
    setRequestModalOpen(false);
    setRequestCategory('justificatif');
    setRequestMessage('');
  };

  // Navigate between documents
  const currentIndex = selectedDoc ? documents.findIndex(d => d.id === selectedDoc.id) : -1;
  const goToPrev = () => {
    if (currentIndex > 0) {
      setSelectedDoc(documents[currentIndex - 1]);
      handleReset();
    }
  };
  const goToNext = () => {
    if (currentIndex < documents.length - 1) {
      setSelectedDoc(documents[currentIndex + 1]);
      handleReset();
    }
  };

  // Group by status
  const groupedDocs = {
    verified: documents.filter(d => d.status === 'verified'),
    pending: documents.filter(d => d.status === 'pending'),
    rejected: documents.filter(d => d.status === 'rejected'),
    missing: documents.filter(d => d.status === 'missing'),
  };

  const totalRequired = documents.filter(d => d.required).length;
  const verifiedRequired = documents.filter(d => d.required && d.status === 'verified').length;

  if (documents.length === 0) {
    return (
      <div className="p-8 text-center rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800">
        <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p className="text-slate-400">Aucun document joint</p>
        {!readOnly && onRequestDocument && (
          <button
            onClick={() => setRequestModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
          >
            Demander un document
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-blue-500" />
            <span className="font-medium">{documents.length} document{documents.length > 1 ? 's' : ''}</span>
          </div>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
          <div className="flex items-center gap-3">
            {groupedDocs.verified.length > 0 && (
              <span className="flex items-center gap-1 text-sm text-emerald-600">
                <Check className="w-4 h-4" /> {groupedDocs.verified.length}
              </span>
            )}
            {groupedDocs.pending.length > 0 && (
              <span className="flex items-center gap-1 text-sm text-amber-600">
                <Clock className="w-4 h-4" /> {groupedDocs.pending.length}
              </span>
            )}
            {groupedDocs.rejected.length > 0 && (
              <span className="flex items-center gap-1 text-sm text-red-600">
                <X className="w-4 h-4" /> {groupedDocs.rejected.length}
              </span>
            )}
            {groupedDocs.missing.length > 0 && (
              <span className="flex items-center gap-1 text-sm text-slate-400">
                <AlertTriangle className="w-4 h-4" /> {groupedDocs.missing.length}
              </span>
            )}
          </div>
        </div>
        
        {totalRequired > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Pièces obligatoires :</span>
            <span className={cn(
              'px-2 py-0.5 rounded text-sm font-medium',
              verifiedRequired === totalRequired 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
            )}>
              {verifiedRequired}/{totalRequired}
            </span>
          </div>
        )}
      </div>

      {/* Documents grouped by category */}
      {(['bon_commande', 'facture', 'devis', 'justificatif', 'avenant', 'autre'] as const).map(category => {
        const catDocs = documents.filter(d => d.category === category);
        if (catDocs.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="grid gap-3">
              {catDocs.map(doc => {
                const statusConfig = STATUS_CONFIG[doc.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={doc.id}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer',
                      statusConfig.bg,
                      statusConfig.border,
                      'hover:shadow-md'
                    )}
                    onClick={() => doc.status !== 'missing' && setSelectedDoc(doc)}
                  >
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                      {getDocIcon(doc.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{doc.name}</span>
                        {doc.required && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            Obligatoire
                          </span>
                        )}
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                          statusConfig.bg, statusConfig.text
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {doc.date}
                        </span>
                        {doc.size && <span>{doc.size}</span>}
                        {doc.uploadedBy && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {doc.uploadedBy}
                          </span>
                        )}
                      </div>
                      {doc.comment && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 italic">
                          « {doc.comment} »
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {doc.status !== 'missing' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
                            className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            title="Prévisualiser"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            title="Télécharger"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Request document button */}
      {!readOnly && onRequestDocument && (
        <button
          onClick={() => setRequestModalOpen(true)}
          className="w-full p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 
                     text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors
                     flex items-center justify-center gap-2"
        >
          <AlertTriangle className="w-4 h-4" />
          Demander une pièce justificative
        </button>
      )}

      {/* Preview Modal */}
      <FluentModal
        open={!!selectedDoc && !rejectModalOpen}
        title={selectedDoc?.name || 'Document'}
        onClose={() => { setSelectedDoc(null); handleReset(); }}
        size="full"
      >
        {selectedDoc && (
          <div className="flex flex-col h-[80vh]">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                {/* Navigation */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={goToPrev}
                    disabled={currentIndex <= 0}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    title="Document précédent"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-slate-400 px-2">
                    {currentIndex + 1} / {documents.length}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={currentIndex >= documents.length - 1}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                    title="Document suivant"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

                {/* Zoom controls */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <button onClick={handleZoomOut} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded" title="Zoom -">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-sm font-mono w-14 text-center">{zoom}%</span>
                  <button onClick={handleZoomIn} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded" title="Zoom +">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleRotate}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  title="Pivoter 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Réinitialiser
                </button>
              </div>

              <div className="flex items-center gap-2">
                {(() => {
                  const sc = STATUS_CONFIG[selectedDoc.status];
                  const SI = sc.icon;
                  return (
                    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded text-sm', sc.bg, sc.text)}>
                      <SI className="w-4 h-4" />
                      {sc.label}
                    </span>
                  );
                })()}

                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Imprimer">
                  <Printer className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Télécharger">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Ouvrir">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview area */}
            <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 p-8">
              <div 
                className="flex items-center justify-center min-h-full transition-transform duration-200"
                style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)` }}
              >
                <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-lg p-8 min-w-[600px] min-h-[800px] flex items-center justify-center">
                  <div className="text-center">
                    {getDocIcon(selectedDoc.type)}
                    <div className="mt-4 text-lg font-semibold">{selectedDoc.name}</div>
                    <div className="mt-2 text-slate-400 capitalize">{selectedDoc.type}</div>
                    <div className="mt-1 text-sm text-slate-400">{selectedDoc.size || 'Taille inconnue'}</div>
                    
                    <div className="mt-8 p-6 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                      <p className="text-sm text-slate-400">🔍 Prévisualisation simulée</p>
                      <p className="text-xs text-slate-400 mt-2">
                        En production, le contenu réel du document serait affiché ici.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation actions */}
            {!readOnly && onVerify && selectedDoc.status === 'pending' && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Vérification du document</p>
                    <p className="text-sm text-slate-400">
                      Confirmez que ce document est valide et conforme
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVerify(false)}
                      className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Rejeter
                    </button>
                    <button
                      onClick={() => handleVerify(true)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Valider le document
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </FluentModal>

      {/* Reject Modal */}
      <FluentModal
        open={rejectModalOpen}
        title="Rejeter le document"
        onClose={() => { setRejectModalOpen(false); setRejectComment(''); }}
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">
              Vous allez rejeter le document « <strong>{selectedDoc?.name}</strong> ».
              Cette action nécessite un motif de rejet.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Motif du rejet *</label>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="w-full min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm focus:ring-2 focus:ring-red-500/30 outline-none"
              placeholder="Ex: Document illisible, montant incorrect, date expirée..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setRejectModalOpen(false); setRejectComment(''); }}
              className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleRejectConfirm}
              disabled={rejectComment.trim().length < 10}
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Confirmer le rejet
            </button>
          </div>
        </div>
      </FluentModal>

      {/* Request Document Modal */}
      <FluentModal
        open={requestModalOpen}
        title="Demander une pièce justificative"
        onClose={() => { setRequestModalOpen(false); setRequestMessage(''); }}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Type de document</label>
            <select
              value={requestCategory}
              onChange={(e) => setRequestCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm outline-none"
            >
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message de demande *</label>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="w-full min-h-[120px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
              placeholder="Ex: Veuillez fournir le devis original signé avec le cachet du fournisseur..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setRequestModalOpen(false); setRequestMessage(''); }}
              className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleRequestSubmit}
              disabled={requestMessage.trim().length < 10}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Envoyer la demande
            </button>
          </div>
        </div>
      </FluentModal>
    </div>
  );
}

