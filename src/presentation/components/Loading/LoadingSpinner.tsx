/**
 * LoadingSpinner Component
 * Spinner de chargement amélioré avec différentes tailles et variantes
 */

'use client';

import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  className?: string;
  text?: string;
}

const sizeConfig = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const variantConfig = {
  default: 'text-slate-400',
  primary: 'text-blue-400',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
};

export function LoadingSpinner({
  size = 'md',
  variant = 'default',
  className,
  text,
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2
        className={cn(
          sizeConfig[size],
          variantConfig[variant],
          'animate-spin'
        )}
      />
      {text && (
        <p className={cn('text-sm', variantConfig[variant])}>{text}</p>
      )}
    </div>
  );
}

/**
 * LoadingOverlay - Overlay de chargement
 */
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  text = 'Chargement...',
  className,
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 backdrop-blur-sm',
        className
      )}
    >
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700/50 shadow-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

/**
 * LoadingButton - Bouton avec état de chargement
 */
import { ButtonHTMLAttributes } from 'react';
import { FluentButton } from '@/components/ui/fluent-button';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <FluentButton
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText || 'Chargement...'}
        </div>
      ) : (
        children
      )}
    </FluentButton>
  );
}

