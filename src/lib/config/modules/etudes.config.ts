/**
 * Configuration du module Études
 */
import type { ModuleConfig } from '@/lib/types/module.types';

export const etudesModuleConfig: ModuleConfig = {
  id: 'etudes',
  name: 'Études',
  layout: 'triple-pane',

  subSidebar: {
    sections: [
      {
        title: 'MES ÉTUDES',
        items: [
          {
            id: 'toutes',
            label: 'Toutes les études',
            icon: 'FileSearch',
            badge: 0,
            route: '/maitre-ouvrage/etudes?folder=toutes',
          },
          {
            id: 'en-cours',
            label: 'En cours',
            icon: 'Clock',
            badge: 0,
            color: '#3B82F6',
            route: '/maitre-ouvrage/etudes?folder=en-cours',
          },
          {
            id: 'validees',
            label: 'Validées',
            icon: 'CheckCircle',
            color: '#10B981',
            route: '/maitre-ouvrage/etudes?folder=validees',
          },
          {
            id: 'a-valider',
            label: 'À valider',
            icon: 'AlertCircle',
            badge: 0,
            color: '#F59E0B',
            route: '/maitre-ouvrage/etudes?folder=a-valider',
          },
        ],
      },
      {
        title: 'PAR TYPE',
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            id: 'faisabilite',
            label: 'Faisabilité',
            icon: 'Search',
            badge: 0,
            route: '/maitre-ouvrage/etudes?type=faisabilite',
          },
          {
            id: 'avant-projet',
            label: 'Avant-projet (APS/APD)',
            icon: 'FileText',
            badge: 0,
            route: '/maitre-ouvrage/etudes?type=avant-projet',
          },
          {
            id: 'execution',
            label: 'Projet (PRO/EXE)',
            icon: 'Hammer',
            badge: 0,
            route: '/maitre-ouvrage/etudes?type=execution',
          },
          {
            id: 'technique',
            label: 'Études techniques',
            icon: 'Wrench',
            badge: 0,
            route: '/maitre-ouvrage/etudes?type=technique',
          },
          {
            id: 'impact',
            label: 'Impact environnemental',
            icon: 'Leaf',
            badge: 0,
            route: '/maitre-ouvrage/etudes?type=impact',
          },
        ],
      },
      {
        title: 'PAR DISCIPLINE',
        collapsible: true,
        defaultOpen: true,
        items: [
          {
            id: 'architecture',
            label: 'Architecture',
            icon: 'Building',
            badge: 0,
            route: '/maitre-ouvrage/etudes?discipline=architecture',
          },
          {
            id: 'structure',
            label: 'Structure',
            icon: 'Box',
            badge: 0,
            route: '/maitre-ouvrage/etudes?discipline=structure',
          },
          {
            id: 'fluides',
            label: 'Fluides',
            icon: 'Droplet',
            badge: 0,
            route: '/maitre-ouvrage/etudes?discipline=fluides',
          },
          {
            id: 'electricite',
            label: 'Électricité',
            icon: 'Zap',
            badge: 0,
            route: '/maitre-ouvrage/etudes?discipline=electricite',
          },
          {
            id: 'vrd',
            label: 'VRD',
            icon: 'Route',
            badge: 0,
            route: '/maitre-ouvrage/etudes?discipline=vrd',
          },
        ],
      },
    ],
  },

  quickActions: {
    primary: {
      id: 'create',
      label: 'Nouvelle étude',
      icon: 'Plus',
      dropdown: [
        { id: 'faisabilite', label: 'Étude de faisabilité', icon: 'Search' },
        { id: 'aps', label: 'APS (Avant-Projet Sommaire)', icon: 'FileText' },
        { id: 'apd', label: 'APD (Avant-Projet Détaillé)', icon: 'FileCheck' },
        { id: 'pro', label: 'PRO (Projet)', icon: 'File' },
        { id: 'exe', label: 'EXE (Exécution)', icon: 'Hammer' },
      ],
    },
    secondary: [
      {
        id: 'valider',
        label: 'Valider',
        icon: 'Check',
        disabledWithoutSelection: true,
      },
      {
        id: 'demander-modif',
        label: 'Demander modification',
        icon: 'Edit',
        disabledWithoutSelection: true,
      },
      {
        id: 'version',
        label: 'Nouvelle version',
        icon: 'GitBranch',
        disabledWithoutSelection: true,
      },
      {
        id: 'export',
        label: 'Exporter',
        icon: 'Download',
      },
    ],
  },

  filterBar: {
    views: [
      { id: 'en-cours', label: 'En cours', badge: 0, color: 'blue' },
      { id: 'a-valider', label: 'À valider', badge: 0, color: 'orange' },
      { id: 'validees', label: 'Validées', badge: 0, color: 'green' },
      { id: 'toutes', label: 'Toutes', badge: 0 },
    ],
    quickFilters: [
      { id: 'retard', icon: 'Clock', label: 'En retard' },
      { id: 'observations', icon: 'MessageSquare', label: 'Avec observations' },
      { id: 'revisions', icon: 'GitBranch', label: 'Multiples révisions' },
    ],
    sort: [
      { id: 'date', label: 'Date', icon: 'Calendar' },
      { id: 'phase', label: 'Phase', icon: 'Layers' },
      { id: 'chantier', label: 'Chantier', icon: 'Building2' },
    ],
  },
};
