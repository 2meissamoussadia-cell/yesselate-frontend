'use client';

import { useState, useEffect, useCallback } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/cn';
import {
  UserCheck,
  Users,
  Clock,
  Calendar,
  AlertTriangle,
  Plus,
  RefreshCw,
  ChevronRight,
  Shield,
  Trash2,
  Edit,
} from 'lucide-react';

// ============================================
// Types
// ============================================
interface DelegationScope {
  documentTypes: string[];
  bureaux: string[] | null;
  maxAmount: number | null;
  actions: string[];
}

interface Delegation {
  id: string;
  delegatorId: string;
  delegatorName: string;
  delegatorRole: string;
  delegateId: string;
  delegateName: string;
  delegateRole: string;
  type: 'full' | 'limited' | 'specific';
  scope: DelegationScope;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'active' | 'expired' | 'revoked';
  createdAt: string;
  usageCount: number;
  lastUsedAt?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

// ============================================
// Component
// ============================================
export function ValidationBCDelegationManager({ open, onClose }: Props) {
  const [delegations, setDelegations] = useState<Delegation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'expired' | 'my'>('active');

  const loadDelegations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/validation-bc/delegations?status=${selectedTab === 'my' ? 'all' : selectedTab}`);
      if (!res.ok) throw new Error('Erreur chargement délégations');
      
      const data = await res.json();
      setDelegations(data.data);
    } catch (e) {
      setError('Impossible de charger les délégations');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    if (open) {
      loadDelegations();
    }
  }, [open, loadDelegations]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'limited':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'specific':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'full':
        return 'Complète';
      case 'limited':
        return 'Limitée';
      case 'specific':
        return 'Spécifique';
      default:
        return type;
    }
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'Illimité';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRemainingTime = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const hours = Math.max(0, Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60)));
    
    if (hours < 24) return `${hours}h restantes`;
    const days = Math.round(hours / 24);
    return `${days}j restant${days > 1 ? 's' : ''}`;
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const hours = (end.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hours < 24 && hours > 0;
  };

  return (
    <FluentModal
      open={open}
      title={
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-blue-500" />
          <span>Gestion des délégations</span>
        </div>
      }
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
          {[
            { key: 'active', label: 'Actives', icon: Shield },
            { key: 'my', label: 'Mes délégations', icon: Users },
            { key: 'expired', label: 'Expirées', icon: Clock },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as typeof selectedTab)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  selectedTab === tab.key
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          
          <FluentButton
            size="sm"
            variant="primary"
            onClick={() => setCreateOpen(true)}
            className="ml-auto"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle
          </FluentButton>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-rose-500">
            <AlertTriangle className="w-10 h-10 mx-auto mb-2" />
            <div>{error}</div>
            <FluentButton size="sm" variant="secondary" onClick={loadDelegations} className="mt-4">
              Réessayer
            </FluentButton>
          </div>
        ) : delegations.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <div>Aucune délégation</div>
            <FluentButton size="sm" variant="primary" onClick={() => setCreateOpen(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-1" />
              Créer une délégation
            </FluentButton>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-auto">
            {delegations.map(delegation => (
              <div
                key={delegation.id}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  delegation.status === 'active'
                    ? "border-emerald-200/50 bg-emerald-50/30 dark:border-emerald-800/30 dark:bg-emerald-950/20"
                    : "border-slate-200/70 dark:border-slate-800"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium",
                        getTypeColor(delegation.type)
                      )}>
                        {getTypeLabel(delegation.type)}
                      </span>
                      {isExpiringSoon(delegation.endDate) && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 animate-pulse">
                          Expire bientôt
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{delegation.id}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium">
                          {delegation.delegatorName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">{delegation.delegatorName}</div>
                          <div className="text-xs text-slate-400">{delegation.delegatorRole}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
                          {delegation.delegateName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">{delegation.delegateName}</div>
                          <div className="text-xs text-slate-400">{delegation.delegateRole}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Scope */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/30">
                    <div className="text-slate-400 mb-0.5">Documents</div>
                    <div className="font-medium">{delegation.scope.documentTypes.join(', ')}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/30">
                    <div className="text-slate-400 mb-0.5">Plafond</div>
                    <div className="font-medium">{formatAmount(delegation.scope.maxAmount)}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/30">
                    <div className="text-slate-400 mb-0.5">Bureaux</div>
                    <div className="font-medium">{delegation.scope.bureaux?.join(', ') || 'Tous'}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-800/30">
                    <div className="text-slate-400 mb-0.5">Actions</div>
                    <div className="font-medium">{delegation.scope.actions.length} autorisées</div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(delegation.startDate).toLocaleDateString('fr-FR')} - {new Date(delegation.endDate).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getRemainingTime(delegation.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{delegation.usageCount} utilisation{delegation.usageCount > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {delegation.reason && (
                  <div className="mt-2 p-2 rounded-lg bg-slate-100/50 dark:bg-slate-800/30 text-xs text-slate-600 dark:text-slate-400">
                    <strong>Motif:</strong> {delegation.reason}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <FluentButton size="sm" variant="secondary" onClick={onClose}>
            Fermer
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

export default ValidationBCDelegationManager;

