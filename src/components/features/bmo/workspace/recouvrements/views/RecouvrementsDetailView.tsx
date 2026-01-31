'use client';

import { useState, useEffect } from 'react';
import { recouvrementsApiService, type Creance } from '@/lib/services/recouvrementsApiService';
import { DollarSign, Building2, Calendar, Clock, AlertTriangle, FileText, History, Bell, Phone, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props { tabId: string; data: Record<string, unknown>; }

const STATUS_STYLES = {
  pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500' },
  in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500' },
  paid: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500' },
  litige: { bg: 'bg-red-500/10', text: 'text-red-600', border: 'border-red-500' },
  irrecoverable: { bg: 'bg-slate-500/10', text: 'text-slate-600', border: 'border-slate-500' },
};

export function RecouvrementsDetailView({ tabId, data }: Props) {
  const [creance, setCreance] = useState<Creance | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'relances' | 'documents'>('overview');

  const creanceId = data.creanceId as string;

  useEffect(() => {
    const load = async () => {
      if (!creanceId) return;
      setLoading(true);
      try { const result = await recouvrementsApiService.getById(creanceId); setCreance(result || null); }
      catch (error) { console.error('Failed:', error); }
      finally { setLoading(false); }
    };
    load();
  }, [creanceId]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800" /></div>;
  if (!creance) return <div className="text-center py-12 text-slate-400"><DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Créance non trouvée</p></div>;

  const style = STATUS_STYLES[creance.status] || STATUS_STYLES.pending;
  const progress = creance.montant > 0 ? Math.round((creance.montantRecouvre / creance.montant) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className={cn("rounded-xl border-l-4 p-6", style.border, "bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800")}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-amber-500">{creance.id}</span>
              <span className={cn("px-3 py-1 rounded text-sm font-medium", style.bg, style.text)}>{recouvrementsApiService.getStatusLabel(creance.status).toUpperCase()}</span>
              {creance.joursRetard > 0 && <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-600"><AlertTriangle className="w-3 h-3 inline mr-1" />{creance.joursRetard}j retard</span>}
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{creance.client}</h1>
            <p className="text-slate-400 mt-1">{creance.projetName || 'Projet non spécifié'}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-amber-600 dark:text-amber-400">{recouvrementsApiService.formatMontant(creance.montant)} FCFA</p>
            <p className="text-sm text-slate-400 mt-1">Montant total</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progression du recouvrement</span>
            <span className="text-sm font-medium text-emerald-600">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
            <span>Recouvré: {recouvrementsApiService.formatMontant(creance.montantRecouvre)} FCFA</span>
            <span>Restant: {recouvrementsApiService.formatMontant(creance.montant - creance.montantRecouvre)} FCFA</span>
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{new Date(creance.dateFacture).toLocaleDateString('fr-FR')}</p>
            <p className="text-xs text-slate-400">Date facture</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <Clock className="w-5 h-5 mx-auto mb-2 text-amber-500" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{new Date(creance.dateEcheance).toLocaleDateString('fr-FR')}</p>
            <p className="text-xs text-slate-400">Échéance</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <Bell className="w-5 h-5 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{creance.nbRelances}</p>
            <p className="text-xs text-slate-400">Relances</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <AlertTriangle className={cn("w-5 h-5 mx-auto mb-2", creance.joursRetard > 0 ? "text-red-500" : "text-emerald-500")} />
            <p className={cn("text-sm font-medium", creance.joursRetard > 0 ? "text-red-600" : "text-emerald-600")}>{creance.joursRetard > 0 ? `${creance.joursRetard}j` : 'À jour'}</p>
            <p className="text-xs text-slate-400">Retard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: FileText },
          { id: 'relances', label: 'Historique relances', icon: History },
          { id: 'documents', label: 'Documents', icon: FileText },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveSection(id as typeof activeSection)} className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeSection === id ? "border-amber-500 text-amber-600" : "border-transparent text-slate-400 hover:text-slate-700")}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800 p-6">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Contact client</h3>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors">
                  <Phone className="w-4 h-4" />{creance.contactClient || 'Non renseigné'}
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors">
                  <Mail className="w-4 h-4" />Envoyer un email
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-400 mb-1">Projet associé</p><p className="font-medium text-slate-900 dark:text-slate-100">{creance.projetName || 'N/A'}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Dernière relance</p><p className="font-medium text-slate-900 dark:text-slate-100">{creance.derniereRelance ? new Date(creance.derniereRelance).toLocaleDateString('fr-FR') : 'Aucune'}</p></div>
            </div>
          </div>
        )}
        {activeSection === 'relances' && <div className="text-center py-8 text-slate-400"><History className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Historique des relances en cours de développement</p></div>}
        {activeSection === 'documents' && <div className="text-center py-8 text-slate-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Documents en cours de développement</p></div>}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
        <button className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Modifier</button>
        <button className="px-6 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600"><Bell className="w-4 h-4 inline mr-2" />Nouvelle relance</button>
        <button className="px-6 py-2.5 rounded-lg bg-amber-500 text-white font-medium hover:bg-amber-600"><DollarSign className="w-4 h-4 inline mr-2" />Enregistrer paiement</button>
      </div>
    </div>
  );
}

