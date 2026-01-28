'use client';

import { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  FileText, Download, ExternalLink, Eye, ZoomIn, ZoomOut,
  RotateCw, Printer, Share2, Check, X, Maximize2,
  File, FileImage, FileSpreadsheet, Archive
} from 'lucide-react';

type Document = {
  id: string;
  name: string;
  type: string;
  url?: string;
  size?: string;
  date: string;
  uploadedBy?: string;
  status?: 'verified' | 'pending' | 'rejected';
};

type Props = {
  documents: Document[];
  onVerify?: (id: string, verified: boolean) => void;
};

export function RHDocumentPreview({ documents, onVerify }: Props) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const getDocIcon = (type: string) => {
    if (type.includes('image') || type.includes('photo') || type.includes('scan')) {
      return <FileImage className="w-5 h-5 text-purple-500" />;
    }
    if (type.includes('excel') || type.includes('spreadsheet') || type.includes('csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    if (type.includes('archive') || type.includes('zip')) {
      return <Archive className="w-5 h-5 text-amber-500" />;
    }
    return <File className="w-5 h-5 text-blue-500" />;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success" className="text-xs">✓ Vérifié</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">✕ Rejeté</Badge>;
      case 'pending':
      default:
        return <Badge variant="default" className="text-xs">⏳ En attente</Badge>;
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => { setZoom(100); setRotation(0); };

  const handlePrint = () => {
    if (selectedDoc) {
      window.print();
    }
  };

  const handleDownload = (doc: Document) => {
    // Simulation de téléchargement
    console.log('Downloading:', doc.name);
    // En production: window.open(doc.url, '_blank');
  };

  const handleVerify = (doc: Document, verified: boolean) => {
    onVerify?.(doc.id, verified);
  };

  if (documents.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Aucun document joint</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Liste des documents */}
      <div className="grid gap-3">
        {documents.map(doc => (
          <div
            key={doc.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer",
              "bg-white dark:bg-slate-800/50",
              "border-slate-200 dark:border-slate-700",
              "hover:border-orange-500/50 hover:shadow-md"
            )}
            onClick={() => setSelectedDoc(doc)}
          >
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
              {getDocIcon(doc.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{doc.name}</span>
                {getStatusBadge(doc.status)}
              </div>
              <div className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{doc.type}</span>
                {doc.size && <span>• {doc.size}</span>}
                <span>• {doc.date}</span>
              </div>
              {doc.uploadedBy && (
                <div className="text-xs text-slate-400 mt-1">
                  Uploadé par: {doc.uploadedBy}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
                title="Prévisualiser"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => { e.stopPropagation(); handleDownload(doc); }}
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de prévisualisation */}
      <FluentModal
        open={!!selectedDoc}
        title={selectedDoc?.name || 'Document'}
        onClose={() => { setSelectedDoc(null); handleReset(); }}
        maxWidth="full"
      >
        {selectedDoc && (
          <div className="flex flex-col h-[80vh]">
            {/* Barre d'outils */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Zoom arrière"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-mono">{zoom}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Zoom avant"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleRotate}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                  title="Pivoter"
                >
                  <RotateCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  Réinitialiser
                </button>
              </div>

              <div className="flex items-center gap-2">
                {getStatusBadge(selectedDoc.status)}

                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Imprimer"
                >
                  <Printer className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDownload(selectedDoc)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Ouvrir dans un nouvel onglet"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Zone de prévisualisation */}
            <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 p-8">
              <div 
                className="flex items-center justify-center min-h-full"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease',
                }}
              >
                {/* Simulation de document - en production, afficher le vrai document */}
                <div className="bg-white dark:bg-slate-800 shadow-2xl rounded-lg p-8 min-w-[600px] min-h-[800px]">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      {getDocIcon(selectedDoc.type)}
                      <div className="mt-4 text-lg font-semibold">{selectedDoc.name}</div>
                      <div className="mt-2 text-slate-500">{selectedDoc.type}</div>
                      <div className="mt-1 text-sm text-slate-400">{selectedDoc.size || 'Taille inconnue'}</div>
                      
                      <div className="mt-8 p-6 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                        <p className="text-sm text-slate-500">
                          🔍 Prévisualisation simulée
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          En production, le contenu réel du document serait affiché ici.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions de vérification */}
            {onVerify && selectedDoc.status !== 'verified' && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-500">
                    Vérifiez ce document et confirmez sa validité
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleVerify(selectedDoc, false)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Rejeter
                    </Button>
                    <Button
                      variant="default"
                      className="bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => handleVerify(selectedDoc, true)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Valider le document
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </FluentModal>
    </div>
  );
}

// ============================================
// UPLOAD COMPONENT
// ============================================

type UploadProps = {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // en MB
  acceptedTypes?: string[];
};

export function RHDocumentUpload({ 
  onUpload, 
  maxFiles = 5, 
  maxSize = 10,
  acceptedTypes = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xls', 'xlsx']
}: UploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = (file: File): string | null => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !acceptedTypes.includes(ext)) {
      return `Type de fichier non supporté: ${ext}`;
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)} MB (max: ${maxSize} MB)`;
    }
    return null;
  };

  const handleFiles = (files: FileList) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    Array.from(files).forEach(file => {
      if (uploadedFiles.length + validFiles.length >= maxFiles) {
        newErrors.push(`Maximum ${maxFiles} fichiers autorisés`);
        return;
      }

      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...validFiles];
      setUploadedFiles(newFiles);
      onUpload(newFiles);
    }

    setErrors(newErrors);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onUpload(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Zone de drop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
          isDragging
            ? "border-orange-500 bg-orange-500/10"
            : "border-slate-300 dark:border-slate-700 hover:border-orange-500/50"
        )}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          accept={acceptedTypes.map(t => `.${t}`).join(',')}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        <Download className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-lg font-medium mb-1">
          {isDragging ? 'Déposez les fichiers ici' : 'Glissez-déposez vos fichiers'}
        </p>
        <p className="text-sm text-slate-500">
          ou cliquez pour parcourir
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Formats: {acceptedTypes.join(', ')} • Max: {maxSize} MB • Limite: {maxFiles} fichiers
        </p>
      </div>

      {/* Erreurs */}
      {errors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {errors.map((error, i) => (
            <div key={i}>{error}</div>
          ))}
        </div>
      )}

      {/* Fichiers uploadés */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Fichiers sélectionnés ({uploadedFiles.length}/{maxFiles})
          </div>
          {uploadedFiles.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
            >
              <FileText className="w-5 h-5 text-slate-400" />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">{file.name}</div>
                <div className="text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <button
                onClick={() => handleRemove(i)}
                className="p-1 rounded hover:bg-red-500/10 text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

