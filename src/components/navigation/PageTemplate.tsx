'use client';

/**
 * PageTemplate YESSALATE BMO — Layout page + Breadcrumbs + SubNavigation contextuelle
 * Design unifié portail maître-ouvrage (tokens dashboard, viewport, overflow)
 */

import React, { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubNavigation } from './SubNavigation';
import type { SubNavContext } from '../../types/navigation';
import { useNavigation } from '@/hooks/navigation';

export interface PageTemplateProps {
  children: React.ReactNode;
  /** Contexte pour la SubNavigation (tabs, filtres, actions). Si null, pas de barre. */
  subNavContext?: SubNavContext | null;
  /** Titre de la page (optionnel, pour accessibilité) */
  title?: string;
  className?: string;
  /** Contenu en full-bleed sans padding */
  fullBleed?: boolean;
}

/** Map pathname → contexte SubNav (à enrichir par module) */
function getSubNavContextForPath(pathname: string): SubNavContext | null {
  if (!pathname) return null;
  const base = '/maitre-ouvrage';
  if (pathname.startsWith(`${base}/demandes`)) {
    return {
      title: 'Demandes',
      tabs: [
        { id: 'pending', label: 'En attente', path: `${base}/demandes`, count: 14 },
        { id: 'validated', label: 'Validées', path: `${base}/demandes/validees` },
        { id: 'rejected', label: 'Rejetées', path: `${base}/demandes/rejetees` },
      ],
      filters: [
        { id: 'all', label: 'Toutes', value: 'all', active: true },
        { id: 'urgent', label: 'Urgentes', value: 'urgent', active: false },
      ],
      actions: [
        { id: 'new', label: 'Nouvelle demande', onClick: () => {} },
        { id: 'export', label: 'Exporter', onClick: () => {} },
      ],
    };
  }
  if (pathname.startsWith(`${base}/validation-bc`)) {
    return {
      title: 'Validation BC / Factures',
      tabs: [
        { id: 'factures', label: 'Factures', path: `${base}/validation-bc`, count: 8 },
        { id: 'bc', label: 'Bons de commande', path: `${base}/validation-bc/bc` },
        { id: 'avenants', label: 'Avenants', path: `${base}/validation-bc/avenants` },
      ],
    };
  }
  if (pathname.startsWith(`${base}/validation-contrats`)) {
    return {
      title: 'Validation Contrats',
      tabs: [
        { id: 'pending', label: 'En attente', path: `${base}/validation-contrats` },
        { id: 'signed', label: 'Signés', path: `${base}/validation-contrats/signed` },
      ],
    };
  }
  if (pathname.startsWith(`${base}/validation-paiements`)) {
    return {
      title: 'Validation Paiements',
      tabs: [
        { id: 'pending', label: 'À valider', path: `${base}/validation-paiements` },
        { id: 'scheduled', label: 'Planifiés', path: `${base}/validation-paiements/scheduled` },
        { id: 'validated', label: 'Validés', path: `${base}/validation-paiements/validated` },
      ],
    };
  }
  if (pathname.startsWith(`${base}/governance`)) {
    return {
      title: 'Gouvernance',
      tabs: [
        { id: 'dashboard', label: 'Tableau de bord', path: `${base}/governance/dashboard` },
        { id: 'arbitrages', label: 'Arbitrages', path: `${base}/governance/arbitrages` },
        { id: 'attention', label: 'Attention', path: `${base}/governance/attention` },
        { id: 'conformite', label: 'Conformité', path: `${base}/governance/conformite` },
        { id: 'synthese', label: 'Synthèse', path: `${base}/governance/synthese` },
        { id: 'tendances', label: 'Tendances', path: `${base}/governance/tendances` },
      ],
    };
  }
  if (pathname.startsWith(`${base}/alerts`)) {
    return {
      title: 'Centre d\'alertes',
      tabs: [
        { id: 'overview', label: 'Vue d\'ensemble', path: `${base}/alerts` },
        { id: 'critiques', label: 'Critiques', path: `${base}/alerts/critiques` },
        { id: 'projets', label: 'Projets', path: `${base}/alerts/projets` },
        { id: 'rh', label: 'RH', path: `${base}/alerts/rh` },
        { id: 'sla', label: 'SLA', path: `${base}/alerts/sla` },
      ],
    };
  }
  return null;
}

export function PageTemplate({
  children,
  subNavContext: subNavContextProp,
  title,
  className,
  fullBleed = false,
}: PageTemplateProps) {
  const pathname = usePathname();
  const { breadcrumbs } = useNavigation();
  const contextFromPath = useMemo(() => getSubNavContextForPath(pathname ?? ''), [pathname]);
  const subNavContext = subNavContextProp ?? contextFromPath;

  return (
    <div
      className={cn('flex flex-col flex-1 min-h-0 min-w-0 max-w-full overflow-x-hidden overflow-hidden', className)}
      role="main"
      aria-label={title}
    >
      {/* Fil d'Ariane — design unifié portail */}
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Fil d'Ariane"
          className="flex items-center gap-1 px-4 sm:px-6 py-2 border-b border-slate-800/60 bg-slate-950/40 min-w-0 overflow-x-auto text-xs text-slate-400"
        >
          {breadcrumbs.map((item, i) => (
            <span key={(item.id ?? item.href ?? '') + i} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-600" aria-hidden />}
              {i < breadcrumbs.length - 1 && item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-slate-200 transition-colors truncate max-w-[140px] sm:max-w-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={i === breadcrumbs.length - 1 ? 'text-slate-200 font-medium truncate max-w-[180px] sm:max-w-none' : 'truncate max-w-[140px] sm:max-w-none'}
                  aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      )}
      {subNavContext && (
        <SubNavigation context={subNavContext} activePath={pathname ?? undefined} />
      )}
      <div
        className={cn(
          'flex-1 min-h-0 min-w-0 max-w-full overflow-x-hidden overflow-y-auto bg-slate-950/30',
          !fullBleed && 'p-4 sm:p-6'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default PageTemplate;
