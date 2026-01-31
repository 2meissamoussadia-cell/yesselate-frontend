/**
 * Interaction Modal - Enregistrer une nouvelle interaction client
 * Call, Email, Meeting, Demo, Visit, Support
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Phone,
  Mail,
  Users,
  Monitor,
  MapPin,
  Headphones,
  Calendar,
  Clock,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Plus,
  Tag,
  Paperclip,
} from 'lucide-react';

interface InteractionModalProps {
  open: boolean;
  onClose: () => void;
  clientName?: string;
  clientId?: string;
  onSave?: (data: InteractionFormData) => void;
}

export interface InteractionFormData {
  type: 'call' | 'email' | 'meeting' | 'demo' | 'visit' | 'support';
  subject: string;
  description: string;
  date: string;
  time: string;
  duration?: number;
  participants: string[];
  outcome?: 'positive' | 'neutral' | 'negative';
  followUp?: string;
  tags: string[];
  attachments?: File[];
}

const interactionTypes = [
  { id: 'call', label: 'Appel', icon: Phone, color: 'blue' },
  { id: 'email', label: 'Email', icon: Mail, color: 'cyan' },
  { id: 'meeting', label: 'Réunion', icon: Users, color: 'purple' },
  { id: 'demo', label: 'Démo', icon: Monitor, color: 'indigo' },
  { id: 'visit', label: 'Visite', icon: MapPin, color: 'emerald' },
  { id: 'support', label: 'Support', icon: Headphones, color: 'amber' },
];

const outcomeOptions = [
  { id: 'positive', label: 'Positif', icon: ThumbsUp, color: 'emerald' },
  { id: 'neutral', label: 'Neutre', icon: Minus, color: 'slate' },
  { id: 'negative', label: 'Négatif', icon: ThumbsDown, color: 'rose' },
];

const quickTags = [
  'Urgent',
  'Réclamation',
  'Commercial',
  'Technique',
  'Renouvellement',
  'Upsell',
  'Feedback',
  'Formation',
];

export function InteractionModal({
  open,
  onClose,
  clientName,
  clientId,
  onSave,
}: InteractionModalProps) {
  const [formData, setFormData] = useState<InteractionFormData>({
    type: 'call',
    subject: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    duration: 30,
    participants: [],
    outcome: undefined,
    followUp: '',
    tags: [],
    attachments: [],
  });

  const [participantInput, setParticipantInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const selectedType = interactionTypes.find(t => t.id === formData.type);
  const Icon = selectedType?.icon || Phone;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.subject.trim()) {
      newErrors.subject = 'Le sujet est requis';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave?.(formData);
    onClose();
  };

  const addParticipant = () => {
    if (participantInput.trim() && !formData.participants.includes(participantInput.trim())) {
      setFormData({
        ...formData,
        participants: [...formData.participants, participantInput.trim()],
      });
      setParticipantInput('');
    }
  };

  const removeParticipant = (participant: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter(p => p !== participant),
    });
  };

  const toggleTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.includes(tag)
        ? formData.tags.filter(t => t !== tag)
        : [...formData.tags, tag],
    });
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[700px] md:max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-2xl z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              `bg-${selectedType?.color}-500/20 border border-${selectedType?.color}-500/30`
            )}>
              <Icon className={cn('w-5 h-5', `text-${selectedType?.color}-400`)} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Nouvelle interaction</h2>
              {clientName && (
                <p className="text-sm text-slate-400">Client: {clientName}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Type d'interaction *
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {interactionTypes.map((type) => {
                  const TypeIcon = type.icon;
                  const isSelected = formData.type === type.id;

                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.id as any })}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                        isSelected
                          ? `bg-${type.color}-500/20 border-${type.color}-500/50 text-${type.color}-400`
                          : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600'
                      )}
                    >
                      <TypeIcon className="w-5 h-5" />
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Sujet *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => {
                  setFormData({ ...formData, subject: e.target.value });
                  if (errors.subject) setErrors({ ...errors, subject: '' });
                }}
                placeholder="Ex: Suivi projet, Réclamation, Demo produit..."
                className={cn(
                  'w-full px-4 py-2 rounded-lg bg-slate-800/50 border text-slate-200 placeholder:text-slate-400',
                  errors.subject ? 'border-rose-500/50' : 'border-slate-700/50 focus:border-cyan-500/50',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500/20'
                )}
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.subject}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  if (errors.description) setErrors({ ...errors, description: '' });
                }}
                placeholder="Détaillez le contenu de l'interaction..."
                rows={4}
                className={cn(
                  'w-full px-4 py-2 rounded-lg bg-slate-800/50 border text-slate-200 placeholder:text-slate-400 resize-none',
                  errors.description ? 'border-rose-500/50' : 'border-slate-700/50 focus:border-cyan-500/50',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500/20'
                )}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Date, Time, Duration */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Heure
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Durée (min)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || undefined })}
                  placeholder="30"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Participants
              </label>
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={participantInput}
                    onChange={(e) => setParticipantInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                    placeholder="Nom du participant"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
                <Button
                  type="button"
                  onClick={addParticipant}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {formData.participants.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.participants.map((participant, idx) => (
                    <Badge
                      key={idx}
                      className="bg-slate-800 text-slate-300 border-slate-700/50 pr-1"
                    >
                      {participant}
                      <button
                        type="button"
                        onClick={() => removeParticipant(participant)}
                        className="ml-2 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Résultat
              </label>
              <div className="flex gap-2">
                {outcomeOptions.map((option) => {
                  const OutcomeIcon = option.icon;
                  const isSelected = formData.outcome === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFormData({
                        ...formData,
                        outcome: isSelected ? undefined : option.id as any,
                      })}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-all',
                        isSelected
                          ? `bg-${option.color}-500/20 border-${option.color}-500/50 text-${option.color}-400`
                          : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600'
                      )}
                    >
                      <OutcomeIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Follow-up */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Action de suivi
              </label>
              <textarea
                value={formData.followUp}
                onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                placeholder="Quelle est la prochaine étape ?..."
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-400 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                      formData.tags.includes(tag)
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                        : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/50 bg-slate-900/60">
            <div className="text-sm text-slate-400">
              * Champs obligatoires
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

