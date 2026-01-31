'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
import {
  UserCheck,
  Plus,
  Trash2,
  Clock,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Users,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Delegation {
  id: string;
  delegatorName: string;
  delegatorRole: string;
  delegateName: string;
  delegateRole: string;
  startDate: string;
  endDate: string;
  permissions: string[];
  reason: string;
  status: 'active' | 'pending' | 'expired';
  requestsHandled: number;
}

interface RHDelegationManagerProps {
  open: boolean;
  onClose: () => void;
}

export function RHDelegationManager({ open, onClose }: RHDelegationManagerProps) {
  const [delegations, setDelegations] = useState<Delegation[]>([
    {
      id: 'del-1',
      delegatorName: 'Sarah Martin',
      delegatorRole: 'Responsable RH',
      delegateName: 'Thomas Dubois',
      delegateRole: 'RH Adjoint',
      startDate: '2026-01-08',
      endDate: '2026-01-15',
      permissions: ['validate_leave', 'validate_expenses', 'view_reports'],
      reason: 'Congés annuels',
      status: 'active',
      requestsHandled: 23,
    },
    {
      id: 'del-2',
      delegatorName: 'Ahmed Bencherif',
      delegatorRole: 'Superviseur Bureau Alger',
      delegateName: 'Karim Meziani',
      delegateRole: 'Assistant Superviseur',
      startDate: '2026-01-10',
      endDate: '2026-01-12',
      permissions: ['validate_leave', 'view_team_requests'],
      reason: 'Mission à l\'étranger',
      status: 'active',
      requestsHandled: 8,
    },
    {
      id: 'del-3',
      delegatorName: 'Marie Lambert',
      delegatorRole: 'Directrice Générale',
      delegateName: 'Sarah Martin',
      delegateRole: 'Responsable RH',
      startDate: '2026-01-15',
      endDate: '2026-01-20',
      permissions: ['validate_all', 'approve_budget', 'access_confidential'],
      reason: 'Déplacement professionnel',
      status: 'pending',
      requestsHandled: 0,
    },
    {
      id: 'del-4',
      delegatorName: 'Jean Moreau',
      delegatorRole: 'Chef de projet',
      delegateName: 'Sophie Bernard',
      delegateRole: 'Chef de projet adjoint',
      startDate: '2025-12-20',
      endDate: '2026-01-05',
      permissions: ['validate_team_leave', 'approve_expenses'],
      reason: 'Congés de fin d\'année',
      status: 'expired',
      requestsHandled: 15,
    },
  ]);

  const [showNewDelegationForm, setShowNewDelegationForm] = useState(false);

  const activeDelegations = delegations.filter((d) => d.status === 'active');
  const pendingDelegations = delegations.filter((d) => d.status === 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'pending':
        return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      case 'expired':
        return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
      default:
        return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'expired':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const deleteDelegation = (id: string) => {
    setDelegations((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Gestion des délégations de pouvoir"
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-green-500/5 to-green-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Délégations actives</p>
                <p className="text-2xl font-bold">{activeDelegations.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">En attente</p>
                <p className="text-2xl font-bold">{pendingDelegations.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Demandes traitées</p>
                <p className="text-2xl font-bold">
                  {delegations.reduce((sum, d) => sum + d.requestsHandled, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des délégations */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {delegations.map((delegation) => (
            <div
              key={delegation.id}
              className={cn(
                'rounded-xl border p-4',
                delegation.status === 'active'
                  ? 'border-green-200 bg-green-500/5 dark:border-green-800'
                  : delegation.status === 'pending'
                  ? 'border-amber-200 bg-amber-500/5 dark:border-amber-800'
                  : 'border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        delegation.status === 'active'
                          ? 'success'
                          : delegation.status === 'pending'
                          ? 'warning'
                          : 'default'
                      }
                      className="text-xs"
                    >
                      {getStatusIcon(delegation.status)}
                      {delegation.status === 'active'
                        ? 'Active'
                        : delegation.status === 'pending'
                        ? 'En attente'
                        : 'Expirée'}
                    </Badge>
                    <span className="text-xs text-slate-400">{delegation.reason}</span>
                  </div>

                  {/* Délégant */}
                  <div className="mb-2">
                    <p className="text-xs text-slate-400 mb-1">Délégant:</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {delegation.delegatorName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{delegation.delegatorName}</p>
                        <p className="text-xs text-slate-400">{delegation.delegatorRole}</p>
                      </div>
                    </div>
                  </div>

                  {/* Délégataire */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-400 mb-1">Délégataire:</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {delegation.delegateName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{delegation.delegateName}</p>
                        <p className="text-xs text-slate-400">{delegation.delegateRole}</p>
                      </div>
                    </div>
                  </div>

                  {/* Période */}
                  <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(delegation.startDate).toLocaleDateString('fr-FR')}
                      <span className="mx-1">→</span>
                      {new Date(delegation.endDate).toLocaleDateString('fr-FR')}
                    </div>
                    {delegation.status === 'active' && (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        {delegation.requestsHandled} demandes traitées
                      </div>
                    )}
                  </div>

                  {/* Permissions */}
                  <div>
                    <p className="text-xs text-slate-400 mb-1.5 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Permissions déléguées:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {delegation.permissions.map((perm, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs"
                        >
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 ml-4">
                  <button
                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteDelegation(delegation.id)}
                    className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {delegations.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucune délégation enregistrée</p>
          </div>
        )}

        {/* Info */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-500/5 p-4">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 <strong>Info:</strong> Les délégations permettent de transférer temporairement vos
            permissions de validation à un collègue. Toutes les actions effectuées par le délégataire
            sont tracées et associées à la délégation.
          </p>
        </div>

        <div className="flex justify-between items-center w-full pt-4 border-t border-slate-700">
          <button
            onClick={() => setShowNewDelegationForm(true)}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouvelle délégation
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </FluentModal>
  );
}


