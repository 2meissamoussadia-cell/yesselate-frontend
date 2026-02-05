/**
 * Detail Modal - Composant réutilisable
 * Pattern unifié pour tous les modules
 */

'use client';

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  size?: 'md' | 'lg' | 'xl' | 'full';
  position?: 'center' | 'right';
  children: React.ReactNode;
  
  // Navigation
  canNavigatePrev?: boolean;
  canNavigateNext?: boolean;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  
  // Footer actions
  footer?: React.ReactNode;
}

export function DetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  accentColor = 'blue',
  size = 'xl',
  position = 'right',
  children,
  canNavigatePrev = false,
  canNavigateNext = false,
  onNavigatePrev,
  onNavigateNext,
  footer,
}: DetailModalProps) {
  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Échap pour fermer
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      // Flèches pour naviguer
      if (e.key === 'ArrowLeft' && canNavigatePrev && onNavigatePrev) {
        e.preventDefault();
        onNavigatePrev();
      }

      if (e.key === 'ArrowRight' && canNavigateNext && onNavigateNext) {
        e.preventDefault();
        onNavigateNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, canNavigatePrev, canNavigateNext, onNavigatePrev, onNavigateNext, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full',
  };

  const positionClasses = {
    center: 'items-center justify-center',
    right: 'items-stretch justify-end',
  };

  const panelClasses = position === 'right' 
    ? 'h-full w-full md:w-[600px] lg:w-[800px] rounded-l-xl'
    : `${sizeClasses[size]} rounded-xl m-4 max-h-[90vh]`;

  return (
    <div className={cn('fixed inset-0 z-[9999] flex', positionClasses[position])}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={cn(
        'relative bg-slate-900 shadow-2xl border border-slate-700 flex flex-col overflow-hidden',
        panelClasses
      )}>
        {/* Header */}
        <div className="flex-none border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Left: Icon + Title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {icon && (
                <div className={cn(
                  'p-2 rounded-lg border',
                  `bg-${accentColor}-500/10 border-${accentColor}-500/20`
                )}>
                  {icon}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-slate-100 truncate">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-slate-400 truncate">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Right: Navigation + Close */}
            <div className="flex items-center gap-2 ml-4">
              {/* Navigation */}
              {(canNavigatePrev || canNavigateNext) && (
                <div className="flex items-center gap-1 mr-2">
                  <button
                    onClick={onNavigatePrev}
                    disabled={!canNavigatePrev}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      canNavigatePrev
                        ? 'hover:bg-slate-700 text-slate-300'
                        : 'text-slate-600 cursor-not-allowed'
                    )}
                    title="Précédent (←)"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onNavigateNext}
                    disabled={!canNavigateNext}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      canNavigateNext
                        ? 'hover:bg-slate-700 text-slate-300'
                        : 'text-slate-600 cursor-not-allowed'
                    )}
                    title="Suivant (→)"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Close */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                title="Fermer (Échap)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-none border-t border-slate-700 bg-slate-800/30 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Hook helper pour gérer la navigation dans une liste
export function useDetailNavigation<T>(items: T[], selectedItem: T | null) {
  const currentIndex = selectedItem ? items.indexOf(selectedItem) : -1;
  
  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex >= 0 && currentIndex < items.length - 1;
  
  const navigatePrev = () => {
    if (canNavigatePrev) {
      return items[currentIndex - 1];
    }
    return null;
  };
  
  const navigateNext = () => {
    if (canNavigateNext) {
      return items[currentIndex + 1];
    }
    return null;
  };
  
  return {
    canNavigatePrev,
    canNavigateNext,
    navigatePrev,
    navigateNext,
    currentIndex,
    totalItems: items.length,
  };
}

