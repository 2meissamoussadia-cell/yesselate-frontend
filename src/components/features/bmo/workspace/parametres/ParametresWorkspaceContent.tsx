'use client';
import { useState } from 'react';
import { useParametresWorkspaceStore } from '@/lib/stores/parametresWorkspaceStore';
import { Settings, Shield, Bell, Plug, Users, Database, Save, Globe, Building2, Moon, Sun, Monitor, ChevronRight, Check, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRoleManager } from '@/components/admin';
import { BtpSecurityWidget } from '@/components/bmo/security/BtpSecurityWidget';

export function ParametresWorkspaceContent() {
  const { tabs, activeTabId } = useParametresWorkspaceStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  if (!activeTab) return <div className="flex items-center justify-center h-64 text-slate-400"><Settings className="w-12 h-12 opacity-30" /></div>;

  switch (activeTab.type) {
    case 'general': return <GeneralSettings />;
    case 'security': return <SecuritySettings />;
    case 'notifications': return <NotificationsSettings />;
    case 'integrations': return <IntegrationsSettings />;
    case 'permissions': return <PermissionsSettings />;
    case 'backup': return <BackupSettings />;
    default: return <PlaceholderView icon={<Settings className="w-12 h-12" />} title="Paramètres" />;
  }
}

function GeneralSettings() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState('fr');
  const [autoRefresh, setAutoRefresh] = useState(true);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold mb-1">Paramètres Généraux</h2>
        <p className="text-sm text-slate-400">Configurez les préférences globales du système</p>
      </div>
      <div className="space-y-6">
        <SettingsSection title="Apparence" icon={<Monitor className="w-5 h-5" />}>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setTheme('light')} className={cn("p-4 rounded-xl border-2 transition-all", theme === 'light' ? "border-teal-500 bg-teal-500/10" : "border-slate-200 dark:border-slate-700 hover:border-teal-500/50")}><Sun className="w-6 h-6 mx-auto mb-2 text-amber-500" /><span className="text-sm font-medium">Clair</span></button>
            <button onClick={() => setTheme('dark')} className={cn("p-4 rounded-xl border-2 transition-all", theme === 'dark' ? "border-teal-500 bg-teal-500/10" : "border-slate-200 dark:border-slate-700 hover:border-teal-500/50")}><Moon className="w-6 h-6 mx-auto mb-2 text-indigo-500" /><span className="text-sm font-medium">Sombre</span></button>
            <button onClick={() => setTheme('system')} className={cn("p-4 rounded-xl border-2 transition-all", theme === 'system' ? "border-teal-500 bg-teal-500/10" : "border-slate-200 dark:border-slate-700 hover:border-teal-500/50")}><Monitor className="w-6 h-6 mx-auto mb-2 text-slate-400" /><span className="text-sm font-medium">Système</span></button>
          </div>
        </SettingsSection>
        <SettingsSection title="Langue" icon={<Globe className="w-5 h-5" />}>
          <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm">
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </SettingsSection>
        <SettingsSection title="Organisation" icon={<Building2 className="w-5 h-5" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"><div><p className="font-medium">Nom de l'entreprise</p><p className="text-sm text-slate-400">BTP Excellence SA</p></div><button className="text-teal-500 text-sm font-medium">Modifier</button></div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"><div><p className="font-medium">Fuseau horaire</p><p className="text-sm text-slate-400">Africa/Abidjan (GMT+0)</p></div><button className="text-teal-500 text-sm font-medium">Modifier</button></div>
          </div>
        </SettingsSection>
        <SettingsSection title="Comportement" icon={<RefreshCw className="w-5 h-5" />}>
          <ToggleItem label="Actualisation automatique" description="Rafraîchir les données toutes les 30 secondes" checked={autoRefresh} onChange={setAutoRefresh} />
        </SettingsSection>
      </div>
    </div>
  );
}

function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  return (
    <div className="space-y-8 max-w-4xl">
      <div><h2 className="text-lg font-bold mb-1">Sécurité</h2><p className="text-sm text-slate-400">Paramètres de sécurité et authentification</p></div>

      <BtpSecurityWidget criticalEventsCount={3} compliancePercent={92} />

      <SettingsSection title="Authentification" icon={<Shield className="w-5 h-5" />}>
        <div className="space-y-4">
          <ToggleItem label="Authentification à deux facteurs" description="Sécurisez votre compte avec 2FA" checked={twoFactor} onChange={setTwoFactor} />
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"><p className="font-medium mb-2">Expiration de session</p><select value={sessionTimeout} onChange={e => setSessionTimeout(+e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"><option value={15}>15 minutes</option><option value={30}>30 minutes</option><option value={60}>1 heure</option><option value={120}>2 heures</option></select></div>
        </div>
      </SettingsSection>
      <SettingsSection title="Sessions actives" icon={<Monitor className="w-5 h-5" />}>
        <div className="space-y-3">{[{ device: 'Windows PC - Chrome', location: 'Abidjan, CI', current: true }, { device: 'iPhone 14 - Safari', location: 'Abidjan, CI', current: false }].map((s, i) => <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"><div className="flex items-center gap-3"><Monitor className="w-5 h-5 text-slate-400" /><div><p className="font-medium">{s.device}</p><p className="text-xs text-slate-400">{s.location}</p></div></div>{s.current ? <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">Actuelle</span> : <button className="text-xs text-red-500 hover:underline">Déconnecter</button>}</div>)}</div>
      </SettingsSection>
    </div>
  );
}

