/**
 * Modale Intelligente BTP
 * Modale avec actions contextuelles et personnalisation
 */

'use client';

import React from 'react';
import { X, Save, Download, Share2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { zIndexClass } from '@/modules/dashboard/utils/zIndex';

interface BTPIntelligentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'danger';
    icon?: React.ComponentType<{ className?: string }>;
  }>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
};

export function BTPIntelligentModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions = [],
  size = 'md',
  className,
}: BTPIntelligentModalProps) {
  const defaultActions = [
    {
      label: 'Sauvegarder',
      onClick: () => {},
      variant: 'primary' as const,
      icon: Save,
    },
    {
      label: 'Exporter',
      onClick: () => {},
      variant: 'secondary' as const,
      icon: Download,
    },
    {
      label: 'Partager',
      onClick: () => {},
      variant: 'secondary' as const,
      icon: Share2,
    },
  ];

  const allActions = actions.length > 0 ? actions : defaultActions;

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

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              'fixed inset-0 flex items-center justify-center p-4',
              zIndexClass('modalHigh'),
              className
            )}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="btp-modal-title"
          >
            <div
              className={cn(
                'bg-slate-900 rounded-xl border border-slate-700 shadow-2xl flex flex-col min-h-0 max-h-[90vh] w-full',
                sizeClasses[size]
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between px-6 py-4 border-b border-slate-800 shrink-0">
                <div className="flex-1 min-w-0">
                  <h2 id="btp-modal-title" className="text-lg font-semibold text-slate-200 mb-1">{title}</h2>
                  {description && (
                    <p className="text-sm text-slate-300">{description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors ml-4 focus-visible:outline focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  aria-label="Fermer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content — min-h-0 pour que le flex autorise le scroll */}
              <div className="flex-1 min-h-0 overflow-y-auto p-6">{children}</div>

              {/* Footer with Actions */}
              {allActions.length > 0 && (
                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-800 shrink-0">
                  {allActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        onClick={action.onClick}
                        variant={action.variant === 'primary' ? 'default' : 'secondary'}
                        size="sm"
                        className={cn(
                          action.variant === 'danger' && 'text-red-400 border-red-500/50 hover:bg-red-500/10'
                        )}
                      >
                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

