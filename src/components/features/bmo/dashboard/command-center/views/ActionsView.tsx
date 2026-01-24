/**
 * Vue Actions du Dashboard
 * Work Inbox - Actions prioritaires à traiter
 */

'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  FileCheck,
  Wallet,
  FileText,
  Scale,
  MoreHorizontal,
  ChevronDown,
  Zap,
  Inbox,
  User,
  Users,
  Archive,
  TrendingUp,
  Calendar,
  Download,
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';
import { SectionTitle, ActionItem } from '@/components/features/bmo/dashboard/components';
import type { ActionItemData } from '@/components/features/bmo/dashboard/components';

// Types
interface ActionItem {
  id: string;
  type: 'bc' | 'paiement' | 'contrat' | 'arbitrage' | 'autre';
  title: string;
  description: string;
  bureau: string;
  urgency: 'critical' | 'warning' | 'normal';
  delay: string;
  amount?: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
}

// Données de démo
const mockActions: ActionItem[] = [
  {
    id: 'BC-2024-0847',
    type: 'bc',
    title: 'Bon de commande matériaux',
    description: 'Validation urgente BC pour chantier Phase 3',
    bureau: 'BF',
    urgency: 'critical',
    delay: '2j retard',
    amount: '45.2M FCFA',
    status: 'pending',
    dueDate: '08/01/2026',
  },
  {
    id: 'PAY-2024-1234',
    type: 'paiement',
    title: 'Paiement fournisseur ACME',
    description: 'Facture échue - risque pénalités',
    bureau: 'BCG',
    urgency: 'critical',
    delay: '3j retard',
    amount: '128.5M FCFA',
    status: 'pending',
    dueDate: '07/01/2026',
  },
  {
    id: 'CTR-2024-0567',
    type: 'contrat',
    title: 'Contrat sous-traitance électricité',
    description: 'Signature requise avant démarrage travaux',
    bureau: 'BJA',
    urgency: 'warning',
    delay: 'J-5',
    amount: '89.0M FCFA',
    status: 'pending',
    dueDate: '15/01/2026',
  },
  {
    id: 'ARB-2024-0089',
    type: 'arbitrage',
    title: 'Conflit ressources Lot 4',
    description: 'Arbitrage requis entre BOP et BF',
    bureau: 'BOP',
    urgency: 'warning',
    delay: '5j',
    status: 'in_progress',
    dueDate: '12/01/2026',
  },
  {
    id: 'BC-2024-0852',
    type: 'bc',
    title: 'BC équipements sécurité',
    description: 'Validation pour conformité chantier',
    bureau: 'BOP',
    urgency: 'normal',
    delay: 'J-3',
    amount: '12.8M FCFA',
    status: 'pending',
    dueDate: '13/01/2026',
  },
];

const typeIcons = {
  bc: FileCheck,
  paiement: Wallet,
  contrat: FileText,
  arbitrage: Scale,
  autre: FileText,
};

const typeLabels = {
  bc: 'Bon de commande',
  paiement: 'Paiement',
  contrat: 'Contrat',
  arbitrage: 'Arbitrage',
  autre: 'Autre',
};

