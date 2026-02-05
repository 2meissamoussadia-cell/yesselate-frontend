/**
 * Modal d'aide pour Validation Paiements
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
  DollarSign,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface PaiementsHelpModalProps {
  open: boolean;
  onClose: () => void;
}

type HelpSection = 'shortcuts' | 'workflow' | 'types' | 'faq';

export function PaiementsHelpModal({ open, onClose }: PaiementsHelpModalProps) {
  const [activeSection, setActiveSection] = useState<HelpSection>('shortcuts');

  const sections = [
    { id: 'shortcuts', label: 'Raccourcis clavier', icon: Keyboard },
    { id: 'workflow', label: 'Workflow', icon: GitBranch },
    { id: 'types', label: 'Types de paiements', icon: DollarSign },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-200">Aide - Validation Paiements</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 mt-4">
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
                      ? 'bg-green-500/20 text-green-300 font-medium'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[calc(90vh-150px)] pr-2">
            {activeSection === 'shortcuts' && <ShortcutsSection />}
            {activeSection === 'workflow' && <WorkflowSection />}
            {activeSection === 'types' && <TypesSection />}
            {activeSection === 'faq' && <FAQSection />}
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-700/50">
          <Button onClick={onClose} className="bg-green-500 hover:bg-green-600">
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutsSection() {
  const shortcuts = [
    { key: 'Ctrl+K / ⌘K', description: 'Ouvrir la palette de commandes' },
    { key: 'Ctrl+F / ⌘F', description: 'Ouvrir le panneau de filtres' },
    { key: 'Ctrl+B / ⌘B', description: 'Afficher/masquer la sidebar' },
    { key: 'F1', description: 'Afficher cette aide' },
    { key: 'Ctrl+R / ⌘R', description: 'Rafraîchir les données' },
    { key: 'Ctrl+Enter', description: 'Valider un paiement' },
    { key: 'Ctrl+Shift+R', description: 'Rejeter un paiement' },
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

function WorkflowSection() {
  const steps = [
    { id: 1, title: 'Soumission', description: 'Le paiement est soumis par le bureau concerné' },
    { id: 2, title: 'Validation BF', description: 'Validation par le Bureau Finance (BF)' },
    { id: 3, title: 'Validation DG', description: 'Validation par la Direction Générale (DG) si montant > seuil' },
    { id: 4, title: 'Exécution', description: 'Paiement exécuté et comptabilisé' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Workflow de validation</h3>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500/20 text-green-300 flex items-center justify-center font-semibold text-sm">
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

function TypesSection() {
  const types = [
    {
      type: 'Paiement urgent',
      description: 'Paiement nécessitant traitement immédiat',
      validation: 'Validation accélérée',
      urgency: 'Critique',
    },
    {
      type: 'Paiement planifié',
      description: 'Paiement programmé pour une date future',
      validation: 'Validation normale',
      urgency: 'Normale',
    },
    {
      type: 'Paiement BF',
      description: 'Validation uniquement par Bureau Finance',
      validation: 'BF uniquement',
      urgency: 'Variable',
    },
    {
      type: 'Paiement DG',
      description: 'Validation par Direction Générale requise',
      validation: 'BF + DG',
      urgency: 'Élevée',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Types de paiements</h3>
      <div className="space-y-3">
        {types.map((docType, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <h4 className="text-sm font-semibold text-green-300 mb-2">{docType.type}</h4>
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

function FAQSection() {
  const faqs = [
    {
      question: 'Quand un paiement nécessite-t-il une validation DG ?',
      answer: 'Selon les règles de gouvernance, les paiements dépassant un certain montant (configurable) nécessitent une double validation BF puis DG.',
    },
    {
      question: 'Comment planifier un paiement ?',
      answer: 'Utilisez la section "Planifiés" pour créer un paiement avec une date d\'exécution future. Il apparaîtra dans "À venir" jusqu\'à cette date.',
    },
    {
      question: 'Que faire si un paiement est rejeté ?',
      answer: 'Un paiement rejeté peut être modifié et resoumis. Consultez les motifs de rejet dans l\'historique du paiement.',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Questions fréquentes</h3>
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <h4 className="text-sm font-semibold text-green-300 mb-2">{faq.question}</h4>
            <p className="text-sm text-slate-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

