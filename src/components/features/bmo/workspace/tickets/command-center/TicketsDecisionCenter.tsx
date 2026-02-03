/**
 * Tickets Decision Center
 * Centre de décision pour actions en lot et individuelles
 */

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  X, Zap, AlertCircle, AlertTriangle, Clock, ArrowUpRight, 
  CheckCircle2, FileText, Users, TrendingUp, ChevronRight, Filter,
  MessageSquare, Loader2, Send, UserPlus, XCircle, RefreshCw,
  Star, Building2, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTicketsWorkspaceStore } from '@/lib/stores/ticketsWorkspaceStore';
import { ticketsApi, type Ticket, type TicketAssignee } from '@/lib/services/ticketsApiService';
import { useTicketsToast } from './TicketsToast';

type Props = {
  open: boolean;
  onClose: () => void;
};

type DecisionTab = 'overview' | 'critical' | 'assign' | 'resolve' | 'bulk';

export function TicketsDecisionCenter({ open, onClose }: Props) {
  const toast = useTicketsToast();
  const { selectedIds, toggleSelected, clearSelection } = useTicketsWorkspaceStore();
  
  const [activeTab, setActiveTab] = useState<DecisionTab>('overview');
  const [processing, setProcessing] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assignees, setAssignees] = useState<TicketAssignee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [resolutionNote, setResolutionNote] = useState('');
  const [escalationNote, setEscalationNote] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  // Load data
  useEffect(() => {
    if (!open) return;
    
    let cancelled = false;
    const loadData = async () => {
      setLoading(true);
      try {
        const [ticketsRes, assigneesRes] = await Promise.all([
          ticketsApi.getAll(undefined, undefined, 1, 100),
          ticketsApi.getAssignees(),
        ]);
        if (!cancelled) {
          setTickets(ticketsRes.data);
          setAssignees(assigneesRes);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Erreur', 'Impossible de charger les données');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    loadData();
    return () => { cancelled = true; };
  }, [open, toast]);

  // Stats
  const stats = useMemo(() => {
    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress');
    const critical = openTickets.filter(t => t.priority === 'critical');
    const slaBreached = openTickets.filter(t => t.sla.firstResponseBreached || t.sla.resolutionBreached);
    const unassigned = openTickets.filter(t => !t.assignee);
    
    return {
      critical,
      slaBreached,
      unassigned,
      totalOpen: openTickets.length,
      totalCritical: critical.length,
      totalSLABreached: slaBreached.length,
      totalUnassigned: unassigned.length,
      totalSelected: selectedIds.size,
    };
  }, [tickets, selectedIds]);

  const selectedTickets = useMemo(() => {
    const map = new Map(tickets.map(t => [t.id, t]));
    return Array.from(selectedIds).map(id => map.get(id)).filter(Boolean) as Ticket[];
  }, [tickets, selectedIds]);

  // Actions
  const handleBulkResolve = useCallback(async () => {
    if (selectedTickets.length === 0 || !resolutionNote.trim()) return;
    
    setProcessing(true);
    try {
      const ticketIds = selectedTickets.map(t => t.id);
      await ticketsApi.bulkResolve(ticketIds, resolutionNote);
      
      toast.success('Résolution réussie', `${ticketIds.length} tickets résolus`);
      clearSelection();
      setResolutionNote('');
      onClose();
    } catch (error) {
      toast.error('Erreur', 'Échec de la résolution');
    } finally {
      setProcessing(false);
    }
  }, [selectedTickets, resolutionNote, clearSelection, onClose, toast]);

  const handleBulkEscalate = useCallback(async () => {
    if (selectedTickets.length === 0 || !escalationNote.trim()) return;
    
    setProcessing(true);
    try {
      const ticketIds = selectedTickets.map(t => t.id);
      await ticketsApi.bulkEscalate(ticketIds, escalationNote);
      
      toast.warning('Escalade réussie', `${ticketIds.length} tickets escaladés`);
      clearSelection();
      setEscalationNote('');
      onClose();
    } catch (error) {
      toast.error('Erreur', 'Échec de l\'escalade');
    } finally {
      setProcessing(false);
    }
  }, [selectedTickets, escalationNote, clearSelection, onClose, toast]);

  const handleBulkAssign = useCallback(async () => {
    if (selectedTickets.length === 0 || !selectedAssignee) return;
    
    setProcessing(true);
    try {
      for (const ticket of selectedTickets) {
        await ticketsApi.assign({ ticketId: ticket.id, assigneeId: selectedAssignee });
      }
      
      const assignee = assignees.find(a => a.id === selectedAssignee);
      toast.info('Assignation réussie', `${selectedTickets.length} tickets assignés à ${assignee?.name}`);
      clearSelection();
      setSelectedAssignee('');
      onClose();
    } catch (error) {
      toast.error('Erreur', 'Échec de l\'assignation');
    } finally {
      setProcessing(false);
    }
  }, [selectedTickets, selectedAssignee, assignees, clearSelection, onClose, toast]);

  const handleQuickResolve = useCallback(async (ticketId: string) => {
    setProcessing(true);
    try {
      await ticketsApi.resolve({ ticketId, resolution: 'Résolution rapide' });
      toast.ticketResolved(tickets.find(t => t.id === ticketId)?.reference || ticketId);
      
      // Refresh list
      const result = await ticketsApi.getAll(undefined, undefined, 1, 100);
      setTickets(result.data);
    } catch (error) {
      toast.error('Erreur', 'Échec de la résolution');
    } finally {
      setProcessing(false);
    }
  }, [tickets, toast]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl max-h-[90vh] rounded-2xl border border-slate-700/50 bg-slate-900 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Centre de Décision</h2>
              <p className="text-sm text-slate-400">Actions rapides et décisions en lot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-800/50 bg-slate-900/50">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: TrendingUp },
            { id: 'critical', label: `Critiques (${stats.totalCritical})`, icon: AlertCircle },
            { id: 'assign', label: `Non-assignés (${stats.totalUnassigned})`, icon: UserPlus },
            { id: 'resolve', label: 'Résolution', icon: CheckCircle2 },
            { id: 'bulk', label: `Actions lot (${stats.totalSelected})`, icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DecisionTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      icon={AlertCircle}
                      label="Critiques"
                      value={stats.totalCritical}
                      color="rose"
                      onClick={() => setActiveTab('critical')}
                    />
                    <StatCard
                      icon={Clock}
                      label="SLA dépassés"
                      value={stats.totalSLABreached}
                      color="amber"
                    />
                    <StatCard
                      icon={Users}
                      label="Non-assignés"
                      value={stats.totalUnassigned}
                      color="blue"
                      onClick={() => setActiveTab('assign')}
                    />
                    <StatCard
                      icon={CheckCircle2}
                      label="Sélectionnés"
                      value={stats.totalSelected}
                      color="purple"
                      onClick={() => setActiveTab('bulk')}
                    />
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-300">Actions rapides</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <QuickActionButton
                        icon={ArrowUpRight}
                        title="Escalader les critiques"
                        description={`${stats.totalCritical} tickets en attente`}
                        color="orange"
                        onClick={() => setActiveTab('critical')}
                      />
                      <QuickActionButton
                        icon={UserPlus}
                        title="Assigner les tickets"
                        description={`${stats.totalUnassigned} non-assignés`}
                        color="blue"
                        onClick={() => setActiveTab('assign')}
                      />
                      <QuickActionButton
                        icon={CheckCircle2}
                        title="Résolution en lot"
                        description="Résoudre plusieurs tickets"
                        color="green"
                        onClick={() => setActiveTab('resolve')}
                      />
                      <QuickActionButton
                        icon={RefreshCw}
                        title="Actualiser les données"
                        description="Synchroniser avec le serveur"
                        color="purple"
                        onClick={async () => {
                          const result = await ticketsApi.getAll(undefined, undefined, 1, 100);
                          setTickets(result.data);
                          toast.dataRefreshed();
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Critical Tab */}
              {activeTab === 'critical' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-300">
                      Tickets Critiques ({stats.critical.length})
                    </h3>
                    {stats.critical.length > 0 && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          stats.critical.forEach(t => toggleSelected(t.id));
                          setActiveTab('bulk');
                        }}
                      >
                        Sélectionner tous
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {stats.critical.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500/50" />
                        <p>Aucun ticket critique en attente</p>
                      </div>
                    ) : (
                      stats.critical.map(ticket => (
                        <TicketRow
                          key={ticket.id}
                          ticket={ticket}
                          selected={selectedIds.has(ticket.id)}
                          onToggle={() => toggleSelected(ticket.id)}
                          onQuickResolve={() => handleQuickResolve(ticket.id)}
                          processing={processing}
                        />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Assign Tab */}
              {activeTab === 'assign' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-300">
                      Tickets Non-Assignés ({stats.unassigned.length})
                    </h3>
                  </div>
                  
                  {/* Assignee Selector */}
                  <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Assigner à
                    </label>
                    <Select value={selectedAssignee || '__none__'} onValueChange={v => setSelectedAssignee(v === '__none__' ? '' : v)}>
                      <SelectTrigger className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-purple-500/50">
                        <SelectValue placeholder="Sélectionner un agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Sélectionner un agent...</SelectItem>
                        {assignees.map(a => (
                          <SelectItem key={a.id} value={a.id}>{a.name} — {a.department}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {stats.unassigned.map(ticket => (
                      <TicketRow
                        key={ticket.id}
                        ticket={ticket}
                        selected={selectedIds.has(ticket.id)}
                        onToggle={() => toggleSelected(ticket.id)}
                        processing={processing}
                      />
                    ))}
                  </div>

                  {selectedTickets.length > 0 && selectedAssignee && (
                    <Button
                      onClick={handleBulkAssign}
                      disabled={processing}
                      className="w-full gap-2"
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UserPlus className="w-4 h-4" />
                      )}
                      Assigner {selectedTickets.length} ticket(s)
                    </Button>
                  )}
                </div>
              )}

              {/* Resolve Tab */}
              {activeTab === 'resolve' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300">Résolution en lot</h3>
                  
                  {selectedTickets.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700 rounded-xl">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                      <p>Sélectionnez des tickets à résoudre</p>
                      <p className="text-sm mt-1">Utilisez les autres onglets pour sélectionner</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {selectedTickets.map(ticket => (
                          <Badge
                            key={ticket.id}
                            variant="outline"
                            className="gap-2"
                          >
                            {ticket.reference}
                            <button onClick={() => toggleSelected(ticket.id)}>
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-300">
                          Message de résolution
                        </label>
                        <textarea
                          value={resolutionNote}
                          onChange={e => setResolutionNote(e.target.value)}
                          placeholder="Décrivez la résolution appliquée..."
                          rows={4}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                        />
                      </div>

                      <Button
                        onClick={handleBulkResolve}
                        disabled={processing || !resolutionNote.trim()}
                        className="w-full gap-2 bg-emerald-600 hover:bg-emerald-500"
                      >
                        {processing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Résoudre {selectedTickets.length} ticket(s)
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Bulk Tab */}
              {activeTab === 'bulk' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-300">
                      Actions en lot ({selectedTickets.length} sélectionnés)
                    </h3>
                    {selectedTickets.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={clearSelection}
                      >
                        Tout désélectionner
                      </Button>
                    )}
                  </div>

                  {selectedTickets.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700 rounded-xl">
                      <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                      <p>Aucun ticket sélectionné</p>
                    </div>
                  ) : (
                    <>
                      {/* Selected Tickets List */}
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {selectedTickets.map(ticket => (
                          <TicketRow
                            key={ticket.id}
                            ticket={ticket}
                            selected={true}
                            onToggle={() => toggleSelected(ticket.id)}
                            compact
                          />
                        ))}
                      </div>

                      {/* Bulk Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Escalation */}
                        <div className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/5">
                          <h4 className="font-medium text-orange-400 flex items-center gap-2 mb-3">
                            <ArrowUpRight className="w-4 h-4" />
                            Escalader
                          </h4>
                          <textarea
                            value={escalationNote}
                            onChange={e => setEscalationNote(e.target.value)}
                            placeholder="Motif d'escalade..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none text-sm mb-3"
                          />
                          <Button
                            onClick={handleBulkEscalate}
                            disabled={processing || !escalationNote.trim()}
                            size="sm"
                            className="w-full bg-orange-600 hover:bg-orange-500"
                          >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Escalader'}
                          </Button>
                        </div>

                        {/* Resolution */}
                        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                          <h4 className="font-medium text-emerald-400 flex items-center gap-2 mb-3">
                            <CheckCircle2 className="w-4 h-4" />
                            Résoudre
                          </h4>
                          <textarea
                            value={resolutionNote}
                            onChange={e => setResolutionNote(e.target.value)}
                            placeholder="Message de résolution..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none text-sm mb-3"
                          />
                          <Button
                            onClick={handleBulkResolve}
                            disabled={processing || !resolutionNote.trim()}
                            size="sm"
                            className="w-full bg-emerald-600 hover:bg-emerald-500"
                          >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Résoudre'}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ================================
// Helper Components
// ================================

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: 'rose' | 'amber' | 'blue' | 'purple' | 'emerald';
  onClick?: () => void;
}

function StatCard({ icon: Icon, label, value, color, onClick }: StatCardProps) {
  const colors = {
    rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'p-4 rounded-xl border text-left transition-all',
        colors[color],
        onClick && 'hover:scale-[1.02] cursor-pointer'
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn('w-4 h-4', colors[color].split(' ')[0])} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-100">{value}</p>
    </button>
  );
}

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: 'orange' | 'blue' | 'green' | 'purple';
  onClick?: () => void;
}

function QuickActionButton({ icon: Icon, title, description, color, onClick }: QuickActionButtonProps) {
  const colors = {
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    purple: 'text-purple-400',
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-900/30 hover:border-slate-600/50 hover:bg-slate-800/30 transition-all text-left group"
    >
      <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 group-hover:border-slate-600/50 transition-colors">
        <Icon className={cn('w-5 h-5', colors[color])} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200">{title}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
    </button>
  );
}

interface TicketRowProps {
  ticket: Ticket;
  selected: boolean;
  onToggle: () => void;
  onQuickResolve?: () => void;
  processing?: boolean;
  compact?: boolean;
}

function TicketRow({ ticket, selected, onToggle, onQuickResolve, processing, compact }: TicketRowProps) {
  const priorityColors = {
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    high: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    medium: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    low: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        selected 
          ? 'border-purple-500/50 bg-purple-500/10' 
          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600/50',
        compact && 'py-2'
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
          selected 
            ? 'bg-purple-500 border-purple-500' 
            : 'border-slate-600 hover:border-slate-500'
        )}
      >
        {selected && <CheckCircle2 className="w-3 h-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-slate-400">{ticket.reference}</span>
          <Badge className={cn('text-[10px]', priorityColors[ticket.priority])}>
            {ticket.priority}
          </Badge>
          {ticket.sla.resolutionBreached && (
            <Badge variant="destructive" className="text-[10px]">
              SLA
            </Badge>
          )}
          {ticket.client.vip && (
            <Star className="w-3 h-3 text-amber-400" />
          )}
        </div>
        {!compact && (
          <p className="text-sm text-slate-300 truncate mt-0.5">{ticket.title}</p>
        )}
      </div>

      {!compact && (
        <div className="text-right text-xs text-slate-400 flex-shrink-0">
          <p>{ticket.client.name}</p>
          <p>{ticket.assignee?.name || 'Non-assigné'}</p>
        </div>
      )}

      {onQuickResolve && (
        <Button
          size="sm"
          variant="ghost"
          onClick={e => {
            e.stopPropagation();
            onQuickResolve();
          }}
          disabled={processing}
          className="flex-shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

