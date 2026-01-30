/**
 * SubNav Engagements & Finances — Demandes → Engagements → Factures → Paiements.
 * Module de référence pour tous les flux d'argent et d'engagement (ERP BTP).
 */

import type { SubNavContext } from '@/types/navigation';

const base = '/maitre-ouvrage/engagements';

export const engagementsFinancesSubNav: SubNavContext = {
  title: 'Engagements & Finances',
  tabs: [
    { id: 'overview', label: 'Synthèse', path: base },
    { id: 'requests', label: 'Demandes', path: `${base}/demandes` },
    { id: 'orders', label: 'Bons de commande', path: `${base}/bc` },
    { id: 'invoices', label: 'Factures', path: `${base}/factures` },
    { id: 'payments', label: 'Paiements', path: `${base}/paiements` },
  ],
};
