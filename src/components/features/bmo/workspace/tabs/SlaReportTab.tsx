'use client';

import { useMemo } from 'react';
import { WorkspaceTab } from '@/lib/stores/workspaceStore';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';
import { Badge } from '@/components/ui/badge';

import { demands, bureaux } from '@/lib/data';
import type { Demand } from '@/lib/types/bmo.types';

const calcDelay = (dateStr: string) => {
  const [d, m, y] = (dateStr ?? '').split('/').map(Number);
  if (!d || !m || !y) return 0;
  const t = new Date(y, m - 1, d).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.ceil((Date.now() - t) / 86400000));
};

export function SlaReportTab({ tab }: { tab: WorkspaceTab }) {
  const targetBureau = tab.data?.bureau as string | undefined;

  const slaData = useMemo(() => {
    const allDemands = (demands as Demand[]).map((d) => ({
      ...d,
      delay: calcDelay(d.date),
      isOverdue: calcDelay(d.date) > 7 && d.status !== 'validated',
    }));

    const filtered = targetBureau 
      ? allDemands.filter((d) => d.bureau === targetBureau)
      : allDemands;

    const byBureau = bureaux.map((b) => {
      const bureauDemands = filtered.filter((d) => d.bureau === b.code);
      const total = bureauDemands.length;
      const overdue = bureauDemands.filter((d) => d.isOverdue).length;
      const validated = bureauDemands.filter((d) => d.status === 'validated').length;
      const avgDelay = total > 0
        ? Math.round(bureauDemands.reduce((sum, d) => sum + d.delay, 0) / total)
        : 0;
      const slaCompliance = total > 0 ? Math.round(((total - overdue) / total) * 100) : 0;

      return {
        bureau: b,
        total,
        overdue,
        validated,
        avgDelay,
        slaCompliance,
      };
    });

    const globalTotal = filtered.length;
    const globalOverdue = filtered.filter((d) => d.isOverdue).length;
    const globalValidated = filtered.filter((d) => d.status === 'validated').length;
    const globalAvgDelay = globalTotal > 0
      ? Math.round(filtered.reduce((sum, d) => sum + d.delay, 0) / globalTotal)
      : 0;
    const globalSlaCompliance = globalTotal > 0 
      ? Math.round(((globalTotal - globalOverdue) / globalTotal) * 100) 
      : 0;

    return {
      byBureau: byBureau.filter((b) => b.total > 0),
      global: {
        total: globalTotal,
        overdue: globalOverdue,
        validated: globalValidated,
        avgDelay: globalAvgDelay,
        slaCompliance: globalSlaCompliance,
      },
    };
  }, [targetBureau]);

  return (
    <FluentCard className="min-h-[600px]">
      <FluentCardHeader className="pb-2">
        <FluentCardTitle className="text-sm flex items-center gap-2">
          <span className="text-2xl">📈</span>
          <span>Rapport SLA</span>
          {targetBureau && (
            <span className="text-[rgb(var(--muted))] font-normal">— Bureau {targetBureau}</span>
          )}
        </FluentCardTitle>
      </FluentCardHeader>

      <FluentCardContent className="space-y-4">
        {/* KPIs globaux */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-lg border border-[rgb(var(--border)/0.5)] bg-[rgb(var(--surface-2)/0.5)]">
          <div className="text-center">
            <div className="text-xs text-[rgb(var(--muted))] mb-1">Total demandes</div>
            <div className="text-2xl font-bold">{slaData.global.total}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[rgb(var(--muted))] mb-1">Conformité SLA</div>
            <div className={`text-2xl font-bold ${
              slaData.global.slaCompliance >= 90 ? 'text-emerald-400' :
              slaData.global.slaCompliance >= 70 ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {slaData.global.slaCompliance}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[rgb(var(--muted))] mb-1">En retard</div>
            <div className="text-2xl font-bold text-orange-400">{slaData.global.overdue}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[rgb(var(--muted))] mb-1">Validées</div>
            <div className="text-2xl font-bold text-emerald-400">{slaData.global.validated}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[rgb(var(--muted))] mb-1">Délai moyen</div>
            <div className="text-2xl font-bold">{slaData.global.avgDelay}j</div>
          </div>
        </div>

        {/* Tableau par bureau */}
        <div>
          <div className="text-sm font-semibold mb-3">Performance par bureau</div>
          
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-[120px_1fr_100px_100px_100px_100px] gap-2 text-xs text-[rgb(var(--muted))] px-3">
              <div>Bureau</div>
              <div>Nom</div>
              <div className="text-right">Total</div>
              <div className="text-right">Retard</div>
              <div className="text-right">SLA</div>
              <div className="text-right">Délai moy.</div>
            </div>

            {/* Lignes */}
            {slaData.byBureau.map((item) => (
              <div
                key={item.bureau.code}
                className="grid grid-cols-[120px_1fr_100px_100px_100px_100px] gap-2 items-center p-3 rounded-lg border border-[rgb(var(--border)/0.5)] hover:bg-[rgb(var(--surface-2)/0.5)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{item.bureau.icon}</span>
                  <span className="font-mono font-semibold">{item.bureau.code}</span>
                </div>
                <div className="text-sm truncate">{item.bureau.name}</div>
                <div className="text-right font-mono">{item.total}</div>
                <div className="text-right">
                  {item.overdue > 0 ? (
                    <Badge variant="urgent" className="text-[10px]">{item.overdue}</Badge>
                  ) : (
                    <span className="text-[rgb(var(--muted))]">—</span>
                  )}
                </div>
                <div className="text-right">
                  <Badge 
                    variant={
                      item.slaCompliance >= 90 ? 'success' :
                      item.slaCompliance >= 70 ? 'warning' :
                      'urgent'
                    }
                    className="text-[10px]"
                  >
                    {item.slaCompliance}%
                  </Badge>
                </div>
                <div className="text-right font-mono text-sm">{item.avgDelay}j</div>
              </div>
            ))}

            {slaData.byBureau.length === 0 && (
              <div className="py-10 text-center text-[rgb(var(--muted))] text-sm">
                Aucune donnée disponible.
              </div>
            )}
          </div>
        </div>

        {/* Recommandations */}
        <div className="pt-3 border-t border-[rgb(var(--border)/0.5)]">
          <div className="text-sm font-semibold mb-2">Recommandations</div>
          <div className="space-y-2 text-sm text-[rgb(var(--muted))]">
            {slaData.global.slaCompliance < 70 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <span>⚠️</span>
                <div>
                  <div className="font-semibold text-red-400">Alerte critique</div>
                  <div>La conformité SLA globale est sous 70%. Action immédiate requise.</div>
                </div>
              </div>
            )}
            {slaData.global.overdue > 5 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span>⏱️</span>
                <div>
                  <div className="font-semibold text-amber-400">Retards multiples</div>
                  <div>{slaData.global.overdue} demandes sont en retard. Prioriser le traitement.</div>
                </div>
              </div>
            )}
            {slaData.global.avgDelay > 10 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <span>📊</span>
                <div>
                  <div className="font-semibold text-orange-400">Délai élevé</div>
                  <div>Le délai moyen de {slaData.global.avgDelay}j dépasse le seuil optimal de 10j.</div>
                </div>
              </div>
            )}
            {slaData.global.slaCompliance >= 90 && slaData.global.overdue === 0 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span>✅</span>
                <div>
                  <div className="font-semibold text-emerald-400">Performance excellente</div>
                  <div>Tous les indicateurs SLA sont au vert. Continuez ainsi !</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </FluentCardContent>
    </FluentCard>
  );
}
