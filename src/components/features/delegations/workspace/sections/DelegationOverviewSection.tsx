'use client';

import { cn } from '@/lib/cn';
import {
  Shield,
  Users,
  Building2,
  Calendar,
  Banknote,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Hash,
} from 'lucide-react';

interface Props {
  delegation: any;
  onRefresh: () => void;
}

function formatAmount(amount: number | undefined, currency: string = 'XOF'): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | string | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function DelegationOverviewSection({ delegation, onRefresh }: Props) {
  if (!delegation) {
    return <div className="text-slate-400 text-center py-8">Aucune donnée</div>;
  }

  const daysToExpiry = delegation.metrics?.daysToExpiry ?? 0;
  const usageRate = delegation.metrics?.usageRate ?? 0;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-purple-500/10 text-center">
          <div className="text-3xl font-bold text-purple-600">{delegation.usageCount ?? 0}</div>
          <div className="text-xs text-slate-400">Utilisations</div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/10 text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {formatAmount(delegation.usageTotalAmount, delegation.currency)}
          </div>
          <div className="text-xs text-slate-400">Montant cumulé</div>
        </div>
        <div className={cn(
          "p-4 rounded-xl text-center",
          daysToExpiry <= 7 ? "bg-amber-500/10" : "bg-blue-500/10"
        )}>
          <div className={cn(
            "text-3xl font-bold",
            daysToExpiry <= 7 ? "text-amber-600" : "text-blue-600"
          )}>
            {daysToExpiry}j
          </div>
          <div className="text-xs text-slate-400">Avant expiration</div>
        </div>
        <div className={cn(
          "p-4 rounded-xl text-center",
          usageRate >= 80 ? "bg-rose-500/10" : "bg-slate-500/10"
        )}>
          <div className={cn(
            "text-3xl font-bold",
            usageRate >= 80 ? "text-rose-600" : "text-slate-600"
          )}>
            {usageRate}%
          </div>
          <div className="text-xs text-slate-400">Plafond utilisé</div>
        </div>
      </div>

      {/* Informations principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carte identité */}
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            Identité
          </h3>
          
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">ID</dt>
              <dd className="font-mono">{delegation.id}</dd>
            </div>
            {delegation.code && (
              <div className="flex justify-between">
                <dt className="text-slate-400">Code</dt>
                <dd className="font-mono">{delegation.code}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-slate-400">Catégorie</dt>
              <dd>{delegation.category}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Statut</dt>
              <dd>
                <span className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  delegation.status === 'active' && "bg-emerald-100 text-emerald-700",
                  delegation.status === 'suspended' && "bg-amber-100 text-amber-800",
                  delegation.status === 'revoked' && "bg-rose-100 text-rose-700",
                  delegation.status === 'expired' && "bg-slate-100 text-slate-600"
                )}>
                  {delegation.status}
                </span>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Bureau</dt>
              <dd>{delegation.bureau}</dd>
            </div>
          </dl>
        </div>

        {/* Parties */}
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Parties
          </h3>
          
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <div className="text-xs text-slate-400 mb-1">Délégant</div>
              <div className="font-medium">{delegation.grantor?.name || delegation.grantorName}</div>
              <div className="text-sm text-slate-400">{delegation.grantor?.role || delegation.grantorRole}</div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-0.5 h-4 bg-slate-200 dark:bg-slate-700" />
            </div>
            
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="text-xs text-purple-600 mb-1">Délégataire</div>
              <div className="font-medium">{delegation.delegate?.name || delegation.delegateName}</div>
              <div className="text-sm text-slate-400">{delegation.delegate?.role || delegation.delegateRole}</div>
            </div>
          </div>
        </div>

        {/* Période */}
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            Période de validité
          </h3>
          
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">Début</dt>
              <dd>{formatDate(delegation.startsAt)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Fin</dt>
              <dd className={cn(daysToExpiry <= 7 && "text-amber-600 font-medium")}>
                {formatDate(delegation.endsAt)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Prolongeable</dt>
              <dd>{delegation.extendable ? 'Oui' : 'Non'}</dd>
            </div>
            {delegation.extendable && (
              <div className="flex justify-between">
                <dt className="text-slate-400">Extensions max</dt>
                <dd>{delegation.maxExtensions} × {delegation.extensionDays}j</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Limites */}
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-500" />
            Limites
          </h3>
          
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-400">Plafond/opération</dt>
              <dd className="font-medium">{formatAmount(delegation.maxAmount, delegation.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Plafond cumulé</dt>
              <dd className="font-medium">{formatAmount(delegation.maxTotalAmount, delegation.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-400">Restant</dt>
              <dd className={cn(
                "font-medium",
                usageRate >= 80 && "text-rose-600"
              )}>
                {formatAmount(delegation.metrics?.remainingAmount, delegation.currency)}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Traçabilité */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Hash className="w-4 h-4 text-slate-400" />
          Traçabilité cryptographique
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-slate-400 mb-1">Hash décision</div>
            <div className="font-mono text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded truncate">
              {delegation.decisionHash || '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Hash tête de chaîne</div>
            <div className="font-mono text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded truncate">
              {delegation.headHash || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Dernières actions */}
      {delegation.events && delegation.events.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Dernières actions
          </h3>
          
          <div className="space-y-2">
            {delegation.events.slice(0, 5).map((event: any) => (
              <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <span className={cn(
                  "px-1.5 py-0.5 rounded text-xs capitalize flex-none",
                  event.eventType === 'CREATED' && 'bg-emerald-500/10 text-emerald-700',
                  event.eventType === 'USED' && 'bg-blue-500/10 text-blue-700',
                  event.eventType === 'EXTENDED' && 'bg-purple-500/10 text-purple-700',
                  event.eventType === 'SUSPENDED' && 'bg-amber-500/10 text-amber-800',
                  event.eventType === 'REVOKED' && 'bg-rose-500/10 text-rose-700'
                )}>
                  {event.eventType?.toLowerCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{event.summary || event.actor?.name}</div>
                  <div className="text-xs text-slate-400">
                    {formatDate(event.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

