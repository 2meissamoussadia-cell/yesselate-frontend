/**
 * Rapport DG — téléchargement PDF/Excel
 * Rapport auto-généré chaque lundi matin : Top 5 chantiers risque, Budget vs réel, graphiques évolution.
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Download, FileText, FileSpreadsheet, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DashboardPageLayout,
  DashboardSection,
  DashboardPanel,
} from '../shared';
import { cn } from '@/lib/utils';

interface DGReportData {
  generatedAt: string;
  top5Risks: Array<{
    id: string;
    severity: string;
    score: number;
    title: string;
    detail: string;
    source: string;
    trend: string;
    createdAt: string;
  }>;
  budgetVsReel: {
    budget: number;
    reel: number;
    ecart: number;
    ecartPct: number;
    unit: string;
  };
  evolution: Array<{
    mois: string;
    demandes: number;
    validations: number;
    budget: number;
  }>;
}

export function RapportDGPage() {
  const [data, setData] = useState<DGReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<'pdf' | 'xlsx' | null>(null);

  useEffect(() => {
    fetch('/api/reports/dg?format=json')
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (format: 'pdf' | 'xlsx') => {
    setDownloading(format);
    try {
      const res = await fetch(`/api/reports/dg?format=${format}`);
      if (!res.ok) throw new Error(res.statusText);
      const blob = await res.blob();
      const cd = res.headers.get('Content-Disposition') ?? '';
      const match = /filename="([^"]+)"/.exec(cd);
      const filename = match?.[1] ?? `rapport-dg-${new Date().toISOString().slice(0, 10)}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur téléchargement');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <DashboardPageLayout>
        <DashboardSection title="Rapport DG" subtitle="Chargement…">
          <div className="py-12 text-center text-slate-400">Chargement du rapport…</div>
        </DashboardSection>
      </DashboardPageLayout>
    );
  }

  if (error && !data) {
    return (
      <DashboardPageLayout>
        <DashboardSection title="Rapport DG" subtitle="Erreur">
          <div className="py-12 text-center text-red-400">{error}</div>
        </DashboardSection>
      </DashboardPageLayout>
    );
  }

  const b = data?.budgetVsReel;
  const top5 = data?.top5Risks ?? [];

  return (
    <DashboardPageLayout>
      <DashboardSection
        title="Rapport DG"
        subtitle="Rapport hebdo/mensuel Direction Générale"
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-slate-700"
              onClick={() => handleDownload('pdf')}
              disabled={!!downloading}
            >
              <FileText className="h-4 w-4" />
              {downloading === 'pdf' ? 'Téléchargement…' : 'Exporter PDF'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-slate-700"
              onClick={() => handleDownload('xlsx')}
              disabled={!!downloading}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {downloading === 'xlsx' ? 'Téléchargement…' : 'Exporter Excel (graphiques)'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 flex items-start gap-3">
            <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-200">Rapport auto-généré chaque lundi matin</p>
              <p className="text-xs text-slate-400 mt-1">
                Contenu : Top 5 chantiers à risque, Budget vs Réel, graphiques d&apos;évolution.
              </p>
            </div>
          </div>

          {data && (
            <>
              {b && (
                <DashboardSection title="Budget vs Réel" icon={TrendingUp}>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Budget</p>
                      <p className="text-lg font-semibold text-slate-200">{b.budget} {b.unit}</p>
                    </div>
                    <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Réel</p>
                      <p className="text-lg font-semibold text-slate-200">{b.reel} {b.unit}</p>
                    </div>
                    <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Écart</p>
                      <p className={cn('text-lg font-semibold', b.ecart >= 0 ? 'text-emerald-400' : 'text-amber-400')}>
                        {b.ecart} {b.unit}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3">
                      <p className="text-xs text-slate-400 uppercase tracking-wider">Écart %</p>
                      <p className={cn('text-lg font-semibold', b.ecartPct >= 0 ? 'text-emerald-400' : 'text-amber-400')}>
                        {b.ecartPct.toFixed(1)} %
                      </p>
                    </div>
                  </div>
                </DashboardSection>
              )}

              {top5.length > 0 && (
                <DashboardSection title="Top 5 chantiers à risque" icon={AlertTriangle}>
                  <div className="space-y-2">
                    {top5.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between gap-4 py-2 px-3 rounded-lg border border-slate-800/60 bg-slate-900/40"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{r.title}</p>
                          <p className="text-xs text-slate-400 truncate">{r.detail}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-0.5 rounded',
                              r.severity === 'critical' && 'bg-red-500/20 text-red-300',
                              r.severity === 'warning' && 'bg-amber-500/20 text-amber-300'
                            )}
                          >
                            {r.severity}
                          </span>
                          <span className="text-sm font-mono text-slate-400">{r.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </DashboardSection>
              )}

              <p className="text-xs text-slate-400">
                Généré le {data.generatedAt ? new Date(data.generatedAt).toLocaleString('fr-FR') : '—'}
              </p>
            </>
          )}
        </div>
      </DashboardSection>
    </DashboardPageLayout>
  );
}
