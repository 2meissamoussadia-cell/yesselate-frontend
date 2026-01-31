/**
 * ContentRouter pour Employés
 * Router le contenu en fonction de la catégorie et sous-catégorie active
 * Architecture cohérente avec Analytics
 */

'use client';

import React from 'react';
import { Users, Loader2 } from 'lucide-react';
import { employesCategories } from './EmployesCommandSidebar';
import {
  EmployeesHeadcountTrendChart,
  EmployeesDepartmentChart,
  EmployeesSkillsChart,
  EmployeesPerformanceChart,
  EmployeesRetentionChart,
  EmployeesContractTypesChart,
  EmployeesSeniorityChart,
} from '../analytics/EmployeesAnalyticsCharts';
import { AllEmployeesView } from './views';

interface ContentRouterProps {
  category: string;
  subCategory: string | null;
}

export const EmployesContentRouter = React.memo(function EmployesContentRouter({
  category,
  subCategory,
}: ContentRouterProps) {
  // Dashboard par défaut pour la vue overview
  if (category === 'overview') {
    return <OverviewDashboard />;
  }

  // Vue Liste de tous les employés
  if (category === 'all') {
    return <AllEmployeesView subCategory={subCategory} />;
  }

  // Autres vues (placeholder pour l'instant)
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-300 mb-2">
          {employesCategories.find((c) => c.id === category)?.label || category}
          {subCategory && subCategory !== 'all' && ` - ${subCategory}`}
        </h3>
        <p className="text-slate-400">Contenu en cours de développement</p>
      </div>
    </div>
  );
});

// ================================
// Overview Dashboard
// ================================
const OverviewDashboard = React.memo(function OverviewDashboard() {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <div className="text-sm text-slate-400 mb-1">Total Employés</div>
          <div className="text-2xl font-bold text-slate-200">124</div>
        </div>
        <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <div className="text-sm text-slate-400 mb-1">Actifs</div>
          <div className="text-2xl font-bold text-emerald-400">118</div>
        </div>
        <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <div className="text-sm text-slate-400 mb-1">Taux Présence</div>
          <div className="text-2xl font-bold text-blue-400">94%</div>
        </div>
        <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <div className="text-sm text-slate-400 mb-1">SPOF</div>
          <div className="text-2xl font-bold text-red-400">3</div>
        </div>
      </div>

      {/* Analytics & Tendances */}
      <div>
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">
          Analytics & Tendances RH
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Évolution des effectifs</h3>
            <EmployeesHeadcountTrendChart />
          </div>
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Répartition par département</h3>
            <EmployeesDepartmentChart />
          </div>
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Compétences disponibles</h3>
            <EmployeesSkillsChart />
          </div>
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Répartition des performances</h3>
            <EmployeesPerformanceChart />
          </div>
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Taux de rétention</h3>
            <EmployeesRetentionChart />
          </div>
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Types de contrats</h3>
            <EmployeesContractTypesChart />
          </div>
          <div className="p-4 rounded-lg border border-slate-700/50 bg-slate-800/30 lg:col-span-2">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Ancienneté</h3>
            <EmployeesSeniorityChart />
          </div>
        </div>
      </div>
    </div>
  );
});

