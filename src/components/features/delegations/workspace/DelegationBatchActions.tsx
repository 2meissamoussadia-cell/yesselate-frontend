'use client';

import { useState, useCallback, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Clock,
  Trash2,
  Pause,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

type BatchAction = 'extend' | 'revoke' | 'suspend' | 'reactivate';

export interface BatchDelegationItem {
  id: string;
  code?: string;
  title?: string;
  type?: string;
  status?: string;
  bureau?: string;
  agentName?: string;
  actorName?: string;
  expiresAt?: string;
  updatedAt?: string;
  maxAmount?: number;
  usageCount?: number;
}

interface BatchResult {
  id: string;
  success: boolean;
  message: string;
}

interface Props {
  open: boolean;
  action: BatchAction;
  delegations: BatchDelegationItem[];
  onClose: () => void;
  onComplete: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function DelegationBatchActions({ open, action, delegations, onClose, onComplete }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(delegations.map(d => d.id)));
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [extensionDays, setExtensionDays] = useState(30);
  const [revokeReason, setRevokeReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSelected(new Set(delegations.map(d => d.id)));
      setResults([]);
      setProcessing(false);
    }
  }, [open, delegations]);

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(delegations.map(d => d.id)));
  }, [delegations]);

  const selectNone = useCallback(() => {
    setSelected(new Set());
  }, []);

  const executeAction = useCallback(async () => {
    if (selected.size === 0) return;

    setProcessing(true);
    setResults([]);

    const ids = Array.from(selected);
    const batchResults: BatchResult[] = [];

    // Traitement par lots avec limite de concurrence
    const CONCURRENCY = 4;
    const queue = [...ids];

    const worker = async () => {
      while (queue.length > 0) {
        const id = queue.shift();
        if (!id) continue;

        try {
          let endpoint = '';
          let body: any = {};

          switch (action) {
            case 'extend':
              endpoint = `/api/delegations/${encodeURIComponent(id)}/extend`;
              body = { days: extensionDays };
              break;
            case 'revoke':
              endpoint = `/api/delegations/${encodeURIComponent(id)}/revoke`;
              body = { reason: revokeReason || 'Révocation en masse' };
              break;
            case 'suspend':
              endpoint = `/api/delegations/${encodeURIComponent(id)}/suspend`;
              body = { reason: suspendReason || 'Suspension en masse' };
              break;
            case 'reactivate':
              endpoint = `/api/delegations/${encodeURIComponent(id)}/reactivate`;
              body = {};
              break;
          }

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (res.ok) {
            batchResults.push({ id, success: true, message: 'Succès' });
          } else {
            const error = await res.json().catch(() => ({}));
            batchResults.push({ id, success: false, message: error.message || `Erreur HTTP ${res.status}` });
          }
        } catch (e) {
          batchResults.push({ id, success: false, message: 'Erreur réseau' });
        }
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

    setResults(batchResults);
    setProcessing(false);

    // Si tout est réussi, fermer après un délai
    if (batchResults.every(r => r.success)) {
      setTimeout(() => {
        onComplete();
        onClose();
      }, 1500);
    }
  }, [selected, action, extensionDays, revokeReason, suspendReason, onClose, onComplete]);

  const getActionConfig = () => {
    switch (action) {
      case 'extend':
        return {
          title: 'Prolonger en masse',
          icon: Clock,
          color: 'blue',
          buttonLabel: 'Prolonger',
          buttonVariant: 'primary' as const,
        };
      case 'revoke':
        return {
          title: 'Révoquer en masse',
          icon: Trash2,
          color: 'rose',
          buttonLabel: 'Révoquer',
          buttonVariant: 'destructive' as const,
        };
      case 'suspend':
        return {
          title: 'Suspendre en masse',
          icon: Pause,
          color: 'amber',
          buttonLabel: 'Suspendre',
          buttonVariant: 'warning' as const,
        };
      case 'reactivate':
        return {
          title: 'Réactiver en masse',
          icon: Play,
          color: 'emerald',
          buttonLabel: 'Réactiver',
          buttonVariant: 'success' as const,
        };
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  return (
    <FluentModal open={open} title={config.title} onClose={onClose}>
      <div className="space-y-4">
        {/* Header info */}
        <div className={cn(
          "p-4 rounded-xl border",
          config.color === 'blue' && "border-blue-200/50 bg-blue-50/50 dark:border-blue-800/30 dark:bg-blue-950/20",
          config.color === 'rose' && "border-rose-200/50 bg-rose-50/50 dark:border-rose-800/30 dark:bg-rose-950/20",
          config.color === 'amber' && "border-amber-200/50 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-950/20",
          config.color === 'emerald' && "border-emerald-200/50 bg-emerald-50/50 dark:border-emerald-800/30 dark:bg-emerald-950/20"
        )}>
          <div className="flex items-center gap-3">
            <Icon className={cn(
              "w-6 h-6",
              config.color === 'blue' && "text-blue-500",
              config.color === 'rose' && "text-rose-500",
              config.color === 'amber' && "text-amber-500",
              config.color === 'emerald' && "text-emerald-500"
            )} />
            <div>
              <div className="font-semibold">{selected.size} délégation(s) sélectionnée(s)</div>
              <div className="text-sm text-slate-400">
                {action === 'extend' && `Prolongation de ${extensionDays} jours`}
                {action === 'revoke' && 'Cette action est irréversible'}
                {action === 'suspend' && 'Les délégations pourront être réactivées'}
                {action === 'reactivate' && 'Les délégations seront remises en activité'}
              </div>
            </div>
          </div>
        </div>

        {/* Options selon l'action */}
        {action === 'extend' && (
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Durée de prolongation</label>
            <Select value={String(extensionDays)} onValueChange={(v) => setExtensionDays(Number(v))}>
              <SelectTrigger className="mt-1 w-full h-10 rounded-xl border-slate-200/70 bg-white/90 dark:border-slate-800 dark:bg-[#141414]/70 text-sm focus:ring-2 focus:ring-blue-400/30">
                <SelectValue placeholder="Durée" />
              </SelectTrigger>
              <SelectContent className="border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1f1f1f]">
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="14">14 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="60">60 jours</SelectItem>
                <SelectItem value="90">90 jours</SelectItem>
                <SelectItem value="180">6 mois</SelectItem>
                <SelectItem value="365">1 an</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {action === 'revoke' && (
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Motif de révocation</label>
            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="Motif de la révocation (optionnel)"
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none focus:ring-2 focus:ring-rose-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white resize-none"
            />
          </div>
        )}

        {action === 'suspend' && (
          <div>
            <label className="text-sm text-slate-600 dark:text-slate-400">Motif de suspension</label>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Motif de la suspension (optionnel)"
              rows={2}
              className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-2.5 outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-slate-800 dark:bg-[#141414]/70 dark:text-white resize-none"
            />
          </div>
        )}

        {/* Liste des délégations */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Délégations</span>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-blue-600 hover:underline">Tout</button>
              <span className="text-slate-300">|</span>
              <button onClick={selectNone} className="text-xs text-slate-400 hover:underline">Aucun</button>
            </div>
          </div>

          <div className="max-h-[200px] overflow-auto border border-slate-200/70 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
            {delegations.map(d => (
              <label
                key={d.id}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                  selected.has(d.id) ? "bg-slate-50 dark:bg-slate-800/30" : "hover:bg-slate-50/50 dark:hover:bg-slate-800/20"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected.has(d.id)}
                  onChange={() => toggleSelect(d.id)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-xs truncate">{d.code || d.id}</div>
                  <div className="text-xs text-slate-400 truncate">
                    {d.bureau} • {d.agentName}
                  </div>
                </div>
                {d.expiresAt && (
                  <span className="text-xs text-slate-400">{new Date(d.expiresAt).toLocaleDateString('fr-FR')}</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Résultats */}
        {results.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-4 text-sm">
              {successCount > 0 && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  {successCount} succès
                </span>
              )}
              {failCount > 0 && (
                <span className="flex items-center gap-1 text-rose-600">
                  <XCircle className="w-4 h-4" />
                  {failCount} échec(s)
                </span>
              )}
            </div>

            {failCount > 0 && (
              <div className="max-h-[100px] overflow-auto text-xs space-y-1">
                {results.filter(r => !r.success).map(r => (
                  <div key={r.id} className="flex items-center gap-2 text-rose-600">
                    <XCircle className="w-3 h-3 flex-none" />
                    <span className="font-mono">{r.id}</span>
                    <span className="text-slate-400">{r.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Avertissement pour révocation */}
        {action === 'revoke' && results.length === 0 && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50/50 border border-rose-200/50 dark:bg-rose-950/20 dark:border-rose-800/30">
            <AlertTriangle className="w-4 h-4 text-rose-500 flex-none mt-0.5" />
            <div className="text-sm text-rose-700 dark:text-rose-300">
              <strong>Attention :</strong> La révocation est définitive et sera tracée dans l&apos;audit.
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <FluentButton size="sm" variant="secondary" onClick={onClose} disabled={processing}>
            {results.length > 0 ? 'Fermer' : 'Annuler'}
          </FluentButton>
          
          {results.length === 0 && (
            <FluentButton
              size="sm"
              variant={config.buttonVariant}
              onClick={executeAction}
              disabled={processing || selected.size === 0}
            >
              {processing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Icon className="w-4 h-4 mr-2" />
                  {config.buttonLabel} ({selected.size})
                </>
              )}
            </FluentButton>
          )}
        </div>
      </div>
    </FluentModal>
  );
}

export default DelegationBatchActions;

