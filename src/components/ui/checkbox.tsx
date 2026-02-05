'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'checked'> {
  /** true = coché, false = non coché, 'indeterminate' = état intermédiaire (sélection partielle) */
  checked?: boolean | 'indeterminate';
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => {
    const isIndeterminate = checked === 'indeterminate';
    const isChecked = checked === true;

    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!isChecked && !isIndeterminate);
      }
    };

    return (
      <button
        type="button"
        role="checkbox"
        aria-checked={isIndeterminate ? 'mixed' : isChecked}
        disabled={disabled}
        onClick={handleClick}
        style={{ width: 16, height: 16, minWidth: 16, minHeight: 16, maxWidth: 16, maxHeight: 16 }}
        className={cn(
          'peer shrink-0 flex items-center justify-center rounded-sm border border-slate-600 ring-offset-slate-950',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-400',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors',
          isChecked || isIndeterminate
            ? 'bg-blue-600 border-blue-600 text-white'
            : 'bg-transparent hover:border-slate-500',
          className
        )}
      >
        {isChecked && (
          <Check className="h-[9px] w-[9px] text-white shrink-0" strokeWidth={2.5} />
        )}
        {isIndeterminate && !isChecked && (
          <Minus className="h-[9px] w-[9px] text-white shrink-0" strokeWidth={2.5} />
        )}
        <input
          type="checkbox"
          ref={ref}
          checked={isChecked}
          disabled={disabled}
          onChange={() => {}}
          className="sr-only"
          {...props}
        />
      </button>
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };

