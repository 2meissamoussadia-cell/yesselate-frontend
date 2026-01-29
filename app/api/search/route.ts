import { NextRequest, NextResponse } from 'next/server';
import Fuse from 'fuse.js';

const MAX_PER_TYPE = 10;
const MAX_TOTAL = 50;
const FUSE_THRESHOLD = 0.4; // Fuzzy: typo tolerance (0 = exact, 1 = very loose)

/** Données de recherche simulées (chantiers, clients, ouvriers, validations, documents) */
const MOCK_CHANTIERS = [
  { id: '042', nom: 'Villa Plateau', client: 'Diop', adresse: 'Dakar', phase: 4 },
  { id: '041', nom: 'Résidence Almadies', client: 'Sow', adresse: 'Dakar', phase: 3 },
  { id: '040', nom: 'Immeuble Sacré-Cœur', client: 'Diallo', adresse: 'Dakar', phase: 5 },
  { id: '039', nom: 'Villa Mermoz', client: 'Ba', adresse: 'Dakar', phase: 2 },
  { id: '038', nom: 'Chantier Thiès Nord', client: 'Fall', adresse: 'Thiès', phase: 1 },
  { id: '037', nom: 'Résidence Saint-Louis', client: 'Gaye', adresse: 'Saint-Louis', phase: 6 },
  { id: '036', nom: 'Villa Fann', client: 'Diop', adresse: 'Dakar', phase: 4 },
  { id: '035', nom: 'Bureaux Plateau', client: 'Sénégal SA', adresse: 'Dakar', phase: 3 },
  { id: '034', nom: 'Logements Pikine', client: 'HLM', adresse: 'Pikine', phase: 2 },
  { id: '033', nom: 'École Rufisque', client: 'État', adresse: 'Rufisque', phase: 1 },
];

const MOCK_CLIENTS = [
  { id: '15', nom: 'Amadou Diop', email: 'amadou@email.com', telephone: '+221 77 123 45 67', chantiers: 5 },
  { id: '14', nom: 'Mame Sow', email: 'mame.sow@mail.com', telephone: '+221 76 234 56 78', chantiers: 3 },
  { id: '13', nom: 'Ibrahima Diallo', email: 'diallo@pro.com', telephone: '+221 70 345 67 89', chantiers: 2 },
  { id: '12', nom: 'Awa Ba', email: 'awa.ba@email.com', telephone: '+221 77 456 78 90', chantiers: 4 },
  { id: '11', nom: 'Ousmane Fall', email: 'fall@entreprise.sn', telephone: '+221 76 567 89 01', chantiers: 1 },
  { id: '10', nom: 'Fatou Gaye', email: 'fatou.gaye@mail.com', telephone: '+221 70 678 90 12', chantiers: 2 },
  { id: '9', nom: 'Sénégal SA', email: 'contact@senegal-sa.sn', telephone: '+221 33 789 01 23', chantiers: 1 },
  { id: '8', nom: 'HLM Sénégal', email: 'hlm@hlm.sn', telephone: '+221 33 890 12 34', chantiers: 6 },
];

const MOCK_OUVRIERS = [
  { id: 'o1', nom: 'Chef Mbaye', specialite: 'Maçon', chantier: '042' },
  { id: 'o2', nom: 'Moussa Diallo', specialite: 'Électricien', chantier: '041' },
  { id: 'o3', nom: 'Ibrahima Sow', specialite: 'Plombier', chantier: '042' },
  { id: 'o4', nom: 'Pape Fall', specialite: 'Carreleur', chantier: '040' },
  { id: 'o5', nom: 'Abdoulaye Ba', specialite: 'Peintre', chantier: '039' },
  { id: 'o6', nom: 'Saliou Ndiaye', specialite: 'Menuisier', chantier: '041' },
  { id: 'o7', nom: 'Oumar Kane', specialite: 'Maçon', chantier: '038' },
  { id: 'o8', nom: 'Mamadou Gueye', specialite: 'Électricien', chantier: '040' },
];

const MOCK_VALIDATIONS = [
  { id: 'BC-156', type: 'BC', montant: 2500000, chantier: '042', statut: 'approved' },
  { id: 'BC-155', type: 'BC', montant: 1800000, chantier: '041', statut: 'pending' },
  { id: 'FAC-089', type: 'facture', montant: 3200000, chantier: '040', statut: 'approved' },
  { id: 'CTR-012', type: 'contrat', montant: 15000000, chantier: '042', statut: 'pending' },
  { id: 'BC-154', type: 'BC', montant: 900000, chantier: '039', statut: 'rejected' },
  { id: 'FAC-088', type: 'facture', montant: 2100000, chantier: '041', statut: 'pending' },
];

const MOCK_DOCUMENTS = [
  { id: 'd1', nom: 'devis-sococim-v2.pdf', chantier: '042', type: 'devis' },
  { id: 'd2', nom: 'plan-villa-plateau.pdf', chantier: '042', type: 'plan' },
  { id: 'd3', nom: 'facture-quincaillerie-janv.pdf', chantier: '041', type: 'facture' },
  { id: 'd4', nom: 'contrat-042-signé.pdf', chantier: '042', type: 'contrat' },
  { id: 'd5', nom: 'photos-avancement-042.zip', chantier: '042', type: 'photos' },
  { id: 'd6', nom: 'devis-almadies.pdf', chantier: '041', type: 'devis' },
];

