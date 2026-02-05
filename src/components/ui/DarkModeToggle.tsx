'use client';

/**
 * DarkModeToggle — Bascule mode sombre (ERP BTP).
 * Palette adaptée, choix sauvegardé (store persist), aria-label.
 */

import React from 'react';
import { cn } from '@/lib/cn';
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
        'theme-toggle p-2 rounded-lg border transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-sky-500/60 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950',
        darkMode
          ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/15'
          : 'border-slate-300 bg-slate-900/5 text-slate-900 hover:bg-slate-900/10',
        className
      )}
      aria-label={label}
      aria-pressed={darkMode}
      title={label}
    >
      {useIcons ? (
        darkMode ? (
          <Sun className="h-5 w-5 text-amber-400" aria-hidden />
        ) : (
          <Moon className="h-5 w-5 text-slate-600 dark:text-slate-400" aria-hidden />
        )
      ) : (
        <span className="text-base" aria-hidden>
          {darkMode ? '☀️' : '🌙'}
        </span>
      )}
    </button>
  );
}
