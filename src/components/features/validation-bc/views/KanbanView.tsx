/**
 * Vue Kanban - Validation BC
 * Gestion visuelle des documents par statut avec drag & drop
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Search,
  Filter,
  MoreVertical,
  Clock,
  DollarSign,
  User,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import type { ValidationDocument } from '@/lib/services/validation-bc-api';

// ================================
// Types
// ================================
type KanbanColumn = 'new' | 'chef_service' | 'daf' | 'dg' | 'validated' | 'rejected';

interface KanbanCard extends ValidationDocument {
  column: KanbanColumn;
}

const COLUMNS: Array<{
  id: KanbanColumn;
  label: string;
  color: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'new',
    label: 'Nouveau',
    color: 'bg-slate-700',
    icon: <Plus className="h-4 w-4" />,
  },
  {
    id: 'chef_service',
    label: 'Chef de Service',
    color: 'bg-blue-500/20 border-blue-500/30',
    icon: <User className="h-4 w-4" />,
  },
  {
    id: 'daf',
    label: 'DAF',
    color: 'bg-purple-500/20 border-purple-500/30',
    icon: <User className="h-4 w-4" />,
  },
  {
    id: 'dg',
    label: 'DG',
    color: 'bg-cyan-500/20 border-cyan-500/30',
    icon: <User className="h-4 w-4" />,
  },
  {
    id: 'validated',
    label: 'Validé',
    color: 'bg-emerald-500/20 border-emerald-500/30',
    icon: <FileText className="h-4 w-4" />,
  },
  {
    id: 'rejected',
    label: 'Rejeté',
    color: 'bg-red-500/20 border-red-500/30',
    icon: <FileText className="h-4 w-4" />,
  },
];

// ================================
// Component
// ================================
export function KanbanView() {
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBureau, setFilterBureau] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [draggedCard, setDraggedCard] = useState<string | null>(null);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    // Mock data
    const mockCards: KanbanCard[] = [
      {
        id: 'BC-2024-001',
        type: 'bc',
        status: 'pending',
        bureau: 'DRE',
        fournisseur: 'SENELEC',
        objet: 'Fourniture équipements électriques',
        montantHT: 8500000,
        montantTTC: 10030000,
        tva: 18,
        dateEmission: '2024-01-15',
        dateLimite: '2024-01-20',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-18',
        urgent: true,
        demandeur: {
          nom: 'A. DIALLO',
          fonction: 'Chef Service',
          bureau: 'DRE',
        },
        column: 'chef_service',
      },
      {
        id: 'FC-2024-015',
        type: 'facture',
        status: 'pending',
        bureau: 'DAAF',
        fournisseur: 'EIFFAGE',
        objet: 'Travaux construction route',
        montantHT: 25000000,
        montantTTC: 29500000,
        tva: 18,
        dateEmission: '2024-01-16',
        createdAt: '2024-01-16',
        updatedAt: '2024-01-18',
        demandeur: {
          nom: 'M. KANE',
          fonction: 'DAF',
          bureau: 'DAAF',
        },
        column: 'daf',
      },
      {
        id: 'AV-2024-003',
        type: 'avenant',
        status: 'pending',
        bureau: 'DSI',
        fournisseur: 'ORANGE',
        objet: 'Avenant marché télécom',
        montantHT: 5000000,
        montantTTC: 5900000,
        tva: 18,
        dateEmission: '2024-01-17',
        createdAt: '2024-01-17',
        updatedAt: '2024-01-18',
        demandeur: {
          nom: 'B. SOW',
          fonction: 'DSI',
          bureau: 'DSI',
        },
        column: 'dg',
      },
      {
        id: 'BC-2024-002',
        type: 'bc',
        status: 'validated',
        bureau: 'DRE',
        fournisseur: 'CIMENT DU SAHEL',
        objet: 'Fourniture ciment',
        montantHT: 3000000,
        montantTTC: 3540000,
        tva: 18,
        dateEmission: '2024-01-14',
        createdAt: '2024-01-14',
        updatedAt: '2024-01-17',
        demandeur: {
          nom: 'F. NDIAYE',
          fonction: 'Chef Projet',
          bureau: 'DRE',
        },
        column: 'validated',
      },
    ];

    setCards(mockCards);
  };

  const handleDragStart = (cardId: string) => {
    setDraggedCard(cardId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (columnId: KanbanColumn) => {
    if (!draggedCard) return;

    setCards(prev =>
      prev.map(card =>
        card.id === draggedCard ? { ...card, column: columnId } : card
      )
    );
    setDraggedCard(null);

    // TODO: Appel API pour mettre à jour le statut
    console.log(`Document ${draggedCard} moved to ${columnId}`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(amount) + ' FCFA';
  };

  const getDelaiColor = (dateLimite?: string) => {
    if (!dateLimite) return 'text-slate-400';
    const now = new Date();
    const limite = new Date(dateLimite);
    const diff = limite.getTime() - now.getTime();
    const jours = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (jours < 0) return 'text-red-400';
    if (jours <= 1) return 'text-amber-400';
    return 'text-slate-400';
  };

  const filteredCards = cards.filter(card => {
    if (searchQuery && !card.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !card.objet.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterBureau !== 'all' && card.bureau !== filterBureau) {
      return false;
    }
    if (filterType !== 'all' && card.type !== filterType) {
      return false;
    }
    return true;
  });

  const getColumnCards = (columnId: KanbanColumn) => {
    return filteredCards.filter(card => card.column === columnId);
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header & Filters */}
      <div className="flex-shrink-0 space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-200">Vue Kanban</h1>
            <p className="text-slate-400 mt-1">Gestion visuelle des documents</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900 border-slate-700"
            />
          </div>

          <Select value={filterBureau} onValueChange={setFilterBureau}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700">
              <SelectValue placeholder="Tous les bureaux" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">Tous les bureaux</SelectItem>
              <SelectItem value="DRE">DRE</SelectItem>
              <SelectItem value="DAAF">DAAF</SelectItem>
              <SelectItem value="DSI">DSI</SelectItem>
              <SelectItem value="DG">DG</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700">
              <SelectValue placeholder="Tous les types" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="bc">Bons de Commande</SelectItem>
              <SelectItem value="facture">Factures</SelectItem>
              <SelectItem value="avenant">Avenants</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Plus de filtres
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map((column) => {
            const columnCards = getColumnCards(column.id);
            return (
              <div
                key={column.id}
                className="flex flex-col w-80 flex-shrink-0"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header */}
                <div className={cn(
                  'flex items-center justify-between p-3 rounded-t-lg border-b-2',
                  column.color
                )}>
                  <div className="flex items-center gap-2">
                    {column.icon}
                    <span className="font-semibold text-slate-200">{column.label}</span>
                    <Badge variant="outline" className="bg-slate-900/50">
                      {columnCards.length}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-900/20 rounded-b-lg min-h-[200px]">
                  {columnCards.map((card) => (
                    <Card
                      key={card.id}
                      draggable
                      onDragStart={() => handleDragStart(card.id)}
                      className={cn(
                        'cursor-move transition-all hover:shadow-lg hover:scale-[1.02]',
                        'bg-slate-800/50 border-slate-700',
                        card.urgent && 'border-l-4 border-l-red-500',
                        draggedCard === card.id && 'opacity-50'
                      )}
                    >
                      <CardContent className="p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-400" />
                            <span className="font-semibold text-slate-200 text-sm">
                              {card.id}
                            </span>
                          </div>
                          {card.urgent && (
                            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                              Urgent
                            </Badge>
                          )}
                        </div>

                        {/* Objet */}
                        <p className="text-sm text-slate-300 line-clamp-2">
                          {card.objet}
                        </p>

                        {/* Informations */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Fournisseur</span>
                            <span className="text-slate-300 font-medium">{card.fournisseur}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Montant</span>
                            <span className="text-blue-400 font-medium">
                              {formatCurrency(card.montantTTC)}
                            </span>
                          </div>
                          {card.dateLimite && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">Échéance</span>
                              <span className={cn('font-medium', getDelaiColor(card.dateLimite))}>
                                {new Date(card.dateLimite).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: 'short',
                                })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                          <div className="flex items-center gap-1">
                            <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-400">
                                {card.demandeur.nom.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">{card.demandeur.nom}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              card.type === 'bc' && 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                              card.type === 'facture' && 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                              card.type === 'avenant' && 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            )}
                          >
                            {card.type === 'bc' ? 'BC' : card.type === 'facture' ? 'Facture' : 'Avenant'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {columnCards.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
                      Aucun document
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

