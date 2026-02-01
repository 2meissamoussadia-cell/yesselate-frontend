/**
 * Modal de détail d'une délégation
 * Pattern overlay - modal pleine page pour afficher les détails complets
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Key,
  Clock,
  Shield,
  Building2,
  User,
  Calendar,
  AlertTriangle,
  Loader2,
  Edit,
  FileText,
  History,
} from 'lucide-react';
import { useDelegationsCommandCenterStore } from '@/lib/stores/delegationsCommandCenterStore';

interface DelegationDetailModalProps {
  open: boolean;
  delegationId?: string | null;
  onClose: () => void;
}

interface DelegationData {
  id: string;
  type: string;
  status: string;
  agentName: string;
  agentRole: string | null;
  bureau: string;
  scope: string;
  maxAmount: number | null;
  startDate: string;
  endDate: string;
  delegatorName: string;
  usageCount: number;
  lastUsedAt: string | null;
  expiringSoon: boolean;
  hash: string | null;
}

export function DelegationDetailModal({
  open,
  delegationId,
  onClose,
}: DelegationDetailModalProps) {
  const { openModal } = useDelegationsCommandCenterStore();
  const [loading, setLoading] = useState(true);
  const [delegation, setDelegation] = useState<DelegationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !delegationId) {
      setDelegation(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Charger les détails de la délégation
    fetch(`/api/delegations/${encodeURIComponent(delegationId)}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setDelegation(data as DelegationData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Erreur de chargement');
        setLoading(false);
      });
  }, [open, delegationId]);

  if (!open) return null;

  const handleOpenTimeline = () => {
    if (delegationId) {
      openModal('timeline', { delegationId });
      onClose();
    }
  };

  const statusColors = {
    active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    expired: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    revoked: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    suspended: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-purple-500" />
            <div>
              <h2 className="text-lg font-semibold text-slate-200">
                Détails de la délégation
              </h2>
              {delegation && (
                <p className="text-sm text-slate-400 font-mono">{delegation.id}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-8 w-8 text-red-500 mb-4" />
              <p className="text-sm text-slate-400">Erreur : {error}</p>
            </div>
          )}

          {!loading && !error && delegation && (
            <div className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={cn(
                    statusColors[delegation.status as keyof typeof statusColors] ||
                      'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  )}
                >
                  {delegation.status}
                </Badge>
                {delegation.expiringSoon && (
                  <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    <Clock className="h-3 w-3 mr-1" />
                    Expire bientôt
                  </Badge>
                )}
              </div>

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard
                  icon={User}
                  label="Agent"
                  value={delegation.agentName}
                  subValue={delegation.agentRole}
                />
                <InfoCard
                  icon={Building2}
                  label="Bureau"
                  value={delegation.bureau}
                />
                <InfoCard
                  icon={Shield}
                  label="Type"
                  value={delegation.type}
                />
                <InfoCard
                  icon={FileText}
                  label="Périmètre"
                  value={delegation.scope}
                />
                <InfoCard
                  icon={Calendar}
                  label="Date de début"
                  value={new Date(delegation.startDate).toLocaleDateString('fr-FR')}
                />
                <InfoCard
                  icon={Clock}
                  label="Date de fin"
                  value={new Date(delegation.endDate).toLocaleDateString('fr-FR')}
                />
                {delegation.maxAmount !== null && (
                  <InfoCard
                    icon={FileText}
                    label="Montant maximum"
                    value={`${delegation.maxAmount.toLocaleString('fr-FR')} FCFA`}
                  />
                )}
                <InfoCard
                  icon={User}
                  label="Délégateur"
                  value={delegation.delegatorName}
                />
              </div>

              {/* Usage */}
              <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">Utilisation</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Nombre d'utilisations</p>
                    <p className="text-lg font-semibold text-slate-200">{delegation.usageCount}</p>
                  </div>
                  {delegation.lastUsedAt && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Dernière utilisation</p>
                      <p className="text-sm text-slate-300">
                        {new Date(delegation.lastUsedAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hash */}
              {delegation.hash && (
                <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">Hash de traçabilité</h3>
                  <p className="text-xs font-mono text-slate-400 break-all">{delegation.hash}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && !error && delegation && (
          <div className="border-t border-slate-800/50 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenTimeline}
                className="border-slate-700 text-slate-400 hover:text-slate-200"
              >
                <History className="h-4 w-4 mr-2" />
                Historique
              </Button>
            </div>
            <Button
              onClick={onClose}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              size="sm"
            >
              Fermer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant helper pour les cartes d'information
function InfoCard({
  icon: Icon,
  label,
  value,
  subValue,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  subValue?: string | null;
}) {
  return (
    <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-sm font-semibold text-slate-200">{value}</p>
      {subValue && (
        <p className="text-xs text-slate-400 mt-1">{subValue}</p>
      )}
    </div>
  );
}
