'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useCalendarWorkspaceStore } from '@/lib/stores/calendarWorkspaceStore';
import { FluentButton } from '@/components/ui/fluent-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/cn';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
  MapPin,
  X,
  Save,
  CheckCircle2,
  ArrowRight,
  Building2,
  Tag,
  FileText,
  Link,
  Bell,
  Repeat,
  Flag,
  Info,
  Check,
  Zap,
  Target,
  Eye,
  Send,
  CalendarCheck,
  Sparkles,
} from 'lucide-react';

// ================================
// Types
// ================================
type WizardStep = 'basics' | 'datetime' | 'details' | 'attendees' | 'links' | 'review';

interface EventFormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  recurrence: string;
  
  location: string;
  bureau: string;
  notes: string;
  tags: string[];
  
  attendees: { name: string; email: string; role: string }[];
  
  links: { type: string; ref: string; title: string }[];
  
  reminders: { type: string; time: string }[];
  notifications: boolean;
}

const DEFAULT_FORM_DATA: EventFormData = {
  title: '',
  description: '',
  category: 'meeting',
  priority: 'normal',
  
  startDate: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endDate: new Date().toISOString().split('T')[0],
  endTime: '10:00',
  allDay: false,
  recurrence: 'none',
  
  location: '',
  bureau: '',
  notes: '',
  tags: [],
  
  attendees: [],
  
  links: [],
  
  reminders: [{ type: 'email', time: '15min' }],
  notifications: true,
};

// ================================
// Constants
// ================================
const STEPS: { id: WizardStep; label: string; icon: React.ReactNode }[] = [
  { id: 'basics', label: 'Informations', icon: <FileText className="w-4 h-4" /> },
  { id: 'datetime', label: 'Date & Heure', icon: <Calendar className="w-4 h-4" /> },
  { id: 'details', label: 'Détails', icon: <Tag className="w-4 h-4" /> },
  { id: 'attendees', label: 'Participants', icon: <Users className="w-4 h-4" /> },
  { id: 'links', label: 'Liens', icon: <Link className="w-4 h-4" /> },
  { id: 'review', label: 'Validation', icon: <CheckCircle2 className="w-4 h-4" /> },
];

const CATEGORIES = [
  { id: 'meeting', label: 'Réunion', icon: '👥', color: 'bg-blue-500' },
  { id: 'site_visit', label: 'Visite de site', icon: '🏗️', color: 'bg-emerald-500' },
  { id: 'deadline', label: 'Échéance', icon: '⏰', color: 'bg-amber-500' },
  { id: 'validation', label: 'Validation', icon: '✅', color: 'bg-purple-500' },
  { id: 'payment', label: 'Paiement', icon: '💰', color: 'bg-green-500' },
  { id: 'absence', label: 'Absence', icon: '🏖️', color: 'bg-slate-400' },
  { id: 'training', label: 'Formation', icon: '📚', color: 'bg-indigo-500' },
  { id: 'other', label: 'Autre', icon: '📌', color: 'bg-slate-500' },
];

const PRIORITIES = [
  { id: 'critical', label: 'Critique', color: 'rose', description: 'Impact majeur, action immédiate requise' },
  { id: 'urgent', label: 'Urgent', color: 'amber', description: 'À traiter dans les 24h' },
  { id: 'high', label: 'Haute', color: 'orange', description: 'Important, à planifier cette semaine' },
  { id: 'normal', label: 'Normale', color: 'blue', description: 'Traitement standard' },
  { id: 'low', label: 'Basse', color: 'slate', description: 'Peut attendre si nécessaire' },
];

const RECURRENCE_OPTIONS = [
  { id: 'none', label: 'Aucune récurrence' },
  { id: 'daily', label: 'Tous les jours' },
  { id: 'weekly', label: 'Toutes les semaines' },
  { id: 'biweekly', label: 'Toutes les 2 semaines' },
  { id: 'monthly', label: 'Tous les mois' },
  { id: 'yearly', label: 'Tous les ans' },
];

