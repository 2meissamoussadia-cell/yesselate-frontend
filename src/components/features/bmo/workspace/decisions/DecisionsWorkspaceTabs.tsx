'use client';
import { useDecisionsWorkspaceStore } from '@/lib/stores/decisionsWorkspaceStore';
import { X, Gavel, FileText, Target, Settings, History, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/cn';
const tabIcons: Record<string, React.ReactNode> = { inbox: <Gavel className="w-4 h-4" />, detail: <FileText className="w-4 h-4" />, strategique: <Target className="w-4 h-4" />, operationnel: <Settings className="w-4 h-4" />, historique: <History className="w-4 h-4" />, analytics: <BarChart3 className="w-4 h-4" /> };
export function DecisionsWorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useDecisionsWorkspaceStore();
  return (<div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">{tabs.map((tab) => { const isActive = tab.id === activeTabId; const Icon = tabIcons[tab.type] || <Gavel className="w-4 h-4" />; return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-w-max", isActive ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50")}><span className={cn("flex-shrink-0", isActive ? "text-rose-500" : "text-slate-400")}>{Icon}</span><span className="truncate max-w-[150px]">{tab.title}</span>{tab.closable !== false && <button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} className={cn("p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100")}><X className="w-3 h-3" /></button>}</button>); })}</div>);
}

