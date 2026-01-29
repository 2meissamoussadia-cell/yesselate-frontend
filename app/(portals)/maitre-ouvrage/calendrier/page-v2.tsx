'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  ClipboardList,
  Users,
  Megaphone,
  ChevronDown,
  ChevronRight,
  Download,
  Bell,
  Plus,
  Link2,
  GanttChart,
  Rows3,
  Clock,
  CalendarClock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalendrierStore } from '@/lib/stores/calendrierStore';
import {
  CalendrierKPIBar,
  CalendrierAlertsBanner,
  CalendrierQuickActions,
  CalendrierModals,
  CalendrierContentRouter,
} from '@/components/features/bmo/calendrier/command-center';
import { coerceNavigationState, buildNavigationParams } from '@/lib/utils/calendrier-navigation';
import type { CalendrierDomain, CalendrierSection, CalendrierView } from '@/lib/types/calendrier.types';

type Period = 'week' | 'month' | 'quarter';
type CalendarView = 'gantt' | 'calendar' | 'timeline';

type CalendarDomain = 'overview' | 'milestones' | 'absences' | 'events';

type NavItem = {
  id: string;
  label: string;
  hrefDefaults?: Partial<{ view: CalendarView; period: Period }>;
  badge?: number;
};

type NavDomain = {
  id: CalendarDomain;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  defaultOpen?: boolean;
  items: NavItem[];
};

const NAV_CAL: NavDomain[] = [
  {
    id: 'overview',
    label: "Vue d'ensemble",
    icon: CalendarIcon,
    defaultOpen: true,
    items: [
      { id: 'global', label: 'Calendrier global', hrefDefaults: { view: 'gantt', period: 'month' } },
      { id: 'bychantier', label: 'Vue par chantier', hrefDefaults: { view: 'calendar', period: 'month' } },
    ],
  },
  {
    id: 'milestones',
    label: 'Jalons & Contrats',
    icon: ClipboardList,
    badge: 3,
    items: [
      { id: 'timeline', label: 'Timeline jalons critiques', hrefDefaults: { view: 'gantt', period: 'quarter' } },
      { id: 'sla', label: 'Alertes SLA', hrefDefaults: { view: 'timeline', period: 'month' } },
      { id: 'retards', label: 'Retards détectés', hrefDefaults: { view: 'timeline', period: 'month' } },
    ],
  },
  {
    id: 'absences',
    label: 'Absences & Congés',
    icon: Users,
    items: [
      { id: 'calendar', label: 'Calendrier absences/congés', hrefDefaults: { view: 'calendar', period: 'month' } },
      { id: 'resources', label: 'Impact disponibilité ressources', hrefDefaults: { view: 'timeline', period: 'month' } },
    ],
  },
  {
    id: 'events',
    label: 'Événements & Réunions',
    icon: Megaphone,
    items: [
      { id: 'instances', label: 'Instances programmées', hrefDefaults: { view: 'calendar', period: 'month' } },
      { id: 'meetings', label: 'Réunions de chantier', hrefDefaults: { view: 'calendar', period: 'week' } },
    ],
  },
];

function getFirstSection(domain: CalendarDomain): string {
  return NAV_CAL.find((d) => d.id === domain)?.items[0]?.id ?? 'global';
}

function safeView(v: string | null): CalendarView {
  if (v === 'gantt' || v === 'calendar' || v === 'timeline') return v;
  return 'calendar';
}

function safePeriod(p: string | null): Period {
  if (p === 'week' || p === 'month' || p === 'quarter') return p;
  return 'month';
}

function safeDomain(d: string | null): CalendarDomain {
  if (d === 'overview' || d === 'milestones' || d === 'absences' || d === 'events') return d;
  return 'overview';
}

