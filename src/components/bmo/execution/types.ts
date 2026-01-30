/**
 * Types pour le module Suivi Exécution Chantier (Phases 6–8).
 * DPR / Site diary, rapports journaliers.
 */

export type ImpactMeteo = 'Aucun' | 'Léger' | 'Fort';

/** Ligne rapport journalier (DPR) pour le tableau */
export interface DailyReportRow {
  id: string;
  chantierCode: string;
  chantierNom: string;
  date: string;
  numeroRapport: string;
  chefChantier: string;
  entreprisePrincipale?: string;
}

/** Données complètes formulaire rapport journalier (DPR) */
export interface DailyReportFormData {
  id?: string;
  chantierCode?: string;
  chantierNom?: string;
  date?: string;
  numeroRapport?: string;
  chefChantier?: string;
  entreprisePrincipale?: string;
  // Météo
  meteoMatin?: string;
  meteoApresMidi?: string;
  impactMeteo?: ImpactMeteo;
  // Main-d'œuvre (texte libre ou structuré)
  mainOeuvre?: string;
  // Équipement
  equipement?: string;
  // Matériaux
  materiauxLivresUtilises?: string;
  // Travaux réalisés
  travauxRealises?: string;
  // Qualité / HSE / incidents
  observationsQualite?: string;
  incidentsSecurite?: string;
  // Pièces jointes (réf.)
  piecesJointes?: string;
}
