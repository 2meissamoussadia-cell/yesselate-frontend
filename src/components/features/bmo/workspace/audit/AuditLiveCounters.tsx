'use client';
import { useState, useEffect } from 'react';
import { Shield, AlertCircle, Eye, CheckCircle, ArrowUp, Zap, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { auditApiService, type AuditStats } from '@/lib/services/auditApiService';
interface Props { onOpenQueue: (queue: string, title: string, icon: string) => void; }
export function AuditLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<AuditStats | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { const load = async () => { try { setStats(await auditApiService.getStats()); } catch (e) { console.error(e); } finally { setLoading(false); } }; load(); const i = setInterval(load, 30000); return () => clearInterval(i); }, []);
  if (loading || !stats) return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
  const counters = [
    { key: 'total', label: 'Total', value: stats.total, icon: Shield, color: 'cyan', action: () => onOpenQueue('all', 'Tous', '🔍') },
    { key: 'critical', label: 'Critiques', value: stats.criticalNew, icon: Zap, color: stats.criticalNew > 0 ? 'red' : 'slate', action: () => onOpenQueue('critical', 'Critiques', '⚡') },
    { key: 'new', label: 'Nouveaux', value: stats.new, icon: AlertCircle, color: stats.new > 0 ? 'amber' : 'slate', action: () => onOpenQueue('new', 'Nouveaux', '🆕') },
    { key: 'reviewed', label: 'Examinés', value: stats.reviewed, icon: Eye, color: 'blue', action: () => onOpenQueue('reviewed', 'Examinés', '👁️') },
    { key: 'resolved', label: 'Résolus', value: stats.resolved, icon: CheckCircle, color: 'emerald', action: () => onOpenQueue('resolved', 'Résolus', '✅') },
    { key: 'escalated', label: 'Escaladés', value: stats.escalated, icon: ArrowUp, color: stats.escalated > 0 ? 'red' : 'slate', action: () => onOpenQueue('escalated', 'Escaladés', '🔺') },
    { key: 'security', label: 'Sécurité', value: stats.byType.security || 0, icon: Lock, color: 'red', action: () => onOpenQueue('security', 'Sécurité', '🔒') },
    { key: '24h', label: 'Dernières 24h', value: stats.last24h, icon: Clock, color: 'slate', action: () => {} },
  ];
  return (<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">{counters.map((c) => { const Icon = c.icon; return (<button key={c.key} onClick={c.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", `bg-${c.color}-500/10 border-${c.color}-500/30`)}><div className="flex items-center gap-2 mb-2"><Icon className={cn("w-4 h-4", c.color === 'cyan' ? 'text-cyan-500' : c.color === 'red' ? 'text-red-500' : c.color === 'amber' ? 'text-amber-500' : c.color === 'emerald' ? 'text-emerald-500' : c.color === 'blue' ? 'text-blue-500' : 'text-slate-400')} /><span className="text-xs text-slate-400 font-medium truncate">{c.label}</span></div><p className="text-xl font-bold text-slate-900 dark:text-slate-100">{c.value}</p></button>); })}</div>);
}

