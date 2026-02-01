/**
 * Fenêtre Avancée BTP
 * Fenêtre modale pour afficher des détails avancés
 */

'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { zIndexClass } from '@/modules/dashboard/utils/zIndex';

interface BTPAdvancedWindowProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-full mx-4',
};

export function BTPAdvancedWindow({
  isOpen,
  onClose,
  title,
  children,
  size = 'lg',
  className,
}: BTPAdvancedWindowProps) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — z-index modal pour rester au-dessus de la topbar / sidebar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={cn('fixed inset-0 bg-black/60 backdrop-blur-sm', zIndexClass('modalHigh'))}
            aria-hidden
          />

          {/* Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              'fixed inset-0 flex items-center justify-center p-4',
              zIndexClass('modalHigh'),
              className
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="btp-advanced-window-title"
          >
            <div
              className={cn(
                'bg-slate-900 rounded-xl border border-slate-700 shadow-2xl flex flex-col min-h-0 max-h-[90vh] w-full',
                sizeClasses[size]
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
                <h2 id="btp-advanced-window-title" className="text-lg font-semibold text-slate-200 truncate pr-2">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content — min-h-0 pour que le flex autorise le scroll */}
              <div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

