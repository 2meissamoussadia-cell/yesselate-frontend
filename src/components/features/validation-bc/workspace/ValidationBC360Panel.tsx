'use client';

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  RefreshCw, Users, ClipboardList, Shield, AlertTriangle,
  TrendingUp, CheckCircle, XCircle, Clock, Target,
  FileText, PlusCircle, Trash2
} from 'lucide-react';

// ============================================
// Types
// ============================================
type Stakeholder = {
  id: string;
  personId: string;
  personName: string;
  role: 'OWNER' | 'APPROVER' | 'REVIEWER' | 'CONTRIBUTOR' | 'INFORMED';
  required: boolean;
  note?: string | null;
};

type Task = {
  id: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  assignee?: string;
  dueAt?: string | null;
};

type Risk = {
  id: string;
  category: string;
  opportunity: boolean;
  probability: number; // 1-5
  impact: number; // 1-5
  mitigation?: string | null;
  ownerName?: string | null;
};

type Props = {
  documentId: string;
  documentType: 'bc' | 'facture' | 'avenant';
};

// ============================================
// Constants
// ============================================
const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Porteur',
  APPROVER: 'Approbateur',
  REVIEWER: 'Réviseur',
  CONTRIBUTOR: 'Contributeur',
  INFORMED: 'Informé',
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  APPROVER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  REVIEWER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  CONTRIBUTOR: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  INFORMED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_CONFIG = {
  OPEN: { label: 'À faire', color: 'bg-slate-100 text-slate-700', icon: Clock },
  IN_PROGRESS: { label: 'En cours', color: 'bg-blue-100 text-blue-700', icon: TrendingUp },
  DONE: { label: 'Terminé', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  BLOCKED: { label: 'Bloqué', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
};

const score = (p: number, i: number) => p * i;

const getRiskColor = (s: number): string => {
  if (s >= 15) return 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800/50';
  if (s >= 9) return 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800/50';
  return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50';
};

// ============================================
// Component
// ============================================
export function ValidationBC360Panel({ documentId, documentType }: Props) {
  const [tab, setTab] = useState<'stakeholders' | 'tasks' | 'risks'>('stakeholders');
  const [loading, setLoading] = useState(false);

  // Data states
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);

  // Form states
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState<Stakeholder['role']>('REVIEWER');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newRiskCat, setNewRiskCat] = useState('');
  const [newRiskP, setNewRiskP] = useState(3);
  const [newRiskI, setNewRiskI] = useState(3);

  const load = async () => {
    setLoading(true);
    try {
      // Simulated API call
      await new Promise(r => setTimeout(r, 300));
      
      setStakeholders([
        { id: '1', personId: 'P001', personName: 'Jean Dupont', role: 'OWNER', required: true },
        { id: '2', personId: 'P002', personName: 'Sarah Martin', role: 'APPROVER', required: true },
        { id: '3', personId: 'P003', personName: 'Thomas Dubois', role: 'REVIEWER', required: false },
      ]);
      
      setTasks([
        { id: 't1', title: 'Vérifier les pièces justificatives', status: 'DONE', assignee: 'Jean D.' },
        { id: 't2', title: 'Valider le montant avec le budget', status: 'IN_PROGRESS', assignee: 'Sarah M.' },
        { id: 't3', title: 'Obtenir signature direction', status: 'OPEN', dueAt: '2026-01-15' },
      ]);
      
      setRisks([
        { id: 'r1', category: 'Budgétaire', opportunity: false, probability: 3, impact: 4, mitigation: 'Vérifier la disponibilité du budget avant validation' },
        { id: 'r2', category: 'Fournisseur', opportunity: false, probability: 2, impact: 3, mitigation: 'Vérifier la notation fournisseur' },
        { id: 'r3', category: 'Délai', opportunity: true, probability: 4, impact: 2, mitigation: 'Livraison anticipée possible' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [documentId]);

  const riskSummary = useMemo(() => {
    const threats = risks.filter(r => !r.opportunity).sort((a, b) => score(b.probability, b.impact) - score(a.probability, a.impact));
    if (threats.length === 0) return null;
    const worst = threats[0];
    return { category: worst.category, score: score(worst.probability, worst.impact) };
  }, [risks]);

  const addStakeholder = () => {
    if (!newPersonName.trim()) return;
    const newS: Stakeholder = {
      id: `s-${Date.now()}`,
      personId: `P-${Date.now()}`,
      personName: newPersonName.trim(),
      role: newPersonRole,
      required: newPersonRole === 'APPROVER',
    };
    setStakeholders(prev => [...prev, newS]);
    setNewPersonName('');
  };

  const removeStakeholder = (id: string) => {
    setStakeholders(prev => prev.filter(s => s.id !== id));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const newT: Task = {
      id: `t-${Date.now()}`,
      title: newTaskTitle.trim(),
      status: 'OPEN',
    };
    setTasks(prev => [...prev, newT]);
    setNewTaskTitle('');
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next: Task['status'] = t.status === 'DONE' ? 'OPEN' : 'DONE';
      return { ...t, status: next };
    }));
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const addRisk = () => {
    if (!newRiskCat.trim()) return;
    const newR: Risk = {
      id: `r-${Date.now()}`,
      category: newRiskCat.trim(),
      opportunity: false,
      probability: newRiskP,
      impact: newRiskI,
    };
    setRisks(prev => [...prev, newR]);
    setNewRiskCat('');
    setNewRiskP(3);
    setNewRiskI(3);
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-500" />
            Dossier 360° — Pilotage
          </h3>
          {riskSummary && (
            <p className="text-xs text-slate-400 mt-1">
              Risque principal : <span className={cn('font-medium', riskSummary.score >= 15 ? 'text-red-500' : riskSummary.score >= 9 ? 'text-amber-500' : 'text-emerald-500')}>
                {riskSummary.category} (score {riskSummary.score})
              </span>
            </p>
          )}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setTab('stakeholders')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            tab === 'stakeholders' 
              ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50/50 dark:bg-purple-950/20' 
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <Users className="w-4 h-4" />
          Parties ({stakeholders.length})
        </button>
        <button
          onClick={() => setTab('tasks')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            tab === 'tasks' 
              ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <ClipboardList className="w-4 h-4" />
          Tâches ({tasks.length})
        </button>
        <button
          onClick={() => setTab('risks')}
          className={cn(
            'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
            tab === 'risks' 
              ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' 
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
          )}
        >
          <Shield className="w-4 h-4" />
          Risques ({risks.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Stakeholders Tab */}
        {tab === 'stakeholders' && (
          <div className="space-y-4">
            {/* Add form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Nom de la personne"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-purple-500/30"
              />
              <select
                value={newPersonRole}
                onChange={(e) => setNewPersonRole(e.target.value as Stakeholder['role'])}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
              >
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <button
                onClick={addStakeholder}
                disabled={!newPersonName.trim()}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {stakeholders.map((s) => (
                <div 
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-bold text-purple-600">
                      {s.personName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.personName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn('text-xs px-2 py-0.5 rounded', ROLE_COLORS[s.role])}>
                          {ROLE_LABELS[s.role]}
                        </span>
                        {s.required && (
                          <span className="text-xs text-slate-400">• Requis</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStakeholder(s.id)}
                    className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {stakeholders.length === 0 && (
                <p className="text-center py-6 text-slate-400 text-sm">Aucune partie prenante</p>
              )}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {tab === 'tasks' && (
          <div className="space-y-4">
            {/* Add form */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Nouvelle tâche..."
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
              />
              <button
                onClick={addTask}
                disabled={!newTaskTitle.trim()}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {tasks.map((t) => {
                const config = STATUS_CONFIG[t.status];
                const StatusIcon = config.icon;
                return (
                  <div 
                    key={t.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-xl border transition-all',
                      t.status === 'DONE' ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-700'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskStatus(t.id)}
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                          t.status === 'DONE' ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 hover:border-blue-400'
                        )}
                      >
                        {t.status === 'DONE' && <CheckCircle className="w-4 h-4" />}
                      </button>
                      <div>
                        <p className={cn('text-sm', t.status === 'DONE' && 'line-through text-slate-400')}>
                          {t.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn('text-xs px-2 py-0.5 rounded flex items-center gap-1', config.color)}>
                            <StatusIcon className="w-3 h-3" />
                            {config.label}
                          </span>
                          {t.assignee && <span className="text-xs text-slate-400">{t.assignee}</span>}
                          {t.dueAt && <span className="text-xs text-slate-400">Échéance: {t.dueAt}</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeTask(t.id)}
                      className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {tasks.length === 0 && (
                <p className="text-center py-6 text-slate-400 text-sm">Aucune tâche</p>
              )}
            </div>
          </div>
        )}

        {/* Risks Tab */}
        {tab === 'risks' && (
          <div className="space-y-4">
            {/* Add form */}
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                value={newRiskCat}
                onChange={(e) => setNewRiskCat(e.target.value)}
                placeholder="Catégorie"
                className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-amber-500/30"
              />
              <input
                type="number"
                min={1}
                max={5}
                value={newRiskP}
                onChange={(e) => setNewRiskP(Number(e.target.value))}
                placeholder="P"
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none text-center"
              />
              <input
                type="number"
                min={1}
                max={5}
                value={newRiskI}
                onChange={(e) => setNewRiskI(Number(e.target.value))}
                placeholder="I"
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none text-center"
              />
            </div>
            <button
              onClick={addRisk}
              disabled={!newRiskCat.trim()}
              className="w-full px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Ajouter risque (score {score(newRiskP, newRiskI)})
            </button>

            {/* List */}
            <div className="space-y-2">
              {risks.map((r) => {
                const s = score(r.probability, r.impact);
                return (
                  <div 
                    key={r.id}
                    className={cn('p-3 rounded-xl border', getRiskColor(s))}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {r.opportunity ? '✨ Opportunité' : '⚠️ Risque'} — {r.category}
                          </span>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded font-mono',
                            s >= 15 ? 'bg-red-500 text-white' : s >= 9 ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                          )}>
                            P{r.probability}×I{r.impact}={s}
                          </span>
                        </div>
                        {r.mitigation && (
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            <strong>Mitigation:</strong> {r.mitigation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {risks.length === 0 && (
                <p className="text-center py-6 text-slate-400 text-sm">Aucun risque identifié</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

