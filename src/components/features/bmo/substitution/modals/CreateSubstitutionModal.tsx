/**
 * ====================================================================
 * MODAL: Création de Substitution
 * Modal pour créer une nouvelle demande de substitution
 * ====================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Search, User, Calendar, FileText, AlertTriangle, Loader2 } from 'lucide-react';
import { employeesApiService } from '@/lib/services/employees-documents-api';
import { logger } from '@/lib/utils/logger';
import type { Employee } from '@/lib/types/substitution.types';

interface CreateSubstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (substitution: any) => void;
}

export function CreateSubstitutionModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateSubstitutionModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Employee[]>([]);
  const [searching, setSearching] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    titulaire: null as Employee | null,
    reason: 'absence' as 'absence' | 'blocage' | 'technique' | 'documents',
    urgency: 'medium' as 'critical' | 'high' | 'medium' | 'low',
    description: '',
    startDate: '',
    endDate: '',
    linkedAbsenceId: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Search employees
  useEffect(() => {
    const searchEmployees = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const results = await employeesApiService.searchEmployees(searchQuery);
        setSearchResults(results.slice(0, 5));
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchEmployees, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSubmit = async () => {
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulaire) newErrors.titulaire = 'Sélectionnez un titulaire';
    if (!formData.description.trim()) newErrors.description = 'Description requise';
    if (!formData.startDate) newErrors.startDate = 'Date de début requise';
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'Date de fin invalide';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newSubstitution = {
        id: `SUB-${Date.now()}`,
        ref: `SUB-2026-${Math.floor(Math.random() * 1000)}`,
        bureau: formData.titulaire?.bureau,
        description: formData.description,
        reason: formData.reason,
        urgency: formData.urgency,
        status: 'pending',
        titulaire: {
          id: formData.titulaire?.id,
          name: formData.titulaire?.name,
          bureau: formData.titulaire?.bureau,
        },
        dateDebut: formData.startDate,
        dateFin: formData.endDate || undefined,
        createdAt: new Date().toISOString(),
      };

      logger.debug('CreateSubstitution created', { component: 'CreateSubstitutionModal', id: newSubstitution?.id });
      
      onSuccess?.(newSubstitution);
      handleClose();
    } catch (error) {
      logger.error('Create error', error instanceof Error ? error : undefined, { component: 'CreateSubstitutionModal' });
      setErrors({ submit: 'Erreur lors de la création' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      titulaire: null,
      reason: 'absence',
      urgency: 'medium',
      description: '',
      startDate: '',
      endDate: '',
      linkedAbsenceId: '',
      notes: '',
    });
    setErrors({});
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Nouvelle Substitution
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Étape {step} sur 2
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-800">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${(step / 2) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === 1 && (
            <>
              {/* Titulaire Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Titulaire *
                </label>
                {formData.titulaire ? (
                  <div className="flex items-center justify-between p-3 bg-slate-800 border border-slate-700 rounded-lg">
                    <div>
                      <div className="font-medium text-white">
                        {formData.titulaire.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        {formData.titulaire.role} • {formData.titulaire.bureau}
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, titulaire: null })}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un employé..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />
                    )}
                    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-10">
                        {searchResults.map((employee) => (
                          <button
                            key={employee.id}
                            onClick={() => {
                              setFormData({ ...formData, titulaire: employee });
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-slate-700 transition-colors border-b border-slate-700 last:border-0"
                          >
                            <div className="font-medium text-white">{employee.name}</div>
                            <div className="text-sm text-slate-400">
                              {employee.role} • {employee.bureau}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {errors.titulaire && (
                  <p className="text-red-400 text-sm mt-1">{errors.titulaire}</p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Motif *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'absence', label: 'Absence', icon: '🏖️' },
                    { value: 'blocage', label: 'Blocage', icon: '🚫' },
                    { value: 'technique', label: 'Technique', icon: '⚙️' },
                    { value: 'documents', label: 'Documents', icon: '📄' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, reason: option.value as any })}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.reason === option.value
                          ? 'bg-blue-500/20 border-blue-500 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xl mr-2">{option.icon}</span>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Urgence *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'critical', label: 'Critique', color: 'bg-red-500' },
                    { value: 'high', label: 'Haute', color: 'bg-orange-500' },
                    { value: 'medium', label: 'Moyenne', color: 'bg-yellow-500' },
                    { value: 'low', label: 'Basse', color: 'bg-green-500' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setFormData({ ...formData, urgency: option.value as any })}
                      className={`p-2 rounded-lg border text-sm transition-all ${
                        formData.urgency === option.value
                          ? `${option.color} border-transparent text-white`
                          : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez la raison de la substitution..."
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date de début *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.startDate && (
                    <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date de fin (optionnel)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.endDate && (
                    <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes internes (optionnel)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Informations supplémentaires..."
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {errors.submit && (
                <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
                  {errors.submit}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={step === 1 ? handleClose : () => setStep(1)}
            disabled={loading}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            {step === 1 ? 'Annuler' : 'Retour'}
          </button>

          {step === 1 ? (
            <button
              onClick={() => {
                if (!formData.titulaire) {
                  setErrors({ titulaire: 'Sélectionnez un titulaire' });
                  return;
                }
                setErrors({});
                setStep(2);
              }}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer la substitution
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

