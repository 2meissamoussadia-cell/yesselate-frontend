/**
 * Phase 4 — Gamification : panel Succès / Badges
 * Affiche les achievements débloqués et à débloquer
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAchievementsStore } from '@/lib/stores/achievementsStore';

export function AchievementsPanel() {
  const unlocked = useAchievementsStore((s) => s.unlocked);
  const getAchievements = useAchievementsStore((s) => s.getAchievements);
  const achievements = useMemo(() => getAchievements(), [getAchievements, unlocked]);
  const [collapsed, setCollapsed] = useState(true);

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors"
        aria-expanded={!collapsed}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <Trophy className="h-4 w-4 text-amber-500" />
          Succès
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            ({unlockedCount}/{achievements.length})
          </span>
        </span>
        {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
      </button>
      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={cn(
                'flex items-center gap-3 rounded-lg border p-3',
                a.unlockedAt
                  ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 opacity-75'
              )}
            >
              <span className="text-2xl" aria-hidden>
                {a.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{a.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{a.description}</p>
                {a.unlockedAt && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Débloqué le {new Date(a.unlockedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
              {!a.unlockedAt && (
                <span className="text-xs text-slate-400 dark:text-slate-500">À débloquer</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
