// API Route: GET /api/validation-bc/documents
// Liste des documents avec filtres avancés

import { NextRequest } from 'next/server';
import { withErrorHandler, createSuccessResponse } from '@/lib/api/error-handler';

// Mock data enrichie
const mockDocuments = [
  {
    id: 'BC-2024-001',
    type: 'bc',
    status: 'pending',
    bureau: 'DRE',
    fournisseur: 'ENTREPRISE SENEGAL',
    objet: 'Travaux de rénovation bureau DRE',
    montantHT: 4166667,
    montantTTC: 5000000,
    tva: 20,
    projet: 'Rénovation bureaux',
    dateEmission: '2024-01-15',
    dateLimite: '2024-02-15',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    urgent: false,
    demandeur: {
      nom: 'Jean DUPONT',
      fonction: 'Chef de service',
      bureau: 'DRE',
    },
  },
  {
    id: 'BC-2024-002',
    type: 'bc',
    status: 'validated',
    bureau: 'DAAF',
    fournisseur: 'TECH SOLUTIONS',
    objet: 'Matériel informatique',
    montantHT: 2500000,
    montantTTC: 3000000,
    tva: 20,
    projet: 'Équipement IT',
    dateEmission: '2024-01-14',
    dateLimite: '2024-02-14',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    urgent: false,
    demandeur: {
      nom: 'Marie KANE',
      fonction: 'Directrice DAAF',
      bureau: 'DAAF',
    },
  },
  {
    id: 'FC-2024-001',
    type: 'facture',
    status: 'pending',
    bureau: 'DSI',
    fournisseur: 'CLOUD SERVICES',
    objet: 'Abonnement cloud mensuel',
    montantHT: 1666667,
    montantTTC: 2000000,
    tva: 20,
    projet: 'Infrastructure IT',
    dateEmission: '2024-01-13',
    dateLimite: '2024-01-31',
    createdAt: '2024-01-13T08:00:00Z',
    updatedAt: '2024-01-13T08:00:00Z',
    urgent: true,
    demandeur: {
      nom: 'Amadou SOW',
      fonction: 'DSI',
      bureau: 'DSI',
    },
  },
  {
    id: 'AV-2024-001',
    type: 'avenant',
    status: 'rejected',
    bureau: 'DG',
    fournisseur: 'CONSULTING PARTNERS',
    objet: 'Avenant au contrat de conseil',
    montantHT: 833333,
    montantTTC: 1000000,
    tva: 20,
    projet: 'Conseil stratégique',
    dateEmission: '2024-01-12',
    dateLimite: '2024-02-12',
    createdAt: '2024-01-12T07:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
    urgent: false,
    demandeur: {
      nom: 'Fatou DIOP',
      fonction: 'DG Adjoint',
      bureau: 'DG',
    },
  },
  {
    id: 'BC-2024-003',
    type: 'bc',
    status: 'pending',
    bureau: 'DRE',
    fournisseur: 'BTP CONSTRUCTION',
    objet: 'Construction nouveau bâtiment',
    montantHT: 6666667,
    montantTTC: 8000000,
    tva: 20,
    projet: 'Extension locaux',
    dateEmission: '2024-01-11',
    dateLimite: '2024-01-25',
    createdAt: '2024-01-11T06:00:00Z',
    updatedAt: '2024-01-11T06:00:00Z',
    urgent: true,
    demandeur: {
      nom: 'Ibrahima FALL',
      fonction: 'Directeur DRE',
      bureau: 'DRE',
    },
  },
  {
    id: 'BC-2024-004',
    type: 'bc',
    status: 'anomaly',
    bureau: 'DAAF',
    fournisseur: 'FOURNITURES PRO',
    objet: 'Fournitures de bureau',
    montantHT: 3750000,
    montantTTC: 4500000,
    tva: 20,
    projet: 'Fonctionnement',
    dateEmission: '2024-01-10',
    dateLimite: '2024-02-10',
    createdAt: '2024-01-10T05:00:00Z',
    updatedAt: '2024-01-11T10:00:00Z',
    urgent: false,
    anomalies: ['Montant TTC incohérent', 'Signature manquante'],
    demandeur: {
      nom: 'Ousmane NDIAYE',
      fonction: 'Chef comptable',
      bureau: 'DAAF',
    },
  },
];

export async function GET(request: NextRequest) {
  return withErrorHandler(async () => {
    const { searchParams } = new URL(request.url);
    const queue = searchParams.get('queue') || 'all';
    const bureau = searchParams.get('bureau');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const minAmount = searchParams.get('minAmount') ? Number(searchParams.get('minAmount')) : undefined;
    const maxAmount = searchParams.get('maxAmount') ? Number(searchParams.get('maxAmount')) : undefined;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 100;
    const offset = searchParams.get('offset') ? Number(searchParams.get('offset')) : 0;
    const query = searchParams.get('query');

    let filtered = [...mockDocuments];

    if (queue !== 'all') {
      switch (queue) {
        case 'pending':
          filtered = filtered.filter((d) => d.status === 'pending');
          break;
        case 'validated':
          filtered = filtered.filter((d) => d.status === 'validated');
          break;
        case 'rejected':
          filtered = filtered.filter((d) => d.status === 'rejected');
          break;
        case 'urgent':
          filtered = filtered.filter((d) => d.urgent);
          break;
        case 'anomaly':
          filtered = filtered.filter((d) => d.status === 'anomaly');
          break;
      }
    }
    if (bureau) filtered = filtered.filter((d) => d.bureau === bureau);
    if (type) filtered = filtered.filter((d) => d.type === type);
    if (status) filtered = filtered.filter((d) => d.status === status);
    if (minAmount !== undefined) filtered = filtered.filter((d) => d.montantTTC >= minAmount);
    if (maxAmount !== undefined) filtered = filtered.filter((d) => d.montantTTC <= maxAmount);
    if (dateFrom) filtered = filtered.filter((d) => new Date(d.dateEmission) >= new Date(dateFrom));
    if (dateTo) filtered = filtered.filter((d) => new Date(d.dateEmission) <= new Date(dateTo));
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.id.toLowerCase().includes(q) ||
          d.fournisseur.toLowerCase().includes(q) ||
          d.objet.toLowerCase().includes(q) ||
          d.demandeur.nom.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return createSuccessResponse({ items, total, hasMore, offset, limit });
  });
}

