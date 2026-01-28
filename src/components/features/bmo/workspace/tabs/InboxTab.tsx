'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Demand, DemandStatus, Priority } from '@/lib/types/bmo.types';
import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { listDemands, batchTransition, type Queue } from '@/lib/api/demandesClient';
import { FluentCard, FluentCardContent, FluentCardHeader, FluentCardTitle } from '@/components/ui/fluent-card';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { Input } from '@/components/ui/input';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { AssignModal } from '@/components/features/bmo/modals/AssignModal';
import { RequestComplementModal } from '@/components/features/bmo/modals/RequestComplementModal';
import { Check, Clock, RefreshCw, Search, SquareArrowOutUpRight, X } from 'lucide-react';

const labelQueue = (q: Queue) => {
  switch (q) {
    case 'pending': return 'File — À traiter';
    case 'urgent': return 'File — Urgences';
    case 'overdue': return 'File — Retards SLA';
    case 'validated': return 'Historique — Validées';
    case 'rejected': return 'Historique — Rejetées';
    case 'all': return 'Toutes les demandes';
  }
};

const badgePriority = (p: Priority) => {
  if (p === 'urgent') return { text: 'Urgent', cls: 'bg-red-500/12 text-red-300 border-red-500/25' };
  if (p === 'high') return { text: 'Élevée', cls: 'bg-amber-500/12 text-amber-300 border-amber-500/25' };
  if (p === 'normal') return { text: 'Normale', cls: 'bg-slate-500/10 text-slate-300 border-slate-500/20' };
  return { text: 'Basse', cls: 'bg-slate-500/10 text-slate-300 border-slate-500/20' };
};

