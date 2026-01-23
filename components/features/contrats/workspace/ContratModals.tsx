'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { contractsToSign } from '@/lib/data';
import { useValidationContratsWorkspaceStore } from '@/lib/stores/validationContratsWorkspaceStore';
import { useContratToast } from './ContratToast';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';

import {
  X,
  BarChart2,
  Download,
  HelpCircle,
  FileText,
  Shield,
  Signature,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Scale,
  Workflow,
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Building2,
  ChevronRight,
  ArrowRight,
  Hash,
} from 'lucide-react';

// ================================
// Utils
// ================================
const parseMoney = (v: unknown): number => {
  if (typeof v === 'number') return v;
  const raw = String(v ?? '').replace(/\s/g, '').replace(/FCFA|XOF/gi, '').replace(/[^\d,.-]/g, '');
  return Number(raw.replace(/,/g, '')) || 0;
};

const formatFCFA = (v: number): string => {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)} Mrd`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} M`;
  return `${v.toLocaleString('fr-FR')} F`;
};

// ================================
// Modal Base
// ================================
interface ModalBaseProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

function ModalBase({ open, title, onClose, children, maxWidth = 'max-w-3xl' }: ModalBaseProps) {
  if (!open) return null;
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            'w-full rounded-2xl border border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-2xl',
            'dark:border-slate-700 dark:bg-slate-900/95',
            'max-h-[85vh] overflow-hidden',
            maxWidth
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 px-6 py-4 dark:border-slate-700">
            <h2 className="font-semibold text-lg">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-auto max-h-[calc(85vh-72px)]">
            {children}
          </div>
        </motion.div>
      </div>
    </div>,
    document.body
  );
}

// ================================
// Stats Modal
// ================================
export function ContratStatsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const stats = useMemo(() => {
    const contracts = contractsToSign;
    const total = contracts.length;
    const pending = contracts.filter((c) => c.status === 'pending').length;
    const validated = contracts.filter((c) => c.status === 'validated').length;
    const totalAmount = contracts.reduce((sum, c) => sum + parseMoney((c as any).amount), 0);
    
    const byType = {
      marche: contracts.filter((c) => (c as any).type === 'Marché').length,
      avenant: contracts.filter((c) => (c as any).type === 'Avenant').length,
      st: contracts.filter((c) => (c as any).type === 'Sous-traitance').length,
    };

    return { total, pending, validated, totalAmount, byType };
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <ModalBase open={open} title="📊 Statistiques contrats" onClose={onClose}>
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-700/50">
                <FileText className="w-6 h-6 text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-slate-500">Total</div>
              </div>
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200/50 dark:border-amber-700/50">
                <Clock className="w-6 h-6 text-amber-500 mb-2" />
                <div className="text-2xl font-bold">{stats.pending}</div>
                <div className="text-xs text-slate-500">En attente</div>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-700/50">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mb-2" />
                <div className="text-2xl font-bold">{stats.validated}</div>
                <div className="text-xs text-slate-500">Validés</div>
              </div>
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/30 border border-purple-200/50 dark:border-purple-700/50">
                <DollarSign className="w-6 h-6 text-purple-500 mb-2" />
                <div className="text-2xl font-bold text-amber-600">{formatFCFA(stats.totalAmount)}</div>
                <div className="text-xs text-slate-500">Volume</div>
              </div>
            </div>

            {/* Par type */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold mb-4">Répartition par type</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-900">
                  <div className="text-3xl mb-2">📋</div>
                  <div className="text-xl font-bold">{stats.byType.marche}</div>
                  <div className="text-xs text-slate-500">Marchés</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-900">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-xl font-bold">{stats.byType.avenant}</div>
                  <div className="text-xs text-slate-500">Avenants</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-white dark:bg-slate-900">
                  <div className="text-3xl mb-2">🤝</div>
                  <div className="text-xl font-bold">{stats.byType.st}</div>
                  <div className="text-xs text-slate-500">Sous-traitance</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <FluentButton variant="secondary" onClick={onClose}>
                Fermer
              </FluentButton>
            </div>
          </div>
        </ModalBase>
      )}
    </AnimatePresence>
  );
}

