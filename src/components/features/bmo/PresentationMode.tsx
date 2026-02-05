'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface PresentationModeProps {
  isActive: boolean;
  onToggle: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentSection?: number;
  totalSections?: number;
  className?: string;
}

export function PresentationMode({
  isActive,
  onToggle,
  onNext,
  onPrevious,
  currentSection,
  totalSections,
  className,
}: PresentationModeProps) {
  const { darkMode } = useAppStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isActive]);

  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Fallback pour navigateurs qui ne supportent pas fullscreen
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch {
        // Fallback
      }
    }
  };

  // Raccourcis clavier en mode présentation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // F11 pour fullscreen
      if (e.key === 'F11') {
        e.preventDefault();
        handleFullscreen();
        return;
      }

      // Flèches pour navigation
      if (e.key === 'ArrowRight' && onNext) {
        e.preventDefault();
        onNext();
        return;
      }

      if (e.key === 'ArrowLeft' && onPrevious) {
        e.preventDefault();
        onPrevious();
        return;
      }

      // Escape pour quitter
      if (e.key === 'Escape') {
        e.preventDefault();
        onToggle();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onToggle, onNext, onPrevious]);

  if (!isActive) {
    return (
      <Button
        size="sm"
        variant="ghost"
        onClick={onToggle}
        className={cn('text-xs', className)}
        aria-label="Activer le mode présentation"
        title="Mode présentation (F11)"
      >
        <Maximize2 className="w-3 h-3 mr-1" />
        Présentation
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between transition-all',
        darkMode ? 'bg-slate-900/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm',
        'border-b border-slate-700'
      )}
    >
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggle}
          className="text-xs"
          aria-label="Quitter le mode présentation"
        >
          <X className="w-3 h-3 mr-1" />
          Quitter
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleFullscreen}
          className="text-xs"
          aria-label={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3 h-3 mr-1" />
              Réduire
            </>
          ) : (
            <>
              <Maximize2 className="w-3 h-3 mr-1" />
              Plein écran
            </>
          )}
        </Button>
      </div>

      {currentSection !== undefined && totalSections !== undefined && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onPrevious}
            disabled={currentSection === 0}
            className="text-xs"
            aria-label="Section précédente"
          >
            <ChevronLeft className="w-3 h-3" />
          </Button>
          <span className="text-xs text-slate-400">
            {currentSection + 1} / {totalSections}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={onNext}
            disabled={currentSection === totalSections - 1}
            className="text-xs"
            aria-label="Section suivante"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}

      <div className="text-[10px] text-slate-400">
        ESC pour quitter • F11 pour plein écran • ← → pour naviguer
      </div>
    </div>
  );
}

