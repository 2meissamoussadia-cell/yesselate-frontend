'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Star, Save, CalendarDays, Repeat, Users, Building2, Target } from 'lucide-react';
import type { CalendarItem, Priority, Severity, Status, CalendarKind } from './types';

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'quarterly';

type EventFormData = {
  title: string;
  description: string;
  kind: CalendarKind;
  bureau?: string;
  assignees: { id: string; name: string }[];
  start: Date;
  end: Date;
  priority: Priority;
  severity: Severity;
  status: Status;
  project?: string;
  recurrence: RecurrenceType;
  recurrenceEnd?: Date;
  notation?: number;
  notes?: string;
};

const BUREAUX = ['BMO', 'BFC', 'BMCM', 'BAA', 'BCT', 'BACQ', 'BJ'] as const;
const ASSIGNEES = [
  { id: 'USR-001', name: 'A. DIALLO' },
  { id: 'u2', name: 'Chef de projet' },
  { id: 'u3', name: 'Responsable technique' },
  { id: 'u4', name: 'Chef de projet' },
];

export function EventModal({
  isOpen,
  onClose,
  initialDate,
  editingItem,
  onSave,
  darkMode,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialDate: Date | null;
  editingItem: CalendarItem | null;
  onSave: (data: EventFormData) => void;
  darkMode: boolean;
}) {
  const [formData, setFormData] = useState<EventFormData>(() => {
    const start = initialDate ?? new Date();
    return {
      title: '',
      description: '',
      kind: 'meeting',
      bureau: undefined,
      assignees: [],
      start,
      end: new Date(start.getTime() + 60 * 60000),
      priority: 'normale',
      severity: 'info',
      status: 'open',
      project: '',
      recurrence: 'none',
      recurrenceEnd: undefined,
      notation: undefined,
      notes: '',
    };
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title,
        description: editingItem.description || '',
        kind: editingItem.kind,
        bureau: editingItem.bureau,
        assignees: editingItem.assignees || [],
        start: new Date(editingItem.start),
        end: editingItem.end ? new Date(editingItem.end) : new Date(new Date(editingItem.start).getTime() + 60 * 60000),
        priority: editingItem.priority,
        severity: editingItem.severity || 'info',
        status: editingItem.status,
        project: editingItem.project || '',
        recurrence: 'none',
        recurrenceEnd: undefined,
        notation: undefined,
        notes: '',
      });
    } else if (initialDate) {
      const end = new Date(initialDate);
      end.setHours(end.getHours() + 1);
      setFormData((prev) => ({
        ...prev,
        start: initialDate,
        end,
      }));
    }
  }, [editingItem, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  const toggleAssignee = (assignee: { id: string; name: string }) => {
    setFormData((prev) => ({
      ...prev,
      assignees: prev.assignees.some((a) => a.id === assignee.id)
        ? prev.assignees.filter((a) => a.id !== assignee.id)
        : [...prev.assignees, assignee],
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <Card className={cn('w-full max-w-2xl max-h-[90vh] overflow-auto', darkMode ? 'bg-slate-900' : 'bg-white')}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {editingItem ? 'Modifier l\'événement' : 'Nouvel événement'}
            </div>
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titre */}
            <div>
              <label className="text-sm font-semibold mb-1 block">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Réunion projet X"
                required
                className={darkMode ? 'bg-slate-800' : ''}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Détails de l'événement..."
                rows={3}
                className={cn(
                  'w-full rounded-lg px-3 py-2 border text-sm',
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                )}
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-semibold mb-1 block">Type</label>
              <select
                value={formData.kind}
                onChange={(e) => setFormData((prev) => ({ ...prev, kind: e.target.value as CalendarKind }))}
                className={cn(
                  'w-full h-10 rounded-lg px-3 border text-sm',
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                )}
              >
                <option value="meeting">Réunion</option>
                <option value="project">Projet</option>
                <option value="event">Événement</option>
                <option value="sortie">Sortie</option>
                <option value="site-visit">Visite de site</option>
                <option value="validation">Validation</option>
                <option value="payment">Paiement</option>
                <option value="contract">Contrat</option>
                <option value="deadline">Échéance</option>
                <option value="absence">Absence</option>
                <option value="other">Autre</option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Début</label>
                <Input
                  type="datetime-local"
                  value={formData.start.toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      start: new Date(e.target.value),
                    }))
                  }
                  className={darkMode ? 'bg-slate-800' : ''}
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Fin</label>
                <Input
                  type="datetime-local"
                  value={formData.end.toISOString().slice(0, 16)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      end: new Date(e.target.value),
                    }))
                  }
                  className={darkMode ? 'bg-slate-800' : ''}
                />
              </div>
            </div>

            {/* Bureau */}
            <div>
              <label className="text-sm font-semibold mb-1 block flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Bureau
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={!formData.bureau ? 'default' : 'secondary'}
                  onClick={() => setFormData((prev) => ({ ...prev, bureau: undefined }))}
                >
                  Aucun
                </Button>
                {BUREAUX.map((b) => (
                  <Button
                    key={b}
                    type="button"
                    size="sm"
                    variant={formData.bureau === b ? 'default' : 'secondary'}
                    onClick={() => setFormData((prev) => ({ ...prev, bureau: b }))}
                  >
                    {b}
                  </Button>
                ))}
              </div>
            </div>

            {/* Assignés */}
            <div>
              <label className="text-sm font-semibold mb-1 block flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assignés
              </label>
              <div className="flex flex-wrap gap-2">
                {ASSIGNEES.map((a) => (
                  <Button
                    key={a.id}
                    type="button"
                    size="sm"
                    variant={formData.assignees.some((as) => as.id === a.id) ? 'default' : 'secondary'}
                    onClick={() => toggleAssignee(a)}
                  >
                    {a.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Priorité & Sévérité */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Priorité</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value as Priority }))}
                  className={cn(
                    'w-full h-10 rounded-lg px-3 border text-sm',
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  )}
                >
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critique</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Sévérité</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, severity: e.target.value as Severity }))}
                  className={cn(
                    'w-full h-10 rounded-lg px-3 border text-sm',
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  )}
                >
                  <option value="info">Info</option>
                  <option value="warning">Avertissement</option>
                  <option value="critical">Critique</option>
                  <option value="success">Succès</option>
                </select>
              </div>
            </div>

            {/* Projet */}
            <div>
              <label className="text-sm font-semibold mb-1 block flex items-center gap-2">
                <Target className="w-4 h-4" />
                Projet (optionnel)
              </label>
              <Input
                value={formData.project || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, project: e.target.value }))}
                placeholder="ID ou nom du projet"
                className={darkMode ? 'bg-slate-800' : ''}
              />
            </div>

            {/* Récurrence */}
            <div>
              <label className="text-sm font-semibold mb-1 block flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                Récurrence
              </label>
              <div className="space-y-2">
                <select
                  value={formData.recurrence}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recurrence: e.target.value as RecurrenceType,
                    }))
                  }
                  className={cn(
                    'w-full h-10 rounded-lg px-3 border text-sm',
                    darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                  )}
                >
                  <option value="none">Aucune</option>
                  <option value="daily">Journalier</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                  <option value="quarterly">Trimestriel</option>
                </select>
                {formData.recurrence !== 'none' && (
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Jusqu’au (optionnel)</label>
                    <Input
                      type="date"
                      value={formData.recurrenceEnd?.toISOString().slice(0, 10) || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          recurrenceEnd: e.target.value ? new Date(e.target.value) : undefined,
                        }))
                      }
                      className={darkMode ? 'bg-slate-800' : ''}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Notation */}
            <div>
              <label className="text-sm font-semibold mb-1 block flex items-center gap-2">
                <Star className="w-4 h-4" />
                Notation (0-5 étoiles)
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        notation: prev.notation === rating ? undefined : rating,
                      }))
                    }
                    className={cn(
                      'p-2 rounded transition',
                      formData.notation && formData.notation >= rating
                        ? 'text-amber-400'
                        : 'text-slate-400 hover:text-amber-300'
                    )}
                  >
                    <Star
                      className={cn(
                        'w-5 h-5',
                        formData.notation && formData.notation >= rating ? 'fill-current' : ''
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-semibold mb-1 block">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Notes supplémentaires..."
                rows={2}
                className={cn(
                  'w-full rounded-lg px-3 py-2 border text-sm',
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="secondary" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" variant="default">
                <Save className="w-4 h-4 mr-1" />
                {editingItem ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

