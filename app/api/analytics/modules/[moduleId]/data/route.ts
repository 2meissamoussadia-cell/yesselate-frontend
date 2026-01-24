import { NextRequest, NextResponse } from 'next/server';
import { getMockDataForDomain } from '@/lib/mocks/analyticsMockData';
import { findModule } from '@/lib/config/analyticsBTPArchitecture';

/**
 * GET /api/analytics/modules/[moduleId]/data
 * Récupère les données d'un module
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  try {
    const { moduleId } = await params;
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get('domainId');

    if (!moduleId) {
      return NextResponse.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    if (!domainId) {
      return NextResponse.json(
        { error: 'Domain ID is required as query parameter' },
        { status: 400 }
      );
    }

    // Pour l'instant, utiliser les données mockées
    // TODO: Remplacer par un appel à la base de données
    const mockData = getMockDataForDomain(domainId);
    const moduleMeta = findModule(domainId, moduleId);
    
    const data = mockData?.list || [];

    return NextResponse.json({
      data,
      moduleId,
      domainId,
      module: moduleMeta ? { id: moduleMeta.id, label: moduleMeta.label } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching module data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

