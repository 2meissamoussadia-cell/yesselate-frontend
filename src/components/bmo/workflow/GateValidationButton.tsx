'use client';

/**
 * GateValidationButton — Bouton de validation de gate (phase fil conducteur).
 */

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface GateValidationButtonProps {
  phase: number;
  label?: string;
  onValidate?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function GateValidationButton({
  phase,
  label = `Valider Gate #${phase}`,
  onValidate,
  disabled = false,
  loading = false,
  className,
}: GateValidationButtonProps) {
  return (
    <button
      type="button"
      onClick={onValidate}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
        'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40',
        'hover:bg-emerald-600/30 hover:border-emerald-500/60 transition-colors',
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" aria-hidden />
      ) : (
        <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
      )}
      <span>{label}</span>
    </button>
  );
}
