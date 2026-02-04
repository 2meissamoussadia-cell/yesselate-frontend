/**
 * Modal d'aide pour Validation BC
 * Guide utilisateur avec raccourcis, workflow, types de documents, FAQ
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Keyboard,
  GitBranch,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface ValidationBCHelpModalProps {
  open: boolean;
  onClose: () => void;
}

type HelpSection = 'shortcuts' | 'workflow' | 'types' | 'faq';

export function ValidationBCHelpModal({ open, onClose }: ValidationBCHelpModalProps) {
  const [activeSection, setActiveSection] = useState<HelpSection>('shortcuts');

  const sections = [
    { id: 'shortcuts', label: 'Raccourcis clavier', icon: Keyboard },
    { id: 'workflow', label: 'Workflow', icon: GitBranch },
    { id: 'types', label: 'Types de documents', icon: FileText },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-200">Aide - Validation BC</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 mt-4">
          {/* Sidebar */}
          <div className="w-48 space-y-1 flex-shrink-0">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id as HelpSection)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    activeSection === section.id
                      ? 'bg-blue-500/20 text-blue-300 font-medium'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[calc(90vh-150px)] pr-2">
            {activeSection === 'shortcuts' && <ShortcutsSection />}
            {activeSection === 'workflow' && <WorkflowSection />}
            {activeSection === 'types' && <TypesSection />}
            {activeSection === 'faq' && <FAQSection />}
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-700/50">
          <Button onClick={onClose} className="bg-blue-500 hover:bg-blue-600">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ================================
// Raccourcis clavier
// ================================
function ShortcutsSection() {
  const shortcuts = [
    { key: 'Ctrl+K / ⌘K', description: 'Ouvrir la palette de commandes' },
    { key: 'Ctrl+F / ⌘F', description: 'Ouvrir le panneau de filtres' },
    { key: 'Ctrl+B / ⌘B', description: 'Afficher/masquer la sidebar' },
    { key: 'Ctrl+E / ⌘E', description: 'Exporter les données' },
    { key: 'Alt+←', description: 'Retour à la page précédente' },
    { key: 'F1', description: 'Afficher cette aide' },
    { key: 'Ctrl+R / ⌘R', description: 'Rafraîchir les données' },
    { key: 'Ctrl+N / ⌘N', description: 'Créer un nouveau document' },
    { key: 'Esc', description: 'Fermer les modals/panneaux' },
    { key: 'Ctrl+Enter', description: 'Valider un document' },
    { key: 'Ctrl+Shift+R', description: 'Rejeter un document' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Raccourcis clavier</h3>
      <div className="space-y-2">
        {shortcuts.map((shortcut, idx) => (
          <div key={idx} className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <span className="text-slate-300">{shortcut.description}</span>
            <kbd className="px-2 py-1 text-xs font-semibold text-slate-200 bg-slate-700 border border-slate-600 rounded">
              {shortcut.key}
            </kbd>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// Workflow
// ================================
function WorkflowSection() {
  const steps = [
    { id: 1, title: 'Soumission', description: 'Le document est soumis pour validation par le demandeur' },
    { id: 2, title: 'Analyse préliminaire', description: 'Vérification de la complétude et conformité de base' },
    { id: 3, title: 'Validation Bureau Finance', description: 'Validation financière et budgétaire (BF)' },
    { id: 4, title: 'Validation Direction Générale', description: 'Validation finale par la Direction Générale (DG)' },
    { id: 5, title: 'Approbation', description: 'Document approuvé et traité' },
    { id: 6, title: 'Rejet / Demande de justificatifs', description: 'Si non conforme, le document est rejeté ou des justificatifs sont demandés' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Workflow de validation</h3>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-semibold text-sm">
              {step.id}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-slate-200 mb-1">{step.title}</h4>
              <p className="text-sm text-slate-400">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// Types de documents
// ================================
function TypesSection() {
  const types = [
    {
      type: 'BC (Bon de Commande)',
      description: 'Document de commande de biens ou services',
      validation: 'Double validation BF puis DG',
      urgency: 'Variable selon montant',
    },
    {
      type: 'Facture',
      description: 'Document de facturation fournisseur',
      validation: 'Validation BF uniquement (montant < seuil)',
      urgency: 'Selon échéance de paiement',
    },
    {
      type: 'Avenant',
      description: 'Modification d\'un contrat existant',
      validation: 'Double validation selon montant',
      urgency: 'Élevée si impact budgétaire',
    },
    {
      type: 'Document Urgent',
      description: 'BC ou Facture nécessitant traitement immédiat',
      validation: 'Validation accélérée avec alerte',
      urgency: 'Critique',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Types de documents</h3>
      <div className="space-y-3">
        {types.map((docType, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">{docType.type}</h4>
            <p className="text-sm text-slate-300 mb-3">{docType.description}</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Validation:</span>
                <span className="ml-2 text-slate-300">{docType.validation}</span>
              </div>
              <div>
                <span className="text-slate-400">Urgence:</span>
                <span className="ml-2 text-slate-300">{docType.urgency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ================================
// FAQ
// ================================
function FAQSection() {
  const faqs = [
    {
      question: 'Quelle est la différence entre BC et Facture ?',
      answer: 'Un BC (Bon de Commande) est émis avant la commande, tandis qu\'une Facture est émise après la livraison/prestation. Les BC nécessitent généralement une double validation, les Factures une validation unique selon le montant.',
    },
    {
      question: 'Que faire si un document est rejeté ?',
      answer: 'Un document rejeté peut être modifié et resoumis. Vous recevrez les motifs de rejet. Utilisez la fonction "Demander justificatifs" pour obtenir plus d\'informations.',
    },
    {
      question: 'Comment accélérer la validation d\'un document urgent ?',
      answer: 'Marquez le document comme "Urgent" lors de la soumission. Il apparaîtra dans la liste des urgents et déclenchera des alertes aux validateurs.',
    },
    {
      question: 'Qui peut valider les documents ?',
      answer: 'Les validations sont hiérarchiques : Bureau Finance (BF) pour les validations financières, puis Direction Générale (DG) pour les validations finales selon les montants.',
    },
    {
      question: 'Comment suivre l\'état d\'un document ?',
      answer: 'Utilisez la Timeline ou la vue Workflow pour voir toutes les étapes de validation et les commentaires associés.',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Questions fréquentes</h3>
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">{faq.question}</h4>
            <p className="text-sm text-slate-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
