'use client';

import React, { useState } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  User,
  Calendar,
  DollarSign,
  Plane,
  Briefcase,
  AlertCircle,
  Check,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RHQuickCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (demande: any) => void;
}

type DemandeType = 'Congé' | 'Dépense' | 'Déplacement' | 'Paie' | 'Maladie';

export function RHQuickCreateModal({ open, onClose, onSuccess }: RHQuickCreateModalProps) {
  const [step, setStep] = useState<'type' | 'form' | 'confirmation'>('type');
  const [selectedType, setSelectedType] = useState<DemandeType | null>(null);
  const [formData, setFormData] = useState({
    agent: '',
    agentId: '',
    bureau: 'Alger',
    description: '',
    dateDebut: '',
    dateFin: '',
    montant: '',
    priority: 'normal',
    documents: [] as File[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const demandeTypes = [
    {
      type: 'Congé' as DemandeType,
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      description: 'Congés annuels, maladie, exceptionnel',
    },
    {
      type: 'Dépense' as DemandeType,
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      description: 'Remboursement de frais professionnels',
    },
    {
      type: 'Déplacement' as DemandeType,
      icon: Plane,
      color: 'from-purple-500 to-pink-500',
      description: 'Missions et déplacements professionnels',
    },
    {
      type: 'Paie' as DemandeType,
      icon: Briefcase,
      color: 'from-orange-500 to-red-500',
      description: 'Avances sur salaire',
    },
  ];

  const handleTypeSelect = (type: DemandeType) => {
    setSelectedType(type);
    setStep('form');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.agent.trim()) {
      newErrors.agent = 'Le nom de l\'agent est requis';
    }
    if (!formData.agentId.trim()) {
      newErrors.agentId = 'Le matricule est requis';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La description est requise';
    }

    if (selectedType === 'Congé') {
      if (!formData.dateDebut) {
        newErrors.dateDebut = 'La date de début est requise';
      }
      if (!formData.dateFin) {
        newErrors.dateFin = 'La date de fin est requise';
      }
    }

    if (selectedType === 'Dépense' || selectedType === 'Paie') {
      if (!formData.montant || parseFloat(formData.montant) <= 0) {
        newErrors.montant = 'Le montant est requis et doit être positif';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newDemande = {
        type: selectedType,
        agent: formData.agent,
        agentId: formData.agentId,
        bureau: formData.bureau,
        description: formData.description,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        montant: formData.montant ? parseFloat(formData.montant) : undefined,
        priority: formData.priority,
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      };

      setStep('confirmation');
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(newDemande);
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setErrors({ submit: 'Une erreur est survenue' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('type');
    setSelectedType(null);
    setFormData({
      agent: '',
      agentId: '',
      bureau: 'Alger',
      description: '',
      dateDebut: '',
      dateFin: '',
      montant: '',
      priority: 'normal',
      documents: [],
    });
    setErrors({});
    onClose();
  };

  const renderTypeSelection = () => (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
        Sélectionnez le type de demande à créer
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {demandeTypes.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => handleTypeSelect(item.type)}
              className="group relative p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700
                         hover:border-transparent transition-all duration-300
                         hover:shadow-xl hover:scale-105"
            >
              <div className={cn(
                'absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity',
                item.color
              )} />
              
              <div className="relative">
                <div className={cn(
                  'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 mx-auto',
                  item.color
                )}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="font-bold text-lg mb-2">{item.type}</h3>
                <p className="text-sm text-slate-400">{item.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderForm = () => (
    <div className="space-y-6">
      {/* En-tête avec type sélectionné */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800">
        {demandeTypes.find(t => t.type === selectedType) && (() => {
          const item = demandeTypes.find(t => t.type === selectedType)!;
          const Icon = item.icon;
          return (
            <>
              <div className={cn(
                'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center',
                item.color
              )}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold">{selectedType}</p>
                <p className="text-xs text-slate-400">{item.description}</p>
              </div>
            </>
          );
        })()}
      </div>

      {/* Formulaire */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Agent */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Agent <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.agent}
            onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
            className={cn(
              'w-full px-3 py-2 rounded-lg border',
              errors.agent
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
            )}
            placeholder="Nom complet"
          />
          {errors.agent && (
            <p className="text-xs text-red-500 mt-1">{errors.agent}</p>
          )}
        </div>

        {/* Matricule */}
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Matricule <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.agentId}
            onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
            className={cn(
              'w-full px-3 py-2 rounded-lg border',
              errors.agentId
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
            )}
            placeholder="AGT-001"
          />
          {errors.agentId && (
            <p className="text-xs text-red-500 mt-1">{errors.agentId}</p>
          )}
        </div>

        {/* Bureau */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Bureau</label>
          <select
            value={formData.bureau}
            onChange={(e) => setFormData({ ...formData, bureau: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <option value="Alger">Alger</option>
            <option value="Oran">Oran</option>
            <option value="Constantine">Constantine</option>
            <option value="Annaba">Annaba</option>
          </select>
        </div>

        {/* Priorité */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Priorité</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <option value="normal">Normal</option>
            <option value="high">Élevée</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        {/* Champs spécifiques selon le type */}
        {(selectedType === 'Congé' || selectedType === 'Déplacement') && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Date de début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border',
                  errors.dateDebut
                    ? 'border-red-500'
                    : 'border-slate-200 dark:border-slate-700'
                )}
              />
              {errors.dateDebut && (
                <p className="text-xs text-red-500 mt-1">{errors.dateDebut}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                Date de fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
                className={cn(
                  'w-full px-3 py-2 rounded-lg border',
                  errors.dateFin
                    ? 'border-red-500'
                    : 'border-slate-200 dark:border-slate-700'
                )}
              />
              {errors.dateFin && (
                <p className="text-xs text-red-500 mt-1">{errors.dateFin}</p>
              )}
            </div>
          </>
        )}

        {(selectedType === 'Dépense' || selectedType === 'Paie') && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5">
              Montant (DZD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.montant}
              onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
              className={cn(
                'w-full px-3 py-2 rounded-lg border',
                errors.montant
                  ? 'border-red-500'
                  : 'border-slate-200 dark:border-slate-700'
              )}
              placeholder="0.00"
              step="0.01"
            />
            {errors.montant && (
              <p className="text-xs text-red-500 mt-1">{errors.montant}</p>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={cn(
            'w-full px-3 py-2 rounded-lg border',
            errors.description
              ? 'border-red-500'
              : 'border-slate-200 dark:border-slate-700'
          )}
          rows={4}
          placeholder="Décrivez votre demande..."
        />
        {errors.description && (
          <p className="text-xs text-red-500 mt-1">{errors.description}</p>
        )}
      </div>

      {/* Upload documents */}
      <div>
        <label className="block text-sm font-medium mb-1.5">
          Documents justificatifs
        </label>
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-400 mb-2">
            Glissez vos fichiers ici ou cliquez pour parcourir
          </p>
          <input
            type="file"
            multiple
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            Choisir des fichiers
          </label>
        </div>
      </div>

      {errors.submit && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{errors.submit}</p>
        </div>
      )}
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
        <Check className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="text-xl font-bold mb-2">Demande créée avec succès !</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-4">
        Votre demande de <strong>{selectedType}</strong> a été enregistrée et sera traitée prochainement.
      </p>
      
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
        Un email de confirmation vous sera envoyé
      </div>
    </div>
  );

  return (
    <FluentModal
      open={open}
      onClose={handleClose}
      title={
        step === 'type'
          ? 'Créer une nouvelle demande'
          : step === 'form'
          ? `Nouvelle demande - ${selectedType}`
          : 'Confirmation'
      }
      maxWidth="4xl"
    >
      {step === 'type' && renderTypeSelection()}
      {step === 'form' && renderForm()}
      {step === 'confirmation' && renderConfirmation()}
      <div className="flex justify-between items-center w-full pt-4 mt-4 border-t border-slate-700">
        {step === 'form' && (
          <>
            <button
              onClick={() => setStep('type')}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
              disabled={isSubmitting}
            >
              Retour
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Créer la demande
                </>
              )}
            </button>
          </>
        )}
        {step === 'type' && (
          <button
            onClick={handleClose}
            className="ml-auto px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 transition-colors"
          >
            Annuler
          </button>
        )}
        {step === 'confirmation' && (
          <button
            onClick={handleClose}
            className="mx-auto px-6 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Fermer
          </button>
        )}
      </div>
    </FluentModal>
  );
}