const LINK_TYPES = [
  { id: 'demande', label: 'Demande', icon: '📝' },
  { id: 'delegation', label: 'Délégation', icon: '🔑' },
  { id: 'marche', label: 'Marché', icon: '📋' },
  { id: 'facture', label: 'Facture', icon: '🧾' },
  { id: 'document', label: 'Document', icon: '📄' },
  { id: 'url', label: 'Lien externe', icon: '🔗' },
];

const BUREAUS = [
  'Bureau 1 - Finances',
  'Bureau 2 - Marchés Publics',
  'Bureau 3 - Ressources Humaines',
  'Bureau 4 - Technique',
  'Bureau 5 - Juridique',
  'Direction Générale',
];

// ================================
// Component
// ================================
interface CalendarWizardViewProps {
  tabId: string;
  action: 'create' | 'edit';
  eventId?: string;
  prefillDate?: string;
}

export function CalendarWizardView({ tabId, action, eventId, prefillDate }: CalendarWizardViewProps) {
  const { closeTab, openTab } = useCalendarWorkspaceStore();

  // ================================
  // State
  // ================================
  const [currentStep, setCurrentStep] = useState<WizardStep>('basics');
  const [formData, setFormData] = useState<EventFormData>(() => {
    const data = { ...DEFAULT_FORM_DATA };
    if (prefillDate) {
      data.startDate = prefillDate.split('T')[0];
      data.endDate = prefillDate.split('T')[0];
    }
    return data;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [newAttendee, setNewAttendee] = useState({ name: '', email: '', role: 'participant' });
  const [newLink, setNewLink] = useState({ type: 'demande', ref: '', title: '' });

  // ================================
  // Navigation
  // ================================
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
  }, []);

  const goNext = useCallback(() => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
    }
  }, [currentStepIndex]);

  const goPrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
    }
  }, [currentStepIndex]);

  // ================================
  // Validation
  // ================================
  const validateStep = useCallback((step: WizardStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 'basics':
        if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
        if (formData.title.length > 100) newErrors.title = 'Le titre ne peut pas dépasser 100 caractères';
        break;
      case 'datetime':
        if (!formData.startDate) newErrors.startDate = 'La date de début est requise';
        if (!formData.allDay && !formData.startTime) newErrors.startTime = "L'heure de début est requise";
        if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
          newErrors.endDate = 'La date de fin doit être après la date de début';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const isStepComplete = useCallback((step: WizardStep): boolean => {
    switch (step) {
      case 'basics':
        return !!formData.title.trim() && !!formData.category;
      case 'datetime':
        return !!formData.startDate && (formData.allDay || !!formData.startTime);
      case 'details':
        return true; // Optional
      case 'attendees':
        return true; // Optional
      case 'links':
        return true; // Optional
      case 'review':
        return true;
      default:
        return false;
    }
  }, [formData]);

  const canSubmit = useMemo(() => {
    return isStepComplete('basics') && isStepComplete('datetime');
  }, [isStepComplete]);

  // ================================
  // Form handlers
  // ================================
  const updateForm = useCallback((updates: Partial<EventFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setErrors({});
  }, []);

  const addTag = useCallback(() => {
    if (newTagInput.trim() && !formData.tags.includes(newTagInput.trim())) {
      updateForm({ tags: [...formData.tags, newTagInput.trim()] });
      setNewTagInput('');
    }
  }, [newTagInput, formData.tags, updateForm]);

  const removeTag = useCallback((tag: string) => {
    updateForm({ tags: formData.tags.filter(t => t !== tag) });
  }, [formData.tags, updateForm]);

  const addAttendee = useCallback(() => {
    if (newAttendee.name.trim()) {
      updateForm({ attendees: [...formData.attendees, { ...newAttendee }] });
      setNewAttendee({ name: '', email: '', role: 'participant' });
    }
  }, [newAttendee, formData.attendees, updateForm]);

  const removeAttendee = useCallback((index: number) => {
    updateForm({ attendees: formData.attendees.filter((_, i) => i !== index) });
  }, [formData.attendees, updateForm]);

  const addLink = useCallback(() => {
    if (newLink.ref.trim()) {
      updateForm({ links: [...formData.links, { ...newLink, title: newLink.title || newLink.ref }] });
      setNewLink({ type: 'demande', ref: '', title: '' });
    }
  }, [newLink, formData.links, updateForm]);

  const removeLink = useCallback((index: number) => {
    updateForm({ links: formData.links.filter((_, i) => i !== index) });
  }, [formData.links, updateForm]);

  // ================================
  // Submit
  // ================================
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1500));

      // TODO: Implement actual API call
      console.log('Saving event:', formData);

      setSaved(true);

      // Close after brief delay
      setTimeout(() => {
        closeTab(tabId);
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  }, [canSubmit, formData, closeTab, tabId]);

  // ================================
  // Render Step Content
  // ================================
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Titre de l&apos;événement <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => updateForm({ title: e.target.value })}
                placeholder="Ex: Réunion de suivi chantier..."
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-lg outline-none transition-all",
                  errors.title
                    ? "border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                )}
              />
              {errors.title && <p className="text-sm text-rose-500 mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => updateForm({ description: e.target.value })}
                placeholder="Détaillez l'objet de cet événement..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Catégorie <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    className={cn(
                      "p-3 rounded-xl border transition-all text-left",
                      formData.category === cat.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                    )}
                    onClick={() => updateForm({ category: cat.id })}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cat.icon}</span>
                      <span className={cn("w-2 h-2 rounded-full", cat.color)} />
                    </div>
                    <div className="text-sm font-medium mt-1">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priorité
              </label>
              <div className="space-y-2">
                {PRIORITIES.map(prio => (
                  <button
                    key={prio.id}
                    type="button"
                    className={cn(
                      "w-full p-3 rounded-xl border transition-all text-left flex items-center justify-between",
                      formData.priority === prio.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                    )}
                    onClick={() => updateForm({ priority: prio.id })}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        prio.color === 'rose' && "bg-rose-500",
                        prio.color === 'amber' && "bg-amber-500",
                        prio.color === 'orange' && "bg-orange-500",
                        prio.color === 'blue' && "bg-blue-500",
                        prio.color === 'slate' && "bg-slate-400"
                      )} />
                      <div>
                        <div className="font-medium">{prio.label}</div>
                        <div className="text-xs text-slate-400">{prio.description}</div>
                      </div>
                    </div>
                    {formData.priority === prio.id && (
                      <Check className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'datetime':
        return (
          <div className="space-y-6">
            {/* All day toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <div className="font-medium">Journée entière</div>
                <div className="text-sm text-slate-400">Cet événement dure toute la journée</div>
              </div>
              <button
                type="button"
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  formData.allDay ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
                )}
                onClick={() => updateForm({ allDay: !formData.allDay })}
              >
                <span className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  formData.allDay ? "translate-x-7" : "translate-x-1"
                )} />
              </button>
            </div>

            {/* Start date/time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date de début <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => updateForm({ startDate: e.target.value, endDate: e.target.value })}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 outline-none transition-all",
                    errors.startDate
                      ? "border-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                  )}
                />
                {errors.startDate && <p className="text-sm text-rose-500 mt-1">{errors.startDate}</p>}
              </div>

              {!formData.allDay && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Heure de début <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={e => updateForm({ startTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* End date/time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => updateForm({ endDate: e.target.value })}
                  min={formData.startDate}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 outline-none transition-all",
                    errors.endDate
                      ? "border-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-blue-500"
                  )}
                />
                {errors.endDate && <p className="text-sm text-rose-500 mt-1">{errors.endDate}</p>}
              </div>

              {!formData.allDay && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={e => updateForm({ endTime: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Recurrence */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Repeat className="w-4 h-4 inline mr-1" />
                Récurrence
              </label>
              <Select value={formData.recurrence} onValueChange={(v) => updateForm({ recurrence: v })}>
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Récurrence" />
                </SelectTrigger>
                <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  {RECURRENCE_OPTIONS.map(opt => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conflict warning */}
            {showConflictWarning && (
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-amber-800 dark:text-amber-200">Conflit potentiel détecté</div>
                    <div className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Un autre événement est prévu à ce créneau. Vérifiez votre planning.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Lieu
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e => updateForm({ location: e.target.value })}
                placeholder="Salle de réunion, adresse..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            {/* Bureau */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Bureau responsable
              </label>
              <Select value={formData.bureau || '__none__'} onValueChange={(v) => updateForm({ bureau: v === '__none__' ? '' : v })}>
                <SelectTrigger className="w-full h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                  <SelectValue placeholder="Sélectionner un bureau..." />
                </SelectTrigger>
                <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <SelectItem value="__none__">Sélectionner un bureau...</SelectItem>
                  {BUREAUS.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm"
                  >
                    {tag}
                    <button onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Ajouter un tag..."
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500"
                />
                <FluentButton size="sm" variant="secondary" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </FluentButton>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Notes internes
              </label>
              <textarea
                value={formData.notes}
                onChange={e => updateForm({ notes: e.target.value })}
                placeholder="Notes visibles uniquement par les organisateurs..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-slate-400">Envoyer des rappels aux participants</div>
                </div>
              </div>
              <button
                type="button"
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  formData.notifications ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"
                )}
                onClick={() => updateForm({ notifications: !formData.notifications })}
              >
                <span className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  formData.notifications ? "translate-x-7" : "translate-x-1"
                )} />
              </button>
            </div>
          </div>
        );

      case 'attendees':
        return (
          <div className="space-y-6">
            {/* Attendees list */}
            {formData.attendees.length > 0 && (
              <div className="space-y-2">
                {formData.attendees.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-medium">
                      {att.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{att.name}</div>
                      <div className="text-sm text-slate-400 truncate">{att.email || 'Pas d\'email'}</div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600">
                      {att.role === 'organizer' ? 'Organisateur' : 'Participant'}
                    </span>
                    <button
                      onClick={() => removeAttendee(idx)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add attendee form */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Ajouter un participant
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newAttendee.name}
                  onChange={e => setNewAttendee(a => ({ ...a, name: e.target.value }))}
                  placeholder="Nom *"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500"
                />
                <input
                  type="email"
                  value={newAttendee.email}
                  onChange={e => setNewAttendee(a => ({ ...a, email: e.target.value }))}
                  placeholder="Email"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Select
                  value={newAttendee.role}
                  onValueChange={(value: string) => setNewAttendee(a => ({ ...a, role: value }))}
                >
                  <SelectTrigger className="w-[180px] px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participant">Participant</SelectItem>
                    <SelectItem value="organizer">Organisateur</SelectItem>
                  </SelectContent>
                </Select>
                <FluentButton size="sm" variant="primary" onClick={addAttendee} disabled={!newAttendee.name.trim()}>
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </FluentButton>
              </div>
            </div>

            {formData.attendees.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Aucun participant ajouté</p>
                <p className="text-sm">Les participants recevront une invitation par email</p>
              </div>
            )}
          </div>
        );

      case 'links':
        return (
          <div className="space-y-6">
            {/* Links list */}
            {formData.links.length > 0 && (
              <div className="space-y-2">
                {formData.links.map((link, idx) => {
                  const linkType = LINK_TYPES.find(t => t.id === link.type);
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <span className="text-xl">{linkType?.icon || '🔗'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{link.title}</div>
                        <div className="text-sm text-slate-400 truncate">
                          {linkType?.label} • {link.ref}
                        </div>
                      </div>
                      <button
                        onClick={() => removeLink(idx)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add link form */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Link className="w-4 h-4" />
                Lier à un élément
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Select value={newLink.type} onValueChange={(v) => setNewLink(l => ({ ...l, type: v }))}>
                  <SelectTrigger className="min-w-[140px] h-9 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    {LINK_TYPES.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.icon} {t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="text"
                  value={newLink.ref}
                  onChange={e => setNewLink(l => ({ ...l, ref: e.target.value }))}
                  placeholder="Référence (ex: DEM-2025-001)"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  value={newLink.title}
                  onChange={e => setNewLink(l => ({ ...l, title: e.target.value }))}
                  placeholder="Titre (optionnel)"
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-blue-500"
                />
              </div>
              <div className="mt-3">
                <FluentButton size="sm" variant="primary" onClick={addLink} disabled={!newLink.ref.trim()}>
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter le lien
                </FluentButton>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Astuce :</strong> Liez cet événement à des demandes, délégations ou marchés pour
                  retrouver facilement le contexte et naviguer entre les éléments.
                </div>
              </div>
            </div>
          </div>
        );

      case 'review':
        const category = CATEGORIES.find(c => c.id === formData.category);
        const priority = PRIORITIES.find(p => p.id === formData.priority);

        return (
          <div className="space-y-6">
            {/* Success state */}
            {saved ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300">Événement créé !</h3>
                <p className="text-slate-400 mt-2">L&apos;événement a été ajouté à votre calendrier</p>
              </div>
            ) : (
              <>
                {/* Summary card */}
                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white text-2xl", category?.color || 'bg-blue-500')}>
                      {category?.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{formData.title || 'Sans titre'}</h3>
                      {formData.description && (
                        <p className="text-slate-400 mt-1">{formData.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(formData.startDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formData.allDay ? 'Journée entière' : `${formData.startTime} - ${formData.endTime}`}
                      </span>
                    </div>
                    {formData.location && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4" />
                        <span>{formData.location}</span>
                      </div>
                    )}
                    {formData.bureau && (
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Building2 className="w-4 h-4" />
                        <span>{formData.bureau}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={cn("text-xs px-2 py-1 rounded-full", category?.color, 'text-white')}>
                      {category?.label}
                    </span>
                    {priority && priority.id !== 'normal' && (
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        priority.color === 'rose' && "bg-rose-100 text-rose-700",
                        priority.color === 'amber' && "bg-amber-100 text-amber-700",
                        priority.color === 'orange' && "bg-orange-100 text-orange-700"
                      )}>
                        Priorité {priority.label}
                      </span>
                    )}
                    {formData.recurrence !== 'none' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        Récurrent
                      </span>
                    )}
                    {formData.notifications && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        Notifications
                      </span>
                    )}
                  </div>
                </div>

                {/* Attendees summary */}
                {formData.attendees.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {formData.attendees.length} participant{formData.attendees.length > 1 ? 's' : ''}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.attendees.map((a, i) => (
                        <span key={i} className="text-sm px-2 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          {a.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links summary */}
                {formData.links.length > 0 && (
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Link className="w-4 h-4" />
                      {formData.links.length} lien{formData.links.length > 1 ? 's' : ''}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.links.map((l, i) => (
                        <span key={i} className="text-sm px-2 py-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                          {LINK_TYPES.find(t => t.id === l.type)?.icon} {l.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Validation message */}
                {!canSubmit && (
                  <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      <div>
                        <div className="font-medium text-amber-800 dark:text-amber-200">Informations manquantes</div>
                        <div className="text-sm text-amber-700 dark:text-amber-300">
                          Veuillez compléter les étapes obligatoires (Informations et Date & Heure)
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {errors.submit && (
                  <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-200">
                    {errors.submit}
                  </div>
                )}
              </>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ================================
  // Render
  // ================================
  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">
                {action === 'create' ? 'Nouvel événement' : 'Modifier l\'événement'}
              </h1>
              <p className="text-sm text-slate-400">
                Étape {currentStepIndex + 1} sur {STEPS.length} • {STEPS[currentStepIndex].label}
              </p>
            </div>
          </div>
          <FluentButton size="sm" variant="secondary" onClick={() => closeTab(tabId)}>
            <X className="w-4 h-4 mr-1" />
            Annuler
          </FluentButton>
        </div>
      </div>

      {/* Progress steps */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {STEPS.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isComplete = idx < currentStepIndex || (idx === currentStepIndex && isStepComplete(step.id));
            const isPast = idx < currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <button
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                    isActive
                      ? "bg-blue-500 text-white"
                      : isPast
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  )}
                  onClick={() => goToStep(step.id)}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                  <span className="text-sm font-medium">{step.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl mx-auto">
          {renderStepContent()}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            {currentStepIndex > 0 && !saved && (
              <FluentButton size="sm" variant="secondary" onClick={goPrev}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </FluentButton>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep === 'review' ? (
              !saved && (
                <FluentButton
                  size="sm"
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={!canSubmit || saving}
                >
                  {saving ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Créer l&apos;événement
                    </>
                  )}
                </FluentButton>
              )
            ) : (
              <FluentButton size="sm" variant="primary" onClick={goNext}>
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </FluentButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarWizardView;

