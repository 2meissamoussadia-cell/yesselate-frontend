/**
 * Service API pour la validation BC
 * Centralise tous les appels API liés à la validation des bons de commande, factures et avenants
 * Avec système de cache intégré
 */

import { validationBCCache } from '@/lib/cache/validation-bc-cache';

export interface ValidationDocument {
  id: string;
  type: 'bc' | 'facture' | 'avenant';
  status: 'pending' | 'validated' | 'rejected' | 'anomaly';
  bureau: string;
  fournisseur: string;
  objet: string;
  montantHT: number;
  montantTTC: number;
  tva: number;
  projet?: string;
  dateEmission: string;
  dateLimite?: string;
  createdAt: string;
  updatedAt: string;
  urgent?: boolean;
  anomalies?: string[];
  demandeur: {
    nom: string;
    fonction: string;
    bureau: string;
    email?: string;
    telephone?: string;
  };
  lignes?: Array<{
    id: string;
    designation: string;
    quantite: number;
    unite: string;
    prixUnitaire: number;
    montant: number;
  }>;
  documents?: Array<{
    id: string;
    nom: string;
    type: string;
    taille: number;
    url: string;
  }>;
  timeline?: TimelineEvent[];
  projetDetails?: {
    nom: string;
    code: string;
    budgetTotal: number;
    budgetUtilise: number;
    budgetRestant: number;
  };
  fournisseurDetails?: {
    nom: string;
    ninea: string;
    adresse: string;
    telephone: string;
    historiqueCommandes: number;
    fiabilite: string;
  };
}

export interface TimelineEvent {
  id: string;
  action: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  details?: string;
  type: 'created' | 'modified' | 'validated' | 'rejected' | 'comment';
  documentId?: string;
}

export interface ValidationStats {
  total: number;
  pending: number;
  validated: number;
  rejected: number;
  anomalies: number;
  urgent: number;
  byBureau: Array<{ bureau: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
  recentActivity: Array<{
    id: string;
    documentId: string;
    documentType: string;
    action: string;
    actorName: string;
    createdAt: string;
  }>;
  ts: string;
}

export interface DocumentsListResponse {
  items: ValidationDocument[];
  total: number;
  hasMore: boolean;
  offset: number;
  limit: number;
}

export interface CreateDocumentPayload {
  type: 'bc' | 'facture' | 'avenant';
  fournisseur: string;
  montant: number;
  objet: string;
  bureau: string;
  projet?: string;
  dateEcheance?: string;
}

export interface ValidateDocumentPayload {
  comment?: string;
  signature?: string;
}

export interface RejectDocumentPayload {
  reason: string;
  comment?: string;
}

export interface BatchActionPayload {
  action: 'validate' | 'reject' | 'archive' | 'delete' | 'suspend' | 'reactivate';
  documentIds: string[];
  reason?: string;
}

export interface BatchActionResponse {
  success: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
  message: string;
}

/**
 * Récupère les statistiques globales avec cache
 */
export async function getValidationStats(
  reason: 'manual' | 'auto' | 'init' = 'manual',
  signal?: AbortSignal
): Promise<ValidationStats> {
  const cacheKey = validationBCCache.keys.stats(reason);
  
  // Essayer le cache d'abord (sauf pour 'manual' qui force le refresh)
  if (reason !== 'manual') {
    const cached = await validationBCCache.get<ValidationStats>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Appel API
  const response = await fetch('/api/validation-bc/stats', {
    headers: {
      'x-bmo-reason': reason,
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.status}`);
  }

  const data = await response.json();
  
  // Mettre en cache avec TTL adapté au contexte
  const ttl = reason === 'auto' ? 2 * 60 * 1000 : 5 * 60 * 1000; // 2min pour auto, 5min pour les autres
  await validationBCCache.set(cacheKey, data, { ttl, persistToIndexedDB: true });
  
  return data;
}

/**
 * Récupère la liste des documents avec filtres
 */
export async function getDocuments(
  filters?: {
    queue?: string;
    bureau?: string;
    type?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
    dateFrom?: string;
    dateTo?: string;
    query?: string;
    limit?: number;
    offset?: number;
  },
  signal?: AbortSignal
): Promise<DocumentsListResponse> {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
  }

  const response = await fetch(`/api/validation-bc/documents?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.status}`);
  }

  return response.json();
}

/**
 * Récupère les détails d'un document
 */
export async function getDocumentById(
  id: string,
  signal?: AbortSignal
): Promise<ValidationDocument> {
  const response = await fetch(`/api/validation-bc/documents/${id}`, {
    signal,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Document not found');
    }
    throw new Error(`Failed to fetch document: ${response.status}`);
  }

  return response.json();
}

/**
 * Crée un nouveau document
 */
export async function createDocument(
  payload: CreateDocumentPayload
): Promise<{ success: boolean; document: ValidationDocument; message: string }> {
  const response = await fetch('/api/validation-bc/documents/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create document: ${response.status}`);
  }

  return response.json();
}

/**
 * Valide un document
 */
export async function validateDocument(
  id: string,
  payload: ValidateDocumentPayload
): Promise<{ success: boolean; document: any; message: string }> {
  const response = await fetch(`/api/validation-bc/documents/${id}/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to validate document: ${response.status}`);
  }

  return response.json();
}

/**
 * Rejette un document
 */
export async function rejectDocument(
  id: string,
  payload: RejectDocumentPayload
): Promise<{ success: boolean; document: any; message: string }> {
  const response = await fetch(`/api/validation-bc/documents/${id}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to reject document: ${response.status}`);
  }

  return response.json();
}

/**
 * Exécute une action en masse
 */
export async function executeBatchAction(
  payload: BatchActionPayload
): Promise<BatchActionResponse> {
  const response = await fetch('/api/validation-bc/batch-actions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to execute batch action: ${response.status}`);
  }

  return response.json();
}

/**
 * Récupère la timeline d'un document ou globale
 */
export async function getTimeline(
  id: string = 'global',
  signal?: AbortSignal
): Promise<{ events: TimelineEvent[] }> {
  const response = await fetch(`/api/validation-bc/timeline/${id}`, {
    signal,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Timeline not found');
    }
    throw new Error(`Failed to fetch timeline: ${response.status}`);
  }

  return response.json();
}

/**
 * Exporte des documents
 */
export async function exportDocuments(
  format: 'csv' | 'json' | 'pdf',
  filters?: {
    queue?: string;
    ids?: string[];
  }
): Promise<Blob> {
  const params = new URLSearchParams();
  params.set('format', format);
  
  if (filters?.queue) {
    params.set('queue', filters.queue);
  }
  
  if (filters?.ids && filters.ids.length > 0) {
    params.set('ids', filters.ids.join(','));
  }

  const response = await fetch(`/api/validation-bc/export?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to export: ${response.status}`);
  }

  return response.blob();
}

/**
 * Télécharge un export (helper)
 */
export function downloadExport(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

