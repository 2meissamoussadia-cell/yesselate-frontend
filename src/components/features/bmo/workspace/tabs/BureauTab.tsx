'use client';

import { useMemo, useState } from 'react';
import { WorkspaceTab, useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';

import { demands, bureaux, employees } from '@/lib/data';
import type { Demand } from '@/lib/types/bmo.types';

const calcDelay = (dateStr: string) => {
  const [d, m, y] = (dateStr ?? '').split('/').map(Number);
  if (!d || !m || !y) return 0;
  const t = new Date(y, m - 1, d).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, Math.ceil((Date.now() - t) / 86400000));
};

export function BureauTab({ tab }: { tab: WorkspaceTab }) {
  const { openTab } = useWorkspaceStore();
  const bureauCode = tab.data?.code ?? 'N/A';
  const bureau = bureaux.find((b) => b.code === bureauCode);

  const [view, setView] = useState<'demands' | 'team' | 'stats'>('demands');

  const bureauDemands = useMemo(() => {
    const filtered = (demands as Demand[]).filter((d) => d.bureau === bureauCode);
    return filtered.map((d) => ({
      ...d,
      delay: calcDelay(d.date),
      isOverdue: calcDelay(d.date) > 7 && d.status !== 'validated',
    }));
  }, [bureauCode]);

  const stats = useMemo(() => {
    const all = bureauDemands.length;
    const pending = bureauDemands.filter((d) => (d.status ?? 'pending') === 'pending').length;
    const urgent = bureauDemands.filter((d) => (d.status ?? 'pending') === 'pending' && d.priority === 'urgent').length;
    const overdue = bureauDemands.filter((d) => d.isOverdue).length;
    const validated = bureauDemands.filter((d) => d.status === 'validated').length;
    const avgDelay = bureauDemands.length > 0 
      ? Math.round(bureauDemands.reduce((sum, d) => sum + d.delay, 0) / bureauDemands.length)
      : 0;
    
    return { all, pending, urgent, overdue, validated, avgDelay };
  }, [bureauDemands]);

  const teamMembers = useMemo(() => {
    return employees.filter((e) => e.bureau === bureauCode);
  }, [bureauCode]);

  if (!bureau) {
    return (
      <FluentCard>
        <FluentCardContent className="p-6 text-[rgb(var(--muted))]">
          Bureau introuvable.
        </FluentCardContent>
      </FluentCard>
    );
  }

  return (
    <FluentCard className="min-h-[600px]">
      <FluentCardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <FluentCardTitle className="text-sm flex items-center gap-2">
            <span className="text-2xl">{bureau.icon}</span>
            <span>Bureau {bureau.code}</span>
            <span className="text-[rgb(var(--muted))] font-normal">— {bureau.name}</span>
          </FluentCardTitle>

          <div className="flex items-center gap-2">
            <Button size="xs" variant={view === 'demands' ? 'primary' : 'secondary'} onClick={() => setView('demands')}>
              Demandes
            </Button>
            <Button size="xs" variant={view === 'team' ? 'primary' : 'secondary'} onClick={() => setView('team')}>
              Équipe
            </Button>
            <Button size="xs" variant={view === 'stats' ? 'primary' : 'secondary'} onClick={() => setView('stats')}>
              Stats
            </Button>
          </div>
        </div>
      </FluentCardHeader>

      <FluentCardContent className="space-y-3">
        {/* KPIs rapides */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pb-3 border-b border-[rgb(var(--border)/0.5)]">
          <div className="text-center">
            <div className="text-xs text-[rgb(var(--muted))]">Total</div>
            <div className="text-lg font-bold">{stats.all}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[rgb(var(--muted))]">À traiter</div>
            <div className="text-lg font-bold text-amber-400">{stats.pending}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[rgb(var(--muted))]">Urgentes</div>
            <div className="text-lg font-bold text-red-400">{stats.urgent}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[rgb(var(--muted))]">Retard</div>
            <div className="text-lg font-bold text-orange-400">{stats.overdue}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[rgb(var(--muted))]">Validées</div>
            <div className="text-lg font-bold text-emerald-400">{stats.validated}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-[rgb(var(--muted))]">Délai moy.</div>
            <div className="text-lg font-bold">{stats.avgDelay}j</div>
          </div>
        </div>

        {/* Contenu selon la vue */}
        {view === 'demands' && (
          <div className="space-y-2">
            {bureauDemands.slice(0, 10).map((d) => (
              <button
                key={d.id}
                className="w-full text-left rounded-lg border border-[rgb(var(--border)/0.5)] px-3 py-2 transition-colors hover:bg-[rgb(var(--surface-2)/0.5)]"
                onClick={() =>
                  openTab({
                    type: 'demand',
                    id: `demand:${d.id}`,
                    title: d.id,
                    icon: '📄',
                    data: d,
                  })
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{d.subject}</div>
                    <div className="text-xs text-[rgb(var(--muted))] mt-1">
                      {d.type} • {d.date} • J+{d.delay}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={d.priority === 'urgent' ? 'urgent' : 'default'} className="text-[10px]">
                      {d.priority}
                    </Badge>
                    {d.isOverdue && <Badge variant="urgent" className="text-[10px]">Retard</Badge>}
                  </div>
                </div>
              </button>
            ))}
            {bureauDemands.length === 0 && (
              <div className="py-10 text-center text-[rgb(var(--muted))] text-sm">
                Aucune demande pour ce bureau.
              </div>
            )}
            {bureauDemands.length > 10 && (
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={() =>
                  openTab({
                    type: 'inbox',
                    id: `inbox:bureau:${bureauCode}`,
                    title: `${bureau.code} - Toutes demandes`,
                    icon: bureau.icon,
                    data: { queue: 'all', bureau: bureauCode },
                  })
                }
              >
                Voir toutes les demandes ({bureauDemands.length})
              </Button>
            )}
          </div>
        )}

        {view === 'team' && (
          <div className="space-y-2">
            <div className="text-sm text-[rgb(var(--muted))] mb-3">
              Équipe du bureau ({teamMembers.length} membre{teamMembers.length > 1 ? `s` : ``})
            </div>
            {teamMembers.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-[rgb(var(--border)/0.5)]"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                  {e.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{e.name}</div>
                  <div className="text-xs text-[rgb(var(--muted))]">{e.role}</div>
                </div>
                <Badge variant="default">{e.id}</Badge>
              </div>
            ))}
            {teamMembers.length === 0 && (
              <div className="py-10 text-center text-[rgb(var(--muted))] text-sm">
                Aucun membre d&apos;équipe trouvé.
              </div>
            )}
          </div>
        )}

        {view === 'stats' && (
          <div className="space-y-4">
            <div className="text-sm text-[rgb(var(--muted))]">Statistiques détaillées</div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)]">
                <div className="text-xs text-[rgb(var(--muted))] mb-2">Taux de traitement</div>
                <div className="text-2xl font-bold">
                  {stats.all > 0 ? Math.round((stats.validated / stats.all) * 100) : 0}%
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)]">
                <div className="text-xs text-[rgb(var(--muted))] mb-2">Charge en cours</div>
                <div className="text-2xl font-bold text-amber-400">{stats.pending}</div>
              </div>
              
              <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)]">
                <div className="text-xs text-[rgb(var(--muted))] mb-2">Taux d&apos;urgence</div>
                <div className="text-2xl font-bold text-red-400">
                  {stats.pending > 0 ? Math.round((stats.urgent / stats.pending) * 100) : 0}%
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-[rgb(var(--border)/0.5)]">
                <div className="text-xs text-[rgb(var(--muted))] mb-2">Performance SLA</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {stats.all > 0 ? Math.round(((stats.all - stats.overdue) / stats.all) * 100) : 0}%
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[rgb(var(--border)/0.5)]">
              <Button
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={() =>
                  openTab({
                    type: 'report',
                    id: `report_sla:${bureauCode}`,
                    title: `Rapport SLA - ${bureau.code}`,
                    icon: '📈',
                    data: { bureau: bureauCode, reportKind: 'sla' },
                  })
                }
              >
                Rapport SLA détaillé
              </Button>
            </div>
          </div>
        )}
      </FluentCardContent>
    </FluentCard>
  );
}
