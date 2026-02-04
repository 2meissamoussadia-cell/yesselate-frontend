'use client';

/**
 * MobileNavigation — Navigation mobile bottom bar (style Outlook/Teams)
 * 
 * Caractéristiques :
 * - Barre fixe en bas sur mobile
 * - 4-5 onglets principaux
 * - Indicateurs de badge
 * - Animations de sélection
 * - Safe area pour iPhone
 */

import React from 'react';
import { cn } from '@/lib/cn';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Bell,
  FileText,
  Users,
  Settings,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

export interface MobileNavItem {
  /** ID unique */
  id: string;
  /** Label affiché */
  label: string;
  /** Icône Lucide */
  icon: LucideIcon;
  /** URL de navigation */
  href: string;
  /** Badge compteur */
  badge?: number;
  /** Actif (calculé automatiquement si non fourni) */
  active?: boolean;
}

export interface MobileNavigationProps {
  /** Items de navigation */
  items?: MobileNavItem[];
  /** Item actif (optionnel, sinon basé sur URL) */
  activeId?: string;
  /** Callback de sélection */
  onSelect?: (item: MobileNavItem) => void;
  /** Classes additionnelles */
  className?: string;
}

const defaultItems: MobileNavItem[] = [
  { id: 'home', label: 'Accueil', icon: Home, href: '/bmo' },
  { id: 'alerts', label: 'Alertes', icon: Bell, href: '/bmo/alertes' },
  { id: 'demandes', label: 'Demandes', icon: FileText, href: '/bmo/demandes' },
  { id: 'equipe', label: 'Équipe', icon: Users, href: '/bmo/equipe' },
  { id: 'more', label: 'Plus', icon: MoreHorizontal, href: '/bmo/plus' },
];

export function MobileNavigation({
  items = defaultItems,
  activeId,
  onSelect,
  className,
}: MobileNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        'mobile-bottom-nav', // Classe CSS pour responsive
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800',
        // Safe area pour iPhone
        'pb-safe',
        // Masqué sur desktop
        'md:hidden',
        className
      )}
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex items-center justify-around h-14 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeId 
            ? activeId === item.id 
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onSelect?.(item)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-inset',
                isActive
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-slate-500 dark:text-slate-400'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <Icon className={cn(
                  'w-6 h-6 transition-transform duration-150',
                  isActive && 'scale-110'
                )} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1 min-w-[18px] h-[18px]',
                      'flex items-center justify-center',
                      'bg-red-500 text-white text-[10px] font-bold rounded-full',
                      'px-1'
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium mt-1',
                'transition-colors duration-150'
              )}>
                {item.label}
              </span>
              {/* Indicateur actif */}
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-sky-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * MobileHeader — En-tête mobile avec titre et actions
 */
export interface MobileHeaderProps {
  /** Titre */
  title: string;
  /** Sous-titre */
  subtitle?: string;
  /** Action de retour */
  onBack?: () => void;
  /** Actions à droite */
  actions?: Array<{
    icon: LucideIcon;
    label: string;
    onClick: () => void;
    badge?: number;
  }>;
  /** Classes additionnelles */
  className?: string;
}

export function MobileHeader({
  title,
  subtitle,
  onBack,
  actions = [],
  className,
}: MobileHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        'bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800',
        'px-4 py-3',
        // Safe area pour iPhone
        'pt-safe',
        // Masqué sur desktop
        'md:hidden',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={cn(
              'p-2 -ml-2 rounded-lg',
              'hover:bg-slate-100 dark:hover:bg-slate-800',
              'transition-colors'
            )}
            aria-label="Retour"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                type="button"
                onClick={action.onClick}
                className={cn(
                  'relative p-2 rounded-lg',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  'transition-colors'
                )}
                aria-label={action.label}
              >
                <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                {action.badge !== undefined && action.badge > 0 && (
                  <span
                    className={cn(
                      'absolute top-1 right-1 min-w-[14px] h-[14px]',
                      'flex items-center justify-center',
                      'bg-red-500 text-white text-[9px] font-bold rounded-full',
                      'px-0.5'
                    )}
                  >
                    {action.badge > 9 ? '9+' : action.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

/**
 * MobilePageLayout — Layout complet pour pages mobiles
 */
export function MobilePageLayout({
  children,
  title,
  subtitle,
  onBack,
  headerActions,
  navItems,
  showNav = true,
  className,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  headerActions?: MobileHeaderProps['actions'];
  navItems?: MobileNavItem[];
  showNav?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col min-h-screen md:hidden', className)}>
      <MobileHeader
        title={title}
        subtitle={subtitle}
        onBack={onBack}
        actions={headerActions}
      />
      
      <main className={cn(
        'flex-1 overflow-y-auto',
        showNav && 'pb-16' // Espace pour la nav bottom
      )}>
        {children}
      </main>

      {showNav && <MobileNavigation items={navItems} />}
    </div>
  );
}
