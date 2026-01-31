'use client';

import { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';
import { useAnalyticsToast } from './AnalyticsToast';

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  data?: {
    kpiId?: string;
    kpiName?: string;
    kpiData?: any;
    initialTitle?: string;
    initialDescription?: string;
    initialPriority?: 'high' | 'medium' | 'low';
  };
}

export function CreateTaskModal({ open, onClose, data }: CreateTaskModalProps) {
  const toast = useAnalyticsToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('action');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Réinitialiser le formulaire quand le modal s'ouvre ou que data change
  useEffect(() => {
    if (open) {
      setTitle(data?.initialTitle || '');
      setDescription(data?.initialDescription || '');
      setPriority(data?.initialPriority || 'medium');
      setAssignedTo('');
      setDueDate('');
      setCategory('action');
      setErrors({});
    }
  }, [open, data?.initialTitle, data?.initialDescription, data?.initialPriority]);

  // Réinitialiser quand le modal se ferme
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setAssignedTo('');
        setDueDate('');
        setCategory('action');
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsSubmitting(true);
    try {
      // Ici, on pourrait envoyer la tâche à l'API
      logger.debug('Création de tâche', {
        component: 'CreateTaskModal',
        title,
        description,
        priority,
        assignedTo,
        dueDate,
        category,
        kpiId: data?.kpiId,
        kpiName: data?.kpiName,
      });

      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Tâche créée', `La tâche "${title}" a été créée avec succès`);
      onClose();
    } catch (error) {
      toast.error('Erreur', 'Impossible de créer la tâche. Veuillez réessayer.');
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur création tâche:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Créer une nouvelle tâche"
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
              Titre de la tâche <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({ ...errors, title: '' });
              }}
              placeholder="Ex: Analyser les causes de l'écart de performance"
              className={cn(
                "w-full px-4 py-2.5 rounded-lg border bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2",
                errors.title
                  ? "border-red-500/50 focus:ring-red-500"
                  : "border-slate-700 focus:ring-blue-500"
              )}
            />
            {errors.title && (
              <p className="text-xs text-red-400 mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez la tâche en détail..."
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Priorité et Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Priorité
              </label>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      'flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all',
                      priority === p
                        ? p === 'high'
                          ? 'bg-red-500/20 border-red-500/50 text-red-400'
                          : p === 'medium'
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    {p === 'high' ? 'Urgent' : p === 'medium' ? 'Important' : 'Normal'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="action">Action corrective</option>
                <option value="review">Révision</option>
                <option value="investigation">Investigation</option>
                <option value="improvement">Amélioration</option>
              </select>
            </div>
          </div>

          {/* Assigné à et Date d'échéance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Assigné à
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Nom ou email"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date d'échéance
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {isSubmitting ? 'Création...' : 'Créer la tâche'}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

