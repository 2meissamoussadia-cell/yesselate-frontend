/**
 * Configuration du module Planning (Calendar Layout)
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const planningModuleConfig: ModuleConfig = {
  id: 'planning',
  name: 'Planning',
  layout: 'calendar',

  subSidebar: {
    sections: [
      {
        title: 'MES PLANNINGS',
        items: [
          {
            id: 'tous',
            label: 'Toutes les tâches',
            icon: 'Calendar',
            badge: 0,
            route: '/maitre-ouvrage/planning?view=tous',
          },
          {
            id: 'mes-taches',
            label: 'Mes tâches',
            icon: 'User',
            badge: 0,
            route: '/maitre-ouvrage/planning?view=mes-taches',
          },
          {
            id: 'aujourd-hui',
            label: "Aujourd'hui",
            icon: 'CalendarDays',
            badge: 0,
            color: '#3B82F6',
            route: '/maitre-ouvrage/planning?view=aujourd-hui',
          },
          {
            id: 'semaine',
            label: 'Cette semaine',
            icon: 'CalendarRange',
            badge: 0,
            route: '/maitre-ouvrage/planning?view=semaine',
          },
          {
            id: 'en-retard',
            label: 'En retard',
            icon: 'AlertCircle',
            badge: 0,
            color: '#EF4444',
            route: '/maitre-ouvrage/planning?view=en-retard',
          },
        ],
      },
      {
        title: 'PAR PHASE',
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            id: 'gros-oeuvre',
            label: 'Gros œuvre',
            icon: 'HardHat',
            color: '#3B82F6',
            badge: 0,
            route: '/maitre-ouvrage/planning?phase=gros-oeuvre',
          },
          {
            id: 'second-oeuvre',
            label: 'Second œuvre',
            icon: 'Hammer',
            color: '#10B981',
            badge: 0,
            route: '/maitre-ouvrage/planning?phase=second-oeuvre',
          },
          {
            id: 'finitions',
            label: 'Finitions',
            icon: 'Paintbrush',
            color: '#F59E0B',
            badge: 0,
            route: '/maitre-ouvrage/planning?phase=finitions',
          },
          {
            id: 'livraison',
            label: 'Livraison',
            icon: 'Package',
            color: '#8B5CF6',
            badge: 0,
            route: '/maitre-ouvrage/planning?phase=livraison',
          },
        ],
      },
      {
        title: 'CHANTIERS',
        collapsible: true,
        defaultOpen: false,
        items: [
          {
            id: 'vdp2',
            label: 'Villa Dakar Phase 2',
            icon: 'Building2',
            badge: 0,
            route: '/maitre-ouvrage/planning?chantier=vdp2',
          },
          {
            id: 'imd',
            label: 'Immeuble Diamniadio',
            icon: 'Building2',
            badge: 0,
            route: '/maitre-ouvrage/planning?chantier=imd',
          },
        ],
      },
    ],
  },
};
