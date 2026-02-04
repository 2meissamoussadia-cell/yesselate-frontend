'use client';

import React from 'react';
import { Calendar, Clock, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/cn';
import type { ProgrammationItem } from './ProgrammationListRow';

export interface ProgrammationDetailPanelProps {
  item: ProgrammationItem | null;
  loading?: boolean;
}

export const ProgrammationDetailPanel = React.memo(function ProgrammationDetailPanel({
  item,
  loading = false,
}: ProgrammationDetailPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3 max-w-sm px-4">
          <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Aucune programmation sélectionnée
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sélectionnez une programmation dans la liste pour voir les détails
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-slate-900 p-6 space-y-6">
      <div>
        <Badge variant="secondary" className="font-semibold mb-2">{item.numero}</Badge>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{item.titre}</h2>
      </div>

      {item.avancement !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avancement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span className="font-semibold">{item.avancement}%</span>
              </div>
              <Progress value={item.avancement} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {item.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 dark:text-slate-300">{item.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
});
