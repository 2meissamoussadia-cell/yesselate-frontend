'use client';

import { useState, useEffect } from 'react';
import { litigesApiService, type Litige } from '@/lib/services/litigesApiService';
import { Scale, Building2, User, Calendar, DollarSign, AlertTriangle, FileText, History, MessageSquare, Gavel } from 'lucide-react';
import { cn } from '@/lib/cn';
import { logger } from '@/lib/utils/logger';

interface Props { tabId: string; data: Record<string, unknown>; }

const STATUS_STYLES = {
  active: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500' },
  closed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500' },
  negotiation: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500' },
  judgment: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500' },
};

export function LitigesDetailView({ tabId, data }: Props) {
  const [litige, setLitige] = useState<Litige | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'documents' | 'historique' | 'notes'>('overview');

  const litigeId = data.litigeId as string;

  useEffect(() => {
    const load = async () => {
      if (!litigeId) return;
      setLoading(true);
      try { const result = await litigesApiService.getById(litigeId); setLitige(result || null); }
      catch (error) { logger.error('Litiges detail load failed', error as Error, { context: 'LitigesDetailView' }); }
      finally { setLoading(false); }
    };
    load();
  }, [litigeId]);

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800" /><div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800" /></div>;
  if (!litige) return <div className="text-center py-12 text-slate-400"><Scale className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Litige non trouvé</p></div>;

  const style = STATUS_STYLES[litige.status] || STATUS_STYLES.active;
  const riskColor = litigesApiService.getRiskColor(litige.risque);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className={cn("rounded-xl border-l-4 p-6", style.border, "bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800")}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-red-500">{litige.id}</span>
              <span className={cn("px-3 py-1 rounded text-sm font-medium", style.bg, style.text)}>{litigesApiService.getStatusLabel(litige.status).toUpperCase()}</span>
              <span className={cn("px-2 py-1 rounded text-xs font-medium", riskColor === 'red' ? 'bg-red-500/20 text-red-600' : riskColor === 'amber' ? 'bg-amber-500/20 text-amber-600' : 'bg-emerald-500/20 text-emerald-600')}>
                <AlertTriangle className="w-3 h-3 inline mr-1" />{litige.risque === 'high' ? 'Risque élevé' : litige.risque === 'medium' ? 'Risque moyen' : 'Risque faible'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{litige.objet}</h1>
            <p className="text-slate-400 mt-1">Contre: {litige.adversaire}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-red-600 dark:text-red-400">{litigesApiService.formatMontant(litige.exposure)} FCFA</p>
            <p className="text-sm text-slate-400 mt-1">Exposition</p>
          </div>
        </div>

        {/* Quick info */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <Scale className="w-5 h-5 mx-auto mb-2 text-red-500" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{litige.juridiction}</p>
            <p className="text-xs text-slate-400">Juridiction</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <User className="w-5 h-5 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{litige.avocat}</p>
            <p className="text-xs text-slate-400">Avocat</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-2 text-amber-500" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{litigesApiService.formatMontant(litige.montant)}</p>
            <p className="text-xs text-slate-400">Montant réclamé</p>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{litige.prochainRDV ? new Date(litige.prochainRDV).toLocaleDateString('fr-FR') : 'N/A'}</p>
            <p className="text-xs text-slate-400">Prochaine audience</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Vue d\'ensemble', icon: FileText },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'historique', label: 'Historique', icon: History },
          { id: 'notes', label: 'Notes', icon: MessageSquare },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveSection(id as typeof activeSection)} className={cn("flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors", activeSection === id ? "border-red-500 text-red-600 dark:text-red-400" : "border-transparent text-slate-400 hover:text-slate-700")}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800 p-6">
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Description</h3>
              <p className="text-slate-400">{litige.description || 'Aucune description disponible.'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-400 mb-1">Type de litige</p><p className="font-medium text-slate-900 dark:text-slate-100">{litige.type}</p></div>
              <div><p className="text-xs text-slate-400 mb-1">Date d'ouverture</p><p className="font-medium text-slate-900 dark:text-slate-100">{litige.dateOuverture ? new Date(litige.dateOuverture).toLocaleDateString('fr-FR') : 'N/A'}</p></div>
            </div>
          </div>
        )}
        {activeSection === 'documents' && <div className="text-center py-8 text-slate-400"><FileText className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Documents en cours de développement</p></div>}
        {activeSection === 'historique' && <div className="text-center py-8 text-slate-400"><History className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Historique en cours de développement</p></div>}
        {activeSection === 'notes' && <div className="text-center py-8 text-slate-400"><MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Notes en cours de développement</p></div>}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 p-4 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-200/70 dark:border-slate-800">
        <button className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Ajouter une note</button>
        <button className="px-6 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600"><MessageSquare className="w-4 h-4 inline mr-2" />Négocier</button>
        <button className="px-6 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600"><Gavel className="w-4 h-4 inline mr-2" />Escalader</button>
      </div>
    </div>
  );
}

