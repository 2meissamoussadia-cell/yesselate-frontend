/**
 * Panel de détail latéral pour Employés
 * Affiche les détails d'un employé sans quitter la vue principale
 */

'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  ExternalLink,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  Star,
  Shield,
  AlertTriangle,
  MapPin,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useEmployesCommandCenterStore } from '@/lib/stores/employesCommandCenterStore';
import { employesApiService, type Employe } from '@/lib/services/employesApiService';
import { Loader2 } from 'lucide-react';

export function EmployesDetailPanel() {
  const { detailPanel, closeDetailPanel, openModal } = useEmployesCommandCenterStore();
  const [employee, setEmployee] = useState<Employe | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (detailPanel.isOpen && detailPanel.entityId && detailPanel.type === 'employee') {
      setLoading(true);
      employesApiService
        .getById(detailPanel.entityId)
        .then((emp) => {
          setEmployee(emp || null);
        })
        .catch(() => {
          setEmployee(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setEmployee(null);
    }
  }, [detailPanel.isOpen, detailPanel.entityId, detailPanel.type]);

  if (!detailPanel.isOpen) return null;

  const handleOpenFullModal = () => {
    if (detailPanel.entityId) {
      openModal('employee-detail', { employeeId: detailPanel.entityId });
      closeDetailPanel();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'critical' }> = {
      actif: { label: 'Actif', variant: 'success' },
      conges: { label: 'En congés', variant: 'warning' },
      mission: { label: 'En mission', variant: 'default' },
      absent: { label: 'Absent', variant: 'warning' },
      inactif: { label: 'Inactif', variant: 'critical' },
    };
    return statusMap[status] || statusMap.actif;
  };

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        onClick={closeDetailPanel}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-slate-900 border-l border-slate-700/50 z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-medium text-slate-200">Détail Employé</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenFullModal}
              className="h-7 px-2 text-xs text-slate-400 hover:text-slate-200"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Voir plus
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeDetailPanel}
              className="h-7 w-7 p-0 text-slate-400 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : employee ? (
            <EmployeeDetailContent employee={employee} getStatusBadge={getStatusBadge} />
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Employé non trouvé</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/50 p-4 space-y-2">
          <Button
            onClick={handleOpenFullModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Ouvrir en modal complète
          </Button>
          <Button
            variant="outline"
            onClick={closeDetailPanel}
            className="w-full border-slate-700 text-slate-400 hover:text-slate-200"
            size="sm"
          >
            Fermer
          </Button>
        </div>
      </div>
    </>
  );
}

// ================================
// Employee Detail Content
// ================================
function EmployeeDetailContent({
  employee,
  getStatusBadge,
}: {
  employee: Employe;
  getStatusBadge: (status: string) => { label: string; variant: 'default' | 'success' | 'warning' | 'critical' };
}) {
  const statusBadge = getStatusBadge(employee.status);

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-slate-200 mb-1 truncate">{employee.name}</h4>
          <p className="text-sm text-slate-400 mb-2">{employee.poste}</p>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={statusBadge.variant === 'success' ? 'default' : 'outline'}
              className={cn(
                statusBadge.variant === 'success' && 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
                statusBadge.variant === 'warning' && 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                statusBadge.variant === 'critical' && 'bg-red-500/20 text-red-400 border-red-500/30'
              )}
            >
              {statusBadge.label}
            </Badge>
            <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600/50">
              {employee.bureau}
            </Badge>
            {employee.spof && (
              <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                <Shield className="w-3 h-3 mr-1" />
                SPOF
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Contact</h5>
        <div className="space-y-2">
          {employee.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">{employee.email}</span>
            </div>
          )}
          {employee.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-300">{employee.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Info */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Professionnel</h5>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Briefcase className="w-3 h-3" />
              Contrat
            </div>
            <div className="text-sm text-slate-200">{employee.contrat}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Calendar className="w-3 h-3" />
              Date embauche
            </div>
            <div className="text-sm text-slate-200">
              {new Date(employee.dateEmbauche).toLocaleDateString('fr-FR')}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <DollarSign className="w-3 h-3" />
              Salaire
            </div>
            <div className="text-sm text-slate-200">{employesApiService.formatMontant(employee.salaire)}</div>
          </div>
          {employee.scoreEvaluation && (
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Star className="w-3 h-3" />
                Score
              </div>
              <div className="text-sm text-slate-200">{employee.scoreEvaluation.toFixed(1)}/5</div>
            </div>
          )}
        </div>
      </div>

      {/* Risk Score */}
      {employee.riskScore !== undefined && (
        <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-slate-300">Score de risque</span>
            </div>
            <span
              className={cn(
                'text-lg font-bold',
                employee.riskScore > 70 ? 'text-red-400' : employee.riskScore > 50 ? 'text-amber-400' : 'text-emerald-400'
              )}
            >
              {employee.riskScore}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all',
                employee.riskScore > 70 ? 'bg-red-500' : employee.riskScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'
              )}
              style={{ width: `${employee.riskScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Skills */}
      {employee.competences && employee.competences.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Compétences</h5>
          <div className="flex flex-wrap gap-2">
            {employee.competences.map((skill, idx) => (
              <Badge key={idx} variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/50">
        <div className="text-center p-3 rounded-lg bg-slate-800/30">
          <div className="text-xs text-slate-400 mb-1">Congés restants</div>
          <div className="text-lg font-bold text-slate-200">{employee.congesRestants}</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-slate-800/30">
          <div className="text-xs text-slate-400 mb-1">Matricule</div>
          <div className="text-sm font-mono text-slate-300">{employee.matricule}</div>
        </div>
      </div>
    </div>
  );
}

