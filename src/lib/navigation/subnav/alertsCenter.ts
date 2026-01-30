/**
 * SubNav Centre d'alertes — Vue synthèse puis onglets par type d'alerte.
 */

import type { SubNavContext } from '@/types/navigation';

const base = '/maitre-ouvrage/alerts';

export const alertsCenterSubNav: SubNavContext = {
  title: "Centre d'alertes",
  tabs: [
    { id: 'overview', label: "Vue d'ensemble", path: base },
    { id: 'critical', label: 'Critiques', path: `${base}/critiques` },
    { id: 'projects', label: 'Par projet', path: `${base}/projets` },
    { id: 'sla', label: 'SLA & délais', path: `${base}/sla` },
    { id: 'quality', label: 'Qualité / sécurité', path: `${base}/qualite` },
  ],
};
