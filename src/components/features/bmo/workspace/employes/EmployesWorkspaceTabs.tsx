'use client';
import { useEmployesWorkspaceStore } from '@/lib/stores/employesWorkspaceStore';
import { X, Users, FileText, Shield, Calendar, Star, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/cn';
const tabIcons: Record<string, React.ReactNode> = { inbox: <Users className="w-4 h-4" />, detail: <FileText className="w-4 h-4" />, spof: <Shield className="w-4 h-4" />, absences: <Calendar className="w-4 h-4" />, evaluations: <Star className="w-4 h-4" />, analytics: <BarChart3 className="w-4 h-4" /> };
export function EmployesWorkspaceTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEmployesWorkspaceStore();
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
      {tabs.map((tab) => { const isActive = tab.id === activeTabId; const Icon = tabIcons[tab.type] || <Users className="w-4 h-4" />;
        return (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn("group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-w-max", isActive ? "bg-teal-500/10 text-teal-600 dark:text-teal-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50")}>
          <span className={cn("flex-shrink-0", isActive ? "text-teal-500" : "text-slate-400")}>{Icon}</span><span className="truncate max-w-[150px]">{tab.title}</span>
          {tab.closable !== false && <button onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }} className={cn("p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100")}><X className="w-3 h-3" /></button>}
        </button>);
      })}
    </div>
  );
}

