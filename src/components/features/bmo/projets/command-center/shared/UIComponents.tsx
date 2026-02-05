/**
 * Composants réutilisables pour le Projets Command Center
 * Inspirés du Blocked Command Center
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { LucideIcon } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// STAT CARD - Carte de statistique cliquable
// ═══════════════════════════════════════════════════════════════════════════

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan' | 'orange';
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string | number;
  suffix?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  color,
  trend,
  trendValue,
  suffix,
  onClick,
  className,
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    rose: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    purple: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    orange: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
  };

  const iconColorClasses = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
    orange: 'text-orange-400',
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'p-4 rounded-xl border transition-all text-left',
        colorClasses[color],
        onClick && 'hover:scale-105 cursor-pointer active:scale-95',
        !onClick && 'cursor-default',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className={cn('w-5 h-5', iconColorClasses[color])} />
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
      </div>
      
      <div className="flex items-baseline gap-2">
        <span className={cn('text-2xl font-bold', iconColorClasses[color])}>
          {value}
        </span>
        {suffix && (
          <span className="text-sm text-slate-400">{suffix}</span>
        )}
      </div>

      {(trend || trendValue) && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          {trend && (
            <span className={cn(
              'font-medium',
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          )}
          {trendValue && (
            <span className="text-slate-400">{trendValue}</span>
          )}
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// QUICK ACTION BUTTON - Bouton d'action rapide
// ═══════════════════════════════════════════════════════════════════════════

interface QuickActionButtonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan' | 'orange' | 'green';
  onClick: () => void;
  badge?: string | number;
  disabled?: boolean;
}

export function QuickActionButton({
  icon: Icon,
  title,
  description,
  color,
  onClick,
  badge,
  disabled = false,
}: QuickActionButtonProps) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20 text-rose-400',
    purple: 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-purple-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400',
    orange: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-400',
    green: 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 text-green-400',
  };

  const iconBgClasses = {
    blue: 'bg-blue-500/20',
    emerald: 'bg-emerald-500/20',
    amber: 'bg-amber-500/20',
    rose: 'bg-rose-500/20',
    purple: 'bg-purple-500/20',
    cyan: 'bg-cyan-500/20',
    orange: 'bg-orange-500/20',
    green: 'bg-green-500/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full p-3 rounded-lg border transition-all text-left flex items-center gap-3 group',
        colorClasses[color],
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'hover:scale-102 active:scale-98'
      )}
    >
      <div className={cn('p-2 rounded-lg transition-transform group-hover:scale-110', iconBgClasses[color])}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">{title}</p>
        <p className="text-xs text-slate-400 truncate">{description}</p>
      </div>

      {badge !== undefined && (
        <div className="px-2 py-0.5 rounded-full bg-slate-700/50 text-xs font-medium text-slate-300">
          {badge}
        </div>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION HEADER - En-tête de section
// ═══════════════════════════════════════════════════════════════════════════

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <Icon className="w-5 h-5 text-emerald-400" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-slate-200">{title}</h2>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPTY STATE - État vide
// ═══════════════════════════════════════════════════════════════════════════

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 mb-4">
        <Icon className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-300 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SKELETON LOADER - Chargement skeleton
// ═══════════════════════════════════════════════════════════════════════════

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="h-24 bg-slate-800/50 rounded-xl border border-slate-700/50" />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BADGE WITH ICON - Badge avec icône
// ═══════════════════════════════════════════════════════════════════════════

interface BadgeWithIconProps {
  icon: LucideIcon;
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'critical' | 'info';
  className?: string;
}

export function BadgeWithIcon({
  icon: Icon,
  label,
  variant = 'default',
  className,
}: BadgeWithIconProps) {
  const variantClasses = {
    default: 'bg-slate-600/40 text-slate-400 border-slate-600/50',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      variantClasses[variant],
      className
    )}>
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}

