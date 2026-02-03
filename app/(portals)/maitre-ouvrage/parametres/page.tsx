'use client';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useParametresWorkspaceStore } from '@/lib/stores/parametresWorkspaceStore';
import { useBMOStore } from '@/lib/stores';
import { ParametresWorkspaceTabs, ParametresWorkspaceContent, ParametresCommandPalette } from '@/components/features/bmo/workspace/parametres';
import { Settings, Search, Save, Maximize, Minimize, Shield, Bell, Plug, Users, Database, LayoutDashboard, Key, Link2, Box, Activity } from 'lucide-react';
import Link from 'next/link';

export default function ParametresPage() {
  const { openTab, commandPaletteOpen, setCommandPaletteOpen } = useParametresWorkspaceStore();
  const { addToast, addActionLog, currentUser } = useBMOStore();
  const [fullscreen, setFullscreen] = useState(false);

  const handleSave = useCallback(() => { addToast('Paramètres sauvegardés', 'success'); addActionLog({ userId: currentUser.id, userName: currentUser.name, userRole: currentUser.role, action: 'update', module: 'parametres', targetId: 'SETTINGS', targetType: 'system', targetLabel: 'Paramètres', details: 'Sauvegarde des paramètres', bureau: 'BMO' }); }, [addToast, addActionLog, currentUser]);

  useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCommandPaletteOpen(true); } if (e.key === 'Escape' && commandPaletteOpen) setCommandPaletteOpen(false); if (e.key === 's' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); handleSave(); } if (e.key === 'F11') { e.preventDefault(); setFullscreen(f => !f); } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [commandPaletteOpen, setCommandPaletteOpen, handleSave]);

  const quickNav = [
    { type: 'general' as const, icon: Settings, label: 'Général', color: 'teal' },
    { type: 'dashboard' as const, icon: LayoutDashboard, label: 'Dashboard', color: 'sky' },
    { type: 'security' as const, icon: Shield, label: 'Sécurité', color: 'red' },
    { type: 'notifications' as const, icon: Bell, label: 'Notifications', color: 'amber' },
    { type: 'integrations' as const, icon: Plug, label: 'Intégrations', color: 'blue' },
    { type: 'permissions' as const, icon: Users, label: 'Permissions', color: 'indigo' },
    { type: 'backup' as const, icon: Database, label: 'Sauvegardes', color: 'emerald' },
    { type: 'api-webhooks' as const, icon: Key, label: 'API & Webhooks', color: 'violet', href: '/maitre-ouvrage/parametres/api-webhooks' },
    { type: 'innovation-3d' as const, icon: Box, label: 'Vue 3D chantier', color: 'violet', href: '/maitre-ouvrage/innovation/vue-3d' },
    { type: 'innovation-iot' as const, icon: Activity, label: 'IoT & capteurs', color: 'emerald', href: '/maitre-ouvrage/innovation/iot' },
    { type: 'blockchain' as const, icon: Link2, label: 'Traçabilité blockchain', color: 'emerald', href: '/maitre-ouvrage/parametres/blockchain' },
  ];

  return (
    <div className={cn("h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950", fullscreen && "fixed inset-0 z-50")}>
      <header className="flex-none border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-teal-500/20"><Settings className="w-5 h-5 text-teal-400" /></div>
              <div><h1 className="text-xl font-bold text-slate-200">Paramètres</h1><p className="text-sm text-slate-400">Configuration du système</p></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCommandPaletteOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/50 bg-slate-800/50 text-sm text-slate-400 hover:border-teal-500/50 hover:bg-slate-800 transition-colors"><Search className="w-4 h-4" /><span className="hidden md:inline">Rechercher...</span><kbd className="ml-2 px-2 py-0.5 rounded bg-slate-700 text-xs font-mono text-slate-500">⌘K</kbd></button>
              <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors"><Save className="w-4 h-4" /><span className="hidden md:inline">Sauvegarder</span></button>
              <button onClick={() => setFullscreen(f => !f)} className="p-2.5 rounded-xl border border-slate-700/50 hover:bg-slate-800/50 transition-colors">{fullscreen ? <Minimize className="w-4 h-4 text-slate-400" /> : <Maximize className="w-4 h-4 text-slate-400" />}</button>
            </div>
          </div>
        </div>
        <div className="px-6 pb-2"><ParametresWorkspaceTabs /></div>
      </header>
      <main className="flex-1 overflow-x-hidden overflow-y-auto min-w-0 max-w-full">
        <div className="flex">
          <aside className="w-64 flex-none p-4 border-r border-slate-700/50 hidden lg:block">
            <nav className="space-y-1">{quickNav.map(item => { const Icon = item.icon; const colorClass = item.color === 'teal' ? 'text-teal-400' : item.color === 'sky' ? 'text-sky-400' : item.color === 'red' ? 'text-rose-400' : item.color === 'amber' ? 'text-amber-400' : item.color === 'blue' ? 'text-blue-400' : item.color === 'indigo' ? 'text-indigo-400' : item.color === 'violet' ? 'text-violet-400' : item.color === 'emerald' ? 'text-emerald-400' : 'text-emerald-400'; if ('href' in item && item.href) return <Link key={item.type} href={item.href} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-300 hover:bg-slate-800/50 transition-colors"><Icon className={cn("w-5 h-5", colorClass)} /><span className="font-medium">{item.label}</span></Link>; return <button key={item.type} onClick={() => openTab({ type: item.type, id: item.type, title: item.label, icon: '⚙️', data: {}, closable: item.type !== 'general' })} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-slate-300 hover:bg-slate-800/50 transition-colors"><Icon className={cn("w-5 h-5", colorClass)} /><span className="font-medium">{item.label}</span></button>; })}</nav>
          </aside>
          <div className="flex-1 p-6"><ParametresWorkspaceContent /></div>
        </div>
      </main>
      <ParametresCommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} onSave={handleSave} />
    </div>
  );
}
