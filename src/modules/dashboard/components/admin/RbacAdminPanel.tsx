// src/modules/dashboard/components/admin/RbacAdminPanel.tsx
// Phase P10: Panneau Admin minimal pour gérer RBAC et feature flags

'use client';

import { useState, useEffect } from 'react';
import { Settings, Users, Flag, Shield } from 'lucide-react';
import { DashboardPageLayout, DashboardSection, DashboardPanel } from '../shared';

export function RbacAdminPanel() {
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions' | 'flags'>('roles');
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [featureFlags, setFeatureFlags] = useState<any[]>([]);

  useEffect(() => {
    // Charger les données selon l'onglet actif
    if (activeTab === 'roles') {
      fetch('/api/rbac/admin/roles', {
        headers: {
          'x-tenant-id': 'default',
          'x-user-id': 'admin',
          'x-roles': 'admin',
        },
      })
        .then((res) => res.json())
        .then(setRoles)
        .catch(console.error);
    } else if (activeTab === 'permissions') {
      fetch('/api/rbac/admin/permissions', {
        headers: {
          'x-tenant-id': 'default',
          'x-user-id': 'admin',
          'x-roles': 'admin',
        },
      })
        .then((res) => res.json())
        .then(setPermissions)
        .catch(console.error);
    } else if (activeTab === 'flags') {
      fetch('/api/rbac/admin/feature-flags', {
        headers: {
          'x-tenant-id': 'default',
          'x-user-id': 'admin',
          'x-roles': 'admin',
        },
      })
        .then((res) => res.json())
        .then(setFeatureFlags)
        .catch(console.error);
    }
  }, [activeTab]);

  return (
    <DashboardPageLayout title="Administration RBAC" description="Gestion des rôles, permissions et feature flags">
      <DashboardSection>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'roles' ? 'bg-blue-600' : 'bg-slate-800'}`}
          >
            <Shield className="inline h-4 w-4 mr-2" />
            Rôles
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'permissions' ? 'bg-blue-600' : 'bg-slate-800'}`}
          >
            <Users className="inline h-4 w-4 mr-2" />
            Permissions
          </button>
          <button
            onClick={() => setActiveTab('flags')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'flags' ? 'bg-blue-600' : 'bg-slate-800'}`}
          >
            <Flag className="inline h-4 w-4 mr-2" />
            Feature Flags
          </button>
        </div>

        {activeTab === 'roles' && (
          <DashboardPanel>
            <div className="space-y-2">
              {roles.map((r) => (
                <div key={r.id} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="font-medium">{r.label}</div>
                  <div className="text-sm text-slate-400">{r.code}</div>
                </div>
              ))}
            </div>
          </DashboardPanel>
        )}

        {activeTab === 'permissions' && (
          <DashboardPanel>
            <div className="space-y-2">
              {permissions.map((p) => (
                <div key={p.id} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="font-medium">{p.label}</div>
                  <div className="text-sm text-slate-400">{p.code} ({p.resource}:{p.action})</div>
                </div>
              ))}
            </div>
          </DashboardPanel>
        )}

        {activeTab === 'flags' && (
          <DashboardPanel>
            <div className="space-y-2">
              {featureFlags.map((f) => (
                <div key={f.feature_key} className="p-3 bg-slate-800/50 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-medium">{f.feature_key}</div>
                    <div className="text-sm text-slate-400">
                      {f.enabled ? 'Activé' : 'Désactivé'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      fetch('/api/rbac/admin/feature-flags', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'x-tenant-id': 'default',
                          'x-user-id': 'admin',
                          'x-roles': 'admin',
                        },
                        body: JSON.stringify({
                          feature_key: f.feature_key,
                          enabled: !f.enabled,
                        }),
                      })
                        .then(() => {
                          setFeatureFlags((prev) =>
                            prev.map((flag) =>
                              flag.feature_key === f.feature_key ? { ...flag, enabled: !flag.enabled } : flag
                            )
                          );
                        })
                        .catch(console.error);
                    }}
                    className={`px-3 py-1 rounded ${f.enabled ? 'bg-green-600' : 'bg-slate-700'}`}
                  >
                    {f.enabled ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              ))}
            </div>
          </DashboardPanel>
        )}
      </DashboardSection>
    </DashboardPageLayout>
  );
}