function NotificationsSettings() {
  const [email, setEmail] = useState(true); const [push, setPush] = useState(true); const [sms, setSms] = useState(false);
  return (
    <div className="space-y-8 max-w-4xl">
      <div><h2 className="text-lg font-bold mb-1">Notifications</h2><p className="text-sm text-slate-400">Gérez vos préférences de notification</p></div>
      <SettingsSection title="Canaux" icon={<Bell className="w-5 h-5" />}>
        <div className="space-y-4"><ToggleItem label="Email" description="Recevoir des notifications par email" checked={email} onChange={setEmail} /><ToggleItem label="Notifications push" description="Notifications dans le navigateur" checked={push} onChange={setPush} /><ToggleItem label="SMS" description="Alertes critiques par SMS" checked={sms} onChange={setSms} /></div>
      </SettingsSection>
    </div>
  );
}

function IntegrationsSettings() {
  const integrations = [{ name: 'API REST', status: 'connected', icon: '🌐' }, { name: 'WebSocket', status: 'connected', icon: '📡' }, { name: 'Email SMTP', status: 'connected', icon: '📧' }, { name: 'SMS Gateway', status: 'disconnected', icon: '📱' }];
  return (
    <div className="space-y-8 max-w-4xl">
      <div><h2 className="text-lg font-bold mb-1">Intégrations</h2><p className="text-sm text-slate-400">Connexions aux services externes</p></div>
      <SettingsSection title="Services connectés" icon={<Plug className="w-5 h-5" />}>
        <div className="space-y-3">{integrations.map((int, i) => <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"><div className="flex items-center gap-3"><span className="text-2xl">{int.icon}</span><div><p className="font-medium">{int.name}</p><p className="text-xs text-slate-400">{int.status === 'connected' ? 'Connecté' : 'Déconnecté'}</p></div></div><span className={cn("w-3 h-3 rounded-full", int.status === 'connected' ? 'bg-emerald-500' : 'bg-red-500')} /></div>)}</div>
      </SettingsSection>
    </div>
  );
}

function PermissionsSettings() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div><h2 className="text-lg font-bold mb-1">Permissions</h2><p className="text-sm text-slate-400">Gestion des rôles et permissions (DG, MOA, MOE, OPC)</p></div>
      <SettingsSection title="Utilisateurs et rôles" icon={<Users className="w-5 h-5" />}>
        <UserRoleManager onRoleChange={(userId, role) => { /* à brancher sur API */ }} />
      </SettingsSection>
    </div>
  );
}

function BackupSettings() {
  const backups = [{ date: '2026-01-10 06:00', size: '2.4 GB', status: 'success' }, { date: '2026-01-09 06:00', size: '2.3 GB', status: 'success' }, { date: '2026-01-08 06:00', size: '2.3 GB', status: 'failed' }];
  return (
    <div className="space-y-8 max-w-4xl">
      <div><h2 className="text-lg font-bold mb-1">Sauvegardes</h2><p className="text-sm text-slate-400">Gestion des sauvegardes système</p></div>
      <SettingsSection title="Sauvegardes récentes" icon={<Database className="w-5 h-5" />}>
        <div className="space-y-3">{backups.map((b, i) => <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"><div className="flex items-center gap-3">{b.status === 'success' ? <Check className="w-5 h-5 text-emerald-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}<div><p className="font-medium">{b.date}</p><p className="text-xs text-slate-400">{b.size}</p></div></div><button className="text-teal-500 text-sm font-medium">Restaurer</button></div>)}</div>
        <button className="w-full mt-4 px-4 py-3 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 flex items-center justify-center gap-2"><Database className="w-4 h-4" />Créer une sauvegarde</button>
      </SettingsSection>
    </div>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (<div className="p-6 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900/50"><div className="flex items-center gap-3 mb-4"><div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">{icon}</div><h3 className="font-semibold">{title}</h3></div>{children}</div>);
}

function ToggleItem({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (<div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50"><div><p className="font-medium">{label}</p><p className="text-xs text-slate-400">{description}</p></div><button onClick={() => onChange(!checked)} className={cn("w-12 h-7 rounded-full transition-colors relative", checked ? "bg-teal-500" : "bg-slate-300 dark:bg-slate-600")}><span className={cn("absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform", checked ? "left-6" : "left-1")} /></button></div>);
}

function PlaceholderView({ icon, title }: { icon: React.ReactNode; title: string }) { return <div className="flex items-center justify-center h-64 text-slate-400"><div className="text-center"><div className="mx-auto mb-4 opacity-30">{icon}</div><p className="font-semibold">{title}</p></div></div>; }

