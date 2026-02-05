/**
 * Conteneur global des modals du Dashboard (maître d'ouvrage).
 * Lit l'état modal du store et affiche KPIDrillDownModal, Shortcuts, etc.
 */

'use client';

import React, { useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDashboardCommandCenterStore } from '@/lib/stores/dashboardCommandCenterStore';
import { useAchievementsStore } from '@/lib/stores/achievementsStore';
import { KPIDrillDownModal } from './KPIDrillDownModal';
import { Button } from '@/components/ui/button';
import { zIndexClass } from '../utils/zIndex';
import { cn } from '@/lib/cn';

type KpiType = 'demandes' | 'validations' | 'budget' | 'other';

function inferKpiType(label: string): KpiType {
  const l = label.toLowerCase();
  if (l.includes('demande')) return 'demandes';
  if (l.includes('validation')) return 'validations';
  if (l.includes('budget')) return 'budget';
  return 'other';
}

type ExportFormat = 'csv' | 'json' | 'pdf' | 'excel';

function ExportModalDialog({ onClose }: { onClose: () => void }) {
  const nav = useDashboardCommandCenterStore((s) => s.navigation);
  const authHeaders = useAuthHeaders();
  const { locale, currency } = useI18n();
  const incrementExportCount = useAchievementsStore((s) => s.incrementExportCount);
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  const handleExport = useCallback(
    async (format: ExportFormat) => {
      const apiFormat = format === 'excel' ? 'xlsx' : format;
      const params = new URLSearchParams({
        main: nav.mainCategory || 'pilotage',
        format: apiFormat,
      });
      if (nav.subCategory) params.set('sub', nav.subCategory);
      if (nav.subSubCategory) params.set('leaf', nav.subSubCategory);
      if (apiFormat === 'xlsx' || apiFormat === 'pdf') {
        params.set('locale', locale);
        params.set('currency', currency);
      }
      setLoading(format);
      try {
        const res = await fetch(`/api/export/dashboard?${params.toString()}`, { headers: authHeaders });
        if (!res.ok) throw new Error('Export failed');
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const cd = res.headers.get('Content-Disposition') ?? '';
        const match = /filename="([^"]+)"/.exec(cd);
        a.href = url;
        a.download = match?.[1] ?? `export.${format === 'excel' ? 'xlsx' : format}`;
        a.click();
        URL.revokeObjectURL(url);
        onClose();
      } catch {
        setLoading(null);
      } finally {
        setLoading(null);
      }
    },
    [nav, authHeaders, locale, currency, onClose]
  );

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className={cn('fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm', zIndexClass('modal'))} role="dialog" aria-modal="true" aria-labelledby="dashboard-export-title">
      <div className="bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 id="dashboard-export-title" className="text-lg font-semibold text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-sky-400" />
            Exporter les données
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2">
          {(['csv', 'json', 'pdf', 'excel'] as const).map((f) => (
            <Button key={f} variant="outline" size="sm" className="border-slate-700" disabled={loading !== null} onClick={() => handleExport(f)}>
              {loading === f ? '…' : f.toUpperCase()}
            </Button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-700/50">
          <Button size="sm" variant="outline" onClick={onClose} className="w-full border-slate-700">Fermer</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function DashboardModals() {
  const modal = useDashboardCommandCenterStore((s) => s.modal);
  const closeModal = useDashboardCommandCenterStore((s) => s.closeModal);

  // Escape ferme le modal ouvert (WCAG, raccourcis clavier)
  useEffect(() => {
    if (!modal.isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [modal.isOpen, closeModal]);

  const kpiForDrillDown = useMemo(() => {
    if (modal.type !== 'kpi-drilldown' || !modal.data?.kpi) return null;
    const kpi = modal.data.kpi as { label: string; value: string | number; delta?: string; tone?: string; trend?: string; icon?: unknown };
    return {
      label: kpi.label ?? 'KPI',
      value: kpi.value ?? '—',
      type: inferKpiType(kpi.label ?? '') as KpiType,
    };
  }, [modal.type, modal.data]);

  if (!modal.isOpen || !modal.type) return null;

  // kpi-drilldown : modal détail KPI avec graphique
  if (modal.type === 'kpi-drilldown') {
    if (kpiForDrillDown && typeof document !== 'undefined') {
      return createPortal(
        <KPIDrillDownModal
          kpi={kpiForDrillDown}
          isOpen={true}
          onClose={closeModal}
          historicalData={modal.data?.historicalData as Array<{ date: string; value: number }> | undefined}
        />,
        document.body
      );
    }
    return null;
  }

  // export : choix du format (Phase 3 #23 — commandes vocales)
  if (modal.type === 'export') {
    return <ExportModalDialog onClose={closeModal} />;
  }

  // shortcuts : raccourcis clavier
  if (modal.type === 'shortcuts') {
    const shortcuts = [
      { key: '?', description: 'Afficher cette aide' },
      { key: 'Ctrl + K', description: 'Recherche globale' },
      { key: 'Ctrl + R', description: 'Actualiser les données' },
      { key: 'Ctrl + E', description: 'Exporter les données' },
      { key: 'Ctrl + Shift + F', description: 'Mode Focus (masquer menu et en-tête)' },
      { key: 'F11', description: 'Mode plein écran' },
      { key: 'Esc', description: 'Fermer le dialogue' },
    ];
    if (typeof document === 'undefined') return null;
    return createPortal(
      <div className={cn('fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm', zIndexClass('modal'))} role="dialog" aria-modal="true" aria-labelledby="dashboard-shortcuts-title">
        <div className="bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl w-full max-w-md max-h-[90vh] overflow-auto">
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h2 id="dashboard-shortcuts-title" className="text-lg font-semibold text-white">Raccourcis clavier</h2>
            <button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200" aria-label="Fermer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-2">
            {shortcuts.map((s) => (
              <div key={s.key} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0">
                <span className="text-sm text-slate-400">{s.description}</span>
                <kbd className="px-2 py-1 rounded bg-slate-800 text-xs text-slate-300 font-mono">{s.key}</kbd>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-700/50">
            <Button size="sm" variant="outline" onClick={closeModal} className="w-full border-slate-700">Fermer</Button>
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Placeholders pour les autres types (action-detail, risk-detail, decision-detail, calendar, agenda-details)
  const placeholderTitle: Record<string, string> = {
    'action-detail': 'Détail action',
    'action-details': 'Détail action',
    'risk-detail': 'Détail risque',
    'risk-details': 'Détail risque',
    'decision-detail': 'Détail décision',
    'decision-details': 'Détail décision',
    'calendar': 'Calendrier',
    'agenda-details': 'Détail agenda',
  };
  const title = placeholderTitle[modal.type] ?? 'Détail';
  if (typeof document === 'undefined') return null;
  return createPortal(
    <div className={cn('fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm', zIndexClass('modal'))} role="dialog" aria-modal="true" aria-labelledby="dashboard-modal-placeholder-title">
      <div className="bg-slate-900 rounded-xl border border-slate-700/50 shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 id="dashboard-modal-placeholder-title" className="text-lg font-semibold text-white">{title}</h2>
          <button type="button" onClick={closeModal} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200" aria-label="Fermer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 text-center">
          <p className="text-slate-400 text-sm">Vue en cours de développement</p>
          <Button size="sm" variant="outline" onClick={closeModal} className="mt-4 border-slate-700">Fermer</Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
