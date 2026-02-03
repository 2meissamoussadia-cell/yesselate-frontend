'use client';

import React from 'react';
import { Calendar, MapPin, Users, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CalendarEvent } from '@/components/bmo/layout/CalendarViewLayout';

export interface TacheDetailPanelProps {
  tache: CalendarEvent | null;
  onClose: () => void;
}

export function TacheDetailPanel({ tache, onClose }: TacheDetailPanelProps) {
  if (!tache) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-6">
        <p>Sélectionnez une tâche</p>
      </div>
    );
  }

  const start = tache.start instanceof Date ? tache.start : new Date(tache.start);
  const end = tache.end instanceof Date ? tache.end : new Date(tache.end);

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
          {tache.title}
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose} aria-label="Fermer">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center gap-2 flex-wrap">
          {tache.category && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${tache.color ?? '#3b82f6'}20`,
                color: tache.color ?? '#3b82f6',
              }}
            >
              {tache.category}
            </span>
          )}
        </div>

        <div className="grid gap-4 text-sm">
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-slate-500 mt-0.5" />
            <div>
              <span className="text-slate-500 block">Début - Fin</span>
              <p className="font-medium">
                {start.toLocaleString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                –{' '}
                {end.toLocaleString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {tache.location && (
            <div className="flex items-start gap-3">
              <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
              <div>
                <span className="text-slate-500 block">Chantier</span>
                <p className="font-medium">{tache.location}</p>
              </div>
            </div>
          )}

          {tache.attendees && tache.attendees.length > 0 && (
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 text-slate-500 mt-0.5" />
              <div>
                <span className="text-slate-500 block">Participants</span>
                <p className="font-medium">{tache.attendees.map((a) => a.name).join(', ')}</p>
              </div>
            </div>
          )}
        </div>

        {tache.description && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-slate-500" />
              <span className="text-slate-500 text-sm">Description</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300">{tache.description}</p>
          </div>
        )}
      </div>
    </div>
  );
}
