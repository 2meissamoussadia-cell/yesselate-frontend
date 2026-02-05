/**
 * ====================================================================
 * VUE AVANCÉE : Échéancier des Paiements
 * Calendrier interactif pour planification et visualisation des échéances
 * ====================================================================
 */

'use client';

import { useState, useMemo } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  AlertTriangle,
  DollarSign,
  Filter,
  Download,
  RefreshCw,
  CalendarDays,
  CalendarClock,
  List,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PaiementEcheance {
  id: string;
  reference: string;
  fournisseur: string;
  montant: number;
  dueDate: string;
  scheduledDate?: string;
  status: 'pending' | 'scheduled' | 'validated' | 'executed';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  bureau: string;
  paymentMethod?: 'virement' | 'cheque' | 'especes' | 'carte';
}

type ViewMode = 'month' | 'week' | 'day' | 'list';

interface PaiementsEcheancierViewProps {
  className?: string;
}

export function PaiementsEcheancierView({ className }: PaiementsEcheancierViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedBureaux, setSelectedBureaux] = useState<string[]>([]);
  const [selectedUrgency, setSelectedUrgency] = useState<string[]>([]);
  const [showOnlyScheduled, setShowOnlyScheduled] = useState(false);

  // Mock data - à remplacer par API
  const mockPaiements: PaiementEcheance[] = useMemo(() => [
    {
      id: '1',
      reference: 'PAY-202601-12345',
      fournisseur: 'SENELEC',
      montant: 15000000,
      dueDate: '2026-01-15',
      scheduledDate: '2026-01-14',
      status: 'scheduled',
      urgency: 'critical',
      bureau: 'Dakar',
      paymentMethod: 'virement',
    },
    {
      id: '2',
      reference: 'PAY-202601-12346',
      fournisseur: 'SONATEL',
      montant: 3500000,
      dueDate: '2026-01-18',
      status: 'validated',
      urgency: 'high',
      bureau: 'Thiès',
    },
    {
      id: '3',
      reference: 'PAY-202601-12347',
      fournisseur: 'SDE',
      montant: 8200000,
      dueDate: '2026-01-20',
      scheduledDate: '2026-01-19',
      status: 'scheduled',
      urgency: 'medium',
      bureau: 'Dakar',
      paymentMethod: 'virement',
    },
    {
      id: '4',
      reference: 'PAY-202601-12348',
      fournisseur: 'ONAS',
      montant: 12000000,
      dueDate: '2026-01-22',
      status: 'pending',
      urgency: 'high',
      bureau: 'Saint-Louis',
    },
    {
      id: '5',
      reference: 'PAY-202601-12349',
      fournisseur: 'Fournisseur ABC',
      montant: 5500000,
      dueDate: '2026-01-25',
      status: 'validated',
      urgency: 'medium',
      bureau: 'Dakar',
    },
  ], []);

  // Filtrer paiements
  const filteredPaiements = useMemo(() => {
    return mockPaiements.filter(p => {
      if (selectedBureaux.length > 0 && !selectedBureaux.includes(p.bureau)) return false;
      if (selectedUrgency.length > 0 && !selectedUrgency.includes(p.urgency)) return false;
      if (showOnlyScheduled && !p.scheduledDate) return false;
      return true;
    });
  }, [mockPaiements, selectedBureaux, selectedUrgency, showOnlyScheduled]);

  // Grouper par date
  const paiementsByDate = useMemo(() => {
    const grouped: Record<string, PaiementEcheance[]> = {};
    filteredPaiements.forEach(p => {
      const date = p.scheduledDate || p.dueDate;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(p);
    });
    return grouped;
  }, [filteredPaiements]);

  // Générer calendrier du mois
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: Array<{ date: Date; isCurrentMonth: boolean; paiements: PaiementEcheance[] }> = [];
    
    // Jours du mois précédent
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, isCurrentMonth: false, paiements: [] });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({ 
        date, 
        isCurrentMonth: true, 
        paiements: paiementsByDate[dateStr] || []
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines × 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false, paiements: [] });
    }
    
    return days;
  }, [currentDate, paiementsByDate]);

  // Stats échéancier
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const totalMontant = filteredPaiements.reduce((sum, p) => sum + p.montant, 0);
    const enRetard = filteredPaiements.filter(p => p.dueDate < today && p.status !== 'executed').length;
    const critical = filteredPaiements.filter(p => p.urgency === 'critical').length;
    const planifies = filteredPaiements.filter(p => p.scheduledDate).length;
    
    return { totalMontant, enRetard, critical, planifies };
  }, [filteredPaiements]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500/10 text-blue-400';
      case 'validated': return 'bg-green-500/10 text-green-400';
      case 'executed': return 'bg-emerald-500/10 text-emerald-400';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header avec stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <DollarSign className="h-4 w-4" />
            <span>Montant Total</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {(stats.totalMontant / 1000000).toFixed(1)}M
          </div>
          <div className="text-xs text-slate-400">{filteredPaiements.length} paiements</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span>En Retard</span>
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.enRetard}</div>
          <div className="text-xs text-slate-400">échéances dépassées</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-400 text-sm mb-1">
            <Clock className="h-4 w-4" />
            <span>Critiques</span>
          </div>
          <div className="text-2xl font-bold text-orange-400">{stats.critical}</div>
          <div className="text-xs text-slate-400">haute priorité</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
            <CalendarClock className="h-4 w-4" />
            <span>Planifiés</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{stats.planifies}</div>
          <div className="text-xs text-slate-400">avec date d'exécution</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-semibold text-white min-w-[180px] text-center">
            {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="ml-2"
          >
            Aujourd'hui
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode selector */}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="h-7 px-3"
            >
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Mois
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-7 px-3"
            >
              <List className="h-3.5 w-3.5 mr-1.5" />
              Liste
            </Button>
          </div>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendrier ou Liste */}
      {viewMode === 'month' ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
          {/* En-têtes jours de la semaine */}
          <div className="grid grid-cols-7 border-b border-slate-800">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-slate-400 bg-slate-900/80"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grille calendrier */}
          <div className="grid grid-cols-7">
            {monthDays.map((day, index) => {
              const isToday = day.date.toDateString() === new Date().toDateString();
              const hasPaiements = day.paiements.length > 0;
              const totalMontantDay = day.paiements.reduce((sum, p) => sum + p.montant, 0);

              return (
                <div
                  key={index}
                  className={cn(
                    'min-h-[120px] p-2 border-r border-b border-slate-800',
                    !day.isCurrentMonth && 'bg-slate-900/30',
                    isToday && 'bg-blue-500/5'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        day.isCurrentMonth ? 'text-slate-300' : 'text-slate-600',
                        isToday && 'bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center'
                      )}
                    >
                      {day.date.getDate()}
                    </span>
                    {hasPaiements && (
                      <Badge variant="gray" className="text-xs h-5">
                        {day.paiements.length}
                      </Badge>
                    )}
                  </div>

                  {/* Liste paiements du jour */}
                  <div className="space-y-1">
                    {day.paiements.slice(0, 2).map(p => (
                      <div
                        key={p.id}
                        className={cn(
                          'text-xs p-1.5 rounded border cursor-pointer hover:opacity-80 transition-opacity',
                          getUrgencyColor(p.urgency)
                        )}
                        title={`${p.reference} - ${p.fournisseur} - ${(p.montant / 1000000).toFixed(1)}M FCFA`}
                      >
                        <div className="font-medium truncate">{p.fournisseur}</div>
                        <div className="text-[10px] opacity-70">
                          {(p.montant / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    ))}
                    {day.paiements.length > 2 && (
                      <div className="text-[10px] text-slate-400 text-center pt-0.5">
                        +{day.paiements.length - 2} autre{day.paiements.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Vue Liste */
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
          <div className="divide-y divide-slate-800">
            {filteredPaiements.map(p => (
              <div
                key={p.id}
                className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-white">{p.reference}</span>
                      <Badge className={getStatusColor(p.status)}>
                        {p.status}
                      </Badge>
                      <Badge className={getUrgencyColor(p.urgency)}>
                        {p.urgency}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-400 space-y-1">
                      <div>{p.fournisseur}</div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {p.bureau}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          Échéance: {new Date(p.dueDate).toLocaleDateString('fr-FR')}
                        </span>
                        {p.scheduledDate && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <CalendarClock className="h-3 w-3" />
                            Planifié: {new Date(p.scheduledDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {(p.montant / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-xs text-slate-400">FCFA</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

