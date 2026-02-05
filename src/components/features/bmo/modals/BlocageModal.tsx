'use client';

import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BureauTag } from '@/components/features/bmo/BureauTag';

export function BlocageModal() {
  const { darkMode } = useAppStore();
  const {
    blocageModalData,
    closeBlocageModal,
    openSubstitutionModal,
    addToast,
    addActionLog,
  } = useBMOStore();

  const { isOpen, dossier } = blocageModalData;

  if (!isOpen || !dossier) return null;

  // Déterminer le niveau de criticité
  const getCriticalityInfo = (delay: number) => {
    if (delay >= 7) return { level: 'Critique', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    if (delay >= 5) return { level: 'Urgent', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    if (delay >= 3) return { level: 'Attention', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { level: 'Normal', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
  };

  const criticality = getCriticalityInfo(dossier.delay);

  // Actions
  const handleDebloquer = () => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'validation',
      module: 'blocked',
      targetId: dossier.id,
      targetType: dossier.type,
      targetLabel: `Déblocage: ${dossier.subject}`,
      details: `Dossier débloqué manuellement après ${dossier.delay} jours`,
      bureau: dossier.bureau,
    });
    addToast(`Dossier ${dossier.id} débloqué`, 'success');
    closeBlocageModal();
  };

  const handleSubstitution = () => {
    closeBlocageModal();
    openSubstitutionModal(dossier);
  };

  const handleEscalader = () => {
    addActionLog({
      userId: 'USR-001',
      userName: 'A. DIALLO',
      userRole: 'Directeur Général',
      action: 'modification',
      module: 'blocked',
      targetId: dossier.id,
      targetType: dossier.type,
      targetLabel: `Escalade: ${dossier.subject}`,
      details: 'Dossier escaladé au niveau supérieur',
      bureau: dossier.bureau,
    });
    addToast(`Dossier ${dossier.id} escaladé`, 'info');
    closeBlocageModal();
  };

  const handleRelancer = () => {
    addToast(`Relance envoyée à ${dossier.responsible}`, 'info');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeBlocageModal}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl',
          darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        )}
      >
        {/* Header */}
        <div className={cn(
          'sticky top-0 p-4 border-b',
          darkMode ? 'border-slate-700' : 'border-gray-200',
          criticality.bg
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl animate-pulse">🚨</span>
              <div>
                <h2 className="font-bold text-lg">Dossier Bloqué</h2>
                <p className="text-xs text-slate-400">
                  Détails et actions disponibles
                </p>
              </div>
            </div>
            <button
              onClick={closeBlocageModal}
              className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 space-y-4">
          {/* Niveau de criticité */}
          <div className={cn(
            'p-3 rounded-lg border text-center',
            criticality.bg,
            criticality.border
          )}>
            <p className="text-xs text-slate-400 mb-1">Niveau de criticité</p>
            <p className={cn('text-xl font-bold', criticality.color)}>
              {criticality.level}
            </p>
            <Badge variant="urgent" className="mt-2">
              Bloqué depuis {dossier.delay} jours
            </Badge>
          </div>

          {/* Informations du dossier */}
          <div className={cn(
            'p-4 rounded-lg',
            darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
          )}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm text-orange-400">{dossier.id}</span>
                  <BureauTag bureau={dossier.bureau} />
                </div>
                <h3 className="font-bold">{dossier.subject}</h3>
              </div>
              <div className="text-right">
                <p className="font-mono font-bold text-lg text-amber-400">{dossier.amount}</p>
                <p className="text-[10px] text-slate-400">FCFA</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Type</p>
                <p className="font-medium">{dossier.type}</p>
              </div>
              <div>
                <p className="text-slate-400">Projet</p>
                <p className="font-medium">{dossier.project}</p>
              </div>
              <div>
                <p className="text-slate-400">Bloqué depuis</p>
                <p className="font-medium">{dossier.blockedSince}</p>
              </div>
              <div>
                <p className="text-slate-400">Impact</p>
                <Badge
                  variant={
                    dossier.impact === 'critical' ? 'urgent' :
                    dossier.impact === 'high' ? 'warning' : 'info'
                  }
                >
                  {dossier.impact}
                </Badge>
              </div>
            </div>
          </div>

          {/* Raison du blocage */}
          <div className={cn(
            'p-4 rounded-lg border-l-4 border-l-red-500',
            darkMode ? 'bg-red-500/10' : 'bg-red-50'
          )}>
            <p className="text-xs font-bold text-red-400 mb-1">⚠️ Raison du blocage</p>
            <p className="text-sm">{dossier.reason}</p>
          </div>

          {/* Responsable */}
          <div className={cn(
            'p-3 rounded-lg flex items-center justify-between',
            darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
          )}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white text-sm">
                {dossier.responsible.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-sm">{dossier.responsible}</p>
                <p className="text-[10px] text-slate-400">Responsable assigné</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={handleRelancer}>
              📧 Relancer
            </Button>
          </div>

          {/* Timeline suggestion */}
          <div className={cn(
            'p-3 rounded-lg border',
            darkMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'
          )}>
            <p className="text-xs font-bold text-amber-400 mb-2">💡 Actions recommandées</p>
            <ul className="text-xs space-y-1 text-slate-400">
              {dossier.delay >= 7 && (
                <li>• <span className="text-red-400 font-medium">Substitution immédiate recommandée</span></li>
              )}
              {dossier.delay >= 5 && dossier.delay < 7 && (
                <li>• <span className="text-orange-400 font-medium">Relancer le responsable en priorité</span></li>
              )}
              <li>• Vérifier si le responsable est disponible</li>
              <li>• Contacter le bureau {dossier.bureau} pour plus d&apos;informations</li>
              {dossier.impact === 'critical' && (
                <li>• <span className="text-red-400">Impact critique: action urgente requise</span></li>
              )}
            </ul>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="sticky bottom-0 p-4 border-t border-slate-700 bg-slate-800/90 backdrop-blur space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={handleEscalader}
            >
              📤 Escalader
            </Button>
            <Button 
              variant="secondary" 
              className="w-full"
              onClick={handleDebloquer}
            >
              ✅ Débloquer
            </Button>
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500"
            onClick={handleSubstitution}
          >
            🔄 Traiter par substitution
          </Button>
        </div>
      </div>
    </div>
  );
}
