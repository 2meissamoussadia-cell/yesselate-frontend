/**
 * Widget Prévisionnel Trésorerie 90j — Phase 2 audit ERP BTP 2026.
 * Inspiré Graneet / Vertuoza : courbe solde prévu, scénarios, seuil minimal, alertes tension.
 */

'use client';

import React, { useMemo, useState, memo, useRef, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Brush,
} from 'recharts';
import { TrendingUp, Mail, FileSpreadsheet, ZoomIn, Download } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportChartAsPng, exportChartAsSvg } from '@/modules/dashboard/charts/ChartKit/chartExportUtils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { formatMoneyCompact } from '@lib-root/dashboard/kpi';
import type { CashFlowPrevision, ScenarioTresorerie } from '../../types/tresoreriePrevisionnelle';
import {
  getTresoreriePrevisionnelleMock,
  SEUIL_TRESORERIE_MIN,
  getTensionsTresorerie,
} from '../../data/tresoreriePrevisionnelleMock';

const CURRENCY = 'XOF';

export interface TresoreriePrevisionnelleWidgetProps {
  /** Données 90j (si non fourni, mock utilisé) */
  previsions?: CashFlowPrevision[];
  /** Seuil minimal trésorerie (XOF) — alerte si solde &lt; seuil */
  seuilMinimal?: number;
  className?: string;
  /** Clic "Relancer créances > 30j" */
  onRelancerCreances?: () => void;
  /** Appelé après un export CSV réussi (pour historique session) */
  onExportSuccess?: () => void;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export type HorizonTresorerie = 30 | 60 | 90;

export const TresoreriePrevisionnelleWidget = memo(function TresoreriePrevisionnelleWidget({
  previsions: propPrevisions,
  seuilMinimal = SEUIL_TRESORERIE_MIN,
  className,
  onRelancerCreances,
  onExportSuccess,
}: TresoreriePrevisionnelleWidgetProps) {
  const [scenario, setScenario] = useState<ScenarioTresorerie>('realiste');
  const [horizon, setHorizon] = useState<HorizonTresorerie>(90);
  const [chartZoomed, setChartZoomed] = useState(false);

  const previsionsFull = useMemo(
    () => propPrevisions ?? getTresoreriePrevisionnelleMock(),
    [propPrevisions]
  );

  const previsions = useMemo(() => {
    if (horizon === 90) return previsionsFull;
    const startMs = new Date(previsionsFull[0]?.date ?? new Date()).getTime();
    const limitMs = startMs + horizon * 24 * 60 * 60 * 1000;
    return previsionsFull.filter((p) => new Date(p.date).getTime() <= limitMs);
  }, [previsionsFull, horizon]);

  const chartData = useMemo(() => {
    return previsions.map((p) => ({
      ...p,
      dateLabel: formatDateLabel(p.date),
      displayValue:
        scenario === 'optimiste'
          ? p.scenarios?.optimiste ?? p.soldePrevu
          : scenario === 'pessimiste'
            ? p.scenarios?.pessimiste ?? p.soldePrevu
            : p.soldePrevu,
    }));
  }, [previsions, scenario]);

  const tensions = useMemo(
    () => getTensionsTresorerie(previsions, seuilMinimal),
    [previsions, seuilMinimal]
  );

  const chartRef = useRef<HTMLDivElement>(null);
  const handleExportCsv = useCallback(() => {
    const header = 'Date;Solde prévu (XOF);Scénario\n';
    const rows = chartData.map((p) => `${p.date};${p.displayValue};${scenario}`).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tresorerie-previsionnelle-90j-${scenario}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Export CSV réussi', {
      description: `Fichier téléchargé : tresorerie-previsionnelle-90j-${scenario}.csv`,
      duration: 3000,
    });
    onExportSuccess?.();
  }, [chartData, scenario, onExportSuccess]);

  const handleExportPng = useCallback(() => {
    if (!chartRef.current) return;
    exportChartAsPng(chartRef.current, `tresorerie-previsionnelle-90j-${scenario}`);
    toast.success('Export PNG réussi');
  }, [scenario]);

