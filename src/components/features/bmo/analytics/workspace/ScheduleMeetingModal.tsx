'use client';

import { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, MapPin, FileText, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';
import { useAnalyticsToast } from './AnalyticsToast';

interface ScheduleMeetingModalProps {
  open: boolean;
  onClose: () => void;
  data?: {
    kpiId?: string;
    kpiName?: string;
    kpiData?: any;
    initialTitle?: string;
    initialDescription?: string;
    meetingType?: 'urgent' | 'regular' | 'follow-up';
  };
}

export function ScheduleMeetingModal({ open, onClose, data }: ScheduleMeetingModalProps) {
  const toast = useAnalyticsToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [location, setLocation] = useState('');
  const [attendees, setAttendees] = useState('');
  const [meetingType, setMeetingType] = useState<'urgent' | 'regular' | 'follow-up'>('regular');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setTitle(data?.initialTitle || '');
      setDescription(data?.initialDescription || '');
      setDate('');
      setTime('');
      setDuration('60');
      setLocation('');
      setAttendees('');
      setMeetingType(data?.meetingType || 'regular');
      setErrors({});
    }
  }, [open, data?.initialTitle, data?.initialDescription, data?.meetingType]);

  // Réinitialiser quand le modal se ferme
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setTitle('');
        setDescription('');
        setDate('');
        setTime('');
        setDuration('60');
        setLocation('');
        setAttendees('');
        setMeetingType('regular');
        setErrors({});
        setIsSubmitting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = 'Le titre est obligatoire';
    }
    if (!date) {
      newErrors.date = 'La date est obligatoire';
    }
    if (!time) {
      newErrors.time = 'L\'heure est obligatoire';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Erreur de validation', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      // Ici, on pourrait envoyer la réunion à l'API
      logger.debug('Planification de réunion', {
        component: 'ScheduleMeetingModal',
        title,
        description,
        date,
        time,
        duration,
        location,
        attendees: attendees.split(',').map(a => a.trim()).filter(Boolean),
        meetingType,
        kpiId: data?.kpiId,
        kpiName: data?.kpiName,
      });

      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Réunion planifiée', `La réunion "${title}" a été planifiée avec succès`);
      onClose();
    } catch (error) {
      toast.error('Erreur', 'Impossible de planifier la réunion. Veuillez réessayer.');
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur planification réunion:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Planifier une réunion"
      maxWidth="5xl"
      dark
    >
      <div className="space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto pr-2">
        {/* Informations KPI */}
        {data?.kpiName && (
          <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <p className="text-xs text-slate-400 mb-1">KPI associé</p>
            <p className="text-sm font-medium text-slate-200">{data.kpiName}</p>
            {data.kpiId && (
              <p className="text-xs text-slate-400 mt-1">ID: {data.kpiId}</p>
            )}
          </div>
        )}

        {/* Formulaire */}
        <div className="space-y-4">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Titre de la réunion <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Réunion d'urgence - Analyse de l'écart de performance"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type de réunion */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Type de réunion
            </label>
            <div className="flex gap-2">
              {(['urgent', 'regular', 'follow-up'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMeetingType(type)}
                  className={cn(
                    'flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                    meetingType === type
                      ? type === 'urgent'
                        ? 'bg-red-500/20 border-red-500/50 text-red-400'
                        : type === 'regular'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                  )}
                >
                  {type === 'urgent' ? 'Urgente' : type === 'regular' ? 'Régulière' : 'Suivi'}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description / Ordre du jour
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez l'ordre du jour de la réunion..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Date et Heure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (errors.date) setErrors({ ...errors, date: '' });
                }}
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg border bg-slate-800/50 text-slate-200 focus:outline-none focus:ring-2",
                  errors.date
                    ? "border-red-500/50 focus:ring-red-500"
                    : "border-slate-700 focus:ring-blue-500"
                )}
              />
              {errors.date && (
                <p className="text-xs text-red-400 mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Heure <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  if (errors.time) setErrors({ ...errors, time: '' });
                }}
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg border bg-slate-800/50 text-slate-200 focus:outline-none focus:ring-2",
                  errors.time
                    ? "border-red-500/50 focus:ring-red-500"
                    : "border-slate-700 focus:ring-blue-500"
                )}
              />
              {errors.time && (
                <p className="text-xs text-red-400 mt-1">{errors.time}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Durée (minutes)
              </label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="w-full h-10 rounded-lg border-slate-700 bg-slate-800/50 text-slate-200 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Durée" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 heure</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                  <SelectItem value="120">2 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Lieu et Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Lieu
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Salle de réunion, Teams, Zoom..."
                className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Participants (séparés par des virgules)
              </label>
              <input
                type="text"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                placeholder="nom1@email.com, nom2@email.com"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-slate-700/50 sticky bottom-0 bg-slate-900/95 pb-2 -mx-2 px-2">
          <FluentButton variant="secondary" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Annuler
          </FluentButton>
          <FluentButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Planification...' : 'Planifier la réunion'}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

