'use client';

/**
 * BmoModal — Wrapper modal unifié BMO (thème slate, API open/onClose)
 * À utiliser pour toutes les modales du portail maître d’ouvrage.
 * Cohérence avec docs/ANALYSE_COHERENCE_INTERFACE_MODULES.md
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface BmoModalProps {
  /** Contrôle d’ouverture (API unifiée open/onClose) */
  open: boolean;
  onClose: () => void;
  /** Titre affiché dans le header */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Contenu de la modale */
  children: React.ReactNode;
  /** Taille max du conteneur */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** Classe du conteneur */
  className?: string;
  /** Masquer le bouton fermer dans le header */
  hideCloseButton?: boolean;
  /** Footer optionnel (actions) */
  footer?: React.ReactNode;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw]',
} as const;

export function BmoModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'lg',
  className,
  hideCloseButton = false,
  footer,
}: BmoModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bmo-modal-title"
    >
      {/* Backdrop — thème BMO */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      {/* Conteneur — thème slate cohérent */}
      <div
        className={cn(
          'relative w-full flex flex-col max-h-[90vh] overflow-hidden',
          'rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl',
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-800/60 bg-slate-800/30 px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 id="bmo-modal-title" className="text-lg font-semibold text-slate-100 truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-400 truncate">{subtitle}</p>
            )}
          </div>
          {!hideCloseButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Fermer"
              className="h-9 w-9 shrink-0 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {/* Body */}
        <div className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </div>
        {/* Footer optionnel */}
        {footer && (
          <div className="shrink-0 border-t border-slate-800/60 bg-slate-800/20 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
