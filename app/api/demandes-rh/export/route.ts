import { NextRequest, NextResponse } from 'next/server';
import { demandesRH } from '@/lib/data/bmo-mock-2';

// Fonction pour générer CSV
function generateCSV(data: any[]): string {
  if (data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const rows = data.map(item =>
    headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Échapper les guillemets et entourer de guillemets si nécessaire
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(';')
  );
  
  return [headers.join(';'), ...rows].join('\n');
}

// GET /api/demandes-rh/export - Export des demandes
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') ?? 'csv';
    const queue = searchParams.get('queue') ?? 'all';
    const type = searchParams.get('type');
    
    let filtered = [...demandesRH];
    
    // Filtrer par queue
    switch (queue) {
      case 'pending':
        filtered = filtered.filter(d => d.status === 'pending');
        break;
      case 'urgent':
        filtered = filtered.filter(d => d.status === 'pending' && d.priority === 'urgent');
        break;
      case 'validated':
        filtered = filtered.filter(d => d.status === 'validated');
        break;
      case 'rejected':
        filtered = filtered.filter(d => d.status === 'rejected');
        break;
      default:
        if (['Congé', 'Dépense', 'Maladie', 'Déplacement', 'Paie'].includes(queue)) {
          filtered = filtered.filter(d => d.type === queue);
        }
    }
    
    // Filtrer par type si spécifié
    if (type) {
      filtered = filtered.filter(d => d.type === type);
    }
    
    // Préparer les données pour l'export
    const exportData = filtered.map(d => ({
      ID: d.id,
      Type: d.type,
      Agent: d.agent,
      Bureau: d.bureau,
      Statut: d.status,
      DateCreation: d.date,
      DateDebut: d.startDate || '',
      DateFin: d.endDate || '',
      Motif: d.reason || '',
      Montant: d.amount || 0,
      Destination: d.destination || '',
      NbPieces: d.documents?.length || 0,
    }));
    
    // Générer le fichier selon le format
    switch (format) {
      case 'json':
        return NextResponse.json(exportData, {
          headers: {
            'Content-Disposition': `attachment; filename="demandes-rh_${queue}_${new Date().toISOString().slice(0, 10)}.json"`,
          },
        });
      
      case 'csv':
      default:
        const csv = '\uFEFF' + generateCSV(exportData); // UTF-8 BOM pour Excel
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="demandes-rh_${queue}_${new Date().toISOString().slice(0, 10)}.csv"`,
          },
        });
    }
  } catch (error) {
    console.error('Erreur GET /api/demandes-rh/export:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}

