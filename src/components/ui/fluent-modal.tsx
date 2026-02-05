'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

type Props = {
  open: boolean;
  title?: string | React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  noPadding?: boolean;
  dark?: boolean; // Force dark theme (ERP)
  hideHeader?: boolean;
  size?: string; // Alias for maxWidth (sm, md, lg, xl, etc.)
};

const maxWidthClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-[95vw]',
};

export function FluentModal({ open, title, onClose, children, className, maxWidth: maxWidthProp, size, noPadding = false, dark = false, hideHeader = false }: Props) {
  const maxWidth = (maxWidthProp ?? (size as Props['maxWidth']) ?? '3xl') as Props['maxWidth'];
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      {/* overlay */}
      <div
        className={cn(
          "absolute inset-0 backdrop-blur-[2px]",
          dark ? "bg-black/55 backdrop-blur-sm" : "bg-black/30"
        )}
        onClick={onClose}
      />
      {/* panel */}
      <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4">
        <div
          className={cn(
            "w-full rounded-2xl backdrop-blur-xl shadow-xl",
            "max-h-[85vh] overflow-hidden",
            (maxWidthClasses[maxWidth ?? '3xl'] || 'max-w-3xl'),
            dark 
              ? "bg-slate-900/95 text-slate-100 border border-slate-800/60"
              : "border border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-[#1f1f1f]/85",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {!hideHeader && (
          <div className={cn(
            "flex items-center justify-between gap-3 px-4 py-3",
            dark 
              ? "border-b border-slate-800/60"
              : "border-b border-slate-200/70 dark:border-slate-800"
          )}>
            <div className="min-w-0">
              {typeof title === 'string' ? (
                <div className="font-semibold truncate">{title}</div>
              ) : (
                <div className="font-semibold">{title ?? 'Fenêtre'}</div>
              )}
            </div>
            <button
              className={cn(
                "rounded-lg p-2",
                dark 
                  ? "hover:bg-slate-800/60 text-slate-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800/60"
              )}
              onClick={onClose}
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          )}

          <div className={cn(
            hideHeader ? "overflow-auto max-h-[85vh]" : "overflow-auto max-h-[calc(90vh-56px)]",
            !noPadding && "p-6",
            noPadding && "!p-0 !overflow-visible"
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
