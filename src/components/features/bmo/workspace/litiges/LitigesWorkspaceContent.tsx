'use client';

import { useLitigesWorkspaceStore } from '@/lib/stores/litigesWorkspaceStore';
import { LitigesInboxView } from './views/LitigesInboxView';
import { LitigesDetailView } from './views/LitigesDetailView';
import { FileText, Calendar, AlertTriangle, MessageSquare, Shield } from 'lucide-react';

export function LitigesWorkspaceContent() {
  const { tabs, activeTabId } = useLitigesWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  if (!activeTab) return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Aucun onglet</p></div></div>;

  switch (activeTab.type) {
    case 'inbox': return <LitigesInboxView tabId={activeTab.id} data={activeTab.data} />;
    case 'litige': return <LitigesDetailView tabId={activeTab.id} data={activeTab.data} />;
    case 'calendrier': return <PlaceholderView icon={<Calendar className="w-12 h-12" />} title="Calendrier audiences" />;
    case 'risques': return <PlaceholderView icon={<AlertTriangle className="w-12 h-12" />} title="Analyse des risques" />;
    case 'negociation': return <PlaceholderView icon={<MessageSquare className="w-12 h-12" />} title="Suivi négociations" />;
    case 'audit': return <PlaceholderView icon={<Shield className="w-12 h-12" />} title="Historique décisions" />;
    default: return <div className="text-center py-12 text-slate-400">Vue non supportée</div>;
  }
}

function PlaceholderView({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><div className="mx-auto mb-4 opacity-30">{icon}</div><p className="font-semibold">{title}</p><p className="text-xs mt-4 text-slate-400">En cours de développement</p></div></div>;
}

