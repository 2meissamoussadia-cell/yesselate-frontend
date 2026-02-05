/**
 * Dialogue de confirmation
 * Pour les actions destructives ou importantes
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
} from 'lucide-react';

type ConfirmVariant = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  requireConfirmation?: boolean;
  confirmationText?: string;
}

const variantConfig: Record<ConfirmVariant, { icon: React.ComponentType<{ className?: string }>; iconColor: string; buttonClass: string }> = {
  danger: {
    icon: Trash2,
    iconColor: 'text-red-400',
    buttonClass: 'bg-red-600 hover:bg-red-700',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    buttonClass: 'bg-amber-600 hover:bg-amber-700',
  },
  info: {
    icon: CheckCircle2,
    iconColor: 'text-blue-400',
    buttonClass: 'bg-blue-600 hover:bg-blue-700',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  onConfirm,
  onCancel,
  requireConfirmation = false,
  confirmationText = 'SUPPRIMER',
}: ConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  const config = variantConfig[variant];
  const Icon = config.icon;

  const canConfirm = !requireConfirmation || confirmInput === confirmationText;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      logger.error('Confirm action failed', error instanceof Error ? error : undefined, { component: 'ConfirmDialog' });
    } finally {
      setIsLoading(false);
      setConfirmInput('');
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
    setConfirmInput('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
              variant === 'danger' ? 'bg-red-500/10' :
              variant === 'warning' ? 'bg-amber-500/10' : 'bg-blue-500/10'
            )}>
              <Icon className={cn('h-5 w-5', config.iconColor)} />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-200">
                {title}
              </DialogTitle>
              {description && (
                <DialogDescription className="text-sm text-slate-400 mt-1">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {requireConfirmation && (
          <div className="mt-4">
            <p className="text-sm text-slate-400 mb-2">
              Pour confirmer, tapez <strong className="text-slate-200">{confirmationText}</strong> ci-dessous :
            </p>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={confirmationText}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-red-500/50"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="border-slate-700 text-slate-400"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !canConfirm}
            className={config.buttonClass}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                En cours...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook pour utiliser le dialogue de confirmation
 */
export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description?: string;
    variant: ConfirmVariant;
    onConfirm: () => void | Promise<void>;
  }>({
    open: false,
    title: '',
    variant: 'danger',
    onConfirm: () => {},
  });

  const confirm = (options: {
    title: string;
    description?: string;
    variant?: ConfirmVariant;
    onConfirm: () => void | Promise<void>;
  }) => {
    setState({
      open: true,
      title: options.title,
      description: options.description,
      variant: options.variant || 'danger',
      onConfirm: options.onConfirm,
    });
  };

  const close = () => {
    setState((s) => ({ ...s, open: false }));
  };

  const dialogProps = {
    open: state.open,
    onOpenChange: (open: boolean) => setState((s) => ({ ...s, open })),
    title: state.title,
    description: state.description,
    variant: state.variant,
    onConfirm: state.onConfirm,
  };

  return { confirm, close, dialogProps };
}

