/**
 * Vue Dépenses - Liste des demandes de dépenses
 */

'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { useDemandesRHCommandCenterStore } from '@/lib/stores/demandesRHCommandCenterStore';
import type { DemandeRH } from '../DemandesRHDetailModal';

interface DemandesRHDepensesViewProps {
  subCategory?: string;
}

export function DemandesRHDepensesView({ subCategory = 'all' }: DemandesRHDepensesViewProps) {
  const { openDetailModal } = useDemandesRHCommandCenterStore();
  const [demandes, setDemandes] = useState<DemandeRH[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les demandes (TODO: Remplacer par vraie API)
  useEffect(() => {
    setLoading(true);
    // Simuler appel API
    fetch('/api/rh/demandes?type=depenses')
      .then((res) => res.json())
      .then((data) => {
        setDemandes(data.data || []);
        setLoading(false);
      })
      .catch(() => {
        // Mock data en fallback
        setDemandes([
          {
            id: 'DEM-2026-002',
            type: 'depenses',
            numero: 'DEP-2026-002',
            agent: {
              id: 'AGT002',
              nom: 'Fatou SALL',
              matricule: 'MAT-002',
              bureau: 'Bureau Administratif',
              poste: 'Responsable Administratif',
            },
            statut: 'validee',
            priorite: 'urgente',
            objet: 'Frais de mission Thiès',
            montant: 75000,
            devise: 'XOF',
            dateDebut: '2026-01-05',
            dateFin: '2026-01-05',
            validations: [],
            createdAt: '2026-01-05T18:30:00Z',
            updatedAt: '2026-01-06T15:45:00Z',
            createdBy: 'AGT002',
          },
        ]);
        setLoading(false);
      });
  }, [subCategory]);

  // Filtrer selon subCategory
  const filteredDemandes = React.useMemo(() => {
    if (subCategory === 'all') return demandes;
    if (subCategory === 'pending') {
      return demandes.filter((d) => d.statut === 'en_cours');
    }
    if (subCategory === 'validated') {
      return demandes.filter((d) => d.statut === 'validee');
    }
    if (subCategory === 'rejected') {
      return demandes.filter((d) => d.statut === 'rejetee');
    }
    return demandes;
  }, [demandes, subCategory]);

  const statutColors = {
    brouillon: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    en_cours: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    validee: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    rejetee: 'bg-red-500/20 text-red-400 border-red-500/30',
    annulee: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const prioriteColors = {
    normale: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    urgente: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    critique: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Demandes de Dépenses
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {filteredDemandes.length} demande(s) {subCategory !== 'all' && `(${subCategory})`}
          </p>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="space-y-2">
        {filteredDemandes.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Aucune demande de dépenses</p>
          </div>
        ) : (
          filteredDemandes.map((demande) => (
            <button
              key={demande.id}
              onClick={() => openDetailModal(demande.id)}
              className={cn(
                'w-full p-4 rounded-lg border border-slate-700/50 bg-slate-800/30',
                'hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200',
                'text-left cursor-pointer group'
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-slate-400">{demande.numero}</span>
                    <Badge className={cn('text-xs', statutColors[demande.statut])}>
                      {demande.statut.replace('_', ' ')}
                    </Badge>
                    <Badge className={cn('text-xs', prioriteColors[demande.priorite])}>
                      {demande.priorite}
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-base font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {demande.objet}
                    </h3>
                    {demande.montant && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-emerald-400">
                          {demande.montant.toLocaleString()} {demande.devise || 'XOF'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{demande.agent.nom}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>Créée {new Date(demande.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

