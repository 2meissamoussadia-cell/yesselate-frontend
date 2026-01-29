'use client';

/**
 * Hook breadcrumbs : dérivés du pathname et de la config
 */

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { navigationConfig } from '@/lib/navigation/config';
import { buildBreadcrumbs } from '@/lib/navigation/utils';
import type { BreadcrumbItem } from '@/lib/navigation/types';

export function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname();
  return useMemo(
    () => buildBreadcrumbs(navigationConfig.items, pathname ?? ''),
    [pathname]
  );
}
