'use client';

import React, { useState, useMemo } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { cn } from '@/lib/cn';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  User,
  AlertTriangle,
  TrendingUp,
  FileCheck,
  MessageSquare,
  DollarSign,
  Calendar,
  ChevronRight,
  Filter,
  Search,
  FileText,
  Receipt,
  FileEdit,
  Eye,
  MoreHorizontal,
} from 'lucide-react';

// ============================================
// Types
// ============================================
interface ValidationLevel {
  id: string;
  level: number;
  name: string;
  role: string;
  validators: string[];
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approvedBy?: string;
  approvedAt?: string;
  comments?: string;
  requiredConditions?: string[];
  autoApprove?: boolean;
  requiredAmount?: number;
}

interface MultiLevelDocument {
  id: string;
  reference: string;
  type: 'bc' | 'facture' | 'avenant';
  service: 'achats' | 'finance' | 'juridique';
  amount: number;
  submittedAt: string;
  submittedBy: string;
  currentLevel: number;
  totalLevels: number;
  overallStatus: 'in_progress' | 'approved' | 'rejected';
  levels: ValidationLevel[];
}

interface ValidationBCMultiLevelValidationProps {
  open: boolean;
  onClose: () => void;
  onOpenDocument?: (id: string, type: 'bc' | 'facture' | 'avenant') => void;
}

