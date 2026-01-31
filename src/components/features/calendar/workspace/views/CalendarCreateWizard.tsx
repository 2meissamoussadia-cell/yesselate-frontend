'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarTab } from '@/lib/stores/calendarWorkspaceStore';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Target,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  FileText,
  History as HistoryIcon,
  Download,
  Copy,
  Send,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * CalendarCreateWizard
 * ====================
 * 
 * Assistant de création d'événement étape par étape.
 */

interface Props {
  tab: CalendarTab;
}

type WizardStep = 'basic' | 'datetime' | 'participants' | 'logistics' | 'review';

export function CalendarCreateWizard({ tab }: Props) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('basic');
  const [saving, setSaving] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    kind: 'meeting' as const,
    bureau: 'BMO',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: format(new Date(), 'HH:mm'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    endTime: format(new Date(Date.now() + 3600000), 'HH:mm'),
    priority: 'normal' as const,
    participants: [] as { id: string; name: string; required: boolean }[],
    location: '',
    equipment: '',
    budget: '',
    notes: '',
  });

  const steps: { id: WizardStep; label: string; icon: typeof FileText }[] = [
    { id: 'basic', label: 'Informations', icon: FileText },
    { id: 'datetime', label: 'Date & Heure', icon: Calendar },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'logistics', label: 'Logistique', icon: MapPin },
    { id: 'review', label: 'Confirmation', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const canGoNext = useCallback(() => {
    switch (currentStep) {
      case 'basic':
        return formData.title.trim() !== '' && formData.kind !== null;
      case 'datetime':
        return formData.startDate && formData.startTime;
      case 'participants':
      case 'logistics':
        return true; // Optionnel
      case 'review':
        return true;
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: API call
      await new Promise(r => setTimeout(r, 1000));
      console.log('Événement créé:', formData);
      // TODO: Rediriger ou ouvrir l'événement créé
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-[#1f1f1f]/70 overflow-hidden">
      {/* Progress */}
      <div className="border-b border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
            Nouvel événement
          </h2>
          <span className="text-sm text-slate-400">
            Étape {currentStepIndex + 1}/{steps.length}
          </span>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = idx < currentStepIndex;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium w-full',
                    isActive && 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
                    isCompleted && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
                    !isActive && !isCompleted && 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                  onClick={() => idx <= currentStepIndex && setCurrentStep(step.id)}
                  disabled={idx > currentStepIndex}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{step.label}</span>
                  {isCompleted && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                </button>
                {idx < steps.length - 1 && (
                  <div className={cn(
                    'h-0.5 w-4 mx-1',
                    idx < currentStepIndex ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {currentStep === 'basic' && (
            <BasicInfoStep formData={formData} onChange={updateFormData} />
          )}
          {currentStep === 'datetime' && (
            <DateTimeStep formData={formData} onChange={updateFormData} />
          )}
          {currentStep === 'participants' && (
            <ParticipantsStep formData={formData} onChange={updateFormData} />
          )}
          {currentStep === 'logistics' && (
            <LogisticsStep formData={formData} onChange={updateFormData} />
          )}
          {currentStep === 'review' && (
            <ReviewStep formData={formData} />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
        <FluentButton
          size="sm"
          variant="secondary"
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
        >
          Précédent
        </FluentButton>

        <div className="flex items-center gap-2">
          {currentStep === 'review' ? (
            <FluentButton
              size="sm"
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Créer l&apos;événement
                </>
              )}
            </FluentButton>
          ) : (
            <FluentButton
              size="sm"
              variant="primary"
              onClick={handleNext}
              disabled={!canGoNext()}
            >
              Suivant
            </FluentButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// WIZARD STEPS
// ============================================

function BasicInfoStep({ formData, onChange }: {
  formData: any;
  onChange: (updates: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Titre *
        </label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          placeholder="Ex: Réunion de suivi projet"
          value={formData.title}
          onChange={(e) => onChange({ title: e.target.value })}
          autoFocus
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>
        <textarea
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          rows={3}
          placeholder="Description détaillée..."
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Type *
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={formData.kind}
            onChange={(e) => onChange({ kind: e.target.value })}
          >
            <option value="meeting">Réunion</option>
            <option value="site-visit">Visite de site</option>
            <option value="validation">Validation</option>
            <option value="payment">Paiement</option>
            <option value="contract">Contrat</option>
            <option value="deadline">Échéance</option>
            <option value="absence">Absence</option>
            <option value="other">Autre</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Bureau
          </label>
          <select
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={formData.bureau}
            onChange={(e) => onChange({ bureau: e.target.value })}
          >
            <option value="BMO">BMO</option>
            <option value="DAF">DAF</option>
            <option value="DG">DG</option>
            <option value="RH">RH</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Priorité
        </label>
        <div className="mt-2 flex gap-2">
          {(['normal', 'urgent', 'critical'] as const).map(p => (
            <button
              key={p}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg transition-all text-sm font-medium',
                formData.priority === p
                  ? p === 'critical'
                    ? 'bg-rose-500 text-white'
                    : p === 'urgent'
                    ? 'bg-amber-500 text-white'
                    : 'bg-blue-500 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              )}
              onClick={() => onChange({ priority: p })}
            >
              {p === 'critical' ? 'Critique' : p === 'urgent' ? 'Urgent' : 'Normal'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DateTimeStep({ formData, onChange }: {
  formData: any;
  onChange: (updates: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Date de début *
          </label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={formData.startDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Heure de début *
          </label>
          <input
            type="time"
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={formData.startTime}
            onChange={(e) => onChange({ startTime: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Date de fin
          </label>
          <input
            type="date"
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={formData.endDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Heure de fin
          </label>
          <input
            type="time"
            className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            value={formData.endTime}
            onChange={(e) => onChange({ endTime: e.target.value })}
          />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          💡 <strong>Astuce:</strong> La détection automatique de conflits vérifiera
          la disponibilité des participants à ce créneau.
        </p>
      </div>
    </div>
  );
}

function ParticipantsStep({ formData, onChange }: {
  formData: any;
  onChange: (updates: any) => void;
}) {
  const [newParticipant, setNewParticipant] = useState('');

  const addParticipant = () => {
    if (!newParticipant.trim()) return;
    onChange({
      participants: [
        ...formData.participants,
        { id: `P-${Date.now()}`, name: newParticipant, required: true },
      ],
    });
    setNewParticipant('');
  };

  const removeParticipant = (id: string) => {
    onChange({
      participants: formData.participants.filter((p: any) => p.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Ajouter un participant
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            className="flex-1 rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            placeholder="Nom du participant..."
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
          />
          <FluentButton size="md" variant="primary" onClick={addParticipant}>
            <Plus className="w-4 h-4" />
            Ajouter
          </FluentButton>
        </div>
      </div>

      {formData.participants.length > 0 ? (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Participants ({formData.participants.length})
          </label>
          {formData.participants.map((p: any) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800"
            >
              <span className="text-sm text-slate-700 dark:text-slate-300">{p.name}</span>
              <FluentButton size="sm" variant="destructive" onClick={() => removeParticipant(p.id)}>
                <XCircle className="w-3 h-3" />
              </FluentButton>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Aucun participant ajouté</p>
        </div>
      )}
    </div>
  );
}

function LogisticsStep({ formData, onChange }: {
  formData: any;
  onChange: (updates: any) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Lieu
        </label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          placeholder="Ex: Salle de réunion A, Site X..."
          value={formData.location}
          onChange={(e) => onChange({ location: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Équipement nécessaire
        </label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          placeholder="Ex: Projecteur, Visioconférence..."
          value={formData.equipment}
          onChange={(e) => onChange({ equipment: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Budget estimé (FCFA)
        </label>
        <input
          type="number"
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          placeholder="0"
          value={formData.budget}
          onChange={(e) => onChange({ budget: e.target.value })}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Notes supplémentaires
        </label>
        <textarea
          className="mt-1 w-full rounded-xl border border-slate-200/70 bg-white/90 p-3 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          rows={3}
          placeholder="Notes, instructions..."
          value={formData.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
        />
      </div>
    </div>
  );
}

function ReviewStep({ formData }: { formData: any }) {
  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
          Vérifiez les informations avant de créer l&apos;événement
        </p>
      </div>

      <div className="space-y-4">
        <Section title="Informations générales">
          <InfoItem label="Titre" value={formData.title} />
          <InfoItem label="Description" value={formData.description || '—'} />
          <InfoItem label="Type" value={formData.kind} />
          <InfoItem label="Bureau" value={formData.bureau} />
          <InfoItem label="Priorité" value={formData.priority} />
        </Section>

        <Section title="Date & Heure">
          <InfoItem label="Début" value={`${formData.startDate} ${formData.startTime}`} />
          <InfoItem label="Fin" value={`${formData.endDate} ${formData.endTime}`} />
        </Section>

        {formData.participants.length > 0 && (
          <Section title="Participants">
            <InfoItem label="Nombre" value={formData.participants.length} />
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.participants.map((p: any) => (
                <span
                  key={p.id}
                  className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300"
                >
                  {p.name}
                </span>
              ))}
            </div>
          </Section>
        )}

        {(formData.location || formData.equipment || formData.budget) && (
          <Section title="Logistique">
            {formData.location && <InfoItem label="Lieu" value={formData.location} />}
            {formData.equipment && <InfoItem label="Équipement" value={formData.equipment} />}
            {formData.budget && <InfoItem label="Budget" value={`${formData.budget} FCFA`} />}
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
      <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-400">{label}:</span>
      <span className="font-medium text-slate-700 dark:text-slate-300">{value}</span>
    </div>
  );
}
