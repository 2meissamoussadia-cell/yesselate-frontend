'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { X, Edit2, Calendar, Users, FileText, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import type { CalendarItem } from '@/lib/utils/calendar-helpers';

interface CalendarInspectorProps {
  item: CalendarItem | null;
  onClose: () => void;
  onEdit: (item: CalendarItem) => void;
  onReschedule: (item: CalendarItem) => void;
  onAssignBureau: (item: CalendarItem, bureau: string) => void;
  onEscalate: (item: CalendarItem) => void;
  onValidate: (item: CalendarItem) => void;
  onAttachDoc: (item: CalendarItem) => void;
  conflicts?: Array<{ type: string; description: string; severity: string }>;
  loadData?: { totalHours: number; capacity: number; overload: boolean; overloadPercent: number };
  slaStatus?: { isOverdue: boolean; daysOverdue: number; status: string };
}

export function CalendarInspector({
  item,
  onClose,
  onEdit,
  onReschedule,
  onAssignBureau,
  onEscalate,
  onValidate,
  onAttachDoc,
  conflicts = [],
  loadData,
  slaStatus,
}: CalendarInspectorProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [selectedBureau, setSelectedBureau] = useState<string>('');

  if (!item) return null;

  const getPriorityBadge = (priority: string) => {
    if (priority === 'critical') return 'urgent';
    if (priority === 'urgent') return 'urgent';
    if (priority === 'high') return 'warning';
    return 'default';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <Calendar className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-full w-96 z-50 flex flex-col',
        'border-l shadow-2xl',
        darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center justify-between p-4 border-b', darkMode ? 'border-slate-700' : 'border-gray-200')}>
        <h2 className="text-lg font-semibold">Détails</h2>
        <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Titre et métadonnées */}
        <div>
          <div className="flex items-start gap-2 mb-2">
            <h3 className="text-base font-semibold flex-1">{item.title}</h3>
            {getStatusIcon(item.status)}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant={getPriorityBadge(item.priority)}>{item.priority}</Badge>
            {item.bureau && <BureauTag bureau={item.bureau} />}
            <Badge variant="info">{item.kind}</Badge>
          </div>
        </div>

        {/* Dates */}
        <Card className={darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}>
          <CardContent className="p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Début</span>
              <span className="font-mono">{new Date(item.start).toLocaleString('fr-FR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fin</span>
              <span className="font-mono">{new Date(item.end).toLocaleString('fr-FR')}</span>
            </div>
            {item.slaDueAt && (
              <div className="flex justify-between">
                <span className="text-slate-400">Échéance SLA</span>
                <span className={cn('font-mono', slaStatus?.isOverdue ? 'text-red-400' : '')}>
                  {new Date(item.slaDueAt).toLocaleString('fr-FR')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assignés */}
        {item.assignees && item.assignees.length > 0 && (
          <Card className={darkMode ? 'bg-slate-800/50' : 'bg-gray-50'}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assignés
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-1">
                {item.assignees.map((assignee, idx) => (
                  <div key={idx} className="text-sm">
                    {assignee}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conflits */}
        {conflicts.length > 0 && (
          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4" />
                Conflits détectés
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {conflicts.map((conflict, idx) => (
                <div key={idx} className="text-xs p-2 rounded bg-red-500/10 border border-red-500/20">
                  <Badge variant={conflict.severity === 'critical' ? 'urgent' : 'warning'} className="mb-1">
                    {conflict.type}
                  </Badge>
                  <p>{conflict.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Charge */}
        {loadData && (
          <Card className={cn(loadData.overload ? 'border-amber-500/30 bg-amber-500/5' : darkMode ? 'bg-slate-800/50' : 'bg-gray-50')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Charge
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Heures</span>
                <span className={cn('font-semibold', loadData.overload ? 'text-amber-400' : '')}>
                  {loadData.totalHours}h / {loadData.capacity}h
                </span>
              </div>
              {loadData.overload && (
                <div className="text-xs text-amber-400">
                  ⚠️ Surcharge: {loadData.overloadPercent}%
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SLA */}
        {slaStatus && (
          <Card className={cn(slaStatus.isOverdue ? 'border-red-500/30 bg-red-500/5' : darkMode ? 'bg-slate-800/50' : 'bg-gray-50')}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Statut</span>
                <Badge variant={slaStatus.isOverdue ? 'urgent' : 'default'}>
                  {slaStatus.status}
                </Badge>
              </div>
              {slaStatus.isOverdue && (
                <div className="text-xs text-red-400">
                  ⚠️ En retard de {slaStatus.daysOverdue} jour(s)
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button
            className="w-full"
            variant="default"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Modifier
          </Button>

          <Button
            className="w-full"
            variant="secondary"
            size="sm"
            onClick={() => onReschedule(item)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Replanifier
          </Button>

          <div className="flex gap-2">
            <Select value={selectedBureau || '__none__'} onValueChange={(v: string) => setSelectedBureau(v === '__none__' ? '' : v)}>
              <SelectTrigger className={cn(
                'flex-1 h-9 rounded-md border px-3 text-sm',
                darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-gray-300'
              )}>
                <SelectValue placeholder="Assigner bureau..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Assigner bureau...</SelectItem>
                <SelectItem value="BMO">BMO</SelectItem>
                <SelectItem value="TECH">TECH</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="FINANCE">FINANCE</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (selectedBureau) {
                  onAssignBureau(item, selectedBureau);
                  setSelectedBureau('');
                  addToast(`Bureau assigné: ${selectedBureau}`, 'success');
                }
              }}
              disabled={!selectedBureau}
            >
              Assigner
            </Button>
          </div>

          <Button
            className="w-full"
            variant="warning"
            size="sm"
            onClick={() => onEscalate(item)}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Escalader
          </Button>

          {item.status !== 'completed' && (
            <Button
              className="w-full"
              variant="success"
              size="sm"
              onClick={() => onValidate(item)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Valider
            </Button>
          )}

          <Button
            className="w-full"
            variant="outline"
            size="sm"
            onClick={() => onAttachDoc(item)}
          >
            <FileText className="w-4 h-4 mr-2" />
            Attacher document
          </Button>
        </div>
      </div>
    </div>
  );
}