// ============================================
// Constants
// ============================================
const TYPE_CONFIG = {
  bc: { label: 'BC', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500' },
  facture: { label: 'Facture', icon: Receipt, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  avenant: { label: 'Avenant', icon: FileEdit, color: 'text-purple-500', bg: 'bg-purple-500' },
};

const SERVICE_LABELS = {
  achats: 'Achats',
  finance: 'Finance',
  juridique: 'Juridique',
};

// ============================================
// Component
// ============================================
export function ValidationBCMultiLevelValidation({
  open,
  onClose,
  onOpenDocument,
}: ValidationBCMultiLevelValidationProps) {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<MultiLevelDocument | null>(null);

  // Mock data
  const documents: MultiLevelDocument[] = useMemo(() => [
    {
      id: 'BC-2026-0042',
      reference: 'BC-2026-0042',
      type: 'bc',
      service: 'achats',
      amount: 2450000,
      submittedAt: '2026-01-08T10:00:00',
      submittedBy: 'Jean Dupont',
      currentLevel: 2,
      totalLevels: 3,
      overallStatus: 'in_progress',
      levels: [
        {
          id: 'l1',
          level: 1,
          name: 'Validation Chef de Service',
          role: 'Chef Achats',
          validators: ['Sarah Martin'],
          status: 'approved',
          approvedBy: 'Sarah Martin',
          approvedAt: '2026-01-08T14:30:00',
          comments: 'Conforme au cahier des charges',
        },
        {
          id: 'l2',
          level: 2,
          name: 'Validation Budgétaire',
          role: 'Contrôleur Financier',
          validators: ['Thomas Dubois', 'Marie Lambert'],
          status: 'pending',
          requiredConditions: ['Budget disponible', 'Devis validé'],
          requiredAmount: 1000000,
        },
        {
          id: 'l3',
          level: 3,
          name: 'Approbation Direction',
          role: 'Directeur Général',
          validators: ['Sophie Bernard'],
          status: 'pending',
          requiredConditions: ['Montant > 2 000 000 FCFA'],
          requiredAmount: 2000000,
        },
      ],
    },
    {
      id: 'FA-2026-0089',
      reference: 'FA-2026-0089',
      type: 'facture',
      service: 'finance',
      amount: 1850000,
      submittedAt: '2026-01-09T08:00:00',
      submittedBy: 'Marc Finance',
      currentLevel: 1,
      totalLevels: 2,
      overallStatus: 'in_progress',
      levels: [
        {
          id: 'l1',
          level: 1,
          name: 'Vérification 3-Way Match',
          role: 'Contrôleur Factures',
          validators: ['Ahmed Kaci'],
          status: 'pending',
          requiredConditions: ['BC existant', 'BL conforme', 'Montant dans tolérance'],
        },
        {
          id: 'l2',
          level: 2,
          name: 'Validation Paiement',
          role: 'Chef Comptabilité',
          validators: ['Fatou Diallo'],
          status: 'pending',
          requiredConditions: ['RIB vérifié', 'Fournisseur référencé'],
        },
      ],
    },
    {
      id: 'AV-2026-0012',
      reference: 'AV-2026-0012',
      type: 'avenant',
      service: 'juridique',
      amount: 350000,
      submittedAt: '2026-01-07T11:00:00',
      submittedBy: 'Karim Legal',
      currentLevel: 2,
      totalLevels: 2,
      overallStatus: 'approved',
      levels: [
        {
          id: 'l1',
          level: 1,
          name: 'Revue Juridique',
          role: 'Juriste',
          validators: ['Nadia Bensaid'],
          status: 'approved',
          approvedBy: 'Nadia Bensaid',
          approvedAt: '2026-01-07T15:00:00',
          comments: 'Clauses conformes',
        },
        {
          id: 'l2',
          level: 2,
          name: 'Signature Direction',
          role: 'Directeur Juridique',
          validators: ['Paul Martin'],
          status: 'approved',
          approvedBy: 'Paul Martin',
          approvedAt: '2026-01-08T09:00:00',
          comments: 'Avenant approuvé pour signature',
        },
      ],
    },
    {
      id: 'BC-2026-0038',
      reference: 'BC-2026-0038',
      type: 'bc',
      service: 'achats',
      amount: 890000,
      submittedAt: '2026-01-06T14:00:00',
      submittedBy: 'Léa Achat',
      currentLevel: 1,
      totalLevels: 2,
      overallStatus: 'rejected',
      levels: [
        {
          id: 'l1',
          level: 1,
          name: 'Validation Chef de Service',
          role: 'Chef Achats',
          validators: ['Sarah Martin'],
          status: 'rejected',
          approvedBy: 'Sarah Martin',
          approvedAt: '2026-01-06T16:00:00',
          comments: 'Budget département épuisé pour ce trimestre',
        },
        {
          id: 'l2',
          level: 2,
          name: 'Validation Budgétaire',
          role: 'Contrôleur Financier',
          validators: ['Thomas Dubois'],
          status: 'skipped',
        },
      ],
    },
  ], []);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesFilter = filter === 'all' || doc.overallStatus === filter;
      const matchesSearch = searchQuery === '' || 
        doc.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.submittedBy.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [documents, filter, searchQuery]);

  const stats = useMemo(() => ({
    inProgress: documents.filter(d => d.overallStatus === 'in_progress').length,
    approved: documents.filter(d => d.overallStatus === 'approved').length,
    rejected: documents.filter(d => d.overallStatus === 'rejected').length,
  }), [documents]);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('fr-FR', { style: 'decimal' }).format(amount) + ' FCFA';

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Validation multi-niveaux"
      size="xl"
    >
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setFilter('in_progress')}
            className={cn(
              'rounded-xl border p-4 cursor-pointer transition-all',
              filter === 'in_progress' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' 
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">En cours</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setFilter('approved')}
            className={cn(
              'rounded-xl border p-4 cursor-pointer transition-all',
              filter === 'approved' 
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' 
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Approuvés</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => setFilter('rejected')}
            className={cn(
              'rounded-xl border p-4 cursor-pointer transition-all',
              filter === 'rejected' 
                ? 'border-red-500 bg-red-50 dark:bg-red-950/30' 
                : 'border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700'
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Rejetés</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par référence ou demandeur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              filter === 'all' 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
            )}
          >
            Tous
          </button>
        </div>

        {/* Documents list */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredDocuments.map((doc) => {
            const TypeIcon = TYPE_CONFIG[doc.type].icon;
            
            return (
              <div
                key={doc.id}
                className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <TypeIcon className={cn('w-4 h-4', TYPE_CONFIG[doc.type].color)} />
                      <span className="font-mono text-sm text-blue-500">{doc.reference}</span>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs text-white',
                        TYPE_CONFIG[doc.type].bg
                      )}>
                        {TYPE_CONFIG[doc.type].label}
                      </span>
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium',
                        doc.overallStatus === 'approved' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                        doc.overallStatus === 'rejected' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                        doc.overallStatus === 'in_progress' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      )}>
                        {doc.overallStatus === 'approved' ? 'Approuvé' : doc.overallStatus === 'rejected' ? 'Rejeté' : 'En cours'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {doc.submittedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(doc.amount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.submittedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-1">Progression</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {doc.currentLevel}/{doc.totalLevels}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        doc.overallStatus === 'approved' ? 'bg-emerald-500' : doc.overallStatus === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                      )}
                      style={{ width: `${(doc.levels.filter(l => l.status === 'approved').length / doc.totalLevels) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Validation levels */}
                <div className="space-y-2">
                  {doc.levels.map((level) => (
                    <div
                      key={level.id}
                      className={cn(
                        'rounded-lg border p-3 transition-all',
                        level.status === 'approved' && 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/50 dark:bg-emerald-950/20',
                        level.status === 'rejected' && 'border-red-200 bg-red-50/50 dark:border-red-800/50 dark:bg-red-950/20',
                        level.status === 'pending' && level.level === doc.currentLevel && 'border-blue-300 bg-blue-50/50 dark:border-blue-800/50 dark:bg-blue-950/20',
                        level.status === 'pending' && level.level !== doc.currentLevel && 'border-slate-200 bg-slate-50/30 dark:border-slate-800 opacity-50',
                        level.status === 'skipped' && 'border-slate-200 bg-slate-50/30 dark:border-slate-800 opacity-40'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                          level.status === 'approved' && 'bg-emerald-500 text-white',
                          level.status === 'rejected' && 'bg-red-500 text-white',
                          level.status === 'pending' && level.level === doc.currentLevel && 'bg-blue-500 text-white',
                          level.status === 'pending' && level.level !== doc.currentLevel && 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300',
                          level.status === 'skipped' && 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                        )}>
                          {level.status === 'approved' ? <CheckCircle className="w-4 h-4" /> : 
                           level.status === 'rejected' ? <XCircle className="w-4 h-4" /> :
                           level.status === 'skipped' ? '—' : level.level}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{level.name}</p>
                              <p className="text-xs text-slate-400">{level.role}</p>
                            </div>
                            {level.requiredAmount && (
                              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                                Seuil: {formatCurrency(level.requiredAmount)}
                              </span>
                            )}
                          </div>

                          {/* Validators */}
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {level.validators.map((v, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                {v}
                              </span>
                            ))}
                          </div>

                          {/* Required conditions */}
                          {level.requiredConditions && level.status === 'pending' && (
                            <div className="mt-2 text-xs text-slate-400">
                              <p className="font-medium mb-1">Conditions :</p>
                              <ul className="space-y-0.5">
                                {level.requiredConditions.map((c, i) => (
                                  <li key={i} className="flex items-center gap-1">
                                    <span className="text-blue-500">•</span> {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Approval info */}
                          {level.approvedBy && (
                            <div className="mt-2 text-xs flex items-center gap-1">
                              <FileCheck className="w-3 h-3 text-slate-400" />
                              <span>
                                Par <strong>{level.approvedBy}</strong> le {new Date(level.approvedAt!).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}

                          {/* Comment */}
                          {level.comments && (
                            <div className="mt-2 p-2 rounded bg-slate-100 dark:bg-slate-800 text-xs flex items-start gap-1">
                              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-400" />
                              <p className="text-slate-600 dark:text-slate-300">{level.comments}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Service : {SERVICE_LABELS[doc.service]}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenDocument?.(doc.id, doc.type)}
                      className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Voir détails
                    </button>
                    {doc.overallStatus === 'in_progress' && (
                      <button className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1">
                        Traiter
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredDocuments.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucun document trouvé</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4">
          <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Validation multi-niveaux :</strong> Chaque document passe par une chaîne de validation selon son type, montant et origine.
              Les seuils d&apos;approbation et les conditions sont configurés selon les règles métier de l&apos;entreprise.
            </span>
          </p>
        </div>
      </div>
    </FluentModal>
  );
}

