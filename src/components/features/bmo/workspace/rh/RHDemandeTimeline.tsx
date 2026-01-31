'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { HRRequest } from '@/lib/types/bmo.types';
import {
  Calendar, CheckCircle2, XCircle, Clock, FileText,
  User, AlertTriangle, MessageSquare
} from 'lucide-react';

type TimelineEvent = {
  id: string;
  type: 'created' | 'validated' | 'rejected' | 'info_requested' | 'document_added' | 'comment_added';
  timestamp: string;
  actor?: string;
  actorRole?: string;
  details?: string;
  icon: typeof CheckCircle2;
  color: string;
};

type Props = {
  demand: HRRequest;
};

export function RHDemandeTimeline({ demand }: Props) {
  // Construire la timeline à partir des données de la demande
  const events = useMemo<TimelineEvent[]>(() => {
    const timeline: TimelineEvent[] = [];
    
    // Événement de création
    timeline.push({
      id: `${demand.id}-created`,
      type: 'created',
      timestamp: demand.date,
      actor: demand.agent,
      details: `Demande ${demand.type} créée`,
      icon: FileText,
      color: 'text-blue-500',
    });
    
    // Documents ajoutés
    if (demand.documents && demand.documents.length > 0) {
      demand.documents.forEach(doc => {
        timeline.push({
          id: `${demand.id}-doc-${doc.id}`,
          type: 'document_added',
          timestamp: doc.date,
          details: `Document ajouté: ${doc.name}`,
          icon: FileText,
          color: 'text-slate-400',
        });
      });
    }
    
    // Validation
    if (demand.validatedBy) {
      timeline.push({
        id: `${demand.id}-validated`,
        type: 'validated',
        timestamp: demand.validatedAt || demand.date,
        actor: demand.validatedBy,
        actorRole: 'Valideur',
        details: demand.validationComment || 'Demande validée',
        icon: CheckCircle2,
        color: 'text-emerald-500',
      });
    }
    
    // Rejet
    if (demand.rejectedBy) {
      timeline.push({
        id: `${demand.id}-rejected`,
        type: 'rejected',
        timestamp: demand.rejectedAt || demand.date,
        actor: demand.rejectedBy,
        actorRole: 'Valideur',
        details: demand.rejectionReason || 'Demande rejetée',
        icon: XCircle,
        color: 'text-red-500',
      });
    }
    
    // Trier par date (le plus récent en haut)
    return timeline.sort((a, b) => {
      return new Date(b.timestamp.split('/').reverse().join('-')).getTime() -
             new Date(a.timestamp.split('/').reverse().join('-')).getTime();
    });
  }, [demand]);

  const getEventBadge = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return <Badge variant="info">Créée</Badge>;
      case 'validated':
        return <Badge variant="success">Validée</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejetée</Badge>;
      case 'info_requested':
        return <Badge variant="warning">Info demandée</Badge>;
      case 'document_added':
        return <Badge variant="default">Document</Badge>;
      case 'comment_added':
        return <Badge variant="default">Commentaire</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          Historique de la demande
        </h2>
        
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Aucun événement enregistré</p>
          </div>
        ) : (
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
            
            {/* Événements */}
            <div className="space-y-4">
              {events.map((event, idx) => {
                const Icon = event.icon;
                const isLast = idx === events.length - 1;
                
                return (
                  <div key={event.id} className="relative pl-12">
                    {/* Icône */}
                    <div className={cn(
                      "absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center",
                      "bg-white dark:bg-slate-900 border-2",
                      event.type === 'validated' && "border-emerald-500",
                      event.type === 'rejected' && "border-red-500",
                      event.type === 'created' && "border-blue-500",
                      event.type === 'document_added' && "border-slate-300 dark:border-slate-700",
                      event.type === 'info_requested' && "border-amber-500",
                      event.type === 'comment_added' && "border-slate-300 dark:border-slate-700"
                    )}>
                      <Icon className={cn("w-4 h-4", event.color)} />
                    </div>
                    
                    {/* Contenu */}
                    <div className={cn(
                      "p-4 rounded-xl border transition-all",
                      "border-slate-200 dark:border-slate-700",
                      "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {getEventBadge(event.type)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {event.timestamp}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        {event.details}
                      </div>
                      
                      {event.actor && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">
                            {event.actor}
                            {event.actorRole && ` · ${event.actorRole}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Indicateur temps écoulé */}
        {events.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Créée il y a {getDaysAgo(events[events.length - 1].timestamp)} jours</span>
              {demand.status === 'pending' && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  En attente de validation
                </span>
              )}
              {demand.status === 'validated' && (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Traitée en {getProcessingTime(events)} jours
                </span>
              )}
              {demand.status === 'rejected' && (
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  Rejetée après {getProcessingTime(events)} jours
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Fonctions utilitaires
function getDaysAgo(dateStr: string): number {
  const date = new Date(dateStr.split('/').reverse().join('-'));
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getProcessingTime(events: TimelineEvent[]): number {
  if (events.length < 2) return 0;
  
  const created = events[events.length - 1];
  const processed = events[0];
  
  const createdDate = new Date(created.timestamp.split('/').reverse().join('-'));
  const processedDate = new Date(processed.timestamp.split('/').reverse().join('-'));
  
  const diff = processedDate.getTime() - createdDate.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

