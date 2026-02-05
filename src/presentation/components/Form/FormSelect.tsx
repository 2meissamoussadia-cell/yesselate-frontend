/**
 * FormSelect Component
 * Select de formulaire basé sur le design system (Radix Select)
 */

'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FormSelectProps {
  error?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  name?: string;
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ error, options, placeholder, value = '', onChange, onValueChange, disabled, className }, ref) => {
    const selectValue = value === '' ? '__empty__' : value;
    const handleChange = (v: string) => {
      const raw = v === '__empty__' ? '' : v;
      onValueChange?.(raw);
      onChange?.({ target: { value: raw } });
    };

    return (
      <Select
        value={selectValue}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border bg-slate-800 text-slate-200',
            'focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'transition-colors',
            error
              ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50'
              : 'border-slate-700/50',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {placeholder && (
            <SelectItem value="__empty__" disabled>
              {placeholder}
            </SelectItem>
          )}
          {options.map(option => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
);

FormSelect.displayName = 'FormSelect';
