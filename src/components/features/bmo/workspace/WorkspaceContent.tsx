'use client';

import { useWorkspaceStore } from '@/lib/stores/workspaceStore';
import { InboxView } from './views/InboxView';
import { DemandView } from './views/DemandView';
import { Inbox, FileText, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const QUICK_ACTIONS = [
  { id: 'pending', label: 'À traiter', icon: Inbox, color: 'text-amber-500', queue: 'pending' },
  { id: 'urgent', label: 'Urgences', icon: AlertTriangle, color: 'text-rose-500', queue: 'urgent' },
  { id: 'overdue', label: 'En retard', icon: Clock, color: 'text-orange-500', queue: 'overdue' },
  { id: 'validated', label: 'Validées', icon: CheckCircle2, color: 'text-emerald-500', queue: 'validated' },
];

export function WorkspaceContent() {
  const { tabs, activeTabId, openTab } = useWorkspaceStore();
  const tab = tabs.find(t => t.id === activeTabId);

  if (!tab) {
    return (
      <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">Bienvenue dans la console métier</h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Sélectionnez une file de demandes ci-dessus ou utilisez les raccourcis rapides ci-dessous pour commencer.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => openTab({
                    type: 'inbox',
                    id: `inbox:${action.queue}`,
                    title: action.label,
                    icon: action.id === 'urgent' ? '🔥' : action.id === 'overdue' ? '⏱️' : action.id === 'validated' ? '✅' : '📥',
                    data: { queue: action.queue },
                  })}
                  className="p-4 rounded-xl border border-slate-200/70 bg-white/50 
                             hover:bg-slate-50 hover:border-slate-300 transition-all
                             dark:border-slate-800 dark:bg-slate-800/30 dark:hover:bg-slate-800/60
                             group"
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${action.color} group-hover:scale-110 transition-transform`} />
                  <div className="text-sm font-medium">{action.label}</div>
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-800">
            <p className="text-xs text-slate-400">
              💡 Astuce : Utilisez les boutons de la barre d&apos;outils pour accéder rapidement aux différentes files.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (tab.type === 'inbox') return <InboxView tab={tab} />;
  if (tab.type === 'demand') return <DemandView tab={tab} />;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 dark:border-slate-800 dark:bg-[#1f1f1f]/70">
      <div className="text-center text-slate-400">
        Vue non supportée : {tab.type}
      </div>
    </div>
  );
}
