// app/api/rbac/admin/roles/route.ts
// Phase P10: API Admin - Gestion des rôles

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
      'SELECT id, code, label FROM rbac_roles WHERE tenant_id = $1 ORDER BY code',
      [ctx.tenantId]
    );
    return NextResponse.json(rows);
  } finally {
    client.release();
  }
}

export async function POST(req: NextRequest) {
  const ctx = extractContextFromHeaders(req.headers);
  if (!ctx.roles.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { code, label } = body;

  const client = await pgPool.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO rbac_roles (tenant_id, code, label) VALUES ($1, $2, $3) RETURNING id, code, label`,
      [ctx.tenantId, code, label]
    );
    
    // Invalider le cache RBAC pour tous les utilisateurs de ce tenant
    const { rbacCache } = await import('@lib-root/server/dashboard/rbac/rbacCache');
    rbacCache.invalidateTenant(ctx.tenantId);
    
    return NextResponse.json(rows[0]);
  } finally {
    client.release();
  }
}
