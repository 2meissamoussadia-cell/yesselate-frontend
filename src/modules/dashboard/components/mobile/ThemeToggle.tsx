/**
 * Toggle thème : System (OS) / Dark / Dakar (soleil) / Light
 * Bouton tactile 44x44px minimum
 * Si "System", suit la préférence préférée du système (prefers-color-scheme).
 */

'use client';

import React, { useEffect } from 'react';
import { Sun, Moon, CloudSun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardThemeStore, applyTheme, subscribeSystemTheme, type DashboardTheme } from '@/lib/stores/dashboardThemeStore';
import { touchTarget } from '../../utils/dashboardDesignTokens';

const THEMES: { id: DashboardTheme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'system', label: 'Système (auto)', icon: Monitor },
  { id: 'dark', label: 'Sombre', icon: Moon },
  { id: 'dakar', label: 'Dakar (soleil)', icon: CloudSun },
  { id: 'light', label: 'Clair', icon: Sun },
];

export function ThemeToggle() {
  const theme = useDashboardThemeStore((s) => s.theme);
  const setTheme = useDashboardThemeStore((s) => s.setTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    return subscribeSystemTheme(() => applyTheme('system'));
  }, [theme]);

  return (
    <div className="flex items-center gap-1 rounded-xl bg-slate-800/60 p-1">
      {THEMES.map((t) => {
        const Icon = t.icon;
        const active = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={cn(
              touchTarget.iconButton,
              'rounded-lg transition-colors',
              active
                ? 'bg-slate-700 text-amber-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
            )}
            aria-label={t.label}
            aria-pressed={active}
            title={t.label}
          >
            <Icon className="h-5 w-5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}
