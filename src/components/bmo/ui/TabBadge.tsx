'use client';

/**
 * TabBadge — Badges de comptage WCAG compliant pour onglets
 * 
 * Caractéristiques :
 * - Contraste WCAG 2.1 AA (4.5:1 minimum)
 * - État actif/inactif bien différencié
 * - Transition fluide lors du changement
 * - Support animation pour mise à jour
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export interface TabBadgeProps {
  /** Valeur du compteur */
  count: number;
  /** État actif */
  active?: boolean;
  /** Variante de couleur */
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** Taille */
  size?: 'xs' | 'sm' | 'md';
  /** Valeur maximum affichée */
  max?: number;
  /** Animer lors de mise à jour */
  animateOnChange?: boolean;
  /** Classes additionnelles */
  className?: string;
}

const variantConfig = {
  default: {
    inactive: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
    active: 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900',
  },
  primary: {
    inactive: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    active: 'bg-sky-600 text-white dark:bg-sky-500 dark:text-white',
  },
  success: {
    inactive: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    active: 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white',
  },
  warning: {
    inactive: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    active: 'bg-amber-600 text-white dark:bg-amber-500 dark:text-white',
  },
  danger: {
    inactive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    active: 'bg-red-600 text-white dark:bg-red-500 dark:text-white',
  },
};

const sizeConfig = {
  xs: 'min-w-[18px] h-[18px] text-[10px] px-1',
  sm: 'min-w-[22px] h-[22px] text-xs px-1.5',
  md: 'min-w-[26px] h-[26px] text-sm px-2',
};

export function TabBadge({
  count,
  active = false,
  variant = 'default',
  size = 'sm',
  max = 99,
  animateOnChange = true,
  className,
}: TabBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    if (animateOnChange && count !== displayCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayCount(count);
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setDisplayCount(count);
    }
  }, [count, displayCount, animateOnChange]);

  const displayValue = displayCount > max ? `${max}+` : displayCount.toString();
  const colors = variantConfig[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold',
        'transition-all duration-150 ease-out',
        sizeConfig[size],
        active ? colors.active : colors.inactive,
        isAnimating && 'scale-110',
        className
      )}
      aria-label={`${count} élément${count > 1 ? 's' : ''}`}
    >
      {displayValue}
    </span>
  );
}

/**
 * TabWithBadge — Onglet complet avec badge intégré
 */
export interface TabWithBadgeProps {
  /** Label de l'onglet */
  label: string;
  /** Compteur */
  count?: number;
  /** Onglet actif */
  active?: boolean;
  /** Icône (optionnel) */
  icon?: React.ReactNode;
  /** Callback au clic */
  onClick?: () => void;
  /** Variante du badge */
  badgeVariant?: TabBadgeProps['variant'];
  /** Désactivé */
  disabled?: boolean;
  /** Classes additionnelles */
  className?: string;
}

export function TabWithBadge({
  label,
  count,
  active = false,
  icon,
  onClick,
  badgeVariant = 'default',
  disabled = false,
  className,
}: TabWithBadgeProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-2 px-4 py-2.5 rounded-lg',
        'text-sm font-medium whitespace-nowrap',
        'transition-all duration-150 ease-out',
        // Focus styles
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1',
        // Active state
        active ? [
          'bg-white dark:bg-slate-800',
          'text-slate-900 dark:text-slate-100',
          'shadow-sm',
        ] : [
          'bg-transparent',
          'text-slate-600 dark:text-slate-400',
          'hover:bg-slate-100 dark:hover:bg-slate-800/60',
          'hover:text-slate-900 dark:hover:text-slate-200',
        ],
        // Disabled
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
    >
      {icon && (
        <span className={cn(
          'shrink-0 transition-colors',
          active 
            ? 'text-slate-700 dark:text-slate-300' 
            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400'
        )}>
          {icon}
        </span>
      )}
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <TabBadge 
          count={count} 
          active={active} 
          variant={badgeVariant}
          size="xs"
        />
      )}
    </button>
  );
}

/**
 * TabBar — Barre d'onglets complète
 */
export interface TabBarProps<T extends string> {
  /** Onglets */
  tabs: Array<{
    id: T;
    label: string;
    count?: number;
    icon?: React.ReactNode;
    badgeVariant?: TabBadgeProps['variant'];
    disabled?: boolean;
  }>;
  /** ID de l'onglet actif */
  activeTab: T;
  /** Callback de changement */
  onTabChange: (tabId: T) => void;
  /** Classes additionnelles */
  className?: string;
}

export function TabBar<T extends string>({
  tabs,
  activeTab,
  onTabChange,
  className,
}: TabBarProps<T>) {
  return (
    <div
      role="tablist"
      aria-label="Vues"
      className={cn(
        'flex items-center gap-1 p-1',
        'bg-slate-100 dark:bg-slate-900/50 rounded-xl',
        className
      )}
    >
      {tabs.map((tab) => (
        <TabWithBadge
          key={tab.id}
          label={tab.label}
          count={tab.count}
          icon={tab.icon}
          active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          badgeVariant={tab.badgeVariant}
          disabled={tab.disabled}
        />
      ))}
    </div>
  );
}
