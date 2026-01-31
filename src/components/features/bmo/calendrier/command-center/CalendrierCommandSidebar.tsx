/**
 * Sidebar de navigation principale pour Calendrier
 * Navigation hiérarchique avec accordéons (Domaine > Sous-domaine)
 * Inspiré de BTPSidebar
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { KeyboardShortcut } from '@/components/ui/keyboard-shortcut';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarDays,
  Search,
  Calendar,
  Users,
  LayoutDashboard,
  ClipboardList,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import type { CalendrierDomain, CalendrierSection } from '@/lib/types/calendrier.types';
import { getSectionsForDomain } from './CalendrierSubNavigation';

interface SidebarDomain {
  id: CalendrierDomain;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
  badgeType?: 'default' | 'warning' | 'critical';
}

const calendrierDomains: SidebarDomain[] = [
  { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
  { id: 'milestones', label: 'Jalons & Contrats', icon: ClipboardList, badge: 3, badgeType: 'warning' },
  { id: 'absences', label: 'Absences & Congés', icon: Users },
  { id: 'events', label: 'Événements & Réunions', icon: Megaphone },
];

interface CalendrierCommandSidebarProps {
  activeDomain: CalendrierDomain;
  activeSection: CalendrierSection | null;
  collapsed: boolean;
  onDomainChange: (domain: CalendrierDomain) => void;
  onSectionChange: (domain: CalendrierDomain, section: CalendrierSection) => void;
  onToggleCollapse: () => void;
  onOpenCommandPalette: () => void;
}

export const CalendrierCommandSidebar = React.memo(function CalendrierCommandSidebar({
  activeDomain,
  activeSection,
  collapsed,
  onDomainChange,
  onSectionChange,
  onToggleCollapse,
  onOpenCommandPalette,
}: CalendrierCommandSidebarProps) {
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());

  // Auto-expand le domaine actif
  React.useEffect(() => {
    if (activeDomain) {
      setExpandedDomains((prev) => new Set(prev).add(activeDomain));
    }
  }, [activeDomain]);

  const toggleDomain = (domainId: string) => {
    setExpandedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domainId)) {
        next.delete(domainId);
      } else {
        next.add(domainId);
      }
      return next;
    });
  };

  const handleDomainClick = (domain: SidebarDomain) => {
    onDomainChange(domain.id);
    if (!expandedDomains.has(domain.id)) {
      setExpandedDomains((prev) => new Set(prev).add(domain.id));
    }
  };

  const handleSectionClick = (domainId: CalendrierDomain, sectionId: string) => {
    onSectionChange(domainId, sectionId);
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-slate-700/50 bg-slate-900/80 backdrop-blur-xl transition-all duration-300',
        'fixed sm:relative z-40 h-full',
        'transform transition-transform',
        collapsed 
          ? 'w-16 -translate-x-full sm:translate-x-0' 
          : 'w-64 translate-x-0'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-slate-200 text-sm">Calendrier</span>
          </div>
        )}
        {collapsed && (
          <CalendarDays className="h-5 w-5 text-blue-400 mx-auto" />
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Trigger */}
      {!collapsed && (
        <div className="p-3">
          <Button
            variant="ghost"
            onClick={onOpenCommandPalette}
            className="w-full justify-start gap-2 h-9 px-3 text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Rechercher...</span>
            <kbd className="ml-auto text-xs bg-slate-700/50 px-1.5 py-0.5 rounded">
              <KeyboardShortcut shortcut="⌘K" />
            </kbd>
          </Button>
        </div>
      )}
      {collapsed && (
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenCommandPalette}
            className="w-full h-9 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Navigation Items avec Accordéons */}
      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-2">
          {calendrierDomains.map((domain) => {
            const DomainIcon = domain.icon;
            const isDomainActive = activeDomain === domain.id;
            const isDomainExpanded = expandedDomains.has(domain.id);
            const sections = getSectionsForDomain(domain.id);

            return (
              <div key={domain.id} className="space-y-0.5">
                {/* Domaine (Niveau 1) */}
                <button
                  onClick={() => handleDomainClick(domain)}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 text-left',
                    'group relative',
                    isDomainActive
                      ? 'bg-blue-500/10 border border-blue-500/30'
                      : 'hover:bg-slate-700/40 border border-transparent'
                  )}
                  title={collapsed ? domain.label : undefined}
                >
                  {/* Indicator */}
                  <div
                    className={cn(
                      'absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full transition-all duration-300',
                      isDomainActive ? 'bg-blue-400' : 'bg-transparent'
                    )}
                  />

                  {/* Icon */}
                  <DomainIcon
                    className={cn(
                      'h-4 w-4 flex-shrink-0 transition-all duration-200',
                      isDomainActive ? 'text-blue-400 scale-110' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />

                  {!collapsed && (
                    <>
                      <span
                        className={cn(
                          'text-sm font-medium flex-1 transition-colors duration-200',
                          isDomainActive ? 'text-blue-400' : 'text-slate-300'
                        )}
                      >
                        {domain.label}
                      </span>

                      {/* Badge */}
                      {domain.badge && (
                        <Badge
                          variant={domain.badgeType === 'critical' ? 'urgent' : domain.badgeType === 'warning' ? 'warning' : 'default'}
                          className={cn(
                            'h-5 min-w-5 px-1.5 text-xs font-medium transition-all duration-200 border',
                            domain.badgeType === 'critical'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : domain.badgeType === 'warning'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          )}
                        >
                          {domain.badge}
                        </Badge>
                      )}

                      {/* Chevron pour expand/collapse */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDomain(domain.id);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleDomain(domain.id);
                          }
                        }}
                        className="p-0.5 hover:bg-slate-700 rounded cursor-pointer"
                      >
                        {isDomainExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </div>
                    </>
                  )}

                  {/* Collapsed Badge */}
                  {collapsed && domain.badge && (
                    <div
                      className={cn(
                        'absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full text-xs flex items-center justify-center font-medium',
                        domain.badgeType === 'critical'
                          ? 'bg-red-500 text-white'
                          : domain.badgeType === 'warning'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-500 text-white'
                      )}
                    >
                      {domain.badge}
                    </div>
                  )}
                </button>

                {/* Sous-domaines (Niveau 2) - Affichés quand le domaine est expandé */}
                {!collapsed && isDomainExpanded && (
                  <div className="ml-6 space-y-0.5">
                    {sections.map((section) => {
                      const isSectionActive = activeDomain === domain.id && activeSection === section.id;

                      return (
                        <button
                          key={section.id}
                          onClick={() => handleSectionClick(domain.id, section.id)}
                          className={cn(
                            'w-full flex items-start gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-left text-sm',
                            isSectionActive
                              ? 'bg-blue-500/5 border border-blue-500/20 text-blue-300'
                              : 'hover:bg-slate-800/30 border border-transparent text-slate-400 hover:text-slate-300'
                          )}
                          title={section.hint}
                        >
                          <span className={cn(
                            'mt-1 h-1.5 w-1.5 rounded-full flex-shrink-0',
                            isSectionActive ? 'bg-blue-400' : 'bg-slate-500'
                          )} />
                          <span className="flex-1 min-w-0">
                            <span className="block font-medium">{section.label}</span>
                            {section.hint && (
                              <span className={cn(
                                'text-xs block mt-0.5',
                                isSectionActive ? 'text-blue-400/70' : 'text-slate-400'
                              )}>
                                {section.hint}
                              </span>
                            )}
                          </span>
                          {section.badge && (
                            <Badge
                              variant={section.badgeType === 'critical' ? 'urgent' : section.badgeType === 'warning' ? 'warning' : 'default'}
                              className={cn(
                                'h-4 min-w-4 px-1 text-xs border flex-shrink-0',
                                section.badgeType === 'critical'
                                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                  : section.badgeType === 'warning'
                                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                              )}
                            >
                              {section.badge}
                            </Badge>
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
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 p-3">
        {!collapsed && (
          <div className="text-xs text-slate-400 text-center">
            Calendrier v3.0
          </div>
        )}
      </div>
    </aside>
  );
});

export { calendrierDomains };
export type { SidebarDomain };

