"use client";

/**
 * CockpitLayout — Layout unifié pour toutes les pages du portail maître-ouvrage
 * 
 * Caractéristiques :
 * - Header fixe avec boutons d'action + KPIs compacts
 * - Sidebar collapsible au clic (icônes par défaut)
 * - Sidebar et header fixes lors du scroll
 * - Icônes de 20x20px bien visibles
 * 
 * Usage :
 * ```tsx
 * <CockpitLayout
 *   commands={[...]}
 *   kpis={[...]}
 *   navSections={[...]}
 * >
 *   {children}
 * </CockpitLayout>
 * ```
 */

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CommandItem {
  id: string;
  label: string;
  icon: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  href?: string;
}

export interface KPIItem {
  id: string;
  label: string;
  value: string | number;
  trend?: number;
  trendType?: "up" | "down" | "neutral";
  color?: "blue" | "emerald" | "amber" | "rose" | "purple" | "cyan";
}

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
}

export interface CockpitLayoutProps {
  children: ReactNode;
  /** Boutons d'action dans le header */
  commands?: CommandItem[];
  /** KPIs affichés dans le header */
  kpis?: KPIItem[];
  /** Sections de navigation dans la sidebar */
  navSections?: NavSection[];
  /** Titre de la page (optionnel, pour le breadcrumb) */
  pageTitle?: string;
  /** Masquer le header */
  hideHeader?: boolean;
  /** Masquer la sidebar */
  hideSidebar?: boolean;
  /** Sidebar ouverte par défaut */
  defaultSidebarOpen?: boolean;
}

// ---------------------------------------------------------------------------
// Composant principal
// ---------------------------------------------------------------------------

export function CockpitLayout({
  children,
  commands = [],
  kpis = [],
  navSections = [],
  hideHeader = false,
  hideSidebar = false,
  defaultSidebarOpen = false,
}: CockpitLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-50">
      {/* Header fixe */}
      {!hideHeader && (
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/70 bg-slate-950/95 backdrop-blur-sm">
          {/* Boutons d'action à gauche */}
          <div className="flex items-center gap-2">
            {commands.map((cmd) => {
              const ButtonContent = (
                <>
                  {cmd.icon}
                  <span>{cmd.label}</span>
                </>
              );

              const buttonClass = cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                cmd.primary
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20"
                  : "text-slate-300 border border-slate-700/60 hover:bg-slate-800/60"
              );

              if (cmd.href) {
                return (
                  <Link key={cmd.id} href={cmd.href} className={buttonClass}>
                    {ButtonContent}
                  </Link>
                );
              }

              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={cmd.onClick}
                  className={buttonClass}
                >
                  {ButtonContent}
                </button>
              );
            })}
          </div>

          {/* KPIs compacts à droite */}
          {kpis.length > 0 && (
            <div className="flex items-center gap-3 flex-wrap">
              {kpis.map((kpi) => (
                <div
                  key={kpi.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800/60 bg-slate-950/60"
                >
                  <span className="text-[10px] text-slate-400">{kpi.label}:</span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      kpi.color === "blue" && "text-blue-400",
                      kpi.color === "emerald" && "text-emerald-400",
                      kpi.color === "amber" && "text-amber-400",
                      kpi.color === "rose" && "text-rose-400",
                      kpi.color === "purple" && "text-purple-400",
                      kpi.color === "cyan" && "text-cyan-400",
                      !kpi.color && "text-slate-200"
                    )}
                  >
                    {kpi.value}
                  </span>
                  {kpi.trend !== undefined && (
                    <span
                      className={cn(
                        "text-[10px]",
                        kpi.trendType === "up" && "text-emerald-400",
                        kpi.trendType === "down" && "text-rose-400",
                        kpi.trendType === "neutral" && "text-slate-500",
                        !kpi.trendType && (kpi.trend > 0 ? "text-emerald-400" : "text-slate-500")
                      )}
                    >
                      {kpi.trend > 0 ? `↑+${kpi.trend}%` : kpi.trend < 0 ? `↓${kpi.trend}%` : "—"}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </header>
      )}

      {/* Layout principal : Sidebar + Contenu */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar collapsible */}
        {!hideSidebar && navSections.length > 0 && (
          <CollapsibleSidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            sections={navSections}
          />
        )}

        {/* Contenu principal scrollable */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-slate-950/60">
          {children}
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar collapsible
// ---------------------------------------------------------------------------

interface CollapsibleSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  sections: NavSection[];
}

function CollapsibleSidebar({ isOpen, onToggle, sections }: CollapsibleSidebarProps) {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className={cn(
        "relative flex flex-col py-3 text-slate-200 border-r border-slate-800/70 bg-slate-950/80",
        "transition-all duration-300 ease-in-out",
        "overflow-y-auto overflow-x-hidden shrink-0",
        "sticky top-0 h-[calc(100vh-57px)] self-start",
        isOpen ? "w-52" : "w-14"
      )}
      aria-label="Navigation"
    >
      {/* Bouton toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors shadow-lg"
        aria-label={isOpen ? "Réduire le menu" : "Étendre le menu"}
      >
        {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {/* Sections de navigation */}
      {sections.map((section, idx) => (
        <div key={section.id}>
          {idx > 0 && <div className="my-3 mx-2 border-t border-slate-800/70" />}
          
          <section className="space-y-1 px-1" aria-label={section.title}>
            <h2
              className={cn(
                "px-2 mb-2 text-[9px] font-semibold uppercase tracking-wider text-slate-500 whitespace-nowrap transition-opacity",
                isOpen ? "opacity-100" : "opacity-0"
              )}
            >
              {section.title}
            </h2>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false;
                const Icon = item.icon;

                const itemClass = cn(
                  "flex items-center gap-3 w-full px-2 py-2 rounded-lg text-xs font-medium transition-colors",
                  isActive
                    ? "bg-orange-500/20 text-orange-400"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                );

                const ItemContent = (
                  <>
                    <span className="inline-flex w-5 h-5 min-w-[20px] max-w-[20px] min-h-[20px] max-h-[20px] shrink-0 items-center justify-center overflow-hidden">
                      <Icon className="w-5 h-5 max-w-[20px] max-h-[20px]" aria-hidden />
                    </span>
                    <span
                      className={cn(
                        "whitespace-nowrap transition-opacity",
                        isOpen ? "opacity-100" : "opacity-0"
                      )}
                    >
                      {item.label}
                    </span>
                  </>
                );

                if (item.href) {
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={itemClass}
                        aria-current={isActive ? "page" : undefined}
                        title={item.label}
                      >
                        {ItemContent}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={item.onClick}
                      className={itemClass}
                      title={item.label}
                    >
                      {ItemContent}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Export des types
// ---------------------------------------------------------------------------

export type {
  CommandItem as CockpitCommand,
  KPIItem as CockpitKPI,
  NavItem as CockpitNavItem,
  NavSection as CockpitNavSection,
};

export default CockpitLayout;
