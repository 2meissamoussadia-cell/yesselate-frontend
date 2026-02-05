'use client';
import { useState, useEffect } from 'react';
import { Terminal, AlertCircle, AlertTriangle, Info, Bug, Server, Globe, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logsApiService, type LogsStats } from '@/lib/services/logsApiService';
import { logger } from '@/lib/utils/logger';
interface Props { onOpenQueue: (queue: string, title: string, icon: string) => void; }
export function LogsLiveCounters({ onOpenQueue }: Props) {
  const [stats, setStats] = useState<LogsStats | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { const load = async () => { try { setStats(await logsApiService.getStats()); } catch (e) { logger.error('Logs stats failed', e as Error, { context: 'LogsLiveCounters' }); } finally { setLoading(false); } }; load(); const i = setInterval(load, 10000); return () => clearInterval(i); }, []);
  if (loading || !stats) return <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 animate-pulse">{[...Array(8)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800" />)}</div>;
  const counters = [
    { key: 'total', label: 'Total', value: stats.total, icon: Terminal, color: 'slate', action: () => onOpenQueue('all', 'Tous', '📋') },
    { key: 'errors', label: 'Erreurs', value: stats.byLevel.error || 0, icon: AlertCircle, color: (stats.byLevel.error || 0) > 0 ? 'red' : 'slate', action: () => onOpenQueue('error', 'Erreurs', '❌') },
    { key: 'warnings', label: 'Warnings', value: stats.byLevel.warn || 0, icon: AlertTriangle, color: (stats.byLevel.warn || 0) > 0 ? 'amber' : 'slate', action: () => onOpenQueue('warn', 'Warnings', '⚠️') },
    { key: 'info', label: 'Info', value: stats.byLevel.info || 0, icon: Info, color: 'blue', action: () => onOpenQueue('info', 'Info', 'ℹ️') },
    { key: 'debug', label: 'Debug', value: stats.byLevel.debug || 0, icon: Bug, color: 'slate', action: () => onOpenQueue('debug', 'Debug', '🐛') },
    { key: 'system', label: 'Système', value: stats.bySource.system || 0, icon: Server, color: 'indigo', action: () => onOpenQueue('system', 'Système', '🖥️') },
    { key: 'api', label: 'API', value: stats.bySource.api || 0, icon: Globe, color: 'emerald', action: () => onOpenQueue('api', 'API', '🌐') },
    { key: 'lastHour', label: 'Dernière heure', value: stats.lastHour, icon: Clock, color: 'slate', action: () => {} },
  ];
  return (<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">{counters.map((c) => { const Icon = c.icon; return (<button key={c.key} onClick={c.action} className={cn("p-4 rounded-xl border text-left transition-all hover:shadow-md", `bg-${c.color}-500/10 border-${c.color}-500/30`)}><div className="flex items-center gap-2 mb-2"><Icon className={cn("w-4 h-4", c.color === 'red' ? 'text-red-500' : c.color === 'amber' ? 'text-amber-500' : c.color === 'blue' ? 'text-blue-500' : c.color === 'indigo' ? 'text-indigo-500' : c.color === 'emerald' ? 'text-emerald-500' : 'text-slate-400')} /><span className="text-xs text-slate-400 font-medium truncate">{c.label}</span></div><p className="text-xl font-bold text-slate-900 dark:text-slate-100">{c.value}</p></button>); })}</div>);
}

