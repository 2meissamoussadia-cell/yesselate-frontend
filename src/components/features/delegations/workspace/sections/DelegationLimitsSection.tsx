'use client';

import { cn } from '@/lib/cn';
import {
  Banknote,
  UserCheck,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Shield,
  Scale,
  Lock,
} from 'lucide-react';
import type { DelegationUIState } from '@/lib/stores/delegationWorkspaceStore';

interface Props {
  delegation: any;
  sub?: DelegationUIState['sub'];
}

function formatAmount(amount: number | undefined, currency: string = 'XOF'): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DelegationLimitsSection({ delegation, sub }: Props) {
  if (!delegation) {
    return <div className="text-slate-400 text-center py-8">Aucune donnée</div>;
  }

  // Vue par défaut
  if (!sub) {
    return (
      <div className="space-y-6">
        {/* Seuils financiers */}
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-500" />
            Seuils financiers
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {formatAmount(delegation.maxAmount, delegation.currency)}
              </div>
              <div className="text-xs text-slate-400">Plafond / opération</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatAmount(delegation.maxTotalAmount, delegation.currency)}
              </div>
              <div className="text-xs text-slate-400">Plafond cumulé</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatAmount(delegation.metrics?.remainingAmount, delegation.currency)}
              </div>
              <div className="text-xs text-slate-400">Restant</div>
            </div>
          </div>
        </div>

        {/* Limites temporelles */}
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Limites temporelles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-400 mb-1">Horaires autorisés</div>
              <div className="font-medium">
                {delegation.allowedHoursStart != null && delegation.allowedHoursEnd != null
                  ? `${delegation.allowedHoursStart}h - ${delegation.allowedHoursEnd}h`
                  : '24h/24'}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Jours autorisés</div>
              <div className="font-medium">
                {delegation.allowedDays?.length
                  ? (Array.isArray(delegation.allowedDays) ? delegation.allowedDays : JSON.parse(delegation.allowedDays)).join(', ')
                  : 'Tous les jours'}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Max opérations / jour</div>
              <div className="font-medium">{delegation.maxDailyOps ?? 'Illimité'}</div>
            </div>
            <div>
              <div className="text-sm text-slate-400 mb-1">Max opérations / mois</div>
              <div className="font-medium">{delegation.maxMonthlyOps ?? 'Illimité'}</div>
            </div>
          </div>
        </div>

        {/* Contrôles requis */}
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" />
            Contrôles requis
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ControlBadge
              label="Double validation"
              enabled={delegation.requiresDualControl}
              icon={<Lock className="w-4 h-4" />}
              color="amber"
            />
            <ControlBadge
              label="Visa juridique"
              enabled={delegation.requiresLegalReview}
              icon={<Scale className="w-4 h-4" />}
              color="blue"
            />
            <ControlBadge
              label="Visa finance"
              enabled={delegation.requiresFinanceCheck}
              icon={<Banknote className="w-4 h-4" />}
              color="emerald"
            />
            <ControlBadge
              label="2FA requis"
              enabled={delegation.requiresStepUpAuth}
              icon={<Shield className="w-4 h-4" />}
              color="rose"
            />
          </div>
        </div>
      </div>
    );
  }

  // Sous-sections
  switch (sub) {
    case 'thresholds':
      return (
        <ThresholdsDetail delegation={delegation} />
      );
    case 'dual':
      return (
        <DualControlDetail delegation={delegation} />
      );
    case 'exclusions':
      return (
        <ExclusionsDetail delegation={delegation} />
      );
    case 'exceptions':
      return (
        <ExceptionsDetail delegation={delegation} />
      );
    default:
      return <div className="text-slate-400">Sous-section inconnue</div>;
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ControlBadge({
  label,
  enabled,
  icon,
  color,
}: {
  label: string;
  enabled: boolean | number;
  icon: React.ReactNode;
  color: 'amber' | 'blue' | 'emerald' | 'rose';
}) {
  const isEnabled = enabled === true || enabled === 1;
  
  const colorClasses = {
    amber: isEnabled ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-900/20' : '',
    blue: isEnabled ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-900/20' : '',
    emerald: isEnabled ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20' : '',
    rose: isEnabled ? 'border-rose-500/50 bg-rose-50 dark:bg-rose-900/20' : '',
  };
  
  const iconColorClasses = {
    amber: isEnabled ? 'text-amber-600' : 'text-slate-300',
    blue: isEnabled ? 'text-blue-600' : 'text-slate-300',
    emerald: isEnabled ? 'text-emerald-600' : 'text-slate-300',
    rose: isEnabled ? 'text-rose-600' : 'text-slate-300',
  };

  return (
    <div className={cn(
      "p-3 rounded-xl border text-center",
      isEnabled ? colorClasses[color] : "border-slate-200/70"
    )}>
      <div className={cn("w-5 h-5 mx-auto mb-1", iconColorClasses[color])}>
        {icon}
      </div>
      <div className="text-xs">{label}</div>
      <div className="text-xs font-medium mt-1">{isEnabled ? 'Oui' : 'Non'}</div>
    </div>
  );
}

function ThresholdsDetail({ delegation }: { delegation: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Banknote className="w-5 h-5 text-emerald-500" />
        Seuils financiers
      </h2>
      <p className="text-sm text-slate-400">
        Définit les plafonds financiers pour cette délégation.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Plafond par opération</div>
          <div className="text-3xl font-bold text-emerald-600">
            {formatAmount(delegation.maxAmount, delegation.currency)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Montant maximum autorisé pour une seule opération.
          </p>
        </div>
        
        <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Plafond cumulé (période)</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatAmount(delegation.maxTotalAmount, delegation.currency)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Montant maximum cumulé sur toute la période de validité.
          </p>
        </div>
      </div>
      
      {/* Progression */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <div className="flex justify-between text-sm mb-2">
          <span>Utilisation du plafond</span>
          <span className="font-medium">{delegation.metrics?.usageRate ?? 0}%</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              (delegation.metrics?.usageRate ?? 0) >= 80 ? "bg-rose-500" : "bg-emerald-500"
            )}
            style={{ width: `${Math.min(100, delegation.metrics?.usageRate ?? 0)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>Utilisé : {formatAmount(delegation.usageTotalAmount, delegation.currency)}</span>
          <span>Restant : {formatAmount(delegation.metrics?.remainingAmount, delegation.currency)}</span>
        </div>
      </div>
    </div>
  );
}

function DualControlDetail({ delegation }: { delegation: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <UserCheck className="w-5 h-5 text-amber-500" />
        Co-signature / Double validation
      </h2>
      <p className="text-sm text-slate-400">
        La double validation (dual control) exige qu&apos;une seconde personne approuve l&apos;opération.
      </p>
      
      <div className={cn(
        "p-4 rounded-xl border",
        delegation.requiresDualControl ? "border-amber-500/50 bg-amber-50 dark:bg-amber-900/20" : "border-slate-200/70"
      )}>
        <div className="flex items-center gap-3">
          <UserCheck className={cn("w-6 h-6", delegation.requiresDualControl ? "text-amber-600" : "text-slate-300")} />
          <div>
            <div className="font-medium">
              Double validation {delegation.requiresDualControl ? 'activée' : 'désactivée'}
            </div>
            <div className="text-sm text-slate-400">
              {delegation.requiresDualControl
                ? 'Chaque utilisation nécessite une validation par un co-approbateur.'
                : 'Les opérations peuvent être effectuées sans validation supplémentaire.'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Liste des co-validateurs */}
      {delegation.actors && delegation.actors.filter((a: any) => a.roleType === 'CO_APPROVER').length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Co-validateurs désignés</h3>
          <div className="space-y-2">
            {delegation.actors.filter((a: any) => a.roleType === 'CO_APPROVER').map((actor: any) => (
              <div key={actor.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="font-medium">{actor.user?.name || actor.userName}</div>
                  <div className="text-xs text-slate-400">{actor.user?.role || actor.userRole}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExclusionsDetail({ delegation }: { delegation: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <XCircle className="w-5 h-5 text-rose-500" />
        Exclusions
      </h2>
      <p className="text-sm text-slate-400">
        Liste des éléments explicitement exclus du périmètre de cette délégation.
      </p>
      
      <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700">
        <p className="text-sm text-slate-400 text-center py-4">
          Les exclusions sont définies dans les sections Périmètre (fournisseurs, projets, etc.)
          avec le mode &quot;Liste noire&quot;.
        </p>
      </div>
    </div>
  );
}

function ExceptionsDetail({ delegation }: { delegation: any }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-amber-500" />
        Exceptions
      </h2>
      <p className="text-sm text-slate-400">
        Cas particuliers où les règles normales peuvent être contournées avec justification.
      </p>
      
      <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-900/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-none mt-0.5" />
          <div>
            <div className="font-medium text-amber-800 dark:text-amber-300">
              Pas d&apos;exception configurée
            </div>
            <div className="text-sm text-amber-700/80 dark:text-amber-200/80">
              Les exceptions doivent être demandées au délégant et font l&apos;objet d&apos;un audit renforcé.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

