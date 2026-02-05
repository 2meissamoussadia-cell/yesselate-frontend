'use client';

import { useState, useEffect } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { User, Search, CheckCircle, X, Mail, Building2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';
import { useAnalyticsToast } from './AnalyticsToast';

interface AssignResponsibleModalProps {
  open: boolean;
  onClose: () => void;
  data?: {
    kpiId?: string;
    kpiName?: string;
    kpiData?: any;
  };
}

// Mock users list
const mockUsers = [
  { id: '1', name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'Directeur Technique', bureau: 'BTP' },
  { id: '2', name: 'Marie Martin', email: 'marie.martin@example.com', role: 'Chef de Projet', bureau: 'BJ' },
  { id: '3', name: 'Pierre Durand', email: 'pierre.durand@example.com', role: 'Analyste Performance', bureau: 'BS' },
  { id: '4', name: 'Sophie Bernard', email: 'sophie.bernard@example.com', role: 'Responsable Qualité', bureau: 'BTP' },
  { id: '5', name: 'Luc Petit', email: 'luc.petit@example.com', role: 'Coordinateur', bureau: 'BJ' },
];

export function AssignResponsibleModal({ open, onClose, data }: AssignResponsibleModalProps) {
  const toast = useAnalyticsToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [role, setRole] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Réinitialiser le formulaire quand le modal se ferme
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setSearchQuery('');
        setSelectedUser(null);
        setRole('');
        setNotes('');
        setIsSubmitting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const filteredUsers = mockUsers.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast.error('Sélection requise', 'Veuillez sélectionner un responsable');
      return;
    }

    const user = mockUsers.find(u => u.id === selectedUser);
    setIsSubmitting(true);

    try {
      // Ici, on pourrait envoyer l'assignation à l'API
      logger.debug('Assignation de responsable', {
        component: 'AssignResponsibleModal',
        userId: selectedUser,
        userName: user?.name,
        userEmail: user?.email,
        role,
        notes,
        kpiId: data?.kpiId,
        kpiName: data?.kpiName,
      });

      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 500));

      toast.success('Responsable assigné', `${user?.name} a été assigné avec succès`);
      onClose();
    } catch (error) {
      toast.error('Erreur', 'Impossible d\'assigner le responsable. Veuillez réessayer.');
      if (process.env.NODE_ENV === 'development') {
        logger.error('Erreur assignation responsable', error instanceof Error ? error : undefined, { component: 'AssignResponsibleModal' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Assigner un responsable"
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

        {/* Recherche */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <Search className="w-4 h-4 inline mr-1" />
            Rechercher un responsable
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nom, email ou rôle..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Liste des utilisateurs */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <User className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p>Aucun utilisateur trouvé</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={cn(
                  'w-full p-4 rounded-lg border transition-all text-left',
                  selectedUser === user.id
                    ? 'bg-blue-500/20 border-blue-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold',
                      selectedUser === user.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300'
                    )}>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className={cn(
                        'font-medium',
                        selectedUser === user.id ? 'text-blue-400' : 'text-slate-200'
                      )}>
                        {user.name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {user.bureau}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{user.role}</p>
                    </div>
                  </div>
                  {selectedUser === user.id && (
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Rôle et Notes */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Rôle / Responsabilité
            </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Responsable de l'amélioration du KPI"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes / Instructions
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions spécifiques pour le responsable..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-slate-700/50 sticky bottom-0 bg-slate-900/95 pb-2 -mx-2 px-2">
          <FluentButton variant="secondary" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Annuler
          </FluentButton>
          <FluentButton variant="primary" onClick={handleSubmit} disabled={!selectedUser || isSubmitting}>
            <CheckCircle className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Assignation...' : 'Assigner'}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

