/**
 * Modals de workflow pour le Calendrier
 * CreateEvent, EditEvent, DuplicateEvent, DeleteEvent
 */

'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Repeat,
  Bell,
  FileText,
  Trash2,
} from 'lucide-react';

// ================================
// TYPES
// ================================

export type EventType = 'meeting' | 'deadline' | 'milestone' | 'task' | 'reminder';
export type EventPriority = 'high' | 'medium' | 'low';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface CalendarEvent {
  id?: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  type: EventType;
  priority: EventPriority;
  description?: string;
  location?: string;
  participants?: string[];
  project?: string;
  recurrence?: RecurrenceType;
  reminder?: number; // minutes avant
  hasConflict?: boolean;
  conflictWith?: string[];
}

// ================================
// CREATE EVENT MODAL
// ================================

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (event: CalendarEvent) => void;
  initialDate?: string;
}

export function CreateEventModal({
  open,
  onClose,
  onConfirm,
  initialDate,
}: CreateEventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [type, setType] = useState<EventType>('meeting');
  const [priority, setPriority] = useState<EventPriority>('medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [reminder, setReminder] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  const eventTypes: { id: EventType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: 'meeting', label: 'Réunion', icon: Users, color: 'blue' },
    { id: 'deadline', label: 'Échéance', icon: Clock, color: 'amber' },
    { id: 'milestone', label: 'Jalon', icon: CheckCircle, color: 'emerald' },
    { id: 'task', label: 'Tâche', icon: FileText, color: 'slate' },
    { id: 'reminder', label: 'Rappel', icon: Bell, color: 'purple' },
  ];

  const priorities: { id: EventPriority; label: string; color: string }[] = [
    { id: 'high', label: 'Haute', color: 'rose' },
    { id: 'medium', label: 'Moyenne', color: 'amber' },
    { id: 'low', label: 'Basse', color: 'slate' },
  ];

  const handleAddParticipant = () => {
    if (participantInput.trim() && !participants.includes(participantInput.trim())) {
      setParticipants([...participants, participantInput.trim()]);
      setParticipantInput('');
    }
  };

  const handleRemoveParticipant = (email: string) => {
    setParticipants(participants.filter((p) => p !== email));
  };

  const handleConfirm = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));

    const event: CalendarEvent = {
      title,
      date,
      startTime,
      endTime,
      type,
      priority,
      description,
      location,
      participants,
      recurrence,
      reminder,
    };

    onConfirm(event);
    setIsSubmitting(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setParticipants([]);
    setParticipantInput('');
  };

  return (
    <FluentModal open={open} onClose={onClose} title="Créer un événement" maxWidth="2xl">
      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Titre *
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Réunion de pilotage projet..."
            className="bg-slate-800/50 border-slate-700"
          />
        </div>

        {/* Type d'événement */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            Type d'événement
          </label>
          <div className="grid grid-cols-5 gap-2">
            {eventTypes.map((t) => {
              const Icon = t.icon;
              const isSelected = type === t.id;
              const colorClasses = {
                blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
                amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                slate: 'border-slate-600 bg-slate-800/50 text-slate-300',
                purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
              }[t.color];

              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                    isSelected
                      ? colorClasses
                      : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:bg-slate-800/50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date et heure */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Date *
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-800/50 border-slate-700"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Début
            </label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="bg-slate-800/50 border-slate-700"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Fin
            </label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="bg-slate-800/50 border-slate-700"
            />
          </div>
        </div>

        {/* Priorité */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Priorité
          </label>
          <div className="flex gap-2">
            {priorities.map((p) => {
              const colorClasses = {
                rose: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
                amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                slate: 'border-slate-600 bg-slate-800/50 text-slate-300',
              }[p.color];

              return (
                <button
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all',
                    priority === p.id
                      ? colorClasses
                      : 'border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détails de l'événement..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
          />
        </div>

        {/* Lieu */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Lieu
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Salle de réunion, Visio..."
              className="bg-slate-800/50 border-slate-700 pl-10"
            />
          </div>
        </div>

        {/* Participants */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            Participants
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddParticipant()}
              placeholder="Email du participant..."
              className="bg-slate-800/50 border-slate-700 flex-1"
            />
            <FluentButton variant="ghost" onClick={handleAddParticipant}>
              <Plus className="w-4 h-4" />
            </FluentButton>
          </div>
          {participants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {participants.map((p) => (
                <Badge
                  key={p}
                  variant="gray"
                  className="bg-slate-800/50 text-slate-300 border-slate-700 pr-1"
                >
                  {p}
                  <button
                    onClick={() => handleRemoveParticipant(p)}
                    className="ml-1 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Options avancées */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Récurrence
            </label>
            <Select value={recurrence} onValueChange={(v: string) => setRecurrence(v as RecurrenceType)}>
              <SelectTrigger className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune</SelectItem>
                <SelectItem value="daily">Quotidien</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Rappel (minutes avant)
            </label>
            <Input
              type="number"
              value={reminder}
              onChange={(e) => setReminder(parseInt(e.target.value) || 0)}
              min="0"
              className="bg-slate-800/50 border-slate-700"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <FluentButton
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting || !title.trim()}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Création...' : 'Créer l\'événement'}
          </FluentButton>
          <FluentButton variant="ghost" onClick={onClose}>
            Annuler
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

// ================================
// EDIT EVENT MODAL
// ================================

interface EditEventModalProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onConfirm: (event: CalendarEvent) => void;
}

export function EditEventModal({
  open,
  onClose,
  event,
  onConfirm,
}: EditEventModalProps) {
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({ ...event });
    }
  }, [event]);

  const handleConfirm = async () => {
    if (!formData.title?.trim()) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    onConfirm(formData as CalendarEvent);
    setIsSubmitting(false);
    onClose();
  };

  if (!event) return null;

  return (
    <FluentModal open={open} onClose={onClose} title="Modifier l'événement" maxWidth="2xl">
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-300">
            📝 Modification de l'événement: <strong>{event.title}</strong>
          </p>
        </div>

        {/* Formulaire similaire à CreateEventModal mais pré-rempli */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">Titre *</label>
          <Input
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>

        {/* ... autres champs similaires ... */}

        <div className="flex gap-3 pt-2">
          <FluentButton
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting || !formData.title?.trim()}
            className="flex-1"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Modification...' : 'Enregistrer les modifications'}
          </FluentButton>
          <FluentButton variant="ghost" onClick={onClose}>
            Annuler
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

// ================================
// DELETE EVENT MODAL
// ================================

interface DeleteEventModalProps {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onConfirm: () => void;
}

export function DeleteEventModal({
  open,
  onClose,
  event,
  onConfirm,
}: DeleteEventModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    onConfirm();
    setIsSubmitting(false);
    onClose();
  };

  if (!event) return null;

  return (
    <FluentModal open={open} onClose={onClose} title="Supprimer l'événement" maxWidth="lg">
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-rose-300 font-medium mb-1">
                Attention: Action irréversible
              </p>
              <p className="text-xs text-slate-400">
                Vous êtes sur le point de supprimer définitivement cet événement.
                {event.participants && event.participants.length > 0 && (
                  <span className="block mt-1">
                    <strong>{event.participants.length} participant(s)</strong> seront notifiés de l'annulation.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <p className="text-sm text-slate-300 font-medium">{event.title}</p>
          <p className="text-xs text-slate-400 mt-1">
            {event.date} • {event.startTime} - {event.endTime}
          </p>
        </div>

        <div className="flex gap-3">
          <FluentButton
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="flex-1 bg-rose-600 hover:bg-rose-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Suppression...' : 'Confirmer la suppression'}
          </FluentButton>
          <FluentButton variant="ghost" onClick={onClose}>
            Annuler
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

