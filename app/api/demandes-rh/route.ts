import { NextRequest, NextResponse } from 'next/server';
import { demandesRH } from '@/lib/data/bmo-mock-2';

// Types
type DemandeStatus = 'en_attente' | 'validée' | 'rejetée' | 'en_cours';
type DemandeType = 'Congé' | 'Dépense' | 'Maladie' | 'Déplacement' | 'Paie';
type DemandeQueue = 'all' | 'pending' | 'urgent' | 'validated' | 'rejected' | string;

// Helper: Check if demand is urgent
function isUrgent(demande: any): boolean {
  if (demande.status === 'pending') {
    const dateDebut = new Date(demande.startDate || demande.date);
    const today = new Date();
    const diffDays = Math.ceil((dateDebut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Urgent si commence dans moins de 3 jours
    if (diffDays <= 3 && diffDays >= 0) return true;
    
    // Urgent si montant > 500000 pour les dépenses
    if (demande.type === 'Dépense' && demande.amount) {
      const amountNum = typeof demande.amount === 'string' 
        ? parseFloat(demande.amount.replace(/[^\d.]/g, '')) 
        : demande.amount;
      if (amountNum > 500000) return true;
    }
  }
  
  return false;
}

// GET /api/demandes-rh - Liste des demandes avec filtres
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queue = searchParams.get('queue') as DemandeQueue ?? 'all';
    const type = searchParams.get('type') as DemandeType | null;
    const bureau = searchParams.get('bureau');
    const agent = searchParams.get('agent');
    const limit = parseInt(searchParams.get('limit') ?? '100');
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    let filtered = [...demandesRH];
    
    // Filtrer par queue
    switch (queue) {
      case 'pending':
        filtered = filtered.filter(d => d.status === 'pending');
        break;
      case 'urgent':
        filtered = filtered.filter(d => d.status === 'pending' && isUrgent(d));
        break;
      case 'validated':
        filtered = filtered.filter(d => d.status === 'validated');
        break;
      case 'rejected':
        filtered = filtered.filter(d => d.status === 'rejected');
        break;
      default:
        // Si c'est un type (Congé, Dépense, etc.)
        if (['Congé', 'Dépense', 'Maladie', 'Déplacement', 'Paie'].includes(queue)) {
          filtered = filtered.filter(d => d.type === queue);
        }
    }
    
    // Filtres additionnels
    if (type) {
      filtered = filtered.filter(d => d.type === type);
    }
    if (bureau) {
      filtered = filtered.filter(d => d.bureau === bureau);
    }
    if (agent) {
      filtered = filtered.filter(d => 
        d.agent.toLowerCase().includes(agent.toLowerCase())
      );
    }
    
    // Trier par date (plus récent en premier)
    filtered.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Paginer
    const paginated = filtered.slice(offset, offset + limit);
    
    return NextResponse.json({
      items: paginated,
      total: filtered.length,
      queue,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Erreur GET /api/demandes-rh:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des demandes' },
      { status: 500 }
    );
  }
}

// POST /api/demandes-rh - Créer une nouvelle demande
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation basique
    if (!body.type || !body.agent || !body.bureau) {
      return NextResponse.json(
        { error: 'Type, agent et bureau sont requis' },
        { status: 400 }
      );
    }
    
    // En production: créer dans la base de données
    const newDemande = {
      id: `DEM-RH-${Date.now()}`,
      type: body.type,
      agent: body.agent,
      bureau: body.bureau,
      status: 'pending' as const,
      date: new Date().toISOString(),
      startDate: body.startDate || body.dateDebut,
      endDate: body.endDate || body.dateFin,
      reason: body.reason || body.motif || '',
      amount: body.amount || body.montant,
      destination: body.destination,
      documents: body.documents || body.pieces || [],
      priority: body.priority || 'normal' as const,
      initials: body.initials || '',
      subtype: body.subtype || '',
    };
    
    return NextResponse.json(newDemande, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/demandes-rh:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la demande' },
      { status: 500 }
    );
  }
}

