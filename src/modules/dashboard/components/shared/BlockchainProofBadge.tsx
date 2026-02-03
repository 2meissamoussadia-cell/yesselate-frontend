/**
 * Phase 4 — Blockchain traçabilité : badge preuve d'existence
 * Affiche un lien "Preuve blockchain" avec hash mock (appel GET /api/blockchain/proof)
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Shield, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlockchainProofBadgeProps {
  documentId: string;
  className?: string;
}

export function BlockchainProofBadge({ documentId, className }: BlockchainProofBadgeProps) {
  const [proof, setProof] = useState<{ hash: string; blockNumber: number; timestamp: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchProof = useCallback(async () => {
    if (proof) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blockchain/proof?documentId=${encodeURIComponent(documentId)}`);
      if (res.ok) {
        const data = await res.json();
        setProof({ hash: data.hash, blockNumber: data.blockNumber, timestamp: data.timestamp });
      }
    } finally {
      setLoading(false);
    }
  }, [documentId, proof]);

  const copyHash = useCallback(() => {
    if (!proof?.hash) return;
    navigator.clipboard.writeText(proof.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [proof]);

  return (
    <div className={cn('rounded-lg border border-slate-700/50 bg-slate-800/30 p-3', className)}>
      <button
        type="button"
        onClick={fetchProof}
        disabled={loading}
        className="flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100 transition-colors"
      >
        <Shield className="h-4 w-4 text-emerald-400" />
        <span>{proof ? 'Preuve de traçabilité' : 'Vérifier la preuve blockchain'}</span>
        {loading && <span className="text-xs text-slate-500">…</span>}
      </button>
      {proof && (
        <div className="mt-2 space-y-1 text-xs">
          <p className="font-mono text-slate-400 truncate" title={proof.hash}>
            Hash : {proof.hash.slice(0, 18)}…
          </p>
          <p className="text-slate-500">Bloc #{proof.blockNumber}</p>
          <button
            type="button"
            onClick={copyHash}
            className="flex items-center gap-1 text-sky-400 hover:text-sky-300"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copié' : 'Copier le hash'}
          </button>
        </div>
      )}
    </div>
  );
}
