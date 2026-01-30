/**
 * Types pour le module Achats & Appels d'Offres (Phase 5).
 * DCE → consultation → offres → analyse → attribution.
 */

export type TenderType = 'AO' | 'RFQ' | 'GG';
export type TenderStatut =
  | 'En préparation'
  | 'Publié'
  | 'En cours'
  | 'Clôturé'
  | 'Attribué';
export type ConsultationMode =
  | 'AO'
  | 'Consultation restreinte'
  | 'RFQ'
  | 'Gré à gré';
export type TypePrix = 'forfait' | 'unitaires' | 'mixte';
export type InviteStatut = 'Invité' | 'Intéressé' | 'Ne répond pas' | 'Offre déposée';
export type DecisionStatut = 'Soumis' | 'Validé' | 'Notifié';

/** Ligne AO / lot pour le tableau principal */
export interface TenderRow {
  id: string;
  code: string;
  projet: string;
  lot: string;
  type: TenderType;
  statut: TenderStatut;
  invites: number;
  offres: number;
  bestPrice: number;
  budgetLot: number;
  deadline: string;
}

/** Entreprise invitée (onglet Invités) */
export interface TenderInviteRow {
  id: string;
  raisonSociale: string;
  contact?: string;
  statut: InviteStatut;
}

/** Offre reçue (onglet Offres) */
export interface TenderOfferRow {
  id: string;
  entreprise: string;
  prix: number;
  delai: number;
  techScore?: number;
  prixScore?: number;
  scoreTotal?: number;
  rang?: number;
}

/** Données complètes fiche AO (4 onglets) */
export interface TenderFormData {
  id?: string;
  code?: string;
  projet?: string;
  lot?: string;
  type?: TenderType;
  statut?: TenderStatut;
  invites?: number;
  offres?: number;
  bestPrice?: number;
  budgetLot?: number;
  deadline?: string;
  // DCE & paramètres
  typePrix?: TypePrix;
  modeConsultation?: ConsultationMode;
  dateLancement?: string;
  dateVisite?: string;
  dateLimiteQuestions?: string;
  dateLimiteOffres?: string;
  documentsDce?: string;
  // Analyse & attribution
  entrepriseRetenue?: string;
  montantAttribue?: number;
  decisionStatut?: DecisionStatut;
  dateAttribution?: string;
  motifCommentaires?: string;
}
