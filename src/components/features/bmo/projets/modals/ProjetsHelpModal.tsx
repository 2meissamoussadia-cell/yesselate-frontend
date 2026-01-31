/**
 * Modal d'aide pour Projets en Cours
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
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjetsHelpModalProps {
  open: boolean;
  onClose: () => void;
}

type HelpSection = 'shortcuts' | 'workflow' | 'types' | 'faq';

export function ProjetsHelpModal({ open, onClose }: ProjetsHelpModalProps) {
  const [activeSection, setActiveSection] = useState<HelpSection>('shortcuts');

  const sections = [
    { id: 'shortcuts', label: 'Raccourcis clavier', icon: Keyboard },
    { id: 'workflow', label: 'Workflow', icon: GitBranch },
    { id: 'types', label: 'Types de projets', icon: Briefcase },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ] as const;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-200">Aide - Projets en Cours</DialogTitle>
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
                      ? 'bg-indigo-500/20 text-indigo-300 font-medium'
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
          <Button onClick={onClose} className="bg-indigo-500 hover:bg-indigo-600">
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
    { key: 'F1', description: 'Afficher cette aide' },
    { key: 'Ctrl+R / ⌘R', description: 'Rafraîchir les données' },
    { key: 'Ctrl+N / ⌘N', description: 'Créer un nouveau projet' },
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
    { id: 1, title: 'Planification', description: 'Définition du projet et allocation des ressources' },
    { id: 2, title: 'Exécution', description: 'Mise en œuvre du projet et suivi des jalons' },
    { id: 3, title: 'Contrôle', description: 'Suivi de l\'avancement et du budget' },
    { id: 4, title: 'Clôture', description: 'Finalisation et documentation du projet' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Cycle de vie du projet</h3>
      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-semibold text-sm">
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
      type: 'Projet Infrastructure',
      description: 'Projets de construction ou rénovation d\'infrastructures',
      priority: 'Variable',
    },
    {
      type: 'Projet IT',
      description: 'Projets liés aux technologies de l\'information',
      priority: 'Élevée',
    },
    {
      type: 'Projet Stratégique',
      description: 'Projets stratégiques à fort impact organisationnel',
      priority: 'Critique',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Types de projets</h3>
      <div className="space-y-3">
        {types.map((type, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <h4 className="text-sm font-semibold text-indigo-300 mb-2">{type.type}</h4>
            <p className="text-sm text-slate-300 mb-3">{type.description}</p>
            <div className="text-xs">
              <span className="text-slate-400">Priorité:</span>
              <span className="ml-2 text-slate-300">{type.priority}</span>
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
      question: 'Comment suivre l\'avancement d\'un projet ?',
      answer: 'Utilisez la vue Kanban, le Gantt, ou les métriques pour suivre l\'avancement. Les KPIs en temps réel indiquent le statut.',
    },
    {
      question: 'Que faire si un projet est en retard ?',
      answer: 'Consultez les alertes, analysez les causes, et prenez des mesures correctives. Utilisez la fonction "Escalade" si nécessaire.',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Questions fréquentes</h3>
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <h4 className="text-sm font-semibold text-indigo-300 mb-2">{faq.question}</h4>
            <p className="text-sm text-slate-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

