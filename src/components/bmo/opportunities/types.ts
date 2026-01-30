/**
 * Types pour le module Opportunités & Programmes (Phase 0-2).
 */

export type RisqueLevel = 'low' | 'medium' | 'high';

export interface OpportunityRow {
  id: string;
  code: string;
  projet: string;
  clientType: string;
  ville: string;
  type: string;
  phase: number;
  gate: string;
  budget: number;
  proba: number;
  risque: RisqueLevel;
  nextDecision: string;
}

/** Données complètes de la fiche opportunité (4 onglets). */
export interface OpportunityFormData {
  id?: string;
  // — Général —
  code?: string;
  projet?: string;
  typeProjet?: 'Neuf' | 'Rénovation' | 'Extension' | 'Maintenance lourde';
  usage?: 'Logement individuel' | 'Immeuble locatif' | 'Bureaux' | 'Commerce / mixte' | 'Industriel / Data center';
  pays?: string;
  region?: string;
  ville?: string;
  quartier?: string;
  coordonneesGps?: string;
  clientType?: 'Particulier' | 'Promoteur' | 'Entreprise' | 'État' | 'Collectivité' | 'Bailleur';
  clientNom?: string;
  contactNom?: string;
  contactTel?: string;
  contactEmail?: string;
  phase?: number;
  statutPipeline?: 'En étude' | 'Stand-by' | 'Abandonné' | 'Converti en programme';
  proba?: number;
  responsableBmo?: string;
  risque?: RisqueLevel;
  // — Business & Financier —
  budgetMin?: number;
  budgetMax?: number;
  devise?: 'FCFA' | 'EUR';
  coutM2?: number;
  modeFinancement?: 'Fonds propres' | 'Banque' | 'Bailleur' | 'Mixte';
  banqueBailleur?: string;
  tauxCible?: string;
  dateDebutEtudes?: string;
  dateDepotPermis?: string;
  dateDebutTravaux?: string;
  dateLivraison?: string;
  objectifRentabilite?: string;
  horizonInvestissement?: number;
  // — Foncier & Diagnostics —
  typeTerrain?: 'Terrain nu' | 'Bâtiment existant' | 'Extension';
  titreFoncier?: string;
  superficie?: number;
  typeDroit?: 'TF' | 'Bail' | 'Autre';
  titreVerifie?: 'Oui' | 'Non';
  litigeConnu?: 'Oui' | 'Non';
  litigeCommentaire?: string;
  servitudesIdentifiees?: 'Oui' | 'Non';
  servitudesDescription?: string;
  g1?: 'Non prévue' | 'Planifiée' | 'Réalisée';
  g1Date?: string;
  g1Labo?: string;
  diagStructure?: 'Non' | 'En cours' | 'Terminé';
  diagElecPlomberie?: 'Non' | 'En cours' | 'Terminé';
  gateFoncier?: 'OK' | 'À sécuriser' | 'KO';
  gateFoncierDate?: string;
  gateFoncierCommentaire?: string;
  // — Programme & Exigences —
  surfaceTotale?: number;
  niveaux?: string;
  nbLogements?: number;
  nbParking?: number;
  typeParking?: string;
  structureEnvisagee?: string;
  typeFacade?: string;
  cvc?: 'Splits' | 'VRV' | 'Centralisé';
  solairePv?: 'Oui' | 'Non' | 'À étudier';
  groupeElectrogene?: 'Oui' | 'Non';
  prioriteThermique?: 'faible' | 'moyenne' | 'forte';
  prioriteMaintenance?: string;
  contraintesSpecifiques?: string;
  programmeValide?: 'Oui' | 'Non';
  gate2Date?: string;
  gate2Commentaire?: string;
  // Surfaces détaillées (Phase 2 enrichie)
  surfaceHabitable?: number;
  surfaceCommercesBureaux?: number;
  partiesCommunes?: number;
  espacesExterieurs?: number;
  // Contraintes de conception
  hauteurMaxAutorisee?: string;
  empriseAuSolMax?: string;
  cosReglesUrbanisme?: string;
  contraintesEnvironnementales?: string;
  // Priorités MOA
  prioriteMinimiserCapex?: boolean;
  prioriteMinimiserOpex?: boolean;
  prioriteImageArchitecturale?: boolean;
  prioriteDelaisCourts?: boolean;
  // Gate programme
  versionProgramme?: string;
}
