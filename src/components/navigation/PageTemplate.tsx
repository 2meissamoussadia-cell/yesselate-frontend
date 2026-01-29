'use client';

/**
 * PageTemplate YESSALATE BMO — Layout page + SubNavigation contextuelle
 * Intègre la SubNavigation (tabs/filtres/menu) selon la route
 * Design 100% YESSALATE BMO
 */

import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SubNavigation } from './SubNavigation';
import type { SubNavContext } from '../../types/navigation';

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
        { id: 'raci', label: 'RACI', path: `${base}/governance/raci` },
        { id: 'alertes', label: 'Alertes', path: `${base}/governance/alertes` },
        { id: 'decisions', label: 'Décisions', path: `${base}/governance/decisions` },
        { id: 'budget', label: 'Budget', path: `${base}/governance/budget` },
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
  const contextFromPath = useMemo(() => getSubNavContextForPath(pathname ?? ''), [pathname]);
  const subNavContext = subNavContextProp ?? contextFromPath;

  return (
    <div
      className={cn('flex flex-col flex-1 min-h-0 min-w-0 max-w-full overflow-x-hidden overflow-hidden', className)}
      role="main"
      aria-label={title}
    >
      {subNavContext && (
        <SubNavigation context={subNavContext} activePath={pathname ?? undefined} />
      )}
      <div
        className={cn(
          'flex-1 min-h-0 min-w-0 max-w-full overflow-x-hidden overflow-y-auto',
          !fullBleed && 'p-4 sm:p-6'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export default PageTemplate;
