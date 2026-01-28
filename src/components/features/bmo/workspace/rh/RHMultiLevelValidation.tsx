'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

interface MultiLevelRequest {
  id: string;
  type: string;
  agent: string;
  amount?: number;
  duration?: number;
  submittedAt: string;
  currentLevel: number;
  totalLevels: number;
  overallStatus: 'in_progress' | 'approved' | 'rejected';
  levels: ValidationLevel[];
}

interface RHMultiLevelValidationProps {
  open: boolean;
  onClose: () => void;
}

export function RHMultiLevelValidation({ open, onClose }: RHMultiLevelValidationProps) {
  const [requests, setRequests] = useState<MultiLevelRequest[]>([
    {
      id: 'RH-2026-015',
      type: 'Dépense',
      agent: 'Ahmed Kaci',
      amount: 45000,
      submittedAt: '2026-01-09T10:00:00',
      currentLevel: 2,
      totalLevels: 4,
      overallStatus: 'in_progress',
      levels: [
        {
          id: 'l1',
          level: 1,
          name: 'Validation initiale',
          role: 'Chef d\'équipe',
          validators: ['Sarah Martin'],
          status: 'approved',
          approvedBy: 'Sarah Martin',
          approvedAt: '2026-01-09T11:30:00',
          comments: 'Dépense justifiée et conforme',
        },
        {
          id: 'l2',
          level: 2,
          name: 'Validation budgétaire',
          role: 'Contrôleur financier',
          validators: ['Thomas Dubois', 'Marie Lambert'],
          status: 'pending',
          requiredConditions: ['Budget disponible', 'Devis validé'],
        },
        {
          id: 'l3',
          level: 3,
          name: 'Validation RH',
          role: 'Responsable RH',
          validators: ['Jean Moreau'],
          status: 'pending',
          requiredConditions: ['Conformité règlement interne'],
        },
        {
          id: 'l4',
          level: 4,
          name: 'Approbation finale',
          role: 'Directeur Général',
          validators: ['Sophie Bernard'],
          status: 'pending',
          requiredConditions: ['Montant > 30000 DZD'],
        },
      ],
    },
    {
      id: 'RH-2026-016',
      type: 'Congé exceptionnel',
      agent: 'Karim Meziani',
      duration: 15,
      submittedAt: '2026-01-10T08:00:00',
      currentLevel: 1,
      totalLevels: 3,
      overallStatus: 'in_progress',
      levels: [
        {
          id: 'l1',
          level: 1,
          name: 'Validation N+1',
          role: 'Manager direct',
          validators: ['Ahmed Bencherif'],
          status: 'pending',
          requiredConditions: ['Durée < 30 jours'],
        },
        {
          id: 'l2',
          level: 2,
          name: 'Validation RH',
          role: 'Service RH',
          validators: ['Sarah Martin', 'Thomas Dubois'],
          status: 'pending',
          requiredConditions: ['Solde suffisant', 'Pas de conflit planning'],
        },
        {
          id: 'l3',
          level: 3,
          name: 'Validation Direction',
          role: 'Direction',
          validators: ['Marie Lambert'],
          status: 'pending',
          requiredConditions: ['Durée > 10 jours'],
        },
      ],
    },
    {
      id: 'RH-2026-012',
      type: 'Avance sur salaire',
      agent: 'Farid Benali',
      amount: 150000,
      submittedAt: '2026-01-08T14:00:00',
      currentLevel: 3,
      totalLevels: 3,
      overallStatus: 'approved',
      levels: [
        {
          id: 'l1',
          level: 1,
          name: 'Validation RH',
          role: 'Service RH',
          validators: ['Sarah Martin'],
          status: 'approved',
          approvedBy: 'Sarah Martin',
          approvedAt: '2026-01-08T15:00:00',
          comments: 'Dossier complet',
        },
        {
          id: 'l2',
          level: 2,
          name: 'Validation financière',
          role: 'Service comptabilité',
          validators: ['Thomas Dubois'],
          status: 'approved',
          approvedBy: 'Thomas Dubois',
          approvedAt: '2026-01-08T16:30:00',
          comments: 'Fonds disponibles',
        },
        {
          id: 'l3',
          level: 3,
          name: 'Approbation DG',
          role: 'Direction Générale',
          validators: ['Marie Lambert'],
          status: 'approved',
          approvedBy: 'Marie Lambert',
          approvedAt: '2026-01-09T09:00:00',
          comments: 'Approuvé - montant élevé justifié',
        },
      ],
    },
    {
      id: 'RH-2026-010',
      type: 'Déplacement international',
      agent: 'Yasmine Larbi',
      submittedAt: '2026-01-07T11:00:00',
      currentLevel: 2,
      totalLevels: 2,
      overallStatus: 'rejected',
      levels: [
        {
          id: 'l1',
          level: 1,
          name: 'Validation Manager',
          role: 'Chef de projet',
          validators: ['Jean Moreau'],
          status: 'approved',
          approvedBy: 'Jean Moreau',
          approvedAt: '2026-01-07T14:00:00',
          comments: 'Mission prioritaire',
        },
        {
          id: 'l2',
          level: 2,
          name: 'Validation budgétaire',
          role: 'Contrôleur budget',
          validators: ['Thomas Dubois'],
          status: 'rejected',
          approvedBy: 'Thomas Dubois',
          approvedAt: '2026-01-08T10:00:00',
          comments: 'Budget déplacements internationaux épuisé pour ce trimestre',
        },
      ],
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<MultiLevelRequest | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'rejected':
        return 'text-red-600 bg-red-500/10 border-red-500/20';
      case 'pending':
        return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      case 'skipped':
        return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
      default:
        return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-500/10 border-green-500/20';
      case 'rejected':
        return 'text-red-600 bg-red-500/10 border-red-500/20';
      case 'in_progress':
        return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-slate-600 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const inProgressCount = requests.filter((r) => r.overallStatus === 'in_progress').length;
  const approvedCount = requests.filter((r) => r.overallStatus === 'approved').length;
  const rejectedCount = requests.filter((r) => r.overallStatus === 'rejected').length;

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Validation multi-niveaux"
      maxWidth="5xl"
    >
      <div className="space-y-6">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-blue-500/5 to-blue-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">En cours</p>
                <p className="text-2xl font-bold">{inProgressCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-green-500/5 to-green-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Approuvées</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-red-500/5 to-red-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Rejetées</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des demandes */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-blue-500">{request.id}</span>
                    <Badge variant="info">{request.type}</Badge>
                    <Badge
                      variant={
                        request.overallStatus === 'approved'
                          ? 'success'
                          : request.overallStatus === 'rejected'
                          ? 'default'
                          : 'warning'
                      }
                    >
                      {request.overallStatus === 'approved'
                        ? 'Approuvée'
                        : request.overallStatus === 'rejected'
                        ? 'Rejetée'
                        : 'En cours'}
                    </Badge>
                  </div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {request.agent}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                    {request.amount && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {request.amount.toLocaleString('fr-DZ')} DZD
                      </span>
                    )}
                    {request.duration && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {request.duration} jours
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(request.submittedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Progression</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {request.currentLevel}/{request.totalLevels}
                  </p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mb-4">
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all',
                      request.overallStatus === 'approved'
                        ? 'bg-green-500'
                        : request.overallStatus === 'rejected'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    )}
                    style={{
                      width: `${(request.currentLevel / request.totalLevels) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Niveaux de validation */}
              <div className="space-y-2">
                {request.levels.map((level, idx) => (
                  <div
                    key={level.id}
                    className={cn(
                      'rounded-lg border p-3 transition-all',
                      level.status === 'approved'
                        ? 'border-green-200 bg-green-500/5 dark:border-green-800'
                        : level.status === 'rejected'
                        ? 'border-red-200 bg-red-500/5 dark:border-red-800'
                        : level.status === 'pending'
                        ? 'border-amber-200 bg-amber-500/5 dark:border-amber-800'
                        : 'border-slate-200 bg-slate-50/50 dark:border-slate-700'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {/* Numéro */}
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                          level.status === 'approved'
                            ? 'bg-green-500 text-white'
                            : level.status === 'rejected'
                            ? 'bg-red-500 text-white'
                            : level.status === 'pending'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-300 text-slate-600'
                        )}
                      >
                        {level.status === 'approved' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : level.status === 'rejected' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          level.level
                        )}
                      </div>

                      {/* Détails */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-semibold text-sm">{level.name}</p>
                            <p className="text-xs text-slate-500">{level.role}</p>
                          </div>
                          <Badge
                            variant={
                              level.status === 'approved'
                                ? 'success'
                                : level.status === 'rejected'
                                ? 'default'
                                : 'warning'
                            }
                            className="text-xs"
                          >
                            {getStatusIcon(level.status)}
                            {level.status === 'approved'
                              ? 'Validé'
                              : level.status === 'rejected'
                              ? 'Rejeté'
                              : 'En attente'}
                          </Badge>
                        </div>

                        {/* Validateurs */}
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-xs text-slate-500">Validateurs:</p>
                          <div className="flex flex-wrap gap-1">
                            {level.validators.map((validator, vIdx) => (
                              <span
                                key={vIdx}
                                className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600"
                              >
                                {validator}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Conditions requises */}
                        {level.requiredConditions && level.requiredConditions.length > 0 && (
                          <div className="text-xs text-slate-500 mb-2">
                            <p className="font-medium mb-1">Conditions:</p>
                            <ul className="space-y-0.5 ml-4">
                              {level.requiredConditions.map((condition, cIdx) => (
                                <li key={cIdx} className="flex items-center gap-1">
                                  <span className="text-blue-500">•</span>
                                  {condition}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Validation info */}
                        {level.approvedBy && (
                          <div className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1">
                            <FileCheck className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            <span>
                              Validé par <strong>{level.approvedBy}</strong> le{' '}
                              {new Date(level.approvedAt!).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}

                        {/* Commentaire */}
                        {level.comments && (
                          <div className="mt-2 p-2 rounded bg-slate-100 dark:bg-slate-800 text-xs">
                            <div className="flex items-start gap-1">
                              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0 text-slate-500" />
                              <p className="text-slate-600 dark:text-slate-400">{level.comments}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-500/5 p-4">
          <p className="text-xs text-blue-600 dark:text-blue-400 flex items-start gap-2">
            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Validation multi-niveaux:</strong> Certaines demandes nécessitent plusieurs
              niveaux d&apos;approbation selon leur type, montant ou durée. Chaque niveau doit
              valider avant de passer au suivant. Le processus est traçable et auditable.
            </span>
          </p>
        </div>
      </div>
    </FluentModal>
  );
}

