'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

// Bouton "Windows 11 / Fluent-like" en Tailwind (compatible avec ton stack).
const windowsButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ' +
    'disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        // style Fluent "primary" (accent), sans gradient
        default:
          'bg-orange-500 text-white shadow-sm hover:bg-orange-600 active:bg-orange-700 focus-visible:ring-orange-500 ring-offset-white dark:ring-offset-slate-950',
        // bouton neutre (style Windows)
        secondary:
          'bg-white/70 text-slate-900 shadow-sm border border-slate-200 hover:bg-white active:bg-slate-50 focus-visible:ring-slate-400 ring-offset-white',
        // subtile, proche des toolbars Windows
        subtle:
          'bg-slate-100/60 text-slate-900 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400 ring-offset-white',
        outline:
          'border border-slate-300 bg-white/40 text-slate-900 hover:bg-white/70 active:bg-white focus-visible:ring-slate-400 ring-offset-white',
        ghost:
          'bg-transparent text-slate-700 hover:bg-slate-100/60 active:bg-slate-200/60 focus-visible:ring-slate-400 ring-offset-white',
        destructive:
          'bg-red-500 text-white shadow-sm hover:bg-red-600 active:bg-red-700 focus-visible:ring-red-500 ring-offset-white',
        // variants "business"
        success:
          'bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 active:bg-emerald-700 focus-visible:ring-emerald-500 ring-offset-white',
        warning:
          'bg-amber-400 text-slate-900 shadow-sm hover:bg-amber-500 active:bg-amber-600 focus-visible:ring-amber-500 ring-offset-white',
        info:
          'bg-blue-500 text-white shadow-sm hover:bg-blue-600 active:bg-blue-700 focus-visible:ring-blue-500 ring-offset-white',

        // dark variants: on s'appuie sur les classes Tailwind dark:
        // (on ne duplique pas tout : les pages BMO sont majoritairement dark)
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-8 px-3 text-xs',
        xs: 'h-7 px-2 text-[11px]',
        icon: 'h-9 w-9',
      },
      mica: {
        true: 'backdrop-blur-md',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'default',
      mica: true,
    },
  }
);

export interface WindowsButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof windowsButtonVariants> {
  asChild?: boolean;
}

export const WindowsButton = React.forwardRef<HTMLButtonElement, WindowsButtonProps>(
  ({ className, variant, size, mica, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(
          windowsButtonVariants({ variant, size, mica }),
          // ajustements dark mode
          'dark:border-slate-700/60 dark:text-slate-100 dark:ring-offset-slate-950',
          variant === 'secondary' && 'dark:bg-slate-900/40 dark:hover:bg-slate-900/60 dark:active:bg-slate-900/80',
          variant === 'subtle' && 'dark:bg-slate-900/30 dark:hover:bg-slate-900/50 dark:active:bg-slate-900/70',
          variant === 'outline' && 'dark:bg-slate-900/20 dark:hover:bg-slate-900/50',
          className
        )}
        {...props}
      />
    );
  }
);
WindowsButton.displayName = 'WindowsButton';


