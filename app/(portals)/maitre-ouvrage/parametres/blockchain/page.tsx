/**
 * Phase 4 — Blockchain traçabilité
 * Page Paramètres > Traçabilité blockchain : preuve d'existence (mock)
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Shield, Copy, Check, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Proof = {
  documentId: string;
  hash: string;
  blockNumber: string;
  timestamp: string;
  network: string;
  verified: boolean;
};

export default function BlockchainPage() {
  const [documentId, setDocumentId] = useState('BC-2026-001');
  const [proof, setProof] = useState<Proof | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchProof = useCallback(async () => {
    setLoading(true);
    setProof(null);
    try {
      const res = await fetch(`/api/blockchain/proof?documentId=${encodeURIComponent(documentId)}`);
      if (res.ok) {
        const data = await res.json();
        setProof(data);
      }
    } catch {
      setProof(null);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  const copyHash = useCallback(() => {
    if (!proof?.hash) return;
    navigator.clipboard.writeText(proof.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [proof?.hash]);

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8 px-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Traçabilité blockchain</h1>
        <p className="mt-1 text-sm text-slate-400">
          Phase 4 — Preuve d&apos;existence des documents (hash ancré en blockchain). Données mock pour démonstration.
        </p>
      </div>

      <section className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-200">
          <Shield className="h-5 w-5 text-emerald-400" />
          Preuve d&apos;existence
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Saisissez un identifiant de document pour récupérer sa preuve d&apos;ancrage (hash, bloc, horodatage).
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Ex. BC-2026-001"
            value={documentId}
            onChange={(e) => setDocumentId(e.target.value)}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 w-48"
          />
          <Button onClick={fetchProof} disabled={loading} size="sm" className="bg-emerald-600 hover:bg-emerald-500">
            {loading ? 'Chargement…' : 'Récupérer la preuve'}
          </Button>
        </div>

        {proof && (
          <div className="mt-6 rounded-lg border border-slate-600 bg-slate-800/50 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-slate-500">Document</span>
              <span className={cn('text-xs font-medium', proof.verified ? 'text-emerald-400' : 'text-amber-400')}>
                {proof.verified ? 'Vérifié' : 'Non vérifié'}
              </span>
            </div>
            <p className="font-mono text-sm text-slate-300">{proof.documentId}</p>
            <div>
              <span className="text-xs text-slate-500">Hash (ancré)</span>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-slate-900 px-2 py-1.5 text-xs text-slate-300">
                  {proof.hash}
                </code>
                <Button variant="ghost" size="sm" onClick={copyHash} className="shrink-0 text-slate-400 hover:text-slate-200">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Bloc : {proof.blockNumber}</span>
              <span>Réseau : {proof.network}</span>
              <span>Horodatage : {new Date(proof.timestamp).toLocaleString('fr-FR')}</span>
            </div>
          </div>
        )}

        <p className="mt-4 text-xs text-slate-500">
          En production : ancrage réel sur une blockchain (Ethereum, Tezos, ou réseau dédié) pour certificats, PV, BC.
        </p>
      </section>

      <p className="text-sm text-slate-500">
        <Link href="/maitre-ouvrage/parametres" className="text-sky-400 hover:underline inline-flex items-center gap-1">
          ← Retour Paramètres <ExternalLink className="h-3 w-3" />
        </Link>
      </p>
    </div>
  );
}
