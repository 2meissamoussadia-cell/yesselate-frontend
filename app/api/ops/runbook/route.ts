/**
 * P20 – POST /api/ops/runbook
 * Exécute un playbook (dry-run ou real). RBAC ops:execute + audit.
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractContextFromHeaders } from '@lib-root/server/dashboard/context';
import { hydrateContext } from '@lib-root/server/dashboard/context_ext';
import { can } from '@lib-root/server/security/policy';
import { executeRunbook, appendAudit, type PlaybookName, type RunbookRequest } from '@lib-root/server/ops';

const log = typeof console !== 'undefined' ? console : { info: () => {}, warn: () => {} };

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const baseCtx = extractContextFromHeaders(req.headers);
    const ctx = await hydrateContext(baseCtx);

    if (!can(ctx, { perm: 'ops:execute' })) {
      return NextResponse.json({ error: 'Forbidden', reason: 'ops:execute required' }, { status: 403 });
    }

    const body = (await req.json()) as { playbook?: string; params?: Record<string, unknown>; dryRun?: boolean; scope?: RunbookRequest['scope'] };
    const playbook = body.playbook as PlaybookName | undefined;
    if (!playbook) {
      return NextResponse.json({ error: 'Bad request', reason: 'playbook required' }, { status: 400 });
    }

    const request: RunbookRequest = {
      playbook,
      params: body.params,
      dryRun: body.dryRun ?? true,
      scope: body.scope,
    };

    const out = await executeRunbook(request);

    await appendAudit({
      kind: 'ops:runbook-exec',
      tenantId: ctx.tenantId,
      details: {
        userId: ctx.userId,
        playbook,
        params: body.params,
        dryRun: out.dryRun,
        ok: out.ok,
      },
    });

    return NextResponse.json(out, { status: out.ok ? 200 : 422 });
  } catch (e) {
    log.warn?.('[Ops Runbook]', e);
    return NextResponse.json(
      { error: 'Internal server error', message: e instanceof Error ? e.message : String(e) },
      { status: 500 }
    );
  }
}
