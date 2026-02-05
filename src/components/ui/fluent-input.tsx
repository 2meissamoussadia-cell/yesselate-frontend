'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface FluentInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const FluentInput = React.forwardRef<HTMLInputElement, FluentInputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg px-3 py-2 text-sm',
          'bg-[rgb(var(--surface))] text-[rgb(var(--text))]',
          'border border-[rgb(var(--border)/0.6)]',
          'ring-offset-[rgb(var(--bg))]',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-[rgb(var(--muted))]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-all duration-200',
          error && 'border-red-500/60 focus-visible:ring-red-500/50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
FluentInput.displayName = 'FluentInput';

export { FluentInput };

