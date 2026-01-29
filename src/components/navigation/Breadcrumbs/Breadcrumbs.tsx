'use client';

import React from 'react';
import { useBreadcrumbs } from '@/hooks/navigation';
import { BreadcrumbItem } from './BreadcrumbItem';
import { cn } from '@/lib/utils';

export interface BreadcrumbsProps {
  className?: string;
  /** Override breadcrumbs (sinon dérivés du pathname) */
  items?: { label: string; href?: string; id?: string }[];
}

export const Breadcrumbs = React.memo(function Breadcrumbs({
  className,
  items: itemsOverride,
}: BreadcrumbsProps) {
  const itemsFromHook = useBreadcrumbs();
  const items = itemsOverride ?? itemsFromHook;

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={cn('flex items-center overflow-x-auto py-1', className)}
    >
      <ol className="flex items-center gap-1 flex-wrap min-w-0">
        {items.map((item, index) => (
          <BreadcrumbItem
            key={item.id ?? item.label ?? index}
            item={item}
            isLast={index === items.length - 1}
          />
        ))}
      </ol>
    </nav>
  );
});
