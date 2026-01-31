'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle, ArrowUp, Zap, AlertTriangle, Timer, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { echangesApiService, type EchangesStats } from '@/lib/services/echangesApiService';
interface Props { onOpenQueue: (queue: string, title: string, icon: string) => void; }
export function EchangesLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<EchangesStats | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { const load = async () => { try { setStats(await echangesApiService.getStats()); } catch (e) { console.error(e); } finally { setLoading(false); } }; load(); const i = setInterval(load, 30000); return () => clearInterval(i); }, []);
  if (loading || !stats) return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
  const counters = [
    { key: 'total', label: 'Total', value: stats.total, icon: MessageSquare, color: 'violet', action: () => onOpenQueue('all', 'Tous', '📨') },
    { key: 'urgent', label: 'Urgents', value: stats.urgentCount, icon: Zap, color: stats.urgentCount > 0 ? 'red' : 'slate', action: () => onOpenQueue('urgent', 'Urgents', '⚡') },
    { key: 'pending', label: 'En attente', value: stats.pending, icon: Clock, color: stats.pending > 0 ? 'amber' : 'slate', action: () => onOpenQueue('pending', 'En attente', '⏳') },
    { key: 'escalated', label: 'Escaladés', value: stats.escalated, icon: ArrowUp, color: stats.escalated > 0 ? 'red' : 'slate', action: () => onOpenQueue('escalated', 'Escaladés', '🔺') },
    { key: 'resolved', label: 'Résolus', value: stats.resolved, icon: CheckCircle, color: 'emerald', action: () => onOpenQueue('resolved', 'Résolus', '✅') },
    { key: 'high', label: 'Priorité haute', value: stats.byPriority.high || 0, icon: AlertTriangle, color: 'amber', action: () => onOpenQueue('high', 'Priorité haute', '🔶') },
    { key: 'avgTime', label: 'Temps réponse', value: `${stats.avgResponseTime}h`, icon: Timer, color: 'slate', action: () => {} },
    { key: 'bureaux', label: 'Bureaux actifs', value: Object.keys(stats.byBureau).length, icon: Building2, color: 'indigo', action: () => {} },
  ];
  return (<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">{counters.map((c) => { const Icon = c.icon; return (<button key={c.key} onClick={c.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", `bg-${c.color}-500/10 border-${c.color}-500/30`)}><div className="flex items-center gap-2 mb-2"><Icon className={cn("w-4 h-4", c.color === 'violet' ? 'text-violet-500' : c.color === 'red' ? 'text-red-500' : c.color === 'amber' ? 'text-amber-500' : c.color === 'emerald' ? 'text-emerald-500' : c.color === 'indigo' ? 'text-indigo-500' : 'text-slate-400')} /><span className="text-xs text-slate-400 font-medium truncate">{c.label}</span></div><p className="text-xl font-bold text-slate-900 dark:text-slate-100">{c.value}</p></button>); })}</div>);
}

