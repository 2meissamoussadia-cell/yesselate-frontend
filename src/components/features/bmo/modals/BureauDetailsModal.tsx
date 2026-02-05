'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bureaux, bureauxDetails } from '@/lib/data';

export function BureauDetailsModal() {
  const { darkMode } = useAppStore();
  const { bureauDetailsModalData, closeBureauDetailsModal } = useBMOStore();

  const { isOpen, bureauCode } = bureauDetailsModalData;

  if (!isOpen || !bureauCode) return null;

  // Récupérer les données du bureau
  const bureau = bureaux.find((b) => b.code === bureauCode);
  const details = bureauxDetails[bureauCode];

  if (!bureau) return null;

  // Couleurs de statut
  const statusColors = {
    active: { bg: 'bg-emerald-500', text: 'text-emerald-400', label: 'En poste' },
    mission: { bg: 'bg-blue-500', text: 'text-blue-400', label: 'En mission' },
    absent: { bg: 'bg-red-500', text: 'text-red-400', label: 'Absent' },
    conge: { bg: 'bg-amber-500', text: 'text-amber-400', label: 'En congé' },
  };

  // Couleurs de statut plateforme
  const platformStatusColors = {
    active: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    maintenance: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' },
    inactive: { bg: 'bg-red-500/20', border: 'border-red-500/30', text: 'text-red-400' },
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeBureauDetailsModal}
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl',
          darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white'
        )}
      >
        {/* Header */}
        <div
          className="sticky top-0 p-4 border-b border-slate-700"
          style={{
            background: `linear-gradient(135deg, ${bureau.color}20 0%, transparent 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                style={{ backgroundColor: bureau.color + '30' }}
              >
                {bureau.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-lg">{bureau.name}</h2>
                  <Badge variant="info">{bureau.code}</Badge>
                </div>
                <p className="text-xs text-slate-400">{bureau.desc}</p>
              </div>
            </div>
            <button
              onClick={closeBureauDetailsModal}
              className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-600"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4 space-y-4">
          {/* Stats rapides */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            <div className={cn(
              'p-2 rounded-lg text-center',
              darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
            )}>
              <p className="text-lg font-bold" style={{ color: bureau.color }}>
                {bureau.agents}
              </p>
              <p className="text-[9px] text-slate-400">Agents</p>
            </div>
            <div className={cn(
              'p-2 rounded-lg text-center',
              darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
            )}>
              <p className="text-lg font-bold text-blue-400">{bureau.tasks}</p>
              <p className="text-[9px] text-slate-400">Tâches</p>
            </div>
            <div className={cn(
              'p-2 rounded-lg text-center',
              darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
            )}>
              <p className="text-lg font-bold text-emerald-400">{bureau.completion}%</p>
              <p className="text-[9px] text-slate-400">Complétion</p>
            </div>
            {details && (
              <>
                <div className={cn(
                  'p-2 rounded-lg text-center',
                  darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                )}>
                  <p className="text-lg font-bold text-orange-400">
                    {details.stats.projectsActive}
                  </p>
                  <p className="text-[9px] text-slate-400">Projets actifs</p>
                </div>
                <div className={cn(
                  'p-2 rounded-lg text-center',
                  darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                )}>
                  <p className="text-lg font-bold text-amber-400">
                    {details.stats.validationsMonth}
                  </p>
                  <p className="text-[9px] text-slate-400">Valid. mois</p>
                </div>
                <div className={cn(
                  'p-2 rounded-lg text-center',
                  darkMode ? 'bg-slate-700/50' : 'bg-gray-100'
                )}>
                  <p className="text-lg font-bold text-purple-400">
                    {details.stats.avgResponseTime}
                  </p>
                  <p className="text-[9px] text-slate-400">Temps rép.</p>
                </div>
              </>
            )}
          </div>

          {/* Plateformes d'accès */}
          {details && details.platforms.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  🔗 Accès aux plateformes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {details.platforms.map((platform) => {
                  const statusStyle = platformStatusColors[platform.status];
                  return (
                    <Link
                      key={platform.id}
                      href={platform.url}
                      className={cn(
                        'block p-3 rounded-lg border transition-all hover:scale-[1.01]',
                        statusStyle.bg,
                        statusStyle.border
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{platform.icon}</span>
                          <div>
                            <p className="font-semibold text-sm">{platform.name}</p>
                            <p className="text-[10px] text-slate-400">
                              {platform.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              platform.status === 'active' ? 'success' :
                              platform.status === 'maintenance' ? 'warning' : 'urgent'
                            }
                            className="text-[9px]"
                          >
                            {platform.status === 'active' ? 'Actif' :
                             platform.status === 'maintenance' ? 'Maintenance' : 'Inactif'}
                          </Badge>
                          <span className="text-slate-400">→</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Organigramme du bureau */}
          {details && details.organigramme.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  👥 Équipe du bureau
                  <Badge variant="gray">{details.organigramme.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {details.organigramme.map((member) => {
                  const status = statusColors[member.status];
                  return (
                    <div
                      key={member.id}
                      className={cn(
                        'p-3 rounded-lg flex items-center justify-between',
                        member.isHead && 'border-l-4',
                        member.isHead ? 'border-l-orange-500 bg-orange-500/5' : '',
                        darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm relative"
                          style={{ backgroundColor: bureau.color }}
                        >
                          {member.initials}
                          {member.isHead && (
                            <span className="absolute -top-1 -right-1 text-[10px]">👑</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm">{member.name}</p>
                            {member.isHead && (
                              <Badge variant="gold" className="text-[9px]">Chef</Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right text-[10px]">
                          <p className="text-slate-400">{member.email}</p>
                          <p className="text-slate-400">{member.phone}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={cn('w-2 h-2 rounded-full', status.bg)} />
                          <span className={cn('text-[10px]', status.text)}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Activités récentes */}
          {details && details.recentActivities.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  ⏱️ Activités récentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {details.recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      'p-2 rounded-lg flex items-center justify-between text-xs',
                      darkMode ? 'bg-slate-700/30' : 'bg-gray-50'
                    )}
                  >
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-[10px] text-slate-400">Par {activity.agent}</p>
                    </div>
                    <p className="text-[10px] text-slate-400">{activity.date}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Si pas de détails disponibles */}
          {!details && (
            <div className={cn(
              'p-8 rounded-lg text-center',
              darkMode ? 'bg-slate-700/30' : 'bg-gray-100'
            )}>
              <span className="text-4xl">📋</span>
              <p className="text-sm text-slate-400 mt-2">
                Détails non disponibles pour ce bureau
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Les informations détaillées seront bientôt ajoutées
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-4 border-t border-slate-700 bg-slate-800/90 backdrop-blur flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={closeBureauDetailsModal}>
            Fermer
          </Button>
          <Link href={`/maitre-ouvrage/arbitrages-vivants?tab=bureaux`} className="flex-1">
            <Button className="w-full">
              📊 Voir le tableau de bord complet
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