type SearchableChantier = (typeof MOCK_CHANTIERS)[number];
type SearchableClient = (typeof MOCK_CLIENTS)[number];
type SearchableOuvrier = (typeof MOCK_OUVRIERS)[number];
type SearchableValidation = (typeof MOCK_VALIDATIONS)[number];
type SearchableDocument = (typeof MOCK_DOCUMENTS)[number];

/** Résultat normalisé pour le client */
export interface SearchResultItem {
  id: string;
  type: 'chantier' | 'client' | 'ouvrier' | 'validation' | 'document';
  title: string;
  meta: string;
  href: string;
  icon: string;
}

function toChantierResult(c: SearchableChantier): SearchResultItem {
  return {
    id: c.id,
    type: 'chantier',
    title: `${c.nom} - Chantier ${c.id}`,
    meta: `Client: ${c.client} - Phase ${c.phase} - ${c.adresse}`,
    href: `/maitre-ouvrage/projets-en-cours?chantier=${c.id}`,
    icon: '🏗️',
  };
}

function toClientResult(c: SearchableClient): SearchResultItem {
  return {
    id: c.id,
    type: 'client',
    title: c.nom,
    meta: `${c.email} - ${c.chantiers} chantiers`,
    href: `/maitre-ouvrage/clients?id=${c.id}`,
    icon: '👤',
  };
}

function toOuvrierResult(o: SearchableOuvrier): SearchResultItem {
  return {
    id: o.id,
    type: 'ouvrier',
    title: o.nom,
    meta: `${o.specialite} - Chantier ${o.chantier}`,
    href: `/maitre-ouvrage/employes?id=${o.id}`,
    icon: '👷',
  };
}

function toValidationResult(v: SearchableValidation): SearchResultItem {
  return {
    id: v.id,
    type: 'validation',
    title: v.id,
    meta: `${(v.montant / 1_000_000).toFixed(1)}M FCFA - Chantier ${v.chantier}`,
    href: `/maitre-ouvrage/validation-bc?id=${v.id}`,
    icon: '✅',
  };
}

function toDocumentResult(d: SearchableDocument): SearchResultItem {
  return {
    id: d.id,
    type: 'document',
    title: d.nom,
    meta: `Chantier ${d.chantier} - ${d.type}`,
    href: `/maitre-ouvrage/projets-en-cours?chantier=${d.chantier}&doc=${d.id}`,
    icon: '📄',
  };
}

/**
 * GET /api/search
 * Recherche globale avec fuzzy matching (chantiers, clients, ouvriers, validations, documents).
 * Query min 2 caractères. Max 10 par type, 50 total.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.trim() ?? '';
    const limitPerType = Math.min(parseInt(searchParams.get('limitPerType') || String(MAX_PER_TYPE), 10) || MAX_PER_TYPE, 20);
    const limitTotal = Math.min(parseInt(searchParams.get('limitTotal') || String(MAX_TOTAL), 10) || MAX_TOTAL, 50);

    if (query.length < 2) {
      return NextResponse.json(
        { error: 'Query trop courte (minimum 2 caractères)' },
        { status: 400 }
      );
    }

    const runFuse = <T>(items: T[], keys: (keyof T)[]): T[] => {
      const fuse = new Fuse(items, {
        keys: keys as string[],
        threshold: FUSE_THRESHOLD,
        includeScore: true,
      });
      return fuse.search(query).map((r: { item: T }) => r.item).slice(0, limitPerType);
    };

    const chantiersFiltered = runFuse(MOCK_CHANTIERS, ['nom', 'id', 'client', 'adresse']).map(toChantierResult);
    const clientsFiltered = runFuse(MOCK_CLIENTS, ['nom', 'email', 'telephone']).map(toClientResult);
    const ouvriersFiltered = runFuse(MOCK_OUVRIERS, ['nom', 'specialite', 'chantier']).map(toOuvrierResult);
    const validationsFiltered = runFuse(MOCK_VALIDATIONS, ['id', 'type', 'chantier']).map(toValidationResult);
    const documentsFiltered = runFuse(MOCK_DOCUMENTS, ['nom', 'chantier', 'type']).map(toDocumentResult);

    const groups = {
      chantiers: chantiersFiltered,
      clients: clientsFiltered,
      ouvriers: ouvriersFiltered,
      validations: validationsFiltered,
      documents: documentsFiltered,
    };

    const allResults: SearchResultItem[] = [
      ...groups.chantiers,
      ...groups.clients,
      ...groups.ouvriers,
      ...groups.validations,
      ...groups.documents,
    ].slice(0, limitTotal);

    return NextResponse.json(
      {
        query,
        results: allResults,
        groups: {
          chantiers: groups.chantiers,
          clients: groups.clients,
          ouvriers: groups.ouvriers,
          validations: groups.validations,
          documents: groups.documents,
        },
        total: allResults.length,
        summary: {
          chantiers: groups.chantiers.length,
          clients: groups.clients.length,
          ouvriers: groups.ouvriers.length,
          validations: groups.validations.length,
          documents: groups.documents.length,
        },
        ts: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (error) {
    console.error('Erreur GET /api/search:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la recherche' },
      { status: 500 }
    );
  }
}
