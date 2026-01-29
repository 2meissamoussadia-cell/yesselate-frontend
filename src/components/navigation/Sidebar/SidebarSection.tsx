'use client';

/**
 * Section dépliable de la sidebar - Design YESSALATE BMO
 * En-tête cliquable + contenu enfant (nested items). Support ARIA et animations fluides.
 */

import React from 'react';
import { SidebarItem } from './SidebarItem';
import type { SidebarItemProps } from './SidebarItem';

export interface SidebarSectionProps {
  id: string;
  label: string;
  /** Icône (composant ou ReactNode, ex. emoji) */
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  badge?: number | string;
  badgeVariant?: SidebarItemProps['badgeVariant'];
  isExpanded: boolean;
  isActive: boolean;
  onToggle: () => void;
  onSelect?: () => void;
  /** Enfants rendus à l'intérieur (autres SidebarItem ou SidebarSection) */
  children: React.ReactNode;
  ariaLabel?: string;
}

export const SidebarSection = React.memo(function SidebarSection({
  id,
  label,
  icon,
  badge,
  badgeVariant,
  isExpanded,
  isActive,
  onToggle,
  onSelect,
  children,
  ariaLabel,
}: SidebarSectionProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect?.();
    onToggle();
  };

  return (
    <SidebarItem
      id={id}
      label={label}
      icon={icon}
      badge={badge}
      badgeVariant={badgeVariant}
      hasChildren
      isExpanded={isExpanded}
      isActive={isActive}
      onClick={handleClick}
      ariaLabel={ariaLabel}
    >
      {children}
    </SidebarItem>
  );
});
