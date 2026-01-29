/**
 * Documents attachés par chantier — Devis, Contrats, Factures.
 * En production : API / stockage (S3, Blob).
 */

export type DocumentType = 'devis' | 'contrat' | 'facture' | 'plan' | 'autre';

export interface ChantierDocumentMock {
  id: string;
  chantierId: string;
  name: string;
  type: DocumentType;
  /** URL de téléchargement ou preview */
  url: string;
  /** Taille en octets */
  size?: number;
  /** Date de création ou signature */
  date: string;
  /** Signé / Brouillon */
  signed?: boolean;
}

const baseUrl = '/api/documents'; // placeholder

export const chantierDocuments: ChantierDocumentMock[] = [
  { id: 'doc-1', chantierId: 'RENOV-042', name: 'Devis signé.pdf', type: 'devis', url: `${baseUrl}/devis-042.pdf`, size: 245_000, date: '2024-11-15T10:00:00', signed: true },
  { id: 'doc-2', chantierId: 'RENOV-042', name: 'Contrat.pdf', type: 'contrat', url: `${baseUrl}/contrat-042.pdf`, size: 512_000, date: '2024-11-20T14:30:00', signed: true },
  { id: 'doc-3', chantierId: 'RENOV-042', name: 'Facture FRS-2024-0847.pdf', type: 'facture', url: `${baseUrl}/facture-0847.pdf`, size: 89_000, date: '2025-01-10T09:00:00' },
  { id: 'doc-4', chantierId: 'RENOV-042', name: 'Facture FRS-2024-0852.pdf', type: 'facture', url: `${baseUrl}/facture-0852.pdf`, size: 120_000, date: '2025-01-18T11:00:00' },
  { id: 'doc-5', chantierId: 'RENOV-042', name: 'Facture FRS-2024-0861.pdf', type: 'facture', url: `${baseUrl}/facture-0861.pdf`, size: 95_000, date: '2025-01-22T08:00:00' },
  { id: 'doc-6', chantierId: 'REPAR-015', name: 'Devis signé.pdf', type: 'devis', url: `${baseUrl}/devis-015.pdf`, size: 180_000, date: '2024-12-01T10:00:00', signed: true },
  { id: 'doc-7', chantierId: 'REPAR-015', name: 'Contrat.pdf', type: 'contrat', url: `${baseUrl}/contrat-015.pdf`, size: 420_000, date: '2024-12-05T14:00:00', signed: true },
  { id: 'doc-8', chantierId: 'RENOV-038', name: 'Devis signé.pdf', type: 'devis', url: `${baseUrl}/devis-038.pdf`, size: 310_000, date: '2024-10-20T09:00:00', signed: true },
  { id: 'doc-9', chantierId: 'RENOV-038', name: 'Contrat.pdf', type: 'contrat', url: `${baseUrl}/contrat-038.pdf`, size: 480_000, date: '2024-10-25T16:00:00', signed: true },
  { id: 'doc-10', chantierId: 'RENOV-038', name: 'Plan phase 6.pdf', type: 'plan', url: `${baseUrl}/plan-038-p6.pdf`, size: 1_200_000, date: '2025-01-15T10:00:00' },
];

export function getDocumentsByChantier(chantierId: string): ChantierDocumentMock[] {
  return chantierDocuments.filter((d) => d.chantierId === chantierId);
}

/** Labels par type de document */
export const documentTypeLabels: Record<DocumentType, string> = {
  devis: 'Devis',
  contrat: 'Contrat',
  facture: 'Facture',
  plan: 'Plan / Croquis',
  autre: 'Autre',
};
