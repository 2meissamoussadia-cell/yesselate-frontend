/**
 * FormFieldGroup Component
 * Groupe de champs de formulaire
 */

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface FormFieldGroupProps {
  children: ReactNode;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function FormFieldGroup({
  children,
  label,
  description,
  error,
  required,
  className,
  columns = 1,
}: FormFieldGroupProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {(label || description) && (
        <div>
          {label && (
            <label className="block text-sm font-medium text-slate-200 mb-1">
              {label}
              {required && <span className="text-red-400 ml-1">*</span>}
            </label>
          )}
          {description && (
            <p className="text-xs text-slate-400">{description}</p>
          )}
        </div>
      )}
      <div className={cn('grid gap-4', gridCols[columns])}>
        {children}
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

