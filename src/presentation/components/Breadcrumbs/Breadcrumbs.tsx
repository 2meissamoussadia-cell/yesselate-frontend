/**
 * Breadcrumbs Component
 * Fil d'Ariane amélioré avec navigation
 */

'use client';

import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  homeHref?: string;
  className?: string;
  separator?: React.ReactNode;
  maxItems?: number;
}

export function Breadcrumbs({
  items,
  homeHref = '/',
  className,
  separator = <ChevronRight className="w-4 h-4 text-slate-400" />,
  maxItems = 5,
}: BreadcrumbsProps) {
  // Limiter le nombre d'items si nécessaire
  const displayItems = items.length > maxItems
    ? [
        items[0],
        { label: '...', href: undefined },
        ...items.slice(-(maxItems - 2)),
      ]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-2', className)}>
      <Link
        href={homeHref}
        className="text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="Accueil"
      >
        <Home className="w-4 h-4" />
      </Link>

      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1;
        const isEllipsis = item.label === '...';

        return (
          <div key={index} className="flex items-center gap-2">
            {separator}
            {isEllipsis ? (
              <span className="text-slate-400">...</span>
            ) : isLast ? (
              <span className="text-slate-200 font-medium" aria-current="page">
                {item.icon && <span className="mr-1.5">{item.icon}</span>}
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                href={item.href}
                className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
              >
                {item.icon && item.icon}
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-400">
                {item.icon && <span className="mr-1.5">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

