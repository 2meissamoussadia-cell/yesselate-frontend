'use client';

/**
 * EmployeeDetailModal - Modal Overlay Moderne pour Employés
 * 
 * Pattern unifié avec navigation prev/next, tabs, et actions contextuelles
 * Préserve le contexte (liste visible en arrière-plan)
 */

import React, { useMemo } from 'react';
import { GenericDetailModal, type TabConfig, type ActionButton } from '@/components/ui/GenericDetailModal';
import {
  User,
  FileText,
  Briefcase,
  TrendingUp,
  History,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  Clock,
  Target,
  Shield,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ================================
// Types
// ================================

export interface Employee {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  bureau?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  contractType?: 'CDI' | 'CDD' | 'Stage' | 'Intérim';
  startDate?: string | Date;
  endDate?: string | Date;
  salary?: number;
  skills?: string[];
  projects?: string[];
  manager?: {
    id: string;
    name: string;
  };
  performance?: {
    rating: number;
    lastReview?: string | Date;
  };
  seniority?: number; // en années
  isSPOF?: boolean; // Single Point of Failure
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => void;
  onAssign?: (employee: Employee) => void;
  onEvaluate?: (employee: Employee) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// ================================
// Helpers
// ================================

const getStatusBadge = (status: string) => {
  const statusMap = {
    active: { label: 'Actif', variant: 'success' as const },
    inactive: { label: 'Inactif', variant: 'default' as const },
    on_leave: { label: 'En congé', variant: 'warning' as const },
    terminated: { label: 'Parti', variant: 'critical' as const },
  };
  return statusMap[status as keyof typeof statusMap] || statusMap.active;
};

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number | undefined) => {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// ================================
// Composant Principal
// ================================

export function EmployeeDetailModal({
  isOpen,
  onClose,
  employee,
  onEdit,
  onDelete,
  onAssign,
  onEvaluate,
  onPrevious,
  onNext,
  hasNext = false,
  hasPrevious = false,
}: EmployeeDetailModalProps) {
  // Tabs configuration
  const tabs: TabConfig[] = useMemo(() => {
    if (!employee) return [];

    return [
      {
        id: 'infos',
        label: 'Informations',
        icon: <User className="w-4 h-4" />,
        content: (
          <div className="space-y-6">
            {/* Informations personnelles */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Informations personnelles
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Email
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {employee.email || 'N/A'}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Téléphone
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {employee.phone || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Informations professionnelles */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Informations professionnelles
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Poste
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {employee.position || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Département
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {employee.department || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Bureau
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <Badge variant="outline">{employee.bureau || 'N/A'}</Badge>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Ancienneté
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {employee.seniority ? `${employee.seniority} ans` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Manager */}
            {employee.manager && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Manager
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {employee.manager.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {employee.manager.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {employee.manager.id}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SPOF Badge */}
            {employee.isSPOF && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Point de défaillance unique (SPOF)
                  </span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Cet employé détient des compétences critiques non redondées
                </p>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'contract',
        label: 'Contrat',
        icon: <FileText className="w-4 h-4" />,
        content: (
          <div className="space-y-6">
            {/* Type de contrat */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Détails du contrat
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Type de contrat
                  </label>
                  <Badge
                    variant="gray"
                    className={cn(
                      employee.contractType === 'CDI' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    )}
                  >
                    {employee.contractType || 'N/A'}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                    Salaire
                  </label>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    {formatCurrency(employee.salary)}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Période
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">Début:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(employee.startDate)}
                  </span>
                </div>
                {employee.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Fin:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(employee.endDate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'skills',
        label: 'Compétences',
        icon: <Award className="w-4 h-4" />,
        badge: employee.skills?.length || 0,
        content: (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Compétences
            </h3>
            {employee.skills && employee.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {employee.skills.map((skill, idx) => (
                  <Badge key={idx} variant="gray">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucune compétence enregistrée
                </p>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'projects',
        label: 'Projets',
        icon: <Briefcase className="w-4 h-4" />,
        badge: employee.projects?.length || 0,
        content: (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Projets assignés
            </h3>
            {employee.projects && employee.projects.length > 0 ? (
              <div className="space-y-2">
                {employee.projects.map((project, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-2"
                  >
                    <Target className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">{project}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucun projet assigné
                </p>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'performance',
        label: 'Performance',
        icon: <TrendingUp className="w-4 h-4" />,
        content: (
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Évaluation de performance
            </h3>
            {employee.performance ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 block">
                    Note globale
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {employee.performance.rating}/5
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-600 dark:bg-blue-400 h-3 rounded-full transition-all"
                        style={{ width: `${(employee.performance.rating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
                {employee.performance.lastReview && (
                  <div>
                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 block">
                      Dernière évaluation
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(employee.performance.lastReview)}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucune évaluation disponible
                </p>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'history',
        label: 'Historique',
        icon: <History className="w-4 h-4" />,
        content: (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Historique
            </h3>
            <div className="space-y-3">
              {employee.createdAt && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      Création du profil
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(employee.createdAt)}
                    </p>
                  </div>
                </div>
              )}
              {employee.updatedAt && employee.updatedAt !== employee.createdAt && (
                <div className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white font-medium">
                      Dernière modification
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {formatDate(employee.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ),
      },
    ];
  }, [employee]);

  // Actions
  const actions: ActionButton[] = useMemo(() => {
    if (!employee) return [];

    const acts: ActionButton[] = [];

    if (onEdit) {
      acts.push({
        id: 'edit',
        label: 'Modifier',
        variant: 'default',
        onClick: () => onEdit(employee),
      });
    }

    if (onAssign) {
      acts.push({
        id: 'assign',
        label: 'Affecter à un projet',
        icon: <Briefcase className="w-4 h-4" />,
        variant: 'outline',
        onClick: () => onAssign(employee),
      });
    }

    if (onEvaluate) {
      acts.push({
        id: 'evaluate',
        label: 'Évaluer',
        icon: <TrendingUp className="w-4 h-4" />,
        variant: 'outline',
        onClick: () => onEvaluate(employee),
      });
    }

    if (onDelete) {
      acts.push({
        id: 'delete',
        label: 'Supprimer',
        variant: 'destructive',
        onClick: () => {
          if (confirm(`Êtes-vous sûr de vouloir supprimer ${employee.name} ?`)) {
            onDelete(employee);
          }
        },
      });
    }

    return acts;
  }, [employee, onEdit, onAssign, onEvaluate, onDelete]);

  if (!employee) return null;

  const statusBadge = getStatusBadge(employee.status);

  return (
    <GenericDetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={employee.name}
      subtitle={employee.position || employee.department || undefined}
      statusBadge={statusBadge}
      tabs={tabs}
      defaultActiveTab="infos"
      actions={actions}
      onPrevious={onPrevious}
      onNext={onNext}
      hasNext={hasNext}
      hasPrevious={hasPrevious}
      size="lg"
    />
  );
}

export default EmployeeDetailModal;
