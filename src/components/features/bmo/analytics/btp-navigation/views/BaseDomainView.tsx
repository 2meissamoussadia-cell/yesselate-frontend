/**
 * Vue de Base pour les Domaines BTP
 * Composant réutilisable pour afficher la structure hiérarchique des domaines
 */

'use client';

import React from 'react';
import { findDomain, findModule, findSubModule, type AnalyticsDomain } from '@/lib/config/analyticsBTPArchitecture';
import { BarChart3, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BTPDomainView } from '../components/BTPDomainView';

interface BaseDomainViewProps {
  domainId: string;
  moduleId: string | null;
  subModuleId: string | null;
  icon?: React.ComponentType<{ className?: string }>;
  customContent?: (props: {
    domain: AnalyticsDomain;
    module: ReturnType<typeof findModule> | null;
    subModule: ReturnType<typeof findSubModule> | null;
  }) => React.ReactNode;
}

export function BaseDomainView({
  domainId,
  moduleId,
  subModuleId,
  icon: Icon,
  customContent,
}: BaseDomainViewProps) {
  const domain = findDomain(domainId);
  const mod = moduleId ? findModule(domainId, moduleId) : null;
  const subModule = moduleId && subModuleId ? findSubModule(domainId, moduleId, subModuleId) : null;

  if (!domain) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Domaine introuvable</h3>
          <p className="text-slate-400 text-sm">Le domaine "{domainId}" n'existe pas.</p>
        </div>
      </div>
    );
  }

  const DomainIcon = Icon || domain.icon;

  // Si customContent est fourni, l'utiliser
  if (customContent) {
    return (
      <div className="h-full p-6">
        {customContent({ domain, module: mod, subModule })}
      </div>
    );
  }

  // Si on est au niveau domaine (pas de module sélectionné), utiliser BTPDomainView
  if (!moduleId && !subModuleId) {
    return <BTPDomainView domainId={domainId} />;
  }

  return (
    <div className="h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <DomainIcon className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-semibold text-slate-200">{domain.label}</h1>
        </div>
        {domain.description && (
          <p className="text-slate-400 text-sm">{domain.description}</p>
        )}
      </div>

      {/* Breadcrumb */}
      {(mod || subModule) && (
        <div className="flex items-center gap-2 mb-6 text-sm text-slate-400">
          <span>{domain.label}</span>
          {mod && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span>{mod.label}</span>
            </>
          )}
          {subModule && (
            <>
              <ChevronRight className="h-4 w-4" />
              <span className="text-slate-300">{subModule.label}</span>
            </>
          )}
        </div>
      )}

      {/* Content */}
      {subModule ? (
        <SubModuleContent domain={domain} module={mod} subModule={subModule} />
      ) : mod ? (
        <ModuleContent domain={domain} module={mod} />
      ) : (
        <DomainOverview domain={domain} />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Composants Internes
// ═══════════════════════════════════════════════════════════════════════════

function DomainOverview({ domain }: { domain: AnalyticsDomain }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {domain.modules.map((mod) => (
        <div
          key={mod.id}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer group"
        >
          <h3 className="text-sm font-medium text-slate-300 mb-2 group-hover:text-blue-400 transition-colors">
            {mod.label}
          </h3>
          {mod.description && (
            <p className="text-slate-400 text-xs mb-3 line-clamp-2">{mod.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {mod.subModules.length} sous-module{mod.subModules.length > 1 ? 's' : ''}
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ModuleContent({
  domain,
  module,
}: {
  domain: AnalyticsDomain;
  module: ReturnType<typeof findModule> | null;
}) {
  if (!module) return null;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-medium text-slate-300 mb-2">{module.label}</h2>
        {module.description && (
          <p className="text-slate-400 text-sm mb-4">{module.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {module.subModules.map((subMod) => (
          <div
            key={subMod.id}
            className="bg-slate-800/50 rounded-lg p-3 border border-slate-700 hover:border-blue-500/50 transition-colors cursor-pointer"
          >
            <h3 className="text-sm font-medium text-slate-300 mb-1">{subMod.label}</h3>
            {subMod.description && (
              <p className="text-slate-400 text-xs line-clamp-2">{subMod.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SubModuleContent({
  domain,
  module,
  subModule,
}: {
  domain: AnalyticsDomain;
  module: ReturnType<typeof findModule> | null;
  subModule: ReturnType<typeof findSubModule> | null;
}) {
  if (!subModule) return null;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-md font-medium text-slate-300 mb-2">{subModule.label}</h3>
        {subModule.description && (
          <p className="text-slate-400 text-sm mb-4">{subModule.description}</p>
        )}
      </div>

      {/* Contenu spécifique du sous-module */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">
              Vue pour "{subModule.label}" en cours de développement
            </p>
            {subModule.features && subModule.features.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-xs text-slate-400 mb-2">Fonctionnalités prévues :</p>
                <ul className="text-xs text-slate-400 space-y-1">
                  {subModule.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

