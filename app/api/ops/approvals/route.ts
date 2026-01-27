/**
 * P20 – GET/POST /api/ops/approvals
 * Validations two-person rule pour exécution playbooks sensibles.
 * GET: liste des approbations en attente / validées.
 * POST: ajouter une validation (approver).
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import { hydrateContext } from '@lib-root/server/dashboard/context_ext';
import { can } from '@lib-root/server/security/policy';

// Stub in-memory pour démo. En prod : table audit_ops_approvals ou équivalent.
const approvalsStore: Array<{
  id: string;
  playbook: string;
  params: Record<string, unknown>;
  requestedAt: string;
  requestedBy: string;
  votes: Array<{ userId: string; at: string }>;
  requiredVotes: number;
  status: 'pending' | 'approved' | 'rejected';
}> = [];

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const baseCtx = extractContextFromHeaders(req.headers);
    const ctx = await hydrateContext(baseCtx);

    if (!can(ctx, { perm: 'ops:execute' })) {
      return NextResponse.json({ error: 'Forbidden', reason: 'ops:execute required' }, { status: 403 });
    }

    const status = req.nextUrl.searchParams.get('status') ?? 'pending';
    const list = approvalsStore.filter((a) => a.status === status);
    return NextResponse.json({ approvals: list });
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal server error', message: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const baseCtx = extractContextFromHeaders(req.headers);
    const ctx = await hydrateContext(baseCtx);

    if (!can(ctx, { perm: 'ops:execute' })) {
      return NextResponse.json({ error: 'Forbidden', reason: 'ops:execute required' }, { status: 403 });
    }

    const body = (await req.json()) as {
      action: 'create' | 'vote';
      approvalId?: string;
      playbook?: string;
      params?: Record<string, unknown>;
      requiredVotes?: number;
    };

    if (body.action === 'create') {
      const id = `apr-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      approvalsStore.push({
        id,
        playbook: body.playbook ?? '',
        params: body.params ?? {},
        requestedAt: new Date().toISOString(),
        requestedBy: ctx.userId,
        votes: [],
        requiredVotes: body.requiredVotes ?? 2,
        status: 'pending',
      });
      return NextResponse.json({ id, status: 'pending' });
    }

    if (body.action === 'vote' && body.approvalId) {
      const a = approvalsStore.find((x) => x.id === body.approvalId);
      if (!a) return NextResponse.json({ error: 'Approval not found' }, { status: 404 });
      if (a.status !== 'pending') return NextResponse.json({ error: 'Already resolved' }, { status: 400 });
      if (a.votes.some((v) => v.userId === ctx.userId)) {
        return NextResponse.json({ error: 'Already voted' }, { status: 400 });
      }
      a.votes.push({ userId: ctx.userId, at: new Date().toISOString() });
      if (a.votes.length >= a.requiredVotes) a.status = 'approved';
      return NextResponse.json({ approvalId: a.id, status: a.status, votes: a.votes.length });
    }

    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: 'Internal server error', message: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
