/**
 * Slider avant/après — comparaison visuelle (plan vs réalité, avant/après).
 * Glisser pour révéler l'image de gauche (avant) ou droite (après).
 */

'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface BeforeAfterSliderProps {
  /** Image "avant" (plan ou ancienne photo) */
  beforeSrc: string;
  /** Image "après" (réalité ou nouvelle photo) */
  afterSrc: string;
  /** Label avant (ex. "Plan") */
  beforeLabel?: string;
  /** Label après (ex. "Réalité") */
  afterLabel?: string;
  /** Rapport 0–1 : 0.5 = 50% avant / 50% après */
  defaultPosition?: number;
  className?: string;
  /** Alt text pour accessibilité */
  alt?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = 'Avant',
  afterLabel = 'Après',
  defaultPosition = 0.5,
  className,
  alt = 'Comparaison avant après',
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(defaultPosition);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setPosition(x);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleMove(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (e.buttons !== 1) return;
    handleMove(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60', className)}
      role="img"
      aria-label={alt}
    >
      {/* Image "après" (pleine largeur en fond) */}
      <div className="absolute inset-0">
        <img
          src={afterSrc}
          alt={afterLabel}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      {/* Image "avant" (masquée par un clip à droite) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${(1 - position) * 100}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt={beforeLabel}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      {/* Poignée verticale */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white/90 shadow-lg cursor-ew-resize z-10"
        style={{ left: `calc(${position * 100}% - 2px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        aria-valuenow={Math.round(position * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Position du slider avant/après"
        role="slider"
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white border-2 border-slate-700 shadow-md flex items-center justify-center">
          <span className="text-slate-600 text-xs font-bold">⟷</span>
        </div>
      </div>
      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-medium">
        <span>{beforeLabel}</span>
        <span>{afterLabel}</span>
      </div>
    </div>
  );
}
