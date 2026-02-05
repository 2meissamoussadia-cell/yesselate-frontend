/**
 * Modal de détail générique
 * Fenêtre modale pour afficher les détails d'un élément
 */

'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  X,
  ExternalLink,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  User,
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  History,
  MessageSquare,
  Paperclip,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import { useGovernanceCommandCenterStore, type ModalType } from '@/lib/stores/governanceCommandCenterStore';

// Tabs dans le modal de détail
type DetailTab = 'info' | 'timeline' | 'comments' | 'attachments' | 'related';

export function DetailModal() {
  const { modal, closeModal, pushModal } = useGovernanceCommandCenterStore();
  const [activeTab, setActiveTab] = React.useState<DetailTab>('info');

  if (!modal.isOpen || !modal.type) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-[90vw]',
  };

  const tabs: { id: DetailTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'info', label: 'Informations', icon: FolderKanban },
    { id: 'timeline', label: 'Historique', icon: History },
    { id: 'comments', label: 'Commentaires', icon: MessageSquare },
    { id: 'attachments', label: 'Pièces jointes', icon: Paperclip },
    { id: 'related', label: 'Éléments liés', icon: ExternalLink },
  ];

  return (
    <Dialog open={modal.isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        className={cn(
          'bg-slate-900 border-slate-700 p-0 gap-0',
          sizeClasses[modal.size || 'lg']
        )}
      >
        {/* Header */}
        <DialogHeader className="p-4 border-b border-slate-700/50">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="default" className="text-xs bg-slate-800 text-slate-400 border-slate-700">
                  {modal.data?.reference || 'REF-000'}
                </Badge>
                <Badge
                  variant="default"
                  className={cn(
                    'text-xs',
                    modal.data?.status === 'critical'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : modal.data?.status === 'warning'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-slate-700/50 text-slate-400 border-slate-600'
                  )}
                >
                  {modal.data?.statusLabel || 'En cours'}
                </Badge>
              </div>
              <DialogTitle className="text-lg font-semibold text-slate-200">
                {modal.title || modal.data?.title || 'Détails'}
              </DialogTitle>
              {modal.data?.subtitle && (
                <p className="text-sm text-slate-400 mt-1">{modal.data.subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-300"
                onClick={closeModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-1 border-b border-slate-800/50 bg-slate-900/50">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors',
                  isActive
                    ? 'bg-slate-800 text-slate-200'
                    : 'text-slate-400 hover:text-slate-400 hover:bg-slate-800/50'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {activeTab === 'info' && <InfoTabContent data={modal.data} />}
          {activeTab === 'timeline' && <TimelineTabContent data={modal.data} />}
          {activeTab === 'comments' && <CommentsTabContent data={modal.data} />}
          {activeTab === 'attachments' && <AttachmentsTabContent data={modal.data} />}
          {activeTab === 'related' && <RelatedTabContent data={modal.data} />}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-4 p-4 border-t border-slate-700/50 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              onClick={() => pushModal('escalation', modal.data)}
            >
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Escalader
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="border-slate-700" onClick={closeModal}>
              Fermer
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoTabContent({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-6">
      {/* Infos principales */}
      <div className="grid grid-cols-2 gap-4">
        <InfoField label="Responsable" value={data?.responsable || 'Non assigné'} icon={User} />
        <InfoField label="Projet" value={data?.project || '-'} icon={FolderKanban} />
        <InfoField label="Échéance" value={data?.deadline || '-'} icon={Clock} />
        <InfoField
          label="Priorité"
          value={data?.priority || 'Moyenne'}
          icon={AlertTriangle}
          badge
          badgeColor={
            data?.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
            data?.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
            'bg-slate-500/20 text-slate-400'
          }
        />
      </div>

      {/* Description */}
      <div>
        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
          Description
        </h4>
        <p className="text-sm text-slate-400 leading-relaxed">
          {data?.description || 'Aucune description disponible.'}
        </p>
      </div>

      {/* Métriques */}
      <div>
        <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
          Indicateurs
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="Avancement" value={`${data?.progress || 0}%`} />
          <MetricCard label="Jours restants" value={data?.daysRemaining || '-'} />
          <MetricCard label="Alertes" value={data?.alertsCount || 0} />
        </div>
      </div>

      {/* Impact */}
      {data?.impact && (
        <div>
          <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
            Impact
          </h4>
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-sm text-slate-400">{data.impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineTabContent({ data }: { data: Record<string, any> }) {
  const events = data?.timeline || [
    { date: '10/01/2026 14:32', action: 'Créé', user: 'Jean Dupont', type: 'create' },
    { date: '10/01/2026 15:45', action: 'Assigné à Marie Martin', user: 'Jean Dupont', type: 'assign' },
    { date: '11/01/2026 09:15', action: 'Statut passé à "En cours"', user: 'Marie Martin', type: 'status' },
    { date: '12/01/2026 16:20', action: 'Commentaire ajouté', user: 'Pierre Durand', type: 'comment' },
  ];

  return (
    <div className="space-y-3">
      {events.map((event: any, index: number) => (
        <div key={index} className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-300">{event.action}</p>
            <p className="text-xs text-slate-400">
              {event.user} • {event.date}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentsTabContent({ data }: { data: Record<string, any> }) {
  return (
    <div className="space-y-4">
      <div className="text-center py-8 text-slate-400 text-sm">
        Aucun commentaire pour le moment.
      </div>
      <div className="pt-4 border-t border-slate-800">
        <textarea
          placeholder="Ajouter un commentaire..."
          className="w-full h-20 px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 placeholder:text-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
        <div className="flex justify-end mt-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
}

function AttachmentsTabContent({ data }: { data: Record<string, any> }) {
  return (
    <div className="text-center py-8 text-slate-400 text-sm">
      Aucune pièce jointe.
    </div>
  );
}

function RelatedTabContent({ data }: { data: Record<string, any> }) {
  const related = data?.related || [];
  
  if (related.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 text-sm">
        Aucun élément lié.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {related.map((item: any, index: number) => (
        <div
          key={index}
          className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-700/50 flex items-center justify-center">
              <FolderKanban className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-300">{item.title}</p>
              <p className="text-xs text-slate-400">{item.type}</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </div>
      ))}
    </div>
  );
}

function InfoField({
  label,
  value,
  icon: Icon,
  badge = false,
  badgeColor = '',
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: boolean;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        {badge ? (
          <span className={cn('inline-block px-2 py-0.5 rounded text-xs font-medium mt-0.5', badgeColor)}>
            {value}
          </span>
        ) : (
          <p className="text-sm text-slate-300 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 rounded-lg bg-slate-800/30 text-center">
      <p className="text-lg font-semibold text-slate-200">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

