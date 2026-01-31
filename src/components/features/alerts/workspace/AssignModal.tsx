/**
 * Modal d'assignation d'alerte
 * Permet d'assigner une alerte à un utilisateur avec suggestions intelligentes
 */

'use client';

import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Award,
  X,
} from 'lucide-react';

// ================================
// TYPES
// ================================

interface UserWithLoad {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  bureau?: string;
  avatar?: string;
  currentLoad: number; // Nombre d'alertes assignées
  expertise: string[]; // Types d'alertes dont ils sont experts
  avgResolutionTime: number; // En heures
  availability: 'available' | 'busy' | 'away';
  lastActive: string;
}

interface AssignModalProps {
  open: boolean;
  onClose: () => void;
  alert: {
    id: string;
    title: string;
    type: string;
    severity: 'critical' | 'warning' | 'info';
    bureau?: string;
  } | null;
  onConfirm: (userId: string, note?: string) => void;
}

// ================================
// MOCK DATA
// ================================

const MOCK_USERS: UserWithLoad[] = [
  {
    id: 'user-001',
    name: 'Jean Dupont',
    email: 'jean.dupont@yesselate.com',
    role: 'manager',
    bureau: 'BF',
    currentLoad: 3,
    expertise: ['payment', 'contract', 'budget'],
    avgResolutionTime: 2.5,
    availability: 'available',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'user-002',
    name: 'Marie Martin',
    email: 'marie.martin@yesselate.com',
    role: 'operator',
    bureau: 'BF',
    currentLoad: 7,
    expertise: ['system', 'sla'],
    avgResolutionTime: 4.0,
    availability: 'busy',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'user-003',
    name: 'Pierre Dubois',
    email: 'pierre.dubois@yesselate.com',
    role: 'admin',
    bureau: 'BM',
    currentLoad: 2,
    expertise: ['payment', 'blocked', 'escalation'],
    avgResolutionTime: 1.8,
    availability: 'available',
    lastActive: new Date().toISOString(),
  },
  {
    id: 'user-004',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@yesselate.com',
    role: 'manager',
    bureau: 'BJ',
    currentLoad: 5,
    expertise: ['contract', 'budget', 'sla'],
    avgResolutionTime: 3.2,
    availability: 'available',
    lastActive: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'user-005',
    name: 'Luc Lefebvre',
    email: 'luc.lefebvre@yesselate.com',
    role: 'operator',
    bureau: 'BCT',
    currentLoad: 1,
    expertise: ['system', 'blocked'],
    avgResolutionTime: 5.5,
    availability: 'available',
    lastActive: new Date(Date.now() - 7200000).toISOString(),
  },
];

// ================================
// COMPONENT
// ================================

