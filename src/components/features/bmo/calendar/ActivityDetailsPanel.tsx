'use client';

import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BureauTag } from '@/components/features/bmo/BureauTag';
import { 
  X, Clock, Users, FileText, AlertTriangle, Edit, Calendar, 
  CheckCircle, XCircle, Link2, TrendingUp, BarChart3, 
  Download, Upload, Search, Send, History, FileIcon, 
  MapPin, Tag, Target, Zap, Bell, Share2, Copy, 
  ArrowRight, Info, Activity as ActivityIcon, MessageSquare,
  Image as ImageIcon, Video, FileCheck
} from 'lucide-react';
import type { CalendarEvent, ActivityNote } from '@/lib/types/bmo.types';
import { useState, useMemo } from 'react';

interface ActivityDetailsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activity: CalendarEvent | null;
  onEdit?: () => void;
  onReschedule?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onAddNote?: (note: string) => void;
}

type TabType = 'details' | 'history' | 'documents' | 'metrics' | 'timeline';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'document' | 'other';
  size: string;
  uploadDate: string;
  uploadedBy: string;
}

interface HistoryEntry {
  id: string;
  action: string;
  author: string;
  date: string;
  details?: string;
  icon: string;
}

export function ActivityDetailsPanel({
  isOpen,
  onClose,
  activity,
  onEdit,
  onReschedule,
  onComplete,
  onCancel,
  onAddNote,
}: ActivityDetailsPanelProps) {
  const { darkMode } = useAppStore();
  const { addToast, addActionLog } = useBMOStore();
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [noteInput, setNoteInput] = useState('');
  const [searchNotes, setSearchNotes] = useState('');

  if (!isOpen || !activity) return null;

  // Documents simulés (à remplacer par des vraies données)
  const documents: Document[] = useMemo(() => [
    { id: '1', name: 'Rapport_activité.pdf', type: 'pdf', size: '2.4 MB', uploadDate: '2024-01-15', uploadedBy: 'A. DIALLO' },
    { id: '2', name: 'Photo_chantier.jpg', type: 'image', size: '1.8 MB', uploadDate: '2024-01-14', uploadedBy: 'B. TRAORE' },
  ], []);

  // Historique enrichi
  const historyEntries: HistoryEntry[] = useMemo(() => {
    const entries: HistoryEntry[] = [
      { id: '1', action: 'Activité créée', author: 'A. DIALLO', date: activity.date, icon: '📝' },
      ...(activity.notes?.map((note, i) => ({
        id: `note-${i}`,
        action: 'Note ajoutée',
        author: note.author,
        date: note.createdAt,
        details: note.content,
        icon: '📌',
      })) || []),
      { id: '2', action: 'Participant ajouté', author: 'Système', date: activity.date, icon: '👤' },
    ];
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activity]);

  // Métriques calculées
  const metrics = useMemo(() => {
    const participantsCount = activity.participants?.length || 0;
    const conflictsCount = activity.conflicts?.length || 0;
    const dependenciesCount = activity.dependencies?.length || 0;
    const notesCount = activity.notes?.length || 0;
    const completionRate = activity.status === 'completed' ? 100 : 
                          activity.status === 'in_progress' ? 60 : 
                          activity.status === 'cancelled' ? 0 : 20;

    return {
      participantsCount,
      conflictsCount,
      dependenciesCount,
      notesCount,
      completionRate,
      estimatedHours: activity.estimatedCharge || 0,
      actualHours: activity.estimatedCharge ? (activity.estimatedCharge * completionRate / 100) : 0,
    };
  }, [activity]);

  const priorityColors = {
    critical: 'red',
    urgent: 'red',
    high: 'amber',
    normal: 'blue',
    low: 'slate',
  };

  const statusColors = {
    planned: 'blue',
    in_progress: 'amber',
    completed: 'emerald',
    cancelled: 'red',
    rescheduled: 'orange',
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) {
      addToast('Veuillez saisir une note', 'warning');
      return;
    }
    onAddNote?.(noteInput);
    setNoteInput('');
    addToast('Note ajoutée avec succès', 'success');
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'modification',
      module: 'calendar',
      targetId: activity.id,
      targetType: 'Activity',
      targetLabel: activity.title,
      details: `Note ajoutée: ${noteInput.substring(0, 50)}...`,
    });
  };

  const handleComplete = () => {
    const confirmComplete = window.confirm(`Voulez-vous vraiment marquer cette activité comme terminée ?`);
    if (confirmComplete) {
      onComplete?.();
      addToast('Activité marquée comme terminée', 'success');
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        action: 'validation',
        module: 'calendar',
        targetId: activity.id,
        targetType: 'Activity',
        targetLabel: activity.title,
        details: 'Activité marquée comme terminée',
      });
      setTimeout(() => onClose(), 500);
    }
  };

  const handleCancel = () => {
    const confirmCancel = window.confirm(`Voulez-vous vraiment annuler cette activité ?`);
    if (confirmCancel) {
      onCancel?.();
      addToast('Activité annulée', 'warning');
      addActionLog({
        userId: 'USR-001',
        userName: 'A. DIALLO',
        userRole: 'Directeur Général',
        action: 'modification',
        module: 'calendar',
        targetId: activity.id,
        targetType: 'Activity',
        targetLabel: activity.title,
        details: 'Activité annulée',
      });
      setTimeout(() => onClose(), 500);
    }
  };

  const handleEdit = () => {
    onEdit?.();
    addToast('Ouverture de l\'éditeur d\'activité', 'info');
  };

  const handleReschedule = () => {
    onReschedule?.();
    addToast('Ouverture du replanificateur', 'info');
  };

  const filteredNotes = useMemo(() => {
    if (!activity.notes) return [];
    if (!searchNotes.trim()) return activity.notes;
    return activity.notes.filter(note => 
      note.content.toLowerCase().includes(searchNotes.toLowerCase()) ||
      note.author.toLowerCase().includes(searchNotes.toLowerCase())
    );
  }, [activity.notes, searchNotes]);

  const tabs = [
    { id: 'details' as TabType, label: 'Détails', icon: FileText },
    { id: 'history' as TabType, label: 'Historique', icon: History, badge: historyEntries.length },
    { id: 'documents' as TabType, label: 'Documents', icon: FileIcon, badge: documents.length },
    { id: 'metrics' as TabType, label: 'Métriques', icon: BarChart3 },
    { id: 'timeline' as TabType, label: 'Timeline', icon: ActivityIcon },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-2xl z-50',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          darkMode ? 'bg-slate-900' : 'bg-white',
          'shadow-2xl border-l border-slate-700/30'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header avec gradient */}
          <div
            className={cn(
              'p-6 border-b',
              activity.priority === 'critical' || activity.priority === 'urgent' 
                ? 'bg-gradient-to-r from-red-500/20 to-red-500/5 border-red-500/30' :
              activity.priority === 'high' 
                ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-amber-500/30' :
              'bg-gradient-to-r from-blue-500/20 to-blue-500/5 border-blue-500/30'
            )}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant={activity.priority === 'critical' || activity.priority === 'urgent' ? 'urgent' : activity.priority === 'high' ? 'warning' : 'info'}>
                    {activity.priority}
                  </Badge>
                  <Badge variant={statusColors[activity.status || 'planned'] as any}>
                    {activity.status || 'planned'}
                  </Badge>
                  {activity.bureau && <BureauTag bureau={activity.bureau} />}
                  {activity.type && (
                    <Badge variant="default" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {activity.type}
                    </Badge>
                  )}
                </div>
                <h2 className="font-bold text-xl mb-2 truncate">{activity.title}</h2>
                <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {activity.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {activity.date}
                  </span>
                  {activity.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {activity.location}
                    </span>
                  )}
                  {activity.estimatedCharge && (
                    <span className="flex items-center gap-1.5">
                      <Target className="w-4 h-4" />
                      {activity.estimatedCharge}h estimées
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  'p-2 rounded-lg transition-colors ml-2 flex-shrink-0',
                  darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
                )}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions rapides */}
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(`${activity.title} - ${activity.date} ${activity.time}`);
                  addToast('Informations copiées', 'success');
                }}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copier
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addToast('Partage non implémenté', 'info')}
              >
                <Share2 className="w-3 h-3 mr-1" />
                Partager
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addToast('Rappel configuré', 'success')}
              >
                <Bell className="w-3 h-3 mr-1" />
                Rappel
              </Button>
            </div>
          </div>

          {/* Onglets */}
          <div className="flex border-b border-slate-700/30 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative',
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-slate-300',
                    darkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <Badge variant="default" className="ml-1 text-[10px] px-1.5 py-0">
                      {tab.badge}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Onglet Détails */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Description (si disponible dans notes ou titre) */}
                {activity.notes && activity.notes.length > 0 && activity.notes[0]?.content && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300">{activity.title}</p>
                      {activity.notes[0].content && (
                        <p className="text-sm text-slate-400 mt-2">{activity.notes[0].content}</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Informations générales */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Informations générales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activity.project && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                        <span className="text-sm text-slate-400">Projet</span>
                        <span className="font-mono text-orange-400 font-semibold">{activity.project}</span>
                      </div>
                    )}
                    {activity.client && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                        <span className="text-sm text-slate-400">Client</span>
                        <span className="font-medium">{activity.client}</span>
                      </div>
                    )}
                    {activity.estimatedCharge && (
                      <div className="flex items-center justify-between py-2 border-b border-slate-700/30">
                        <span className="text-sm text-slate-400">Charge estimée</span>
                        <span className="font-medium">{activity.estimatedCharge}h</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-400">Statut</span>
                      <Badge variant={statusColors[activity.status || 'planned'] as any}>
                        {activity.status || 'planned'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Participants */}
                {activity.participants && activity.participants.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Participants ({activity.participants.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {activity.participants.map((participant, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-lg transition-colors',
                              darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-gray-50 hover:bg-gray-100'
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                                {participant.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{participant.name}</p>
                                <p className="text-xs text-slate-400">{participant.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <BureauTag bureau={participant.bureau} />
                              {participant.confirmed ? (
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                              ) : (
                                <XCircle className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Conflits */}
                {activity.conflicts && activity.conflicts.length > 0 && (
                  <Card className="border-red-500/30 bg-red-500/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-red-400">
                        <AlertTriangle className="w-4 h-4" />
                        Conflits détectés ({activity.conflicts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {activity.conflicts.map((conflict, i) => (
                          <div key={i} className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={conflict.severity === 'critical' ? 'urgent' : conflict.severity === 'high' ? 'warning' : 'info'} className="text-xs">
                                {conflict.type}
                              </Badge>
                              <Badge variant="default" className="text-xs">
                                {conflict.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-300">{conflict.description}</p>
                            {conflict.detectedAt && (
                              <p className="text-xs text-slate-400 mt-1">
                                Détecté le {new Date(conflict.detectedAt).toLocaleDateString('fr-FR')}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dépendances */}
                {activity.dependencies && activity.dependencies.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Link2 className="w-4 h-4" />
                        Dépendances ({activity.dependencies.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {activity.dependencies.map((depId, i) => (
                          <div
                            key={i}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-lg',
                              darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                            )}
                          >
                            <span className="font-mono text-orange-400 text-sm">{depId}</span>
                            <Button size="xs" variant="ghost" onClick={() => {
                              addToast(`Navigation vers ${depId}`, 'info');
                            }}>
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Notes avec recherche */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Notes ({filteredNotes.length})
                      </CardTitle>
                      {activity.notes && activity.notes.length > 0 && (
                        <div className="relative">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400" />
                          <input
                            type="text"
                            value={searchNotes}
                            onChange={(e) => setSearchNotes(e.target.value)}
                            placeholder="Rechercher..."
                            className={cn(
                              'pl-7 pr-2 py-1 text-xs rounded border',
                              darkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-white border-gray-300'
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {filteredNotes.length > 0 ? (
                      filteredNotes.map((note: ActivityNote) => (
                        <div
                          key={note.id}
                          className={cn(
                            'p-3 rounded-lg border',
                            note.type === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                            note.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                            darkMode ? 'bg-slate-700/30 border-slate-600' : 'bg-gray-50 border-gray-200'
                          )}
                        >
                          <p className="text-sm text-slate-300 mb-2">{note.content}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-400">
                              {note.author} • {new Date(note.createdAt).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {note.type && (
                              <Badge variant={note.type === 'critical' ? 'urgent' : note.type === 'warning' ? 'warning' : 'info'} className="text-[10px]">
                                {note.type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-4">
                        {searchNotes ? 'Aucune note correspondante' : 'Aucune note'}
                      </p>
                    )}
                    <div className="flex gap-2 pt-2 border-t border-slate-700/30">
                      <input
                        type="text"
                        value={noteInput}
                        onChange={(e) => setNoteInput(e.target.value)}
                        placeholder="Ajouter une note..."
                        className={cn(
                          'flex-1 px-3 py-2 rounded-lg text-sm border',
                          darkMode
                            ? 'bg-slate-700/50 border-slate-600 text-slate-300'
                            : 'bg-white border-gray-300 text-gray-700'
                        )}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                      />
                      <Button size="sm" onClick={handleAddNote} disabled={!noteInput.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Onglet Historique */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  {historyEntries.map((entry, i) => (
                    <div
                      key={entry.id}
                      className={cn(
                        'flex items-start gap-4 p-4 rounded-lg border-l-4',
                        i === 0 ? 'border-l-blue-500 bg-blue-500/10' :
                        'border-l-slate-600',
                        darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                      )}
                    >
                      <div className="text-2xl flex-shrink-0">{entry.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-sm">{entry.action}</p>
                          <span className="text-xs text-slate-400">
                            {new Date(entry.date).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-1">Par {entry.author}</p>
                        {entry.details && (
                          <p className="text-sm text-slate-300 mt-2">{entry.details}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Onglet Documents */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Documents attachés</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      addToast('Téléversement de document (non implémenté)', 'info');
                    }}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc) => {
                      const getIcon = () => {
                        switch (doc.type) {
                          case 'pdf': return FileCheck;
                          case 'image': return ImageIcon;
                          case 'video': return Video;
                          default: return FileIcon;
                        }
                      };
                      const Icon = getIcon();
                      return (
                        <Card key={doc.id} className="hover:border-blue-500/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  'w-10 h-10 rounded-lg flex items-center justify-center',
                                  doc.type === 'pdf' ? 'bg-red-500/20' :
                                  doc.type === 'image' ? 'bg-blue-500/20' :
                                  doc.type === 'video' ? 'bg-purple-500/20' :
                                  'bg-slate-500/20'
                                )}>
                                  <Icon className={cn(
                                    'w-5 h-5',
                                    doc.type === 'pdf' ? 'text-red-400' :
                                    doc.type === 'image' ? 'text-blue-400' :
                                    doc.type === 'video' ? 'text-purple-400' :
                                    'text-slate-400'
                                  )} />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{doc.name}</p>
                                  <p className="text-xs text-slate-400">
                                    {doc.size} • {doc.uploadedBy} • {new Date(doc.uploadDate).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => addToast(`Téléchargement de ${doc.name}`, 'info')}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileIcon className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                      <p className="text-sm text-slate-400">Aucun document attaché</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Onglet Métriques */}
            {activeTab === 'metrics' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">Progression</span>
                        <span className="text-lg font-bold text-blue-400">{metrics.completionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${metrics.completionRate}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Heures</span>
                        <span className="text-lg font-bold text-emerald-400">
                          {metrics.actualHours}h / {metrics.estimatedHours}h
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        {((metrics.actualHours / metrics.estimatedHours) * 100).toFixed(0)}% utilisées
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Users className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                      <p className="text-2xl font-bold">{metrics.participantsCount}</p>
                      <p className="text-xs text-slate-400">Participants</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <MessageSquare className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                      <p className="text-2xl font-bold">{metrics.notesCount}</p>
                      <p className="text-xs text-slate-400">Notes</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className={cn(
                        'w-6 h-6 mx-auto mb-2',
                        metrics.conflictsCount > 0 ? 'text-red-400' : 'text-emerald-400'
                      )} />
                      <p className="text-2xl font-bold">{metrics.conflictsCount}</p>
                      <p className="text-xs text-slate-400">Conflits</p>
                    </CardContent>
                  </Card>
                </div>

                {metrics.dependenciesCount > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Dépendances</span>
                        <span className="text-lg font-bold text-orange-400">{metrics.dependenciesCount}</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Onglet Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className="relative">
                  {/* Ligne verticale */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
                  
                  {/* Événements */}
                  <div className="space-y-6">
                    {historyEntries.map((entry, i) => (
                      <div key={entry.id} className="relative flex items-start gap-4">
                        {/* Point sur la ligne */}
                        <div className={cn(
                          'absolute left-3 w-3 h-3 rounded-full border-2 z-10',
                          i === 0 ? 'bg-blue-500 border-blue-500' : 'bg-slate-600 border-slate-600'
                        )} />
                        
                        {/* Contenu */}
                        <div className={cn(
                          'ml-8 flex-1 p-4 rounded-lg',
                          i === 0 ? 'bg-blue-500/10 border border-blue-500/30' :
                          darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                        )}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{entry.icon}</span>
                              <p className="font-medium text-sm">{entry.action}</p>
                            </div>
                            <span className="text-xs text-slate-400">
                              {new Date(entry.date).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mb-1">Par {entry.author}</p>
                          {entry.details && (
                            <p className="text-sm text-slate-300 mt-2">{entry.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-slate-700/30 space-y-3 bg-slate-900/50">
            <div className="flex gap-2">
              {activity.status !== 'completed' && activity.status !== 'cancelled' && (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="flex-1"
                    onClick={handleEdit}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="warning"
                    className="flex-1"
                    onClick={handleReschedule}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Replanifier
                  </Button>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {activity.status !== 'completed' && activity.status !== 'cancelled' && (
                <>
                  <Button
                    size="sm"
                    variant="success"
                    className="flex-1"
                    onClick={handleComplete}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Marquer terminé
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleCancel}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Annuler
                  </Button>
                </>
              )}
              {activity.status === 'completed' && (
                <div className="flex items-center gap-2 text-emerald-400 w-full justify-center">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Activité terminée</span>
                </div>
              )}
              {activity.status === 'cancelled' && (
                <div className="flex items-center gap-2 text-red-400 w-full justify-center">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Activité annulée</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