function buildUrl(pathname: string, next: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(next).forEach(([k, v]) => {
    if (v != null && v !== '') sp.set(k, v);
  });
  const qs = sp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export default function CalendarPageV2() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const { openModal, navigate, kpis } = useCalendrierStore();

  // Synchronisation URL avec le store
  useEffect(() => {
    const rawParams = {
      domain: search.get('domain'),
      section: search.get('section'),
      view: search.get('view'),
      period: search.get('period'),
    };
    const validatedState = coerceNavigationState(rawParams);
    navigate(validatedState.domain, validatedState.section, validatedState.view, validatedState.period);
  }, [search, navigate]);

  // Générer les alertes depuis les KPIs
  const alerts = useMemo(() => {
    const alertsList: Array<{
      id: string;
      type: 'sla-risk' | 'retard' | 'sur-allocation' | 'reunion-manquee';
      title: string;
      description: string;
      count?: number;
      actionLabel: string;
      actionUrl: string;
      severity: 'warning' | 'critical';
    }> = [];
    
    if (kpis?.retardsSLA && kpis.retardsSLA > 0) {
      alertsList.push({
        id: 'sla-risk',
        type: 'sla-risk',
        title: 'Jalons SLA à risque',
        description: `${kpis.retardsSLA} jalons SLA en retard ou à risque (J-7)`,
        count: kpis.retardsSLA,
        actionLabel: 'Voir dans Contrats',
        actionUrl: '/maitre-ouvrage/validation-contrats',
        severity: 'warning',
      });
      alertsList.push({
        id: 'retards',
        type: 'retard',
        title: 'Retards détectés',
        description: `${kpis.retardsSLA} tâches/jalons en retard`,
        count: kpis.retardsSLA,
        actionLabel: 'Voir dans Gestion Chantiers',
        actionUrl: '/maitre-ouvrage/projets-en-cours',
        severity: 'critical',
      });
    }
    
    if (kpis?.conflitsActifs && kpis.conflitsActifs > 0) {
      alertsList.push({
        id: 'sur-allocation',
        type: 'sur-allocation',
        title: 'Sur-allocation ressources',
        description: `${kpis.conflitsActifs} conflit(s) de sur-allocation détecté(s)`,
        count: kpis.conflitsActifs,
        actionLabel: 'Voir dans Ressources',
        actionUrl: '/maitre-ouvrage/employes',
        severity: 'warning',
      });
    }
    
    return alertsList;
  }, [kpis]);

  const domain = safeDomain(search.get('domain'));
  const section = search.get('section') ?? getFirstSection(domain);
  const view = safeView(search.get('view'));
  const period = safePeriod(search.get('period'));

  const [openDomains, setOpenDomains] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    NAV_CAL.forEach((d) => {
      initial[d.id] = Boolean(d.defaultOpen);
    });
    initial[domain] = true;
    return initial;
  });
  const openDomainsView = useMemo(
    () => ({ ...openDomains, [domain]: true }),
    [openDomains, domain]
  );

  const activeDomain = useMemo(() => NAV_CAL.find((d) => d.id === domain)!, [domain]);
  const activeItem = useMemo(() => activeDomain.items.find((i) => i.id === section) ?? activeDomain.items[0], [activeDomain, section]);

  const breadcrumb = useMemo(() => {
    return {
      root: 'Calendrier',
      domain: activeDomain.label,
      section: activeItem?.label ?? '',
    };
  }, [activeDomain.label, activeItem]);

  const pushParams = useCallback(
    (next: Partial<{ domain: CalendarDomain; section: string; view: CalendarView; period: Period }>) => {
      const url = buildUrl(pathname, {
        domain: next.domain ?? domain,
        section: next.section ?? section,
        view: next.view ?? view,
        period: next.period ?? period,
      });
      router.push(url);
    },
    [pathname, router, domain, section, view, period]
  );

  const onToggleDomain = useCallback((id: CalendarDomain) => {
    setOpenDomains((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const onSelectItem = useCallback(
    (d: NavDomain, it: NavItem) => {
      setOpenDomains((prev) => ({ ...prev, [d.id]: true }));
      pushParams({
        domain: d.id,
        section: it.id,
        view: it.hrefDefaults?.view,
        period: it.hrefDefaults?.period,
      });
    },
    [pushParams]
  );

  return (
    <div className="h-[calc(100vh-64px)] w-full overflow-hidden">
      <div className="flex h-full gap-4">
        {/* Menu latéral interne (accordéons) */}
        <aside className="h-full w-[340px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-4 py-3">
            <div className="text-sm font-semibold text-white/90">Calendrier & Planification</div>
            <div className="text-xs text-white/50">Navigation hiérarchique (3 niveaux)</div>
          </div>

          <div className="h-[calc(100%-56px)] overflow-y-auto px-2 py-2">
            {NAV_CAL.map((d) => {
              const isOpen = Boolean(openDomainsView[d.id]);
              const isActiveDomain = d.id === domain;
              const Icon = d.icon;

              return (
                <div key={d.id} className="mb-2">
                  <button
                    type="button"
                    onClick={() => onToggleDomain(d.id)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left',
                      'transition hover:bg-white/5',
                      isActiveDomain ? 'bg-white/5' : ''
                    )}
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-white/70" />
                      <div className="font-medium text-white/85">{d.label}</div>
                      {typeof d.badge === 'number' && d.badge > 0 && (
                        <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">{d.badge}</span>
                      )}
                    </div>
                    {isOpen ? <ChevronDown className="h-4 w-4 text-white/60" /> : <ChevronRight className="h-4 w-4 text-white/60" />}
                  </button>

                  {isOpen && (
                    <div className="mt-1 space-y-1 pl-2">
                      {d.items.map((it) => {
                        const isActive = isActiveDomain && it.id === section;
                        return (
                          <button
                            key={it.id}
                            type="button"
                            onClick={() => onSelectItem(d, it)}
                            className={cn(
                              'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm',
                              'transition hover:bg-white/5',
                              isActive ? 'bg-[#0B5FFF]/20 text-white' : 'text-white/75'
                            )}
                          >
                            <span>{it.label}</span>
                            {typeof it.badge === 'number' && it.badge > 0 && (
                              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/80">{it.badge}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Contenu */}
        <main className="min-w-0 max-w-full flex-1 overflow-x-hidden overflow-y-auto pb-8">
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-white/50">{breadcrumb.root} &gt; {breadcrumb.domain} &gt; {breadcrumb.section}</div>
                <div className="mt-1 text-lg font-semibold text-white/90">{breadcrumb.section}</div>
                <div className="mt-1 text-sm text-white/60">Vue {view} • Période {period}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal('creer-evenement')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Créer événement
                </button>
                <button
                  onClick={() => {
                    // Redirection vers module RH pour ajouter absence
                    window.location.href = '/maitre-ouvrage/employes?tab=absences';
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  <CalendarClock className="h-4 w-4" /> Ajouter absence
                </button>
                <button
                  onClick={() => openModal('export', { domain, section, period })}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  <Download className="h-4 w-4" /> Exporter
                </button>
              </div>
            </div>

            {/* Barres de sélection */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Segmented
                label="Vue"
                value={view}
                options={[
                  { value: 'gantt', label: 'Gantt', icon: GanttChart },
                  { value: 'calendar', label: 'Calendrier', icon: Rows3 },
                  { value: 'timeline', label: 'Timeline', icon: Clock },
                ]}
                onChange={(v) => pushParams({ view: v as CalendarView })}
              />
              <Segmented
                label="Période"
                value={period}
                options={[
                  { value: 'week', label: 'Semaine' },
                  { value: 'month', label: 'Mois' },
                  { value: 'quarter', label: 'Trimestre' },
                ]}
                onChange={(v) => pushParams({ period: v as Period })}
              />

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => {
                    // Redirection vers module Gestion de Chantiers
                    window.location.href = '/maitre-ouvrage/projets-en-cours';
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  <Link2 className="h-4 w-4" /> Lier à chantier/contrat
                </button>
                <button
                  onClick={() => openModal('alert-config')}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"
                >
                  <Bell className="h-4 w-4" /> Activer alerte
                </button>
              </div>
            </div>
          </div>

          {/* KPI Bar */}
          <div className="mb-4">
            <CalendrierKPIBar />
          </div>

          {/* Alertes */}
          <div className="mb-4">
            <CalendrierAlertsBanner
              alerts={alerts}
              onAction={(alert) => {
                window.location.href = alert.actionUrl;
              }}
            />
          </div>

          {/* Actions rapides */}
          <div className="mb-4">
            <CalendrierQuickActions
              onCreateEvent={() => openModal('creer-evenement')}
              onAddAbsence={() => {
                window.location.href = '/maitre-ouvrage/employes?tab=absences';
              }}
              onLinkToChantier={() => {
                window.location.href = '/maitre-ouvrage/projets-en-cours';
              }}
              onExport={() => openModal('export', { domain, section, period })}
              onActivateAlert={() => openModal('alert-config')}
            />
          </div>

          {/* Zone vue - Utilise le router de contenu existant */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <CalendrierContentRouter 
              domain={domain as CalendrierDomain} 
              section={section as CalendrierSection} 
              view={view as CalendrierView} 
            />
          </div>
        </main>
      </div>

      {/* Modales */}
      <CalendrierModals />
    </div>
  );
}

function Segmented(props: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string; icon?: React.ComponentType<{ className?: string }> }>;
  onChange: (v: string) => void;
}) {
  const { label, value, options, onChange } = props;
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
      <div className="px-2 text-xs text-white/50">{label}</div>
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition',
              active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
            )}
          >
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function KPI(props: { title: string; value: string; delta?: string; variant?: 'neutral' | 'warning' | 'danger' }) {
  const { title, value, delta, variant = 'neutral' } = props;
  const pill =
    variant === 'danger'
      ? 'bg-red-500/20 text-red-200'
      : variant === 'warning'
        ? 'bg-amber-500/20 text-amber-200'
        : 'bg-white/10 text-white/80';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/50">{title}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="text-2xl font-semibold text-white/90">{value}</div>
        {delta ? <span className={cn('rounded-full px-2 py-1 text-xs', pill)}>{delta}</span> : null}
      </div>
    </div>
  );
}

function AlertRow(props: { severity: 'warning' | 'danger' | 'info'; title: string; subtitle: string }) {
  const { severity, title, subtitle } = props;
  const badge =
    severity === 'danger'
      ? { cls: 'bg-red-500/20 text-red-200', label: 'Critique' }
      : severity === 'warning'
        ? { cls: 'bg-amber-500/20 text-amber-200', label: 'Élevé' }
        : { cls: 'bg-white/10 text-white/80', label: 'Info' };

  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 p-3">
      <div>
        <div className="text-sm font-medium text-white/85">{title}</div>
        <div className="text-xs text-white/50">{subtitle}</div>
      </div>
      <span className={cn('rounded-full px-3 py-1 text-xs', badge.cls)}>{badge.label}</span>
    </div>
  );
}

