/**
 * Architecture Analytique BTP - Configuration Complète
 * Basée sur l'architecture en 5 couches définie dans ARCHITECTURE_ANALYTICS_BTP_COMPLETE.md
 */

import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Users,
  HardHat,
  Wrench,
  FileText,
  Shield,
  Calendar,
  Network,
  TrendingUp,
  Scale,
  CalendarDays,
  type LucideIcon,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AnalyticsDomain {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  modules: AnalyticsModule[];
}

export interface AnalyticsModule {
  id: string;
  label: string;
  description?: string;
  subModules: AnalyticsSubModule[];
}

export interface AnalyticsSubModule {
  id: string;
  label: string;
  description?: string;
  features?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// ARCHITECTURE COMPLÈTE - 10 DOMAINES
// ═══════════════════════════════════════════════════════════════════════════

export const analyticsBTPArchitecture: AnalyticsDomain[] = [
  // 1. Gestion de Chantiers
  {
    id: 'chantiers',
    label: 'Gestion de Chantiers',
    icon: Building2,
    description: 'Analyse complète des chantiers, lots, avancement et performance',
    modules: [
      {
        id: 'suivi-chantiers',
        label: 'Suivi de Chantiers',
        subModules: [
          { id: 'tableau-bord', label: 'Tableau de bord chantiers' },
          { id: 'rentabilite', label: 'Analyse de rentabilité par chantier' },
          { id: 'avancement', label: 'Suivi d\'avancement physique et financier' },
          { id: 'ecarts-budget', label: 'Analyse des écarts budget/réalisé' },
          { id: 'kpis-chantier', label: 'Indicateurs de performance chantier' },
          { id: 'risques-chantier', label: 'Analyse des risques chantier' },
          { id: 'historique', label: 'Historique et benchmarking chantiers' },
        ],
      },
      {
        id: 'analyse-lots',
        label: 'Analyse des Lots et Corps d\'État',
        subModules: [
          { id: 'performance-lot', label: 'Performance par lot' },
          { id: 'marges-corps-etat', label: 'Analyse des marges par corps d\'état' },
          { id: 'sous-lots', label: 'Suivi des sous-lots' },
          { id: 'comparaison-lots', label: 'Comparaison inter-lots' },
          { id: 'couts-unitaires', label: 'Analyse des coûts unitaires' },
        ],
      },
      {
        id: 'analyse-geographique',
        label: 'Analyse Géographique',
        subModules: [
          { id: 'cartographie', label: 'Cartographie des chantiers' },
          { id: 'performance-region', label: 'Analyse par région/département' },
          { id: 'performance-geo', label: 'Performance géographique' },
          { id: 'densite-activite', label: 'Analyse de densité d\'activité' },
        ],
      },
      {
        id: 'analyse-temporelle',
        label: 'Analyse Temporelle',
        subModules: [
          { id: 'evolution-temporelle', label: 'Évolution temporelle des chantiers' },
          { id: 'saisonnalite', label: 'Analyse saisonnière' },
          { id: 'tendances', label: 'Tendances et prévisions' },
          { id: 'analyse-cyclique', label: 'Analyse cyclique' },
        ],
      },
    ],
  },

  // 2. Gestion Financière
  {
    id: 'financier',
    label: 'Gestion Financière',
    icon: DollarSign,
    description: 'Analyse budgétaire, coûts, marges, trésorerie et facturation',
    modules: [
      {
        id: 'analyse-budgetaire',
        label: 'Analyse Budgétaire',
        subModules: [
          { id: 'budgets-previsionnels', label: 'Budgets prévisionnels vs réalisés' },
          { id: 'ecarts-budgetaires', label: 'Analyse des écarts budgétaires' },
          { id: 'revisions-budgetaires', label: 'Révisions budgétaires' },
          { id: 'budgets-centres-cout', label: 'Budgets par centre de coût' },
          { id: 'budgets-pluriannuels', label: 'Analyse des budgets pluriannuels' },
        ],
      },
      {
        id: 'analyse-couts',
        label: 'Analyse des Coûts',
        subModules: [
          { id: 'couts-directs-indirects', label: 'Coûts directs vs indirects' },
          { id: 'couts-revient', label: 'Analyse des coûts de revient' },
          { id: 'couts-par-nature', label: 'Coûts par nature (main d\'œuvre, matériel, sous-traitance)' },
          { id: 'analyse-abc', label: 'Analyse ABC des coûts' },
          { id: 'couts-standards', label: 'Coûts standards vs réels' },
        ],
      },
      {
        id: 'analyse-marges',
        label: 'Analyse des Marges',
        subModules: [
          { id: 'marges-brutes', label: 'Marges brutes par chantier' },
          { id: 'marges-nettes', label: 'Marges nettes' },
          { id: 'marges-par-lot', label: 'Analyse des marges par lot' },
          { id: 'evolution-marges', label: 'Évolution des marges' },
          { id: 'comparaison-marges', label: 'Comparaison des marges inter-chantiers' },
        ],
      },
      {
        id: 'tresorerie-cashflow',
        label: 'Trésorerie et Cash-Flow',
        subModules: [
          { id: 'previsions-tresorerie', label: 'Prévisions de trésorerie' },
          { id: 'flux-tresorerie', label: 'Analyse des flux de trésorerie' },
          { id: 'bfr', label: 'Besoins en fonds de roulement (BFR)' },
          { id: 'delais-paiement', label: 'Analyse des délais de paiement' },
          { id: 'planification-financiere', label: 'Planification financière' },
        ],
      },
      {
        id: 'facturation-encaissements',
        label: 'Facturation et Encaissements',
        subModules: [
          { id: 'analyse-facturation', label: 'Analyse de facturation' },
          { id: 'suivi-encaissements', label: 'Suivi des encaissements' },
          { id: 'creances-clients', label: 'Analyse des créances clients' },
          { id: 'delais-paiement-clients', label: 'Délais de paiement clients' },
          { id: 'facturation-avancement', label: 'Facturation par avancement' },
        ],
      },
      {
        id: 'analyse-depenses',
        label: 'Analyse des Dépenses',
        subModules: [
          { id: 'depenses-par-categorie', label: 'Dépenses par catégorie' },
          { id: 'analyse-fournisseurs', label: 'Analyse des fournisseurs' },
          { id: 'delais-paiement-fournisseurs', label: 'Délais de paiement fournisseurs' },
          { id: 'evolution-depenses', label: 'Évolution des dépenses' },
          { id: 'depenses-imprevues', label: 'Analyse des dépenses imprévues' },
        ],
      },
    ],
  },

  // 3. Gestion des Ressources Humaines
  {
    id: 'ressources-humaines',
    label: 'Ressources Humaines',
    icon: Users,
    description: 'Analyse de la main d\'œuvre, absences, compétences et performance RH',
    modules: [
      {
        id: 'analyse-main-oeuvre',
        label: 'Analyse de la Main d\'Œuvre',
        subModules: [
          { id: 'effectifs-chantier', label: 'Effectifs par chantier' },
          { id: 'heures-travaillees', label: 'Heures travaillées vs prévues' },
          { id: 'couts-main-oeuvre', label: 'Coûts de main d\'œuvre' },
          { id: 'productivite-equipe', label: 'Productivité par équipe' },
          { id: 'analyse-competences', label: 'Analyse des compétences' },
        ],
      },
      {
        id: 'analyse-absences',
        label: 'Analyse des Absences et Congés',
        subModules: [
          { id: 'taux-absentéisme', label: 'Taux d\'absentéisme' },
          { id: 'analyse-conges', label: 'Analyse des congés' },
          { id: 'impact-chantiers', label: 'Impact sur les chantiers' },
          { id: 'previsions-absences', label: 'Prévisions d\'absences' },
        ],
      },
      {
        id: 'analyse-competences',
        label: 'Analyse des Compétences',
        subModules: [
          { id: 'cartographie-competences', label: 'Cartographie des compétences' },
          { id: 'adequation-competences', label: 'Adéquation compétences/chantiers' },
          { id: 'analyse-formations', label: 'Analyse des formations' },
          { id: 'gestion-certifications', label: 'Gestion des certifications' },
        ],
      },
      {
        id: 'performance-rh',
        label: 'Analyse de la Performance RH',
        subModules: [
          { id: 'performance-individuelle', label: 'Performance individuelle' },
          { id: 'performance-equipe', label: 'Performance d\'équipe' },
          { id: 'rotation-personnel', label: 'Rotation du personnel' },
          { id: 'couts-recrutement', label: 'Coûts de recrutement' },
        ],
      },
    ],
  },

  // 4. Gestion des Sous-traitants
  {
    id: 'sous-traitants',
    label: 'Sous-traitants',
    icon: HardHat,
    description: 'Performance, contrats et risques des sous-traitants',
    modules: [
      {
        id: 'performance-sous-traitants',
        label: 'Performance des Sous-traitants',
        subModules: [
          { id: 'evaluation', label: 'Évaluation des sous-traitants' },
          { id: 'respect-delais', label: 'Respect des délais' },
          { id: 'qualite-prestations', label: 'Qualité des prestations' },
          { id: 'couts-sous-traitance', label: 'Coûts sous-traitance' },
          { id: 'comparaison-sous-traitants', label: 'Comparaison inter-sous-traitants' },
        ],
      },
      {
        id: 'analyse-contrats',
        label: 'Analyse des Contrats de Sous-traitance',
        subModules: [
          { id: 'suivi-contrats', label: 'Suivi des contrats' },
          { id: 'analyse-avenants', label: 'Analyse des avenants' },
          { id: 'evolution-prix', label: 'Évolution des prix' },
          { id: 'historique-contractuel', label: 'Historique contractuel' },
        ],
      },
      {
        id: 'risques-sous-traitance',
        label: 'Risques Sous-traitance',
        subModules: [
          { id: 'analyse-risques', label: 'Analyse des risques' },
          { id: 'sous-traitants-critiques', label: 'Sous-traitants critiques' },
          { id: 'diversification', label: 'Diversification du portefeuille' },
          { id: 'alertes-sous-traitance', label: 'Alertes sous-traitance' },
        ],
      },
    ],
  },

  // 5. Gestion du Matériel et Équipements
  {
    id: 'materiel',
    label: 'Matériel et Équipements',
    icon: Wrench,
    description: 'Utilisation, maintenance, location/achat et stocks',
    modules: [
      {
        id: 'analyse-materiel',
        label: 'Analyse du Matériel',
        subModules: [
          { id: 'utilisation-materiel', label: 'Utilisation du matériel' },
          { id: 'couts-utilisation', label: 'Coûts d\'utilisation' },
          { id: 'disponibilite-materiel', label: 'Disponibilité matériel' },
          { id: 'analyse-par-type', label: 'Analyse par type de matériel' },
          { id: 'rotation-materiel', label: 'Rotation du matériel' },
        ],
      },
      {
        id: 'maintenance-entretien',
        label: 'Maintenance et Entretien',
        subModules: [
          { id: 'couts-maintenance', label: 'Coûts de maintenance' },
          { id: 'temps-immobilisation', label: 'Temps d\'immobilisation' },
          { id: 'planification-maintenance', label: 'Planification maintenance' },
          { id: 'preventive-vs-corrective', label: 'Analyse préventive vs corrective' },
        ],
      },
      {
        id: 'location-vs-achat',
        label: 'Location vs Achat',
        subModules: [
          { id: 'analyse-cout', label: 'Analyse coût location/achat' },
          { id: 'optimisation-mix', label: 'Optimisation du mix' },
          { id: 'roi-equipements', label: 'ROI des équipements' },
          { id: 'decisions-investissement', label: 'Décisions d\'investissement' },
        ],
      },
      {
        id: 'stocks-approvisionnements',
        label: 'Stocks et Approvisionnements',
        subModules: [
          { id: 'niveaux-stock', label: 'Niveaux de stock' },
          { id: 'couts-stockage', label: 'Coûts de stockage' },
          { id: 'rotation-stocks', label: 'Rotation des stocks' },
          { id: 'ruptures-stock', label: 'Ruptures de stock' },
        ],
      },
    ],
  },

  // 6. Gestion Commerciale et Appels d'Offres
  {
    id: 'commercial',
    label: 'Commercial et Appels d\'Offres',
    icon: FileText,
    description: 'Pipeline commercial, appels d\'offres, clients et marchés',
    modules: [
      {
        id: 'analyse-commerciale',
        label: 'Analyse Commerciale',
        subModules: [
          { id: 'pipeline-commercial', label: 'Pipeline commercial' },
          { id: 'taux-conversion', label: 'Taux de conversion' },
          { id: 'ca-par-commercial', label: 'CA par commercial' },
          { id: 'cycle-vente', label: 'Cycle de vente' },
          { id: 'previsions-commerciales', label: 'Prévisions commerciales' },
        ],
      },
      {
        id: 'analyse-appels-offres',
        label: 'Analyse des Appels d\'Offres',
        subModules: [
          { id: 'taux-reponse', label: 'Taux de réponse' },
          { id: 'taux-succes', label: 'Taux de succès' },
          { id: 'analyse-offres', label: 'Analyse des offres' },
          { id: 'couts-reponse', label: 'Coûts de réponse' },
          { id: 'benchmarking-prix', label: 'Benchmarking prix' },
        ],
      },
      {
        id: 'analyse-clients',
        label: 'Analyse des Clients',
        subModules: [
          { id: 'segmentation-clients', label: 'Segmentation clients' },
          { id: 'rentabilite-clients', label: 'Rentabilité clients' },
          { id: 'fidelisation', label: 'Fidélisation' },
          { id: 'analyse-rfm', label: 'Analyse RFM (Recency, Frequency, Monetary)' },
        ],
      },
      {
        id: 'analyse-marches',
        label: 'Analyse des Marchés',
        subModules: [
          { id: 'parts-marche', label: 'Parts de marché' },
          { id: 'tendances-marche', label: 'Tendances marché' },
          { id: 'analyse-concurrentielle', label: 'Analyse concurrentielle' },
          { id: 'opportunites-marche', label: 'Opportunités marché' },
        ],
      },
    ],
  },

  // 7. Qualité, Sécurité, Environnement (QSE)
  {
    id: 'qse',
    label: 'Qualité, Sécurité, Environnement',
    icon: Shield,
    description: 'Indicateurs qualité, sécurité, environnement et conformité',
    modules: [
      {
        id: 'analyse-qualite',
        label: 'Analyse Qualité',
        subModules: [
          { id: 'indicateurs-qualite', label: 'Indicateurs qualité' },
          { id: 'non-conformites', label: 'Non-conformités' },
          { id: 'couts-non-qualite', label: 'Coûts de non-qualité' },
          { id: 'actions-correctives', label: 'Actions correctives' },
          { id: 'certifications-qualite', label: 'Certifications qualité' },
        ],
      },
      {
        id: 'analyse-securite',
        label: 'Analyse Sécurité',
        subModules: [
          { id: 'indicateurs-securite', label: 'Indicateurs sécurité' },
          { id: 'accidents-incidents', label: 'Accidents et incidents' },
          { id: 'analyse-risques', label: 'Analyse des risques' },
          { id: 'formation-securite', label: 'Formation sécurité' },
          { id: 'couts-securite', label: 'Coûts sécurité' },
        ],
      },
      {
        id: 'analyse-environnementale',
        label: 'Analyse Environnementale',
        subModules: [
          { id: 'indicateurs-environnementaux', label: 'Indicateurs environnementaux' },
          { id: 'consommations-energetiques', label: 'Consommations énergétiques' },
          { id: 'dechets-recyclage', label: 'Déchets et recyclage' },
          { id: 'conformite-reglementaire', label: 'Conformité réglementaire' },
          { id: 'couts-environnementaux', label: 'Coûts environnementaux' },
        ],
      },
      {
        id: 'qse-integre',
        label: 'Analyse QSE Intégrée',
        subModules: [
          { id: 'tableau-bord-qse', label: 'Tableau de bord QSE' },
          { id: 'correlations-qse', label: 'Corrélations QSE' },
          { id: 'performance-qse-globale', label: 'Performance QSE globale' },
          { id: 'reporting-reglementaire', label: 'Reporting réglementaire' },
        ],
      },
    ],
  },

  // 8. Planification et Ordonnancement
  {
    id: 'planification',
    label: 'Planification et Ordonnancement',
    icon: Calendar,
    description: 'Respect des délais, allocation des ressources et chemin critique',
    modules: [
      {
        id: 'analyse-planification',
        label: 'Analyse de Planification',
        subModules: [
          { id: 'respect-delais', label: 'Respect des délais' },
          { id: 'analyse-retards', label: 'Analyse des retards' },
          { id: 'optimisation-planning', label: 'Optimisation planning' },
          { id: 'charge-travail', label: 'Charge de travail' },
          { id: 'goulots-etranglement', label: 'Goulots d\'étranglement' },
        ],
      },
      {
        id: 'analyse-ressources',
        label: 'Analyse des Ressources',
        subModules: [
          { id: 'allocation-ressources', label: 'Allocation des ressources' },
          { id: 'surcharge-sous-charge', label: 'Surcharge/sous-charge' },
          { id: 'optimisation-ressources', label: 'Optimisation ressources' },
          { id: 'previsions-charge', label: 'Prévisions de charge' },
        ],
      },
      {
        id: 'chemin-critique',
        label: 'Analyse de la Chaîne Critique',
        subModules: [
          { id: 'identification-chemin', label: 'Identification chemin critique' },
          { id: 'analyse-dependances', label: 'Analyse des dépendances' },
          { id: 'risques-planning', label: 'Risques planning' },
          { id: 'scenarios-planning', label: 'Scénarios planning' },
        ],
      },
    ],
  },

  // 9. Gestion Multi-Agences
  {
    id: 'multi-agences',
    label: 'Multi-Agences',
    icon: Network,
    description: 'Performance, consolidation et gouvernance multi-agences',
    modules: [
      {
        id: 'analyse-multi-agences',
        label: 'Analyse Multi-Agences',
        subModules: [
          { id: 'performance-par-agence', label: 'Performance par agence' },
          { id: 'comparaison-inter-agences', label: 'Comparaison inter-agences' },
          { id: 'allocation-ressources', label: 'Allocation des ressources' },
          { id: 'synergies-inter-agences', label: 'Synergies inter-agences' },
        ],
      },
      {
        id: 'consolidation',
        label: 'Consolidation',
        subModules: [
          { id: 'consolidation-financiere', label: 'Consolidation financière' },
          { id: 'consolidation-operationnelle', label: 'Consolidation opérationnelle' },
          { id: 'reporting-consolide', label: 'Reporting consolidé' },
          { id: 'analyse-comparative', label: 'Analyse comparative' },
        ],
      },
      {
        id: 'gouvernance-multi-agences',
        label: 'Gouvernance Multi-Agences',
        subModules: [
          { id: 'indicateurs-gouvernance', label: 'Indicateurs de gouvernance' },
          { id: 'conformite-inter-agences', label: 'Conformité inter-agences' },
          { id: 'partage-bonnes-pratiques', label: 'Partage de bonnes pratiques' },
          { id: 'benchmarking-interne', label: 'Benchmarking interne' },
        ],
      },
    ],
  },

  // 10. Performance Opérationnelle
  {
    id: 'performance',
    label: 'Performance Opérationnelle',
    icon: TrendingUp,
    description: 'Tableaux de bord exécutifs, analyse prédictive et benchmarking',
    modules: [
      {
        id: 'tableaux-bord-executifs',
        label: 'Tableaux de Bord Exécutifs',
        subModules: [
          { id: 'dashboard-direction', label: 'Dashboard direction' },
          { id: 'kpis-strategiques', label: 'KPIs stratégiques' },
          { id: 'alertes-executives', label: 'Alertes exécutives' },
          { id: 'reporting-executif', label: 'Reporting exécutif' },
        ],
      },
      {
        id: 'analyse-predictive',
        label: 'Analyse Prédictive',
        subModules: [
          { id: 'previsions-ca', label: 'Prévisions de CA' },
          { id: 'previsions-couts', label: 'Prévisions de coûts' },
          { id: 'previsions-tresorerie', label: 'Prévisions de trésorerie' },
          { id: 'modeles-predictifs', label: 'Modèles prédictifs' },
        ],
      },
      {
        id: 'benchmarking',
        label: 'Benchmarking',
        subModules: [
          { id: 'benchmarking-interne', label: 'Benchmarking interne' },
          { id: 'benchmarking-externe', label: 'Benchmarking externe' },
          { id: 'best-practices', label: 'Best practices' },
          { id: 'analyse-comparative', label: 'Analyse comparative' },
        ],
      },
      {
        id: 'analyse-rentabilite',
        label: 'Analyse de Rentabilité',
        subModules: [
          { id: 'rentabilite-globale', label: 'Rentabilité globale' },
          { id: 'rentabilite-par-segment', label: 'Rentabilité par segment' },
          { id: 'analyse-contribution', label: 'Analyse de contribution' },
          { id: 'roi-projets', label: 'ROI projets' },
        ],
      },
    ],
  },

  // 12. Calendrier & Planification
  {
    id: 'calendrier',
    label: 'Calendrier & Planification',
    icon: CalendarDays,
    description: 'Moteur de pilotage temporel transversal : échéances, SLA, conflits, retards, jalons projets, validations, réunions',
    modules: [
      {
        id: 'vue-ensemble-temporelle',
        label: 'Vue d\'ensemble temporelle',
        description: 'KPIs du jour/semaine/mois, événements en cours, retards détectés, conflits actifs, tâches terminées',
        subModules: [
          { id: 'kpis-jour-semaine-mois', label: 'KPIs du jour / semaine / mois' },
          { id: 'evenements-en-cours', label: 'Événements en cours' },
          { id: 'retards-detectes', label: 'Retards détectés' },
          { id: 'conflits-actifs', label: 'Conflits actifs' },
          { id: 'taches-terminees', label: 'Tâches terminées' },
          { id: 'vue-mensuelle-hebdo-journaliere', label: 'Vue mensuelle / hebdo / journalière' },
          { id: 'actions-rapides', label: 'Actions rapides : créer événement, filtrer, résoudre conflit' },
        ],
      },
      {
        id: 'sla-delais-critiques',
        label: 'SLA & délais critiques',
        description: 'Échéances dépassées, SLA en risque, SLA à traiter aujourd\'hui, priorisation automatique',
        subModules: [
          { id: 'echeances-depassees', label: 'Échéances dépassées' },
          { id: 'sla-en-risque', label: 'SLA en risque' },
          { id: 'sla-traiter-aujourdhui', label: 'SLA à traiter aujourd\'hui' },
          { id: 'priorisation-automatique', label: 'Priorisation automatique' },
          { id: 'actions-sla', label: 'Actions : traiter SLA, réassigner, escalader' },
        ],
      },
      {
        id: 'conflits-chevauchements',
        label: 'Conflits & chevauchements',
        description: 'Conflits de ressources, réunions, validations, jalons projets',
        subModules: [
          { id: 'conflits-ressources', label: 'Conflits de ressources' },
          { id: 'conflits-reunions', label: 'Conflits de réunions' },
          { id: 'conflits-validations', label: 'Conflits de validations' },
          { id: 'conflits-jalons-projets', label: 'Conflits de jalons projets' },
          { id: 'actions-resoudre-conflit', label: 'Actions : résoudre conflit, déplacer, fusionner, arbitrer' },
        ],
      },
      {
        id: 'echeances-operationnelles',
        label: 'Échéances opérationnelles',
        description: 'Synchronisation automatique avec Demandes, Validations BC/Factures/Contrats/Paiements, Dossiers bloqués, Substitutions, Arbitrages',
        subModules: [
          { id: 'echeances-jour', label: 'Échéances du jour' },
          { id: 'echeances-critiques', label: 'Échéances critiques' },
          { id: 'echeances-retard', label: 'Échéances en retard' },
          { id: 'echeances-venir', label: 'Échéances à venir' },
          { id: 'synchronisation-demandes', label: 'Synchronisation Demandes' },
          { id: 'synchronisation-validations', label: 'Synchronisation Validations (BC, Factures, Contrats, Paiements)' },
          { id: 'synchronisation-dossiers-bloques', label: 'Synchronisation Dossiers bloqués' },
          { id: 'synchronisation-substitutions', label: 'Synchronisation Substitutions' },
          { id: 'synchronisation-arbitrages', label: 'Synchronisation Arbitrages & Goulots' },
        ],
      },
      {
        id: 'jalons-projets-livrables',
        label: 'Jalons projets & livrables',
        description: 'Synchronisé avec Projets en cours : jalons critiques, livrables en retard, points de contrôle, réunions de revue',
        subModules: [
          { id: 'jalons-critiques', label: 'Jalons critiques' },
          { id: 'livrables-retard', label: 'Livrables en retard' },
          { id: 'points-controle', label: 'Points de contrôle' },
          { id: 'reunions-revue', label: 'Réunions de revue' },
          { id: 'actions-jalons', label: 'Actions : ouvrir projet, notifier équipe, replanifier' },
        ],
      },
      {
        id: 'evenements-rh-absences',
        label: 'Événements RH & absences',
        description: 'Synchronisé avec Employés & Agents, Missions, Congés, Délégations',
        subModules: [
          { id: 'absences-jour', label: 'Absences du jour' },
          { id: 'absences-futures', label: 'Absences futures' },
          { id: 'missions-terrain', label: 'Missions terrain' },
          { id: 'delegations-actives', label: 'Délégations actives' },
          { id: 'synchronisation-rh', label: 'Synchronisation RH (Employés, Missions, Congés, Délégations)' },
        ],
      },
      {
        id: 'instances-reunions',
        label: 'Instances & réunions',
        description: 'Synchronisé avec Conférences décisionnelles, Échanges structurés, Messages externes',
        subModules: [
          { id: 'reunions-critiques', label: 'Réunions critiques' },
          { id: 'conferences-planifiees', label: 'Conférences planifiées' },
          { id: 'instances-retard', label: 'Instances en retard' },
          { id: 'actions-instances', label: 'Actions : convoquer, replanifier, notifier' },
          { id: 'synchronisation-conferences', label: 'Synchronisation Conférences décisionnelles' },
          { id: 'synchronisation-echanges', label: 'Synchronisation Échanges structurés' },
          { id: 'synchronisation-messages-externes', label: 'Synchronisation Messages externes (si date limite)' },
        ],
      },
      {
        id: 'planification-intelligente-ia',
        label: 'Planification intelligente (IA)',
        description: 'Détection automatique des conflits, suggestions de créneaux optimisés, analyse charge/disponibilité, recommandations',
        subModules: [
          { id: 'detection-conflits-automatique', label: 'Détection automatique des conflits' },
          { id: 'suggestions-creneaux-optimises', label: 'Suggestions de créneaux optimisés' },
          { id: 'analyse-charge-disponibilite', label: 'Analyse charge / disponibilité' },
          { id: 'recommandations-reduire-retards', label: 'Recommandations pour réduire retards' },
          { id: 'simulation-impact-temporel', label: 'Simulation d\'impact temporel' },
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trouve un domaine par son ID
 */
export function findDomain(domainId: string): AnalyticsDomain | undefined {
  return analyticsBTPArchitecture.find((d) => d.id === domainId);
}

/**
 * Trouve un module par son ID dans un domaine
 */
export function findModule(
  domainId: string,
  moduleId: string
): AnalyticsModule | undefined {
  const domain = findDomain(domainId);
  return domain?.modules.find((m) => m.id === moduleId);
}

/**
 * Trouve un sous-module par son ID
 */
export function findSubModule(
  domainId: string,
  moduleId: string,
  subModuleId: string
): AnalyticsSubModule | undefined {
  const mod = findModule(domainId, moduleId);
  return mod?.subModules.find((s) => s.id === subModuleId);
}

/**
 * Obtient tous les domaines
 */
export function getAllDomains(): AnalyticsDomain[] {
  return analyticsBTPArchitecture;
}

/**
 * Obtient tous les modules d'un domaine
 */
export function getModulesByDomain(domainId: string): AnalyticsModule[] {
  const domain = findDomain(domainId);
  return domain?.modules || [];
}

/**
 * Obtient tous les sous-modules d'un module
 */
export function getSubModulesByModule(
  domainId: string,
  moduleId: string
): AnalyticsSubModule[] {
  const mod = findModule(domainId, moduleId);
  return mod?.subModules || [];
}

/**
 * Construit le chemin de navigation complet
 */
export function buildNavigationPath(
  domainId: string,
  moduleId?: string,
  subModuleId?: string
): string[] {
  const path: string[] = [domainId];
  if (moduleId) path.push(moduleId);
  if (subModuleId) path.push(subModuleId);
  return path;
}

