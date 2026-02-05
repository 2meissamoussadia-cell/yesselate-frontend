'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg px-3 py-2 text-sm',
          'bg-[rgb(var(--surface))] text-[rgb(var(--text))]',
          'border border-[rgb(var(--border)/0.6)]',
          'ring-offset-[rgb(var(--bg))]',
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
Textarea.displayName = 'Textarea';

export { Textarea };

