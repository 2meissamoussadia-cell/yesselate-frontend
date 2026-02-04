/**
 * Configuration du module Blocked (Dossiers bloqués)
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const blockedModuleConfig: ModuleConfig = {
  id: 'blocked',
  name: 'Dossiers bloqués',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'NAVIGATION',
        items: [
          { id: 'tous', label: 'Tous les blocages', icon: 'AlertCircle', badge: 0 },
          { id: 'critiques', label: 'Critiques', icon: 'AlertTriangle', badge: 0 },
          { id: 'en-attente', label: 'En attente', icon: 'Clock', badge: 0 },
          { id: 'resolus', label: 'Résolus', icon: 'CheckCircle', badge: 0 },
        ],
      },
      {
        title: 'IMPACT',
        collapsible: true,
        defaultOpen: true,
        items: [
          { id: 'critique', label: 'Critique', icon: 'AlertCircle', badge: 0, color: '#ef4444' },
          { id: 'eleve', label: 'Élevé', icon: 'AlertTriangle', badge: 0, color: '#f97316' },
          { id: 'moyen', label: 'Moyen', icon: 'Info', badge: 0, color: '#f59e0b' },
          { id: 'faible', label: 'Faible', icon: 'CheckCircle', badge: 0, color: '#10b981' },
        ],
      },
    ],
  },

  filterBar: {
    views: [
      { id: 'tous', label: 'Tous', badge: 0 },
      { id: 'critiques', label: 'Critiques', badge: 0 },
      { id: 'sla-depasse', label: 'SLA dépassés', badge: 0 },
    ],
    sort: [
      { id: 'date', label: 'Date' },
      { id: 'impact', label: 'Impact' },
      { id: 'delai', label: 'Délai' },
    ],
  },
};
