/**
 * ====================================================================
 * MODAL: Assignation de Substitut
 * Modal avec algorithme de recherche et scoring de candidats
 * ====================================================================
 */

'use client';

import { useState, useEffect } from 'react';
import { X, Search, User, Award, Briefcase, TrendingUp, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { employeesApiService } from '@/lib/services/employees-documents-api';
import { logger } from '@/lib/utils/logger';
import type { SubstituteCandidate, Employee } from '@/lib/types/substitution.types';

interface AssignSubstitutModalProps {
  isOpen: boolean;
  onClose: () => void;
  substitution: {
    id: string;
    ref: string;
    description: string;
    bureau: string;
    titulaire: { id: string; name: string; bureau: string };
    requiredCompetences?: string[];
  };
  onSuccess?: (substitut: Employee) => void;
}

export function AssignSubstitutModal({
  isOpen,
  onClose,
  substitution,
  onSuccess,
}: AssignSubstitutModalProps) {
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [candidates, setCandidates] = useState<SubstituteCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<SubstituteCandidate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  // Load candidates
  useEffect(() => {
    if (isOpen) {
      loadCandidates();
    }
  }, [isOpen, substitution.id]);

  const loadCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const results = await employeesApiService.findSubstitutes({
        bureau: substitution.bureau,
        requiredCompetences: substitution.requiredCompetences || [],
        maxWorkload: 85,
        excludeIds: [substitution.titulaire.id],
      });
      
      setCandidates(results);
      
      if (results.length === 0) {
        setError('Aucun substitut disponible trouvé.');
      }
    } catch (err) {
      logger.error('Error loading candidates', err instanceof Error ? err : undefined, { component: 'AssignSubstitutModal' });
      setError('Erreur lors du chargement des candidats.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedCandidate) return;

    setAssigning(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      logger.debug('AssignSubstitut', { component: 'AssignSubstitutModal', substitutionId: substitution.id, substitut: selectedCandidate.employee?.id, score: selectedCandidate.score });

      onSuccess?.(selectedCandidate.employee);
      handleClose();
    } catch (err) {
      logger.error('Assign error', err instanceof Error ? err : undefined, { component: 'AssignSubstitutModal' });
      setError('Erreur lors de l\'assignation.');
    } finally {
      setAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedCandidate(null);
    setSearchQuery('');
    setError('');
    onClose();
  };

  const filteredCandidates = candidates.filter(c =>
    searchQuery.length < 2 ||
    c.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.employee.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-blue-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500';
    if (score >= 75) return 'bg-blue-500/20 border-blue-500';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-orange-500/20 border-orange-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">
                Assigner un substitut
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {substitution.ref} • {substitution.titulaire.name}
              </p>
              <p className="text-sm text-slate-300 mt-1">
                {substitution.description}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={assigning}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un candidat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              <span className="ml-3 text-slate-400">Recherche des meilleurs candidats...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-slate-300">{error}</p>
                <button
                  onClick={loadCandidates}
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              Aucun candidat ne correspond à votre recherche.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Top 3 Badge */}
              {searchQuery.length < 2 && filteredCandidates.length >= 3 && (
                <div className="flex items-center gap-2 text-sm text-blue-400 mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <Award className="w-4 h-4" />
                  <span>Top {Math.min(3, filteredCandidates.length)} candidats recommandés</span>
                </div>
              )}

              {filteredCandidates.map((candidate, index) => {
                const isSelected = selectedCandidate?.employee.id === candidate.employee.id;
                const isTopThree = index < 3 && searchQuery.length < 2;

                return (
                  <button
                    key={candidate.employee.id}
                    onClick={() => setSelectedCandidate(candidate)}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/50'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                        getScoreBg(candidate.score)
                      }`}>
                        {candidate.employee.name.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-white">
                            {candidate.employee.name}
                          </h3>
                          {isTopThree && (
                            <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                              Top {index + 1}
                            </span>
                          )}
                          {candidate.employee.disponibilite === 'available' && (
                            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                              Disponible
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-400 mb-2">
                          {candidate.employee.role} • {candidate.employee.bureau}
                        </p>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-3 mt-3">
                          <div className="flex items-center gap-2">
                            <Award className={`w-4 h-4 ${getScoreColor(candidate.score)}`} />
                            <div>
                              <div className="text-xs text-slate-400">Score</div>
                              <div className={`text-sm font-semibold ${getScoreColor(candidate.score)}`}>
                                {candidate.score}%
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-xs text-slate-400">Charge</div>
                              <div className={`text-sm font-semibold ${
                                candidate.workload > 70 ? 'text-orange-400' : 'text-green-400'
                              }`}>
                                {candidate.workload}%
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-xs text-slate-400">Compétences</div>
                              <div className="text-sm font-semibold text-slate-300">
                                {candidate.competencesMatch}%
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-slate-400" />
                            <div>
                              <div className="text-xs text-slate-400">Expérience</div>
                              <div className="text-sm font-semibold text-slate-300">
                                {candidate.previousSubstitutions || 0}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reason */}
                        {candidate.reason && (
                          <p className="text-xs text-slate-400 mt-2">
                            💡 {candidate.reason}
                          </p>
                        )}

                        {/* Competences badges */}
                        {candidate.employee.competences.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {candidate.employee.competences.slice(0, 5).map((comp) => (
                              <span
                                key={comp}
                                className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded"
                              >
                                {comp}
                              </span>
                            ))}
                            {candidate.employee.competences.length > 5 && (
                              <span className="px-2 py-0.5 text-xs text-slate-400">
                                +{candidate.employee.competences.length - 5}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-6 h-6 text-blue-400" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/50">
          <div className="text-sm text-slate-400">
            {filteredCandidates.length} candidat{filteredCandidates.length > 1 ? 's' : ''} trouvé{filteredCandidates.length > 1 ? 's' : ''}
            {selectedCandidate && (
              <span className="ml-2 text-white">
                • {selectedCandidate.employee.name} sélectionné
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={assigning}
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedCandidate || assigning}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
              Assigner le substitut
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

