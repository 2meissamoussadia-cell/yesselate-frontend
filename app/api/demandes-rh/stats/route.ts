import { NextRequest, NextResponse } from 'next/server';
import { demandesRH } from '@/lib/data/bmo-mock-2';

// Helper: Check if demand is urgent
function isUrgent(demande: any): boolean {
  if (demande.status === 'pending') {
    const dateDebut = new Date(demande.startDate || demande.date);
    const today = new Date();
    const diffDays = Math.ceil((dateDebut.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 3 && diffDays >= 0) return true;
    if (demande.type === 'Dépense' && demande.amount) {
      const amountNum = typeof demande.amount === 'string' 
        ? parseFloat(demande.amount.replace(/[^\d.]/g, '')) 
        : demande.amount;
      if (amountNum > 500000) return true;
    }
  }
  
  return false;
}

// GET /api/demandes-rh/stats - Statistiques complètes
export async function GET(request: NextRequest) {
  try {
    // Calculer les stats
    const total = demandesRH.length;
    const pending = demandesRH.filter(d => d.status === 'pending').length;
    const urgent = demandesRH.filter(d => d.status === 'pending' && isUrgent(d)).length;
    const validated = demandesRH.filter(d => d.status === 'validated').length;
    const rejected = demandesRH.filter(d => d.status === 'rejected').length;
    const inProgress = 0; // HRRequest doesn't have 'in_cours' status
    
    // Par type
    const byType = Object.entries(
      demandesRH.reduce((acc: Record<string, number>, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      }, {})
    ).map(([type, count]) => ({ type, count }))
     .sort((a, b) => b.count - a.count);
    
    // Par bureau
    const bureauStats = demandesRH.reduce((acc: Record<string, { count: number; totalAmount: number }>, d) => {
      const bureau = d.bureau || 'Non assigné';
      if (!acc[bureau]) {
        acc[bureau] = { count: 0, totalAmount: 0 };
      }
      acc[bureau].count++;
      if (d.amount) {
        const amountNum = typeof d.amount === 'string' 
          ? parseFloat(d.amount.replace(/[^\d.]/g, '')) 
          : d.amount;
        acc[bureau].totalAmount += amountNum || 0;
      }
      return acc;
    }, {});
    
    const byBureau = Object.entries(bureauStats)
      .map(([bureau, stats]) => ({ bureau, ...stats }))
      .sort((a, b) => b.count - a.count);
    
    // Par statut
    const byStatus = Object.entries(
      demandesRH.reduce((acc: Record<string, number>, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {})
    ).map(([status, count]) => ({ status, count }));
    
    // Montants pour les dépenses
    const depenses = demandesRH.filter(d => 
      (d.type === 'Dépense' || d.type === 'Déplacement' || d.type === 'Paie') && 
      d.amount
    );
    
    const parseAmount = (amount: string | number | undefined): number => {
      if (!amount) return 0;
      if (typeof amount === 'number') return amount;
      return parseFloat(amount.replace(/[^\d.]/g, '')) || 0;
    };
    
    const totalAmount = depenses.reduce((sum, d) => sum + parseAmount(d.amount), 0);
    const validatedAmount = depenses
      .filter(d => d.status === 'validated')
      .reduce((sum, d) => sum + parseAmount(d.amount), 0);
    const pendingAmount = depenses
      .filter(d => d.status === 'pending')
      .reduce((sum, d) => sum + parseAmount(d.amount), 0);
    
    // Délai moyen de traitement (simulé)
    const avgProcessingDays = 3.5;
    
    // Taux de validation (%)
    const validationRate = total > 0 
      ? Math.round((validated / (validated + rejected)) * 100) || 0
      : 0;
    
    // Activité récente (simulée)
    const recentActivity = demandesRH
      .slice(0, 10)
      .map((d, i) => ({
        id: `activity-${i}`,
        demandeId: d.id,
        type: d.type,
        agent: d.agent,
        action: i % 3 === 0 ? 'created' : i % 3 === 1 ? 'validated' : 'updated',
        actor: 'A. DIALLO',
        createdAt: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
      }));
    
    // Prévisions IA (simulées)
    const predictions = {
      nextWeekDemands: Math.round(total * 0.15), // 15% du total
      peakDay: 'Lundi', // Jour avec le plus de demandes
      averagePerDay: Math.round(total / 30), // Moyenne sur 30 jours
      congeTrendNext30Days: '+12%', // Tendance congés
    };
    
    return NextResponse.json({
      total,
      pending,
      urgent,
      validated,
      rejected,
      inProgress,
      byType,
      byBureau,
      byStatus,
      amounts: {
        total: totalAmount,
        validated: validatedAmount,
        pending: pendingAmount,
      },
      metrics: {
        avgProcessingDays,
        validationRate,
      },
      predictions,
      recentActivity,
      ts: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur GET /api/demandes-rh/stats:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul des statistiques' },
      { status: 500 }
    );
  }
}

