/**
 * SubNav Gouvernance & Arbitrage — Synthèse, Arbitrages, Points d'attention, Décisions.
 * Pipeline des décisions DG (ERP BTP).
 */

import type { SubNavContext } from '@/types/navigation';

const base = '/maitre-ouvrage/governance';

export const governanceArbitrageSubNav: SubNavContext = {
  title: 'Gouvernance & Arbitrage',
  tabs: [
    { id: 'overview', label: 'Synthèse', path: base },
    { id: 'pending', label: 'Arbitrages à rendre', path: `${base}/arbitrages` },
    { id: 'attention', label: "Points d'attention", path: `${base}/attention` },
    { id: 'decisions', label: 'Décisions & comités', path: `${base}/decisions` },
  ],
};
