'use client';

/**
 * DarkModeToggle — Bascule mode sombre (ERP BTP).
 * Palette adaptée, choix sauvegardé (store persist), aria-label.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { Sun, Moon } from 'lucide-react';

export interface DarkModeToggleProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  className?: string;
  /** Utiliser icônes Lucide au lieu d'emoji */
  useIcons?: boolean;
}

export function DarkModeToggle({
  darkMode,
  setDarkMode,
  className,
  useIcons = true,
}: DarkModeToggleProps) {
  const label = darkMode
    ? 'Activer le mode clair'
    : 'Activer le mode sombre';

  return (
    <button
      type="button"
      onClick={() => setDarkMode(!darkMode)}
      className={cn(
        'p-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100',
        'hover:bg-slate-800 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-950',
        'dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700',
        className
      )}
      aria-label={label}
      title={label}
    >
      {useIcons ? (
        darkMode ? (
          <Sun className="h-5 w-5 text-amber-400" aria-hidden />
        ) : (
          <Moon className="h-5 w-5 text-slate-400" aria-hidden />
        )
      ) : (
        <span className="text-base" aria-hidden>
          {darkMode ? '☀️' : '🌙'}
        </span>
      )}
    </button>
  );
}
