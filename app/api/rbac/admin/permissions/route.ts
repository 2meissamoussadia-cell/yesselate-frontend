// app/api/rbac/admin/permissions/route.ts
// Phase P10: API Admin - Gestion des permissions

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import { pgPool } from '@lib-root/server/db/pool';

export async function GET(req: NextRequest) {
  const ctx = extractContextFromHeaders(req.headers);
  if (!ctx.roles.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const client = await pgPool.connect();
  try {
    const { rows } = await client.query(
      'SELECT id, code, label FROM rbac_permissions ORDER BY code'
    );
    return NextResponse.json(rows);
  } finally {
    client.release();
  }
}
