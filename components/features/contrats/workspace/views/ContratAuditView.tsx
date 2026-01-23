'use client';

import React, { useMemo, useState } from 'react';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import {
  History,
  Search,
  Download,
  Filter,
  Calendar,
  User,
  FileText,
  Shield,
  Signature,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Hash,
  RefreshCw,
} from 'lucide-react';

// Types
interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'validate_bj' | 'sign_bmo' | 'reject' | 'view' | 'export' | 'modify';
  actor: string;
  actorRole: string;
  targetId: string;
  targetType: string;
  targetLabel: string;
  details?: string;
  hash?: string;
  bureau: string;
}

// Mock audit data
const mockAuditData: AuditEntry[] = [
  {
    id: 'AUD-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    action: 'sign_bmo',
    actor: 'A. DIALLO',
    actorRole: 'Directeur Général',
    targetId: 'CTR-2025-0089',
    targetType: 'Contrat',
    targetLabel: 'Contrat cadre fournitures électriques',
    details: 'Signature BMO avec validation BJ préalable',
    hash: 'SHA256:A3F2B1C4...',
    bureau: 'BMO',
  },
  {
    id: 'AUD-002',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    action: 'validate_bj',
    actor: 'N. FAYE',
    actorRole: 'Juriste Senior',
    targetId: 'CTR-2025-0089',
    targetType: 'Contrat',
    targetLabel: 'Contrat cadre fournitures électriques',
    details: 'Validation juridique conforme',
    hash: 'SHA256:B7D9E2F1...',
    bureau: 'BJ',
  },
  {
    id: 'AUD-003',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    action: 'view',
    actor: 'M. BA',
    actorRole: 'Chef de Bureau',
    targetId: 'CTR-2025-0088',
    targetType: 'Contrat',
    targetLabel: 'Avenant n°2 - Extension délais PRJ-0017',
    bureau: 'BM',
  },
  {
    id: 'AUD-004',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    action: 'create',
    actor: 'N. FAYE',
    actorRole: 'Juriste Senior',
    targetId: 'CTR-2025-0090',
    targetType: 'Contrat',
    targetLabel: 'Nouveau marché construction',
    details: 'Création initiale',
    bureau: 'BJ',
  },
  {
    id: 'AUD-005',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    action: 'reject',
    actor: 'A. DIALLO',
    actorRole: 'Directeur Général',
    targetId: 'CTR-2025-0085',
    targetType: 'Contrat',
    targetLabel: 'Contrat maintenance',
    details: 'Clauses non conformes - retour BJ pour révision',
    bureau: 'BMO',
  },
  {
    id: 'AUD-006',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    action: 'export',
    actor: 'F. DIOP',
    actorRole: 'Contrôleur',
    targetId: 'BATCH-2025-001',
    targetType: 'Export',
    targetLabel: 'Export audit mensuel',
    details: '45 contrats exportés avec manifest',
    hash: 'SHA256:C8E3F4A2...',
    bureau: 'BF',
  },
];

const ACTION_CONFIG = {
  create: { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Création' },
  validate_bj: { icon: Shield, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Validation BJ' },
  sign_bmo: { icon: Signature, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: 'Signature BMO' },
  reject: { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30', label: 'Rejet' },
  view: { icon: Eye, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800', label: 'Consultation' },
  export: { icon: Download, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Export' },
  modify: { icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30', label: 'Modification' },
};

export function ContratAuditView({ tabId }: { tabId: string }) {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');

  const filtered = useMemo(() => {
    let data = mockAuditData;
    
    if (filterAction !== 'all') {
      data = data.filter((e) => e.action === filterAction);
    }
    
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((e) => 
        e.actor.toLowerCase().includes(q) ||
        e.targetId.toLowerCase().includes(q) ||
        e.targetLabel.toLowerCase().includes(q) ||
        (e.hash?.toLowerCase().includes(q) ?? false)
      );
    }
    
    return data;
  }, [search, filterAction]);

  const stats = useMemo(() => ({
    total: mockAuditData.length,
    signatures: mockAuditData.filter((e) => e.action === 'sign_bmo').length,
    validations: mockAuditData.filter((e) => e.action === 'validate_bj').length,
    rejets: mockAuditData.filter((e) => e.action === 'reject').length,
  }), []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <History className="w-5 h-5 text-slate-500" />
            Journal d'audit
          </h2>
          <p className="text-sm text-slate-500">
            Traçabilité complète des actions sur les contrats
          </p>
        </div>
        <div className="flex items-center gap-2">
          <FluentButton variant="secondary" size="sm">
            <RefreshCw className="w-4 h-4" />
          </FluentButton>
          <FluentButton variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </FluentButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: History, color: 'text-slate-600' },
          { label: 'Signatures', value: stats.signatures, icon: Signature, color: 'text-emerald-600' },
          { label: 'Validations BJ', value: stats.validations, icon: Shield, color: 'text-purple-600' },
          { label: 'Rejets', value: stats.rejets, icon: AlertTriangle, color: 'text-rose-600' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <stat.icon className={cn('w-5 h-5', stat.color)} />
              <div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher (acteur, ID, hash...)"
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50 text-sm outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>
        
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none"
        >
          <option value="all">Toutes les actions</option>
          <option value="sign_bmo">Signatures BMO</option>
          <option value="validate_bj">Validations BJ</option>
          <option value="reject">Rejets</option>
          <option value="create">Créations</option>
          <option value="view">Consultations</option>
          <option value="export">Exports</option>
        </select>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <History className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500">Aucune entrée trouvée</p>
          </div>
        ) : (
          filtered.map((entry, index) => {
            const config = ACTION_CONFIG[entry.action];
            const Icon = config.icon;
            
            return (
              <div
                key={entry.id}
                className="flex gap-4 p-4 rounded-xl border border-slate-200/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/50"
              >
                {/* Icon */}
                <div className={cn('flex-none w-12 h-12 rounded-xl flex items-center justify-center', config.bg)}>
                  <Icon className={cn('w-6 h-6', config.color)} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('px-2 py-0.5 rounded-lg text-xs font-semibold', config.bg, config.color)}>
                      {config.label}
                    </span>
                    <span className="font-mono text-sm font-bold text-purple-700 dark:text-purple-300">
                      {entry.targetId}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {entry.targetLabel}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>{entry.actor}</span>
                      <span className="text-slate-400">({entry.actorRole})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(entry.timestamp).toLocaleString('fr-FR')}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs">
                      {entry.bureau}
                    </span>
                  </div>
                  
                  {entry.details && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {entry.details}
                    </p>
                  )}
                  
                  {entry.hash && (
                    <div className="mt-2 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-slate-400" />
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        {entry.hash}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-slate-500">
        <p>Les entrées d'audit sont immuables et signées cryptographiquement</p>
      </div>
    </div>
  );
}

