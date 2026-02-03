'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import type { CalendarEvent } from '@/lib/types/bmo.types';
import { bureaux } from '@/lib/data';

interface ActivityPlanningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activity: Partial<CalendarEvent>) => void;
  existingActivity?: CalendarEvent;
  conflicts?: Array<{ type: string; description: string; severity: string }>;
  onConflictDetect?: (activityData: Partial<CalendarEvent>) => void;
}

export function ActivityPlanningModal({
  isOpen,
  onClose,
  onSave,
  existingActivity,
  conflicts = [],
  onConflictDetect,
}: ActivityPlanningModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  
  // Les conflits sont passés en props et affichés automatiquement

  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    title: existingActivity?.title || '',
    type: existingActivity?.type || 'meeting',
    date: existingActivity?.date || new Date().toISOString().split('T')[0],
    time: existingActivity?.time || '10:00',
    endDate: existingActivity?.endDate,
    location: existingActivity?.location || '',
    priority: existingActivity?.priority || 'normal',
    bureau: existingActivity?.bureau || '',
    project: existingActivity?.project || '',
    estimatedCharge: existingActivity?.estimatedCharge || 1,
    participants: existingActivity?.participants || [],
    dependencies: existingActivity?.dependencies || [],
  });

  const bureauxList = bureaux || [
    { code: 'BMO', name: "Maîtrise d'Ouvrage" },
    { code: 'BF', name: 'Bureau Finance' },
    { code: 'BM', name: 'Bureau Marchés' },
    { code: 'BCT', name: 'Bureau Contrôle Technique' },
  ];

  const eventTypes = [
    { value: 'meeting', label: 'Réunion' },
    { value: 'visio', label: 'Visio' },
    { value: 'deadline', label: 'Échéance' },
    { value: 'site', label: 'Visite terrain' },
    { value: 'intervention', label: 'Intervention' },
    { value: 'audit', label: 'Audit' },
    { value: 'formation', label: 'Formation' },
    { value: 'training', label: 'Training' },
  ];

  // Recalculer les conflits quand le formulaire change (si onConflictDetect fourni)
  useEffect(() => {
    if (onConflictDetect && (formData.date || formData.bureau || formData.time)) {
      const timeoutId = setTimeout(() => {
        onConflictDetect(formData);
      }, 500); // Debounce 500ms
      return () => clearTimeout(timeoutId);
    }
  }, [formData.date, formData.bureau, formData.time, formData.project, formData.participants, onConflictDetect]);

  const handleSave = () => {
    if (!formData.title || !formData.date || !formData.time || !formData.bureau) {
      addToast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    // Les conflits sont affichés dans la modale mais n'empêchent pas la sauvegarde
    // L'utilisateur peut choisir de continuer malgré les conflits
    const criticalConflicts = conflicts.filter(c => c.severity === 'critical');
    if (criticalConflicts.length > 0) {
      const proceed = window.confirm(
        `${criticalConflicts.length} conflit(s) critique(s) détecté(s). Voulez-vous continuer malgré tout ?`
      );
      if (!proceed) {
        return;
      }
    }

    onSave(formData);
    if (!existingActivity) {
      addToast('Activité créée et ajoutée au calendrier', 'success');
    } else {
      addToast('Activité modifiée', 'success');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
          'w-full max-w-2xl max-h-[90vh] overflow-y-auto',
          darkMode ? 'bg-slate-900' : 'bg-white',
          'rounded-xl shadow-2xl border'
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              {existingActivity ? 'Modifier l\'activité' : 'Nouvelle activité'}
            </h2>
            <button
              onClick={onClose}
              className={cn(
                'p-2 rounded-lg transition-colors',
                darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
              )}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conflits détectés */}
          {conflicts.length > 0 && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-semibold text-amber-400">
                  Conflits détectés ({conflicts.length})
                </span>
              </div>
              <ul className="space-y-1 text-xs">
                {conflicts.map((conflict, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Badge variant={conflict.severity === 'critical' ? 'urgent' : 'warning'} className="text-[9px]">
                      {conflict.type}
                    </Badge>
                    <span>{conflict.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Titre */}
            <div>
              <label className="block text-xs font-semibold mb-1">Titre *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border text-sm',
                  darkMode
                    ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                    : 'bg-white border-gray-300 text-gray-700'
                )}
                placeholder="Réunion coordination bureaux"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Type */}
              <div>
                <label className="block text-xs font-semibold mb-1">Type *</label>
                <Select value={formData.type} onValueChange={(v: string) => setFormData({ ...formData, type: v as any })}>
                  <SelectTrigger className={cn(
                    'w-full px-3 py-2 rounded-lg border text-sm h-10',
                    darkMode
                      ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                      : 'bg-white border-gray-300 text-gray-700'
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {eventTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bureau */}
              <div>
                <label className="block text-xs font-semibold mb-1">Bureau *</label>
                <Select value={formData.bureau || '__none__'} onValueChange={(v: string) => setFormData({ ...formData, bureau: v === '__none__' ? '' : v })}>
                  <SelectTrigger className={cn(
                    'w-full px-3 py-2 rounded-lg border text-sm h-10',
                    darkMode
                      ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                      : 'bg-white border-gray-300 text-gray-700'
                  )}>
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Sélectionner...</SelectItem>
                    {bureauxList.map((bureau: { code: string; name: string }) => (
                      <SelectItem key={bureau.code} value={bureau.code}>
                        {bureau.code} - {bureau.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border text-sm',
                    darkMode
                      ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                      : 'bg-white border-gray-300 text-gray-700'
                  )}
                />
              </div>

              {/* Heure */}
              <div>
                <label className="block text-xs font-semibold mb-1">Heure *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className={cn(
                    'w-full px-3 py-2 rounded-lg border text-sm',
                    darkMode
                      ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                      : 'bg-white border-gray-300 text-gray-700'
                  )}
                />
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-xs font-semibold mb-1">Priorité</label>
                <Select value={formData.priority} onValueChange={(v: string) => setFormData({ ...formData, priority: v as any })}>
                  <SelectTrigger className={cn(
                    'w-full px-3 py-2 rounded-lg border text-sm h-10',
                    darkMode
                      ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                      : 'bg-white border-gray-300 text-gray-700'
                  )}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="normal">Normale</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Projet */}
            <div>
              <label className="block text-xs font-semibold mb-1">Projet lié</label>
              <input
                type="text"
                value={formData.project || ''}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border text-sm',
                  darkMode
                    ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                    : 'bg-white border-gray-300 text-gray-700'
                )}
                placeholder="PRJ-0017"
              />
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-xs font-semibold mb-1">Localisation</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border text-sm',
                  darkMode
                    ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                    : 'bg-white border-gray-300 text-gray-700'
                )}
                placeholder="Salle A / Zoom"
              />
            </div>

            {/* Charge estimée */}
            <div>
              <label className="block text-xs font-semibold mb-1">Charge estimée (heures)</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimatedCharge || 1}
                onChange={(e) => setFormData({ ...formData, estimatedCharge: parseFloat(e.target.value) })}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border text-sm',
                  darkMode
                    ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                    : 'bg-white border-gray-300 text-gray-700'
                )}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700/30">
            <Button variant="ghost" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              className={cn(
                'flex-1',
                conflicts.filter(c => c.severity === 'critical').length > 0
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : ''
              )}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {existingActivity ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

