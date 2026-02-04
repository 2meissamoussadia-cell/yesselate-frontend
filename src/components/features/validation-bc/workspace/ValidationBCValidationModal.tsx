'use client';

import React, { useState, useCallback } from 'react';
import { FluentModal } from '@/components/ui/fluent-modal';
import { FluentButton } from '@/components/ui/fluent-button';
import { cn } from '@/lib/cn';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Receipt,
  FileEdit,
  Building2,
  DollarSign,
  User,
  Calendar,
  FileCheck,
  Scale,
  ChevronRight,
  ChevronLeft,
  MessageSquare,
  Paperclip,
  Clock,
  ArrowRight,
  Shield,
  Truck,
  History,
  Send,
  RotateCcw,
  ArrowUpCircle,
  Loader2,
} from 'lucide-react';
import type { ValidationDocument, DocumentType } from './ValidationBCServiceQueues';

// ================================
// Types
// ================================
type ValidationAction = 'approve' | 'reject' | 'request_info' | 'escalate' | 'delegate';

interface ValidationStep {
  level: number;
  title: string;
  approver: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'current';
  date?: string;
  comment?: string;
}

interface ThreeWayMatchDetail {
  document: string;
  reference: string;
  amount: number;
  status: 'matched' | 'mismatch' | 'missing';
  details?: string;
}

// ================================
// Mock data
// ================================
const mockSteps: ValidationStep[] = [
  { level: 1, title: 'Validation technique', approver: 'M. Konaté', role: 'Chef Service Achats', status: 'approved', date: '2024-01-15', comment: 'Conforme aux spécifications' },
  { level: 2, title: 'Validation budgétaire', approver: 'Mme Diallo', role: 'Responsable Budget', status: 'current' },
  { level: 3, title: 'Validation Direction', approver: 'M. Touré', role: 'Directeur Financier', status: 'pending' },
];

const mockThreeWay: ThreeWayMatchDetail[] = [
  { document: 'Bon de commande', reference: 'BC-2024-001245', amount: 4500000, status: 'matched' },
  { document: 'Bon de livraison', reference: 'BL-2024-001245', amount: 4500000, status: 'matched' },
  { document: 'Facture', reference: 'FAC-2024-003421', amount: 4500000, status: 'matched' },
];

