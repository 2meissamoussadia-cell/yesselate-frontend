'use client';

import { useEffect, useMemo, useState } from 'react';
import { FluentCard } from '@/components/ui/fluent-card';
import { FluentButton as Button } from '@/components/ui/fluent-button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { calculateRiskScore } from '@/domain/demandes/service';

type Stakeholder = {
  id: string;
  personId: string;
  personName: string;
  role: 'OWNER' | 'APPROVER' | 'REVIEWER' | 'CONTRIBUTOR' | 'INFORMED';
  required: number; // SQLite: 0 = false, 1 = true
  note?: string | null;
};

type Task = {
  id: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  dueAt?: string | null;
};

type Risk = {
  id: string;
  category: string;
  opportunity: number; // SQLite: 0 = false, 1 = true
  probability: number;
  impact: number;
  mitigation?: string | null;
  ownerName?: string | null;
};

// score est maintenant importé depuis domain/demandes/service (calculateRiskScore)

export function Demand360Panel({ demandId }: { demandId: string }) {
  const [tab, setTab] = useState<'stakeholders' | 'tasks' | 'risks'>('stakeholders');

  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(false);

  // quick add forms (simples, réels)
  const [pId, setPId] = useState('EMP-001');
  const [pName, setPName] = useState('Agent 1');
  const [pRole, setPRole] = useState<Stakeholder['role']>('APPROVER');

  const [taskTitle, setTaskTitle] = useState('');

  const [riskCat, setRiskCat] = useState('Juridique');
  const [riskP, setRiskP] = useState(3);
  const [riskI, setRiskI] = useState(3);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t, r] = await Promise.all([
        fetch(`/api/demands/${encodeURIComponent(demandId)}/stakeholders`, { cache: 'no-store' }).then((res) => res.json()),
        fetch(`/api/demands/${encodeURIComponent(demandId)}/tasks`, { cache: 'no-store' }).then((res) => res.json()),
        fetch(`/api/demands/${encodeURIComponent(demandId)}/risks`, { cache: 'no-store' }).then((res) => res.json()),
      ]);
      setStakeholders(s.rows ?? []);
      setTasks(t.rows ?? []);
      setRisks(r.rows ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demandId]);

  const riskSummary = useMemo(() => {
    const worst = [...risks]
      .filter((r) => !r.opportunity)
      .sort((a, b) => calculateRiskScore(b.probability, b.impact) - calculateRiskScore(a.probability, a.impact))[0];
    return worst ? `${worst.category} (score ${calculateRiskScore(worst.probability, worst.impact)})` : '—';
  }, [risks]);

  return (
    <FluentCard className="p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">Dossier 360 — Pilotage</div>
        <div className="text-xs text-[rgb(var(--muted))]">
          Risque principal : <span className="font-semibold text-[rgb(var(--text))]">{riskSummary}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={tab === 'stakeholders' ? 'primary' : 'secondary'} onClick={() => setTab('stakeholders')}>
          Parties prenantes ({stakeholders.length})
        </Button>
        <Button size="sm" variant={tab === 'tasks' ? 'primary' : 'secondary'} onClick={() => setTab('tasks')}>
          Tâches ({tasks.length})
        </Button>
        <Button size="sm" variant={tab === 'risks' ? 'primary' : 'secondary'} onClick={() => setTab('risks')}>
          Risques/Opportunités ({risks.length})
        </Button>

        <Button size="sm" variant="secondary" onClick={() => load()} disabled={loading}>
          Rafraîchir
        </Button>
      </div>

      {tab === 'stakeholders' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input value={pId} onChange={(e) => setPId(e.target.value)} placeholder="Person ID" />
            <Input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Nom" />
            <Select value={pRole} onValueChange={(v: string) => setPRole(v as Stakeholder['role'])}>
              <SelectTrigger className="rounded-xl border border-[rgb(var(--border)/0.55)] bg-transparent px-3 py-2 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">OWNER</SelectItem>
                <SelectItem value="APPROVER">APPROVER</SelectItem>
                <SelectItem value="REVIEWER">REVIEWER</SelectItem>
                <SelectItem value="CONTRIBUTOR">CONTRIBUTOR</SelectItem>
                <SelectItem value="INFORMED">INFORMED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={async () => {
              await fetch(`/api/demands/${encodeURIComponent(demandId)}/stakeholders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ personId: pId.trim(), personName: pName.trim(), role: pRole, required: pRole === 'APPROVER' }),
              });
              await load();
            }}
            disabled={!pId.trim() || !pName.trim()}
          >
            Ajouter
          </Button>

          <div className="rounded-xl border border-[rgb(var(--border)/0.5)] overflow-hidden">
            {stakeholders.length === 0 ? (
              <div className="p-3 text-sm text-[rgb(var(--muted))]">Aucun acteur.</div>
            ) : (
              stakeholders.map((s) => (
                <div key={s.id} className="px-3 py-2 border-b border-[rgb(var(--border)/0.35)] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{s.personName}</div>
                    <div className="text-xs text-[rgb(var(--muted))]">
                      {s.role}
                      {s.required ? ' • requis' : ''}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await fetch(`/api/demands/${encodeURIComponent(demandId)}/stakeholders/${encodeURIComponent(s.id)}`, { method: 'DELETE' });
                      await load();
                    }}
                  >
                    Retirer
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {tab === 'tasks' ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Nouvelle tâche…" />
            <Button
              size="sm"
              variant="primary"
              onClick={async () => {
                await fetch(`/api/demands/${encodeURIComponent(demandId)}/tasks`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: taskTitle.trim() }),
                });
                setTaskTitle('');
                await load();
              }}
              disabled={!taskTitle.trim()}
            >
              Ajouter
            </Button>
          </div>

          <div className="rounded-xl border border-[rgb(var(--border)/0.5)] overflow-hidden">
            {tasks.length === 0 ? (
              <div className="p-3 text-sm text-[rgb(var(--muted))]">Aucune tâche.</div>
            ) : (
              tasks.map((t) => (
                <div key={t.id} className="px-3 py-2 border-b border-[rgb(var(--border)/0.35)] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{t.title}</div>
                    <div className="text-xs text-[rgb(var(--muted))]">{t.status}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={async () => {
                        await fetch(`/api/demands/${encodeURIComponent(demandId)}/tasks/${encodeURIComponent(t.id)}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: t.status === 'DONE' ? 'OPEN' : 'DONE' }),
                        });
                        await load();
                      }}
                    >
                      {t.status === 'DONE' ? 'Réouvrir' : 'Terminer'}
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        await fetch(`/api/demands/${encodeURIComponent(demandId)}/tasks/${encodeURIComponent(t.id)}`, { method: 'DELETE' });
                        await load();
                      }}
                    >
                      Suppr.
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {tab === 'risks' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input value={riskCat} onChange={(e) => setRiskCat(e.target.value)} placeholder="Catégorie" />
            <Input type="number" value={riskP} onChange={(e) => setRiskP(Number(e.target.value))} placeholder="Probabilité 1..5" />
            <Input type="number" value={riskI} onChange={(e) => setRiskI(Number(e.target.value))} placeholder="Impact 1..5" />
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={async () => {
              await fetch(`/api/demands/${encodeURIComponent(demandId)}/risks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: riskCat.trim(), probability: riskP, impact: riskI }),
              });
              await load();
            }}
            disabled={!riskCat.trim()}
          >
            Ajouter (score {calculateRiskScore(riskP, riskI)})
          </Button>

          <div className="rounded-xl border border-[rgb(var(--border)/0.5)] overflow-hidden">
            {risks.length === 0 ? (
              <div className="p-3 text-sm text-[rgb(var(--muted))]">Aucun risque/opportunité.</div>
            ) : (
              risks.map((r) => (
                <div key={r.id} className="px-3 py-2 border-b border-[rgb(var(--border)/0.35)] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {r.opportunity ? 'Opportunité' : 'Risque'} — {r.category}
                    </div>
                    <div className="text-xs text-[rgb(var(--muted))]">
                      P{r.probability} × I{r.impact} = <span className="font-semibold">{calculateRiskScore(r.probability, r.impact)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </FluentCard>
  );
}