export function ActionsView() {
  const openModal = useDashboardCommandCenterStore((s) => s.openModal);
  const subCategory = useDashboardCommandCenterStore((s) => s.navigation.subCategory);
  const subSubCategory = useDashboardCommandCenterStore((s) => s.navigation.subSubCategory);
  const navigation = { subCategory, subSubCategory } as const;

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'urgency' | 'date' | 'amount'>('urgency');

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const { data: actionsData } = useApiQuery(async (_signal: AbortSignal) => dashboardAPI.getActions({ limit: 50 }), []);
  const baseActions: ActionItem[] = useMemo(() => {
    const api = (actionsData as any)?.actions;
    if (!Array.isArray(api) || api.length === 0) return mockActions;
    return api.map((a: any) => ({
      id: String(a.id),
      type: (a.type as any) || 'autre',
      title: String(a.title ?? ''),
      description: String(a.description ?? ''),
      bureau: String(a.bureau ?? ''),
      urgency: (a.urgency as any) || 'normal',
      delay: String(a.delay ?? ''),
      amount: a.amountFormatted ? String(a.amountFormatted) : undefined,
      status: (a.status as any) || 'pending',
      dueDate: a.dueDate ? new Date(a.dueDate).toLocaleDateString('fr-FR') : '',
    }));
  }, [actionsData]);

  // Filtrer selon le sous-onglet (Version 4)
  const filteredActions = useMemo(() => {
    let actions = [...baseActions];

    // Filtre par sous-catégorie selon Version 4
    switch (navigation.subCategory) {
      case 'inbox': // Ma boîte de réception
        const today = new Date().toISOString().split('T')[0];
        const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        switch (navigation.subSubCategory) {
          case 'urgentes':
            actions = actions.filter((a) => a.urgency === 'critical' && a.status === 'pending');
            break;
          case 'aujourdhui':
            actions = actions.filter((a) => {
              const dueDate = new Date(a.dueDate.split('/').reverse().join('-'));
              return dueDate.toISOString().split('T')[0] === today && a.status === 'pending';
            });
            break;
          case 'semaine':
            actions = actions.filter((a) => {
              const dueDate = new Date(a.dueDate.split('/').reverse().join('-'));
              return dueDate.toISOString().split('T')[0] <= weekFromNow && a.status === 'pending';
            });
            break;
          default:
            actions = actions.filter((a) => a.status === 'pending');
        }
        break;
      case 'type': // Par type
        switch (navigation.subSubCategory) {
          case 'contrats':
            actions = actions.filter((a) => a.type === 'contrat');
            break;
          case 'arbitrages':
            actions = actions.filter((a) => a.type === 'arbitrage');
            break;
          case 'paiements':
            actions = actions.filter((a) => a.type === 'paiement');
            break;
          case 'bc':
            actions = actions.filter((a) => a.type === 'bc');
            break;
          case 'autres':
            actions = actions.filter((a) => a.type === 'autre');
            break;
        }
        break;
      case 'priority': // Par priorité
        switch (navigation.subSubCategory) {
          case 'critique':
            actions = actions.filter((a) => a.urgency === 'critical');
            break;
          case 'haute':
            actions = actions.filter((a) => a.urgency === 'warning');
            break;
          case 'moyenne':
            actions = actions.filter((a) => a.urgency === 'normal');
            break;
        }
        break;
      case 'urgent': // Urgentes (legacy)
        actions = actions.filter((a) => a.urgency === 'critical');
        break;
      case 'blocked': // Bloquées
        actions = actions.filter((a) => a.delay.includes('retard'));
        break;
      case 'assigned': // Assignées
        // TODO: Implémenter la logique d'assignation quand disponible
        switch (navigation.subSubCategory) {
          case 'moi':
            // Filtrer par utilisateur actuel
            break;
          case 'equipe':
            // Filtrer par équipe
            break;
          case 'non-assignees':
            // Filtrer non assignées
            break;
        }
        break;
      case 'history': // Historique
        switch (navigation.subSubCategory) {
          case 'recentes':
            actions = actions.filter((a) => a.status === 'completed');
            break;
          case 'anciennes':
            actions = actions.filter((a) => a.status === 'completed');
            break;
          case 'archivees':
            actions = actions.filter((a) => a.status === 'completed');
            break;
        }
        break;
      case 'pending': // En attente (legacy)
        actions = actions.filter((a) => a.status === 'pending');
        break;
      case 'completed': // Terminées (legacy)
        actions = actions.filter((a) => a.status === 'completed');
        break;
    }

    // Recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      actions = actions.filter(
        (a) =>
          a.id.toLowerCase().includes(query) ||
          a.title.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query) ||
          a.bureau.toLowerCase().includes(query)
      );
    }

    // Tri
    actions.sort((a, b) => {
      if (sortBy === 'urgency') {
        const urgencyOrder = { critical: 0, warning: 1, normal: 2 };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      if (sortBy === 'date') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

    return actions;
  }, [baseActions, navigation.subCategory, searchQuery, sortBy]);

  // Convertir les actions pour ActionItem
  const actionsForComponent: ActionItemData[] = useMemo(() => {
    return filteredActions.map((action) => ({
      id: action.id,
      titre: action.title,
      type: (action.type === 'bc' ? 'bc' : action.type === 'paiement' ? 'paiement' : action.type === 'contrat' ? 'contrat' : action.type === 'arbitrage' ? 'arbitrage' : 'contrat') as ActionItemData['type'],
      priorite: (action.urgency === 'critical' ? 'critique' : action.urgency === 'warning' ? 'haute' : 'moyenne') as ActionItemData['priorite'],
      bureau: action.bureau,
      code: action.delay,
      deadline: action.dueDate,
      montant: action.amount ? parseFloat(action.amount.replace(/[^\d.]/g, '')) * (action.amount.includes('M') ? 1000000 : 1000) : undefined,
    }));
  }, [filteredActions]);

  return (
    <div className="p-6 space-y-8 max-w-[1920px] mx-auto">
      {/* Header harmonisé */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <SectionTitle
          icon={navigation.subCategory === 'inbox' ? Inbox : Zap}
          title={
            navigation.subCategory === 'inbox' ? 'Ma boîte de réception' :
            navigation.subCategory === 'type' ? 'Actions par type' :
            navigation.subCategory === 'priority' ? 'Actions par priorité' :
            navigation.subCategory === 'assigned' ? 'Actions assignées' :
            navigation.subCategory === 'history' ? 'Historique des actions' :
            'Actions & Tâches'
          }
          subtitle={`${filteredActions.length} action${filteredActions.length > 1 ? 's' : ''} à traiter`}
          size="lg"
        />

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Rechercher une action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-700 text-slate-200 w-64"
            />
          </div>
          <Button variant="default" size="sm" className="bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800/70">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
          <Button variant="default" size="sm" className="bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800/70">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Barre d'actions groupées */}
      {selectedItems.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <span className="text-sm text-slate-200">
            {selectedItems.length} sélectionné(s)
          </span>
          <div className="flex-1" />
          <Button size="sm" variant="ghost" className="text-slate-200 hover:text-slate-100">
            Valider tout
          </Button>
          <Button size="sm" variant="ghost" className="text-slate-200 hover:text-slate-100">
            Assigner
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSelection}
            className="text-slate-400 hover:text-slate-300"
          >
            Annuler
          </Button>
        </div>
      )}

      {/* Liste des actions avec composant réutilisable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actionsForComponent.map((action) => (
          <ActionItem
            key={action.id}
            action={action}
            onClick={() => openModal('action-detail', { actionId: action.id })}
          />
        ))}
      </div>

      {/* Empty state */}
      {filteredActions.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Aucune action à afficher</p>
          <p className="text-sm text-slate-600 mt-1">
            Modifiez vos filtres ou effectuez une nouvelle recherche
          </p>
        </div>
      )}
    </div>
  );
}

