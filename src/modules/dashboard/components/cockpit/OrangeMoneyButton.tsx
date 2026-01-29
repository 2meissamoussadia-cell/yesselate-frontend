/**
 * Phase 6 — Bouton PAY NOW Orange Money (sandbox / réel).
 * Paiement instantané XOF → /api/paiements/orange-money puis PATCH chantier payé.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { ChantierMock } from '../../data/chantiersMock';

export function formatCFA(montant: number): string {
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(1)}M XOF`;
  return `${(montant / 1000).toFixed(0)}k XOF`;
}

export interface OrangeMoneyButtonProps {
  chantierId: string;
  montant: number;
  /** Téléphone client (défaut démo 221778123456) */
  customerPhone?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function OrangeMoneyButton({
  chantierId,
  montant,
  customerPhone = '221778123456',
  onSuccess,
  onError,
  className = '',
}: OrangeMoneyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const handlePayNow = useCallback(async () => {
    setLoading(true);
    setTransactionId(null);
    try {
      const response = await fetch('/api/paiements/orange-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: montant,
          currency: 'XOF',
          customer: { phone: customerPhone },
          reference: `PAY-${chantierId}-${Date.now()}`,
        }),
      });

      const result = await response.json();

      if (result.status === 'SUCCESS' || result.ok) {
        const txnId = result.transactionId ?? result.id ?? `mock-${Date.now()}`;
        setTransactionId(txnId);

        await fetch(`/api/chantiers/${chantierId}/paye`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId: txnId }),
        }).catch(() => {});

        try {
          new Audio('/sounds/cash-register.mp3').play().catch(() => {});
        } catch {
          // pas de son si fichier absent
        }
        toast.success('Paiement Orange Money effectué', {
          description: `TXN: ${String(txnId).slice(-8)}`,
        });
        onSuccess?.(txnId);
      } else {
        const err = new Error(result.message ?? result.error ?? 'Paiement refusé');
        toast.error('Orange Money', { description: err.message });
        onError?.(err);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Erreur réseau');
      toast.error('Orange Money', { description: err.message });
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [chantierId, montant, customerPhone, onSuccess, onError]);

  return (
    <div className={className}>
      <button
        type="button"
        disabled={loading}
        onClick={handlePayNow}
        className={
          loading
            ? 'px-6 py-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-gray-600 to-gray-700 animate-pulse text-white cursor-not-allowed'
            : 'px-6 py-3 rounded-xl font-bold text-sm transition-all bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-green-500/25 text-white'
        }
      >
        {loading ? '⏳ PAIEMENT...' : `💰 PAY ${formatCFA(montant)}`}
      </button>
      {transactionId && (
        <div className="mt-2 text-xs bg-green-500/20 text-green-200 p-2 rounded-lg">
          ✅ TXN: {String(transactionId).slice(-8)}
        </div>
      )}
    </div>
  );
}
