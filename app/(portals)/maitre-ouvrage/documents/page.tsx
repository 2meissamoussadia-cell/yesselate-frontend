'use client';

/**
 * Documents & Contrats — Module BMO v1
 * Vue explorateur : navigation à gauche (ExplorerLayout) + panneau de contenu à droite.
 */

import { PageTemplate } from '@/components/navigation/PageTemplate';
import { ExplorerLayoutResponsive } from '@/components/bmo/layout/ExplorerLayoutResponsive';
import { DocumentsNavigationPane } from '@/components/bmo/documents/DocumentsNavigationPane';
import { DocumentsContentPane } from '@/components/bmo/documents/DocumentsContentPane';
import { ReportExport } from '@/components/reports';
import { CommandBar } from '@/components/bmo/ui/CommandBar';
import type { CommandBarItem } from '@/components/bmo/ui/CommandBar';
import { Plus, Download, Filter, RefreshCw, FileSearch } from 'lucide-react';

const documentsCommands: CommandBarItem[] = [
  { id: 'add', label: 'Ajouter un document', icon: <Plus className="h-4 w-4" />, primary: true, onClick: () => {} },
  { id: 'export', label: 'Exporter', icon: <Download className="h-4 w-4" />, primary: true, onClick: () => {} },
  { id: 'filter', label: 'Filtrer', icon: <Filter className="h-4 w-4" />, primary: false, onClick: () => {} },
  { id: 'search', label: 'Rechercher', icon: <FileSearch className="h-4 w-4" />, primary: false, onClick: () => {} },
  { id: 'refresh', label: 'Rafraîchir', icon: <RefreshCw className="h-4 w-4" />, primary: false, onClick: () => {} },
];

export default function DocumentsExplorerPage() {
  return (
    <PageTemplate
      title="Documents & Contrats"
      description="Explorateur des plans, DOE et contrats par programme et chantier."
      windowTitle="DG Cockpit – Documents & Contrats"
      commandBarSlot={<CommandBar items={documentsCommands} />}
      actionsSlot={<ReportExport onExportExcel={() => {}} onExportPdf={() => {}} />}
    >
      <ExplorerLayoutResponsive
        nav={<DocumentsNavigationPane />}
        content={<DocumentsContentPane />}
      />
    </PageTemplate>
  );
}
