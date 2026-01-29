/**
 * GET /api/bmo/blocked/watchlist — Liste des dossiers en watchlist pour l'utilisateur
 * POST /api/bmo/blocked/watchlist — Ajouter un dossier à la watchlist (body: { dossierId })
 * DELETE /api/bmo/blocked/watchlist — Retirer un dossier (body: { dossierId })
 */

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// In-memory fallback when no DB table exists (remplace par BlockedWatchlist en Prisma si besoin)
const memoryWatchlist = new Map<string, Set<string>>();

function getUserId(req: NextRequest): string {
  return req.headers.get('x-user-id') || req.headers.get('x-user-id') || 'anonymous';
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);

    // TODO: when BlockedWatchlist model exists:
    // const list = await prisma.blockedWatchlist.findMany({ where: { userId }, select: { dossierId: true } });
    // return NextResponse.json({ dossierIds: list.map(l => l.dossierId) });

    const set = memoryWatchlist.get(userId);
    const dossierIds = set ? Array.from(set) : [];
    return NextResponse.json({ dossierIds, total: dossierIds.length });
  } catch (error) {
    console.error('[blocked/watchlist] GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch watchlist', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const body = await request.json();
    const dossierId = body?.dossierId;
    if (!dossierId || typeof dossierId !== 'string') {
      return NextResponse.json({ error: 'dossierId is required' }, { status: 400 });
    }

    // Optional: verify dossier exists
    try {
      await prisma.blockedDossier.findUniqueOrThrow({ where: { id: dossierId } });
    } catch {
      return NextResponse.json({ error: 'Dossier not found' }, { status: 404 });
    }

    // TODO: when BlockedWatchlist model exists: await prisma.blockedWatchlist.upsert(...)
    let set = memoryWatchlist.get(userId);
    if (!set) {
      set = new Set();
      memoryWatchlist.set(userId, set);
    }
    set.add(dossierId);

    return NextResponse.json({ success: true, dossierId, message: 'Added to watchlist' });
  } catch (error) {
    console.error('[blocked/watchlist] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to add to watchlist', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserId(request);
    const body = await request.json();
    const dossierId = body?.dossierId;
    if (!dossierId || typeof dossierId !== 'string') {
      return NextResponse.json({ error: 'dossierId is required' }, { status: 400 });
    }

    const set = memoryWatchlist.get(userId);
    if (set) set.delete(dossierId);

    return NextResponse.json({ success: true, dossierId, message: 'Removed from watchlist' });
  } catch (error) {
    console.error('[blocked/watchlist] DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from watchlist', details: String(error) },
      { status: 500 }
    );
  }
}
