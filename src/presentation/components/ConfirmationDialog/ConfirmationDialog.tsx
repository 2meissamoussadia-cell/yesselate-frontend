/**
 * ConfirmationDialog
 * Dialog de confirmation amélioré avec animations
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/cn';

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

const typeConfig = {
  danger: {
    icon: XCircle,
    iconColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    buttonVariant: 'destructive' as const,
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    buttonVariant: 'warning' as const,
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    buttonVariant: 'primary' as const,
  },
  success: {
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    buttonVariant: 'primary' as const,
  },
};

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  loading = false,
}: ConfirmationDialogProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
    if (!loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className={cn(
                'relative w-full max-w-md rounded-xl border p-6',
                'bg-slate-900 border-slate-700',
                'shadow-2xl'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={cn(
                'flex items-start gap-4 mb-4',
                config.bgColor,
                'p-4 rounded-lg border',
                config.borderColor
              )}>
                <Icon className={cn('w-6 h-6 flex-shrink-0', config.iconColor)} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-200 mb-1">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    {message}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <FluentButton
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  {cancelText}
                </FluentButton>
                <FluentButton
                  variant={config.buttonVariant}
                  onClick={handleConfirm}
                  disabled={loading}
                >
                  {loading ? 'Traitement...' : confirmText}
                </FluentButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

