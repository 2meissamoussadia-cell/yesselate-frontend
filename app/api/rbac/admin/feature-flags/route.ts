// app/api/rbac/admin/feature-flags/route.ts
// Phase P10: API Admin - Gestion des feature flags

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@/lib/server/dashboard/context';
import { FeatureFlagsService } from '@/lib/server/dashboard/rbac/featureFlagsService';

export async function GET(req: NextRequest) {
  const ctx = extractContextFromHeaders(req.headers);
  if (!ctx.roles.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const flags = new FeatureFlagsService();
  const tenantFlags = await flags.loadTenantFlags(ctx.tenantId);
  return NextResponse.json(Object.values(tenantFlags));
}

export async function POST(req: NextRequest) {
  const ctx = extractContextFromHeaders(req.headers);
  if (!ctx.roles.includes('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { feature_key, enabled } = body;

  const flags = new FeatureFlagsService();
  await flags.setFeatureFlag(ctx.tenantId, feature_key, enabled, undefined, ctx.userId);
  
  // Invalider le cache des feature flags pour ce tenant
  const { rbacCache } = await import('@/lib/server/dashboard/rbac/rbacCache');
  rbacCache.invalidate(`flags:${ctx.tenantId}`);
  
  return NextResponse.json({ success: true });
}
