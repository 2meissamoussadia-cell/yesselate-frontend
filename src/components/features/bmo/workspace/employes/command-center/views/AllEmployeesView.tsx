/**
 * Vue Liste de tous les employés
 * Affichage avec sélection, filtres, et ouverture du detail panel
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Check,
  ChevronDown,
  ChevronRight,
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  AlertTriangle,
  Loader2,
  Search,
} from 'lucide-react';
import { useEmployesCommandCenterStore } from '@/lib/stores/employesCommandCenterStore';
import { employesApiService, type Employe } from '@/lib/services/employesApiService';
import { logger } from '@/lib/utils/logger';

interface AllEmployeesViewProps {
  subCategory?: string | null;
}

export function AllEmployeesView({ subCategory }: AllEmployeesViewProps) {
  const { filters, selectedItems, toggleSelection, selectAll, clearSelection, openDetailPanel } = useEmployesCommandCenterStore();
  const [employees, setEmployees] = useState<Employe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadEmployees = async () => {
      setLoading(true);
      try {
        // Construire les filtres à partir du store
        const apiFilters: any = {
          search: searchQuery || filters.search,
        };
        
        if (filters.status.length > 0) {
          // Prendre le premier statut pour l'API (peut être amélioré)
          apiFilters.status = filters.status[0];
        }
        
        if (filters.bureaux.length > 0) {
          apiFilters.bureau = filters.bureaux[0];
        }
        
        if (filters.contractTypes.length > 0) {
          apiFilters.contrat = filters.contractTypes[0];
        }
        
        if (filters.spof !== null) {
          apiFilters.spof = filters.spof;
        }

        const result = await employesApiService.getAll(apiFilters, 'risk', 1, 100);
        setEmployees(result.data);
      } catch (error) {
        logger.error('Error loading employees', error as Error, { context: 'AllEmployeesView' });
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, [filters, searchQuery]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.matricule.toLowerCase().includes(query) ||
        emp.poste.toLowerCase().includes(query) ||
        emp.bureau.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);

  const handleRowClick = (employee: Employe, e: React.MouseEvent) => {
    // Si le clic est sur la checkbox, ne pas ouvrir le detail panel
    if ((e.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    openDetailPanel('employee', employee.id, { employee });
  };

  const handleCheckboxChange = (employeeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSelection(employeeId);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      actif: { label: 'Actif', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
      conges: { label: 'En congés', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      mission: { label: 'En mission', className: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
      absent: { label: 'Absent', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
      inactif: { label: 'Inactif', className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    };
    return statusMap[status] || statusMap.actif;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, matricule, poste..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700/50">
          {filteredEmployees.length} employé{filteredEmployees.length > 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Table */}
      <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-900/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700/50">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAll(filteredEmployees.map((emp) => emp.id));
                      } else {
                        clearSelection();
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Employé
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Poste
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Bureau
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Contrat
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Risque
                </th>
                <th className="w-12 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">Aucun employé trouvé</p>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const isSelected = selectedItems.includes(employee.id);
                  const statusBadge = getStatusBadge(employee.status);
                  return (
                    <tr
                      key={employee.id}
                      onClick={(e) => handleRowClick(employee, e)}
                      className={cn(
                        'cursor-pointer transition-colors',
                        isSelected
                          ? 'bg-blue-500/10 hover:bg-blue-500/15'
                          : 'hover:bg-slate-800/30'
                      )}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelection(employee.id);
                          }}
                          className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-200 truncate">{employee.name}</div>
                            <div className="text-xs text-slate-400 truncate">{employee.matricule}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-300">{employee.poste}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="bg-slate-800/50 text-slate-300 border-slate-700/50 text-xs">
                          {employee.bureau}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={cn('text-xs', statusBadge.className)}>
                          {statusBadge.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-slate-300">{employee.contrat}</div>
                      </td>
                      <td className="px-4 py-3">
                        {employee.scoreEvaluation ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-slate-200">{employee.scoreEvaluation.toFixed(1)}</span>
                            <span className="text-xs text-slate-400">/5</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={cn(
                              'w-16 h-2 rounded-full overflow-hidden bg-slate-700',
                              employee.riskScore > 70 && 'bg-red-500/20',
                              employee.riskScore > 50 && employee.riskScore <= 70 && 'bg-amber-500/20',
                              employee.riskScore <= 50 && 'bg-emerald-500/20'
                            )}
                          >
                            <div
                              className={cn(
                                'h-full transition-all',
                                employee.riskScore > 70 ? 'bg-red-500' : employee.riskScore > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                              )}
                              style={{ width: `${employee.riskScore}%` }}
                            />
                          </div>
                          <span className={cn(
                            'text-xs font-medium min-w-[2rem]',
                            employee.riskScore > 70 ? 'text-red-400' : employee.riskScore > 50 ? 'text-amber-400' : 'text-emerald-400'
                          )}>
                            {employee.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {employee.spof && (
                            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                              <Shield className="w-3 h-3 mr-1" />
                              SPOF
                            </Badge>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

