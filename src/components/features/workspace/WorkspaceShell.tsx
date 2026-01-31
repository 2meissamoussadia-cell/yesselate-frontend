'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { FluentResponsiveContainer } from '@/components/ui/fluent-responsive-container';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { ThemeToggle } from '@/components/features/bmo/ThemeToggle';

export type ShellAction = {
  id: string;
  label: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md';
  title?: string;
  disabled?: boolean;
  onClick: () => void;
};

export type ShellBadge = {
  label: string;
  color?: 'purple' | 'amber' | 'slate' | 'emerald' | 'rose' | 'blue';
};

type Props = {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;

  badges?: ShellBadge[];

  actions?: ShellAction[];
  actionSeparators?: number[]; // ex: [4] => séparateur après l'index 4

  Tabs: React.ReactNode;

  showDashboard: boolean;
  Dashboard?: React.ReactNode;
  Content: React.ReactNode;

  Banner?: React.ReactNode;
  FooterOverlays?: React.ReactNode;

  showThemeToggle?: boolean;
};

/**
 * Palette de badges avec couleurs plus douces et professionnelles
 */
const badgeClass = (color: ShellBadge['color']) => {
  switch (color) {
    case 'purple':
      return 'bg-purple-100/60 text-purple-700/90 border-purple-200/50 dark:bg-purple-900/20 dark:text-purple-300/90 dark:border-purple-700/30';
    case 'amber':
      return 'bg-amber-100/60 text-amber-700/90 border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-300/90 dark:border-amber-700/30';
    case 'emerald':
      return 'bg-emerald-100/60 text-emerald-700/90 border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-300/90 dark:border-emerald-700/30';
    case 'rose':
      return 'bg-rose-100/60 text-rose-700/90 border-rose-200/50 dark:bg-rose-900/20 dark:text-rose-300/90 dark:border-rose-700/30';
    case 'blue':
      return 'bg-blue-100/60 text-blue-700/90 border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-300/90 dark:border-blue-700/30';
    case 'slate':
    default:
      return 'bg-slate-100/60 text-slate-700/90 border-slate-200/50 dark:bg-slate-800/30 dark:text-slate-300/90 dark:border-slate-600/30';
  }
};

export function WorkspaceShell({
  icon,
  title,
  subtitle,
  badges = [],
  actions = [],
  actionSeparators = [],
  Tabs,
  showDashboard,
  Dashboard,
  Content,
  Banner,
  FooterOverlays,
  showThemeToggle = true,
}: Props) {
  return (
    <FluentResponsiveContainer variant="full" className="py-4 space-y-4 min-h-screen">
      {/* Header / Command bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {icon}
              <h1 className="text-2xl font-bold text-[rgb(var(--text))] truncate">{title}</h1>
            </div>
            {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}

            {badges.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {badges.map((b, idx) => (
                  <span
                    key={`${b.label}-${idx}`}
                    className={cn(
                      'px-2 py-1 rounded-lg text-xs border backdrop-blur',
                      badgeClass(b.color)
                    )}
                  >
                    {b.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2">
            {showThemeToggle && <ThemeToggle />}

            {actions.map((a, idx) => (
              <React.Fragment key={a.id}>
                <Button
                  size={a.size ?? 'sm'}
                  variant={a.variant ?? 'secondary'}
                  onClick={a.onClick}
                  disabled={a.disabled}
                  title={a.title}
                  aria-label={typeof a.title === 'string' ? a.title : undefined}
                >
                  {a.label}
                </Button>

                {actionSeparators.includes(idx) && (
                  <span className="mx-1 h-7 w-px bg-slate-200 dark:bg-slate-700/70" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {Banner}
      </div>

      {/* Tabs bar (anti-bug overflow) */}
      <div className="rounded-2xl border border-slate-200/70 bg-white/70 dark:border-slate-800 dark:bg-[#1f1f1f]/60 backdrop-blur-md">
        <div className="w-full overflow-x-auto">
          <div className="min-w-max px-2 py-2">{Tabs}</div>
        </div>
      </div>

      {/* Content area */}
      <div className="min-h-[520px]">
        {showDashboard ? Dashboard : Content}
      </div>

      {FooterOverlays}
    </FluentResponsiveContainer>
  );
}
