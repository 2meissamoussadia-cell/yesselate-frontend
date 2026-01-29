'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Zap,
  Phone,
  Banknote,
  FileCheck,
  RefreshCw,
  TrendingUp,
  Archive,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function fetchApi(path: string, options?: RequestInit) {
  const url = `${API_URL.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

const actions = [
  {
    id: 'emergency',
    label: 'ÉMERGENCE',
    icon: AlertTriangle,
    color: 'bg-danger/10 text-danger hover:bg-danger/20',
    tooltip: 'Déclencher une urgence',
    api: 'POST /api/emergency',
    needsSelection: false,
  },
  {
    id: 'boost',
    label: 'BOOST',
    icon: Zap,
    color: 'bg-warning/10 text-warning hover:bg-warning/20',
    tooltip: 'Prioriser le chantier sélectionné',
    api: 'POST /api/boost',
    needsSelection: true,
  },
  {
    id: 'call',
    label: 'CALL TEAM',
    icon: Phone,
    color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400',
    tooltip: 'Appeler l’équipe',
    api: null,
    needsSelection: false,
  },
  {
    id: 'pay',
    label: 'PAY NOW',
    icon: Banknote,
    color: 'bg-success/10 text-success hover:bg-success/20',
    tooltip: 'Paiement instant',
    api: 'POST /api/paiements/instant',
    needsSelection: true,
  },
  {
    id: 'huissier',
    label: 'HUISSIER',
    icon: FileCheck,
    color: 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 dark:text-violet-400',
    tooltip: 'Certification huissier (PDF)',
    api: 'POST /api/huissier/certify',
    needsSelection: true,
  },
  {
    id: 'relance',
    label: 'RELANCE',
    icon: RefreshCw,
    color: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:text-orange-400',
    tooltip: 'Relancer fournisseurs',
    api: 'POST /api/relances',
    needsSelection: false,
  },
  {
    id: 'forecast',
    label: 'FORECAST',
    icon: TrendingUp,
    color: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:text-indigo-400',
    tooltip: 'Prédictions IA 7j',
    api: 'GET /api/ai/forecast',
    needsSelection: false,
  },
  {
    id: 'archive',
    label: 'ARCHIVER',
    icon: Archive,
    color: 'bg-muted text-muted-foreground hover:bg-muted/80',
    tooltip: 'Archiver le chantier sélectionné',
    api: 'POST /api/chantiers/:id/archive',
    needsSelection: true,
  },
] as const;

export function ExecutivePanel() {
  const selectedChantier = useDashboardStore((s) => s.selectedChantier);
  const [loading, setLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [payMontant, setPayMontant] = useState('');
  const [archiveConfirm, setArchiveConfirm] = useState(false);

  const hasSelection = !!selectedChantier;

  const runAction = useCallback(
    async (id: string) => {
      setLoading(id);
      try {
        switch (id) {
          case 'emergency':
            setModal('emergency');
            setLoading(null);
            return;
          case 'boost':
            if (!selectedChantier) {
              toast.error('Sélectionnez un chantier');
              return;
            }
            await fetchApi('/api/boost', {
              method: 'POST',
              body: JSON.stringify({ chantierId: selectedChantier }),
            });
            toast.success('Chantier priorisé');
            break;
          case 'call':
            toast.info('Liste équipes — WebRTC à brancher');
            break;
          case 'pay':
            setModal('pay');
            setLoading(null);
            return;
          case 'huissier':
            if (!selectedChantier) {
              toast.error('Sélectionnez un chantier');
              return;
            }
            await fetchApi('/api/huissier/certify', {
              method: 'POST',
              body: JSON.stringify({ chantierId: selectedChantier }),
            });
            toast.success('Certification demandée (PDF en cours)');
            break;
          case 'relance':
            setModal('relance');
            setLoading(null);
            return;
          case 'forecast':
            setModal('forecast');
            setLoading(null);
            return;
          case 'archive':
            if (!selectedChantier) {
              toast.error('Sélectionnez un chantier');
              return;
            }
            setModal('archive');
            setArchiveConfirm(false);
            setLoading(null);
            return;
          default:
            toast.info(`Action ${id} — API à brancher`);
        }
      } catch (e) {
        toast.error((e as Error).message ?? 'Erreur');
      } finally {
        setLoading(null);
      }
    },
    [selectedChantier]
  );

  const confirmEmergency = useCallback(async () => {
    setLoading('emergency');
    try {
      await fetchApi('/api/emergency', { method: 'POST', body: JSON.stringify({}) });
      toast.success('Urgence déclenchée');
      setModal(null);
    } catch (e) {
      toast.error((e as Error).message ?? 'Erreur');
    } finally {
      setLoading(null);
    }
  }, []);

  const confirmPay = useCallback(async () => {
    if (!selectedChantier) return;
    setLoading('pay');
    try {
      await fetchApi('/api/paiements/instant', {
        method: 'POST',
        body: JSON.stringify({ chantierId: selectedChantier, montant: Number(payMontant) || 0 }),
      });
      toast.success('Paiement initié');
      setModal(null);
      setPayMontant('');
    } catch (e) {
      toast.error((e as Error).message ?? 'Erreur');
    } finally {
      setLoading(null);
    }
  }, [selectedChantier, payMontant]);

  const confirmArchive = useCallback(async () => {
    if (!selectedChantier || !archiveConfirm) return;
    setLoading('archive');
    try {
      await fetchApi(`/api/chantiers/${selectedChantier}`, { method: 'DELETE' });
      toast.success('Chantier archivé');
      setModal(null);
      setArchiveConfirm(false);
    } catch (e) {
      toast.error((e as Error).message ?? 'Erreur');
    } finally {
      setLoading(null);
    }
  }, [selectedChantier, archiveConfirm]);

  return (
    <>
      <footer
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur',
          'flex items-center justify-center gap-2 px-4 py-2',
          'overflow-x-auto'
        )}
      >
        {actions.map(({ id, label, icon: Icon, color, tooltip, needsSelection }) => {
          const disabled = needsSelection && !hasSelection;
          return (
            <Button
              key={id}
              variant="ghost"
              size="sm"
              title={tooltip}
              disabled={disabled}
              onClick={() => runAction(id)}
              className={cn(
                'shrink-0 gap-1.5 font-medium',
                color,
                disabled && 'opacity-50'
              )}
              data-action={id}
            >
              {loading === id ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <span className="relative">
                  <Icon className="h-4 w-4 shrink-0" />
                  {id === 'emergency' && (
                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-danger-foreground">
                      0
                    </span>
                  )}
                </span>
              )}
              <span className="hidden sm:inline">{label}</span>
            </Button>
          );
        })}
      </footer>

      {/* Modal ÉMERGENCE */}
      {modal === 'emergency' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
          <div className="mx-4 w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
            <h3 className="font-semibold">Confirmer l&apos;urgence</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Déclencher une alerte urgence pour les équipes ?
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmEmergency}
                disabled={loading === 'emergency'}
              >
                {loading === 'emergency' ? 'Envoi…' : 'Déclencher'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal PAY NOW */}
      {modal === 'pay' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
          <div className="mx-4 w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
            <h3 className="font-semibold">Paiement instant</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Chantier : {selectedChantier ?? '—'}
            </p>
            <label className="mt-4 block text-sm font-medium">
              Montant (FCFA)
            </label>
            <input
              type="number"
              value={payMontant}
              onChange={(e) => setPayMontant(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="500000"
            />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => { setModal(null); setPayMontant(''); }}>
                Annuler
              </Button>
              <Button onClick={confirmPay} disabled={loading === 'pay' || !payMontant}>
                {loading === 'pay' ? 'Envoi…' : 'Payer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal RELANCE */}
      {modal === 'relance' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
          <div className="mx-4 w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
            <h3 className="font-semibold">Relancer fournisseurs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Multi-sélection fournisseurs — à brancher.
            </p>
            <Button className="mt-4" onClick={() => setModal(null)}>
              Fermer
            </Button>
          </div>
        </div>
      )}

      {/* Modal FORECAST */}
      {modal === 'forecast' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
          <div className="mx-4 w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h3 className="font-semibold">Prédictions IA 7j</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              GET /api/ai/forecast — à brancher.
            </p>
            <Button className="mt-4" onClick={() => setModal(null)}>
              Fermer
            </Button>
          </div>
        </div>
      )}

      {/* Modal ARCHIVER */}
      {modal === 'archive' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
          <div className="mx-4 w-full max-w-sm rounded-lg border bg-card p-6 shadow-lg">
            <h3 className="font-semibold">Archiver le chantier</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Chantier : {selectedChantier}
            </p>
            <label className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={archiveConfirm}
                onChange={(e) => setArchiveConfirm(e.target.checked)}
              />
              <span className="text-sm">Je confirme l&apos;archivage</span>
            </label>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setModal(null)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={confirmArchive}
                disabled={!archiveConfirm || loading === 'archive'}
              >
                {loading === 'archive' ? 'Envoi…' : 'Archiver'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
