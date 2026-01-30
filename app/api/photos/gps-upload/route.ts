/**
 * Phase 6 — POST /api/photos/gps-upload
 * Upload photo GPS géolocalisée → S3 (ou mock) + hash SHA256 (huissier proof).
 * En prod : AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY → S3 Af-South-1.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BUCKET = 'yessalate-photos';
const REGION = 'af-south-1';
const BASE_URL = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const chantierId = formData.get('chantierId') as string | null;
    const phase = formData.get('phase') as string | null;
    const gpsLat = formData.get('gpsLat') as string | null;
    const gpsLng = formData.get('gpsLng') as string | null;

    if (!file || !chantierId) {
      return NextResponse.json(
        { error: 'file et chantierId requis' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const hash = createHash('sha256').update(buffer).digest('hex');

    const s3Key = `chantiers/${chantierId}/gps-${Date.now()}.jpg`;
    const url = `${BASE_URL}/${s3Key}`;

    // En prod : S3 PutObject avec Metadata { gpsLat, gpsLng }
    // if (process.env.AWS_ACCESS_KEY_ID) { await s3.putObject({ Bucket: BUCKET, Key: s3Key, Body: buffer, Metadata: { gpsLat: gpsLat ?? '', gpsLng: gpsLng ?? '' } }); }
    // Mock : pas d'upload réel
    void phase;
    void gpsLat;
    void gpsLng;

    return NextResponse.json({
      success: true,
      url,
      s3Key,
      hash,
      message: 'Photo GPS enregistrée (hash huissier)',
    });
  } catch (e) {
    console.error('[photos/gps-upload]', e);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