  const handleExportSvg = useCallback(() => {
    if (!chartRef.current) return;
    exportChartAsSvg(chartRef.current, `tresorerie-previsionnelle-90j-${scenario}`);
    toast.success('Export SVG réussi');
  }, [scenario]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0].payload;
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900">
        <p className="font-medium text-slate-800 dark:text-slate-200">{p.dateLabel}</p>
        <p className="text-slate-600 dark:text-slate-400">
          Solde prévu : <span className="text-emerald-600 dark:text-emerald-400 font-medium">{formatMoneyCompact(p.displayValue, CURRENCY)}</span>
        </p>
        {p.soldePrevu < seuilMinimal && (
          <p className="text-rose-600 dark:text-rose-400 mt-1">Sous seuil minimal</p>
        )}
      </div>
    );
  };

  return (
    <div
      className={`rounded-xl border border-slate-700/60 bg-slate-900/60 overflow-hidden ${className ?? ''}`}
    >
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-900/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden />
          <h3 className="text-sm font-semibold text-slate-100">Prévisionnel Trésorerie J+30/60/90</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={String(horizon)} onValueChange={(v) => setHorizon(Number(v) as HorizonTresorerie)}>
            <SelectTrigger
              className="w-[100px] rounded-lg border-slate-300 bg-slate-100 px-2 py-1.5 min-h-[44px] text-[11px] text-slate-800 focus:ring-sky-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Horizon prévisionnel"
            >
              <SelectValue placeholder="Horizon" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <SelectItem value="30" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:text-slate-100">J+30</SelectItem>
              <SelectItem value="60" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:text-slate-100">J+60</SelectItem>
              <SelectItem value="90" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:text-slate-100">J+90</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => setChartZoomed((z) => !z)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-2 py-1.5 min-h-[44px] text-[11px] text-slate-700 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700/60"
            aria-label={chartZoomed ? 'Réduire le graphique' : 'Agrandir le graphique'}
          >
            <ZoomIn className="h-3.5 w-3.5" aria-hidden />
            {chartZoomed ? 'Réduire' : 'Zoom'}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-100 px-2 py-1.5 min-h-[44px] text-[11px] text-slate-700 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700/60"
                aria-label="Exporter le graphique"
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
                Export
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <DropdownMenuItem onClick={handleExportCsv} className="text-slate-800 dark:text-slate-200">
                CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPng} className="text-slate-800 dark:text-slate-200">
                PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportSvg} className="text-slate-800 dark:text-slate-200">
                SVG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Select value={scenario} onValueChange={(v) => setScenario(v as ScenarioTresorerie)}>
            <SelectTrigger
              className="w-[180px] rounded-lg border-slate-300 bg-slate-100 px-2 py-1.5 min-h-[44px] text-[11px] text-slate-800 focus:ring-sky-500/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              aria-label="Scénario trésorerie"
            >
              <SelectValue placeholder="Scénario" />
            </SelectTrigger>
            <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
              <SelectItem value="realiste" className="text-slate-200 focus:bg-slate-800 focus:text-slate-100">
                Scénario réaliste
              </SelectItem>
              <SelectItem value="optimiste" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:text-slate-100">
                Scénario optimiste
              </SelectItem>
              <SelectItem value="pessimiste" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900 dark:text-slate-200 dark:focus:bg-slate-800 dark:focus:text-slate-100">
                Scénario pessimiste
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-4" ref={chartRef}>
        <div className="h-[200px] w-full min-h-[120px]" role="img" aria-label={`Graphique prévisionnel trésorerie J+${horizon}, solde prévu et seuil minimal`} style={{ minHeight: 120 }}>
          <ResponsiveContainer width="100%" height={200} minHeight={120}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} aria-hidden="true">
              <defs>
                <linearGradient id="areaSoldePositif" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaSoldeNegatif" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={{ stroke: '#475569' }}
                label={{ value: 'Date', position: 'insideBottom', offset: -4, fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatMoneyCompact(v, CURRENCY)}
                width={56}
                label={{ value: 'Solde (XOF)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={seuilMinimal}
                stroke="#ef4444"
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{ value: 'Seuil minimal', position: 'right', fill: '#94a3b8', fontSize: 10 }}
              />
              <Area
                type="monotone"
                dataKey="displayValue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#areaSoldePositif)"
                name="Solde prévu"
              />
              {chartData.length > 20 && (
                <Brush
                  dataKey="dateLabel"
                  height={20}
                  stroke="#10b981"
                  fill="rgba(16, 185, 129, 0.08)"
                  tickFormatter={() => ''}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-[10px] text-slate-400" role="list" aria-label="Légende du graphique">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-emerald-400 rounded" aria-hidden />
            Solde prévu (courbe)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-400 rounded" aria-hidden />
            Seuil minimal ({formatMoneyCompact(seuilMinimal, CURRENCY)})
          </span>
        </div>

        {tensions.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-medium text-rose-400">Tensions trésorerie prévues</p>
            {tensions.slice(0, 3).map((t, i) => (
              <div
                key={t.date}
                className="flex items-start gap-3 rounded-lg bg-rose-900/20 border border-rose-800/40 p-2 text-[11px]"
              >
                <span className="text-rose-500 shrink-0">⚠️</span>
                <div>
                  <p className="font-medium text-rose-300">
                    Tension le {formatDateLabel(t.date)}
                  </p>
                  <p className="text-slate-400">
                    Solde prévu : {formatMoneyCompact(t.soldePrevu, CURRENCY)}
                    {' · '}
                    <button
                      type="button"
                      className="text-sky-400 hover:underline"
                      onClick={onRelancerCreances}
                    >
                      Voir actions possibles
                    </button>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {onRelancerCreances && (
            <button
              type="button"
              onClick={onRelancerCreances}
              aria-label="Relancer les créances de plus de 30 jours"
              className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600/80 px-3 py-2 min-h-[44px] text-[11px] font-medium text-white hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              Relancer créances &gt; 30j
            </button>
          )}
          <button
            type="button"
            aria-label="Simuler les scénarios"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 bg-slate-800/60 px-3 py-2 min-h-[44px] text-[11px] text-slate-300 hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden />
            Simuler scénarios
          </button>
        </div>
      </div>
    </div>
  );
});
