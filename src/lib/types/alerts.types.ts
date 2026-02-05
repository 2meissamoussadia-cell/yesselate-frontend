/**
 * Legacy Alert Types
 * ==================
 * Re-exported from the new standard types for backward compatibility
 * 
 * @deprecated Use types from '@/lib/types/alert.types' instead
 */

import type { AlertSeverity, AlertStatus, AlertCategory, AlertItem } from './alert.types';

export type { AlertSeverity, AlertStatus, AlertCategory, AlertItem };

// Legacy type aliases for backward compatibility
export type Severity = AlertSeverity;
export type Alert = AlertItem;

export type Incident = {
  id: string;
  fingerprint: string;
  severity: Severity;
  title: string;
  bureau?: string;
  impactMoney: number;
  dueAt?: string;
  alerts: Alert[];
};

export function fingerprintAlert(a: Alert): string {
  const e = a.entity;
  const obj = typeof e === 'object' && e !== null ? (e as Record<string, unknown>) : null;
  return [
    a.type ?? 'none',
    obj?.kind ?? 'none',
    obj?.id ?? 'none',
    obj?.projectId ?? 'noproj',
    obj?.supplierId ?? 'nosupplier',
  ].join('|');
}

export function correlateAlertsToIncidents(alerts: Alert[]): Incident[] {
  const map = new Map<string, Incident>();

  for (const a of alerts) {
    const fp = fingerprintAlert(a);
    const existing = map.get(fp);

    const impactObj = typeof a.impact === 'object' && a.impact !== null ? (a.impact as Record<string, unknown>) : null;
    const money = (impactObj?.money as number | undefined) ?? 0;

    if (!existing) {
      map.set(fp, {
        id: `INC-${fp.replaceAll('|', '-').slice(0, 32)}`,
        fingerprint: fp,
        severity: a.severity,
        title: a.title,
        bureau: a.bureau,
        impactMoney: money,
        dueAt: a.slaDueAt,
        alerts: [a],
      });
    } else {
      existing.alerts.push(a);
      existing.impactMoney += money;

      // severity max (critical > warning > info > success)
      const rank = (s: Severity) => ({ critical: 4, warning: 3, info: 2, success: 1 }[s]);
      if (rank(a.severity) > rank(existing.severity)) existing.severity = a.severity;

      // dueAt earliest
      if (a.slaDueAt && (!existing.dueAt || a.slaDueAt < existing.dueAt)) existing.dueAt = a.slaDueAt;
    }
  }

  return Array.from(map.values()).sort((x, y) => {
    const rank = (s: Severity) => ({ critical: 4, warning: 3, info: 2, success: 1 }[s]);
    if (rank(y.severity) !== rank(x.severity)) return rank(y.severity) - rank(x.severity);
    return (x.dueAt ?? '9999') < (y.dueAt ?? '9999') ? -1 : 1;
  });
}

