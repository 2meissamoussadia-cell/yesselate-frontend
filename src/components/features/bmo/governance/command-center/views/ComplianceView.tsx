/**
 * Vue Conformité & Audit
 * Réglementations, contrats, audits, certifications, HSE
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  ScrollText,
  Scale,
  ClipboardCheck,
  Award,
  HardHat,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  ChevronRight,
  Calendar,
  FileCheck,
  AlertOctagon,
} from 'lucide-react';
import { useGovernanceCommandCenterStore } from '@/lib/stores/governanceCommandCenterStore';

// Données de démonstration
const regulations = [
  { id: '1', name: 'RT 2020', domain: 'Thermique', status: 'compliant', lastCheck: '05/01/2026', nextCheck: '05/07/2026' },
  { id: '2', name: 'NF DTU 21', domain: 'Béton', status: 'compliant', lastCheck: '10/12/2025', nextCheck: '10/06/2026' },
  { id: '3', name: 'NF C 15-100', domain: 'Électricité', status: 'warning', lastCheck: '15/11/2025', nextCheck: '15/01/2026' },
  { id: '4', name: 'Accessibilité PMR', domain: 'Accessibilité', status: 'non-compliant', lastCheck: '20/10/2025', nextCheck: '20/01/2026' },
];

const contracts = [
  { id: '1', ref: 'CTR-2024-001', name: 'Marché principal Tours Horizon', type: 'Marché public', status: 'active', endDate: '31/12/2026', value: 12500000 },
  { id: '2', ref: 'CTR-2024-002', name: 'Sous-traitance électricité', type: 'Sous-traitance', status: 'active', endDate: '30/06/2026', value: 850000 },
  { id: '3', ref: 'CTR-2024-003', name: 'Location matériel', type: 'Location', status: 'expiring', endDate: '31/01/2026', value: 120000 },
];

const audits = [
  { id: '1', ref: 'AUD-2024-015', name: 'Audit qualité béton', type: 'Qualité', status: 'ongoing', date: '12/01/2026', auditor: 'Bureau Veritas' },
  { id: '2', ref: 'AUD-2024-016', name: 'Audit sécurité chantier', type: 'Sécurité', status: 'planned', date: '20/01/2026', auditor: 'APAVE' },
  { id: '3', ref: 'AUD-2024-014', name: 'Audit environnemental', type: 'Environnement', status: 'completed', date: '05/01/2026', auditor: 'Qualicert', findings: 2 },
];

const certifications = [
  { id: '1', name: 'ISO 9001', status: 'valid', expiryDate: '15/09/2026', progress: 100 },
  { id: '2', name: 'ISO 14001', status: 'valid', expiryDate: '15/09/2026', progress: 100 },
  { id: '3', name: 'MASE', status: 'renewing', expiryDate: '28/02/2026', progress: 75 },
  { id: '4', name: 'Qualibat', status: 'valid', expiryDate: '30/06/2027', progress: 100 },
];

const hseIndicators = [
  { id: '1', label: 'Jours sans accident', value: 127, trend: 'up', target: 150 },
  { id: '2', label: 'Taux de fréquence', value: 8.5, trend: 'down', target: 10, unit: '' },
  { id: '3', label: 'Incidents mineurs', value: 3, trend: 'stable', target: 5, period: 'ce mois' },
  { id: '4', label: 'Formations sécurité', value: 45, trend: 'up', target: 50, unit: 'h' },
];

export function ComplianceView() {
  const { navigation } = useGovernanceCommandCenterStore();

  switch (navigation.subCategory) {
    case 'contract-sla':
      return <ContractsView data={contracts} />;
    case 'commitments':
      return <AuditsView data={audits} />;
    case 'resource-utilization':
      return <CertificationsView data={certifications} />;
    default:
      return <RegulationsView data={regulations} />;
  }
}

function RegulationsView({ data }: { data: typeof regulations }) {
  const statusConfig = {
    'compliant': { icon: CheckCircle2, label: 'Conforme', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    'warning': { icon: AlertTriangle, label: 'Attention', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    'non-compliant': { icon: XCircle, label: 'Non conforme', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  };

  const compliantCount = data.filter(r => r.status === 'compliant').length;
  const warningCount = data.filter(r => r.status === 'warning').length;
  const nonCompliantCount = data.filter(r => r.status === 'non-compliant').length;

  return (
    <div className="p-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={ScrollText} iconColor="text-blue-400" label="Réglementations" value={data.length} />
        <StatCard icon={CheckCircle2} iconColor="text-emerald-400" label="Conformes" value={compliantCount} />
        <StatCard icon={AlertTriangle} iconColor="text-amber-400" label="Attention" value={warningCount} />
        <StatCard icon={XCircle} iconColor="text-red-400" label="Non conformes" value={nonCompliantCount} />
      </div>

      {/* List */}
      <div className="space-y-2">
        {data.map((reg) => {
          const status = statusConfig[reg.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;
          return (
            <div
              key={reg.id}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={cn('p-2 rounded-lg', status.bg.split(' ')[0])}>
                  <StatusIcon className={cn('h-5 w-5', status.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">{reg.name}</p>
                  <p className="text-xs text-slate-400">{reg.domain}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-xs text-slate-400">
                  <p>Dernier contrôle: {reg.lastCheck}</p>
                  <p>Prochain: {reg.nextCheck}</p>
                </div>
                <Badge variant="default" className={cn('text-xs', status.bg)}>
                  {status.label}
                </Badge>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ContractsView({ data }: { data: typeof contracts }) {
  const { openModal } = useGovernanceCommandCenterStore();

  const statusConfig = {
    'active': { label: 'Actif', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    'expiring': { label: 'Expire bientôt', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    'expired': { label: 'Expiré', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Contrats actifs</h3>
        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
          Nouveau contrat
        </Button>
      </div>

      <div className="space-y-2">
        {data.map((contract) => {
          const status = statusConfig[contract.status as keyof typeof statusConfig];
          return (
            <div
              key={contract.id}
              className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/50 cursor-pointer transition-colors"
              onClick={() => openModal('project-detail', contract)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">{contract.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{contract.ref}</span>
                      <span className="text-xs text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{contract.type}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="default" className={cn('text-xs', status.color)}>
                  {status.label}
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/50">
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>Fin: {contract.endDate}</span>
                  <span>Valeur: {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(contract.value)}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuditsView({ data }: { data: typeof audits }) {
  const { openModal } = useGovernanceCommandCenterStore();

  const statusConfig = {
    'planned': { icon: Calendar, label: 'Planifié', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
    'ongoing': { icon: Clock, label: 'En cours', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    'completed': { icon: CheckCircle2, label: 'Terminé', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Audits</h3>
        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
          Planifier un audit
        </Button>
      </div>

      <div className="space-y-2">
        {data.map((audit) => {
          const status = statusConfig[audit.status as keyof typeof statusConfig];
          const StatusIcon = status.icon;
          return (
            <div
              key={audit.id}
              className="flex items-center justify-between p-4 rounded-lg bg-slate-900/60 border border-slate-800/50 hover:border-slate-700/50 cursor-pointer transition-colors"
              onClick={() => openModal('audit-detail', audit)}
            >
              <div className="flex items-center gap-4">
                <div className={cn('p-2 rounded-lg', status.bg.split(' ')[0])}>
                  <StatusIcon className={cn('h-5 w-5', status.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-300">{audit.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{audit.ref}</span>
                    <span className="text-xs text-slate-600">•</span>
                    <span className="text-xs text-slate-400">{audit.auditor}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-400">{audit.date}</p>
                  {audit.findings !== undefined && (
                    <p className="text-xs text-amber-400">{audit.findings} constats</p>
                  )}
                </div>
                <Badge variant="default" className={cn('text-xs', status.bg)}>
                  {status.label}
                </Badge>
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CertificationsView({ data }: { data: typeof certifications }) {
  const statusConfig = {
    'valid': { label: 'Valide', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
    'renewing': { label: 'En renouvellement', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
    'expired': { label: 'Expiré', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-medium text-slate-300">Certifications</h3>

      <div className="grid grid-cols-2 gap-4">
        {data.map((cert) => {
          const status = statusConfig[cert.status as keyof typeof statusConfig];
          return (
            <div
              key={cert.id}
              className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-300">{cert.name}</p>
                    <p className="text-xs text-slate-400">Expire: {cert.expiryDate}</p>
                  </div>
                </div>
                <Badge variant="default" className={cn('text-xs', status.color)}>
                  {status.label}
                </Badge>
              </div>
              {cert.status === 'renewing' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-400">Progression renouvellement</span>
                    <span className="text-xs text-slate-400">{cert.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${cert.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HSEView({ data }: { data: typeof hseIndicators }) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HardHat className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-medium text-slate-300">Indicateurs HSE</h3>
        </div>
        <Button size="sm" variant="default" className="h-8 border-slate-700 text-slate-400">
          Signaler un incident
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((indicator) => (
          <div
            key={indicator.id}
            className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/50"
          >
            <p className="text-xs text-slate-400 mb-2">{indicator.label}</p>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-slate-200">{indicator.value}</span>
                {indicator.unit && <span className="text-sm text-slate-400 ml-1">{indicator.unit}</span>}
              </div>
              <div className={cn(
                'text-xs',
                indicator.trend === 'up' ? 'text-emerald-400' :
                indicator.trend === 'down' ? 'text-red-400' : 'text-slate-400'
              )}>
                {indicator.trend === 'up' ? '↑' : indicator.trend === 'down' ? '↓' : '→'}
              </div>
            </div>
            {indicator.target && (
              <div className="mt-2 pt-2 border-t border-slate-800/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Objectif</span>
                  <span className="text-slate-400">{indicator.target}{indicator.unit}</span>
                </div>
              </div>
            )}
            {indicator.period && (
              <p className="text-xs text-slate-600 mt-1">{indicator.period}</p>
            )}
          </div>
        ))}
      </div>

      {/* Safety alert */}
      <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-slate-300">127 jours sans accident majeur</p>
            <p className="text-xs text-slate-400">Objectif 150 jours - encore 23 jours</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconColor,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  label: string;
  value: number | string;
}) {
  return (
    <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('h-4 w-4', iconColor)} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className="text-xl font-bold text-slate-200">{value}</span>
    </div>
  );
}