const badgeStatus = (s: DemandStatus) => {
  if (s === 'validated') return { text: 'Validée', cls: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25' };
  if (s === 'rejected') return { text: 'Rejetée', cls: 'bg-rose-500/12 text-rose-300 border-rose-500/25' };
  return { text: 'À traiter', cls: 'bg-amber-500/12 text-amber-300 border-amber-500/25' };
};

export function InboxTab({ queue }: { queue: Queue }) {
  const { openTab } = useWorkspaceStore();

  const [rows, setRows] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // "outil" unique : recherche optionnelle (pas une pluie de filtres)
  const [showSearch, setShowSearch] = useState(false);
  const [q, setQ] = useState('');

  // sélection multiple
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // modales "métier"
  const [assignOpen, setAssignOpen] = useState(false);
  const [complementOpen, setComplementOpen] = useState(false);

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected]
  );

  const selectedOne = selectedIds.length === 1 ? selectedIds[0] : null;

  const refresh = async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await listDemands(queue, q);
      setRows(data);
      // purge sélection sur refresh (évite erreurs)
      setSelected((prev) => {
        const next: Record<string, boolean> = {};
        for (const r of data) if (prev[r.id]) next[r.id] = true;
        return next;
      });
    } catch (e: unknown) {
      setErr((e as Error)?.message ?? 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  const openDemand = (id: string, subject?: string) => {
    openTab({
      type: 'demand',
      id: `demand:${id}`,
      title: subject ? `${id} — ${subject}` : id,
      icon: '📄',
      data: { id },
    });
  };

  const doBatch = async (action: 'validate' | 'reject', details?: string) => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await batchTransition(selectedIds, {
        action,
        details,
        actorId: 'USR-001',
        actorName: 'A. DIALLO',
      });

      // refresh derrière : source de vérité = DB
      await refresh();

      // si des éléments ont été ignorés, on affiche une erreur douce
      if (res.skipped.length) {
        setErr(`Certaines demandes ont été ignorées (${res.skipped.length}) : ${res.skipped[0].reason}`);
      }
      setSelected({});
    } catch (e: unknown) {
      setErr((e as Error)?.message ?? 'Action impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FluentCard className="overflow-hidden">
      <FluentCardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FluentCardTitle className="text-sm">
            {labelQueue(queue)}
            <span className="ml-2 text-xs text-[rgb(var(--muted))]">
              {loading ? '…' : rows.length} élément(s)
            </span>
          </FluentCardTitle>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => refresh()} disabled={loading}>
              <RefreshCw className="w-4 h-4" />
              Rafraîchir
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowSearch((v) => !v)}
            >
              <Search className="w-4 h-4" />
              Rechercher
            </Button>
          </div>
        </div>

        {showSearch ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Recherche (code, bureau, type, mot-clé)…"
              className="max-w-md"
            />
            <Button size="sm" variant="primary" onClick={() => refresh()} disabled={loading}>
              Appliquer
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setQ('');
                setShowSearch(false);
                // refresh sans query
                setTimeout(() => refresh(), 0);
              }}
            >
              <X className="w-4 h-4" />
              Fermer
            </Button>
          </div>
        ) : null}
      </FluentCardHeader>

      <FluentCardContent className="space-y-3">
        {/* Barre d'actions métier (centrée, pas éparpillée) */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[rgb(var(--border)/0.5)] bg-[rgb(var(--surface)/0.6)] p-2">
          <div className="text-xs text-[rgb(var(--muted))]">
            Sélection : <span className="font-semibold text-[rgb(var(--text))]">{selectedIds.length}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => selectedOne && openDemand(selectedOne, rows.find(r => r.id === selectedOne)?.subject)}
              disabled={!selectedOne}
            >
              <SquareArrowOutUpRight className="w-4 h-4" />
              Ouvrir
            </Button>

            <Button
              size="sm"
              variant="success"
              onClick={() => doBatch('validate')}
              disabled={selectedIds.length === 0 || queue === 'validated' || queue === 'rejected'}
            >
              <Check className="w-4 h-4" />
              Valider
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => doBatch('reject')}
              disabled={selectedIds.length === 0 || queue === 'validated' || queue === 'rejected'}
            >
              Rejeter
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setAssignOpen(true)}
              disabled={selectedIds.length === 0}
              title="Affectation (batch possible)"
            >
              Affecter
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setComplementOpen(true)}
              disabled={!selectedOne}
              title="Complément (sur 1 demande)"
            >
              Complément
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelected({})}
              disabled={selectedIds.length === 0}
            >
              Effacer sélection
            </Button>
          </div>
        </div>

        {err ? (
          <div className="text-sm text-rose-300">{err}</div>
        ) : null}

        {/* Liste (scroll simple et propre) */}
        <div className="max-h-[calc(100vh-320px)] overflow-auto rounded-xl border border-[rgb(var(--border)/0.5)]">
          <div className="sticky top-0 z-10 grid grid-cols-[44px_1fr_180px] gap-2 px-3 py-2 text-xs text-[rgb(var(--muted))] bg-[rgb(var(--surface)/0.85)] backdrop-blur-md border-b border-[rgb(var(--border)/0.5)]">
            <div>
              <input
                type="checkbox"
                checked={rows.length > 0 && selectedIds.length === rows.length}
                onChange={(e) => {
                  const checked = e.target.checked;
                  const next: Record<string, boolean> = {};
                  if (checked) rows.forEach((r) => (next[r.id] = true));
                  setSelected(next);
                }}
              />
            </div>
            <div>Demande</div>
            <div className="text-right">Statut</div>
          </div>

          {loading ? (
            <div className="p-4 text-sm text-[rgb(var(--muted))]">Chargement…</div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-sm text-[rgb(var(--muted))]">Aucun élément dans cette file.</div>
          ) : (
            rows.map((d) => {
              const pr = badgePriority(d.priority as Priority);
              const st = badgeStatus(d.status as DemandStatus);
              const assignedToName = (d as Demand & { assignedToName?: string }).assignedToName;

              return (
                <div
                  key={d.id}
                  className={cn(
                    'grid grid-cols-[44px_1fr_180px] gap-2 px-3 py-3 border-b border-[rgb(var(--border)/0.35)]',
                    'hover:bg-[rgb(var(--surface)/0.6)] cursor-pointer'
                  )}
                  onClick={() => openDemand(d.id, d.subject)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-start pt-1"
                  >
                    <input
                      type="checkbox"
                      checked={!!selected[d.id]}
                      onChange={(e) => setSelected((prev) => ({ ...prev, [d.id]: e.target.checked }))}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-[rgb(var(--muted))]">{d.id}</span>
                      <BureauTag bureau={d.bureau} />
                      <span className={cn('text-[10px] px-2 py-0.5 rounded-full border', pr.cls)}>{pr.text}</span>
                      {d.amount ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-[rgb(var(--border)/0.5)] text-[rgb(var(--muted))]">
                          {d.amount}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 font-semibold truncate">{d.subject}</div>

                    <div className="mt-1 text-xs text-[rgb(var(--muted))] flex items-center gap-2">
                      <span>{d.type}</span>
                      <span>•</span>
                      <span>{assignedToName ? `Assignée à ${assignedToName}` : 'Non assignée'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={cn('inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border', st.cls)}>
                      {queue === 'overdue' ? <Clock className="w-3 h-3" /> : null}
                      {st.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modales "réelles" */}
        <AssignModal
          open={assignOpen}
          onOpenChange={setAssignOpen}
          onAssign={async ({ employeeId, employeeName }) => {
            if (selectedIds.length === 0) return;
            setLoading(true);
            setErr(null);
            try {
              const res = await batchTransition(selectedIds, {
                action: 'assign',
                employeeId,
                employeeName,
                actorId: 'USR-001',
                actorName: 'A. DIALLO',
              });
              await refresh();
              if (res.skipped.length) setErr(`Certaines affectations ignorées (${res.skipped.length})`);
              setSelected({});
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
          demandId={selectedOne}
          onSend={async (message) => {
            if (!selectedOne) return;
            setLoading(true);
            setErr(null);
            try {
              await batchTransition([selectedOne], {
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
      </FluentCardContent>
    </FluentCard>
  );
}
