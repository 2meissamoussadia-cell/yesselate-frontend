/**
 * Service client pour l'API Tickets-Clients
 * =========================================
 * 
 * Gère toutes les interactions avec le backend pour les tickets clients BTP
 */

// ============================================
// TYPES
// ============================================

export type TicketStatus = 
  | 'nouveau'
  | 'en_cours'
  | 'en_attente_client'
  | 'en_attente_interne'
  | 'escalade'
  | 'resolu'
  | 'clos'
  | 'annule';

export type TicketPriority = 'critique' | 'haute' | 'normale' | 'basse';

export type TicketCategory = 
  | 'reclamation_qualite'
  | 'retard_livraison'
  | 'facturation'
  | 'demande_modification'
  | 'incident_chantier'
  | 'securite'
  | 'garantie'
  | 'information'
  | 'autre';

export interface Ticket {
  id: string;
  numero: string;
  titre: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  clientId: string;
  clientNom: string;
  chantierId?: string;
  chantierNom?: string;
  assigneA?: string;
  creePar: string;
  dateCreation: string;
  dateModification: string;
  dateResolution?: string;
  dateCloture?: string;
  slaDelai: number; // en heures
  slaEcoule: number; // en heures
  slaDepassement: boolean;
  tags?: string[];
  piecesJointes?: Array<{ id: string; nom: string; url: string }>;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  auteur: string;
  message: string;
  type: 'interne' | 'client';
  dateCreation: string;
  piecesJointes?: Array<{ id: string; nom: string; url: string }>;
}

export interface TicketStats {
  total: number;
  nouveau: number;
  enCours: number;
  enAttenteClient: number;
  enAttenteInterne: number;
  escalade: number;
  resolu: number;
  clos: number;
  annule: number;
  horsDelaiSLA: number;
  critique: number;
  haute: number;
  parCategorie: Array<{ category: TicketCategory; count: number }>;
  parChantier: Array<{ chantierId: string; chantierNom: string; count: number }>;
  parClient: Array<{ clientId: string; clientNom: string; count: number }>;
  tempsResolutionMoyen: number; // en heures
  tauxConformiteSLA: number; // pourcentage
  ts: string;
}

export interface TicketFilters {
  queue?: string;
  status?: TicketStatus[];
  priority?: TicketPriority[];
  category?: TicketCategory[];
  clientId?: string;
  chantierId?: string;
  assigneA?: string;
  horsDelaiSLA?: boolean;
  dateDebut?: string;
  dateFin?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TicketCreateInput {
  titre: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  clientId: string;
  chantierId?: string;
  assigneA?: string;
  tags?: string[];
}

export interface TicketUpdateInput {
  titre?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  assigneA?: string;
  tags?: string[];
}

export interface TicketActionInput {
  action: 'traiter' | 'mettre_en_attente' | 'escalader' | 'resoudre' | 'clore' | 'annuler' | 'reassigner';
  commentaire?: string;
  nouveauResponsable?: string;
  niveau?: number; // pour escalade
}

// ============================================
// API CLIENT
// ============================================

const BASE_URL = '/api/tickets-client';

export const ticketsClientAPI = {
  // Liste des tickets
  async list(filters?: TicketFilters): Promise<{ items: Ticket[]; total: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const res = await fetch(`${BASE_URL}?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    return res.json();
  },

  // Détails d'un ticket
  async get(ticketId: string): Promise<Ticket> {
    const res = await fetch(`${BASE_URL}/${ticketId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    return res.json();
  },

  // Créer un ticket
  async create(input: TicketCreateInput): Promise<Ticket> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    return res.json();
  },

  // Mettre à jour un ticket
  async update(ticketId: string, input: TicketUpdateInput): Promise<Ticket> {
    const res = await fetch(`${BASE_URL}/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    return res.json();
  },

  // Action sur un ticket
  async action(ticketId: string, input: TicketActionInput): Promise<Ticket> {
    const res = await fetch(`${BASE_URL}/${ticketId}/actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    return res.json();
  },

  // Messages d'un ticket
  async listMessages(ticketId: string): Promise<TicketMessage[]> {
    const res = await fetch(`${BASE_URL}/${ticketId}/messages`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    return res.json();
  },

  // Ajouter un message
  async addMessage(ticketId: string, message: string, type: 'interne' | 'client'): Promise<TicketMessage> {
    const res = await fetch(`${BASE_URL}/${ticketId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, type }),
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    return res.json();
  },

  // Statistiques
  async stats(): Promise<TicketStats> {
    const res = await fetch(`${BASE_URL}/stats`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    return res.json();
  },

  // Export
  async export(format: 'csv' | 'excel' | 'json' | 'pdf', filters?: TicketFilters): Promise<Blob> {
    const params = new URLSearchParams({ format });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const res = await fetch(`${BASE_URL}/export?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    return res.blob();
  },

  // Upload pièce jointe
  async uploadAttachment(ticketId: string, file: File): Promise<{ id: string; nom: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/${ticketId}/attachments`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    return res.json();
  },

  // Supprimer pièce jointe
  async deleteAttachment(ticketId: string, attachmentId: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${ticketId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }
  },

  // Recherche avancée
  async search(query: string): Promise<Ticket[]> {
    const res = await fetch(`${BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    return res.json();
  },
};

