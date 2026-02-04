"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useAppStore } from "@/lib/stores";
import { Badge } from "@/components/ui/badge";
import { navSections } from "@/lib/data";
import type { BadgeType } from "@/lib/types/bmo.types";
import { useNavigationStore } from "@/lib/stores";
import { routeMapping, getActivePageId, updateNavBadges } from "@/lib/services/navigation.service";
import { useMemo, useEffect } from "react";

interface BMOSidebarProps {
  user?: { name: string; role: string; initials: string };
}

export function BMOSidebar({ user }: BMOSidebarProps = {}) {
  const pathname = usePathname();
  const { darkMode, sidebarOpen, toggleSidebar } = useAppStore();
  const { pageCounts, addToHistory } = useNavigationStore();

  // Déterminer l'item actif automatiquement
  const activeId = useMemo(() => getActivePageId(pathname), [pathname]);

  // Mettre à jour l'historique de navigation
  useEffect(() => {
    if (pathname) {
      addToHistory(pathname);
    }
  }, [pathname, addToHistory]);

  // Mettre à jour automatiquement les badges basés sur les comptages réels
  const updatedNavSections = useMemo(() => {
    return updateNavBadges(navSections, pageCounts);
  }, [pageCounts]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300",
        sidebarOpen ? "w-52" : "w-14",
        darkMode
          ? "bg-slate-800 border-r border-amber-500/20"
          : "bg-white border-r border-gray-200"
      )}
    >
      {/* Logo */}
      <div className="p-2 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full overflow-hidden shadow-lg relative border border-orange-500">
            <Image
              src="/images/log_yessalate.png"
              alt="Yessalate Logo"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400 text-xs">
                YESSALATE BMO
              </h1>
              <p className="text-[9px] text-amber-500/70 uppercase">
                V1.0 Beta
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User info */}
      <div
        className={cn(
          "m-1.5 p-2 rounded-lg",
          darkMode ? "bg-orange-500/10" : "bg-orange-50"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-[10px]">
              {user?.initials ?? 'MM'}
            </div>
            <span className="absolute -top-1 -right-1 text-[8px]">👑</span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[11px] truncate">{user?.name ?? 'M. MOUSSA DIA'}</p>
              <p className="text-[9px] text-amber-500">{user?.role ?? 'Directeur Général'}</p>
            </div>
          )}
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-1.5 py-1 scrollbar-thin">
        {updatedNavSections.map((section, si) => (
          <div key={si} className="mb-1">
            {sidebarOpen && (
              <p className="text-[9px] uppercase text-amber-500/70 font-bold px-2 py-1">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const route = routeMapping[item.id] || "/maitre-ouvrage";
              const isActive = activeId === item.id;

              return (
                <Link
                  key={item.id}
                  href={route}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 transition-all text-[11px]",
                    isActive
                      ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                      : darkMode
                      ? "text-slate-400 hover:bg-slate-700/50"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <span className="text-sm">{item.icon}</span>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <Badge
                          variant={item.badgeType as BadgeType || "default"}
                          className="text-[9px] px-1 py-0"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Toggle button */}
      <div className="p-2 border-t border-amber-500/20">
        <button
          onClick={toggleSidebar}
          className={cn(
            "w-full p-2 rounded-lg text-xs transition-all flex items-center justify-center gap-2",
            darkMode
              ? "bg-slate-700/50 hover:bg-slate-700 text-slate-400"
              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
          )}
        >
          {sidebarOpen ? (
            <>
              <span>◀</span>
              <span>Réduire</span>
            </>
          ) : (
            <span>▶</span>
          )}
        </button>
      </div>
    </aside>
  );
}

export default BMOSidebar;
