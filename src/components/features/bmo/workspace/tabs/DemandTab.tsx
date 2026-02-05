'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import type { Demand, DemandStatus, Priority } from '@/lib/types/bmo.types';
import { getDemand, transitionDemand } from '@/lib/api/demandesClient';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { AssignModal } from '@/components/features/bmo/modals/AssignModal';
import { RequestComplementModal } from '@/components/features/bmo/modals/RequestComplementModal';
import { Demand360Panel } from '@/components/features/bmo/workspace/tabs/Demand360Panel';
import { Check, Clock, RefreshCw } from 'lucide-react';
import { getPriorityText } from '@/domain/demandes/service';

type DemandEvent = {
  id: string;
  demandId: string;
  at: string;
  actorId: string;
  actorName: string;
  action: string;
  details?: string | null;
};

type DemandWithEvents = Demand & {
  events?: DemandEvent[];
  assignedToName?: string | null;
  requestedAt?: string | Date;
};

// prioText est maintenant importé depuis domain/demandes/service (getPriorityText)

export function DemandTab({ id }: { id: string }) {
  const { updateTab } = useWorkspaceStore();

  const [demand, setDemand] = useState<DemandWithEvents | null>(null);
  const [events, setEvents] = useState<DemandEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [assignOpen, setAssignOpen] = useState(false);
  const [complementOpen, setComplementOpen] = useState(false);

  const status = (demand?.status ?? 'pending') as DemandStatus;
  const priority = (demand?.priority ?? 'normal') as Priority;

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getDemand(id);
      setDemand(res.demand);
      setEvents((res.demand as DemandWithEvents)?.events ?? []);
      const title = res.demand?.subject ? `${id} — ${res.demand.subject}` : id;
      updateTab(`demand:${id}`, { title });
    } catch (e: unknown) {
      setErr((e as Error)?.message ?? 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const canDecide = status === 'pending';

  const ageDays = useMemo(() => {
    const dt = demand?.requestedAt ? new Date(demand.requestedAt) : null;
    if (!dt) return null;
    return Math.ceil((Date.now() - dt.getTime()) / 86400000);
  }, [demand]);

  const act = async (action: 'validate' | 'reject', details?: string) => {
    setLoading(true);
    setErr(null);
    try {
      await transitionDemand(id, {
        action,
        details,
        actorId: 'USR-001',
        actorName: 'A. DIALLO',
      });
      await refresh();
    } catch (e: unknown) {
      setErr((e as Error)?.message ?? 'Action impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-4">
      {/* Colonne principale */}
      <FluentCard className="overflow-hidden">
        <FluentCardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <FluentCardTitle className="text-sm">
              Demande <span className="font-mono">{id}</span>
            </FluentCardTitle>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => refresh()} disabled={loading}>
                <RefreshCw className="w-4 h-4" />
                Rafraîchir
              </Button>

              <Button size="sm" variant="secondary" onClick={() => setComplementOpen(true)}>
                Complément
              </Button>

              <Button size="sm" variant="secondary" onClick={() => setAssignOpen(true)}>
                Affecter
              </Button>

              <Button size="sm" variant="success" onClick={() => act('validate')} disabled={!canDecide || loading}>
                <Check className="w-4 h-4" />
                Valider
              </Button>

              <Button size="sm" variant="destructive" onClick={() => act('reject')} disabled={!canDecide || loading}>
                Rejeter
              </Button>
            </div>
          </div>

          {err ? <div className="mt-2 text-sm text-rose-300">{err}</div> : null}
        </FluentCardHeader>

        <FluentCardContent className="space-y-4">
          {!demand ? (
            <div className="text-sm text-[rgb(var(--muted))]">{loading ? 'Chargement…' : 'Aucune donnée'}</div>
          ) : (
            <>
              {/* Résumé métier */}
              <div className="rounded-xl border border-[rgb(var(--border)/0.5)] p-4 bg-[rgb(var(--surface)/0.55)]">
                <div className="flex flex-wrap items-center gap-2">
                  <BureauTag bureau={demand.bureau} />
                  <span className="text-xs text-[rgb(var(--muted))]">Type: {demand.type}</span>

                  <span className="ml-auto text-xs text-[rgb(var(--muted))]">
                    {typeof ageDays === 'number' ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> J+{ageDays}
                      </span>
                    ) : null}
                  </span>
                </div>

                <div className="mt-2 text-lg font-semibold">{demand.subject}</div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className={cn('px-2 py-0.5 rounded-full border border-[rgb(var(--border)/0.5)] text-[rgb(var(--muted))]')}>
                    Priorité: {getPriorityText(priority)}
                  </span>
                  <span className={cn('px-2 py-0.5 rounded-full border border-[rgb(var(--border)/0.5)] text-[rgb(var(--muted))]')}>
                    Statut: {status}
                  </span>
                  {demand.amount ? (
                    <span className={cn('px-2 py-0.5 rounded-full border border-[rgb(var(--border)/0.5)] text-[rgb(var(--muted))]')}>
                      Montant: {demand.amount}
                    </span>
                  ) : null}
                  <span className={cn('px-2 py-0.5 rounded-full border border-[rgb(var(--border)/0.5)] text-[rgb(var(--muted))]')}>
                    Assignée: {demand.assignedToName ?? '—'}
                  </span>
                </div>
              </div>

              {/* Panneau 360 : Stakeholders, Tasks, Risks */}
              <Demand360Panel demandId={id} />
            </>
          )}
        </FluentCardContent>

        <AssignModal
          open={assignOpen}
          onOpenChange={setAssignOpen}
          onAssign={async ({ employeeId, employeeName }) => {
            setLoading(true);
            setErr(null);
            try {
              await transitionDemand(id, {
                action: 'assign',
                employeeId,
                employeeName,
                actorId: 'USR-001',
                actorName: 'A. DIALLO',
              });
              await refresh();
            } catch (e: unknown) {
              setErr((e as Error)?.message ?? 'Affectation impossible');
            } finally {
              setLoading(false);
              setAssignOpen(false);
            }
          }}
        />

        <RequestComplementModal
          open={complementOpen}
          onOpenChange={setComplementOpen}
          demandId={id}
          onSend={async (message) => {
            setLoading(true);
            setErr(null);
            try {
              await transitionDemand(id, {
                action: 'request_complement',
                message,
                actorId: 'USR-001',
                actorName: 'A. DIALLO',
              });
              await refresh();
            } catch (e: unknown) {
              setErr((e as Error)?.message ?? 'Envoi impossible');
            } finally {
              setLoading(false);
              setComplementOpen(false);
            }
          }}
        />
      </FluentCard>

      {/* Colonne audit (persistée DB) */}
      <FluentCard className="overflow-hidden">
        <FluentCardHeader className="pb-2">
          <FluentCardTitle className="text-sm">Journal d&apos;audit</FluentCardTitle>
        </FluentCardHeader>
        <FluentCardContent className="p-0">
          <div className="max-h-[calc(100vh-220px)] overflow-auto">
            {events.length === 0 ? (
              <div className="p-4 text-sm text-[rgb(var(--muted))]">Aucun événement.</div>
            ) : (
              events.map((e) => (
                <div
                  key={e.id}
                  className="px-4 py-3 border-b border-[rgb(var(--border)/0.35)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{e.action}</div>
                    <div className="text-xs text-[rgb(var(--muted))]">
                      {new Date(e.at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-[rgb(var(--muted))] mt-1">
                    {e.actorName} ({e.actorId})
                  </div>
                  {e.details ? (
                    <div className="text-sm mt-2 whitespace-pre-wrap">{e.details}</div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </FluentCardContent>
      </FluentCard>
    </div>
  );
}
