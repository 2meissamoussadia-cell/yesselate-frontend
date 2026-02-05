/**
 * Card Variants Component
 * Variantes de cartes améliorées
 */

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  className,
  padding = true,
  hover = false,
  interactive = false,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-slate-700/50 bg-slate-900',
        padding && 'p-6',
        hover && 'hover:border-slate-600 transition-colors',
        interactive && 'cursor-pointer hover:shadow-lg transition-all',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * CardHeader
 */
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div className="flex-1">{children}</div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

/**
 * CardTitle
 */
interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({
  children,
  className,
  as: Component = 'h3',
}: CardTitleProps) {
  return (
    <Component className={cn('text-lg font-semibold text-slate-200', className)}>
      {children}
    </Component>
  );
}

/**
 * CardDescription
 */
interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-slate-400 mt-1', className)}>
      {children}
    </p>
  );
}

/**
 * CardContent
 */
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('', className)}>
      {children}
    </div>
  );
}

/**
 * CardFooter
 */
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-slate-700/50', className)}>
      {children}
    </div>
  );
}

