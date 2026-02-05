/**
 * Panneau d'actions rapides
 * Boutons pour créer événement, ajouter absence, etc.
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import {
  Plus,
  CalendarPlus,
  UserMinus,
  Link as LinkIcon,
  Download,
  Bell,
} from 'lucide-react';
import { CreerEvenementModal } from '@/components/features/bmo/calendrier/modals/CreerEvenementModal';
import { ExportCalendrierModal } from '@/components/features/bmo/calendrier/modals/ExportCalendrierModal';
import { AjouterAbsenceModal } from './modals/AjouterAbsenceModal';
import { LierChantierModal } from './modals/LierChantierModal';
import { ActiverAlerteModal } from './modals/ActiverAlerteModal';
import {
  createEvenement,
  linkEvenementToChantier,
  createAbsence,
  exportCalendrier,
  createAlerte,
} from '../api/calendrierApi';
import { useCalendrierData } from '../hooks/useCalendrierData';
import { useCalendrierFilters } from '../hooks/useCalendrierFilters';
import { useToast } from '@/components/features/bmo/ToastProvider';
import { logger } from '@/lib/utils/logger';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'primary';
}

export function QuickActionsPanel() {
  const router = useRouter();
  const { success, error } = useToast();
  const { periode, dateDebut, dateFin, chantierId } = useCalendrierFilters();
  const { refetch } = useCalendrierData();
  
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [addAbsenceOpen, setAddAbsenceOpen] = useState(false);
  const [linkChantierOpen, setLinkChantierOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const actions: QuickAction[] = [
    {
      id: 'create-event',
      label: 'Créer événement',
      icon: CalendarPlus,
      onClick: () => setCreateEventOpen(true),
      variant: 'primary',
    },
    {
      id: 'add-absence',
      label: 'Ajouter absence',
      icon: UserMinus,
      onClick: () => setAddAbsenceOpen(true),
    },
    {
      id: 'link-chantier',
      label: 'Lier à chantier',
      icon: LinkIcon,
      onClick: () => setLinkChantierOpen(true),
    },
    {
      id: 'export-period',
      label: 'Exporter période',
      icon: Download,
      onClick: () => setExportOpen(true),
    },
    {
      id: 'activate-alert',
      label: 'Activer alerte',
      icon: Bell,
      onClick: () => setAlertOpen(true),
    },
  ];

  const handleCreateEvent = async (data: {
    titre: string;
    date: string;
    heure: string;
    type: string;
    description?: string;
    bureau?: string;
  }) => {
    setLoading('create-event');
    try {
      // Combiner date et heure pour créer un timestamp
      const dateDebut = `${data.date}T${data.heure}:00`;
      const dateFin = new Date(new Date(dateDebut).getTime() + 60 * 60 * 1000).toISOString(); // +1h par défaut
      
      await createEvenement({
        type: data.type as 'EVENEMENT' | 'REUNION_PROJET' | 'REUNION_DECISIONNELLE',
        titre: data.titre,
        description: data.description,
        date_debut: dateDebut,
        date_fin: dateFin,
        chantier_id: chantierId || null,
      });
      
      success('L\'événement a été créé avec succès.', { title: 'Événement créé' });
      
      setCreateEventOpen(false);
      await refetch();
    } catch (err) {
      error('Impossible de créer l\'événement. Veuillez réessayer.', { title: 'Erreur' });
      if (process.env.NODE_ENV === 'development') {
        logger.error('Erreur création événement', err instanceof Error ? err : undefined, { component: 'QuickActionsPanel' });
      }
    } finally {
      setLoading(null);
    }
  };

  const handleAddAbsence = async (data: {
    user_id: number;
    type: 'CONGÉ' | 'MISSION' | 'ABSENCE';
    date_debut: string;
    date_fin: string;
    motif?: string;
    chantier_id?: number;
  }) => {
    setLoading('add-absence');
    try {
      await createAbsence({
        user_id: data.user_id,
        type: data.type,
        date_debut: data.date_debut,
        date_fin: data.date_fin,
        motif: data.motif,
        chantier_id: data.chantier_id || null,
      });
      
      success('L\'absence a été ajoutée avec succès.', { title: 'Absence ajoutée' });
      
      setAddAbsenceOpen(false);
      await refetch();
    } catch (err) {
      error('Impossible d\'ajouter l\'absence. Veuillez réessayer.', { title: 'Erreur' });
      if (process.env.NODE_ENV === 'development') {
        logger.error('Erreur ajout absence', err instanceof Error ? err : undefined, { component: 'QuickActionsPanel' });
      }
    } finally {
      setLoading(null);
    }
  };

  const handleLinkChantier = async (data: {
    event_id: number;
    chantier_id: number;
  }) => {
    setLoading('link-chantier');
    try {
      await linkEvenementToChantier(data.event_id, data.chantier_id);
      
      success('L\'événement a été lié au chantier avec succès.', { title: 'Liaison effectuée' });
      
      setLinkChantierOpen(false);
      await refetch();
    } catch (err) {
      error('Impossible de lier l\'événement au chantier. Veuillez réessayer.', { title: 'Erreur' });
      if (process.env.NODE_ENV === 'development') {
        logger.error('Erreur liaison chantier', err instanceof Error ? err : undefined, { component: 'QuickActionsPanel' });
      }
    } finally {
      setLoading(null);
    }
  };

  const handleExport = async (format: 'ical' | 'excel', config: any) => {
    setLoading('export');
    try {
      const blob = await exportCalendrier({
        format,
        date_debut: dateDebut || undefined,
        date_fin: dateFin || undefined,
        chantier_id: chantierId || undefined,
        include_jalons: config?.include_jalons !== false,
        include_evenements: config?.include_evenements !== false,
        include_absences: config?.include_absences !== false,
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `calendrier-export-${new Date().toISOString().split('T')[0]}.${format === 'ical' ? 'ics' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      success(`Le calendrier a été exporté en ${format.toUpperCase()}.`, { title: 'Export réussi' });
      
      setExportOpen(false);
    } catch (err) {
      error('Impossible d\'exporter le calendrier. Veuillez réessayer.', { title: 'Erreur' });
      if (process.env.NODE_ENV === 'development') {
        logger.error('Erreur export', err instanceof Error ? err : undefined, { component: 'QuickActionsPanel' });
      }
    } finally {
      setLoading(null);
    }
  };

  const handleActivateAlert = async (data: {
    type: string;
    conditions: Record<string, any>;
  }) => {
    setLoading('activate-alert');
    try {
      await createAlerte({
        type: data.type as 'SLA_RISQUE' | 'RETARD' | 'SURALLOCATION',
        conditions: data.conditions,
        chantier_id: chantierId || undefined,
      });
      
      success('L\'alerte a été activée avec succès.', { title: 'Alerte activée' });
      
      setAlertOpen(false);
      await refetch();
    } catch (err) {
      error('Impossible d\'activer l\'alerte. Veuillez réessayer.', { title: 'Erreur' });
      if (process.env.NODE_ENV === 'development') {
        logger.error('Erreur activation alerte', err instanceof Error ? err : undefined, { component: 'QuickActionsPanel' });
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-200">Actions rapides</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                variant={action.variant === 'primary' ? 'default' : 'outline'}
                size="sm"
                onClick={action.onClick}
                disabled={loading === action.id}
                className={cn(
                  'flex items-center gap-2 h-9 text-xs font-medium',
                  action.variant === 'primary'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                    : 'bg-slate-800/50 text-slate-300 border-slate-700/50 hover:bg-slate-700/50',
                  loading === action.id && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Icon className={cn('h-3.5 w-3.5', loading === action.id && 'animate-spin')} />
                <span>{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Modales */}
      <CreerEvenementModal
        isOpen={createEventOpen}
        onClose={() => setCreateEventOpen(false)}
        onSave={handleCreateEvent}
      />
      <AjouterAbsenceModal
        isOpen={addAbsenceOpen}
        onClose={() => setAddAbsenceOpen(false)}
        onSave={handleAddAbsence}
      />
      <LierChantierModal
        isOpen={linkChantierOpen}
        onClose={() => setLinkChantierOpen(false)}
        onSave={handleLinkChantier}
      />
      <ExportCalendrierModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
        period="month"
      />
      <ActiverAlerteModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        onSave={handleActivateAlert}
      />
    </>
  );
}

