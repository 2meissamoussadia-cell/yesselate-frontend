'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

/**
 * FluentCard - Style Windows 11 avec nouveau système de couleurs
 * 
 * Utilise les variables CSS : --surface, --border
 * Effet mica/acrylic avec backdrop-blur
 */
export function FluentCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-xl border backdrop-blur-md',
        'bg-[rgb(var(--surface)/0.82)] dark:bg-[rgb(var(--surface)/0.80)]',
        'border-[rgb(var(--border)/0.55)]',
        'shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.18)]',
        'transition-shadow hover:shadow-[0_6px_24px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_6px_28px_rgba(0,0,0,0.22)]',
        className
      )}
    >
      {children}
    </div>
  );
}

const FluentCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-4', className)}
    {...props}
  />
));
FluentCardHeader.displayName = 'FluentCardHeader';

const FluentCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'font-semibold leading-none tracking-tight',
      'text-[rgb(var(--text))]',
      className
    )}
    {...props}
  />
));
FluentCardTitle.displayName = 'FluentCardTitle';

const FluentCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'text-sm',
      'text-[rgb(var(--muted))]',
      className
    )}
    {...props}
  />
));
FluentCardDescription.displayName = 'FluentCardDescription';

const FluentCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-4 pt-0', className)} {...props} />
));
FluentCardContent.displayName = 'FluentCardContent';

const FluentCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-4 pt-0', className)}
    {...props}
  />
));
FluentCardFooter.displayName = 'FluentCardFooter';

export {
  FluentCard as default,
  FluentCardHeader,
  FluentCardFooter,
  FluentCardTitle,
  FluentCardDescription,
  FluentCardContent,
};
