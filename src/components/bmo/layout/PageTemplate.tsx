'use client';

/**
 * PageTemplate BMO — Header compact + breadcrumbs + corps centré.
 * Lit bmoModules pour titre/description selon le pathname.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { bmoModules, getModuleByPath } from '@/lib/navigation/bmoModules';

export interface BmoPageTemplateProps {
  title?: string;
  description?: string;
  actionsSlot?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  children: React.ReactNode;
  className?: string;
}

export function BmoPageTemplate({
  title,
  description,
  actionsSlot,
  breadcrumbs: breadcrumbsProp,
  children,
  className,
}: BmoPageTemplateProps) {
  const pathname = usePathname();
  const currentModule = getModuleByPath(pathname ?? '');

  const effectiveTitle = title ?? currentModule?.label ?? 'BMO';
  const effectiveDescription = description ?? currentModule?.description;

  const breadcrumbs = breadcrumbsProp ?? [
    { label: 'Pilotage', href: '/maitre-ouvrage/cockpit' },
    { label: currentModule?.label ?? 'BMO' },
  ];

  return (
    <div className={cn('flex flex-col h-full min-h-0 min-w-0', className)}>
      <header className="shrink-0 border-b border-slate-800/70 bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 sm:px-6 py-2 min-w-0">
          <nav
            aria-label="Fil d'Ariane"
            className="flex items-center gap-1 shrink-0 overflow-x-auto text-[11px] text-slate-400"
          >
            {breadcrumbs.map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-0.5 shrink-0"
              >
                {i > 0 && (
                  <ChevronRight className="h-3 w-3 text-slate-600" aria-hidden />
                )}
                {i < breadcrumbs.length - 1 && item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-slate-200 transition-colors truncate"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={
                      i === breadcrumbs.length - 1
                        ? 'text-slate-200 font-medium truncate'
                        : 'truncate'
                    }
                    aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
          {actionsSlot && (
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              {actionsSlot}
            </div>
          )}
        </div>
        <h1 className="px-4 sm:px-6 text-sm font-semibold text-slate-50 truncate border-t border-slate-800/50 pt-2 pb-1">
          {effectiveTitle}
        </h1>
        {effectiveDescription && (
          <p className="px-4 sm:px-6 pb-2 text-[11px] text-slate-400 line-clamp-1">
            {effectiveDescription}
          </p>
        )}
      </header>

      <div
        className="flex-1 min-h-0 min-w-0 max-w-full overflow-x-hidden overflow-y-auto bg-slate-950/40 px-4 sm:px-6 py-3"
        aria-label="Contenu principal"
      >
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </div>
    </div>
  );
}
