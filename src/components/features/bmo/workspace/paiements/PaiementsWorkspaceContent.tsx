'use client';

import { usePaiementsWorkspaceStore } from '@/lib/stores/paiementsWorkspaceStore';
import { PaiementsInboxView } from './views/PaiementsInboxView';
import { PaiementsDetailView } from './views/PaiementsDetailView';
import { FileText, Calendar, DollarSign, Building2, Shield, BarChart3 } from 'lucide-react';

export function PaiementsWorkspaceContent() {
  const { tabs, activeTabId } = usePaiementsWorkspaceStore();
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
    case 'inbox': return <PaiementsInboxView tabId={activeTab.id} data={activeTab.data} />;
    case 'paiement': return <PaiementsDetailView tabId={activeTab.id} data={activeTab.data} />;
    case 'echeancier': return <PlaceholderView icon={<Calendar className="w-12 h-12" />} title="Échéancier" description="Vue calendrier des paiements" />;
    case 'tresorerie': return <PlaceholderView icon={<DollarSign className="w-12 h-12" />} title="Trésorerie" description="État de la trésorerie" />;
    case 'fournisseurs': return <PlaceholderView icon={<Building2 className="w-12 h-12" />} title="Par fournisseur" description="Paiements groupés par fournisseur" />;
    case 'audit': return <PlaceholderView icon={<Shield className="w-12 h-12" />} title="Audit" description="Registre des décisions" />;
    case 'analytics': return <PlaceholderView icon={<BarChart3 className="w-12 h-12" />} title="Analytics" description="Statistiques" />;
    default: return <div className="flex items-center justify-center h-64 text-slate-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Type non supporté</p></div>;
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

