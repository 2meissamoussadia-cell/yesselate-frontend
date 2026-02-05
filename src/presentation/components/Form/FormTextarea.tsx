/**
 * FormTextarea Component
 * Textarea de formulaire amélioré
 */

'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  resize?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ error, resize = true, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border bg-slate-800 text-slate-200',
          'placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors',
          !resize && 'resize-none',
          error
            ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50'
            : 'border-slate-700/50',
          className
        )}
        {...props}
      />
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

