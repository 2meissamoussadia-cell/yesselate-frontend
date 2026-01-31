'use client';

import { useProjetsWorkspaceStore } from '@/lib/stores/projetsWorkspaceStore';
import { ProjetsInboxView } from './views/ProjetsInboxView';
import { ProjetsDetailView } from './views/ProjetsDetailView';
import { FileText, Kanban, Calendar, DollarSign, Users, AlertTriangle, Shield } from 'lucide-react';

export function ProjetsWorkspaceContent() {
  const { tabs, activeTabId } = useProjetsWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun onglet sélectionné</p>
          <p className="text-sm mt-1">Utilisez ⌘K pour ouvrir une vue</p>
        </div>
      </div>
    );
  }

  switch (activeTab.type) {
    case 'inbox': return <ProjetsInboxView tabId={activeTab.id} data={activeTab.data} />;
    case 'projet': return <ProjetsDetailView tabId={activeTab.id} data={activeTab.data} />;
    case 'kanban': return <PlaceholderView icon={<Kanban className="w-12 h-12" />} title="Vue Kanban" description="Tableau de bord visuel des projets" />;
    case 'gantt': return <PlaceholderView icon={<Calendar className="w-12 h-12" />} title="Vue Gantt" description="Planning temporel des projets" />;
    case 'budget': return <PlaceholderView icon={<DollarSign className="w-12 h-12" />} title="Vue Budget" description="Suivi financier consolidé" />;
    case 'equipe': return <PlaceholderView icon={<Users className="w-12 h-12" />} title="Vue Équipe" description="Gestion des ressources humaines" />;
    case 'risques': return <PlaceholderView icon={<AlertTriangle className="w-12 h-12" />} title="Vue Risques" description="Analyse et gestion des risques" />;
    case 'audit': return <PlaceholderView icon={<Shield className="w-12 h-12" />} title="Audit" description="Historique des modifications" />;
    default: return <div className="text-center py-12 text-slate-400">Type de vue non supporté</div>;
  }
}

function PlaceholderView({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      <div className="text-center">
        <div className="mx-auto mb-4 opacity-30">{icon}</div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm mt-1">{description}</p>
        <p className="text-xs mt-4 text-slate-400">En cours de développement</p>
      </div>
    </div>
  );
}

