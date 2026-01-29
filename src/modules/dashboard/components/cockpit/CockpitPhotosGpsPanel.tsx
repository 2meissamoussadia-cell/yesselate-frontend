/**
 * Phase 6 — Galerie Photos GPS
 * Photos géolocalisées par chantier (mock) ; filtrage chantier.
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { MapPin, Calendar, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colors } from '../../utils/dashboardDesignTokens';
import type { PhotoGpsMock } from '../../data/photoGpsMock';
import { photosGps } from '../../data/photoGpsMock';

const chantierIds = Array.from(new Set(photosGps.map((p) => p.chantierId))).sort();

/** Placeholder affiché quand l'image ne charge pas (réseau, CORS, etc.) */
function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div
      className="h-full w-full flex flex-col items-center justify-center bg-slate-800/80 text-slate-500"
      aria-hidden
    >
      <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 mb-1" />
      <span className="text-[10px] sm:text-xs truncate max-w-full px-1 text-center">{label}</span>
    </div>
  );
}

export function CockpitPhotosGpsPanel() {
  const [chantierFilter, setChantierFilter] = useState<string>('');
  const [selected, setSelected] = useState<PhotoGpsMock | null>(null);
  /** IDs des photos dont le chargement a échoué (thumb ou full) */
  const [failedThumbs, setFailedThumbs] = useState<Set<string>>(() => new Set());
  const [failedFull, setFailedFull] = useState<Set<string>>(() => new Set());

  const onThumbError = useCallback((id: string) => {
    setFailedThumbs((prev) => new Set(prev).add(id));
  }, []);
  const onFullError = useCallback((id: string) => {
    setFailedFull((prev) => new Set(prev).add(id));
  }, []);

  const filtered = useMemo(() => {
    if (!chantierFilter) return photosGps;
    return photosGps.filter((p) => p.chantierId === chantierFilter);
  }, [chantierFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Chantier</span>
        <select
          value={chantierFilter}
          onChange={(e) => setChantierFilter(e.target.value)}
          className={cn(
            'rounded-lg border bg-slate-900/60 px-3 py-1.5 text-sm text-slate-200',
            colors.border.default,
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50'
          )}
        >
          <option value="">Tous</option>
          {chantierIds.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelected(photo)}
            className={cn(
              'group relative aspect-[4/3] rounded-xl border overflow-hidden bg-slate-800/60',
              colors.border.default,
              'hover:border-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
              selected?.id === photo.id && 'ring-2 ring-blue-500/60 border-blue-500/40'
            )}
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
                <span>{new Date(photo.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 text-[10px] font-medium text-slate-300">
              {photo.chantierId}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo en grand"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {failedFull.has(selected.id) ? (
              <div className="min-h-[200px] flex flex-col items-center justify-center p-8 bg-slate-800/80 text-slate-400">
                <ImageIcon className="h-16 w-16 mb-3" />
                <p className="text-sm font-medium text-slate-300">{selected.label}</p>
                <p className="text-xs mt-1">Image indisponible</p>
              </div>
            ) : (
              <img
                src={selected.url}
                alt={selected.label}
                className="max-h-[85vh] w-auto object-contain"
                onError={() => onFullError(selected.id)}
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent text-white text-sm">
              <p className="font-semibold">{selected.label}</p>
              <p className="text-slate-300 text-xs mt-1">
                {selected.chantierId} · {selected.lat.toFixed(5)}, {selected.lng.toFixed(5)} · {new Date(selected.date).toLocaleString('fr-FR')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 rounded-lg bg-slate-800/90 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-slate-700"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/30">
          <ImageIcon className="h-10 w-10 text-slate-500 mb-2" />
          <p className="text-sm text-slate-400">Aucune photo pour ce chantier</p>
        </div>
      )}
    </div>
  );
}
