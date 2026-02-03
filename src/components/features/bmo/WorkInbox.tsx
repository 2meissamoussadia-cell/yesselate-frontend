'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBMOStore } from '@/lib/stores';
import type { ActionLogType } from '@/lib/types/bmo.types';
import type { WorkItem, WorkKind, WorkAction } from '@/lib/types/work-inbox.types';

type FilterChip = 'all' | 'blocages' | 'retardsPaiements' | 'paiementsUrgents' | 'contratsASigner';

type PersistState = {
  version: 1;
  snoozed: Record<string, { untilISO: string; reason: string }>;
  assigned: Record<string, { userId: string; userName: string; bureau?: string }>;
  resolved: Record<string, { atISO: string; byUserId: string; hash: string; note?: string }>;
};

const STORAGE_KEY = 'bmo.workinbox.v1';

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

function loadState(): PersistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { version: 1, snoozed: {}, assigned: {}, resolved: {} };
    const parsed = JSON.parse(raw) as PersistState;
    if (parsed.version !== 1) return { version: 1, snoozed: {}, assigned: {}, resolved: {} };
    return parsed;
  } catch {
    return { version: 1, snoozed: {}, assigned: {}, resolved: {} };
  }
}

function saveState(s: PersistState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function kindToChip(kind: WorkKind): FilterChip {
  if (kind === 'contrat') return 'contratsASigner';
  if (kind === 'paiement') return 'paiementsUrgents';
  if (kind === 'blocage') return 'blocages';
  if (kind === 'facture') return 'retardsPaiements';
  return 'all';
}

export function WorkInbox({
  items,
  defaultChip = 'all',
}: {
  items: WorkItem[];
  defaultChip?: FilterChip;
}) {
  const { addToast, addActionLog } = useBMOStore();
  const [q, setQ] = useState('');
  const [chip, setChip] = useState<FilterChip>(defaultChip);
  const [sort, setSort] = useState<'priority' | 'amount' | 'urgency'>('priority');
  const [persist, setPersist] = useState<PersistState | null>(null);
  const [selected, setSelected] = useState<WorkItem | null>(null);
  const [reason, setReason] = useState('');

  // Simule "currentUser" (à brancher sur ton auth plus tard)
  const currentUser = useMemo(() => ({
    id: 'USR-001',
    name: 'A. DIALLO',
    role: 'Directeur Général',
    bureau: 'BMO',
  }), []);

  useEffect(() => {
    const s = loadState();
    setPersist(s);
  }, []);

  const now = Date.now();

  const counts = useMemo(() => {
    const c = { all: items.length, blocages: 0, retardsPaiements: 0, paiementsUrgents: 0, contratsASigner: 0 };
    for (const it of items) {
      const chipType = kindToChip(it.kind);
      if (chipType !== 'all') c[chipType]++;
    }
    return c;
  }, [items]);

  const visibleItems = useMemo(() => {
    const state = persist ?? { version: 1, snoozed: {}, assigned: {}, resolved: {} };

    const filtered = items.filter(it => {
      if (state.resolved[it.uid]) return false;

      const snooze = state.snoozed[it.uid];
      if (snooze) {
        const until = Date.parse(snooze.untilISO);
        if (Number.isFinite(until) && until > now) return false;
      }

      const s = q.trim().toLowerCase();
      if (s) {
        const hay = `${it.id} ${it.title} ${it.project ?? ''} ${it.partner ?? ''} ${it.bureauOwner ?? ''}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }

      if (chip === 'all') return true;
      if (chip === 'blocages') return it.kind === 'blocage';
      if (chip === 'retardsPaiements') return it.kind === 'facture' || it.kind === 'paiement';
      if (chip === 'paiementsUrgents') return it.kind === 'paiement';
      if (chip === 'contratsASigner') return it.kind === 'contrat';
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'priority') return b.priorityScore - a.priorityScore;
      if (sort === 'amount') return (b.amountImpactFCFA ?? 0) - (a.amountImpactFCFA ?? 0);
      if (sort === 'urgency') return (a.daysToDue ?? 9999) - (b.daysToDue ?? 9999);
      return 0;
    });

    return sorted;
  }, [items, persist, q, chip, sort, now]);

  const persistUpdate = (updater: (s: PersistState) => PersistState) => {
    if (!persist) return;
    const next = updater(persist);
    setPersist(next);
    saveState(next);
  };

  const audit = async (action: string, it: WorkItem, detail: string) => {
    const ts = new Date().toISOString();
    const hash = await sha256Hex(`${action}|${it.uid}|${currentUser.id}|${ts}|${detail}`);
    addActionLog?.({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: action as ActionLogType,
      module: 'command-center',
      targetId: it.id,
      targetType: it.kind,
      targetLabel: it.title,
      details: `${detail} | hash=${hash} | ts=${ts}`,
      bureau: it.bureauOwner ?? currentUser.bureau,
    });
    return hash;
  };

  const handleSnooze = async (it: WorkItem, days: 1 | 3 | 7) => {
    if (!reason.trim()) {
      addToast?.('Motif obligatoire pour snooze', 'warning');
      return;
    }
    const until = new Date(Date.now() + days * 86400000).toISOString();
    const hash = await audit('snooze', it, `snooze ${days}j reason="${reason.trim()}"`);
    persistUpdate(s => ({
      ...s,
      snoozed: { ...s.snoozed, [it.uid]: { untilISO: until, reason: reason.trim() } },
    }));
    setSelected(null);
    setReason('');
    addToast?.(`Snoozé ${days}j • hash ${hash.slice(0, 10)}…`, 'success');
  };

  const handleResolve = async (it: WorkItem) => {
    if (!reason.trim()) {
      addToast?.('Motif obligatoire pour clôturer', 'warning');
      return;
    }
    const hash = await audit('resolve', it, `resolved note="${reason.trim()}"`);
    persistUpdate(s => ({
      ...s,
      resolved: { ...s.resolved, [it.uid]: { atISO: new Date().toISOString(), byUserId: currentUser.id, hash, note: reason.trim() } },
    }));
    setSelected(null);
    setReason('');
    addToast?.(`Clôturé • hash ${hash.slice(0, 10)}…`, 'success');
  };

  const openFirstLink = (it: WorkItem, a: WorkAction) => {
    const href = a.href || it.links?.[0]?.href;
    if (!href) return;
    window.open(href, '_blank');
  };

  return (
    <Card className="border-orange-500/20">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm flex items-center gap-2">
            ⚡ Command Center — Inbox
            <Badge variant="info">{visibleItems.length} / {items.length}</Badge>
          </CardTitle>

          <div className="flex items-center gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher (id, chantier, partenaire, bureau...)"
              className="w-64"
            />
            <Select value={sort} onValueChange={(v) => setSort(v as 'priority' | 'amount' | 'urgency')}>
              <SelectTrigger className={cn('h-9 min-w-[120px] rounded-md border px-2 text-xs', 'bg-transparent border-slate-700/40 text-slate-200')}>
                <SelectValue placeholder="Tri" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                <SelectItem value="priority">Tri: Priorité</SelectItem>
                <SelectItem value="amount">Tri: Impact</SelectItem>
                <SelectItem value="urgency">Tri: Urgence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chips vivants */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Chip label={`Tous (${counts.all})`} active={chip === 'all'} onClick={() => setChip('all')} />
          <Chip label={`Blocages (${counts.blocages})`} active={chip === 'blocages'} onClick={() => setChip('blocages')} />
          <Chip label={`Retards paiements (${counts.retardsPaiements})`} active={chip === 'retardsPaiements'} onClick={() => setChip('retardsPaiements')} />
          <Chip label={`Paiements urgents (${counts.paiementsUrgents})`} active={chip === 'paiementsUrgents'} onClick={() => setChip('paiementsUrgents')} />
          <Chip label={`Contrats à signer (${counts.contratsASigner})`} active={chip === 'contratsASigner'} onClick={() => setChip('contratsASigner')} />
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {visibleItems.slice(0, 12).map((it) => (
          <div
            key={it.uid}
            role="button"
            tabIndex={0}
            onClick={() => { setSelected(it); setReason(''); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelected(it);
                setReason('');
              }
            }}
            className={cn(
              'w-full text-left rounded-xl border px-3 py-2.5 cursor-pointer',
              'border-slate-700/40 hover:border-orange-500/40 transition-colors'
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-[240px]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{it.id}</span>
                  <Badge variant={riskVariant(it.risk)}>{it.risk.toUpperCase()}</Badge>
                  {it.bureauOwner && <Badge variant="default">{it.bureauOwner}</Badge>}
                  {typeof it.daysToDue === 'number' && (
                    <Badge variant={it.daysToDue < 0 ? 'urgent' : it.daysToDue <= 7 ? 'warning' : 'default'}>
                      {it.daysToDue < 0 ? `RETARD ${Math.abs(it.daysToDue)}j` : `J-${it.daysToDue}`}
                    </Badge>
                  )}
                </div>
                <div className="font-semibold text-sm mt-1">{it.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {it.project ? <span>📌 {it.project} </span> : null}
                  {it.partner ? <span>• 🤝 {it.partner}</span> : null}
                </div>
              </div>

              <div className="flex items-end gap-3">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Impact</div>
                  <div className="font-mono font-bold text-amber-400">
                    {(it.amountImpactFCFA ?? 0).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Preuves</div>
                  <div className="font-mono font-bold">{it.evidence.length}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Score</div>
                  <div className="font-mono font-bold">{Math.round(it.priorityScore)}</div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mt-2">
              {it.recommendedActions.slice(0, 2).map((a) => (
                <Button
                  key={a.type}
                  size="sm"
                  variant="secondary"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openFirstLink(it, a); }}
                >
                  {a.label}
                </Button>
              ))}
              <Button
                size="sm"
                variant="warning"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelected(it); }}
              >
                Intervenir
              </Button>
            </div>
          </div>
        ))}

        {visibleItems.length > 12 && (
          <div className="text-xs text-slate-400 pt-2">
            Affichage limité à 12 items (Inbox). Utilise la recherche / chips / tri pour cibler.
          </div>
        )}
      </CardContent>

      {/* Decision Drawer (modal simple) */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>🧠 Décision — {selected.title}</span>
                <Button variant="secondary" size="sm" onClick={() => { setSelected(null); setReason(''); }}>
                  Fermer
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-slate-700/40 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={riskVariant(selected.risk)}>{selected.risk.toUpperCase()}</Badge>
                  {selected.bureauOwner && <Badge variant="default">{selected.bureauOwner}</Badge>}
                  {typeof selected.daysToDue === 'number' && (
                    <Badge variant={selected.daysToDue < 0 ? 'urgent' : selected.daysToDue <= 7 ? 'warning' : 'default'}>
                      {selected.daysToDue < 0 ? `RETARD ${Math.abs(selected.daysToDue)}j` : `J-${selected.daysToDue}`}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-2">
                  {selected.project ? <>📌 {selected.project} </> : null}
                  {selected.partner ? <>• 🤝 {selected.partner}</> : null}
                </div>

                <div className="mt-2 font-mono text-amber-400 font-bold">
                  Impact: {(selected.amountImpactFCFA ?? 0).toLocaleString('fr-FR')} FCFA
                </div>
              </div>

              <div className="rounded-xl border border-slate-700/40 p-3">
                <div className="text-xs font-bold text-slate-200 mb-2">Preuves / Signaux</div>
                <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                  {selected.evidence.map((e, idx) => <li key={idx}>{e}</li>)}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-700/40 p-3">
                <div className="text-xs font-bold text-slate-200 mb-2">Motif / Commentaire (obligatoire)</div>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex: validation après contrôle BJ, urgence pénalité, etc." />
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {selected.recommendedActions.map((a) => (
                  <Button
                    key={a.type}
                    variant={buttonVariant(a.type)}
                    onClick={(e) => {
                      e.preventDefault();
                      // actions "lien"
                      if (a.href) openFirstLink(selected, a);
                    }}
                  >
                    {a.label}
                  </Button>
                ))}

                <Button variant="secondary" onClick={() => handleSnooze(selected, 1)}>Snooze 1j</Button>
                <Button variant="secondary" onClick={() => handleSnooze(selected, 3)}>Snooze 3j</Button>
                <Button variant="secondary" onClick={() => handleSnooze(selected, 7)}>Snooze 7j</Button>

                <Button variant="success" onClick={() => handleResolve(selected)}>Clôturer</Button>

                <Button variant="destructive" onClick={() => { setSelected(null); setReason(''); }}>
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1 rounded-full text-xs border transition-colors',
        active
          ? 'border-orange-500/50 text-orange-300 bg-orange-500/10'
          : 'border-slate-700/40 text-slate-300 hover:border-slate-500/60'
      )}
    >
      {label}
    </button>
  );
}

function riskVariant(risk: string): any {
  if (risk === 'critical') return 'urgent';
  if (risk === 'high') return 'warning';
  if (risk === 'medium') return 'info';
  return 'default';
}

function buttonVariant(type: string): any {
  if (type === 'validate' || type === 'sign' || type === 'pay') return 'success';
  if (type === 'send_to_bj') return 'info';
  if (type === 'arbitrage' || type === 'substitute') return 'warning';
  return 'secondary';
}
