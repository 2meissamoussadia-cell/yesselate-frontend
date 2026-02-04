'use client';

/**
 * ActionButton — Bouton standardisé avec variantes (style Outlook)
 * 
 * Caractéristiques :
 * - 4 variantes : primary, secondary, ghost, danger
 * - 3 tailles : sm, md, lg
 * - Support icône gauche/droite
 * - État loading
 * - Hover/focus effects WCAG
 * - Transition fluide
 */

import React from 'react';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variante de style */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  /** Taille */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Icône à gauche */
  iconLeft?: React.ReactNode;
  /** Icône à droite */
  iconRight?: React.ReactNode;
  /** État de chargement */
  loading?: boolean;
  /** Texte de chargement (optionnel) */
  loadingText?: string;
  /** Pleine largeur */
  fullWidth?: boolean;
  /** Bouton icône seul */
  iconOnly?: boolean;
}

const variantStyles = {
  primary: [
    'bg-sky-600 text-white',
    'hover:bg-sky-700',
    'active:bg-sky-800 active:scale-[0.98]',
    'focus-visible:ring-sky-500',
    'shadow-sm hover:shadow-md',
  ],
  secondary: [
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    'hover:bg-slate-200 dark:hover:bg-slate-700',
    'active:bg-slate-300 dark:active:bg-slate-600 active:scale-[0.98]',
    'focus-visible:ring-slate-500',
  ],
  ghost: [
    'bg-transparent text-slate-600 dark:text-slate-400',
    'hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200',
    'active:bg-slate-200 dark:active:bg-slate-700 active:scale-[0.98]',
    'focus-visible:ring-slate-500',
  ],
  danger: [
    'bg-red-600 text-white',
    'hover:bg-red-700',
    'active:bg-red-800 active:scale-[0.98]',
    'focus-visible:ring-red-500',
    'shadow-sm hover:shadow-md',
  ],
  outline: [
    'bg-transparent text-slate-700 dark:text-slate-300',
    'border border-slate-300 dark:border-slate-600',
    'hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-400 dark:hover:border-slate-500',
    'active:bg-slate-100 dark:active:bg-slate-700 active:scale-[0.98]',
    'focus-visible:ring-slate-500',
  ],
};

const sizeStyles = {
  xs: {
    button: 'h-7 px-2 text-xs gap-1 rounded-md',
    icon: 'w-3 h-3',
    iconButton: 'h-7 w-7',
  },
  sm: {
    button: 'h-8 px-3 text-sm gap-1.5 rounded-md',
    icon: 'w-4 h-4',
    iconButton: 'h-8 w-8',
  },
  md: {
    button: 'h-9 px-4 text-sm gap-2 rounded-lg',
    icon: 'w-4 h-4',
    iconButton: 'h-9 w-9',
  },
  lg: {
    button: 'h-11 px-6 text-base gap-2 rounded-lg',
    icon: 'w-5 h-5',
    iconButton: 'h-11 w-11',
  },
};

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  function ActionButton(
    {
      variant = 'primary',
      size = 'md',
      iconLeft,
      iconRight,
      loading = false,
      loadingText,
      fullWidth = false,
      iconOnly = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) {
    const sizes = sizeStyles[size];
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          iconOnly ? sizes.iconButton : sizes.button,
          variantStyles[variant],
          fullWidth && 'w-full',
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className={cn(sizes.icon, 'animate-spin')} />
            {loadingText && <span>{loadingText}</span>}
          </>
        ) : (
          <>
            {iconLeft && (
              <span className={cn('shrink-0', sizes.icon, '[&>svg]:w-full [&>svg]:h-full')}>
                {iconLeft}
              </span>
            )}
            {children}
            {iconRight && (
              <span className={cn('shrink-0', sizes.icon, '[&>svg]:w-full [&>svg]:h-full')}>
                {iconRight}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

/**
 * IconButton — Variante pour bouton icône seul
 */
export interface IconButtonProps extends Omit<ActionButtonProps, 'iconLeft' | 'iconRight' | 'iconOnly' | 'children'> {
  /** Icône */
  icon: React.ReactNode;
  /** Label accessible (obligatoire pour a11y) */
  'aria-label': string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ icon, size = 'md', className, ...props }, ref) {
    const sizes = sizeStyles[size];

    return (
      <ActionButton
        ref={ref}
        iconOnly
        size={size}
        className={cn(sizes.iconButton, className)}
        {...props}
      >
        <span className={cn('shrink-0', sizes.icon, '[&>svg]:w-full [&>svg]:h-full')}>
          {icon}
        </span>
      </ActionButton>
    );
  }
);

/**
 * ButtonGroup — Groupe de boutons
 */
export function ButtonGroup({
  children,
  orientation = 'horizontal',
  className,
}: {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex',
        orientation === 'horizontal' ? 'flex-row' : 'flex-col',
        // Joindre les bordures
        '[&>*:not(:first-child):not(:last-child)]:rounded-none',
        orientation === 'horizontal' && [
          '[&>*:first-child]:rounded-r-none',
          '[&>*:last-child]:rounded-l-none',
          '[&>*:not(:first-child)]:-ml-px',
        ],
        orientation === 'vertical' && [
          '[&>*:first-child]:rounded-b-none',
          '[&>*:last-child]:rounded-t-none',
          '[&>*:not(:first-child)]:-mt-px',
        ],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Boutons prédéfinis pour actions courantes
 */

export function NewButton({
  children = 'Nouveau',
  ...props
}: Omit<ActionButtonProps, 'variant'>) {
  return (
    <ActionButton variant="primary" {...props}>
      {children}
    </ActionButton>
  );
}

export function SaveButton({
  children = 'Enregistrer',
  ...props
}: Omit<ActionButtonProps, 'variant'>) {
  return (
    <ActionButton variant="primary" {...props}>
      {children}
    </ActionButton>
  );
}

export function CancelButton({
  children = 'Annuler',
  ...props
}: Omit<ActionButtonProps, 'variant'>) {
  return (
    <ActionButton variant="ghost" {...props}>
      {children}
    </ActionButton>
  );
}

export function DeleteButton({
  children = 'Supprimer',
  ...props
}: Omit<ActionButtonProps, 'variant'>) {
  return (
    <ActionButton variant="danger" {...props}>
      {children}
    </ActionButton>
  );
}