// ================================
// Export Modal
// ================================
export function ContratExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useContratToast();
  const [format, setFormat] = useState<'csv' | 'xlsx' | 'pdf' | 'json'>('csv');
  const [scope, setScope] = useState<'all' | 'filtered' | 'selected'>('all');
  const [includeAudit, setIncludeAudit] = useState(true);
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    
    // Simuler export
    await new Promise((r) => setTimeout(r, 1500));
    
    const filename = `contrats_export_${new Date().toISOString().slice(0, 10)}.${format}`;
    toast.success('Export réussi', `Fichier ${filename} généré`);
    
    setExporting(false);
    onClose();
  }, [format, toast, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <ModalBase open={open} title="📦 Exporter les contrats" onClose={onClose}>
          <div className="space-y-6">
            {/* Format */}
            <div>
              <label className="block text-sm font-medium mb-2">Format d'export</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'csv', label: 'CSV', desc: 'Excel compatible' },
                  { id: 'xlsx', label: 'Excel', desc: 'Formaté' },
                  { id: 'pdf', label: 'PDF', desc: 'Rapport' },
                  { id: 'json', label: 'JSON', desc: 'Données' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id as any)}
                    className={cn(
                      'p-3 rounded-xl border-2 text-center transition-colors',
                      format === f.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300',
                    )}
                  >
                    <div className="font-medium">{f.label}</div>
                    <div className="text-xs text-slate-500">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Scope */}
            <div>
              <label className="block text-sm font-medium mb-2">Périmètre</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="all">Tous les contrats</option>
                <option value="filtered">Contrats filtrés</option>
                <option value="selected">Sélection uniquement</option>
              </select>
            </div>

            {/* Options */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeAudit"
                checked={includeAudit}
                onChange={(e) => setIncludeAudit(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300"
              />
              <label htmlFor="includeAudit" className="text-sm">
                Inclure le manifest d'audit (hash SHA-256 chaîné)
              </label>
            </div>

            {includeAudit && (
              <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 text-sm">
                  <Hash className="w-4 h-4" />
                  <span>L'export inclura un fichier .manifest.json avec les hashes d'intégrité</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <FluentButton variant="secondary" onClick={onClose}>
                Annuler
              </FluentButton>
              <FluentButton variant="primary" onClick={handleExport} disabled={exporting}>
                <Download className="w-4 h-4 mr-2" />
                {exporting ? 'Export en cours...' : 'Exporter'}
              </FluentButton>
            </div>
          </div>
        </ModalBase>
      )}
    </AnimatePresence>
  );
}

// ================================
// Decision Center Modal
// ================================
export function ContratDecisionCenterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { openTab } = useValidationContratsWorkspaceStore();
  const toast = useContratToast();

  const stats = useMemo(() => {
    const contracts = contractsToSign;
    return {
      pendingBJ: contracts.filter((c) => c.status === 'pending').length,
      pendingBMO: 2, // Simulé
      urgent: 2,
      highRisk: 1,
    };
  }, []);

  const handleOpenQueue = (queue: string, title: string, icon: string) => {
    openTab({
      id: `inbox:${queue}`,
      type: 'inbox',
      title,
      icon,
      data: { queue },
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <ModalBase open={open} title="⚖️ Centre de décision — Direction" onClose={onClose} maxWidth="max-w-4xl">
          <div className="space-y-6">
            {/* Message direction */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200/50 dark:border-purple-700/50">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                Arbitrages en attente
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                En tant que Direction, vous avez la responsabilité de débloquer les situations et de 
                prendre les décisions finales. Chaque action est tracée et signée cryptographiquement.
              </p>
            </div>

            {/* Files prioritaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleOpenQueue('pending_bj', 'Validation BJ', '🔐')}
                className="p-4 rounded-xl border border-amber-200/70 bg-amber-50/80 dark:border-amber-700/50 dark:bg-amber-900/30 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-amber-600" />
                    <span className="font-semibold">Validation BJ requise</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-200 text-amber-800 text-sm font-bold">
                    {stats.pendingBJ}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Contrats en attente de validation juridique
                </p>
                <div className="flex items-center gap-1 text-amber-600 text-sm mt-2">
                  <span>Ouvrir</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={() => handleOpenQueue('pending_bmo', 'Signature BMO', '✍️')}
                className="p-4 rounded-xl border border-purple-200/70 bg-purple-50/80 dark:border-purple-700/50 dark:bg-purple-900/30 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Signature className="w-6 h-6 text-purple-600" />
                    <span className="font-semibold">Signature Direction</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-200 text-purple-800 text-sm font-bold">
                    {stats.pendingBMO}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Contrats validés par BJ, en attente de signature
                </p>
                <div className="flex items-center gap-1 text-purple-600 text-sm mt-2">
                  <span>Ouvrir</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={() => handleOpenQueue('urgent', 'Urgents', '🔥')}
                className="p-4 rounded-xl border border-rose-200/70 bg-rose-50/80 dark:border-rose-700/50 dark:bg-rose-900/30 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                    <span className="font-semibold">Urgents</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-200 text-rose-800 text-sm font-bold">
                    {stats.urgent}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Échéance dans moins de 7 jours
                </p>
                <div className="flex items-center gap-1 text-rose-600 text-sm mt-2">
                  <span>Traiter</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>

              <button
                onClick={() => handleOpenQueue('high_risk', 'Risque élevé', '⚠️')}
                className="p-4 rounded-xl border border-orange-200/70 bg-orange-50/80 dark:border-orange-700/50 dark:bg-orange-900/30 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Scale className="w-6 h-6 text-orange-600" />
                    <span className="font-semibold">Risque élevé</span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-orange-200 text-orange-800 text-sm font-bold">
                    {stats.highRisk}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Score de risque ≥ 70 - Attention requise
                </p>
                <div className="flex items-center gap-1 text-orange-600 text-sm mt-2">
                  <span>Arbitrer</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Workflow RACI */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Workflow className="w-5 h-5 text-slate-400" />
                Workflow de validation (2-man rule)
              </h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-2">
                      <Shield className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-xs font-medium">BJ</div>
                    <div className="text-xs text-slate-500">Responsable (R)</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-300" />
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-2">
                      <Signature className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-xs font-medium">BMO</div>
                    <div className="text-xs text-slate-500">Accountable (A)</div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-300" />
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-xs font-medium">Signé</div>
                    <div className="text-xs text-slate-500">Tracé & hashé</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <FluentButton variant="secondary" onClick={onClose}>
                Fermer
              </FluentButton>
            </div>
          </div>
        </ModalBase>
      )}
    </AnimatePresence>
  );
}

// ================================
// Help Modal
// ================================
export function ContratHelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <ModalBase open={open} title="❓ Aide & Raccourcis" onClose={onClose}>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Raccourcis clavier</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { key: 'Ctrl+K', desc: 'Palette de commandes' },
                  { key: 'Ctrl+N', desc: 'Nouveau contrat' },
                  { key: 'Ctrl+D', desc: 'Centre de décision' },
                  { key: 'Ctrl+S', desc: 'Statistiques' },
                  { key: 'Ctrl+E', desc: 'Exporter' },
                  { key: 'Ctrl+1', desc: 'Contrats urgents' },
                  { key: 'Ctrl+W', desc: 'Fermer l\'onglet' },
                  { key: 'Alt+←/→', desc: 'Navigation' },
                  { key: 'Escape', desc: 'Fermer modale' },
                  { key: 'Shift+?', desc: 'Aide' },
                ].map((shortcut) => (
                  <div key={shortcut.key} className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">{shortcut.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-xs">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Workflow de validation</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Chaque contrat passe par un workflow en 2 étapes (2-man rule) :
              </p>
              <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-400 mt-2 space-y-1">
                <li><strong>Validation BJ</strong> : Le Bureau Juridique vérifie la conformité légale</li>
                <li><strong>Signature BMO</strong> : La Direction signe après validation BJ</li>
              </ol>
            </div>

            <div className="flex justify-end">
              <FluentButton variant="primary" onClick={onClose}>
                Compris
              </FluentButton>
            </div>
          </div>
        </ModalBase>
      )}
    </AnimatePresence>
  );
}

