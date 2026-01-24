/**
 * Breadcrumbs (fil d’Ariane) calé sur l’URL (source de vérité)
 * Objectif : éviter les désynchronisations store/context → UI figée
 */

'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronRight, Home } from 'lucide-react';
import { getNavigationConfig } from '../utils/routeValidation';

const formatLabel = (s: string) => s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function DashboardBreadcrumbs({ className }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();

  const main = (params.get('main') || 'overview') as string;
  const sub = (params.get('sub') || '') as string;
  const leaf = (params.get('leaf') || '') as string;

  const config = useMemo(() => getNavigationConfig(), []);
  const mainConf = config[main];

  const mainLabel = mainConf?.label ?? formatLabel(main);
  const subLabel = sub ? mainConf?.sub?.[sub]?.label ?? formatLabel(sub) : null;
  const leafLabel =
    leaf && sub ? mainConf?.sub?.[sub]?.leaf?.[leaf]?.label ?? formatLabel(leaf) : null;

  const go = (next: { main?: string; sub?: string; leaf?: string }) => {
    const nextMain = next.main ?? main;
    const nextSub = next.sub ?? (next.main ? '' : sub);
    const nextLeaf = next.leaf ?? (next.sub || next.main ? '' : leaf);

    const sp = new URLSearchParams(params.toString());
    sp.set('main', nextMain);
    if (nextSub) sp.set('sub', nextSub);
    else sp.delete('sub');
    if (nextLeaf) sp.set('leaf', nextLeaf);
    else sp.delete('leaf');

    router.push(`/maitre-ouvrage/dashboard?${sp.toString()}`);
  };

  return (
    <nav className={cn('flex items-center gap-2 text-sm', className)} aria-label="Fil d’Ariane">
      <button
        type="button"
        onClick={() => go({ main: 'overview', sub: '', leaf: '' })}
        className={cn(
          'group inline-flex items-center gap-2 rounded-lg px-2 py-1',
          'text-slate-400 transition-colors hover:bg-slate-900/40 hover:text-slate-200'
        )}
        title="Accueil"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Tableau de bord</span>
        <span className="sm:hidden">Accueil</span>
      </button>

      <ChevronRight className="h-4 w-4 text-slate-600" />

      <button
        type="button"
        onClick={() => go({ main })}
        className="rounded-lg px-2 py-1 text-slate-200 transition-colors hover:bg-slate-900/40"
      >
        {mainLabel}
      </button>

      {subLabel ? (
        <>
          <ChevronRight className="h-4 w-4 text-slate-600" />
          <button
            type="button"
            onClick={() => go({ main, sub })}
            className="rounded-lg px-2 py-1 text-slate-200 transition-colors hover:bg-slate-900/40"
          >
            {subLabel}
          </button>
        </>
      ) : null}

      {leafLabel ? (
        <>
          <ChevronRight className="h-4 w-4 text-slate-600" />
          <span className="rounded-lg px-2 py-1 font-medium text-slate-100">{leafLabel}</span>
        </>
      ) : null}
    </nav>
  );
}