export function AssignModal({ open, onClose, alert, onConfirm }: AssignModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);

  // Calculer les suggestions intelligentes
  const suggestedUsers = useMemo(() => {
    if (!alert) return [];

    return MOCK_USERS.map((user) => {
      let score = 0;

      // Expertise match
      if (user.expertise.includes(alert.type)) score += 40;

      // Bureau match
      if (user.bureau === alert.bureau) score += 20;

      // Disponibilité
      if (user.availability === 'available') score += 20;

      // Charge de travail (moins c'est mieux)
      score += Math.max(0, 20 - user.currentLoad * 2);

      // Temps de résolution (plus rapide c'est mieux)
      if (user.avgResolutionTime < 3) score += 10;
      else if (user.avgResolutionTime < 5) score += 5;

      return { ...user, suggestionScore: score };
    })
    .sort((a, b) => b.suggestionScore - a.suggestionScore);
  }, [alert]);

  // Filtrer les utilisateurs par recherche
  const filteredUsers = useMemo(() => {
    const users = showSuggested ? suggestedUsers : MOCK_USERS;
    
    if (!searchQuery) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.bureau?.toLowerCase().includes(query)
    );
  }, [suggestedUsers, searchQuery, showSuggested]);

  const handleConfirm = async () => {
    if (!selectedUserId) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    onConfirm(selectedUserId, note);
    setIsSubmitting(false);
    setSelectedUserId('');
    setNote('');
    setSearchQuery('');
    onClose();
  };

  if (!alert) return null;

  const selectedUser = MOCK_USERS.find((u) => u.id === selectedUserId);
  const topSuggestion = suggestedUsers[0];

  return (
    <FluentModal
      open={open}
      onClose={onClose}
      title="Assigner l'alerte"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Alert Preview */}
        <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-slate-400">{alert.id}</span>
            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'warning'}>
              {alert.severity}
            </Badge>
          </div>
          <h3 className="text-sm font-medium text-slate-200">{alert.title}</h3>
        </div>

        {/* Suggestion intelligente */}
        {topSuggestion && topSuggestion.suggestionScore >= 50 && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-emerald-300 font-medium mb-2">
                  Suggestion intelligente (Score: {topSuggestion.suggestionScore}/100)
                </p>
                <button
                  onClick={() => setSelectedUserId(topSuggestion.id)}
                  className={cn(
                    'w-full p-3 rounded-lg border transition-all text-left',
                    selectedUserId === topSuggestion.id
                      ? 'border-emerald-500/40 bg-emerald-500/20'
                      : 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium">
                      {topSuggestion.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">{topSuggestion.name}</p>
                      <p className="text-xs text-slate-400">{topSuggestion.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{topSuggestion.currentLoad} alertes</p>
                      <p className="text-xs text-emerald-400">~{topSuggestion.avgResolutionTime}h</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recherche et filtre */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
            <button
              onClick={() => setShowSuggested(!showSuggested)}
              className={cn(
                'px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                showSuggested
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                  : 'border-slate-700 text-slate-400 hover:bg-slate-800/50'
              )}
            >
              {showSuggested ? '✨ Suggérés' : 'Tous'}
            </button>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedUserId === user.id;
              const isTopSuggestion = showSuggested && user.id === topSuggestion?.id;

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={cn(
                    'w-full p-3 rounded-lg border transition-all text-left',
                    isSelected
                      ? 'border-blue-500/40 bg-blue-500/10'
                      : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-medium',
                      user.availability === 'available' ? 'bg-emerald-500/20 text-emerald-400' :
                      user.availability === 'busy' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-500/20 text-slate-400'
                    )}>
                      {user.name.split(' ').map((n) => n[0]).join('')}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'font-medium truncate',
                          isSelected ? 'text-blue-300' : 'text-slate-200'
                        )}>
                          {user.name}
                        </p>
                        {isTopSuggestion && (
                          <Award className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        {user.bureau && (
                          <Badge variant="default" className="text-xs bg-slate-700/30">
                            {user.bureau}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 justify-end mb-1">
                        <AlertCircle className={cn(
                          'w-3 h-3',
                          user.currentLoad < 3 ? 'text-emerald-400' :
                          user.currentLoad < 6 ? 'text-amber-400' :
                          'text-rose-400'
                        )} />
                        <p className="text-xs text-slate-400">{user.currentLoad} alertes</p>
                      </div>
                      <div className="flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <p className="text-xs text-slate-400">~{user.avgResolutionTime}h</p>
                      </div>
                    </div>

                    {/* Checkmark */}
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Expertise */}
                  {user.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {user.expertise.map((exp) => (
                        <span
                          key={exp}
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            alert.type === exp
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-700/30 text-slate-400'
                          )}
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Note d'assignation */}
        {selectedUser && (
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Note pour {selectedUser.name} (optionnel)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajoutez des instructions ou informations complémentaires..."
              className="w-full h-20 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <FluentButton
            variant="primary"
            onClick={handleConfirm}
            disabled={isSubmitting || !selectedUserId}
            className="flex-1"
          >
            <User className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Assignation...' : 'Assigner l\'alerte'}
          </FluentButton>
          <FluentButton variant="ghost" onClick={onClose}>
            Annuler
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

