/**
 * P20 – Exécuteur CLI des playbooks ops
 * Usage: npx tsx jobs/opsRunner.ts <playbook> [--dry-run|--real] [--param key=value ...]
 *
 * Exemples:
 *   npx tsx jobs/opsRunner.ts mviews_refresh --dry-run --param tenantId=<uuid> --param domain=finance
 *   npx tsx jobs/opsRunner.ts mviews_refresh --real --param tenantId=<uuid> --param domain=finance
 *   npx tsx jobs/opsRunner.ts cache_purge --real --param pattern=cache:dashboard:*
 */

import { executeRunbook, type PlaybookName } from '@lib-root/server/ops';

function parseArgv(argv: string[]): {
  playbook: PlaybookName;
  dryRun: boolean;
  params: Record<string, unknown>;
} {
  const args = argv.slice(2).filter(Boolean);
  let playbook: PlaybookName | undefined;
  let dryRun = true;
  const params: Record<string, unknown> = {};

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') dryRun = true;
    else if (a === '--real') dryRun = false;
    else if (a === '--param' && args[i + 1]) {
      const eq = args[++i].indexOf('=');
      if (eq > 0) {
        const k = args[i].slice(0, eq);
        const v = args[i].slice(eq + 1);
        params[k] = v;
      }
    } else if (!a.startsWith('--') && !playbook) {
      playbook = a as PlaybookName;
    }
  }

  if (!playbook) {
    console.error('Usage: npx tsx jobs/opsRunner.ts <playbook> [--dry-run|--real] [--param k=v ...]');
    process.exit(1);
  }
  return { playbook, dryRun, params };
}

async function main() {
  const { playbook, dryRun, params } = parseArgv(process.argv);
  console.log('[OpsRunner]', { playbook, dryRun, params });

  try {
    const out = await executeRunbook({ playbook, params, dryRun });
    console.log(JSON.stringify(out, null, 2));
    process.exit(out.ok ? 0 : 1);
  } catch (e) {
    console.error('[OpsRunner]', e);
    process.exit(1);
  }
}

main();
