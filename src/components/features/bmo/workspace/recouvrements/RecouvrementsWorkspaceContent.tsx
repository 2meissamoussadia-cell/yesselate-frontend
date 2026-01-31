'use client';

import { useRecouvrementsWorkspaceStore } from '@/lib/stores/recouvrementsWorkspaceStore';
import { RecouvrementsInboxView } from './views/RecouvrementsInboxView';
import { RecouvrementsDetailView } from './views/RecouvrementsDetailView';
import { FileText, Bell, AlertTriangle, BarChart3 } from 'lucide-react';

export function RecouvrementsWorkspaceContent() {
  const { tabs, activeTabId } = useRecouvrementsWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  if (!activeTab) return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Aucun onglet</p></div></div>;

  switch (activeTab.type) {
    case 'inbox': return <RecouvrementsInboxView tabId={activeTab.id} data={activeTab.data} />;
    case 'creance': return <RecouvrementsDetailView tabId={activeTab.id} data={activeTab.data} />;
    case 'relances': return <PlaceholderView icon={<Bell className="w-12 h-12" />} title="Suivi des relances" />;
    case 'contentieux': return <PlaceholderView icon={<AlertTriangle className="w-12 h-12" />} title="Dossiers contentieux" />;
    case 'statistiques': return <PlaceholderView icon={<BarChart3 className="w-12 h-12" />} title="Statistiques" />;
    default: return <div className="text-center py-12 text-slate-400">Vue non supportée</div>;
  }
}

function PlaceholderView({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><div className="mx-auto mb-4 opacity-30">{icon}</div><p className="font-semibold">{title}</p><p className="text-xs mt-4 text-slate-400">En cours de développement</p></div></div>;
}

