/**
 * Types pour les modals du cockpit DG (Phase 4, créances, validations).
 * Alignés sur les besoins des modals Appel, Relance, Escalade, Visite, Créances, Validations.
 */

export interface ChantierPhase4ForModal {
  numero: string;
  ca: number;
  sante: number;
  problemePrincipal: string;
  entreprise: {
    nom: string;
    telephone: string;
    email: string;
  };
  historiqueContacts?: Array<{
    id: string;
    date: string;
    type: 'appel' | 'email' | 'visite';
    notes: string;
    auteur: string;
  }>;
}

export interface Creance {
  id: string;
  client: string;
  montant: number;
  dateEcheance: string;
  joursRetard: number;
  statut: 'en_cours' | 'regle' | 'contentieux';
  derniereRelance?: string;
}

export interface ValidationEnAttente {
  id: string;
  type: 'paiement' | 'modification_budget' | 'changement_planning';
  chantier: string;
  montant?: number;
  impactCash: boolean;
  delaiImpactJours: number;
  demandeur: string;
  dateDemande: string;
  urgence: 'haute' | 'moyenne' | 'basse';
}
