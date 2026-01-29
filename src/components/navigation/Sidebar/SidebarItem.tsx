'use client';

/**
 * Item de navigation sidebar - Design YESSALATE BMO
 * Ligne cliquable : icône optionnelle, label, badge optionnel, état actif, barre bleue.
 * Si href est fourni, rend un Link ; sinon un button (section dépliable).
 */

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SidebarBadge, type SidebarBadgeProps } from './SidebarBadge';

export interface SidebarItemProps {
  id: string;
  label: string;
  /** Icône (composant React avec className ou string emoji) */
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  /** Badge affiché à droite */
  badge?: number | string;
  badgeVariant?: SidebarBadgeProps['variant'];
  /** A des enfants (section dépliable) — ignoré si href est défini */
  hasChildren?: boolean;
  /** Section ouverte (chevron down vs right) */
  isExpanded?: boolean;
  /** Route/item actif */
  isActive?: boolean;
  /** Lien de navigation — si défini, rend un Link au lieu d'un button */
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  /** Pour tooltip / aria-label étendu */
  ariaLabel?: string;
  /** Texte du tooltip au survol (optionnel) */
  tooltipLabel?: string;
  children?: React.ReactNode;
}

const itemContentClasses =
  'relative w-full min-h-[44px] px-3 py-2 rounded-xl text-left transition-all duration-200 flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

function renderIcon(
  icon: SidebarItemProps['icon'],
  isActive: boolean
): React.ReactNode {
  if (icon == null) return null;
  if (typeof icon === 'object' && React.isValidElement(icon))
    return <span className="flex-shrink-0 text-base">{icon}</span>;
  const IconComponent = icon as React.ComponentType<{ className?: string }>;
  return (
    <IconComponent
      className={cn(
        'h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0',
        isActive ? 'text-slate-200' : 'text-slate-400'
      )}
    />
  );
}

export const SidebarItem = React.memo(function SidebarItem({
  id,
  label,
  icon,
  badge,
  badgeVariant,
  hasChildren = false,
  isExpanded = false,
  isActive = false,
  href,
  onClick,
  className,
  ariaLabel,
  tooltipLabel,
  children,
}: SidebarItemProps) {
  const labelAria = ariaLabel ?? (badge ? `${label}, ${badge} éléments` : label);
  const isLink = Boolean(href);
  const showChildren = hasChildren && !isLink && isExpanded && children;
  const hasTooltip = Boolean(tooltipLabel);

  const content = (
    <>
      {isActive && (
        <span
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-blue-500"
          aria-hidden
        />
      )}
      {hasChildren && !isLink && (
        <span className="flex-shrink-0" aria-hidden>
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
          )}
        </span>
      )}
      {renderIcon(icon, isActive)}
      <span className="flex-1 truncate min-w-0 text-xs sm:text-sm">{label}</span>
      {badge !== undefined && badge !== null && (
        <SidebarBadge
          count={badge}
          variant={badgeVariant}
          hideZero={false}
          className="ml-auto"
        />
      )}
    </>
  );

  const linkOrButton = isLink ? (
    <Link
      href={href!}
      className={cn(
        itemContentClasses,
        isActive
          ? 'bg-slate-800/50 text-slate-50 border border-slate-700/60 shadow-sm'
          : 'text-slate-300 hover:text-slate-50 hover:bg-slate-900/40 border border-transparent'
      )}
      aria-label={labelAria}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  ) : (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        itemContentClasses,
        isActive
          ? 'bg-slate-800/50 text-slate-50 border border-slate-700/60 shadow-sm'
          : 'text-slate-300 hover:text-slate-50 hover:bg-slate-900/40 border border-transparent'
      )}
      aria-label={labelAria}
      aria-current={isActive ? 'page' : undefined}
      aria-expanded={hasChildren ? isExpanded : undefined}
    >
      {content}
    </button>
  );

  return (
    <div className={cn('relative', className)}>
      {hasTooltip ? (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>{linkOrButton}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltipLabel}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        linkOrButton
      )}
      {showChildren && (
        <div className="ml-4 mt-1 space-y-1" role="group" aria-label={label}>
          {children}
        </div>
      )}
    </div>
  );
});
