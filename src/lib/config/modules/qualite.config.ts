/**
 * Configuration du module Qualité (contrôles, non-conformités)
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const qualiteModuleConfig: ModuleConfig = {
  id: 'qualite',
  name: 'Qualité',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'CONTRÔLES',
        items: [
          { id: 'tous', label: 'Tous les contrôles', icon: 'ClipboardCheck', badge: 0, route: '/maitre-ouvrage/qualite?view=tous' },
          { id: 'planifies', label: 'Planifiés', icon: 'Calendar', badge: 0, color: '#3B82F6', route: '/maitre-ouvrage/qualite?view=planifies' },
          { id: 'en-cours', label: 'En cours', icon: 'PlayCircle', badge: 0, color: '#F59E0B', route: '/maitre-ouvrage/qualite?view=en-cours' },
          { id: 'realises', label: 'Réalisés', icon: 'CheckCircle', color: '#10B981', route: '/maitre-ouvrage/qualite?view=realises' },
        ],
      },
      {
        title: 'NON-CONFORMITÉS',
        collapsible: true,
        defaultOpen: true,
        items: [
          { id: 'nc-ouvertes', label: 'NC Ouvertes', icon: 'AlertTriangle', badge: 0, color: '#EF4444', route: '/maitre-ouvrage/qualite?view=nc-ouvertes' },
          { id: 'nc-traitees', label: 'NC Traitées', icon: 'CheckCircle2', color: '#10B981', route: '/maitre-ouvrage/qualite?view=nc-traitees' },
          { id: 'nc-critiques', label: 'NC Critiques', icon: 'XCircle', badge: 0, color: '#DC2626', route: '/maitre-ouvrage/qualite?view=nc-critiques' },
        ],
      },
      {
        title: 'PAR TYPE',
        collapsible: true,
        defaultOpen: false,
        items: [
          { id: 'reception', label: 'Réception matériaux', icon: 'PackageCheck', badge: 0, route: '/maitre-ouvrage/qualite?type=reception' },
          { id: 'execution', label: 'Contrôle exécution', icon: 'Eye', badge: 0, route: '/maitre-ouvrage/qualite?type=execution' },
          { id: 'essais', label: 'Essais & mesures', icon: 'FlaskConical', badge: 0, route: '/maitre-ouvrage/qualite?type=essais' },
          { id: 'levee-reserves', label: 'Levée de réserves', icon: 'ListChecks', badge: 0, route: '/maitre-ouvrage/qualite?type=levee-reserves' },
        ],
      },
    ],
  },

  quickActions: {
    primary: {
      id: 'create',
      label: 'Nouveau contrôle',
      icon: 'Plus',
      dropdown: [
        { id: 'reception', label: 'Réception matériaux', icon: 'PackageCheck' },
        { id: 'execution', label: 'Contrôle exécution', icon: 'Eye' },
        { id: 'essai', label: 'Essai/Mesure', icon: 'FlaskConical' },
        { id: 'nc', label: 'Non-conformité', icon: 'AlertTriangle' },
      ],
    },
    secondary: [
      { id: 'valider', label: 'Valider', icon: 'Check', disabledWithoutSelection: true },
      { id: 'nc', label: 'Déclarer NC', icon: 'AlertTriangle', disabledWithoutSelection: true },
      { id: 'rapport', label: 'Générer rapport', icon: 'FileText' },
      { id: 'export', label: 'Exporter', icon: 'Download' },
    ],
  },

  filterBar: {
    views: [
      { id: 'planifies', label: 'Planifiés', badge: 0, color: 'blue' },
      { id: 'en-cours', label: 'En cours', badge: 0, color: 'orange' },
      { id: 'nc-ouvertes', label: 'NC Ouvertes', badge: 0, color: 'red' },
      { id: 'tous', label: 'Tous', badge: 0 },
    ],
    quickFilters: [
      { id: 'nc-critiques', icon: 'XCircle', label: 'NC Critiques' },
      { id: 'retard', icon: 'Clock', label: 'En retard' },
      { id: 'laboratoire', icon: 'FlaskConical', label: 'Essais labo' },
    ],
    sort: [
      { id: 'date', label: 'Date', icon: 'Calendar' },
      { id: 'criticite', label: 'Criticité', icon: 'AlertTriangle' },
      { id: 'chantier', label: 'Chantier', icon: 'Building2' },
    ],
  },
};
