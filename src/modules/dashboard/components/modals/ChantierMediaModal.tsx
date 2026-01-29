/**
 * Galerie photos, documents et plan vs réalité pour un chantier.
 * Structure : Photos (par phase) | Documents (Devis, Contrat, Factures) | Plan vs Réalité (slider avant/après).
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { X, Image as ImageIcon, FileText, MapPin, Calendar, FolderOpen, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChantierMock } from '../../data/chantiersMock';
import { photosGps, getPhaseLabel, plansAR, type PhotoGpsMock } from '../../data/photoGpsMock';
import { getDocumentsByChantier, documentTypeLabels } from '../../data/chantierDocumentsMock';
import { BeforeAfterSlider } from '../shared/BeforeAfterSlider';

export interface ChantierMediaModalProps {
  chantier: ChantierMock;
  onClose: () => void;
}

type TabId = 'photos' | 'documents' | 'plan';

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-800/80 text-slate-500" aria-hidden>
      <ImageIcon className="h-8 w-8 mb-1" />
      <span className="text-[10px] truncate max-w-full px-1 text-center">{label}</span>
    </div>
  );
}

export function ChantierMediaModal({ chantier, onClose }: ChantierMediaModalProps) {
  const [tab, setTab] = useState<TabId>('photos');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoGpsMock | null>(null);
  const [failedThumbs, setFailedThumbs] = useState<Set<string>>(() => new Set());

  const photosByChantier = useMemo(
    () => photosGps.filter((p) => p.chantierId === chantier.id),
    [chantier.id]
  );

  const photosByPhase = useMemo(() => {
    const byPhase: Record<number, PhotoGpsMock[]> = {};
    photosByChantier.forEach((p) => {
      const phase = p.phase ?? 0;
      if (!byPhase[phase]) byPhase[phase] = [];
      byPhase[phase].push(p);
    });
    const phases = Object.keys(byPhase)
      .map(Number)
      .sort((a, b) => a - b);
    return phases.map((phase) => ({ phase, photos: byPhase[phase], label: getPhaseLabel(phase) }));
  }, [photosByChantier]);

  const documents = useMemo(() => getDocumentsByChantier(chantier.id), [chantier.id]);

  const planVsReel = useMemo(
    () => plansAR.filter((p) => p.chantierId === chantier.id),
    [chantier.id]
  );

  const onThumbError = useCallback((id: string) => {
    setFailedThumbs((prev) => new Set(prev).add(id));
  }, []);

  const totalPhotos = photosByChantier.length;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const formatSize = (bytes?: number) => (bytes ? `${(bytes / 1024).toFixed(1)} Ko` : '—');

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chantier-media-title"
    >
      <div
        className={cn(
          'w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl',
          'flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200'
        )}
      >
        <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-800/60 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <ImageIcon className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h2 id="chantier-media-title" className="text-base font-semibold text-slate-100 truncate">
                {chantier.id} — Photos & Documents
              </h2>
              <p className="text-xs text-slate-500 truncate">
                {totalPhotos} photos • {documents.length} documents • {planVsReel.length} plan vs réalité
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/50" aria-label="Fermer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 border-b border-slate-800/50 bg-slate-900/50 shrink-0">
          {[
            { id: 'photos' as TabId, label: `Photos (${totalPhotos})`, icon: ImageIcon },
            { id: 'documents' as TabId, label: `Documents (${documents.length})`, icon: FolderOpen },
            { id: 'plan' as TabId, label: 'Plan vs Réalité', icon: FileCheck },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                tab === id ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {tab === 'photos' && (
            <div className="space-y-6">
              {photosByPhase.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/30">
                  <ImageIcon className="h-10 w-10 text-slate-500 mb-2" />
                  <p className="text-sm text-slate-400">Aucune photo pour ce chantier</p>
                  <p className="text-xs text-slate-500 mt-1">Upload mobile ouvriers • Géolocalisation GPS • Timeline automatique</p>
                </div>
              ) : (
                photosByPhase.map(({ phase, photos, label }) => (
                  <div key={phase}>
                    <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                      <span>{label}</span>
                      <span className="text-slate-500 font-normal">({photos.length} photo{photos.length > 1 ? 's' : ''})</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {photos.map((photo) => (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => setSelectedPhoto(photo)}
                          className="group relative aspect-[4/3] rounded-xl border border-slate-700/60 overflow-hidden bg-slate-800/60 hover:border-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                        >
                          {failedThumbs.has(photo.id) ? (
                            <ImagePlaceholder label={photo.label} />
                          ) : (
                            <img
                              src={photo.thumbUrl}
                              alt={photo.label}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                              onError={() => onThumbError(photo.id)}
                            />
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-xs font-medium text-white truncate">{photo.label}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-300">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              <span>{photo.lat.toFixed(4)}, {photo.lng.toFixed(4)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Calendar className="h-2.5 w-2.5 shrink-0" />
                              <span>{formatDate(photo.date)}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'documents' && (
            <div className="space-y-2">
              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/30">
                  <FileText className="h-10 w-10 text-slate-500 mb-2" />
                  <p className="text-sm text-slate-400">Aucun document attaché</p>
                  <p className="text-xs text-slate-500 mt-1">Devis PDF • Contrats signés • Factures fournisseurs</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-700/60 bg-slate-800/40 hover:bg-slate-800/70 transition-colors',
                      'text-slate-200 no-underline'
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 border border-rose-500/30">
                      <FileText className="h-5 w-5 text-rose-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-slate-500">
                        {documentTypeLabels[doc.type]} {doc.signed && '• Signé'} • {formatSize(doc.size)} • {formatDate(doc.date)}
                      </p>
                    </div>
                  </a>
                ))
              )}
            </div>
          )}

          {tab === 'plan' && (
            <div className="space-y-6">
              {planVsReel.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/30">
                  <FileCheck className="h-10 w-10 text-slate-500 mb-2" />
                  <p className="text-sm text-slate-400">Aucune comparaison plan vs réalité</p>
                  <p className="text-xs text-slate-500 mt-1">Photo plan vs réalité • Slider avant/après</p>
                </div>
              ) : (
                planVsReel.map((plan) => (
                  <div key={plan.chantierId + plan.label}>
                    <h3 className="text-sm font-semibold text-slate-200 mb-2">{plan.label}</h3>
                    <BeforeAfterSlider
                      beforeSrc={plan.planUrl}
                      afterSrc={plan.photoReelleUrl}
                      beforeLabel="Plan"
                      afterLabel="Réalité"
                      defaultPosition={0.5}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={selectedPhoto.url} alt={selectedPhoto.label} className="max-h-[85vh] w-auto object-contain" />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-white text-sm">
              <p className="font-semibold">{selectedPhoto.label}</p>
              <p className="text-slate-300 text-xs mt-1">
                {selectedPhoto.chantierId} • {selectedPhoto.lat.toFixed(5)}, {selectedPhoto.lng.toFixed(5)} • {formatDate(selectedPhoto.date)}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedPhoto(null)} className="absolute top-2 right-2 rounded-lg bg-slate-800/90 text-slate-200 hover:bg-slate-700" aria-label="Fermer">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
