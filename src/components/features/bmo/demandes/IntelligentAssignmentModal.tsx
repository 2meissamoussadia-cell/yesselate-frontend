'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAppStore, useBMOStore } from '@/lib/stores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, UserPlus, Zap, Check } from 'lucide-react';
import type { Demand } from '@/lib/types/bmo.types';
import type { Employee } from '@/lib/types/bmo.types';
import { BureauTag } from '@/components/features/bmo/BureauTag';

interface IntelligentAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  demand: Demand | null;
  employees: Employee[];
  bureaux: any[];
  onAssign: (employeeId: string) => void;
}

interface AssignmentRecommendation {
  employee: Employee;
  score: number;
  reasons: string[];
}

export function IntelligentAssignmentModal({
  isOpen,
  onClose,
  demand,
  employees,
  bureaux,
  onAssign,
}: IntelligentAssignmentModalProps) {
  const { darkMode } = useAppStore();
  const { addToast } = useBMOStore();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const recommendations = useMemo(() => {
    if (!demand) return [];

    // Filtrer les employés du même bureau ou du BMO
    const eligibleEmployees = employees.filter(
      emp => emp.bureau === demand.bureau || emp.bureau === 'BMO'
    );

    // Calculer un score pour chaque employé
    const scored: AssignmentRecommendation[] = eligibleEmployees.map(emp => {
      const reasons: string[] = [];
      let score = 50; // Score de base

      // Bonus si même bureau
      if (emp.bureau === demand.bureau) {
        score += 30;
        reasons.push('Même bureau que la demande');
      }

      // Bonus si BMO (peut gérer toutes les demandes)
      if (emp.bureau === 'BMO') {
        score += 20;
        reasons.push('Bureau BMO - peut traiter toutes les demandes');
      }

      // Bonus si charge faible (simulé)
      const taskCount = (emp as any).tasks || 0;
      if (taskCount < 5) {
        score += 20;
        reasons.push('Charge de travail faible');
      } else if (taskCount > 15) {
        score -= 20;
        reasons.push('Charge de travail élevée');
      }

      // Bonus si compétence match (simulé basé sur le type)
      if (demand.type === 'BC' && (emp as any).position?.includes('Achat')) {
        score += 15;
        reasons.push('Compétence alignée avec le type de demande');
      }

      return {
        employee: emp,
        score: Math.max(0, Math.min(100, score)),
        reasons,
      };
    });

    // Trier par score décroissant
    return scored.sort((a, b) => b.score - a.score);
  }, [demand, employees]);

  const bureauStats = useMemo(() => {
    if (!demand) return null;
    const bureau = bureaux.find(b => b.code === demand.bureau);
    return bureau ? {
      code: bureau.code,
      name: bureau.name,
      tasks: bureau.tasks || 0,
      completion: bureau.completion || 0,
    } : null;
  }, [demand, bureaux]);

  if (!isOpen || !demand) return null;

  const handleAssign = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;
    
    setSelectedEmployee(employeeId);
    onAssign(employeeId);
    addToast(`Demande affectée à ${employee.name} avec succès`, 'success');
    // Fermer la modale après un court délai pour voir le feedback
    setTimeout(() => {
      onClose();
      setSelectedEmployee(null);
    }, 1500);
  };

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-50 transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center p-4',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <Card className={cn(
          'w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col',
          darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
        )}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Affectation intelligente
              <Badge variant="info">{demand.id}</Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-6">
            {/* Informations demande */}
            <div className={cn('p-4 rounded-lg border-l-4 border-l-orange-500', darkMode ? 'bg-slate-700/50' : 'bg-orange-50')}>
              <p className="font-semibold text-sm mb-2">{demand.subject}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <BureauTag bureau={demand.bureau} />
                <Badge variant="info">{demand.type}</Badge>
                <Badge variant={demand.priority === 'urgent' ? 'urgent' : 'warning'}>
                  {demand.priority}
                </Badge>
              </div>
            </div>

            {/* Charge du bureau */}
            {bureauStats && (
              <div className={cn('p-4 rounded-lg', darkMode ? 'bg-slate-700/50' : 'bg-gray-50')}>
                <h4 className="font-semibold text-sm mb-3">Charge du bureau {bureauStats.code}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400">Tâches actives</span>
                    <p className="text-lg font-bold">{bureauStats.tasks}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Taux de complétion</span>
                    <p className="text-lg font-bold text-emerald-400">{bureauStats.completion}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommandations */}
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                Recommandations automatiques
              </h4>
              <div className="space-y-3">
                {recommendations.slice(0, 5).map((rec, idx) => (
                  <div
                    key={rec.employee.id}
                    className={cn(
                      'p-4 rounded-lg border-l-4 transition-all cursor-pointer',
                      idx === 0 && 'border-l-emerald-500 bg-emerald-500/10',
                      idx > 0 && idx < 3 && 'border-l-amber-500 bg-amber-500/10',
                      idx >= 3 && 'border-l-blue-500 bg-blue-500/10',
                      selectedEmployee === rec.employee.id && 'ring-2 ring-orange-500'
                    )}
                    onClick={() => handleAssign(rec.employee.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                          idx === 0 ? 'bg-emerald-500/20 text-emerald-400' :
                          idx < 3 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-blue-500/20 text-blue-400'
                        )}>
                          {rec.employee.initials}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{rec.employee.name}</span>
                            {idx === 0 && (
                              <Badge variant="success" className="text-[9px]">
                                <Zap className="w-3 h-3 mr-1" />
                                Meilleure recommandation
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                            <BureauTag bureau={rec.employee.bureau} />
                            <span>•</span>
                            <span>{(rec.employee as any).position || 'Agent'}</span>
                            <span>•</span>
                            <span>{(rec.employee as any).tasks || 0} tâches</span>
                          </div>
                          <div className="space-y-1">
                            {rec.reasons.map((reason, rIdx) => (
                              <div key={rIdx} className="flex items-center gap-1 text-xs text-slate-300">
                                <div className="w-1 h-1 rounded-full bg-orange-400" />
                                {reason}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className={cn(
                          'text-lg font-bold mb-1',
                          rec.score >= 80 ? 'text-emerald-400' :
                          rec.score >= 60 ? 'text-amber-400' : 'text-blue-400'
                        )}>
                          {rec.score}/100
                        </div>
                        {selectedEmployee === rec.employee.id && (
                          <Badge variant="success" className="text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Affecté
                          </Badge>
                        )}
                        {selectedEmployee !== rec.employee.id && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAssign(rec.employee.id);
                            }}
                          >
                            Affecter
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

