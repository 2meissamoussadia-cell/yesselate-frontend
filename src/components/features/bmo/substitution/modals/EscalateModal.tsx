/**
 * ====================================================================
 * MODAL: Escalade de Substitution
 * Modal pour escalader une substitution à un niveau supérieur
 * ====================================================================
 */

'use client';

import { useState } from 'react';
import { X, AlertTriangle, User, FileText, Loader2 } from 'lucide-react';
import { logger } from '@/lib/utils/logger';

interface EscalateModalProps {
  isOpen: boolean;
  onClose: () => void;
  substitution: {
    id: string;
    ref: string;
    description: string;
    urgency: string;
  };
  onSuccess?: () => void;
}

const ESCALATION_LEVELS = [
  { value: 'supervisor', label: 'Superviseur Direct', icon: '👤', description: 'Escalader au superviseur hiérarchique' },
  { value: 'directeur', label: 'Directeur de Bureau', icon: '👔', description: 'Escalader au directeur du bureau' },
  { value: 'dg', label: 'Direction Générale', icon: '🏢', description: 'Escalader à la direction générale' },
];

const ESCALATION_REASONS = [
  'Aucun substitut disponible',
  'Urgence critique',
  'Compétences spécialisées requises',
  'Conflit de délégation',
  'Dépassement de délai',
  'Autre (préciser)',
];

export function EscalateModal({ isOpen, onClose, substitution, onSuccess }: EscalateModalProps) {
  const [selectedLevel, setSelectedLevel] = useState('supervisor');
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [justification, setJustification] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError('Veuillez sélectionner une raison');
      return;
    }

    if (selectedReason === 'Autre (préciser)' && !customReason.trim()) {
      setError('Veuillez préciser la raison');
      return;
    }

    if (!justification.trim()) {
      setError('Veuillez fournir une justification');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.debug('Escalate', {
        component: 'EscalateModal',
        substitutionId: substitution.id,
        level: selectedLevel,
        reason: selectedReason === 'Autre (préciser)' ? customReason : selectedReason,
        justification,
      });

      onSuccess?.();
      handleClose();
    } catch (err) {
      setError('Erreur lors de l\'escalade');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedLevel('supervisor');
    setSelectedReason('');
    setCustomReason('');
    setJustification('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Escalader la substitution
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {substitution.ref} • {substitution.description}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Escalation Level */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              <User className="w-4 h-4 inline mr-2" />
              Niveau d'escalade
            </label>
            <div className="space-y-2">
              {ESCALATION_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => setSelectedLevel(level.value)}
                  className={`w-full p-4 rounded-lg border text-left transition-all ${
                    selectedLevel === level.value
                      ? 'bg-orange-500/20 border-orange-500 ring-2 ring-orange-500/50'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{level.icon}</span>
                    <div>
                      <div className="font-medium text-white">{level.label}</div>
                      <div className="text-sm text-slate-400 mt-0.5">{level.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Raison de l'escalade *
            </label>
            <div className="space-y-2">
              {ESCALATION_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full px-4 py-3 rounded-lg border text-left transition-all ${
                    selectedReason === reason
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reason */}
          {selectedReason === 'Autre (préciser)' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Précisez la raison *
              </label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Raison personnalisée..."
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Justification */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Justification détaillée *
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Expliquez les raisons de cette escalade et les actions déjà tentées..."
              rows={5}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Warning */}
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-200">
                <p className="font-medium mb-1">Important</p>
                <p className="text-orange-300/80">
                  L'escalade génère une notification au niveau supérieur et peut impacter les KPIs du bureau.
                  Assurez-vous d'avoir tenté toutes les solutions avant d'escalader.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Escalader maintenant
          </button>
        </div>
      </div>
    </div>
  );
}

