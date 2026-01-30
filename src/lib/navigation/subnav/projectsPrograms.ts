/**
 * SubNav Chantiers & Programmes — Programmes, Chantiers, Carte, Planning.
 * Module portefeuille chantiers ERP BTP.
 */

import type { SubNavContext } from '@/types/navigation';

const base = '/maitre-ouvrage/chantiers';

export const projectsProgramsSubNav: SubNavContext = {
  title: 'Chantiers & Programmes',
  tabs: [
    { id: 'programs', label: 'Programmes', path: `${base}/programmes` },
    { id: 'projects', label: 'Chantiers', path: base },
    { id: 'map', label: 'Carte', path: `${base}/carte` },
    { id: 'planning', label: 'Planning', path: `${base}/planning` },
  ],
};
