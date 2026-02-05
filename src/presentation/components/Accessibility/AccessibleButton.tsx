/**
 * AccessibleButton
 * Bouton avec support d'accessibilité complet (ARIA, clavier, screen reader)
 */

'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  description?: string;
  loading?: boolean;
  loadingLabel?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    label, 
    description, 
    loading = false, 
    loadingLabel = 'Chargement...',
    className,
    disabled,
    children,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(className)}
        disabled={isDisabled}
        aria-label={label}
        aria-describedby={description ? `${props.id}-description` : undefined}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <span className="sr-only">{loadingLabel}</span>
        )}
        {description && (
          <span id={`${props.id}-description`} className="sr-only">
            {description}
          </span>
        )}
        {children || label}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

