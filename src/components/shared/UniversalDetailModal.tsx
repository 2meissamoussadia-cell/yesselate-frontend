/**
 * Universal Detail Modal Wrapper
 * Pattern modal overlay pour tous les modules BMO
 * 
 * Avantages:
 * - Contexte préservé
 * - Navigation rapide
 * - UX moderne et fluide
 * - Multitâche possible
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UniversalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  actions?: React.ReactNode;
  headerColor?: string;
}

export function UniversalDetailModal({
  isOpen,
  onClose,
  onPrevious,
  onNext,
  title,
  subtitle,
  children,
  width = 'xl',
  actions,
  headerColor = 'blue',
}: UniversalDetailModalProps) {
  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      }
      if (e.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrevious, onNext]);

  // Prevent body scroll when modal is open
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

  const widthClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-[95vw]',
  };

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            'bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50',
            'w-full pointer-events-auto',
            'animate-in zoom-in-95 slide-in-from-bottom-4 duration-300',
            'flex flex-col max-h-[90vh]',
            widthClasses[width]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={cn(
            'flex items-center justify-between gap-4 px-6 py-4',
            'border-b border-slate-800',
            'bg-gradient-to-r',
            `from-${headerColor}-500/10 to-transparent`
          )}>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Navigation arrows */}
              {(onPrevious || onNext) && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onPrevious}
                    disabled={!onPrevious}
                    className="h-8 w-8 p-0"
                    title="Précédent (←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onNext}
                    disabled={!onNext}
                    className="h-8 w-8 p-0"
                    title="Suivant (→)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Title */}
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-semibold text-slate-100 truncate">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-slate-400 truncate">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Actions & Close */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
                title="Fermer (ESC)"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}

// Hook pour gérer la navigation dans une liste avec modal
export function useListNavigation<T>(items: T[], getId: (item: T) => string) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selectedItem = items.find((item) => getId(item) === selectedId);
  const selectedIndex = selectedItem ? items.indexOf(selectedItem) : -1;

  const canGoNext = selectedIndex < items.length - 1;
  const canGoPrevious = selectedIndex > 0;

  const handleNext = useCallback(() => {
    if (canGoNext) {
      setSelectedId(getId(items[selectedIndex + 1]));
    }
  }, [canGoNext, selectedIndex, items, getId]);

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) {
      setSelectedId(getId(items[selectedIndex - 1]));
    }
  }, [canGoPrevious, selectedIndex, items, getId]);

  const handleClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  const handleOpen = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return {
    selectedId,
    selectedItem,
    isOpen: selectedId !== null,
    canGoNext,
    canGoPrevious,
    handleNext: canGoNext ? handleNext : undefined,
    handlePrevious: canGoPrevious ? handlePrevious : undefined,
    handleClose,
    handleOpen,
  };
}

