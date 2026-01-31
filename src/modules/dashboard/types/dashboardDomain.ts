/**
 * Types domaine pour le Dashboard ERP BTP
 * Chantiers, contacts, créances, validations, alertes KPI, export, notifications.
 */

// ============================================================================
// Chantier & Contact
// ============================================================================

export interface Contact {
  id: string;
  date: Date;
  type: 'appel' | 'email' | 'visite';
  notes: string;
  auteur: string;
}

export interface Chantier {
  id: string;
  numero: string; // ex: #042
  nom: string;
  ca: number; // en XOF
  avancement: number; // 0-100
  statut: 'critique' | 'a_surveiller' | 'bon';
  probleme_principal: string;
  type_probleme: 'peinture' | 'bureau' | 'materiel' | 'autre';
  entreprise: {
    id: string;
    nom: string;
    telephone: string;
    email: string;
  };
  derniere_relance?: Date;
  historique_contacts: Contact[];
}

// ============================================================================
// Créance
// ============================================================================

export interface Creance {
  id: string;
  client: string;
  montant: number;
  date_echeance: Date;
  jours_retard: number;
  statut: 'en_cours' | 'regle' | 'contentieux';
  derniere_relance?: Date;
}

// ============================================================================
// Validation (demande DG)
// ============================================================================

export interface Validation {
  id: string;
  type: 'paiement' | 'modification_budget' | 'changement_planning';
  chantier: string;
  montant?: number;
  impact_cash: boolean;
  delai_impact: number; // en jours
  demandeur: string;
  date_demande: Date;
  urgence: 'haute' | 'moyenne' | 'basse';
}

// ============================================================================
// Alerte KPI
// ============================================================================

export interface KPIAlert {
  id: string;
  kpi: string;
  seuil: number;
  valeur_actuelle: number;
  type: 'warning' | 'error';
  canal: ('email' | 'sms' | 'app')[];
  actif: boolean;
}

// ============================================================================
// Export
// ============================================================================

export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv';
  perimetre: 'vue_actuelle' | 'tout';
  sections: string[];
  periode?: { debut: Date; fin: Date };
}

// ============================================================================
// Notification
// ============================================================================

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: Date;
  lu: boolean;
  action?: {
    label: string;
    url: string;
  };
}