// ================================
// Sub-components
// ================================
function StepIndicator({ steps, currentStep }: { steps: ValidationStep[]; currentStep: number }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, i) => (
        <React.Fragment key={step.level}>
          <div className="flex flex-col items-center">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2',
              step.status === 'approved' && 'bg-emerald-500 border-emerald-500 text-white',
              step.status === 'rejected' && 'bg-rose-500 border-rose-500 text-white',
              step.status === 'current' && 'bg-purple-500 border-purple-500 text-white',
              step.status === 'pending' && 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-400'
            )}>
              {step.status === 'approved' ? '✓' : step.status === 'rejected' ? '✕' : step.level}
            </div>
            <div className="text-xs text-center mt-2 max-w-[80px]">
              <div className="font-medium">{step.title}</div>
              <div className="text-slate-400 truncate">{step.approver}</div>
            </div>
          </div>
          
          {i < steps.length - 1 && (
            <div className={cn(
              'flex-1 h-0.5 mx-2',
              step.status === 'approved' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function ThreeWayMatchPanel({ items }: { items: ThreeWayMatchDetail[] }) {
  const allMatched = items.every(i => i.status === 'matched');
  
  return (
    <div className={cn(
      'p-4 rounded-xl border',
      allMatched 
        ? 'border-emerald-500/30 bg-emerald-500/5' 
        : 'border-amber-500/30 bg-amber-500/5'
    )}>
      <div className="flex items-center gap-2 mb-4">
        <Scale className={cn('w-5 h-5', allMatched ? 'text-emerald-600' : 'text-amber-600')} />
        <span className="font-semibold">Contrôle 3-Way Match</span>
        {allMatched ? (
          <span className="ml-auto px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
            ✓ CONFORME
          </span>
        ) : (
          <span className="ml-auto px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">
            ⚠ ÉCARTS
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {items.map((item, i) => (
          <div 
            key={i}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg',
              item.status === 'matched' && 'bg-emerald-50 dark:bg-emerald-900/20',
              item.status === 'mismatch' && 'bg-rose-50 dark:bg-rose-900/20',
              item.status === 'missing' && 'bg-slate-100 dark:bg-slate-800/50'
            )}
          >
            <div className="flex items-center gap-3">
              {item.status === 'matched' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              {item.status === 'mismatch' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
              {item.status === 'missing' && <FileText className="w-4 h-4 text-slate-400" />}
              <div>
                <div className="text-sm font-medium">{item.document}</div>
                <div className="text-xs text-slate-400">{item.reference}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm">{new Intl.NumberFormat('fr-FR').format(item.amount)} FCFA</div>
              {item.details && <div className="text-xs text-rose-600">{item.details}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// Main Component
// ================================
export function ValidationBCValidationModal({
  open,
  document,
  onClose,
  onValidate,
  onReject,
}: {
  open: boolean;
  document: ValidationDocument | null;
  onClose: () => void;
  onValidate: (comment: string) => void;
  onReject: (reason: string) => void;
}) {
  const [currentView, setCurrentView] = useState<'details' | 'workflow' | '3way' | 'history'>('details');
  const [action, setAction] = useState<ValidationAction | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!action) return;
    
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    
    if (action === 'approve') {
      onValidate(comment);
    } else if (action === 'reject') {
      onReject(comment);
    }
    
    setLoading(false);
    setComment('');
    setAction(null);
    onClose();
  }, [action, comment, onValidate, onReject, onClose]);

  if (!document) return null;

  const DocIcon = document.type === 'bc' ? FileText : document.type === 'facture' ? Receipt : FileEdit;

  return (
    <FluentModal
      open={open}
      title={
        <div className="flex items-center gap-3">
          <DocIcon className="w-5 h-5 text-purple-500" />
          <span>Validation: {document.reference}</span>
        </div>
      }
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Navigation tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {[
            { id: 'details', label: 'Détails' },
            { id: 'workflow', label: 'Workflow' },
            { id: '3way', label: '3-Way Match' },
            { id: 'history', label: 'Historique' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as typeof currentView)}
              className={cn(
                'flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors',
                currentView === tab.id
                  ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100'
                  : 'text-slate-400 hover:text-slate-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {currentView === 'details' && (
          <div className="space-y-4">
            {/* Document info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400 mb-1">Fournisseur</div>
                <div className="font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {document.supplier}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400 mb-1">Montant</div>
                <div className="font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" />
                  {new Intl.NumberFormat('fr-FR').format(document.amount)} {document.currency}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400 mb-1">Soumis par</div>
                <div className="font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  {document.submittedBy}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="text-xs text-slate-400 mb-1">Échéance</div>
                <div className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(document.dueDate).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            {/* Quick 3-way status */}
            {document.hasThreeWayMatch && (
              <div className={cn(
                'p-3 rounded-lg flex items-center gap-3',
                document.threeWayStatus === 'matched' && 'bg-emerald-50 dark:bg-emerald-900/20',
                document.threeWayStatus !== 'matched' && 'bg-amber-50 dark:bg-amber-900/20'
              )}>
                <FileCheck className={cn(
                  'w-5 h-5',
                  document.threeWayStatus === 'matched' ? 'text-emerald-600' : 'text-amber-600'
                )} />
                <div className="flex-1">
                  <div className="font-medium text-sm">
                    3-Way Match: {document.threeWayStatus === 'matched' ? 'Conforme' : 'Écarts détectés'}
                  </div>
                  <div className="text-xs text-slate-400">
                    BC ↔ BL ↔ Facture
                  </div>
                </div>
                <button 
                  onClick={() => setCurrentView('3way')}
                  className="text-xs text-purple-600 font-medium flex items-center gap-1"
                >
                  Détails <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Validation level */}
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">Niveau de validation actuel</div>
                  <div className="text-xs text-slate-400">
                    {document.currentLevel} sur {document.maxLevel}
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: document.maxLevel }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-8 h-2 rounded-full',
                        i < document.currentLevel ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-700'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentView === 'workflow' && (
          <div className="space-y-4">
            <StepIndicator steps={mockSteps} currentStep={2} />
            
            <div className="space-y-3">
              {mockSteps.map(step => (
                <div 
                  key={step.level}
                  className={cn(
                    'p-4 rounded-lg border',
                    step.status === 'current' && 'border-purple-500 bg-purple-500/5',
                    step.status === 'approved' && 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20',
                    step.status === 'pending' && 'border-slate-200 dark:border-slate-700'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{step.title}</div>
                      <div className="text-xs text-slate-400">{step.approver} • {step.role}</div>
                    </div>
                    {step.status === 'approved' && (
                      <span className="text-xs text-emerald-600 font-medium">
                        ✓ Validé le {step.date}
                      </span>
                    )}
                    {step.status === 'current' && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-700">
                        EN COURS
                      </span>
                    )}
                  </div>
                  {step.comment && (
                    <div className="mt-2 text-xs text-slate-600 italic">"{step.comment}"</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === '3way' && (
          <ThreeWayMatchPanel items={mockThreeWay} />
        )}

        {currentView === 'history' && (
          <div className="space-y-3">
            {[
              { date: '2024-01-15 14:30', action: 'Validation niveau 1', user: 'M. Konaté', comment: 'Conforme aux spécifications' },
              { date: '2024-01-15 10:00', action: '3-Way Match validé', user: 'Système', comment: 'BC/BL/Facture conformes' },
              { date: '2024-01-14 16:00', action: 'Document soumis', user: 'Mme Diallo', comment: 'Demande de validation' },
            ].map((event, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{event.action}</span>
                    <span className="text-xs text-slate-400">{event.date}</span>
                  </div>
                  <div className="text-xs text-slate-400">{event.user}</div>
                  {event.comment && (
                    <div className="text-xs text-slate-600 mt-1 italic">"{event.comment}"</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action selection */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="text-sm font-medium mb-3">Action de validation</div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => setAction('approve')}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                action === 'approve'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-1" />
              <div className="font-medium text-sm">Valider</div>
              <div className="text-xs text-slate-400">Approuver ce niveau</div>
            </button>
            <button
              onClick={() => setAction('reject')}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                action === 'reject'
                  ? 'border-rose-500 bg-rose-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              <XCircle className="w-5 h-5 text-rose-600 mb-1" />
              <div className="font-medium text-sm">Rejeter</div>
              <div className="text-xs text-slate-400">Refuser avec motif</div>
            </button>
            <button
              onClick={() => setAction('request_info')}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                action === 'request_info'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              <MessageSquare className="w-5 h-5 text-amber-600 mb-1" />
              <div className="font-medium text-sm">Complément</div>
              <div className="text-xs text-slate-400">Demander des infos</div>
            </button>
            <button
              onClick={() => setAction('escalate')}
              className={cn(
                'p-3 rounded-lg border text-left transition-all',
                action === 'escalate'
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              <ArrowUpCircle className="w-5 h-5 text-purple-600 mb-1" />
              <div className="font-medium text-sm">Escalader</div>
              <div className="text-xs text-slate-400">Niveau supérieur</div>
            </button>
          </div>

          {/* Comment */}
          {action && (
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">
                {action === 'approve' ? 'Commentaire (optionnel)' : 'Motif (obligatoire)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={action === 'reject' ? 'Indiquez le motif du rejet...' : 'Ajouter un commentaire...'}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <FluentButton variant="secondary" onClick={onClose}>
            Annuler
          </FluentButton>
          <FluentButton
            variant={action === 'approve' ? 'success' : action === 'reject' ? 'destructive' : 'primary'}
            onClick={handleSubmit}
            disabled={!action || loading || (action === 'reject' && !comment.trim())}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : action === 'approve' ? (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            ) : action === 'reject' ? (
              <XCircle className="w-4 h-4 mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {action === 'approve' ? 'Confirmer validation' :
             action === 'reject' ? 'Confirmer rejet' :
             action === 'request_info' ? 'Envoyer demande' :
             action === 'escalate' ? 'Escalader' : 'Confirmer'}
          </FluentButton>
        </div>
      </div>
    </FluentModal>
  );
}

export default ValidationBCValidationModal;

