'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/lib/navigation/types';

export interface BreadcrumbItemProps {
  item: BreadcrumbItemType;
  isLast?: boolean;
  className?: string;
}

export const BreadcrumbItem = React.memo(function BreadcrumbItem({
  item,
  isLast = false,
  className,
}: BreadcrumbItemProps) {
  const content = (
    <span className="text-slate-300 truncate max-w-[140px] sm:max-w-[200px]">
      {item.label}
    </span>
  );

  return (
    <li
      className={cn(
        'flex items-center gap-1.5 text-sm shrink-0',
        isLast && 'text-orange-400 font-medium',
        className
      )}
      aria-current={isLast ? 'page' : undefined}
    >
      {!isLast && item.href ? (
        <Link
          href={item.href}
          className="hover:text-orange-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 rounded"
          aria-label={item.label}
        >
          {content}
        </Link>
      ) : (
        content
      )}
      {!isLast && (
        <ChevronRight
          className="w-4 h-4 text-slate-400 shrink-0"
          aria-hidden
        />
      )}
    </li>
  );
});
