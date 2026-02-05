'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { X, FileText, Clock, Users, AlertTriangle, Paperclip, Send, UserPlus, Calendar, TrendingUp } from 'lucide-react';
import type { Demand } from '@/lib/types/bmo.types';

interface DemandDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  demand: Demand | null;
  onAction: (action: 'resolve' | 'assign' | 'escalate' | 'replanify' | 'addNote' | 'addDocument') => void;
  onRequestComplement: () => void;
}

export function DemandDetailsModal({
  isOpen,
  onClose,
  demand,
  onAction,
  onRequestComplement,
}: DemandDetailsModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'documents' | 'risks' | 'dependencies'>('details');
  const [note, setNote] = useState('');

  if (!isOpen || !demand) return null;

  const calculateDelay = (dateStr: string): number => {
    const [day, month, year] = dateStr.split('/').map(Number);
    const demandDate = new Date(year, month - 1, day);
    const today = new Date();
    const diffTime = today.getTime() - demandDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const delayDays = calculateDelay(demand.date);
  const isOverdue = delayDays > 7 && demand.status !== 'validated';

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-50 transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <Card className={cn(
          'w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        )}>
          {/* Header */}
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-700/50">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0',
                darkMode ? 'bg-slate-700' : 'bg-gray-100'
              )}>
                {demand.icon}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm text-orange-400">{demand.id}</span>
                  <BureauTag bureau={demand.bureau} />
                  <Badge variant={demand.priority === 'urgent' ? 'urgent' : demand.priority === 'high' ? 'warning' : 'default'}>
                    {demand.priority}
                  </Badge>
                  {isOverdue && (
                    <Badge variant="urgent">
                      <Clock className="w-3 h-3 mr-1" />
                      En retard ({delayDays}j)
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1 truncate">{demand.subject}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          {/* Tabs */}
          <div className="flex border-b border-slate-700/50">
            {[
              { id: 'details', label: 'Détails', icon: FileText },
              { id: 'history', label: 'Historique', icon: Clock },
              { id: 'documents', label: 'Documents', icon: Paperclip },
              { id: 'risks', label: 'Risques', icon: AlertTriangle },
              { id: 'dependencies', label: 'Dépendances', icon: TrendingUp },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-4 py-2 text-xs font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                )}
              >
                <tab.icon className="w-3 h-3 inline mr-1" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <CardContent className="flex-1 overflow-y-auto p-6">
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Informations principales */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Type</label>
                    <p className="font-medium">{demand.type}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Montant</label>
                    <p className="font-bold text-amber-400">{demand.amount}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Date</label>
                    <p className="font-medium">{demand.date}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Statut</label>
                    <Badge variant={demand.status === 'validated' ? 'success' : demand.status === 'rejected' ? 'destructive' : 'info'}>
                      {demand.status || 'En attente'}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs text-slate-400 mb-2 block">Description</label>
                  <div className={cn(
                    'p-3 rounded-lg',
                    darkMode ? 'bg-slate-700/50' : 'bg-gray-50'
                  )}>
                    <p className="text-sm">{demand.subject}</p>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <label className="text-xs text-slate-400 mb-2 block flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Participants
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Bureau: {demand.bureau}</Badge>
                    <Badge variant="default">Demandeur: À définir</Badge>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                <div className={cn('p-3 rounded-lg border-l-4 border-l-blue-500', darkMode ? 'bg-slate-700/30' : 'bg-blue-50')}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm">Création</span>
                    <span className="text-xs text-slate-400">{demand.date}</span>
                  </div>
                  <p className="text-xs text-slate-400">Demande créée par le bureau {demand.bureau}</p>
                </div>
                {/* Plus d'historique pourrait être ajouté ici */}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-400 text-center py-8">
                  Aucun document attaché pour le moment
                </p>
              </div>
            )}

            {activeTab === 'risks' && (
              <div className="space-y-3">
                {isOverdue && (
                  <div className={cn('p-4 rounded-lg border-l-4 border-l-red-500', darkMode ? 'bg-red-500/10' : 'bg-red-50')}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="font-semibold text-red-400">Risque de retard</span>
                    </div>
                    <p className="text-sm text-slate-300">
                      Cette demande est en retard de {delayDays} jours. Une action immédiate est recommandée.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dependencies' && (
              <div className="space-y-3">
                <p className="text-sm text-slate-400 text-center py-8">
                  Aucune dépendance identifiée
                </p>
              </div>
            )}

            {/* Zone de notes */}
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <label className="text-xs font-medium mb-2 block">Ajouter une note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ajouter une note sur cette demande..."
                className={cn(
                  'w-full p-3 rounded-lg text-sm mb-2',
                  darkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'
                )}
                rows={3}
              />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (note.trim()) {
                          onAction('addNote');
                          addToast('Note ajoutée avec succès', 'success');
                          setNote('');
                        } else {
                          addToast('Veuillez saisir une note', 'warning');
                        }
                      }}
                      disabled={!note.trim()}
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Enregistrer la note
                    </Button>
            </div>
          </CardContent>

          {/* Actions */}
          <div className="p-6 border-t border-slate-700/50 bg-slate-800/50">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('resolve');
                  addToast('Demande résolue avec succès', 'success');
                  setTimeout(() => onClose(), 500);
                }}
              >
                ✓ Résoudre
              </Button>
              <Button
                variant="info"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('assign');
                  addToast('Ouverture de la modale d\'affectation', 'info');
                  // Fermer cette modale et ouvrir l'affectation
                  onClose();
                }}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Affecter
              </Button>
              <Button
                variant="warning"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction('replanify');
                  addToast('Ouverture du replanificateur', 'info');
                }}
              >
                <Calendar className="w-3 h-3 mr-1" />
                Replanifier
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  const confirmEscalate = window.confirm(`Voulez-vous vraiment escalader la demande ${demand?.id} vers le BMO ?`);
                  if (confirmEscalate) {
                    onAction('escalate');
                    addToast('Demande escaladée vers le BMO', 'warning');
                    setTimeout(() => onClose(), 500);
                  }
                }}
              >
                🔺 Escalader
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestComplement();
                  // Fermer cette modale et ouvrir le complément
                  onClose();
                }}
              >
                <FileText className="w-3 h-3 mr-1" />
                Demander complément
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

