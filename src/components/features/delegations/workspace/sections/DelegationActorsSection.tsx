'use client';

import { cn } from '@/lib/utils';
import { FluentButton } from '@/components/ui/fluent-button';
import {
  Users,
  UserCheck,
  Shield,
  Bell,
  LayoutList,
  Plus,
} from 'lucide-react';
import type { DelegationUIState } from '@/lib/stores/delegationWorkspaceStore';

interface Props {
  delegation: any;
  sub?: DelegationUIState['sub'];
  onAddActor: () => void;
}

const ROLE_LABELS: Record<string, { label: string; color: string; description: string }> = {
  GRANTOR: { label: 'Délégant', color: 'text-purple-600', description: 'Autorité source' },
  DELEGATE: { label: 'Délégataire', color: 'text-blue-600', description: 'Personne habilitée' },
  CO_APPROVER: { label: 'Co-validateur', color: 'text-amber-600', description: 'Double validation' },
  CONTROLLER: { label: 'Contrôleur', color: 'text-emerald-600', description: 'Contrôle interne' },
  AUDITOR: { label: 'Auditeur', color: 'text-indigo-600', description: 'Audit' },
  WITNESS: { label: 'Témoin', color: 'text-slate-600', description: 'Observation' },
  BACKUP: { label: 'Suppléant', color: 'text-cyan-600', description: 'En cas d\'absence' },
  IMPACTED: { label: 'Impacté', color: 'text-rose-600', description: 'Personne concernée' },
};

export function DelegationActorsSection({ delegation, sub, onAddActor }: Props) {
  if (!delegation) {
    return <div className="text-slate-400 text-center py-8">Aucune donnée</div>;
  }

  const actors = delegation.actors || [];

  // Vue par défaut : tous les acteurs
  if (!sub) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            Acteurs impliqués ({actors.length})
          </h3>
          <FluentButton size="sm" variant="secondary" onClick={onAddActor}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Ajouter
          </FluentButton>
        </div>
        
        <div className="space-y-2">
          {actors.map((actor: any) => (
            <ActorCard key={actor.id} actor={actor} />
          ))}
          
          {actors.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              Aucun acteur défini (seuls le délégant et le délégataire sont présents par défaut).
            </div>
          )}
        </div>
      </div>
    );
  }

  // Sous-sections
  switch (sub) {
    case 'raci':
      return <RACIMatrix delegation={delegation} actors={actors} />;
    case 'approvers':
      return <ApproversDetail actors={actors.filter((a: any) => a.roleType === 'CO_APPROVER')} onAddActor={onAddActor} />;
    case 'controllers':
      return <ControllersDetail actors={actors.filter((a: any) => a.roleType === 'CONTROLLER' || a.roleType === 'AUDITOR')} onAddActor={onAddActor} />;
    case 'notifications':
      return <NotificationsDetail actors={actors} />;
    default:
      return <div className="text-slate-400">Sous-section inconnue</div>;
  }
}

// ============================================
// SUB-COMPONENTS
// ============================================

function ActorCard({ actor }: { actor: any }) {
  const roleInfo = ROLE_LABELS[actor.roleType] || { label: actor.roleType, color: 'text-slate-600', description: '' };
  
  return (
    <div className="p-4 rounded-xl border border-slate-200/70 dark:border-slate-700 flex items-start gap-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
        <UserCheck className="w-5 h-5 text-slate-400" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{actor.user?.name || actor.userName}</span>
          <span className={cn("text-xs font-medium", roleInfo.color)}>
            {roleInfo.label}
          </span>
          {(actor.required === 1 || actor.required === true) && (
            <span className="text-xs bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded">Obligatoire</span>
          )}
        </div>
        
        {(actor.user?.role || actor.userRole) && (
          <div className="text-sm text-slate-400">{actor.user?.role || actor.userRole}</div>
        )}
        
        <div className="flex gap-3 mt-2 text-xs text-slate-400">
          {(actor.canApprove === 1 || actor.canApprove === true) && (
            <span className="text-emerald-600">✓ Peut valider</span>
          )}
          {(actor.canRevoke === 1 || actor.canRevoke === true) && (
            <span className="text-rose-600">✓ Peut révoquer</span>
          )}
          {(actor.mustBeNotified === 1 || actor.mustBeNotified === true) && (
            <span className="text-blue-600">✓ Notifié</span>
          )}
        </div>
        
        {actor.notes && (
          <div className="mt-2 text-xs text-slate-400 italic">{actor.notes}</div>
        )}
      </div>
    </div>
  );
}

