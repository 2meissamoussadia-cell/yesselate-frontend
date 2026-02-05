import { NextRequest, NextResponse } from 'next/server';
import { generateMockAlerts } from '@/lib/data/alerts';
import { sanitizeTextForComment } from '@/lib/utils/sanitize';

// Cache des alertes mock pour la durée du process : même jeu de données entre requêtes,
// afin que le tri (asc/desc) soit observable (même liste, ordre inversé).
let cachedMockAlerts: ReturnType<typeof generateMockAlerts> | null = null;

// Types
interface AlertFilters {
  status?: string | string[];
  severity?: string | string[];
  queue?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * GET /api/alerts
 * Récupérer la liste des alertes avec filtres et pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    
    // Extraire les filtres
    const filters: AlertFilters = {
      status: searchParams.get('status') || undefined,
      severity: searchParams.get('severity') || undefined,
      queue: searchParams.get('queue') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '25',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    const page = parseInt(filters.page || '1');
    const limit = parseInt(filters.limit || '20');

    // Réutiliser le même jeu d'alertes mock pour que le tri asc/desc soit visible
    if (!cachedMockAlerts) cachedMockAlerts = generateMockAlerts(100);
    let alerts = [...cachedMockAlerts];

    // Appliquer les filtres
    if (filters.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      alerts = alerts.filter(a => statuses.includes(a.status));
    }

    if (filters.severity) {
      const severities = Array.isArray(filters.severity) ? filters.severity : [filters.severity];
      alerts = alerts.filter(a => severities.includes(a.type));
    }

    if (filters.queue) {
      alerts = alerts.filter(a => a.queue === filters.queue);
    }

    if (filters.assignedTo) {
      alerts = alerts.filter(a => a.assignedTo === filters.assignedTo);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      alerts = alerts.filter(a => 
        a.title.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search)
      );
    }

    if (filters.dateFrom) {
      alerts = alerts.filter(a => new Date(a.createdAt) >= new Date(filters.dateFrom!));
    }

    if (filters.dateTo) {
      alerts = alerts.filter(a => new Date(a.createdAt) <= new Date(filters.dateTo!));
    }

    // Tri (sortBy = createdAt par défaut, sortOrder = asc | desc)
    const sortKey = filters.sortBy || 'createdAt';
    alerts.sort((a, b) => {
      const aVal = a[sortKey as keyof typeof a];
      const bVal = b[sortKey as keyof typeof b];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return filters.sortOrder === 'asc' ? cmp : -cmp;
    });

    // Pagination
    const total = alerts.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAlerts = alerts.slice(startIndex, endIndex);

    return NextResponse.json({
      alerts: paginatedAlerts,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/alerts
 * Créer une nouvelle alerte
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation basique
    if (!body.title || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type' },
        { status: 400 }
      );
    }

    // Sanitization anti-XSS (défense en profondeur)
    const title = sanitizeTextForComment(String(body.title)).slice(0, 200);
    const description = sanitizeTextForComment(String(body.description ?? '')).slice(0, 2000);
    if (!title) {
      return NextResponse.json(
        { error: 'Invalid title after sanitization' },
        { status: 400 }
      );
    }

    // Créer la nouvelle alerte
    const newAlert = {
      id: `alert-${Date.now()}`,
      type: body.type,
      title,
      description,
      source: body.source || 'system',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'open' as const,
      priority: body.priority || 5,
      assignedTo: body.assignedTo || null,
      queue: body.queue || body.type,
      tags: body.tags || [],
      metadata: body.metadata || {},
    };

    return NextResponse.json({
      success: true,
      alert: newAlert,
      message: 'Alert created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { error: 'Failed to create alert', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
