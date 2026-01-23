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
} from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useApiQuery } from '@/lib/api/hooks/useApiQuery';
import { dashboardAPI } from '@/lib/api/pilotage/dashboardClient';

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
  const { navigation, openModal } =
    useDashboardCommandCenterStore();

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

  // Filtrer selon le sous-onglet
  const filteredActions = useMemo(() => {
    let actions = [...baseActions];

    // Filtre par sous-catégorie
    switch (navigation.subCategory) {
      case 'urgent':
        actions = actions.filter((a) => a.urgency === 'critical');
        break;
      case 'blocked':
        actions = actions.filter((a) => a.delay.includes('retard'));
        break;
      case 'pending':
        actions = actions.filter((a) => a.status === 'pending');
        break;
      case 'completed':
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

  return (
    <div className="p-6 space-y-4 max-w-[1800px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-200">Actions Prioritaires</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredActions.length} actions à traiter
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-slate-800/50 border-slate-700 text-slate-200 w-64"
            />
          </div>
          <Button variant="default" size="sm" className="border-slate-700 text-slate-400">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
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

      {/* Liste des actions */}
      <div className="space-y-2">
        {filteredActions.map((action) => {
          const Icon = typeIcons[action.type];
          const isSelected = selectedItems.includes(action.id);

          return (
            <div
              key={action.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border transition-all',
                isSelected
                  ? 'bg-slate-800/50 border-slate-600/60'
                  : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'
              )}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleItemSelection(action.id)}
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                  isSelected
                    ? 'bg-slate-200 border-slate-200'
                    : 'border-slate-600 hover:border-slate-500'
                )}
              >
                {isSelected && <CheckCircle className="w-3 h-3 text-slate-900" />}
              </button>

              {/* Indicateur urgence */}
              <div
                className={cn(
                  'w-1.5 h-12 rounded-full flex-shrink-0',
                  action.urgency === 'critical'
                    ? 'bg-rose-500'
                    : action.urgency === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-slate-600'
                )}
              />

              {/* Icône type */}
              <div
                className={cn(
                  'p-2 rounded-lg flex-shrink-0 border border-slate-700/50 bg-slate-800/50'
                )}
              >
                <Icon
                  className={cn(
                    'w-5 h-5',
                    action.urgency === 'critical'
                      ? 'text-rose-400'
                      : action.urgency === 'warning'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  )}
                />
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-slate-500">{action.id}</span>
                  <Badge
                    variant="default"
                    className="text-xs border-slate-700 text-slate-400"
                  >
                    {typeLabels[action.type]}
                  </Badge>
                  <Badge
                    variant="default"
                    className="text-xs border-slate-700 text-slate-400"
                  >
                    {action.bureau}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-200 truncate">{action.title}</p>
                <p className="text-xs text-slate-500 truncate">{action.description}</p>
              </div>

              {/* Montant */}
              {action.amount && (
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-200">{action.amount}</p>
                </div>
              )}

              {/* Délai */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Clock
                  className={cn(
                    'w-4 h-4',
                    action.delay.includes('retard') ? 'text-rose-400' : 'text-slate-500'
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-medium',
                    action.delay.includes('retard') ? 'text-rose-400' : 'text-slate-400'
                  )}
                >
                  {action.delay}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openModal('action-detail', { action })}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-slate-400 hover:text-slate-200"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          );
        })}
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