function RACIMatrix({ delegation, actors }: { delegation: any; actors: any[] }) {
  // Construire la matrice RACI
  const actions = [
    { id: 'create', label: 'Création' },
    { id: 'use', label: 'Utilisation' },
    { id: 'approve', label: 'Validation' },
    { id: 'control', label: 'Contrôle' },
    { id: 'audit', label: 'Audit' },
    { id: 'revoke', label: 'Révocation' },
  ];

  const getRACI = (actorRole: string, actionId: string): string => {
    if (actorRole === 'GRANTOR') {
      if (actionId === 'create') return 'R';
      if (actionId === 'revoke') return 'A';
      return 'I';
    }
    if (actorRole === 'DELEGATE') {
      if (actionId === 'use') return 'R';
      if (actionId === 'approve') return 'R';
      return 'I';
    }
    if (actorRole === 'CO_APPROVER') {
      if (actionId === 'approve') return 'A';
      return '';
    }
    if (actorRole === 'CONTROLLER') {
      if (actionId === 'control') return 'R';
      return 'I';
    }
    if (actorRole === 'AUDITOR') {
      if (actionId === 'audit') return 'R';
      return 'I';
    }
    return '';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <LayoutList className="w-5 h-5 text-purple-500" />
        Matrice RACI
      </h2>
      <p className="text-sm text-slate-400">
        R = Responsable, A = Approbateur, C = Consulté, I = Informé
      </p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-left py-2 px-3 font-medium">Acteur</th>
              {actions.map(a => (
                <th key={a.id} className="text-center py-2 px-3 font-medium">{a.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Délégant */}
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-2 px-3">
                <div className="font-medium">{delegation.grantor?.name || delegation.grantorName}</div>
                <div className="text-xs text-purple-600">Délégant</div>
              </td>
              {actions.map(a => (
                <td key={a.id} className="text-center py-2 px-3">
                  <RACIBadge value={getRACI('GRANTOR', a.id)} />
                </td>
              ))}
            </tr>
            
            {/* Délégataire */}
            <tr className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-2 px-3">
                <div className="font-medium">{delegation.delegate?.name || delegation.delegateName}</div>
                <div className="text-xs text-blue-600">Délégataire</div>
              </td>
              {actions.map(a => (
                <td key={a.id} className="text-center py-2 px-3">
                  <RACIBadge value={getRACI('DELEGATE', a.id)} />
                </td>
              ))}
            </tr>
            
            {/* Autres acteurs */}
            {actors.map((actor: any) => (
              <tr key={actor.id} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-2 px-3">
                  <div className="font-medium">{actor.user?.name || actor.userName}</div>
                  <div className={cn("text-xs", ROLE_LABELS[actor.roleType]?.color)}>
                    {ROLE_LABELS[actor.roleType]?.label || actor.roleType}
                  </div>
                </td>
                {actions.map(a => (
                  <td key={a.id} className="text-center py-2 px-3">
                    <RACIBadge value={getRACI(actor.roleType, a.id)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RACIBadge({ value }: { value: string }) {
  if (!value) return <span className="text-slate-300">—</span>;
  
  const colors: Record<string, string> = {
    R: 'bg-blue-100 text-blue-700',
    A: 'bg-amber-100 text-amber-800',
    C: 'bg-purple-100 text-purple-700',
    I: 'bg-slate-100 text-slate-600',
  };
  
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-bold", colors[value] || '')}>
      {value}
    </span>
  );
}

function ApproversDetail({ actors, onAddActor }: { actors: any[]; onAddActor: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-500" />
            Co-validateurs
          </h2>
          <p className="text-sm text-slate-400">
            Personnes autorisées à effectuer la double validation.
          </p>
        </div>
        <FluentButton size="sm" variant="secondary" onClick={onAddActor}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Ajouter
        </FluentButton>
      </div>
      
      <div className="space-y-2">
        {actors.map((actor: any) => (
          <ActorCard key={actor.id} actor={actor} />
        ))}
        
        {actors.length === 0 && (
          <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            Aucun co-validateur défini.
          </div>
        )}
      </div>
    </div>
  );
}

function ControllersDetail({ actors, onAddActor }: { actors: any[]; onAddActor: () => void }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            Contrôleurs &amp; Auditeurs
          </h2>
          <p className="text-sm text-slate-400">
            Personnes chargées du contrôle interne et de l&apos;audit.
          </p>
        </div>
        <FluentButton size="sm" variant="secondary" onClick={onAddActor}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Ajouter
        </FluentButton>
      </div>
      
      <div className="space-y-2">
        {actors.map((actor: any) => (
          <ActorCard key={actor.id} actor={actor} />
        ))}
        
        {actors.length === 0 && (
          <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            Aucun contrôleur ou auditeur défini.
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationsDetail({ actors }: { actors: any[] }) {
  const notified = actors.filter((a: any) => a.mustBeNotified === 1 || a.mustBeNotified === true);
  
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Bell className="w-5 h-5 text-blue-500" />
        Notifications
      </h2>
      <p className="text-sm text-slate-400">
        Personnes notifiées lors des utilisations de cette délégation.
      </p>
      
      <div className="space-y-2">
        {notified.map((actor: any) => (
          <div key={actor.id} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center gap-3">
            <Bell className="w-4 h-4 text-blue-500" />
            <div>
              <div className="font-medium">{actor.user?.name || actor.userName}</div>
              <div className="text-xs text-slate-400">
                {ROLE_LABELS[actor.roleType]?.label || actor.roleType}
              </div>
            </div>
          </div>
        ))}
        
        {notified.length === 0 && (
          <div className="text-center py-8 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            Aucune personne configurée pour les notifications.
          </div>
        )}
      </div>
    </div>
  );
}

