/**
 * Phase 6 — Pointage QR ouvrier (anti-fraude)
 * UI mock : bouton "Scanner QR" → résultat simulé (ouvrier pointé sur chantier).
 */

'use client';

import React, { useState } from 'react';
import { QrCode, UserCheck, Building2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { colors } from '../../utils/dashboardDesignTokens';

const MOCK_POINTAGE = {
  ouvrierId: 'OVR-127',
  nom: 'M. Diallo',
  chantierId: 'RENOV-042',
  chantierLabel: 'Rénovation Thiès — Phase 4',
  heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  date: new Date().toLocaleDateString('fr-FR'),
  statut: 'validé' as const,
};

export function CockpitPointageQRPanel() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<typeof MOCK_POINTAGE | null>(null);

  const handleScan = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setScanning(false);
      setResult({ ...MOCK_POINTAGE, heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) });
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-4 font-semibold text-sm transition-all',
            colors.border.accent,
            'bg-slate-800/60 text-slate-100 hover:bg-slate-700/60 hover:border-slate-600',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50',
            scanning && 'opacity-70 cursor-wait'
          )}
        >
          <QrCode className="h-6 w-6" />
          {scanning ? 'Scan en cours…' : 'Scanner QR pointage'}
        </button>
        <p className="text-xs text-slate-400 self-center">
          Simule un pointage ouvrier sur chantier (mock Phase 6).
        </p>
      </div>

      {scanning && (
        <div className={cn('rounded-xl border py-8 flex flex-col items-center justify-center', colors.border.default, colors.bg.tertiary)}>
          <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-amber-500/50 flex items-center justify-center animate-pulse">
            <QrCode className="h-8 w-8 text-amber-400" />
          </div>
          <p className="mt-3 text-sm text-slate-400">Placez le QR code dans le cadre…</p>
        </div>
      )}

      {result && !scanning && (
        <div className={cn('rounded-xl border p-4', colors.border.default, colors.bg.secondary)}>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-3">
            <UserCheck className="h-4 w-4" />
            Pointage enregistré
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="text-slate-400 shrink-0">Ouvrier</span>
              <span className="text-slate-200 font-medium">{result.ouvrierId} — {result.nom}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="text-slate-400 shrink-0">Chantier</span>
              <span className="text-slate-200 font-medium">{result.chantierId}</span>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Clock className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="text-slate-400 shrink-0">Heure</span>
              <span className="text-slate-200 font-medium">{result.heure} · {result.date}</span>
            </div>
          </dl>
          <p className="mt-2 text-xs text-slate-500">{result.chantierLabel}</p>
        </div>
      )}

      {!result && !scanning && (
        <div className={cn('rounded-xl border border-dashed py-8 flex flex-col items-center justify-center', colors.border.default)}>
          <QrCode className="h-10 w-10 text-slate-600 mb-2" />
          <p className="text-sm text-slate-500">Aucun pointage récent. Cliquez sur « Scanner QR pointage ».</p>
        </div>
      )}
    </div>
  );
}
