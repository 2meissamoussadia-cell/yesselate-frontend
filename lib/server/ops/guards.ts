/**
 * P20 – Ops & Remédiations : garde-fous
 * Dry-run, scope minimal (tenant/bureau/chantier), blast radius, approbations.
 */

export interface OpsScope {
  tenantId?: string;
  bureauCode?: string;
  chantierCode?: string;
}

export interface GuardsInput {
  dryRun?: boolean;
  scope?: OpsScope;
  approvalId?: string;
}

/**
 * Vérifie que dryRun est un booléen.
 */
export function ensureDryRun(dryRun: boolean): void {
  if (typeof dryRun !== 'boolean') {
    throw new Error('dryRun must be a boolean');
  }
}

/**
 * Vérifie le scope (tenant requis si l’opération est tenant-scoped).
 * requireTenant défaut true : ensureScope({ tenantId }) suffit pour playbooks tenant-scoped.
 */
export function ensureScope(scope: OpsScope | undefined, requireTenant = true): void {
  if (!scope) return;
  if (requireTenant && (!scope.tenantId || typeof scope.tenantId !== 'string')) {
    throw new Error('tenantId is required for this playbook');
  }
  if (scope.tenantId && typeof scope.tenantId !== 'string') {
    throw new Error('Invalid tenantId');
  }
}

/**
 * Estime le blast radius (étendue) pour logs/audit.
 */
export function blastRadiusLabel(scope: OpsScope | undefined): string {
  if (!scope) return 'global';
  const parts: string[] = [];
  if (scope.tenantId) parts.push(`tenant=${scope.tenantId}`);
  if (scope.bureauCode) parts.push(`bureau=${scope.bureauCode}`);
  if (scope.chantierCode) parts.push(`chantier=${scope.chantierCode}`);
  return parts.length ? parts.join(', ') : 'global';
}

/**
 * Vérifie qu’une approbation two-person rule est présente (si requise).
 * À implémenter avec GET /api/ops/approvals et stockage des validations.
 */
export async function requireApproval(
  _approvalId: string | undefined,
  _requiredVotes: number = 2
): Promise<boolean> {
  if (!_approvalId) return false;
  // TODO: appeler approvals API ou DB pour vérifier nombre de validations >= requiredVotes
  return true;
}
